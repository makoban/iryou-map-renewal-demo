const clinics = [
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
let chatTimer = 0;
let aiRequestSeq = 0;

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
  const distancePoint = Math.max(0, 30 - Math.round(clinic.distanceMeters / 30));
  const exactPoint = query && text.includes(query) ? 18 : 0;
  const departmentPoint = Math.min(38, departmentMatches * 22);
  const keywordPoint = Math.min(36, keywordMatches * 12 + guideKeywordMatches * 10 + (keywordHit ? 8 : 0));
  const locationPoint = mode === "location" ? 18 : 0;
  const match = mode === "location"
    ? Math.min(98, 72 + Math.round(distancePoint * 0.6))
    : Math.min(98, 42 + departmentPoint + keywordPoint + exactPoint + childIntentPoint);
  const rank = match + distancePoint + locationPoint + specialtyPoint;

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
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, 3)
    };
  }

  const departments = aiGuide.departments.length ? aiGuide.departments : departmentResult.departments;
  const scored = clinics
    .map((clinic) => scoreClinic(clinic, query, departments, mode, aiGuide.keywords))
    .sort((a, b) => b.rank - a.rank || a.distanceMeters - b.distanceMeters)
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
  list.innerHTML = results.map((clinic, index) => `
    <article class="result-card">
      <div class="result-rank">#${index + 1} 近さ ${clinic.distance} / マッチ度 ${clinic.match}%</div>
      <div class="result-top">
        <div>
          <span class="status ${clinic.statusClass}">${clinic.status}</span>
          <span class="verified-pill">${clinic.verified}</span>
          <h3>${clinic.name}</h3>
          <p>${clinic.departments}</p>
        </div>
        <div class="map-tile" aria-hidden="true"></div>
      </div>
      <ul class="result-facts">
        <li>${clinic.address}</li>
        <li>${clinic.station} / ${clinic.distance}</li>
        <li>${clinic.until}</li>
      </ul>
      <div class="result-hours">
        <strong>診療時間</strong><span>${clinic.hours}</span>
        <strong>休診日</strong><span>${clinic.holiday}</span>
      </div>
      <div class="result-actions">
        <a class="generated-action action-phone primary" href="tel:0521234567"><span>電話</span></a>
        <a class="generated-action action-map" href="https://maps.google.com/" target="_blank" rel="noreferrer"><span>地図</span></a>
        <a class="generated-action action-detail" href="#detail"><span>詳細</span></a>
      </div>
    </article>
  `).join("");
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
  if (!["http:", "https:"].includes(window.location.protocol)) return null;
  if (window.location.hostname.endsWith("github.io")) return null;

  const apiUrl = new URL("api/gemini-guide", window.location.href);
  const response = await fetch(apiUrl.href, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.ok && payload.guide ? payload.guide : null;
}

function renderConversationResult(text, result, options = {}) {
  const log = document.querySelector("#conversation-log");
  const guide = normalizeGuideFromApi(options.guide);
  renderDepartmentNote(result, text, guide, "#conversation-guide");
  renderClinics(result.items);
  updateResultHeader(`「${text}」の候補`, "会話の内容から条件を読み取り、近さとマッチ度順で更新しています。", "会話から自動更新");
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
    ? "現在地に近い順を中心に、診療中と確認日も見ながら表示します。"
    : "入力した言葉に近い科目と、現在地からの近さを合わせて表示します。";
  updateResultHeader(label, copy, "近い順 + マッチ度順");
  document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" });
}

function renderNearbyResults() {
  const result = searchClinics("現在地", "location");
  renderClinics(result.items);
  updateResultHeader("現在地から近い候補", "起動時は現在地に近い順を表示します。入力すると内容に合う候補へリアルタイムに変わります。", "現在地から近い順");
  const guidePanel = document.querySelector("#conversation-guide");
  if (guidePanel) guidePanel.innerHTML = "";
  const log = document.querySelector("#conversation-log");
  if (log) log.textContent = "現在地から近い順で表示しています。";
}

function updateConversation(query, options = {}) {
  const text = query.trim();
  const requestId = ++aiRequestSeq;

  if (!text) {
    renderNearbyResults();
    return;
  }

  const localResult = searchClinics(text, "word");
  renderConversationResult(text, localResult, { pending: true });

  requestGeminiGuide(text)
    .then((guide) => {
      if (requestId !== aiRequestSeq) return;
      if (!guide) {
        renderConversationResult(text, localResult);
        return;
      }
      const result = searchClinics(text, "word", guide);
      renderConversationResult(text, result, { guide });
    })
    .catch(() => {
      if (requestId === aiRequestSeq) renderConversationResult(text, localResult);
    });

  if (options.scroll) {
    document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" });
  }
}

function renderWordBranch() {
  setupVoiceInput();
  const input = document.querySelector("#chat-input");
  input?.addEventListener("input", () => {
    clearTimeout(chatTimer);
    chatTimer = window.setTimeout(() => updateConversation(input.value), 120);
  });
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      updateConversation(input.value, { scroll: true });
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
    voiceButton.disabled = true;
    voiceButton.textContent = "非対応";
    voiceButton.title = "このブラウザでは音声入力に対応していません";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.addEventListener("start", () => {
    voiceButton.textContent = "聞き取り中";
  });
  recognition.addEventListener("end", () => {
    voiceButton.textContent = "音声";
  });
  recognition.addEventListener("result", (event) => {
    const text = [...event.results].map((result) => result[0]?.transcript || "").join("");
    if (text) {
      wordInput.value = text;
      updateConversation(text, { scroll: true });
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

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => activateMode(button.dataset.mode));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePanels();
    if (event.key === "?" && !event.metaKey && !event.ctrlKey) openPanel("backstage");
  });
}

renderWordBranch();
renderNearbyResults();
bindEvents();
