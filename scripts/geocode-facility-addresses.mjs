import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalize } from "@geolonia/normalize-japanese-addresses";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, "..");
const workspaceDir = path.resolve(projectDir, "..");
const schemaPath = path.join(projectDir, "db", "schema.sql");
const secretPath = path.join(workspaceDir, ".secrets", "database_url.txt");
const sourceName = "@geolonia/normalize-japanese-addresses";

function cleanText(value, fallback = "") {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text || fallback;
}

function parseArgs(argv) {
  const options = {
    apply: false,
    force: false,
    limit: 0,
    minPointLevel: 3
  };

  argv.forEach((arg) => {
    if (arg === "--apply") options.apply = true;
    if (arg === "--force") options.force = true;
    if (arg.startsWith("--limit=")) options.limit = Math.max(0, Number(arg.replace("--limit=", "")) || 0);
    if (arg.startsWith("--min-point-level=")) {
      options.minPointLevel = Math.max(1, Number(arg.replace("--min-point-level=", "")) || 3);
    }
  });

  return options;
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function readDatabaseUrl() {
  const envUrl = cleanText(process.env.DATABASE_URL);
  if (envUrl) return envUrl;
  return cleanText(await readFile(secretPath, "utf8"));
}

function createPool(databaseUrl) {
  const needsSsl = /render\.com|amazonaws\.com|postgres/i.test(databaseUrl);
  return new Pool({
    connectionString: databaseUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 4
  });
}

function splitSql(sql) {
  return sql
    .split(/;\s*(?:\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function runSchema(client) {
  const schemaSql = await readFile(schemaPath, "utf8");
  for (const statement of splitSql(schemaSql)) {
    try {
      await client.query(statement);
    } catch (error) {
      if (/CREATE EXTENSION/i.test(statement)) {
        console.warn(`pg_trgm extension skipped: ${error.message}`);
        continue;
      }
      throw error;
    }
  }
}

function buildNormalizedAddress(result) {
  return [result.pref, result.city, result.town, result.addr]
    .map((part) => cleanText(part))
    .filter(Boolean)
    .join("");
}

function getGeocodeOutcome(address, result, minPointLevel) {
  const lat = numberOrNull(result?.point?.lat);
  const lng = numberOrNull(result?.point?.lng);
  const pointLevel = numberOrNull(result?.point?.level);
  const normalizeLevel = numberOrNull(result?.level) || 0;
  const normalizedAddress = buildNormalizedAddress(result || {});
  const leftover = cleanText(result?.other);

  if (lat === null || lng === null) {
    return {
      status: "failed",
      lat: null,
      lng: null,
      level: normalizeLevel,
      normalizedAddress,
      note: "座標が取得できませんでした"
    };
  }

  if ((pointLevel || 0) < minPointLevel) {
    return {
      status: "low_accuracy",
      lat: null,
      lng: null,
      level: pointLevel || normalizeLevel,
      normalizedAddress,
      note: `位置精度レベル${pointLevel || 0}のため未採用`
    };
  }

  return {
    status: pointLevel >= 8 ? "ok" : "ok_area",
    lat,
    lng,
    level: pointLevel || normalizeLevel,
    normalizedAddress,
    note: leftover ? `未使用文字: ${leftover.slice(0, 80)}` : ""
  };
}

async function updateOutcomes(client, rows) {
  if (!rows.length) return;
  const values = [];
  const placeholders = rows.map((row, rowIndex) => {
    const offset = rowIndex * 8;
    values.push(
      row.facilityId,
      row.outcome.lat,
      row.outcome.lng,
      row.outcome.normalizedAddress,
      sourceName,
      row.outcome.level,
      row.outcome.status,
      row.outcome.note
    );
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`;
  });

  await client.query(`
    UPDATE iryou_map.facility_geo AS fg
    SET
      lat = data.lat::double precision,
      lng = data.lng::double precision,
      geocoded_at = now(),
      normalized_address = data.normalized_address,
      geocode_source = data.geocode_source,
      geocode_level = data.geocode_level::integer,
      geocode_status = data.geocode_status,
      geocode_note = data.geocode_note
    FROM (VALUES ${placeholders.join(", ")}) AS data(
      facility_id,
      lat,
      lng,
      normalized_address,
      geocode_source,
      geocode_level,
      geocode_status,
      geocode_note
    )
    WHERE fg.facility_id = data.facility_id
  `, values);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const pool = createPool(await readDatabaseUrl());
  const client = await pool.connect();

  const summary = {
    mode: options.apply ? "apply" : "dry-run",
    minPointLevel: options.minPointLevel,
    candidates: 0,
    processed: 0,
    writable: 0,
    ok: 0,
    okArea: 0,
    lowAccuracy: 0,
    failed: 0,
    samples: []
  };

  try {
    await runSchema(client);
    const limitClause = options.limit ? "LIMIT $1" : "";
    const values = options.limit ? [options.limit] : [];
    const whereCoordinates = options.force ? "" : "AND (lat IS NULL OR lng IS NULL)";
    const rows = await client.query(`
      SELECT facility_id, address
      FROM iryou_map.facility_geo
      WHERE nullif(trim(coalesce(address, '')), '') IS NOT NULL
      ${whereCoordinates}
      ORDER BY facility_id
      ${limitClause}
    `, values);

    summary.candidates = rows.rowCount;
    const updateBuffer = [];

    for (const row of rows.rows) {
      const address = cleanText(row.address);
      summary.processed += 1;

      try {
        const result = await normalize(address);
        const outcome = getGeocodeOutcome(address, result, options.minPointLevel);
        if (outcome.status === "ok") summary.ok += 1;
        if (outcome.status === "ok_area") summary.okArea += 1;
        if (outcome.status === "low_accuracy") summary.lowAccuracy += 1;
        if (outcome.status === "failed") summary.failed += 1;
        if (outcome.lat !== null && outcome.lng !== null) summary.writable += 1;

        if (summary.samples.length < 8) {
          summary.samples.push({
            facilityId: row.facility_id,
            address,
            status: outcome.status,
            lat: outcome.lat,
            lng: outcome.lng,
            level: outcome.level,
            normalizedAddress: outcome.normalizedAddress,
            note: outcome.note
          });
        }

        if (options.apply) {
          updateBuffer.push({ facilityId: row.facility_id, outcome });
          if (updateBuffer.length >= 300) {
            await updateOutcomes(client, updateBuffer.splice(0, updateBuffer.length));
          }
        }
      } catch (error) {
        summary.failed += 1;
        if (summary.samples.length < 8) {
          summary.samples.push({
            facilityId: row.facility_id,
            address,
            status: "failed",
            error: error.message
          });
        }
      }

      if (summary.processed % 1000 === 0) {
        console.error(`geocode ${summary.processed}/${summary.candidates}`);
      }
    }

    if (options.apply) await updateOutcomes(client, updateBuffer);
  } finally {
    client.release();
    await pool.end();
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
