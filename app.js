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
let userLocation = {
  source: "none",
  lat: null,
  lng: null,
  address: "",
  areaTokens: []
};
let locationBusy = false;
let locationMessage = "";

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
let searchIdleTimer = 0;
let aiRequestSeq = 0;
let geminiEndpointDisabled = false;
let serverSearchDisabled = false;
let wordBranchBound = false;

const RESULT_LIMIT = 5;
const SEARCH_IDLE_DELAY_MS = 1800;
const AI_IDLE_DELAY_MS = 800;
const VOICE_SILENCE_MS = 1500;
const MIN_AI_QUERY_LENGTH = 2;
const LOCATION_STORAGE_KEY = "iryouMapLocationPrefs";
const LOCATION_AUTO_SESSION_KEY = "iryouMapAutoLocationTried";
const aiGuideCache = new Map();
const tokaiAreaCenters = [
  { label: "愛知県名古屋市中区", lat: 35.1687, lng: 136.9103 },
  { label: "愛知県名古屋市千種区", lat: 35.1665, lng: 136.9466 },
  { label: "愛知県名古屋市昭和区", lat: 35.1502, lng: 136.9343 },
  { label: "愛知県名古屋市東区", lat: 35.1793, lng: 136.9257 },
  { label: "愛知県名古屋市北区", lat: 35.1941, lng: 136.9118 },
  { label: "愛知県名古屋市西区", lat: 35.1892, lng: 136.8901 },
  { label: "愛知県名古屋市中村区", lat: 35.1686, lng: 136.8731 },
  { label: "愛知県名古屋市瑞穂区", lat: 35.1316, lng: 136.9349 },
  { label: "愛知県名古屋市熱田区", lat: 35.1285, lng: 136.9102 },
  { label: "愛知県名古屋市中川区", lat: 35.1415, lng: 136.8545 },
  { label: "愛知県名古屋市港区", lat: 35.1077, lng: 136.8856 },
  { label: "愛知県名古屋市南区", lat: 35.0951, lng: 136.9312 },
  { label: "愛知県名古屋市守山区", lat: 35.2033, lng: 136.9766 },
  { label: "愛知県名古屋市緑区", lat: 35.0708, lng: 136.9526 },
  { label: "愛知県名古屋市名東区", lat: 35.1753, lng: 137.0101 },
  { label: "愛知県名古屋市天白区", lat: 35.1227, lng: 136.9758 },
  { label: "愛知県犬山市", lat: 35.3786, lng: 136.9444 },
  { label: "愛知県春日井市", lat: 35.2476, lng: 136.9723 },
  { label: "愛知県一宮市", lat: 35.3042, lng: 136.8031 },
  { label: "愛知県豊田市", lat: 35.0824, lng: 137.1563 },
  { label: "愛知県岡崎市", lat: 34.9549, lng: 137.1743 },
  { label: "愛知県豊橋市", lat: 34.7692, lng: 137.3915 },
  { label: "岐阜県岐阜市", lat: 35.4232, lng: 136.7607 },
  { label: "岐阜県大垣市", lat: 35.3594, lng: 136.6128 },
  { label: "三重県津市", lat: 34.7186, lng: 136.5058 },
  { label: "三重県四日市市", lat: 34.965, lng: 136.6244 },
  { label: "静岡県静岡市葵区", lat: 34.9756, lng: 138.3828 },
  { label: "静岡県浜松市中央区", lat: 34.7108, lng: 137.7261 }
];

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

function compactDisplay(value, maxLength = 80, fallback = "未確認") {
  const text = displayValue(value, fallback).replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function toFiniteNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text.replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

function normalizeUrl(value) {
  const text = String(value ?? "").trim();
  return /^https?:\/\//.test(text) ? text : "";
}

function hasCoordinates(item) {
  return Number.isFinite(item?.lat) && Number.isFinite(item?.lng);
}

function extractAreaTokens(address) {
  const text = String(address ?? "").replace(/\s+/g, "").trim();
  if (!text) return [];
  const tokens = [];
  const add = (token) => {
    const cleaned = String(token ?? "").trim();
    if (cleaned.length >= 2 && !tokens.includes(cleaned)) tokens.push(cleaned);
  };

  const prefecture = text.match(/^(愛知県|岐阜県|三重県|静岡県)/)?.[1];
  add(prefecture);

  const withoutPrefecture = text.replace(/^(愛知県|岐阜県|三重県|静岡県)/, "");
  const unitMatches = withoutPrefecture.match(/[^0-9０-９丁目番地号\-ー、,]+?(?:市|区|町|村)/g) || [];
  unitMatches.forEach(add);
  if (unitMatches.length >= 2) add(`${unitMatches[0]}${unitMatches[1]}`);

  const shortArea = withoutPrefecture.replace(/[0-9０-９丁目番地号\-ー].*$/, "").slice(0, 12);
  add(shortArea);

  return tokens.slice(0, 8);
}

function loadLocationPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCATION_STORAGE_KEY) || "{}");
    const lat = toFiniteNumber(saved.lat);
    const lng = toFiniteNumber(saved.lng);
    const address = String(saved.address || "").trim();
    userLocation = {
      source: hasCoordinates({ lat, lng }) ? "gps" : address ? "address" : "none",
      lat,
      lng,
      address,
      areaTokens: extractAreaTokens(address)
    };
  } catch {
    userLocation = { source: "none", lat: null, lng: null, address: "", areaTokens: [] };
  }
}

function saveLocationPrefs() {
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
    source: userLocation.source,
    lat: userLocation.lat,
    lng: userLocation.lng,
    address: userLocation.address
  }));
}

function clearLocationPrefs() {
  localStorage.removeItem(LOCATION_STORAGE_KEY);
  userLocation = { source: "none", lat: null, lng: null, address: "", areaTokens: [] };
  locationMessage = "現在地設定を消しました。";
  updateLocationUi();
  rerenderCurrentSearch();
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return "距離未設定";
  if (meters < 1000) return `約${Math.max(10, Math.round(meters / 10) * 10)}m`;
  const digits = meters < 10000 ? 1 : 0;
  return `約${(meters / 1000).toFixed(digits)}km`;
}

function normalizeTimeText(value) {
  return String(value || "")
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replaceAll("：", ":")
    .replace(/[〜～―–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function parseClock(value, fallbackMeridiem = "") {
  const source = normalizeTimeText(value);
  const meridiem = /午後|PM/i.test(source) ? "pm" : /午前|AM/i.test(source) ? "am" : fallbackMeridiem;
  const match = source.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (hour > 24 || minute > 59) return null;
  return hour * 60 + minute;
}

function formatMinutes(minutes) {
  const safeMinutes = Math.max(0, Math.min(24 * 60, minutes));
  const hour = Math.floor(safeMinutes / 60);
  const minute = safeMinutes % 60;
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

function extractTimeRanges(value) {
  const text = normalizeTimeText(value);
  if (!text || text === "未確認") return [];
  const ranges = [];
  const pattern = /((?:午前|午後|AM|PM)?\s*\d{1,2}:\d{2})\s*(?:-|から)\s*((?:午前|午後|AM|PM)?\s*\d{1,2}:\d{2})/gi;
  let match;

  while ((match = pattern.exec(text)) && ranges.length < 6) {
    const startSource = match[1];
    const endSource = match[2];
    const fallback = /午後|PM/i.test(startSource) ? "pm" : /午前|AM/i.test(startSource) ? "am" : "";
    const start = parseClock(startSource);
    const end = parseClock(endSource, fallback);
    if (start !== null && end !== null && end > start && end - start <= 12 * 60) {
      const key = `${start}-${end}`;
      if (!ranges.some((range) => range.key === key)) {
        ranges.push({ start, end, key, label: `${formatMinutes(start)}-${formatMinutes(end)}` });
      }
    }
  }

  return ranges;
}

function getJapaneseDay(date = new Date()) {
  return ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
}

function getClosedHint(holiday, date = new Date()) {
  const text = String(holiday || "");
  const day = getJapaneseDay(date);
  if (!text || text === "未確認") return { closed: false, partial: false };
  const closedAllDay = new RegExp(`${day}(曜日|曜)(?!午後|午前)`).test(text)
    || (day === "日" && /日曜|日曜日/.test(text))
    || (day === "土" && /土曜休|土曜日休/.test(text));
  const partial = new RegExp(`${day}(曜日|曜)?(午前|午後)`).test(text);
  return { closed: closedAllDay, partial };
}

function getHoursLine(hours) {
  const ranges = extractTimeRanges(hours);
  if (ranges.length) return ranges.slice(0, 3).map((range) => range.label).join(" / ");
  return compactDisplay(hours, 72);
}

function analyzeClinicHours(clinic, date = new Date()) {
  const hours = displayValue(clinic.hours);
  const holiday = displayValue(clinic.holiday);
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const ranges = extractTimeRanges(hours);
  const closedHint = getClosedHint(holiday, date);
  const imageOnly = /画像のみ|要OCR|はい/.test(`${hours} ${clinic.timeImageOnly || ""}`);
  const unknown = !hours || hours === "未確認";
  const knownHours = !unknown && hours !== "時間未確認";
  const inRange = !closedHint.closed && ranges.some((range) => nowMinutes >= range.start && nowMinutes < range.end);
  const nextRange = ranges.find((range) => nowMinutes < range.start);
  const finished = ranges.length > 0 && !inRange && !nextRange;

  if (closedHint.closed) {
    return {
      className: "closed",
      label: "本日休診の可能性",
      today: "休診日記載に該当",
      holiday: compactDisplay(holiday, 72),
      note: "要確認",
      priority: 0,
      sortBucket: 0
    };
  }
  if (inRange) {
    return {
      className: "open",
      label: "今開いている可能性",
      today: getHoursLine(hours),
      holiday: compactDisplay(holiday, 72),
      note: imageOnly ? "画像由来" : "目安",
      priority: 80,
      sortBucket: 3
    };
  }
  if (nextRange) {
    return {
      className: "soon",
      label: `${formatMinutes(nextRange.start)}からの可能性`,
      today: getHoursLine(hours),
      holiday: compactDisplay(holiday, 72),
      note: closedHint.partial || imageOnly ? "要確認" : "目安",
      priority: 58,
      sortBucket: 2
    };
  }
  if (finished) {
    return {
      className: "closed",
      label: "本日の受付終了かも",
      today: getHoursLine(hours),
      holiday: compactDisplay(holiday, 72),
      note: imageOnly ? "画像由来" : "目安",
      priority: 18,
      sortBucket: 0
    };
  }
  if (knownHours || clinic.statusClass === "open") {
    return {
      className: "known",
      label: "診療時間あり",
      today: getHoursLine(hours),
      holiday: compactDisplay(holiday, 72),
      note: imageOnly ? "画像由来・要確認" : "要確認",
      priority: 36,
      sortBucket: 1
    };
  }

  return {
    className: "unknown",
    label: "時間要確認",
    today: "未確認",
    holiday: compactDisplay(holiday, 72),
    note: "要確認",
    priority: 4,
    sortBucket: 0
  };
}

function shortAvailabilityLabel(availability) {
  const label = String(availability?.label || "");
  const nextStart = label.match(/(\d{1,2}:\d{2})から/)?.[1];
  if (availability?.className === "open") return "今行けるかも";
  if (nextStart) return `${nextStart}から`;
  if (label.includes("休診")) return "今日は休みかも";
  if (label.includes("終了")) return "受付終了かも";
  if (availability?.className === "known") return "時間あり";
  return "要確認";
}

function haversineMeters(fromLat, fromLng, toLat, toLng) {
  const radius = 6371000;
  const toRadians = (degree) => degree * Math.PI / 180;
  const deltaLat = toRadians(toLat - fromLat);
  const deltaLng = toRadians(toLng - fromLng);
  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) *
    Math.sin(deltaLng / 2) ** 2;
  return Math.round(radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function inferAddressFromCoordinates(lat, lng) {
  if (!hasCoordinates({ lat, lng })) return "";
  const nearest = tokaiAreaCenters
    .map((area) => ({ ...area, meters: haversineMeters(lat, lng, area.lat, area.lng) }))
    .sort((a, b) => a.meters - b.meters)[0];
  return nearest && nearest.meters <= 70000 ? nearest.label : "";
}

function normalizeReverseGeocodeAddress(payload) {
  const address = payload?.address || {};
  const state = address.state || "";
  const city = address.city || address.town || address.village || address.county || "";
  const ward = address.city_district || address.suburb || address.ward || "";
  const parts = [state, city, ward]
    .map((part) => String(part || "").replace(/ Prefecture$/i, "県").trim())
    .filter(Boolean);
  const text = parts.join("");
  return /愛知|岐阜|三重|静岡|名古屋|犬山|岐阜|津|静岡|浜松/.test(text) ? text : "";
}

async function reverseGeocodeLocation(lat, lng) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("zoom", "12");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "ja");
    const response = await fetch(url.href, { cache: "no-store" });
    if (!response.ok) return "";
    const payload = await response.json().catch(() => null);
    return normalizeReverseGeocodeAddress(payload);
  } catch {
    return "";
  }
}

function areaTokenWeight(token) {
  if (/県$/.test(token)) return 4;
  if (/市.+区$/.test(token)) return 26;
  if (/[市区町村]$/.test(token)) return 18;
  return 8;
}

function inferAreaCenterFromAddress(address) {
  const tokens = extractAreaTokens(address);
  if (!tokens.length) return null;
  const candidates = tokaiAreaCenters
    .map((area) => {
      const score = tokens
        .filter((token) => area.label.includes(token))
        .reduce((sum, token) => sum + areaTokenWeight(token), 0);
      return { ...area, score };
    })
    .filter((area) => area.score >= 18)
    .sort((a, b) => b.score - a.score || b.label.length - a.label.length);
  return candidates[0] || null;
}

function computeProximity(clinic) {
  const gpsReady = hasCoordinates(userLocation);
  const clinicHasCoordinates = hasCoordinates(clinic);
  if (gpsReady && clinicHasCoordinates) {
    const meters = haversineMeters(userLocation.lat, userLocation.lng, clinic.lat, clinic.lng);
    return {
      source: "gps",
      label: formatDistance(meters),
      distanceMeters: meters,
      point: Math.max(0, 38 - Math.round(meters / 250)),
      matchedArea: ""
    };
  }

  const addressText = String(clinic.address || "");
  if (gpsReady) {
    const areaCenter = inferAreaCenterFromAddress(addressText);
    if (areaCenter) {
      const meters = haversineMeters(userLocation.lat, userLocation.lng, areaCenter.lat, areaCenter.lng);
      return {
        source: "area-distance",
        label: `${formatDistance(meters)}目安`,
        distanceMeters: meters,
        point: Math.max(0, 30 - Math.round(meters / 800)),
        matchedArea: areaCenter.label.replace(/^(愛知県|岐阜県|三重県|静岡県)/, "")
      };
    }
  }

  const matchedTokens = userLocation.areaTokens.filter((token) => addressText.includes(token));
  if (matchedTokens.length) {
    const point = Math.min(34, matchedTokens.reduce((sum, token) => sum + areaTokenWeight(token), 0));
    const bestToken = matchedTokens
      .slice()
      .sort((a, b) => areaTokenWeight(b) - areaTokenWeight(a) || b.length - a.length)[0];
    return {
      source: "address",
      label: `${bestToken}周辺`,
      distanceMeters: null,
      point,
      matchedArea: bestToken
    };
  }

  if (!gpsReady && Number.isFinite(clinic.distanceMeters)) {
    return {
      source: "preset",
      label: clinic.distance,
      distanceMeters: clinic.distanceMeters,
      point: Math.max(0, 30 - Math.round(clinic.distanceMeters / 30)),
      matchedArea: ""
    };
  }

  return {
    source: gpsReady ? "gps-waiting" : "none",
    label: clinic.distance,
    distanceMeters: Number.isFinite(clinic.distanceMeters) ? clinic.distanceMeters : null,
    point: 0,
    matchedArea: ""
  };
}

function hasAnyFacilityCoordinates() {
  return clinics.some(hasCoordinates);
}

function locationShortLabel() {
  if (locationBusy) return "GPS取得中";
  if (hasCoordinates(userLocation) && userLocation.address) return `GPS + ${userLocation.address}`;
  if (hasCoordinates(userLocation)) return "GPS現在地";
  if (userLocation.address) return `${userLocation.address} 周辺`;
  return "未設定";
}

function locationStatusLabel() {
  if (locationBusy) return "現在地を取得しています。";
  if (locationMessage) return locationMessage;
  if (hasCoordinates(userLocation) && userLocation.address) {
    return "GPS取得済み。施設座標がある場合は実距離、無い場合は住所エリアから目安距離を表示します。";
  }
  if (hasCoordinates(userLocation)) {
    return "GPS取得済み。施設座標がある場合は実距離、無い場合は住所エリアから目安距離を表示します。";
  }
  if (userLocation.address) {
    return "保存住所で近さを補正しています。";
  }
  return "未設定です。GPSを許可するか、住所を保存してください。";
}

function getSortSummary() {
  return "科目 → 今空き → 近さ";
}

function getDisplayVersion() {
  const urlVersion = new URLSearchParams(window.location.search).get("v");
  if (urlVersion) return urlVersion.slice(0, 24);
  const appScript = [...document.scripts].find((script) => script.src.includes("app.js"));
  if (!appScript?.src) return "local";
  try {
    return new URL(appScript.src).searchParams.get("v") || "local";
  } catch {
    return "local";
  }
}

function updateVersionLabels() {
  const label = `Ver ${getDisplayVersion()}`;
  document.querySelectorAll("[data-version-label]").forEach((element) => {
    element.textContent = label;
  });
}

function updateLocationUi() {
  const chip = document.querySelector("#location-chip");
  const status = document.querySelector("#location-status");
  const addressInput = document.querySelector("#fallback-address");
  const label = locationShortLabel();

  if (chip) {
    chip.classList.toggle("is-active", label !== "未設定" && label !== "GPS取得中");
    chip.innerHTML = `<span>近さ</span><strong>${escapeHtml(label)}</strong>`;
  }
  if (status) status.textContent = locationStatusLabel();
  if (addressInput && document.activeElement !== addressInput) {
    addressInput.value = userLocation.address;
  }
}

function canUseGeolocation() {
  const localHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  return Boolean(navigator.geolocation) && (window.isSecureContext || localHost);
}

function requestPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 60000
    });
  });
}

async function requestCurrentLocation(options = {}) {
  if (!canUseGeolocation()) {
    locationMessage = "この環境ではGPSを使えません。代替住所を保存してください。";
    updateLocationUi();
    return false;
  }

  locationBusy = true;
  locationMessage = "";
  updateLocationUi();

  try {
    const position = await requestPosition();
	    const lat = toFiniteNumber(position.coords.latitude);
	    const lng = toFiniteNumber(position.coords.longitude);
	    if (!hasCoordinates({ lat, lng })) throw new Error("invalid_position");
	    const previousAddress = userLocation.address;
	    const inferredAddress = previousAddress
	      || await reverseGeocodeLocation(lat, lng)
	      || inferAddressFromCoordinates(lat, lng);

	    userLocation = {
	      source: "gps",
	      lat,
	      lng,
	      address: inferredAddress,
	      areaTokens: extractAreaTokens(inferredAddress)
	    };
	    saveLocationPrefs();
	    if (hasAnyFacilityCoordinates()) {
	      locationMessage = "GPS取得済み。施設座標がある候補は実距離で表示します。";
	    } else if (userLocation.areaTokens.length) {
	      locationMessage = "GPS取得済み。施設住所の地域から目安距離を表示します。";
	    } else {
	      locationMessage = "GPS取得済み。近さを出すには住所設定が必要です。";
	    }
    return true;
  } catch {
    locationMessage = "GPSを取得できませんでした。代替住所を保存してください。";
    return false;
  } finally {
    locationBusy = false;
    updateLocationUi();
    if (options.rerender !== false) rerenderCurrentSearch();
  }
}

function saveFallbackAddress() {
  const addressInput = document.querySelector("#fallback-address");
  const address = String(addressInput?.value || "").trim();
  if (!address) {
    locationMessage = "住所が空です。例: 愛知県犬山市 のように入力してください。";
    updateLocationUi();
    return;
  }

  userLocation = {
    source: hasCoordinates(userLocation) ? "gps" : "address",
    lat: userLocation.lat,
    lng: userLocation.lng,
    address,
    areaTokens: extractAreaTokens(address)
  };
  saveLocationPrefs();
  locationMessage = "住所を保存しました。GPSが使えない時はこの住所で近さを補正します。";
  updateLocationUi();
  rerenderCurrentSearch();
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
  const matchedDepartments = Array.isArray(item.matchedDepartments)
    ? item.matchedDepartments.filter(Boolean)
    : [];
  const normalized = {
    id: displayValue(item.id, `facility-${index}`),
    name: displayValue(item.name, "施設名未確認"),
    status: displayValue(item.status, "要確認"),
    statusClass: displayValue(item.statusClass, "closed"),
    until: displayValue(item.until, "時間未確認"),
    departments: displayValue(item.departments, "診療科目未確認"),
    departmentList,
    matchedDepartments,
    address: displayValue(item.address),
    station: displayValue(item.station, "最寄り未確認"),
    distance: displayValue(item.distance, "距離未設定"),
    distanceMeters: toFiniteNumber(item.distanceMeters),
    proximitySource: displayValue(item.proximitySource, ""),
    matchedArea: displayValue(item.matchedArea, ""),
    lat: toFiniteNumber(item.lat ?? item.latitude),
    lng: toFiniteNumber(item.lng ?? item.lon ?? item.longitude),
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
    qualityScore: Number.isFinite(item.qualityScore) ? item.qualityScore : 0,
    match: Number.isFinite(item.match) ? item.match : 0,
    rank: Number.isFinite(item.rank) ? item.rank : 0,
    availabilitySort: Number.isFinite(item.availabilitySort) ? item.availabilitySort : 0,
    departmentScore: Number.isFinite(item.departmentScore) ? item.departmentScore : 0,
    proximityPoint: Number.isFinite(item.proximityPoint) ? item.proximityPoint : 0
  };
  normalized.keywords = Array.isArray(item.keywords) && item.keywords.length
    ? item.keywords
    : buildFacilityKeywords(normalized);
  return normalized;
}

function applyDisplayProximity(clinic) {
  const proximity = computeProximity(clinic);
  if (!["gps", "area-distance", "address", "preset"].includes(proximity.source)) return clinic;
  return {
    ...clinic,
    distance: proximity.label,
    distanceMeters: proximity.distanceMeters,
    proximitySource: proximity.source,
    matchedArea: proximity.matchedArea,
    proximityPoint: Math.max(clinic.proximityPoint || 0, proximity.point || 0)
  };
}

async function loadFacilityData() {
  if (await isServerDatabaseConfigured()) {
    clinics = fallbackClinics.map(normalizeFacility);
    return;
  }

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
  const matchedDepartments = departments.filter((department) => (
    clinic.departmentList.includes(department) || clinic.departments.includes(department)
  ));
  const keywordMatches = clinic.keywords.filter((keyword) => query.includes(keyword)).length;
  const guideKeywordMatches = guideKeywords.filter((keyword) => (
    text.includes(keyword) ||
    clinic.keywords.some((localKeyword) => localKeyword.includes(keyword) || keyword.includes(localKeyword))
  )).length;
  const keywordHit = keywordMatches > 0 || guideKeywordMatches > 0 || (query && text.includes(query));
  const childIntentPoint = /子ども|子供|こども|幼児|赤ちゃん/.test(query) && clinic.keywords.includes("子ども") ? 18 : 0;
  const specialtyPoint = childIntentPoint && clinic.departmentList[0]?.includes("小児") ? 24 : 0;
  const proximity = computeProximity(clinic);
  const availability = analyzeClinicHours(clinic);
  const distancePoint = proximity.point;
  const exactPoint = query && text.includes(query) ? 18 : 0;
  const departmentPoint = Math.min(38, departmentMatches * 22);
  const keywordPoint = Math.min(36, keywordMatches * 12 + guideKeywordMatches * 10 + (keywordHit ? 8 : 0));
  const hasActiveLocation = hasCoordinates(userLocation) || userLocation.areaTokens.length > 0;
  const locationPoint = mode === "location" ? (hasActiveLocation ? 24 : 18) : 0;
  const qualityPoint = Math.min(28, Math.round((clinic.qualityScore || 0) / 3));
  const match = mode === "location"
    ? Math.min(98, 42 + Math.round(distancePoint * 0.75) + qualityPoint)
    : Math.min(98, 32 + departmentPoint + keywordPoint + exactPoint + childIntentPoint + Math.round(qualityPoint * 0.35));
  const rank = availability.priority + match + departmentPoint + keywordPoint + distancePoint + locationPoint + specialtyPoint + qualityPoint;

  return {
    ...clinic,
    distance: proximity.label,
    distanceMeters: proximity.distanceMeters,
    proximitySource: proximity.source,
    matchedArea: proximity.matchedArea,
    availability,
    availabilitySort: availability.sortBucket,
    departmentScore: departmentPoint + keywordPoint + exactPoint + childIntentPoint + specialtyPoint,
    proximityPoint: distancePoint,
    matchedDepartments,
    match,
    rank
  };
}

function compareScoredClinics(a, b) {
  if ((b.departmentScore || 0) !== (a.departmentScore || 0)) {
    return (b.departmentScore || 0) - (a.departmentScore || 0);
  }
  if ((b.availabilitySort || 0) !== (a.availabilitySort || 0)) {
    return (b.availabilitySort || 0) - (a.availabilitySort || 0);
  }
  if ((b.proximityPoint || 0) !== (a.proximityPoint || 0)) {
    return (b.proximityPoint || 0) - (a.proximityPoint || 0);
  }
  if (Number.isFinite(a.distanceMeters) || Number.isFinite(b.distanceMeters)) {
    return (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER);
  }
  return b.rank - a.rank
    || (b.qualityScore || 0) - (a.qualityScore || 0)
    || String(a.name).localeCompare(String(b.name), "ja");
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
        .sort((a, b) => compareScoredClinics(a, b, "location"))
        .slice(0, RESULT_LIMIT)
    };
  }

  const departments = aiGuide.departments.length ? aiGuide.departments : departmentResult.departments;
  const scored = clinics
    .map((clinic) => scoreClinic(clinic, query, departments, mode, aiGuide.keywords))
    .sort((a, b) => compareScoredClinics(a, b, mode))
    .slice(0, RESULT_LIMIT);

  return {
    type: "normal",
    departments,
    items: scored
  };
}

function buildRankText(clinic, index) {
  return `#${index + 1}`;
}

function prioritizedDepartments(clinic) {
  const matched = Array.isArray(clinic.matchedDepartments) ? clinic.matchedDepartments.filter(Boolean) : [];
  const all = Array.isArray(clinic.departmentList) && clinic.departmentList.length
    ? clinic.departmentList
    : String(clinic.departments || "").split(/[、,・]/).map((item) => item.trim()).filter(Boolean);
  return uniqueItems([...matched, ...all], 12);
}

function resultDepartmentText(clinic) {
  const departments = prioritizedDepartments(clinic);
  return departments.length ? departments.join("、") : displayValue(clinic.departments, "診療科目未確認");
}

function isGeneralHospital(clinic) {
  const name = String(clinic.name || "");
  const departments = prioritizedDepartments(clinic);
  return name.includes("総合病院") || (/病院/.test(name) && departments.length >= 5);
}

function departmentIconFor(department) {
  const text = String(department || "");
  if (/救急/.test(text)) return { kind: "emergency", label: "救急" };
  if (/小児/.test(text)) return { kind: "pediatrics", label: "小児" };
  if (/歯|口腔|矯正|インプラント|ホワイトニング/.test(text)) return { kind: "dental", label: "歯科" };
  if (/リハビリ/.test(text)) return { kind: "rehab", label: "リハ" };
  if (/整形|リウマチ|骨|接骨|捻挫|打撲|脱臼|挫傷|交通事故/.test(text)) return { kind: "orthopedic", label: "整形" };
  if (/皮膚|皮フ|美容皮膚|形成/.test(text)) return { kind: "skin", label: "皮膚" };
  if (/眼|目/.test(text)) return { kind: "eye", label: "眼科" };
  if (/耳鼻|咽喉|耳|鼻/.test(text)) return { kind: "ent", label: "耳鼻" };
  if (/産|婦人/.test(text)) return { kind: "obgyn", label: "婦人" };
  if (/心療|精神/.test(text)) return { kind: "mental", label: "心療" };
  if (/泌尿|腎|尿/.test(text)) return { kind: "urology", label: "泌尿" };
  if (/循環|心臓/.test(text)) return { kind: "cardio", label: "循環" };
  if (/消化|胃腸|肝臓|内視鏡/.test(text)) return { kind: "gastro", label: "消化" };
  if (/外科|肛門|乳腺|血管|脳神経外科/.test(text)) return { kind: "surgery", label: "外科" };
  if (/鍼|灸|はり|マッサージ|整体/.test(text)) return { kind: "therapy", label: "施術" };
  if (/動物|犬|猫/.test(text)) return { kind: "animal", label: "動物" };
  if (/内科|呼吸|糖尿|内分泌|血液|漢方|神経|人工透析|老年/.test(text)) return { kind: "internal", label: "内科" };
  return { kind: "other", label: compactDisplay(text || "科目", 4) };
}

function departmentIconItems(clinic, limit = 4) {
  const items = [];
  const seen = new Set();
  const add = (item, title = item.label) => {
    if (!item?.kind || seen.has(item.kind)) return;
    seen.add(item.kind);
    items.push({ ...item, title });
  };

  if (isGeneralHospital(clinic)) add({ kind: "general", label: "総合病院" }, "総合病院");
  prioritizedDepartments(clinic).forEach((department) => add(departmentIconFor(department), department));
  if (!items.length) add({ kind: "other", label: "科目" }, "診療科目");

  const visible = items.slice(0, limit);
  const omitted = Math.max(0, items.length - visible.length);
  return { visible, omitted };
}

function departmentSymbol(kind) {
  const common = 'viewBox="0 0 48 48" aria-hidden="true" focusable="false"';
  const icons = {
    general: `<svg ${common}><rect x="11" y="12" width="26" height="27" rx="4"/><path d="M19 39V27h10v12M18 20h12M24 14v12M16 28h3M29 28h3M16 34h3M29 34h3"/></svg>`,
    internal: `<svg ${common}><path d="M24 37s-13-7.6-13-18.2c0-5 6.1-7.3 10.1-3.5L24 18l2.9-2.7c4-3.8 10.1-1.5 10.1 3.5C37 29.4 24 37 24 37Z"/><path d="M13 31c4-2 7-1.3 9 2 2.7-5 6.7-6.5 12-4"/></svg>`,
    pediatrics: `<svg ${common}><circle cx="24" cy="24" r="13"/><path d="M17 21c2-4 6-5 11-5M18.5 27h.1M29.5 27h.1M19 32c3 2.2 7 2.2 10 0"/></svg>`,
    dental: `<svg ${common}><path d="M15 16c2.8-5 7.2-3.4 9-1.8 1.8-1.6 6.2-3.2 9 1.8 2.7 4.8-.9 20.7-6.2 20.7-2.1 0-1.7-7.4-2.8-7.4s-.7 7.4-2.8 7.4C15.9 36.7 12.3 20.8 15 16Z"/><path d="M33 10l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5Z"/></svg>`,
    orthopedic: `<svg ${common}><path d="M16 15c-2-2-5-1.8-6.4.1-1.4 2-.6 4.5 1.7 5.5L27.4 36.7c1 2.3 3.5 3.1 5.5 1.7 1.9-1.4 2.1-4.4.1-6.4 2 2 5 1.8 6.4-.1 1.4-2 .6-4.5-1.7-5.5L21.6 10.3c-1-2.3-3.5-3.1-5.5-1.7-1.9 1.4-2.1 4.4-.1 6.4Z"/></svg>`,
    skin: `<svg ${common}><rect x="12" y="16" width="24" height="18" rx="7"/><path d="M24 16c4 4 3.5 9-1 12"/><circle cx="18" cy="23" r="1.1"/><circle cx="30" cy="27" r="1.1"/><path d="M35 11l1.4 2.8 2.8 1.4-2.8 1.4L35 19.4l-1.4-2.8-2.8-1.4 2.8-1.4Z"/></svg>`,
    eye: `<svg ${common}><path d="M8 24s6-10 16-10 16 10 16 10-6 10-16 10S8 24 8 24Z"/><circle cx="24" cy="24" r="5"/><path d="M17 11l2 4M31 11l-2 4"/></svg>`,
    ent: `<svg ${common}><path d="M25 14c-5.5 0-9 3.4-9 8.2 0 6.2 7.7 6.3 7.7 11.4 0 2.7-2 4.4-4.8 4.4"/><path d="M25 20c3 0 4.8 1.8 4.8 4.3 0 3.2-3.2 4.2-5 6.6M33 17c2.5 2.2 4 5 4 8.2M12 15c-2 2-3 4.4-3 7"/></svg>`,
    obgyn: `<svg ${common}><path d="M24 12c6 0 10 4.5 10 10 0 7-10 14-10 14S14 29 14 22c0-5.5 4-10 10-10Z"/><path d="M20 24c2.6 2.5 5.4 2.5 8 0M35 33c3-.8 5-3 5-6"/></svg>`,
    mental: `<svg ${common}><path d="M16 29c-4.3 0-7-2.5-7-6 0-3 2.3-5.4 5.4-5.8C15.8 13.7 19.2 12 23 13c2.3-2.2 6.4-1.6 8.2 1.2 4.3.2 7.8 3.4 7.8 7.4 0 4.3-3.4 7.4-8 7.4H16Z"/><path d="M18 34c3.8 3 8.2 3 12 0"/></svg>`,
    urology: `<svg ${common}><path d="M24 9s10 11 10 18.2C34 33.3 29.7 38 24 38s-10-4.7-10-10.8C14 20 24 9 24 9Z"/><path d="M19 28c2.7 2.3 7.3 2.3 10 0"/></svg>`,
    surgery: `<svg ${common}><path d="M13 35l20-20c2-2 5-1 6 1l-25 25c-2-1-3-4-1-6Z"/><path d="M10 41h20M31 13l4 4"/></svg>`,
    cardio: `<svg ${common}><path d="M24 37s-12-7.5-12-17.2c0-5 5.8-7.1 9.6-3.4L24 18.8l2.4-2.4c3.8-3.7 9.6-1.6 9.6 3.4C36 29.5 24 37 24 37Z"/><path d="M11 26h7l2.3-5 4.4 10 2.8-5H37"/></svg>`,
    gastro: `<svg ${common}><path d="M24 9c6.5 4 8 7.8 5 12.2-2 2.9.4 5.3 3.4 6.2 3.4 1 4.1 6.6-1.3 9.2-7.6 3.6-15.9-.6-15.9-8.3 0-4.5 3.9-7 3.9-10.2 0-3.5-2.5-5.5-1.2-8.3"/><path d="M23 28c1.8 1.5 4.1 1.5 6 0"/></svg>`,
    emergency: `<svg ${common}><rect x="11" y="12" width="26" height="24" rx="6"/><path d="M24 18v12M18 24h12"/></svg>`,
    therapy: `<svg ${common}><path d="M33 11L14 30M26 18l4 4M13 35h22M18 27l5 5"/></svg>`,
    animal: `<svg ${common}><circle cx="17" cy="19" r="3"/><circle cx="25" cy="16" r="3"/><circle cx="33" cy="19" r="3"/><circle cx="21" cy="27" r="3"/><path d="M27 27c5 0 9 3.5 9 7.5 0 3-2.4 4.5-5.3 3.2-3.2-1.5-5.2-1.5-8.4 0C19.4 39 17 37.5 17 34.5c0-4 4-7.5 10-7.5Z"/></svg>`,
    other: `<svg ${common}><path d="M24 9l3.5 8 8.5 1.2-6.2 5.9 1.5 8.4L24 28.4l-7.3 4.1 1.5-8.4-6.2-5.9 8.5-1.2Z"/></svg>`
  };
  return icons[kind] || icons.other;
}

function renderDepartmentIcons(clinic, options = {}) {
  const { visible, omitted } = departmentIconItems(clinic, options.limit || 4);
  return `
    <div class="department-icon-row ${options.detail ? "detail-department-icons" : ""}" aria-label="診療科目アイコン">
      ${visible.map((item) => `
        <span class="department-icon-chip dept-${escapeHtml(item.kind)}" title="${escapeHtml(item.title)}" aria-label="${escapeHtml(item.title)}">
          <span class="department-symbol">${departmentSymbol(item.kind)}</span>
          <span class="department-icon-label">${escapeHtml(item.label)}</span>
        </span>
      `).join("")}
      ${omitted ? `<span class="department-icon-chip dept-more" aria-label="ほか${omitted}科目"><span class="department-icon-label">+${omitted}</span></span>` : ""}
    </div>
  `;
}

function displayDistanceLabel(clinic) {
  if (clinic.proximitySource === "gps") return clinic.distance;
  if (clinic.proximitySource === "area-distance") return clinic.distance;
  if (clinic.proximitySource === "address" || clinic.matchedArea) return clinic.distance;
  if (Number.isFinite(clinic.distanceMeters)) return clinic.distance;
  return hasCoordinates(userLocation) ? "位置未設定" : "地域未設定";
}

function renderResultMetrics(clinic) {
  const availability = clinic.availability || analyzeClinicHours(clinic);
  const distance = displayDistanceLabel(clinic);
  const department = compactDisplay(prioritizedDepartments(clinic)[0] || clinic.departments, 14);
  return `
    <div class="result-metrics" aria-label="候補の目安">
      <div class="result-metric metric-open ${escapeHtml(availability.className)}">
        <span>今</span><strong>${escapeHtml(shortAvailabilityLabel(availability))}</strong>
      </div>
      <div class="result-metric metric-near">
        <span>近さ</span><strong>${escapeHtml(distance)}</strong>
      </div>
      <div class="result-metric metric-match">
        <span>合致</span><strong>${escapeHtml(String(clinic.match))}% / ${escapeHtml(department)}</strong>
      </div>
    </div>
  `;
}

function renderHoursPanel(clinic, compact = false) {
  const availability = clinic.availability || analyzeClinicHours(clinic);
  const today = compact ? compactDisplay(availability.today, 58) : availability.today;
  if (compact) {
    return `
      <div class="hours-strip ${escapeHtml(availability.className)}">
        <span>今日</span><strong>${escapeHtml(today)}</strong>
        <span>休み</span><strong>${escapeHtml(compactDisplay(availability.holiday, 44))}</strong>
      </div>
    `;
  }
  return `
    <div class="hours-panel ${escapeHtml(availability.className)}">
      <div class="hours-head">
        <span class="metric-icon icon-open" aria-hidden="true"></span>
        <strong>${escapeHtml(shortAvailabilityLabel(availability))}</strong>
        <em>${escapeHtml(availability.note)}</em>
      </div>
      <div class="hours-mini-table">
        <div><span>今日</span><strong>${escapeHtml(today)}</strong></div>
        <div><span>休み</span><strong>${escapeHtml(compactDisplay(availability.holiday, compact ? 44 : 120))}</strong></div>
      </div>
    </div>
  `;
}

function renderClinics(items = currentResults) {
  const list = document.querySelector("#clinic-list");
  if (!list) return;
  const results = items.length ? items : searchClinics("現在地", "location").items;
  currentResults = results;
  hideDetail();
  list.innerHTML = results.map((clinic, index) => {
    const phoneHref = clinic.phone ? `tel:${clinic.phone.replace(/[^\d+]/g, "")}` : "";
    const rankText = buildRankText(clinic, index);
    return `
	      <article class="result-card">
	        <div class="result-rank">${rankText}</div>
	        <div class="result-top">
	          <div>
            <h3>${escapeHtml(clinic.name)}</h3>
	            <p class="department-text">${escapeHtml(resultDepartmentText(clinic))}</p>
              ${renderDepartmentIcons(clinic)}
	          </div>
	        </div>
	        ${renderResultMetrics(clinic)}
        <ul class="result-facts">
          <li><strong>住所</strong><span>${escapeHtml(clinic.address)}</span></li>
        </ul>
        ${renderHoursPanel(clinic, true)}
        <div class="result-actions">
          <a class="generated-action action-phone primary ${phoneHref ? "" : "disabled"}" href="${phoneHref || "#detail"}" aria-label="電話" title="電話"><span>電話</span></a>
          <a class="generated-action action-detail" href="#detail" data-detail-id="${escapeHtml(clinic.id)}" aria-label="詳細" title="詳細"><span>詳細</span></a>
        </div>
      </article>
    `;
  }).join("");
}

function hideDetail() {
  const detail = document.querySelector("#detail");
  if (detail) detail.hidden = true;
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
  const detail = document.querySelector("#detail");
  const heading = document.querySelector("#detail-heading");
  const copy = document.querySelector("#detail-copy");
  const overview = document.querySelector("#detail-overview-grid");
  const statusRow = document.querySelector("#detail-status-row");
  const name = document.querySelector("#detail-name");
  const meta = document.querySelector("#detail-meta");
  const detailIcons = document.querySelector("#detail-department-icons");
  const fields = document.querySelector("#detail-fields");
  if (!heading || !overview || !statusRow || !name || !meta || !fields) return;
  if (detail) detail.hidden = false;
  const availability = clinic.availability || analyzeClinicHours(clinic);

  heading.textContent = clinic.name;
  if (copy) copy.textContent = "必要な項目だけ確認できます。";
  overview.innerHTML = `
    <article><strong>基本情報</strong><span>${escapeHtml(clinic.address)}<br>${escapeHtml(displayValue(clinic.phone))}</span></article>
    <article><strong>今の目安</strong><span>${escapeHtml(shortAvailabilityLabel(availability))}<br>${escapeHtml(availability.today)}<br>${escapeHtml(availability.note)}</span></article>
    <article><strong>対応状況</strong><span>救急: ${escapeHtml(clinic.emergencyCare)}<br>夜間: ${escapeHtml(clinic.nightCare)}<br>休日: ${escapeHtml(clinic.holidayCare)}</span></article>
  `;
  statusRow.innerHTML = `
    <span class="status ${escapeHtml(clinic.statusClass)}">${escapeHtml(clinic.status)}</span>
    <span class="status ${escapeHtml(availability.className)}">${escapeHtml(availability.label)}</span>
    <span>${escapeHtml(clinic.until)}</span>
    <span>${escapeHtml(clinic.verified)}</span>
    <span>抽出品質 ${escapeHtml(clinic.quality)}</span>
  `;
  name.textContent = clinic.name;
  meta.textContent = `${resultDepartmentText(clinic)} / ${clinic.address}`;
  if (detailIcons) detailIcons.innerHTML = renderDepartmentIcons(clinic, { detail: true, limit: 6 });
  fields.innerHTML = `
    ${renderHoursPanel(clinic, false)}
    <p><strong>近さ</strong><span>${escapeHtml(clinic.distance)}</span></p>
    <p><strong>住所</strong><span>${escapeHtml(clinic.address)}</span></p>
    <p><strong>電話</strong><span>${escapeHtml(displayValue(clinic.phone))}</span></p>
    <p><strong>診療科目</strong><span>${escapeHtml(clinic.departments)}</span></p>
    <p><strong>診療時間原文</strong><span>${escapeMultiline(clinic.hours)}</span></p>
    <p><strong>休診日原文</strong><span>${escapeMultiline(clinic.holiday)}</span></p>
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
  const copyNode = document.querySelector("#results-copy");
  if (copyNode) {
    copyNode.textContent = copy;
    copyNode.hidden = !copy;
  }
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
  const summary = aiGuide.summary || "細かい条件を選ばなくても、科目、今空き、近さの順で上から並べます。";
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
  return `「${query}」から、${departments}を候補にしました。科目、今空き、近さの順に並べています。`;
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

function canRequestServerSearch() {
  if (serverSearchDisabled) return false;
  if (!["http:", "https:"].includes(window.location.protocol)) return false;
  if (window.location.hostname.endsWith("github.io")) return false;
  return true;
}

async function isServerDatabaseConfigured() {
  if (!canRequestServerSearch()) return false;
  try {
    const apiUrl = new URL("api/health", window.location.href);
    const response = await fetch(apiUrl.href, { cache: "no-store" });
    const payload = await response.json().catch(() => null);
    if (payload?.databaseConfigured) return true;
  } catch {
    // Fall back to the bundled JSON when the server health check is unavailable.
  }
  serverSearchDisabled = true;
  return false;
}

async function requestServerSearch(query, options = {}) {
  if (!canRequestServerSearch()) return null;

  const apiUrl = new URL("api/search", window.location.href);
  const response = await fetch(apiUrl.href, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: query,
      mode: options.mode || "word",
      guide: options.guide || null,
      location: userLocation,
      limit: options.limit || RESULT_LIMIT
    })
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    if ([404, 405, 501, 503].includes(response.status) || payload?.code === "database_url_missing") {
      serverSearchDisabled = true;
    }
    return null;
  }

  const items = Array.isArray(payload.items)
    ? payload.items.map(normalizeFacility).map(applyDisplayProximity)
    : [];
  if (!items.length) return null;
  return {
    type: payload.type || "normal",
    departments: payload.query?.departments || [],
    items
  };
}

function renderConversationResult(text, result, options = {}) {
  const log = document.querySelector("#conversation-log");
  const guide = normalizeGuideFromApi(options.guide);
  const summaryLabel = guide.source === "gemini"
    ? getSortSummary()
    : options.pending
      ? "AI確認中"
      : getSortSummary();
  const copy = guide.source === "gemini"
    ? ""
    : options.pending
      ? "入力が止まってから整えます。"
      : "";
  renderDepartmentNote(result, text, guide, "#conversation-guide");
  renderClinics(result.items);
  updateResultHeader("候補", copy, summaryLabel);
  if (log) {
    log.textContent = `${text} ${summarizeAiGuide(text, result, guide)}${options.pending ? " 会話の内容を確認しています。" : ""}`;
  }
}

function runFuzzySearch(query, mode = "word") {
  const result = searchClinics(query, mode);
  renderDepartmentNote(result, query);
  renderClinics(result.items);
  const label = mode === "location" ? `${locationShortLabel()}に近い候補` : `「${query}」の候補`;
  const copy = mode === "location"
    ? ""
    : "";
  updateResultHeader(label, copy, getSortSummary());
  document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" });
}

function renderNearbyResults() {
  clearTimeout(aiIdleTimer);
  clearTimeout(searchIdleTimer);
  const result = searchClinics("現在地", "location");
  renderClinics(result.items);
  const hasGpsDistance = hasCoordinates(userLocation) && hasAnyFacilityCoordinates();
  const hasAddressFallback = userLocation.areaTokens.length > 0;
  const title = hasGpsDistance
    ? "近くの候補"
    : hasAddressFallback
      ? "近くの候補"
      : hasCoordinates(userLocation)
        ? "近くの候補"
        : "候補";
  const copy = hasGpsDistance
    ? ""
    : hasAddressFallback
      ? ""
      : "症状を入れると候補が変わります。";
  const summary = getSortSummary();
  updateResultHeader(title, copy, summary);
  const guidePanel = document.querySelector("#conversation-guide");
  if (guidePanel) guidePanel.innerHTML = "";
  const log = document.querySelector("#conversation-log");
  if (log) log.textContent = `${locationShortLabel()}を基準に表示しています。`;
  updateLocationUi();
  refreshNearbyResultsFromServer();
}

async function refreshNearbyResultsFromServer() {
  const requestId = ++aiRequestSeq;
  const serverResult = await requestServerSearch("現在地", { mode: "location", limit: RESULT_LIMIT }).catch(() => null);
  if (!serverResult || requestId !== aiRequestSeq) return;
  renderClinics(serverResult.items);
  const summary = getSortSummary();
  updateResultHeader(
    "近くの候補",
    "",
    summary
  );
}

function rerenderCurrentSearch() {
  const input = document.querySelector("#chat-input");
  updateConversation(input?.value || "");
}

async function refineConversationWithAi(text, requestId, localResult) {
  const cacheKey = normalizeAiCacheKey(text);
  if (!cacheKey) return;

  if (aiGuideCache.has(cacheKey)) {
    if (requestId !== aiRequestSeq) return;
    const guide = aiGuideCache.get(cacheKey);
    const result = await requestServerSearch(text, { mode: "word", guide }).catch(() => null)
      || searchClinics(text, "word", guide);
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
  const result = await requestServerSearch(text, { mode: "word", guide }).catch(() => null)
    || searchClinics(text, "word", guide);
  renderConversationResult(text, result, { guide });
}

async function updateConversation(query, options = {}) {
  const text = query.trim();
  const requestId = ++aiRequestSeq;
  clearTimeout(aiIdleTimer);
  clearTimeout(searchIdleTimer);

  if (!text) {
    renderNearbyResults();
    return;
  }

  const cacheKey = normalizeAiCacheKey(text);
  if (aiGuideCache.has(cacheKey)) {
    const guide = aiGuideCache.get(cacheKey);
    const result = await requestServerSearch(text, { mode: "word", guide }).catch(() => null)
      || searchClinics(text, "word", guide);
    if (requestId !== aiRequestSeq) return;
    renderConversationResult(text, result, { guide });
    return;
  }

  const shouldUseAi = canRequestAiGuide(text);
  const serverResult = await requestServerSearch(text, { mode: "word" }).catch(() => null);
  if (requestId !== aiRequestSeq) return;
  const localResult = serverResult || searchClinics(text, "word");
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

function renderSearchPending(query) {
  const text = query.trim();
  clearTimeout(aiIdleTimer);
  const guidePanel = document.querySelector("#conversation-guide");
  const log = document.querySelector("#conversation-log");
  if (guidePanel) guidePanel.innerHTML = "";

  if (!text) {
    updateResultHeader("近くの候補", "症状を入れると候補が変わります。", "今 / 近さ / マッチ度");
    if (log) log.textContent = "入力が止まってから候補を更新します。";
    return;
  }

  updateResultHeader("入力中", "少し待つと候補が変わります。", "約2秒後");
  if (log) log.textContent = `「${text}」の入力が止まってから候補を更新します。`;
}

function scheduleConversationUpdate(query) {
  const text = query.trim();
  clearTimeout(searchIdleTimer);
  clearTimeout(aiIdleTimer);
  aiRequestSeq += 1;

  if (!text) {
    renderNearbyResults();
    return;
  }

  renderSearchPending(text);
  searchIdleTimer = window.setTimeout(() => {
    updateConversation(text);
  }, SEARCH_IDLE_DELAY_MS);
}

function renderWordBranch() {
  const input = document.querySelector("#chat-input");
  if (!input || wordBranchBound) return;
  wordBranchBound = true;
  setupVoiceInput();
  let isComposing = false;

  input.addEventListener("compositionstart", () => {
    isComposing = true;
    renderSearchPending(input.value);
  });
  input.addEventListener("compositionend", () => {
    isComposing = false;
    scheduleConversationUpdate(input.value);
  });
  input.addEventListener("input", () => {
    if (!isComposing) scheduleConversationUpdate(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      clearTimeout(searchIdleTimer);
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
        <p>デモでは名古屋市千種区周辺として、科目、今空き、近さの順で候補を並べます。</p>
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
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  let isListening = false;
  let voiceSilenceTimer = 0;
  let voiceBaseText = "";
  let voiceFinalText = "";

  const setVoiceButtonState = (listening) => {
    voiceButton.classList.toggle("is-listening", listening);
    voiceButton.setAttribute("aria-pressed", listening ? "true" : "false");
    voiceButton.setAttribute("aria-label", listening ? "音声入力を停止" : "音声入力");
    voiceButton.title = listening ? "停止" : "音声入力";
    voiceButton.textContent = listening ? "停止" : "音声入力";
  };

  const clearVoiceSilenceTimer = () => {
    clearTimeout(voiceSilenceTimer);
    voiceSilenceTimer = 0;
  };

  const stopAfterSilence = () => {
    clearVoiceSilenceTimer();
    voiceSilenceTimer = window.setTimeout(() => {
      if (isListening) recognition.stop();
    }, VOICE_SILENCE_MS);
  };

  setVoiceButtonState(false);

  recognition.addEventListener("start", () => {
    isListening = true;
    voiceBaseText = wordInput.value.trim();
    voiceFinalText = "";
    setVoiceButtonState(true);
    stopAfterSilence();
  });
  recognition.addEventListener("end", () => {
    isListening = false;
    clearVoiceSilenceTimer();
    setVoiceButtonState(false);
    scheduleConversationUpdate(wordInput.value);
  });
  recognition.addEventListener("result", (event) => {
    let interimText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result[0]?.transcript || "";
      if (result.isFinal) {
        voiceFinalText += transcript;
      } else {
        interimText += transcript;
      }
    }
    const parts = [voiceBaseText, voiceFinalText, interimText]
      .map((part) => part.trim())
      .filter(Boolean);
    const text = parts.join(" ");
    if (text && wordInput.value !== text) {
      wordInput.value = text;
      wordInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (text) {
      stopAfterSilence();
    }
  });
  recognition.addEventListener("error", () => {
    isListening = false;
    clearVoiceSilenceTimer();
    setVoiceButtonState(false);
  });

  voiceButton.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
      return;
    }
    wordInput.focus();
    try {
      recognition.start();
    } catch {
      setVoiceButtonState(false);
    }
  });
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

  document.querySelector("[data-action='use-current-location']")?.addEventListener("click", () => {
    requestCurrentLocation();
  });

  document.querySelector("[data-action='save-fallback-address']")?.addEventListener("click", saveFallbackAddress);
  document.querySelector("[data-action='clear-location']")?.addEventListener("click", clearLocationPrefs);
  document.querySelector("#fallback-address")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveFallbackAddress();
  });

  document.querySelector("#clinic-list")?.addEventListener("click", (event) => {
    const detailLink = event.target.closest("[data-detail-id]");
    if (!detailLink) return;
    event.preventDefault();
    const clinic = currentResults.find((item) => item.id === detailLink.dataset.detailId);
    if (clinic) {
      renderDetail(clinic);
      document.querySelector("#detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
  updateVersionLabels();
  loadLocationPrefs();
  updateLocationUi();
  renderWordBranch();
  bindEvents();
  await loadFacilityData();
  renderNearbyResults();
  if (userLocation.source === "none" && canUseGeolocation() && !sessionStorage.getItem(LOCATION_AUTO_SESSION_KEY)) {
    sessionStorage.setItem(LOCATION_AUTO_SESSION_KEY, "1");
    requestCurrentLocation({ rerender: true });
  }
}

initApp();
