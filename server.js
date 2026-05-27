import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = __dirname;
const port = Number(process.env.PORT || 4173);
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const maxBodyBytes = 16 * 1024;
let dbPool;

const allowedDepartments = [
  "内科",
  "小児科",
  "循環器内科",
  "消化器内科",
  "歯科",
  "口腔外科",
  "皮膚科",
  "小児皮膚科",
  "耳鼻咽喉科",
  "眼科",
  "整形外科",
  "泌尿器科",
  "産婦人科",
  "心療内科",
  "精神科",
  "救急相談",
  "救急外来"
];

const serverDepartmentRules = [
  { departments: ["小児科", "内科"], keywords: ["子ども", "子供", "こども", "幼児", "赤ちゃん", "発熱", "熱", "咳", "せき"] },
  { departments: ["内科", "呼吸器内科", "耳鼻咽喉科"], keywords: ["発熱", "熱", "咳", "せき", "喉", "のど", "鼻水", "だるい", "風邪"] },
  { departments: ["歯科", "口腔外科"], keywords: ["歯", "歯ぐき", "歯茎", "虫歯", "口内炎", "親知らず"] },
  { departments: ["眼科"], keywords: ["目", "眼", "かゆい", "充血", "見えにくい", "涙"] },
  { departments: ["耳鼻咽喉科"], keywords: ["耳", "鼻", "喉", "のど", "めまい", "聞こえ", "花粉"] },
  { departments: ["皮膚科"], keywords: ["湿疹", "かゆみ", "かぶれ", "発疹", "じんましん", "やけど", "皮膚"] },
  { departments: ["整形外科"], keywords: ["足", "脚", "足首", "腕", "手", "肘", "腰", "膝", "肩", "骨", "骨折", "関節", "ねんざ", "捻挫", "打撲", "けが", "怪我", "痛めた", "転んだ", "ぶつけた", "スポーツ"] },
  { departments: ["内科", "消化器内科"], keywords: ["腹痛", "お腹", "胃", "吐き気", "下痢", "便秘", "食欲"] },
  { departments: ["泌尿器科", "内科"], keywords: ["尿", "膀胱", "排尿", "血尿", "頻尿"] },
  { departments: ["産婦人科"], keywords: ["妊娠", "生理", "不正出血", "おりもの", "婦人科"] },
  { departments: ["心療内科", "精神科"], keywords: ["不眠", "眠れない", "不安", "気分", "落ち込み", "ストレス"] }
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow"
  });
  res.end(JSON.stringify(payload));
}

function getDatabaseUrl() {
  return String(process.env.DATABASE_URL || "").trim();
}

function getDbPool() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;
  if (!dbPool) {
    dbPool = new Pool({
      connectionString: databaseUrl,
      ssl: /render\.com|amazonaws\.com|postgres/i.test(databaseUrl) ? { rejectUnauthorized: false } : undefined,
      max: 5,
      idleTimeoutMillis: 30000
    });
  }
  return dbPool;
}

function toClientFacility(row, areaTokens = []) {
  const matchedArea = areaTokens.find((token) => String(row.address || "").includes(token)) || "";
  const distance = matchedArea ? `${matchedArea}周辺` : row.distance_label || "距離未設定";
  return {
    id: row.id,
    name: row.name || "施設名未確認",
    status: row.status || "要確認",
    statusClass: row.status_class || "closed",
    until: row.until_text || "時間未確認",
    departments: row.departments_text || "診療科目未確認",
    departmentList: Array.isArray(row.department_list) ? row.department_list.filter(Boolean) : [],
    address: row.address || "未確認",
    station: "最寄り未確認",
    distance,
    distanceMeters: Number.isFinite(row.distance_meters) ? row.distance_meters : null,
    hours: row.hours_text || "未確認",
    holiday: row.holiday_text || "未確認",
    verified: row.verified_text || "確認日未確認",
    phone: row.phone || "",
    officialUrl: row.official_url || "",
    url: row.source_url || "",
    pageType: row.page_type || "",
    holidayCare: row.holiday_care || "不明",
    nightCare: row.night_care || "不明",
    emergencyCare: row.emergency_care || "不明",
    timeImageOnly: row.time_image_only || "不明",
    quality: row.quality || "未確認",
    reviewReason: row.review_reason || "なし",
    qualityScore: Number(row.quality_score || 0),
    lat: row.lat === null ? null : Number(row.lat),
    lng: row.lng === null ? null : Number(row.lng),
    proximitySource: matchedArea ? "address" : "db",
    matchedArea,
    match: Number(row.match_score || 0),
    rank: Number(row.rank_score || 0),
    keywords: []
  };
}

function inferSearchGuide(message, guide = {}) {
  const text = String(message || "");
  const departments = [];
  const keywords = [];

  if (Array.isArray(guide.departments)) departments.push(...guide.departments);
  if (Array.isArray(guide.keywords)) keywords.push(...guide.keywords);

  serverDepartmentRules.forEach((rule) => {
    const matched = rule.keywords.filter((keyword) => text.includes(keyword));
    if (matched.length) {
      departments.push(...rule.departments);
      keywords.push(...matched);
    }
  });

  return {
    departments: normalizeList(departments, 8).filter((department) => allowedDepartments.includes(department)),
    keywords: normalizeList(keywords, 12)
  };
}

function normalizeAreaTokens(location = {}) {
  const directTokens = Array.isArray(location.areaTokens) ? location.areaTokens : [];
  const address = String(location.address || "").replace(/\s+/g, "");
  const tokens = [...directTokens];
  const add = (token) => {
    const cleaned = String(token || "").trim();
    if (cleaned.length >= 2 && !tokens.includes(cleaned)) tokens.push(cleaned);
  };

  add(address.match(/^(愛知県|岐阜県|三重県|静岡県)/)?.[1] || "");
  const withoutPrefecture = address.replace(/^(愛知県|岐阜県|三重県|静岡県)/, "");
  const unitMatches = withoutPrefecture.match(/[^0-9０-９丁目番地号\-ー、,]+?(?:市|区|町|村)/g) || [];
  unitMatches.forEach(add);
  if (unitMatches.length >= 2) add(`${unitMatches[0]}${unitMatches[1]}`);
  add(withoutPrefecture.replace(/[0-9０-９丁目番地号\-ー].*$/, "").slice(0, 12));

  return normalizeList(tokens, 8);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > maxBodyBytes) {
        reject(new Error("request_body_too_large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

function extractJson(text) {
  const cleaned = String(text || "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("gemini_json_missing");
    return JSON.parse(match[0]);
  }
}

function normalizeList(items, limit) {
  if (!Array.isArray(items)) return [];
  return [...new Set(items.map((item) => String(item).trim()).filter(Boolean))].slice(0, limit);
}

function normalizeGuide(rawGuide) {
  const departments = normalizeList(rawGuide?.departments, 4).filter((department) => (
    allowedDepartments.includes(department)
  ));
  const keywords = normalizeList(rawGuide?.keywords, 8);
  const summary = typeof rawGuide?.summary === "string"
    ? rawGuide.summary.replace(/\s+/g, " ").trim().slice(0, 90)
    : "";

  return {
    source: "gemini",
    urgency: rawGuide?.urgency === "emergency" ? "emergency" : "normal",
    departments: departments.length ? departments : ["内科"],
    keywords,
    summary: summary || "会話の内容から受診先の候補を整理しました。",
    locationIntent: Boolean(rawGuide?.locationIntent)
  };
}

async function requestGeminiGuide(message) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      payload: {
        ok: false,
        code: "gemini_api_key_missing",
        fallback: true,
        message: "Renderの環境変数 GEMINI_API_KEY が未設定です。"
      }
    };
  }

  const prompt = [
    "あなたは医療機関検索サイトの受診先整理AIです。",
    "診断名、治療法、薬の助言はしません。利用者の言葉から検索に使う診療科、キーワード、緊急度だけを整理してください。",
    "緊急性がありそうな表現では urgency を emergency にし、summary で救急相談または119確認を短く促してください。",
    `選べる診療科: ${allowedDepartments.join("、")}`,
    "必ずJSONだけを返してください。",
    '形式: {"urgency":"normal","departments":["内科"],"keywords":["発熱"],"summary":"近くの内科を候補にしました。","locationIntent":true}',
    "",
    `利用者の発話: ${message}`
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      }),
      signal: AbortSignal.timeout(10000)
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      statusCode: 502,
      payload: {
        ok: false,
        code: "gemini_request_failed",
        message: data?.error?.message || "Gemini APIの呼び出しに失敗しました。"
      }
    };
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
  const guide = normalizeGuide(extractJson(text));

  return {
    statusCode: 200,
    payload: { ok: true, guide }
  };
}

async function handleGeminiGuide(req, res) {
  try {
    const body = await readJsonBody(req);
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      sendJson(res, 400, { ok: false, code: "message_required" });
      return;
    }

    const result = await requestGeminiGuide(message.slice(0, 600));
    sendJson(res, result.statusCode, result.payload);
  } catch (error) {
    const code = error?.message || "server_error";
    sendJson(res, code === "request_body_too_large" ? 413 : 500, {
      ok: false,
      code,
      message: "会話内容の整理に失敗しました。"
    });
  }
}

async function handleDbSearch(req, res) {
  const pool = getDbPool();
  if (!pool) {
    sendJson(res, 503, { ok: false, code: "database_url_missing" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const mode = body.mode === "location" ? "location" : "word";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 600) : "";
    const guide = inferSearchGuide(message, body.guide || {});
    const areaTokens = normalizeAreaTokens(body.location || {});
    const queryText = mode === "location" ? "" : message;
    const limit = Math.min(20, Math.max(1, Number(body.limit || 3)));

    const result = await pool.query(`
      WITH scored AS (
        SELECT
          f.id,
          f.source_url,
          f.page_type,
          f.name,
          f.status,
          f.status_class,
          f.until_text,
          f.departments_text,
          f.address,
          f.phone,
          f.official_url,
          f.hours_text,
          f.holiday_text,
          f.verified_text,
          f.quality,
          f.review_reason,
          f.quality_score,
          f.distance_label,
          f.distance_meters,
          fh.time_image_only,
          fl.emergency_care,
          fl.night_care,
          fl.holiday_care,
          fg.lat,
          fg.lng,
          COALESCE(depts.department_list, '{}') AS department_list,
          dept_matches.count AS department_match_count,
          keyword_matches.count AS keyword_match_count,
          area_matches.count AS area_match_count,
          CASE WHEN $1 <> '' AND f.search_blob ILIKE '%' || $1 || '%' THEN 1 ELSE 0 END AS exact_match
        FROM iryou_map.facilities f
        LEFT JOIN iryou_map.facility_hours fh ON fh.facility_id = f.id
        LEFT JOIN iryou_map.facility_flags fl ON fl.facility_id = f.id
        LEFT JOIN iryou_map.facility_geo fg ON fg.facility_id = f.id
        LEFT JOIN LATERAL (
          SELECT array_agg(fd.department ORDER BY fd.position) AS department_list
          FROM iryou_map.facility_departments fd
          WHERE fd.facility_id = f.id
        ) depts ON true
        CROSS JOIN LATERAL (
          SELECT count(*)::int
          FROM unnest($2::text[]) AS department
          WHERE f.departments_text ILIKE '%' || department || '%'
             OR f.search_blob ILIKE '%' || department || '%'
        ) dept_matches
        CROSS JOIN LATERAL (
          SELECT count(*)::int
          FROM unnest($3::text[]) AS keyword
          WHERE f.search_blob ILIKE '%' || keyword || '%'
        ) keyword_matches
        CROSS JOIN LATERAL (
          SELECT count(*)::int
          FROM unnest($4::text[]) AS area
          WHERE f.address ILIKE '%' || area || '%'
        ) area_matches
        WHERE
          $1 = ''
          OR f.search_blob ILIKE '%' || $1 || '%'
          OR f.name ILIKE '%' || $1 || '%'
          OR dept_matches.count > 0
          OR keyword_matches.count > 0
          OR area_matches.count > 0
      )
      SELECT
        *,
        LEAST(98,
          CASE WHEN $5 = 'location'
            THEN 42 + LEAST(34, area_match_count * 18) + LEAST(22, round(quality_score / 4.0)::int)
            ELSE 32 + LEAST(44, department_match_count * 22) + LEAST(36, keyword_match_count * 10) + exact_match * 18 + LEAST(16, round(quality_score / 5.0)::int)
          END
        )::int AS match_score,
        (
          CASE WHEN $5 = 'location' THEN 24 ELSE 0 END
          + LEAST(34, area_match_count * 18)
          + LEAST(44, department_match_count * 22)
          + LEAST(36, keyword_match_count * 10)
          + exact_match * 18
          + LEAST(28, round(quality_score / 3.0)::int)
          + CASE WHEN emergency_care IS NOT NULL AND emergency_care <> '不明' THEN 4 ELSE 0 END
          + CASE WHEN night_care IS NOT NULL AND night_care <> '不明' THEN 3 ELSE 0 END
          + CASE WHEN holiday_care IS NOT NULL AND holiday_care <> '不明' THEN 3 ELSE 0 END
        )::int AS rank_score
      FROM scored
      ORDER BY rank_score DESC, quality_score DESC, name ASC
      LIMIT $6
    `, [queryText, guide.departments, guide.keywords, areaTokens, mode, limit]);

    sendJson(res, 200, {
      ok: true,
      source: "postgres",
      query: { message, mode, departments: guide.departments, keywords: guide.keywords, areaTokens },
      items: result.rows.map((row) => toClientFacility(row, areaTokens)),
      meta: { count: result.rowCount }
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      code: "database_search_failed",
      message: error.message || "DB検索に失敗しました。"
    });
  }
}

async function serveStatic(req, res, url) {
  const pathname = decodeURIComponent(url.pathname);
  const cleanPath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(publicDir, cleanPath === "/" ? "index.html" : cleanPath);

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
  } catch {
    if (!path.extname(filePath)) {
      filePath = path.join(publicDir, "index.html");
    }
  }

  if (!filePath.startsWith(publicDir)) {
    sendJson(res, 403, { ok: false, code: "forbidden" });
    return;
  }

  try {
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
      "X-Robots-Tag": "noindex, nofollow"
    });
    res.end(buffer);
  } catch {
    sendJson(res, 404, { ok: false, code: "not_found" });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      databaseConfigured: Boolean(getDatabaseUrl()),
      model: geminiModel
    });
    return;
  }

  if (req.method === "POST" && url.pathname.endsWith("/api/gemini-guide")) {
    await handleGeminiGuide(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname.endsWith("/api/search")) {
    await handleDbSearch(req, res);
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { ok: false, code: "method_not_allowed" });
    return;
  }

  await serveStatic(req, res, url);
});

server.listen(port, () => {
  console.log(`医療MAP demo server listening on http://localhost:${port}`);
});
