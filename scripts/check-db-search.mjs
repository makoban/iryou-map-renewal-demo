import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, "..");
const workspaceDir = path.resolve(projectDir, "..");
const secretPath = path.join(workspaceDir, ".secrets", "database_url.txt");

async function readDatabaseUrl() {
  const envUrl = String(process.env.DATABASE_URL || "").trim();
  if (envUrl) return envUrl;
  return String(await readFile(secretPath, "utf8")).trim();
}

function createPool(databaseUrl) {
  return new Pool({
    connectionString: databaseUrl,
    ssl: /render\.com|amazonaws\.com|postgres/i.test(databaseUrl) ? { rejectUnauthorized: false } : undefined,
    max: 2
  });
}

async function main() {
  const pool = createPool(await readDatabaseUrl());
  try {
    const summary = await pool.query(`
      SELECT
        count(*)::int AS facilities,
        count(*) FILTER (WHERE address <> '')::int AS with_address,
        count(*) FILTER (WHERE hours_text <> '未確認')::int AS with_hours
      FROM iryou_map.facilities
    `);
    const search = await pool.query(`
      SELECT name, departments_text, address, quality_score
      FROM iryou_map.facilities
      WHERE search_blob ILIKE '%' || $1 || '%'
         OR departments_text ILIKE '%整形外科%'
      ORDER BY
        CASE WHEN departments_text ILIKE '%整形外科%' THEN 30 ELSE 0 END +
        CASE WHEN search_blob ILIKE '%' || $1 || '%' THEN 20 ELSE 0 END +
        quality_score DESC
      LIMIT 5
    `, ["足 怪我"]);

    console.log(JSON.stringify({
      summary: summary.rows[0],
      sample: search.rows
    }, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
