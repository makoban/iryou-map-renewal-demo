import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = __dirname;
const port = Number(process.env.PORT || 4173);
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const maxBodyBytes = 16 * 1024;

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
      model: geminiModel
    });
    return;
  }

  if (req.method === "POST" && url.pathname.endsWith("/api/gemini-guide")) {
    await handleGeminiGuide(req, res);
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
