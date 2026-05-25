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
    holiday: "木曜午後・日曜・祝日"
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
    holiday: "水曜午後・土曜午後・日曜"
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
    holiday: "木曜・日曜・祝日"
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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePanels();
    if (event.key === "?" && !event.metaKey && !event.ctrlKey) openPanel("backstage");
  });
}

renderClinics();
bindEvents();
