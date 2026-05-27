import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TextDecoder } from "node:util";
import { promisify } from "node:util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execFileAsync = promisify(execFile);
const projectDir = path.resolve(__dirname, "..");
const dataPath = path.join(projectDir, "data", "facilities.json");
const reportsDir = path.join(projectDir, "reports");
const defaultCsvPath = path.join(reportsDir, "hp_score_results.csv");
const defaultSummaryPath = path.join(reportsDir, "hp_score_summary.json");
const checkedAt = new Date().toISOString();

const timeoutMs = 12000;
const cssTimeoutMs = 5000;
const maxHtmlBytes = 1_800_000;
const maxCssBytes = 250_000;
const defaultConcurrency = 10;

const snsPatterns = {
  instagram: /instagram\.com/i,
  facebook: /facebook\.com|fb\.me/i,
  x: /(?:twitter\.com|x\.com)\//i,
  line: /line\.me|lin\.ee|page\.line\.me/i,
  youtube: /youtube\.com|youtu\.be/i,
  tiktok: /tiktok\.com/i
};

function parseArgs(argv) {
  const options = {
    limit: 0,
    concurrency: defaultConcurrency,
    output: defaultCsvPath,
    summary: defaultSummaryPath
  };
  argv.forEach((arg) => {
    if (arg.startsWith("--limit=")) options.limit = Math.max(0, Number(arg.slice(8)) || 0);
    if (arg.startsWith("--concurrency=")) options.concurrency = Math.max(1, Number(arg.slice(14)) || defaultConcurrency);
    if (arg.startsWith("--output=")) options.output = path.resolve(projectDir, arg.slice(9));
    if (arg.startsWith("--summary=")) options.summary = path.resolve(projectDir, arg.slice(10));
  });
  return options;
}

function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function stripTags(html) {
  return cleanText(String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " "));
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreSpeed(ms, bytes, ok) {
  if (!ok) return 0;
  let score = 100;
  if (ms > 7000) score = 18;
  else if (ms > 5000) score = 32;
  else if (ms > 3500) score = 48;
  else if (ms > 2500) score = 62;
  else if (ms > 1500) score = 76;
  else if (ms > 900) score = 88;
  if (bytes > 1_200_000) score -= 18;
  else if (bytes > 700_000) score -= 10;
  else if (bytes > 350_000) score -= 4;
  return clampScore(score);
}

function getCharset(headers, htmlStart) {
  const contentType = headers.get("content-type") || "";
  const headerCharset = contentType.match(/charset=([^;\s]+)/i)?.[1];
  const metaCharset = htmlStart.match(/<meta[^>]+charset=["']?\s*([^"'\s/>]+)/i)?.[1]
    || htmlStart.match(/<meta[^>]+content=["'][^"']*charset=([^"'\s;>]+)/i)?.[1];
  return cleanCharset(headerCharset || metaCharset || "utf-8");
}

function cleanCharset(charset) {
  const normalized = String(charset || "utf-8").toLowerCase().replace(/[^a-z0-9_\-]/g, "");
  if (["shift_jis", "shift-jis", "sjis", "windows-31j", "cp932", "x-sjis"].includes(normalized)) return "shift_jis";
  if (["eucjp", "euc-jp"].includes(normalized)) return "euc-jp";
  return normalized || "utf-8";
}

async function fetchBytes(url, timeout = timeoutMs, maxBytes = maxHtmlBytes) {
  const controller = new AbortController();
  const startedAt = performance.now();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IryouMapRenewalAudit/1.0)",
        "Accept": "text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.3"
      }
    });
    const reader = response.body?.getReader();
    const chunks = [];
    let size = 0;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size <= maxBytes) chunks.push(value);
        if (size > maxBytes) break;
      }
    }
    const elapsedMs = Math.round(performance.now() - startedAt);
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      headers: response.headers,
      bytes: Buffer.concat(chunks),
      elapsedMs,
      truncated: size > maxBytes,
      totalBytes: size
    };
  } catch (error) {
    if (timeout === timeoutMs) return fetchBytesWithCurl(url, timeout, maxBytes, error);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchBytesWithCurl(url, timeout = timeoutMs, maxBytes = maxHtmlBytes, originalError = null) {
  const marker = Buffer.from("\n__IRYOU_MAP_CURL_META__");
  const maxTimeSeconds = Math.max(1, Math.ceil(timeout / 1000));
  try {
    const { stdout } = await execFileAsync("curl", [
      "-L",
      "-sS",
      "--max-time",
      String(maxTimeSeconds),
      "--connect-timeout",
      "6",
      "-A",
      "Mozilla/5.0 (compatible; IryouMapRenewalAudit/1.0)",
      "-H",
      "Accept: text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.3",
      "-w",
      `${marker.toString()}%{http_code}\t%{url_effective}\t%{time_total}\t%{size_download}`,
      url
    ], {
      encoding: "buffer",
      maxBuffer: maxBytes + 64_000,
      timeout: timeout + 3000
    });
    const index = stdout.lastIndexOf(marker);
    if (index < 0) throw originalError || new Error("curl_meta_missing");
    const body = stdout.slice(0, Math.min(index, maxBytes));
    const meta = stdout.slice(index + marker.length).toString("utf8").trim().split("\t");
    const status = Number(meta[0]) || 0;
    const finalUrl = meta[1] || url;
    const elapsedMs = Math.round((Number(meta[2]) || 0) * 1000);
    const totalBytes = Number(meta[3]) || body.byteLength;
    return {
      ok: status >= 200 && status < 400,
      status,
      finalUrl,
      headers: { get: () => "" },
      bytes: body,
      elapsedMs,
      truncated: totalBytes > maxBytes,
      totalBytes
    };
  } catch (error) {
    throw originalError || error;
  }
}

function decodeHtml(bytes, headers) {
  const utf8Start = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(0, 4096));
  const charset = getCharset(headers, utf8Start);
  try {
    return {
      html: new TextDecoder(charset, { fatal: false }).decode(bytes),
      charset
    };
  } catch {
    return {
      html: new TextDecoder("utf-8", { fatal: false }).decode(bytes),
      charset: "utf-8"
    };
  }
}

function attrValues(html, tagName, attrName) {
  const values = [];
  const tagPattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  const attrPattern = new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, "i");
  for (const tag of html.match(tagPattern) || []) {
    const value = tag.match(attrPattern)?.[1];
    if (value) values.push(value);
  }
  return values;
}

function extractFirst(html, pattern) {
  return cleanText((html.match(pattern)?.[1] || "").replace(/<[^>]+>/g, " "));
}

function extractMeta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patternA = new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i");
  const patternB = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, "i");
  return cleanText(html.match(patternA)?.[1] || html.match(patternB)?.[1] || "");
}

function absolutize(baseUrl, href) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return "";
  }
}

async function fetchCssSignals(baseUrl, html) {
  const links = [...html.matchAll(/<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi)]
    .map((match) => match[0])
    .map((tag) => tag.match(/href=["']([^"']+)["']/i)?.[1])
    .filter(Boolean)
    .slice(0, 5)
    .map((href) => absolutize(baseUrl, href))
    .filter(Boolean);

  const inlineCss = (html.match(/<style[\s\S]*?<\/style>/gi) || []).join("\n");
  const cssTexts = [inlineCss];
  await Promise.all(links.map(async (href) => {
    try {
      const result = await fetchBytes(href, cssTimeoutMs, maxCssBytes);
      const decoded = decodeHtml(result.bytes, result.headers);
      cssTexts.push(decoded.html);
    } catch {
      cssTexts.push("");
    }
  }));

  const css = cssTexts.join("\n");
  return {
    cssCount: links.length + (inlineCss ? 1 : 0),
    cssBytes: Buffer.byteLength(css),
    hasMediaQuery: /@media\b/i.test(css),
    hasFlexGrid: /\b(display\s*:\s*(?:flex|grid)|grid-template|flex-wrap)\b/i.test(css),
    hasResponsiveUnits: /\b(clamp|vw|vh|rem|%|minmax)\s*\(/i.test(css) || /\d+(?:vw|vh|rem|%)\b/i.test(css),
    css
  };
}

function analyzeHtml(url, finalUrl, status, ok, elapsedMs, bytes, html, cssSignals, charset, error = "") {
  const lower = html.toLowerCase();
  const text = stripTags(html);
  const title = extractFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = extractMeta(html, "description");
  const h1Texts = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => cleanText(m[1].replace(/<[^>]+>/g, " ")));
  const h2Count = (html.match(/<h2\b/gi) || []).length;
  const imageCount = (html.match(/<img\b/gi) || []).length;
  const linkCount = (html.match(/<a\b/gi) || []).length;
  const tableCount = (html.match(/<table\b/gi) || []).length;
  const deprecatedCount = (html.match(/<(?:font|center|marquee|frameset|frame)\b/gi) || []).length;
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
  const hasSchemaOrg = /schema\.org|itemscope|itemtype=/i.test(html);
  const hasOg = /property=["']og:/i.test(html);
  const hasFavicon = /rel=["'][^"']*(?:icon|shortcut icon)/i.test(html);
  const hasTel = /href=["']tel:|(?:電話|tel\.?|TEL|☎|[0-9]{2,4}-[0-9]{2,4}-[0-9]{3,4})/i.test(html);
  const hasAddress = /(住所|所在地|アクセス|〒|愛知県|岐阜県|三重県|静岡県|名古屋市|市|区|町|村)/.test(text);
  const hasHours = /(診療時間|受付時間|営業時間|休診|午前|午後|AM|PM|月曜|火曜|水曜|木曜|金曜|土曜|日曜)/i.test(text);
  const hasMap = /google\.com\/maps|maps\.app\.goo\.gl|map|地図|アクセス/i.test(html);
  const hasMojibake = /�|譁|繧|縺|莨|蜊|驕/.test(text.slice(0, 3000));
  const https = /^https:/i.test(finalUrl || url);
  const snsPlatforms = Object.entries(snsPatterns)
    .filter(([, pattern]) => pattern.test(html))
    .map(([name]) => name);
  const hasSns = snsPlatforms.length > 0;
  const titleLengthOk = title.length >= 8 && title.length <= 70;
  const descriptionLengthOk = metaDescription.length >= 40 && metaDescription.length <= 160;
  const textChars = text.length;
  const speedScore = scoreSpeed(elapsedMs, bytes, ok);
  const mobileScore = clampScore(
    (hasViewport ? 45 : 0)
    + (cssSignals.hasMediaQuery ? 30 : 0)
    + (cssSignals.hasFlexGrid ? 12 : 0)
    + (cssSignals.hasResponsiveUnits ? 8 : 0)
    + (/<picture\b|srcset=/i.test(html) ? 5 : 0)
  );
  const seoScore = clampScore(
    (ok ? 12 : 0)
    + (https ? 8 : 0)
    + (title ? 15 : 0)
    + (titleLengthOk ? 8 : 0)
    + (metaDescription ? 15 : 0)
    + (descriptionLengthOk ? 7 : 0)
    + (h1Texts.length === 1 ? 12 : h1Texts.length > 1 ? 5 : 0)
    + (hasCanonical ? 8 : 0)
    + (hasOg ? 6 : 0)
    + (hasJsonLd || hasSchemaOrg ? 9 : 0)
  );
  const clarityScore = clampScore(
    (title ? 12 : 0)
    + (h1Texts.length ? 12 : 0)
    + (h2Count ? 8 : 0)
    + (hasTel ? 16 : 0)
    + (hasAddress ? 14 : 0)
    + (hasHours ? 16 : 0)
    + (hasMap ? 8 : 0)
    + (linkCount >= 4 ? 6 : 0)
    + (textChars >= 800 ? 8 : textChars >= 300 ? 4 : 0)
  );
  const contentScore = clampScore(
    (textChars >= 2500 ? 30 : textChars >= 1200 ? 22 : textChars >= 500 ? 12 : textChars >= 180 ? 6 : 0)
    + (imageCount >= 8 ? 18 : imageCount >= 3 ? 12 : imageCount >= 1 ? 6 : 0)
    + (h2Count >= 4 ? 12 : h2Count >= 2 ? 8 : h2Count >= 1 ? 4 : 0)
    + (hasTel ? 10 : 0)
    + (hasAddress ? 10 : 0)
    + (hasHours ? 12 : 0)
    + (hasMap ? 4 : 0)
    + (hasJsonLd || hasSchemaOrg ? 4 : 0)
  );
  const designScore = clampScore(
    (cssSignals.cssCount ? 18 : 0)
    + (cssSignals.cssBytes >= 3000 ? 12 : cssSignals.cssBytes >= 800 ? 6 : 0)
    + (imageCount >= 6 ? 18 : imageCount >= 2 ? 12 : imageCount >= 1 ? 6 : 0)
    + (cssSignals.hasFlexGrid ? 14 : 0)
    + (cssSignals.hasMediaQuery ? 12 : 0)
    + (hasFavicon ? 6 : 0)
    + (hasOg ? 5 : 0)
    + Math.max(0, 15 - deprecatedCount * 4 - Math.max(0, tableCount - 3) * 2)
  );
  const cleanlinessScore = clampScore(
    (ok ? 24 : 0)
    + (!hasMojibake ? 18 : 0)
    + (deprecatedCount === 0 ? 15 : deprecatedCount <= 2 ? 8 : 0)
    + (tableCount <= 3 ? 10 : tableCount <= 8 ? 5 : 0)
    + (bytes < 800_000 ? 10 : bytes < 1_500_000 ? 5 : 0)
    + (https ? 8 : 0)
    + (cssSignals.cssCount ? 8 : 0)
    + (hasViewport ? 7 : 0)
  );
  const snsScore = hasSns ? 100 : hasOg ? 35 : 0;

  const totalScore = clampScore(
    designScore * 0.16
    + clarityScore * 0.16
    + contentScore * 0.16
    + cleanlinessScore * 0.12
    + speedScore * 0.14
    + seoScore * 0.14
    + mobileScore * 0.09
    + snsScore * 0.03
  );
  const grade = totalScore >= 85 ? "A" : totalScore >= 70 ? "B" : totalScore >= 55 ? "C" : totalScore >= 40 ? "D" : "E";
  const notes = [];
  if (!ok) notes.push(`接続/HTTP要確認:${status || error}`);
  if (!https) notes.push("HTTPSではない");
  if (!hasViewport) notes.push("viewportなし");
  if (!cssSignals.hasMediaQuery) notes.push("レスポンシブCSS弱い");
  if (!title) notes.push("titleなし");
  if (!metaDescription) notes.push("descriptionなし");
  if (!h1Texts.length) notes.push("h1なし");
  if (!hasTel) notes.push("電話情報弱い");
  if (!hasAddress) notes.push("住所/アクセス情報弱い");
  if (!hasHours) notes.push("診療時間情報弱い");
  if (!hasSns) notes.push("SNSリンク未検出");
  if (deprecatedCount) notes.push(`古いHTMLタグ:${deprecatedCount}`);
  if (hasMojibake) notes.push("文字化け疑い");

  return {
    final_url: finalUrl || "",
    http_status: status || "",
    ok: ok ? "1" : "0",
    error,
    load_ms: elapsedMs || "",
    html_bytes: bytes || 0,
    charset,
    page_title: title,
    meta_description: metaDescription,
    h1_count: h1Texts.length,
    h1_text: h1Texts.slice(0, 2).join(" / "),
    h2_count: h2Count,
    text_chars: textChars,
    image_count: imageCount,
    css_count: cssSignals.cssCount,
    css_bytes: cssSignals.cssBytes,
    table_count: tableCount,
    deprecated_tag_count: deprecatedCount,
    has_viewport: hasViewport ? "1" : "0",
    has_media_query: cssSignals.hasMediaQuery ? "1" : "0",
    has_flex_grid: cssSignals.hasFlexGrid ? "1" : "0",
    has_responsive_units: cssSignals.hasResponsiveUnits ? "1" : "0",
    has_canonical: hasCanonical ? "1" : "0",
    has_og: hasOg ? "1" : "0",
    has_schema: (hasJsonLd || hasSchemaOrg) ? "1" : "0",
    has_favicon: hasFavicon ? "1" : "0",
    has_tel: hasTel ? "1" : "0",
    has_address: hasAddress ? "1" : "0",
    has_hours: hasHours ? "1" : "0",
    has_map: hasMap ? "1" : "0",
    has_sns: hasSns ? "1" : "0",
    sns_platforms: snsPlatforms.join("|"),
    design_score: designScore,
    clarity_score: clarityScore,
    content_score: contentScore,
    cleanliness_score: cleanlinessScore,
    speed_score: speedScore,
    seo_score: seoScore,
    mobile_score: mobileScore,
    sns_score: snsScore,
    total_score: totalScore,
    grade,
    notes: notes.join("; ")
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(rows, columns) {
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","))
  ].join("\n") + "\n";
}

function buildTargets(facilities) {
  const map = new Map();
  for (const facility of facilities) {
    const entries = [
      ["iryou_map", facility.url],
      ["official", facility.officialUrl]
    ];
    for (const [kind, rawUrl] of entries) {
      const url = cleanText(rawUrl);
      if (!/^https?:\/\//i.test(url)) continue;
      if (!map.has(url)) {
        map.set(url, {
          checked_at: checkedAt,
          source_kind: kind,
          url,
          facility_count: 0,
          sample_facility_names: [],
          sample_facility_ids: []
        });
      }
      const row = map.get(url);
      row.facility_count += 1;
      if (row.sample_facility_names.length < 5) row.sample_facility_names.push(cleanText(facility.name));
      if (row.sample_facility_ids.length < 5) row.sample_facility_ids.push(cleanText(facility.id));
    }
  }
  return [...map.values()].sort((a, b) => a.source_kind.localeCompare(b.source_kind) || a.url.localeCompare(b.url));
}

async function scoreTarget(target) {
  try {
    const fetched = await fetchBytes(target.url);
    const { html, charset } = decodeHtml(fetched.bytes, fetched.headers);
    const cssSignals = await fetchCssSignals(fetched.finalUrl || target.url, html);
    const analysis = analyzeHtml(
      target.url,
      fetched.finalUrl,
      fetched.status,
      fetched.ok,
      fetched.elapsedMs,
      fetched.totalBytes || fetched.bytes.byteLength,
      html,
      cssSignals,
      charset,
      fetched.truncated ? "HTML取得上限で途中まで解析" : ""
    );
    return { ...target, ...analysis };
  } catch (error) {
    const message = error?.name === "AbortError" ? "timeout" : (error?.message || "fetch_failed");
    const analysis = analyzeHtml(target.url, "", "", false, "", 0, "", {
      cssCount: 0,
      cssBytes: 0,
      hasMediaQuery: false,
      hasFlexGrid: false,
      hasResponsiveUnits: false
    }, "", message);
    return { ...target, ...analysis };
  }
}

async function runQueue(targets, concurrency) {
  const results = new Array(targets.length);
  let cursor = 0;
  let done = 0;
  async function worker() {
    while (cursor < targets.length) {
      const index = cursor++;
      results[index] = await scoreTarget(targets[index]);
      done += 1;
      if (done % 25 === 0 || done === targets.length) {
        const latest = results[index];
        console.error(`scored ${done}/${targets.length}: ${latest.total_score} ${latest.url}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

function summarize(results) {
  const average = (key) => {
    const values = results.map((row) => Number(row[key])).filter(Number.isFinite);
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  };
  const counts = (key) => results.reduce((acc, row) => {
    const value = row[key] || "";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return {
    checked_at: checkedAt,
    total_urls: results.length,
    reachable_urls: results.filter((row) => row.ok === "1").length,
    average_scores: {
      total: average("total_score"),
      design: average("design_score"),
      clarity: average("clarity_score"),
      content: average("content_score"),
      cleanliness: average("cleanliness_score"),
      speed: average("speed_score"),
      seo: average("seo_score"),
      mobile: average("mobile_score"),
      sns: average("sns_score")
    },
    grade_counts: counts("grade"),
    source_counts: counts("source_kind"),
    top_20: [...results].sort((a, b) => Number(b.total_score) - Number(a.total_score)).slice(0, 20).map((row) => ({
      total_score: row.total_score,
      grade: row.grade,
      source_kind: row.source_kind,
      title: row.page_title,
      url: row.url
    })),
    bottom_20: [...results].sort((a, b) => Number(a.total_score) - Number(b.total_score)).slice(0, 20).map((row) => ({
      total_score: row.total_score,
      grade: row.grade,
      source_kind: row.source_kind,
      title: row.page_title,
      url: row.url,
      notes: row.notes
    }))
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const payload = JSON.parse(await readFile(dataPath, "utf8"));
  const facilities = Array.isArray(payload.facilities) ? payload.facilities : [];
  let targets = buildTargets(facilities);
  if (options.limit) targets = targets.slice(0, options.limit);
  await mkdir(path.dirname(options.output), { recursive: true });
  await mkdir(path.dirname(options.summary), { recursive: true });

  console.error(`Scoring ${targets.length} URLs with concurrency ${options.concurrency}...`);
  const results = await runQueue(targets, options.concurrency);
  const columns = [
    "checked_at",
    "source_kind",
    "url",
    "final_url",
    "facility_count",
    "sample_facility_names",
    "sample_facility_ids",
    "http_status",
    "ok",
    "error",
    "load_ms",
    "html_bytes",
    "charset",
    "page_title",
    "meta_description",
    "h1_count",
    "h1_text",
    "h2_count",
    "text_chars",
    "image_count",
    "css_count",
    "css_bytes",
    "table_count",
    "deprecated_tag_count",
    "has_viewport",
    "has_media_query",
    "has_flex_grid",
    "has_responsive_units",
    "has_canonical",
    "has_og",
    "has_schema",
    "has_favicon",
    "has_tel",
    "has_address",
    "has_hours",
    "has_map",
    "has_sns",
    "sns_platforms",
    "design_score",
    "clarity_score",
    "content_score",
    "cleanliness_score",
    "speed_score",
    "seo_score",
    "mobile_score",
    "sns_score",
    "total_score",
    "grade",
    "notes"
  ];
  const normalized = results.map((row) => ({
    ...row,
    sample_facility_names: row.sample_facility_names.join("|"),
    sample_facility_ids: row.sample_facility_ids.join("|")
  }));
  await writeFile(options.output, toCsv(normalized, columns));
  const summary = summarize(results);
  await writeFile(options.summary, JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify({
    csv: options.output,
    summary: options.summary,
    ...summary
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
