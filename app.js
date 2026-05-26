const fallbackClinics = [
  {
    name: "千種歯科クリニック",
    status: "診療中",
    statusClass: "open",
    until: "19:00まで",
    departments: "歯科・口腔外科",
    departmentList: ["歯科", "口腔外科"],
    address: "名古屋市千種区今池1-4-8",
    station: "今池駅 徒歩1分",
    distance: "約180m",
    distanceMeters: 180,
    hours: "9:30-13:00 / 15:00-19:00",
    holiday: "木曜・日曜・祝日",
    verified: "確認日 2026.05",
    keywords: ["歯", "歯科", "虫歯", "歯ぐき", "親知らず", "口内炎", "今池"]
  },
  {
    name: "千種内科クリニック",
    status: "診療中",
    statusClass: "open",
    until: "18:30まで",
    departments: "内科・循環器内科・小児科",
    departmentList: ["内科", "循環器内科", "小児科"],
    address: "名古屋市千種区今池1-2-3",
    station: "今池駅 徒歩2分",
    distance: "約220m",
    distanceMeters: 220,
    hours: "9:00-12:30 / 15:30-18:30",
    holiday: "木曜午後・日曜・祝日",
    verified: "確認日 2026.05",
    keywords: ["内科", "発熱", "熱", "咳", "せき", "胸", "今池", "循環器"]
  },
  {
    name: "今池こどもクリニック",
    status: "診療中",
    statusClass: "open",
    until: "18:00まで",
    departments: "小児科・アレルギー科",
    departmentList: ["小児科", "アレルギー科"],
    address: "名古屋市千種区内山3-8-2",
    station: "今池駅 徒歩4分",
    distance: "約290m",
    distanceMeters: 290,
    hours: "9:00-12:00 / 15:00-18:00",
    holiday: "土曜午後・日曜・祝日",
    verified: "確認日 2026.04",
    keywords: ["子ども", "子供", "こども", "小児", "赤ちゃん", "発熱", "熱", "咳", "アレルギー"]
  },
  {
    name: "今池整形外科クリニック",
    status: "診療中",
    statusClass: "open",
    until: "18:45まで",
    departments: "整形外科・リハビリテーション科",
    departmentList: ["整形外科", "リハビリテーション科"],
    address: "名古屋市千種区今池4-6-10",
    station: "今池駅 徒歩3分",
    distance: "約260m",
    distanceMeters: 260,
    hours: "9:00-12:30 / 15:30-18:45",
    holiday: "木曜午後・土曜午後・日曜・祝日",
    verified: "確認日 2026.05",
    keywords: ["整形外科", "けが", "怪我", "足", "脚", "足首", "腕", "手", "肘", "膝", "腰", "肩", "骨", "骨折", "関節", "ねんざ", "捻挫", "打撲", "痛めた", "スポーツ"]
  },
  {
    name: "星ヶ丘内科医院",
    status: "午前診療",
    statusClass: "soon",
    until: "12:30まで",
    departments: "内科・消化器内科",
    departmentList: ["内科", "消化器内科"],
    address: "名古屋市千種区星が丘元町15-7",
    station: "星ヶ丘駅 徒歩5分",
    distance: "約380m",
    distanceMeters: 380,
    hours: "9:00-12:30 / 16:00-19:00",
    holiday: "水曜午後・土曜午後・日曜",
    verified: "確認日 2026.04",
    keywords: ["内科", "腹痛", "お腹", "胃", "吐き気", "下痢", "星ヶ丘"]
  },
  {
    name: "東山皮ふ科クリニック",
    status: "午後診療",
    statusClass: "soon",
    until: "19:00まで",
    departments: "皮膚科・小児皮膚科",
    departmentList: ["皮膚科", "小児皮膚科"],
    address: "名古屋市千種区東山通5-10",
    station: "東山公園駅 徒歩6分",
    distance: "約450m",
    distanceMeters: 450,
    hours: "9:00-12:00 / 15:00-19:00",
    holiday: "木曜・日曜・祝日",
    verified: "確認日 2026.03",
    keywords: ["皮膚", "湿疹", "かゆみ", "かぶれ", "発疹", "じんましん", "東山"]
  }
];

let clinics = fallbackClinics;

const emergencyKeywords = [
  "胸痛", "胸が痛", "息苦し", "呼吸困難", "意識", "ろれつ", "麻痺",
  "けいれん", "大量出血", "激しい頭痛", "突然の頭痛", "倒れ", "アナフィラキシー"
];

const departmentRules = [
  {
    departments: ["小児科", "内科"],
    keywords: ["子ども", "子供", "こども", "幼児", "赤ちゃん", "発熱", "熱", "咳", "せき"]
  },
  {
    departments: ["内科", "呼吸器内科", "耳鼻咽喉科"],
    keywords: ["発熱", "熱", "咳", "せき", "喉", "のど", "鼻水", "だるい", "風邪"]
  },
  {
    departments: ["歯科", "口腔外科"],
    keywords: ["歯", "歯ぐき", "歯茎", "虫歯", "口内炎", "親知らず"]
  },
  {
    departments: ["眼科"],
    keywords: ["目", "眼", "かゆい", "充血", "見えにくい", "涙"]
  },
  {
    departments: ["耳鼻咽喉科"],
    keywords: ["耳", "鼻", "喉", "のど", "めまい", "聞こえ", "花粉"]
  },
  {
    departments: ["皮膚科"],
    keywords: ["湿疹", "かゆみ", "かぶれ", "発疹", "じんましん", "やけど", "皮膚"]
  },
  {
    departments: ["整形外科"],
    keywords: ["足", "脚", "足首", "腕", "手", "肘", "腰", "膝", "肩", "骨", "骨折", "関節", "ねんざ", "捻挫", "打撲", "けが", "怪我", "痛めた", "転んだ", "ぶつけた", "スポーツ"]
  },
  {
    departments: ["内科", "消化器内科"],
    keywords: ["腹痛", "お腹", "胃", "吐き気", "下痢", "便秘", "食欲"]
  },
  {
    departments: ["泌尿器科", "内科"],
    keywords: ["尿", "膀胱", "排尿", "血尿", "頻尿"]
  },
  {
    departments: ["産婦人科"],
    keywords: ["妊娠", "生理", "不正出血", "おりもの", "婦人科"]
  },
  {
    departments: ["心療内科", "精神科"],
    keywords: ["不眠", "眠れない", "不安", "気分", "落ち込み", "ストレス"]
  }
];

let currentResults = [];
let aiIdleTimer = 0;
let aiRequestSeq = 0;
let geminiEndpointDisabled = false;

const AI_IDLE_DELAY_MS = 750;
const MIN_AI_QUERY_LENGTH = 2;
const aiGuideCache = new Map();

function uniqueItems(items, limit = 4) {
  return [...new Set(items)].slice(0, limit);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeMultiline(value) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function displayValue(value, fallback = "未確認") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function normalizeUrl(value) {
  const text = String(value ?? "").trim();
  return /^https?:\/\//.test(text) ? text : "";
}

function buildMapUrl(clinic) {
  const query = displayValue(clinic.address || clinic.name, "");
  return query ? `https://maps.google.com/?q=${encodeURIComponent(query)}` : "";
}

function buildFacilityKeywords(clinic) {
  const fields = [
    clinic.name,
    clinic.departments,
    clinic.address,
    clinic.pageType || clinic.type,
    clinic.holidayCare,
    clinic.nightCare,
    clinic.emergencyCare
  ];
  const tokens = [];
  fields.join(" ").split(/[\s、，,/／・\n丁目番号（）()-]+/).forEach((token) => {
    const cleaned = token.trim();
    if (cleaned.length >= 2 && !tokens.includes(cleaned)) tokens.push(cleaned);
  });
  return tokens.slice(0, 30);
}

function normalizeFacility(item, index = 0) {
  const departmentList = Array.isArray(item.departmentList) ? item.departmentList.filter(Boolean) : [];
  const normalized = {
    id: displayValue(item.id, `facility-${index}`),
    name: displayValue(item.name, "施設名未確認"),
    status: displayValue(item.status, "要確認"),
    statusClass: displayValue(item.statusClass, "closed"),
    until: displayValue(item.until, "時間未確認"),
    departments: displayValue(item.departments, "診療科目未確認"),
    departmentList,
    address: displayValue(item.address),
    station: displayValue(item.station, "最寄り未確認"),
    distance: displayValue(item.distance, "距離未設定"),
    distanceMeters: Number.isFinite(item.distanceMeters) ? item.distanceMeters : null,
    hours: displayValue(item.hours),
    holiday: displayValue(item.holiday),
    verified: displayValue(item.verified, "確認日未確認"),
    phone: displayValue(item.phone, ""),
    officialUrl: normalizeUrl(item.officialUrl),
    url: normalizeUrl(item.url || item.finalUrl || item.sourceUrl),
    pageType: displayValue(item.pageType || item.type),
    holidayCare: displayValue(item.holidayCare),
    nightCare: displayValue(item.nightCare),
    emergencyCare: displayValue(item.emergencyCare),
    timeImageOnly: displayValue(item.timeImageOnly),
    quality: displayValue(item.quality),
    reviewReason: displayValue(item.reviewReason, "なし"),
    qualityScore: Number.isFinite(item.qualityScore) ? item.qualityScore : 0
  };
  normalized.keywords = Array.isArray(item.keywords) && item.keywords.length
    ? item.keywords
    : buildFacilityKeywords(normalized);
  return normalized;
}

async function loadFacilityData() {
  try {
    const response = await fetch("./data/facilities.json?v=20260526-excel-data", { cache: "force-cache" });
    if (!response.ok) throw new Error("facility_data_failed");
    const payload = await response.json();
    if (!Array.isArray(payload.facilities) || !payload.facilities.length) return;
    clinics = payload.facilities.map(normalizeFacility);
  } catch {
    clinics = fallbackClinics.map(normalizeFacility);
  }
}

function normalizeGuideFromApi(guide) {
  const isObject = guide && typeof guide === "object";
  const source = isObject && guide.source === "gemini" ? "gemini" : "local";
  const departments = Array.isArray(guide?.departments)
    ? guide.departments.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const keywords = Array.isArray(guide?.keywords)
    ? guide.keywords.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    source,
    urgency: guide?.urgency === "emergency" ? "emergency" : "normal",
    departments: uniqueItems(departments, 4),
    keywords: uniqueItems(keywords, 8),
    summary: typeof guide?.summary === "string" ? guide.summary.slice(0, 90) : ""
  };
}

function findDepartments(text) {
  const query = text.trim();
  if (!query) return { type: "empty", departments: [] };

  if (emergencyKeywords.some((keyword) => query.includes(keyword))) {
    return { type: "emergency", departments: ["救急相談", "救急外来"] };
  }

  const matched = [];
  departmentRules.forEach((rule) => {
    if (rule.keywords.some((keyword) => query.includes(keyword))) {
      matched.push(...rule.departments);
    }
  });

  return {
    type: "normal",
    departments: uniqueItems(matched)
  };
}

function scoreClinic(clinic, query, departments, mode, guideKeywords = []) {
  const text = `${clinic.name} ${clinic.departments} ${clinic.address} ${clinic.station} ${clinic.keywords.join(" ")}`;
  const departmentMatches = departments.filter((department) => clinic.departmentList.includes(department)).length;
  const keywordMatches = clinic.keywords.filter((keyword) => query.includes(keyword)).length;
  const guideKeywordMatches = guideKeywords.filter((keyword) => (
    text.includes(keyword) ||
    clinic.keywords.some((localKeyword) => localKeyword.includes(keyword) || keyword.includes(localKeyword))
  )).length;
  const keywordHit = keywordMatches > 0 || guideKeywordMatches > 0 || (query && text.includes(query));
  const childIntentPoint = /子ども|子供|こども|幼児|赤ちゃん/.test(query) && clinic.keywords.includes("子ども") ? 18 : 0;
  const specialtyPoint = childIntentPoint && clinic.departmentList[0]?.includes("小児") ? 24 : 0;
  const hasDistance = Number.isFinite(clinic.distanceMeters);
  const distancePoint = hasDistance ? Math.max(0, 30 - Math.round(clinic.distanceMeters / 30)) : 0;
  const exactPoint = query && text.includes(query) ? 18 : 0;
  const departmentPoint = Math.min(38, departmentMatches * 22);
  const keywordPoint = Math.min(36, keywordMatches * 12 + guideKeywordMatches * 10 + (keywordHit ? 8 : 0));
  const locationPoint = mode === "location" ? 18 : 0;
  const qualityPoint = Math.min(28, Math.round((clinic.qualityScore || 0) / 3));
  const match = mode === "location"
    ? Math.min(98, 48 + Math.round(distancePoint * 0.6) + qualityPoint)
    : Math.min(98, 32 + departmentPoint + keywordPoint + exactPoint + childIntentPoint + Math.round(qualityPoint * 0.35));
  const rank = match + distancePoint + locationPoint + specialtyPoint + qualityPoint;

  return {
    ...clinic,
    match,
    rank
  };
}

function searchClinics(query = "", mode = "word", guide = null) {
  const aiGuide = normalizeGuideFromApi(guide);
  const departmentResult = mode === "word" ? findDepartments(query) : { type: "normal", departments: [] };
  if (departmentResult.type === "emergency" || aiGuide.urgency === "emergency") {
    return {
      type: "emergency",
      departments: departmentResult.departments,
      items: clinics
        .map((clinic) => scoreClinic(clinic, query, [], "location", aiGuide.keywords))
        .sort((a, b) => b.rank - a.rank || String(a.name).localeCompare(String(b.name), "ja"))
        .slice(0, 3)
    };
  }

  const departments = aiGuide.departments.length ? aiGuide.departments : departmentResult.departments;
  const scored = clinics
    .map((clinic) => scoreClinic(clinic, query, departments, mode, aiGuide.keywords))
    .sort((a, b) => b.rank - a.rank || String(a.name).localeCompare(String(b.name), "ja"))
    .slice(0, 3);

  return {
    type: "normal",
    departments,
    items: scored
  };
}

function renderClinics(items = currentResults) {
  const list = document.querySelector("#clinic-list");
  if (!list) return;
  const results = items.length ? items : searchClinics("現在地", "location").items;
  currentResults = results;
  list.innerHTML = results.map((clinic, index) => {
    const phoneHref = clinic.phone ? `tel:${clinic.phone.replace(/[^\d+]/g, "")}` : "";
    const mapHref = buildMapUrl(clinic);
    const rankText = clinic.distanceMeters === null
      ? `#${index + 1} マッチ度 ${clinic.match}% / 情報充実度 ${clinic.qualityScore || 0}`
      : `#${index + 1} 近さ ${escapeHtml(clinic.distance)} / マッチ度 ${clinic.match}%`;
    return `
      <article class="result-card">
        <div class="result-rank">${rankText}</div>
        <div class="result-top">
          <div>
            <span class="status ${escapeHtml(clinic.statusClass)}">${escapeHtml(clinic.status)}</span>
            <span class="verified-pill">${escapeHtml(clinic.verified)}</span>
            <h3>${escapeHtml(clinic.name)}</h3>
            <p>${escapeHtml(clinic.departments)}</p>
          </div>
          <div class="map-tile" aria-hidden="true"></div>
        </div>
        <ul class="result-facts">
          <li><strong>住所</strong><span>${escapeHtml(clinic.address)}</span></li>
          <li><strong>電話</strong><span>${escapeHtml(displayValue(clinic.phone))}</span></li>
          <li><strong>距離</strong><span>${escapeHtml(clinic.distance)}</span></li>
        </ul>
        <div class="result-hours">
          <strong>診療時間</strong><span>${escapeHtml(clinic.hours)}</span>
          <strong>休診日</strong><span>${escapeHtml(clinic.holiday)}</span>
        </div>
        <div class="result-actions">
          <a class="generated-action action-phone primary ${phoneHref ? "" : "disabled"}" href="${phoneHref || "#detail"}" aria-label="電話" title="電話"><span>電話</span></a>
          <a class="generated-action action-detail" href="#detail" data-detail-id="${escapeHtml(clinic.id)}" aria-label="詳細" title="詳細"><span>詳細</span></a>
        </div>
      </article>
    `;
  }).join("");
  renderDetail(results[0]);
}

function setActionLink(link, href) {
  if (!link) return;
  const text = String(href || "").trim();
  const activeHref = /^(https?:|tel:|mailto:)/.test(text) ? text : "";
  link.href = activeHref || "#detail";
  link.classList.toggle("disabled", !activeHref);
  link.setAttribute("aria-disabled", activeHref ? "false" : "true");
}

function renderDetail(clinic = currentResults[0]) {
  if (!clinic) return;
  const heading = document.querySelector("#detail-heading");
  const copy = document.querySelector("#detail-copy");
  const overview = document.querySelector("#detail-overview-grid");
  const statusRow = document.querySelector("#detail-status-row");
  const name = document.querySelector("#detail-name");
  const meta = document.querySelector("#detail-meta");
  const fields = document.querySelector("#detail-fields");
  if (!heading || !overview || !statusRow || !name || !meta || !fields) return;

  heading.textContent = clinic.name;
  if (copy) copy.textContent = "項目名つきで確認できます。";
  overview.innerHTML = `
    <article><strong>基本情報</strong><span>${escapeHtml(clinic.address)}<br>${escapeHtml(displayValue(clinic.phone))}</span></article>
    <article><strong>診療時間</strong><span>${escapeMultiline(clinic.hours)}</span></article>
    <article><strong>対応状況</strong><span>救急: ${escapeHtml(clinic.emergencyCare)}<br>夜間: ${escapeHtml(clinic.nightCare)}<br>休日: ${escapeHtml(clinic.holidayCare)}</span></article>
  `;
  statusRow.innerHTML = `
    <span class="status ${escapeHtml(clinic.statusClass)}">${escapeHtml(clinic.status)}</span>
    <span>${escapeHtml(clinic.until)}</span>
    <span>${escapeHtml(clinic.verified)}</span>
    <span>抽出品質 ${escapeHtml(clinic.quality)}</span>
  `;
  name.textContent = clinic.name;
  meta.textContent = `${clinic.departments} / ${clinic.address}`;
  fields.innerHTML = `
    <p><strong>住所</strong><span>${escapeHtml(clinic.address)}</span></p>
    <p><strong>電話</strong><span>${escapeHtml(displayValue(clinic.phone))}</span></p>
    <p><strong>診療科目</strong><span>${escapeHtml(clinic.departments)}</span></p>
    <p><strong>診療時間</strong><span>${escapeMultiline(clinic.hours)}</span></p>
    <p><strong>休診日</strong><span>${escapeMultiline(clinic.holiday)}</span></p>
    <p><strong>救急対応</strong><span>${escapeHtml(clinic.emergencyCare)}</span></p>
    <p><strong>夜間対応</strong><span>${escapeHtml(clinic.nightCare)}</span></p>
    <p><strong>休日診療</strong><span>${escapeHtml(clinic.holidayCare)}</span></p>
    <p><strong>公式サイト</strong><span>${clinic.officialUrl ? `<a href="${escapeHtml(clinic.officialUrl)}" target="_blank" rel="noreferrer">${escapeHtml(clinic.officialUrl)}</a>` : "未確認"}</span></p>
    <p><strong>医療MAP URL</strong><span>${clinic.url ? `<a href="${escapeHtml(clinic.url)}" target="_blank" rel="noreferrer">${escapeHtml(clinic.url)}</a>` : "未確認"}</span></p>
    <p><strong>要確認</strong><span>${escapeHtml(clinic.reviewReason)}</span></p>
  `;

  setActionLink(document.querySelector("#detail-phone"), clinic.phone ? `tel:${clinic.phone.replace(/[^\d+]/g, "")}` : "");
  setActionLink(document.querySelector("#detail-map"), buildMapUrl(clinic));
  setActionLink(document.querySelector("#detail-official"), clinic.officialUrl);
}

function updateResultHeader(label, copy, summary) {
  document.querySelector("#results-title").textContent = label;
  document.querySelector("#results-copy").textContent = copy;
  document.querySelector("#result-summary").innerHTML = `
    <span>並び順</span>
    <strong>${summary}</strong>
  `;
}

function renderDepartmentNote(result, query, guide = null, targetSelector = "#branch-panel") {
  const panel = document.querySelector(targetSelector);
  if (!panel) return;
  const aiGuide = normalizeGuideFromApi(guide);
  const escapedQuery = escapeHtml(query);

  if (result.type === "emergency") {
    panel.innerHTML = `
      <div class="branch-note branch-alert">
        <strong>先に救急相談をおすすめします</strong>
        <p>「${escapedQuery}」は緊急性が高い可能性があります。受診先を探す前に119または#7119などの救急相談を確認してください。</p>
        <p>下には、現在地に近い候補を表示しています。</p>
      </div>
    `;
    return;
  }

  const departments = result.departments.length ? result.departments : ["近くの医療機関"];
  const summary = aiGuide.summary || "細かい条件を選ばなくても、近さとマッチ度で上から並べます。";
  const title = aiGuide.source === "gemini" ? "会話から候補を整理しました" : `「${escapedQuery || "現在地"}」に近い候補`;
  panel.innerHTML = `
    <div class="branch-note">
      <strong>${title}</strong>
      <div class="department-list" aria-label="推定した候補科目">
        ${departments.map((department) => `<span class="department-chip">${escapeHtml(department)}</span>`).join("")}
      </div>
      <p>${escapeHtml(summary)}</p>
    </div>
  `;
}

function summarizeAiGuide(query, result, guide = null) {
  const aiGuide = normalizeGuideFromApi(guide);
  if (result.type === "emergency") {
    return "緊急性が高い可能性があります。受診先検索より先に119または救急相談を確認してください。";
  }

  if (aiGuide.source === "gemini" && aiGuide.summary) {
    return aiGuide.summary;
  }

  const departments = result.departments.length ? result.departments.join("、") : "近くの医療機関";
  return `「${query}」から、${departments}を候補にしました。近さとマッチ度が高い順に並べています。`;
}

async function requestGeminiGuide(message) {
  if (!canRequestAiGuide(message)) return null;

  const apiUrl = new URL("api/gemini-guide", window.location.href);
  const response = await fetch(apiUrl.href, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if ([404, 405, 501].includes(response.status)) geminiEndpointDisabled = true;
    return null;
  }
  if (payload?.code === "gemini_api_key_missing") geminiEndpointDisabled = true;
  return payload?.ok && payload.guide ? payload.guide : null;
}

function normalizeAiCacheKey(message) {
  return String(message || "").replace(/\s+/g, " ").trim().slice(0, 600);
}

function canRequestAiGuide(message) {
  const text = normalizeAiCacheKey(message);
  if (text.length < MIN_AI_QUERY_LENGTH) return false;
  if (geminiEndpointDisabled) return false;
  if (!["http:", "https:"].includes(window.location.protocol)) return false;
  if (window.location.hostname.endsWith("github.io")) return false;
  return true;
}

function renderConversationResult(text, result, options = {}) {
  const log = document.querySelector("#conversation-log");
  const guide = normalizeGuideFromApi(options.guide);
  const summaryLabel = guide.source === "gemini"
    ? "AI補正 + 近さ順"
    : options.pending
      ? "入力中に即時更新"
      : "入力内容 + 近さ順";
  const copy = guide.source === "gemini"
    ? "AIで整理しました。"
    : "入力に合わせて更新中。";
  renderDepartmentNote(result, text, guide, "#conversation-guide");
  renderClinics(result.items);
  updateResultHeader(`「${text}」の候補`, copy, summaryLabel);
  if (log) {
    log.textContent = `${text} ${summarizeAiGuide(text, result, guide)}${options.pending ? " 会話の内容を確認しています。" : ""}`;
  }
}

function runFuzzySearch(query, mode = "word") {
  const result = searchClinics(query, mode);
  renderDepartmentNote(result, query);
  renderClinics(result.items);
  const label = mode === "location" ? "現在地から近い候補" : `「${query}」の候補`;
  const copy = mode === "location"
    ? "現在地から表示。"
    : "入力に合わせて表示。";
  updateResultHeader(label, copy, "近い順 + マッチ度順");
  document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" });
}

function renderNearbyResults() {
  clearTimeout(aiIdleTimer);
  const result = searchClinics("現在地", "location");
  renderClinics(result.items);
  updateResultHeader("掲載情報が多い候補", "入力すると更新します。", "情報充実度 + マッチ度順");
  const guidePanel = document.querySelector("#conversation-guide");
  if (guidePanel) guidePanel.innerHTML = "";
  const log = document.querySelector("#conversation-log");
  if (log) log.textContent = "現在地から近い順で表示しています。";
}

async function refineConversationWithAi(text, requestId, localResult) {
  const cacheKey = normalizeAiCacheKey(text);
  if (!cacheKey) return;

  if (aiGuideCache.has(cacheKey)) {
    if (requestId !== aiRequestSeq) return;
    const guide = aiGuideCache.get(cacheKey);
    const result = searchClinics(text, "word", guide);
    renderConversationResult(text, result, { guide });
    return;
  }

  const guide = await requestGeminiGuide(text).catch(() => null);
  if (requestId !== aiRequestSeq) return;

  if (!guide) {
    renderConversationResult(text, localResult);
    return;
  }

  aiGuideCache.set(cacheKey, guide);
  const result = searchClinics(text, "word", guide);
  renderConversationResult(text, result, { guide });
}

function updateConversation(query, options = {}) {
  const text = query.trim();
  const requestId = ++aiRequestSeq;
  clearTimeout(aiIdleTimer);

  if (!text) {
    renderNearbyResults();
    return;
  }

  const localResult = searchClinics(text, "word");
  const cacheKey = normalizeAiCacheKey(text);
  if (aiGuideCache.has(cacheKey)) {
    const guide = aiGuideCache.get(cacheKey);
    const result = searchClinics(text, "word", guide);
    renderConversationResult(text, result, { guide });
    return;
  }

  const shouldUseAi = canRequestAiGuide(text);
  renderConversationResult(text, localResult, { pending: shouldUseAi });

  if (shouldUseAi) {
    const runAi = () => refineConversationWithAi(text, requestId, localResult);
    if (options.immediateAi) {
      runAi();
    } else {
      aiIdleTimer = window.setTimeout(runAi, AI_IDLE_DELAY_MS);
    }
  }

  if (options.scroll) {
    document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" });
  }
}

function renderWordBranch() {
  setupVoiceInput();
  const input = document.querySelector("#chat-input");
  input?.addEventListener("input", () => {
    updateConversation(input.value);
  });
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      updateConversation(input.value, { scroll: true, immediateAi: true });
    }
  });
}

function activateMode(mode) {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-expanded", active ? "true" : "false");
  });

  if (mode === "word") {
    renderWordBranch();
    return;
  }

  const panel = document.querySelector("#branch-panel");
  if (panel) {
    panel.innerHTML = `
      <div class="branch-note">
        <strong>現在地に近い候補を表示しました</strong>
        <p>デモでは名古屋市千種区周辺として、距離が近い候補を上から並べます。</p>
      </div>
    `;
  }
  runFuzzySearch("現在地", "location");
}

function setupVoiceInput() {
  const voiceButton = document.querySelector("[data-action='voice-input']");
  const wordInput = document.querySelector("#chat-input");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!voiceButton || !wordInput) return;

  if (!SpeechRecognition) {
    voiceButton.title = "このブラウザでは音声入力に対応していません";
    voiceButton.addEventListener("click", () => wordInput.focus());
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.addEventListener("start", () => {
    voiceButton.classList.add("is-listening");
    voiceButton.textContent = "聞き取り中";
  });
  recognition.addEventListener("end", () => {
    voiceButton.classList.remove("is-listening");
    voiceButton.textContent = "音声";
  });
  recognition.addEventListener("result", (event) => {
    const text = [...event.results].map((result) => result[0]?.transcript || "").join("");
    if (text) {
      wordInput.value = text;
      updateConversation(text, { scroll: true, immediateAi: true });
    }
  });

  voiceButton.addEventListener("click", () => recognition.start());
}

function openPanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closePanels() {
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.setAttribute("aria-hidden", "true");
  });
  document.body.style.overflow = "";
}

function activateTab(tabName) {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tabPanel === tabName);
  });
}

function bindEvents() {
  document.querySelectorAll("[data-open-panel]").forEach((button) => {
    button.addEventListener("click", () => openPanel(button.dataset.openPanel));
  });

  document.querySelectorAll("[data-close-panel]").forEach((button) => {
    button.addEventListener("click", closePanels);
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });

  document.querySelector("#clinic-list")?.addEventListener("click", (event) => {
    const detailLink = event.target.closest("[data-detail-id]");
    if (!detailLink) return;
    const clinic = currentResults.find((item) => item.id === detailLink.dataset.detailId);
    if (clinic) renderDetail(clinic);
  });

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => activateMode(button.dataset.mode));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePanels();
    if (event.key === "?" && !event.metaKey && !event.ctrlKey) openPanel("backstage");
  });
}

async function initApp() {
  renderWordBranch();
  bindEvents();
  await loadFacilityData();
  renderNearbyResults();
}

initApp();
