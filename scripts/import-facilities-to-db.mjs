import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, "..");
const workspaceDir = path.resolve(projectDir, "..");
const schemaPath = path.join(projectDir, "db", "schema.sql");
const dataPath = path.join(projectDir, "data", "facilities.json");
const secretPath = path.join(workspaceDir, ".secrets", "database_url.txt");

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function numberOrNull(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text.replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

function extractArea(address) {
  const text = cleanText(address).replace(/\s+/g, "");
  const tokens = [];
  const add = (token) => {
    const cleaned = cleanText(token);
    if (cleaned.length >= 2 && !tokens.includes(cleaned)) tokens.push(cleaned);
  };
  const prefecture = text.match(/^(愛知県|岐阜県|三重県|静岡県)/)?.[1] || "";
  const withoutPrefecture = text.replace(/^(愛知県|岐阜県|三重県|静岡県)/, "");
  const unitMatches = withoutPrefecture.match(/[^0-9０-９丁目番地号\-ー、,]+?(?:市|区|町|村)/g) || [];
  const municipality = unitMatches.join("");

  add(prefecture);
  unitMatches.forEach(add);
  if (unitMatches.length >= 2) add(`${unitMatches[0]}${unitMatches[1]}`);
  add(withoutPrefecture.replace(/[0-9０-９丁目番地号\-ー].*$/, "").slice(0, 12));

  return { prefecture, municipality, tokens: tokens.slice(0, 8) };
}

function buildSearchBlob(item) {
  return [
    item.name,
    item.departments,
    item.address,
    item.phone,
    item.hours,
    item.holiday,
    item.emergencyCare,
    item.nightCare,
    item.holidayCare,
    item.reviewReason,
    ...(Array.isArray(item.departmentList) ? item.departmentList : [])
  ].map((value) => cleanText(value)).filter(Boolean).join(" ");
}

async function readDatabaseUrl() {
  const envUrl = cleanText(process.env.DATABASE_URL);
  if (envUrl) return envUrl;
  try {
    return cleanText(await readFile(secretPath, "utf8"));
  } catch {
    throw new Error(`DATABASE_URL is missing. Put it in ${secretPath}`);
  }
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

async function insertRows(client, table, columns, rows, chunkSize = 300) {
  if (!rows.length) return;
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    const values = [];
    const placeholders = chunk.map((row, rowIndex) => {
      const params = columns.map((column, columnIndex) => {
        values.push(row[column]);
        return `$${rowIndex * columns.length + columnIndex + 1}`;
      });
      return `(${params.join(", ")})`;
    });
    await client.query(
      `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders.join(", ")}`,
      values
    );
  }
}

function buildRows(facilities) {
  const facilityRows = [];
  const departmentRows = [];
  const hourRows = [];
  const urlRows = [];
  const flagRows = [];
  const geoRows = [];

  facilities.forEach((item, index) => {
    const id = cleanText(item.id, `facility-${index}`);
    const departments = Array.isArray(item.departmentList) ? item.departmentList.filter(Boolean) : [];
    const address = cleanText(item.address);
    const area = extractArea(address);

    facilityRows.push({
      id,
      source_url: cleanText(item.url),
      page_type: cleanText(item.type),
      name: cleanText(item.name, "施設名未確認"),
      status: cleanText(item.status, "要確認"),
      status_class: cleanText(item.statusClass, "closed"),
      until_text: cleanText(item.until, "時間未確認"),
      departments_text: cleanText(item.departments, "診療科目未確認"),
      address,
      phone: cleanText(item.phone),
      official_url: cleanText(item.officialUrl),
      hours_text: cleanText(item.hours, "未確認"),
      holiday_text: cleanText(item.holiday, "未確認"),
      verified_text: cleanText(item.verified, "確認日未確認"),
      quality: cleanText(item.quality),
      review_reason: cleanText(item.reviewReason),
      quality_score: numberOrNull(item.qualityScore) || 0,
      distance_label: cleanText(item.distance, "距離未設定"),
      distance_meters: numberOrNull(item.distanceMeters),
      raw: item,
      search_blob: buildSearchBlob(item)
    });

    departments.forEach((department, position) => {
      departmentRows.push({ facility_id: id, department: cleanText(department), position });
    });

    hourRows.push({
      facility_id: id,
      hours_text: cleanText(item.hours, "未確認"),
      holiday_text: cleanText(item.holiday, "未確認"),
      time_image_only: cleanText(item.timeImageOnly)
    });
    urlRows.push({
      facility_id: id,
      iryou_map_url: cleanText(item.url),
      official_url: cleanText(item.officialUrl)
    });
    flagRows.push({
      facility_id: id,
      emergency_care: cleanText(item.emergencyCare),
      night_care: cleanText(item.nightCare),
      holiday_care: cleanText(item.holidayCare)
    });
    geoRows.push({
      facility_id: id,
      address,
      prefecture: area.prefecture,
      municipality: area.municipality,
      area_tokens: area.tokens,
      lat: numberOrNull(item.lat ?? item.latitude),
      lng: numberOrNull(item.lng ?? item.lon ?? item.longitude)
    });
  });

  return { facilityRows, departmentRows, hourRows, urlRows, flagRows, geoRows };
}

async function main() {
  const databaseUrl = await readDatabaseUrl();
  const pool = createPool(databaseUrl);
  const client = await pool.connect();

  try {
    const payload = JSON.parse(await readFile(dataPath, "utf8"));
    const facilities = Array.isArray(payload.facilities) ? payload.facilities : [];
    if (!facilities.length) throw new Error("facilities.json has no facilities");

    console.log(`Importing ${facilities.length} facilities into iryou_map schema...`);
    await runSchema(client);

    const importRun = await client.query(
      "INSERT INTO iryou_map.import_runs (source_file, source_count, note) VALUES ($1, $2, $3) RETURNING id",
      [payload.meta?.source || "data/facilities.json", facilities.length, "demo import"]
    );
    const importRunId = importRun.rows[0].id;
    const rows = buildRows(facilities);

    await client.query("BEGIN");
    await client.query(`
      TRUNCATE
        iryou_map.facility_departments,
        iryou_map.facility_hours,
        iryou_map.facility_urls,
        iryou_map.facility_flags,
        iryou_map.facility_geo,
        iryou_map.facilities
      RESTART IDENTITY CASCADE
    `);

    await insertRows(client, "iryou_map.facilities", [
      "id",
      "source_url",
      "page_type",
      "name",
      "status",
      "status_class",
      "until_text",
      "departments_text",
      "address",
      "phone",
      "official_url",
      "hours_text",
      "holiday_text",
      "verified_text",
      "quality",
      "review_reason",
      "quality_score",
      "distance_label",
      "distance_meters",
      "raw",
      "search_blob"
    ], rows.facilityRows, 200);
    await insertRows(client, "iryou_map.facility_departments", ["facility_id", "department", "position"], rows.departmentRows, 800);
    await insertRows(client, "iryou_map.facility_hours", ["facility_id", "hours_text", "holiday_text", "time_image_only"], rows.hourRows, 800);
    await insertRows(client, "iryou_map.facility_urls", ["facility_id", "iryou_map_url", "official_url"], rows.urlRows, 800);
    await insertRows(client, "iryou_map.facility_flags", ["facility_id", "emergency_care", "night_care", "holiday_care"], rows.flagRows, 800);
    await insertRows(client, "iryou_map.facility_geo", ["facility_id", "address", "prefecture", "municipality", "area_tokens", "lat", "lng"], rows.geoRows, 800);

    await client.query("COMMIT");
    await client.query(
      "UPDATE iryou_map.import_runs SET imported_count = $1, finished_at = now() WHERE id = $2",
      [facilities.length, importRunId]
    );

    console.log(`Imported ${facilities.length} facilities.`);
    console.log(`Departments: ${rows.departmentRows.length}`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
