const clinics = [
  {
    name: "千種内科クリニック",
    status: "診療中",
    statusClass: "open",
    until: "18:30まで",
    departments: "内科・循環器内科・小児科",
    address: "名古屋市千種区今池1-2-3",
    station: "今池駅 徒歩2分",
    distance: "約220m",
    hours: "9:00-12:30 / 15:30-18:30",
    holiday: "木曜午後・日曜・祝日",
    verified: "確認日 2026.05"
  },
  {
    name: "星ヶ丘内科医院",
    status: "午前診療",
    statusClass: "soon",
    until: "12:30まで",
    departments: "内科・消化器内科",
    address: "名古屋市千種区星が丘元町15-7",
    station: "星ヶ丘駅 徒歩5分",
    distance: "約380m",
    hours: "9:00-12:30 / 16:00-19:00",
    holiday: "水曜午後・土曜午後・日曜",
    verified: "確認日 2026.04"
  },
  {
    name: "東山内科クリニック",
    status: "休診中",
    statusClass: "closed",
    until: "本日休診",
    departments: "内科・糖尿病内科",
    address: "名古屋市千種区東山通5-10",
    station: "東山公園駅 徒歩6分",
    distance: "約450m",
    hours: "9:00-12:00 / 15:00-18:00",
    holiday: "木曜・日曜・祝日",
    verified: "確認日 2026.03"
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
    keywords: ["腰", "膝", "肩", "骨", "関節", "ねんざ", "捻挫", "打撲", "けが", "痛めた"]
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

function renderClinics() {
  const list = document.querySelector("#clinic-list");
  if (!list) return;
  list.innerHTML = clinics.map((clinic) => `
    <article class="result-card">
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

function uniqueDepartments(items) {
  return [...new Set(items)].slice(0, 4);
}

function findDepartments(symptomText) {
  const text = symptomText.trim();
  if (!text) {
    return { type: "empty", departments: [] };
  }

  if (emergencyKeywords.some((keyword) => text.includes(keyword))) {
    return {
      type: "emergency",
      departments: ["救急相談", "救急外来"]
    };
  }

  const matched = [];
  departmentRules.forEach((rule) => {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      matched.push(...rule.departments);
    }
  });

  return {
    type: "normal",
    departments: uniqueDepartments(matched.length ? matched : ["内科"])
  };
}

function renderSymptomResult(result) {
  const target = document.querySelector("#symptom-result");
  if (!target) return;

  if (result.type === "empty") {
    target.classList.remove("symptom-alert");
    target.innerHTML = `<p class="result-empty">例: 子どもの発熱は小児科・内科、歯の痛みは歯科を候補にします。</p>`;
    return;
  }

  if (result.type === "emergency") {
    target.classList.add("symptom-alert");
    target.innerHTML = `
      <strong>先に救急相談を案内</strong>
      <p>緊急性が高い可能性があるため、受診先を探す前に119または#7119などの救急相談をおすすめします。</p>
      <div class="department-list">
        <button class="department-chip" type="button" data-department="救急外来">救急外来</button>
      </div>
      <p class="symptom-next">必要に応じて、その後に現在地周辺の救急対応施設を探せます。</p>
    `;
    return;
  }

  target.classList.remove("symptom-alert");
  target.innerHTML = `
    <strong>候補の診療科</strong>
    <div class="department-list">
      ${result.departments.map((department) => `<button class="department-chip" type="button" data-department="${department}">${department}</button>`).join("")}
    </div>
    <p class="symptom-next">科目を押すと、近くの候補に進みます。迷うときは医療機関や救急相談へつなげます。</p>
  `;
}

function runSymptomCheck() {
  const input = document.querySelector("#symptom-input");
  if (!input) return;
  renderSymptomResult(findDepartments(input.value));
}

function setupVoiceInput() {
  const voiceButton = document.querySelector("[data-action='voice-input']");
  const symptomInput = document.querySelector("#symptom-input");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!voiceButton || !symptomInput) return;

  if (!SpeechRecognition) {
    voiceButton.disabled = true;
    voiceButton.textContent = "非対応";
    voiceButton.title = "このブラウザでは音声入力に対応していません";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener("start", () => {
    voiceButton.textContent = "聞き取り中";
  });
  recognition.addEventListener("end", () => {
    voiceButton.textContent = "音声";
  });
  recognition.addEventListener("result", (event) => {
    const text = event.results?.[0]?.[0]?.transcript;
    if (text) {
      symptomInput.value = text;
      runSymptomCheck();
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

  document.querySelectorAll("[data-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector("#main-search");
      const current = input.value.trim();
      input.value = current ? `${current} ${button.dataset.chip}` : button.dataset.chip;
      document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelector("[data-action='run-search']")?.addEventListener("click", () => {
    document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" });
  });

  document.querySelector("[data-action='symptom-check']")?.addEventListener("click", runSymptomCheck);

  document.querySelector("#symptom-input")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") runSymptomCheck();
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-department]");
    if (!button) return;
    const input = document.querySelector("#main-search");
    if (input) input.value = `名古屋市千種区 ${button.dataset.department}`;
    document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePanels();
    if (event.key === "?" && !event.metaKey && !event.ctrlKey) openPanel("backstage");
  });
}

renderClinics();
setupVoiceInput();
bindEvents();
