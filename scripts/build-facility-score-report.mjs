import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, "..");
const dataPath = path.join(projectDir, "data", "facilities.json");
const reportsDir = path.join(projectDir, "reports");
const hpScorePath = path.join(reportsDir, "hp_score_results.csv");
const facilityScorePath = path.join(reportsDir, "facility_score_sheet.csv");
const facilitySummaryPath = path.join(reportsDir, "facility_data_summary.json");
const facilitySummaryCsvPath = path.join(reportsDir, "facility_data_summary.csv");

const scoreFields = [
  "design_score",
  "clarity_score",
  "content_score",
  "cleanliness_score",
  "speed_score",
  "seo_score",
  "mobile_score",
  "sns_score",
  "total_score"
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  const [header = [], ...records] = rows;
  return records
    .filter((record) => record.some((cell) => cell !== ""))
    .map((record) => Object.fromEntries(header.map((key, index) => [key, record[index] ?? ""])));
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function writeCsv(rows) {
  const header = Object.keys(rows[0] || {});
  return [
    header.map(csvEscape).join(","),
    ...rows.map((row) => header.map((key) => csvEscape(row[key])).join(","))
  ].join("\n");
}

function displayValue(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function hasKnownValue(value) {
  const text = displayValue(value);
  return Boolean(text) && !["未確認", "不明", "診療時間未確認", "休診日未確認", "時間未確認"].includes(text);
}

function normalizeUrl(value) {
  const text = String(value ?? "").trim();
  if (!/^https?:\/\//i.test(text)) return "";
  try {
    const parsed = new URL(text);
    parsed.hash = "";
    if ((parsed.protocol === "http:" && parsed.port === "80") || (parsed.protocol === "https:" && parsed.port === "443")) {
      parsed.port = "";
    }
    const href = parsed.href.replace(/\/$/, "");
    return href;
  } catch {
    return text.replace(/\/$/, "");
  }
}

function toNumber(value) {
  const number = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function countBy(items, getter) {
  return items.reduce((accumulator, item) => {
    const key = getter(item) || "未確認";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

function average(rows, field) {
  if (!rows.length) return 0;
  return Math.round(rows.reduce((sum, row) => sum + toNumber(row[field]), 0) / rows.length);
}

function collectDepartments(facilities) {
  const counts = new Map();
  facilities.forEach((facility) => {
    const departments = Array.isArray(facility.departmentList)
      ? facility.departmentList
      : String(facility.departments || "").split(/[、,，／/・]/);
    departments
      .map((department) => department.trim())
      .filter(Boolean)
      .forEach((department) => counts.set(department, (counts.get(department) || 0) + 1));
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([department, count]) => ({ department, count }));
}

function buildScoreMap(scoreRows) {
  const map = new Map();
  scoreRows.forEach((row) => {
    [row.url, row.final_url].forEach((url) => {
      const key = normalizeUrl(url);
      if (key && !map.has(key)) map.set(key, row);
    });
  });
  return map;
}

function findScoreForFacility(facility, scoreMap) {
  const officialKey = normalizeUrl(facility.officialUrl);
  const mapKey = normalizeUrl(facility.url || facility.finalUrl || facility.sourceUrl);
  return {
    targetUrl: officialKey || mapKey,
    targetType: officialKey ? "公式HP" : "医療MAP",
    row: scoreMap.get(officialKey) || scoreMap.get(mapKey) || null
  };
}

function buildFacilityRows(facilities, scoreMap) {
  return facilities.map((facility) => {
    const { targetUrl, targetType, row } = findScoreForFacility(facility, scoreMap);
    return {
      "施設ID": displayValue(facility.id),
      "施設名": displayValue(facility.name, "施設名未確認"),
      "ページ種別": displayValue(facility.type || facility.pageType, "未確認"),
      "住所": displayValue(facility.address, "未確認"),
      "電話": displayValue(facility.phone, "未確認"),
      "診療科目": displayValue(facility.departments, "未確認"),
      "公式HP": displayValue(facility.officialUrl),
      "医療MAP URL": displayValue(facility.url || facility.sourceUrl),
      "採点対象URL": targetUrl,
      "採点種別": row?.source_kind === "official" || targetType === "公式HP" ? "公式HP" : "医療MAP",
      "取得可否": row ? (row.ok === "1" ? "取得成功" : "取得失敗") : "未採点",
      "HTTP状態": row?.http_status || "",
      "総合点": row?.total_score || "",
      "評価": row?.grade || "",
      "デザイン性": row?.design_score || "",
      "わかりやすさ": row?.clarity_score || "",
      "内容充実": row?.content_score || "",
      "清潔感": row?.cleanliness_score || "",
      "読み込み速度": row?.speed_score || "",
      "SEO": row?.seo_score || "",
      "スマホ対応": row?.mobile_score || "",
      "SNS": row?.sns_score || "",
      "診療時間あり": hasKnownValue(facility.hours) ? "あり" : "なし",
      "休診日あり": hasKnownValue(facility.holiday) ? "あり" : "なし",
      "緯度経度あり": Number.isFinite(Number(facility.lat)) && Number.isFinite(Number(facility.lng)) ? "あり" : "なし",
      "救急対応": displayValue(facility.emergencyCare, "不明"),
      "夜間対応": displayValue(facility.nightCare, "不明"),
      "休日対応": displayValue(facility.holidayCare, "不明"),
      "抽出品質": displayValue(facility.quality, "未確認"),
      "要確認理由": displayValue(facility.reviewReason),
      "採点メモ": row?.notes || ""
    };
  });
}

function buildSummary(facilities, scoreRows, facilityRows) {
  const officialUrlCount = facilities.filter((facility) => displayValue(facility.officialUrl)).length;
  const withHours = facilities.filter((facility) => hasKnownValue(facility.hours)).length;
  const withHoliday = facilities.filter((facility) => hasKnownValue(facility.holiday)).length;
  const geocoded = facilities.filter((facility) => Number.isFinite(Number(facility.lat)) && Number.isFinite(Number(facility.lng))).length;
  const departmentKnown = facilities.filter((facility) => displayValue(facility.departments) && facility.departments !== "診療科目未確認").length;
  const scoredFacilities = facilityRows.filter((row) => row["取得可否"] !== "未採点");
  const reachableFacilities = facilityRows.filter((row) => row["取得可否"] === "取得成功");
  const officialScoredFacilities = facilityRows.filter((row) => row["採点種別"] === "公式HP");
  const iryouMapScoredFacilities = facilityRows.filter((row) => row["採点種別"] === "医療MAP");

  const averageScores = Object.fromEntries(scoreFields.map((field) => [field.replace("_score", ""), average(scoreRows, field)]));
  const facilityAverageScores = {
    total: average(scoredFacilities, "総合点"),
    design: average(scoredFacilities, "デザイン性"),
    clarity: average(scoredFacilities, "わかりやすさ"),
    content: average(scoredFacilities, "内容充実"),
    cleanliness: average(scoredFacilities, "清潔感"),
    speed: average(scoredFacilities, "読み込み速度"),
    seo: average(scoredFacilities, "SEO"),
    mobile: average(scoredFacilities, "スマホ対応"),
    sns: average(scoredFacilities, "SNS")
  };

  return {
    generatedAt: new Date().toISOString(),
    source: "data/facilities.json + reports/hp_score_results.csv",
    facilities: {
      total: facilities.length,
      uniqueNames: new Set(facilities.map((facility) => displayValue(facility.name))).size,
      withAddress: facilities.filter((facility) => displayValue(facility.address)).length,
      withPhone: facilities.filter((facility) => displayValue(facility.phone)).length,
      withOfficialUrl: officialUrlCount,
      withHours,
      withHoliday,
      geocoded,
      departmentKnown
    },
    urls: {
      uniqueTotal: new Set(scoreRows.map((row) => normalizeUrl(row.url)).filter(Boolean)).size,
      rawUniqueIryouMap: new Set(facilities.map((facility) => normalizeUrl(facility.url)).filter(Boolean)).size,
      rawUniqueOfficial: new Set(facilities.map((facility) => normalizeUrl(facility.officialUrl)).filter(Boolean)).size,
      scoredTotal: scoreRows.length,
      scoredIryouMap: scoreRows.filter((row) => row.source_kind === "iryou_map").length,
      scoredOfficial: scoreRows.filter((row) => row.source_kind === "official").length,
      reachable: scoreRows.filter((row) => row.ok === "1").length
    },
    facilityScores: {
      scoredTotal: scoredFacilities.length,
      reachable: reachableFacilities.length,
      officialTarget: officialScoredFacilities.length,
      iryouMapTarget: iryouMapScoredFacilities.length,
      gradeCounts: countBy(scoredFacilities, (row) => row["評価"]),
      averageScores: facilityAverageScores
    },
    careFlags: {
      emergency: facilities.filter((facility) => /あり|対応|可|救急/.test(displayValue(facility.emergencyCare))).length,
      night: facilities.filter((facility) => /あり|対応|可|夜間/.test(displayValue(facility.nightCare))).length,
      holiday: facilities.filter((facility) => /あり|対応|可|休日/.test(displayValue(facility.holidayCare))).length
    },
    qualityCounts: countBy(facilities, (facility) => displayValue(facility.quality, "未確認")),
    statusCounts: countBy(facilities, (facility) => displayValue(facility.status, "未確認")),
    pageTypeCounts: countBy(facilities, (facility) => displayValue(facility.type || facility.pageType, "未確認")),
    topDepartments: collectDepartments(facilities),
    hpScores: {
      averageScores,
      gradeCounts: countBy(scoreRows, (row) => row.grade),
      sourceCounts: countBy(scoreRows, (row) => row.source_kind)
    }
  };
}

function buildSummaryCsv(summary) {
  const rows = [
    ["カテゴリ", "項目", "値"],
    ["施設", "総施設行数", summary.facilities.total],
    ["施設", "施設名ユニーク数", summary.facilities.uniqueNames],
    ["施設", "住所あり", summary.facilities.withAddress],
    ["施設", "電話あり", summary.facilities.withPhone],
    ["施設", "公式HPあり", summary.facilities.withOfficialUrl],
    ["施設", "診療時間あり", summary.facilities.withHours],
    ["施設", "休診日あり", summary.facilities.withHoliday],
    ["施設", "緯度経度あり", summary.facilities.geocoded],
    ["施設", "科目あり", summary.facilities.departmentKnown],
    ["施設採点", "施設採点行数", summary.facilityScores.scoredTotal],
    ["施設採点", "取得成功施設", summary.facilityScores.reachable],
    ["施設採点", "公式HP採点対象", summary.facilityScores.officialTarget],
    ["施設採点", "医療MAP採点対象", summary.facilityScores.iryouMapTarget],
    ["URL", "採点済みURL", summary.urls.scoredTotal],
    ["URL", "医療MAP内URL", summary.urls.scoredIryouMap],
    ["URL", "公式HP等URL", summary.urls.scoredOfficial],
    ["URL", "取得成功URL", summary.urls.reachable],
    ["対応", "救急対応あり", summary.careFlags.emergency],
    ["対応", "夜間対応あり", summary.careFlags.night],
    ["対応", "休日対応あり", summary.careFlags.holiday]
  ];
  Object.entries(summary.facilityScores.gradeCounts).forEach(([key, value]) => rows.push(["施設評価", key, value]));
  Object.entries(summary.hpScores.averageScores).forEach(([key, value]) => rows.push(["HP平均点", key, value]));
  Object.entries(summary.qualityCounts).forEach(([key, value]) => rows.push(["品質", key, value]));
  Object.entries(summary.statusCounts).forEach(([key, value]) => rows.push(["状態", key, value]));
  Object.entries(summary.pageTypeCounts).forEach(([key, value]) => rows.push(["ページ種別", key, value]));
  summary.topDepartments.forEach((item) => rows.push(["科目上位", item.department, item.count]));
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

async function main() {
  await mkdir(reportsDir, { recursive: true });
  const payload = JSON.parse(await readFile(dataPath, "utf8"));
  const facilities = Array.isArray(payload.facilities) ? payload.facilities : [];
  const scoreRows = parseCsv(await readFile(hpScorePath, "utf8"));
  const scoreMap = buildScoreMap(scoreRows);
  const facilityRows = buildFacilityRows(facilities, scoreMap);
  const summary = buildSummary(facilities, scoreRows, facilityRows);

  await writeFile(facilityScorePath, `${writeCsv(facilityRows)}\n`);
  await writeFile(facilitySummaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(facilitySummaryCsvPath, `${buildSummaryCsv(summary)}\n`);

  console.log(`facility rows: ${facilityRows.length}`);
  console.log(`score rows: ${scoreRows.length}`);
  console.log(`reachable facilities: ${summary.facilityScores.reachable}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
