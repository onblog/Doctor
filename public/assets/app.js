/**
 * 症状自查 · 单页三步流程
 *
 * 版式：一个页面里完成「填写信息 → 选择症状 → 查看结果」，不跳路由。
 * 数据全部来自 Worker 的 /api/ 接口。
 */

const state = {
  step: 1,
  sex: "male",
  age: 19,
  ageLabel: "19~29岁",
  activePart: null,
  partLetter: "",
  partItems: [],
  symptoms: [],
  parts: [],
  result: null
};

const el = (id) => document.getElementById(id);

// ---------------------------------------------------------------- 基础工具

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

/**
 * 数据库里的疾病正文没有真正的换行：段首用「两个全角空格」缩进，(一)/①/1. 这类
 * 小节标号直接接在上一句后面。渲染前按这两个规律补回段落，正文才不会挤成一坨。
 */
function formatParagraph(value) {
  let text = String(value ?? "").replace(/\r\n?/g, "\n");
  text = text.replace(/[\u3000\u00a0 ]{2,}/g, "\n");
  text = text.replace(/\u3000/g, " ");
  text = text.replace(
    /([^\d])\s*(?=(?:\([一二三四五六七八九十]+\)|（[一二三四五六七八九十]+）|[①②③④⑤⑥⑦⑧⑨⑩]))/g,
    "$1\n"
  );
  // 数字条目只在前面有空格时才算条目，避免把 TXA2、IL2、 这类词组切碎
  text = text.replace(/([^\d])( +)(?=\d{1,2}[.、](?!\d))/g, "$1\n");
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function plainText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

let toastTimer = null;
function toast(message) {
  const node = el("toast");
  node.textContent = message;
  node.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    node.hidden = true;
  }, 2600);
}

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { accept: "application/json" }, ...options });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) throw new Error((payload && payload.error) || `HTTP ${response.status}`);
  return payload;
}

// ---------------------------------------------------------------- 步骤切换

function goStep(step) {
  state.step = step;
  for (const panel of document.querySelectorAll("[data-panel]")) {
    panel.hidden = Number(panel.dataset.panel) !== step;
  }
  for (const item of document.querySelectorAll("#steps li")) {
    const index = Number(item.dataset.step);
    item.classList.toggle("is-active", index === step);
    item.classList.toggle("is-done", index < step);
  }
  const sexLabel = state.sex === "male" ? "男" : "女";
  for (const suffix of ["", "2"]) {
    const sexNode = el(`infoSex${suffix}`);
    const ageNode = el(`infoAge${suffix}`);
    if (sexNode) sexNode.textContent = sexLabel;
    if (ageNode) ageNode.textContent = state.ageLabel;
  }
  if (step === 2) syncBodyVisibility();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------------------------------------------------------------- 已选症状

function renderSelected() {
  const box = el("selectedChips");
  box.innerHTML = state.symptoms
    .map(
      (name) => `<span class="chip chip--on">${escapeHtml(name)}
        <button type="button" class="chip__x" data-remove="${escapeHtml(name)}" aria-label="移除">×</button>
      </span>`
    )
    .join("");
  el("selectedEmpty").hidden = state.symptoms.length > 0;
  const picked = el("resultSymptoms");
  if (picked) {
    picked.innerHTML = state.symptoms.map((name) => `<span class="chip">${escapeHtml(name)}</span>`).join("");
  }
}

function addSymptom(name) {
  const clean = String(name ?? "").trim();
  if (!clean || state.symptoms.includes(clean)) return;
  if (state.symptoms.length >= 20) return;
  state.symptoms.push(clean);
  renderSelected();
  renderPartList();
}

function removeSymptom(name) {
  state.symptoms = state.symptoms.filter((item) => item !== name);
  renderSelected();
  renderPartList();
}

// ---------------------------------------------------------------- 部位 · 人体图

const BODY_VIEWS = {
  male: {
    front: {
      src: "/assets/body/man_zm.webp",
      ratio: "250 / 300",
      zones: [
        { part: "头部", parts: ["头", "头部"], x: 38.4, y: 1.67, w: 26.8, h: 13.33 },
        { part: "胸部", parts: ["胸部"], x: 35.6, y: 17.67, w: 35.2, h: 13.33 },
        { part: "腹部", parts: ["腹部"], x: 35.6, y: 31, w: 37.2, h: 10 },
        { part: "上肢", parts: ["上肢"], x: 0, y: 18.33, w: 34, h: 30.33 },
        { part: "下肢", parts: ["下肢"], x: 6, y: 51.67, w: 74, h: 49.33 },
        { part: "男性生殖部位", parts: ["男性生殖部位", "生殖部位"], x: 35.6, y: 41, w: 44.4, h: 8 }
      ]
    },
    back: {
      src: "/assets/body/man_bm.webp",
      ratio: "200 / 300",
      zones: [
        { part: "颈部", parts: ["颈部"], x: 28, y: 8, w: 33, h: 5.33 },
        { part: "背部", parts: ["背部"], x: 46.5, y: 13.67, w: 46, h: 8 },
        { part: "腰部", parts: ["腰部"], x: 45, y: 32.33, w: 46, h: 4 },
        { part: "盆腔", parts: ["盆腔"], x: 14, y: 36.33, w: 51.5, h: 4.33 },
        { part: "臀部", parts: ["臀部"], x: 42.5, y: 40.33, w: 42.5, h: 6.67 }
      ]
    }
  },
  female: {
    front: {
      src: "/assets/body/woman_zm.webp",
      ratio: "250 / 310",
      zones: [
        { part: "头部", parts: ["头", "头部"], x: 38.4, y: 1.61, w: 26.8, h: 12.9 },
        { part: "胸部", parts: ["胸部"], x: 35.6, y: 17.1, w: 35.2, h: 12.9 },
        { part: "腹部", parts: ["腹部"], x: 35.6, y: 30, w: 37.2, h: 9.68 },
        { part: "上肢", parts: ["上肢"], x: 0, y: 17.74, w: 34, h: 29.35 },
        { part: "下肢", parts: ["下肢"], x: 6, y: 50.97, w: 74, h: 47.74 },
        { part: "女性生殖部位", parts: ["女性生殖部位", "生殖部位"], x: 35.6, y: 39.68, w: 44.4, h: 7.74 }
      ]
    },
    back: {
      src: "/assets/body/woman_bm.webp",
      ratio: "200 / 310",
      zones: [
        { part: "颈部", parts: ["颈部"], x: 28, y: 9.03, w: 33, h: 5.16 },
        { part: "背部", parts: ["背部"], x: 42.5, y: 14.52, w: 50, h: 7.1 },
        { part: "腰部", parts: ["腰部"], x: 44, y: 31.61, w: 47, h: 4.84 },
        { part: "盆腔", parts: ["盆腔"], x: 14, y: 36.45, w: 53, h: 4.19 },
        { part: "臀部", parts: ["臀部"], x: 40, y: 40.65, w: 45, h: 6.77 }
      ]
    }
  }
};

const HEAD_ZONES = ["眼", "鼻", "口", "牙", "耳", "眉"];

function availableParts() {
  return new Set(state.parts.map((part) => part.name));
}

function zoneAliases(part) {
  for (const sex of Object.values(BODY_VIEWS)) {
    for (const view of Object.values(sex)) {
      const zone = view.zones.find((item) => item.part === part);
      if (zone) return zone.parts;
    }
  }
  return [part];
}

function buildBodyStage() {
  const stage = el("bodyStage");
  if (!stage) return;
  const available = availableParts();
  const figures = [];

  for (const sex of ["male", "female"]) {
    for (const view of ["front", "back"]) {
      const config = BODY_VIEWS[sex][view];
      const zones = config.zones.filter((zone) => zone.parts.some((name) => available.has(name)));
      // 统一高度、按各自比例算宽度：两张图里的人才会一样高
    const [ratioW, ratioH] = config.ratio.split("/").map((value) => Number(value.trim()));
    figures.push(`<div class="body-photo" data-sex="${sex}" data-view="${view}" hidden
        style="width:calc(var(--body-h) * ${ratioW} / ${ratioH})">
        <img src="${config.src}" alt="" decoding="async" />
        ${zones
          .map(
            (zone) =>
              `<button type="button" class="body-hot" style="left:${zone.x}%;top:${zone.y}%;width:${zone.w}%;height:${zone.h}%"
                 data-body-zone="${escapeHtml(zone.part)}" aria-label="${escapeHtml(zone.part)}"></button>`
          )
          .join("")}
      </div>`);
    }
  }

  stage.innerHTML = figures.join("");
  preloadBodyImages();
  renderHeadZones();
  syncBodyVisibility();
}

function preloadBodyImages() {
  for (const sex of Object.values(BODY_VIEWS)) {
    for (const view of Object.values(sex)) {
      const image = new Image();
      image.src = view.src;
    }
  }
}

/** 五官浮层：鼠标移到头部时贴着头部展开，点在人体图上，不在图下方。 */
function renderHeadZones() {
  const box = el("headZones");
  if (!box) return;
  const available = availableParts();
  box.innerHTML = HEAD_ZONES.filter((name) => available.has(name))
    .map(
      (name) =>
        `<button type="button" class="head-zone${state.activePart === name ? " is-active" : ""}" data-body-zone="${escapeHtml(name)}">${escapeHtml(name)}</button>`
    )
    .join("");
  box.hidden = true;
}

let headHideTimer = null;

function showHeadZones() {
  clearTimeout(headHideTimer);
  const box = el("headZones");
  if (box && box.children.length) box.hidden = false;
}

function hideHeadZonesSoon() {
  clearTimeout(headHideTimer);
  headHideTimer = setTimeout(() => {
    const box = el("headZones");
    if (box) box.hidden = true;
  }, 180);
}

function syncBodyVisibility() {
  // 正面和背面同时展示；性别直接跟随第一步的选择，第二步不再单独切换
  for (const node of document.querySelectorAll("#bodyStage .body-photo")) {
    node.hidden = node.dataset.sex !== state.sex;
  }
}

function setCaption(text) {
  el("bodyCaption").textContent = text;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** 取症状拼音首字母；非字母归到 #。 */
function initialOf(item) {
  const first = String(item.initial ?? "").trim().charAt(0).toUpperCase();
  return first >= "A" && first <= "Z" ? first : "#";
}

async function openPart(part) {
  state.activePart = part;
  state.partLetter = "";
  const panel = el("partSymptoms");
  const chips = el("partChips");
  panel.hidden = false;
  el("partTitle").textContent = part;
  chips.innerHTML = `<span class="empty">加载中…</span>`;
  renderLetterBar();

  try {
    const aliases = zoneAliases(part);
    // 一次取全量，后面的首字母切换全部在本地完成，不再请求后端
    const data = await api(`/api/symptoms?part=${encodeURIComponent(aliases.join(","))}&limit=5000`);
    state.partItems = data.items ?? [];
    renderPartList();
  } catch {
    state.partItems = [];
    chips.innerHTML = `<span class="empty">加载失败，请重试</span>`;
  }
}

/** 按当前选中的首字母渲染症状列表（纯前端过滤）。 */
function renderPartList() {
  const chips = el("partChips");
  const part = state.activePart;
  if (!chips || !part) return;

  const letter = state.partLetter;
  const items = letter ? state.partItems.filter((item) => initialOf(item) === letter) : state.partItems;
  el("partTitle").textContent = letter
    ? `${part} · ${letter} 开头（${items.length} 个）`
    : `${part} · 全部（${items.length} 个）`;

  chips.innerHTML = items.length
    ? items
        .map((item) => {
          const selected = state.symptoms.includes(item.name);
          return `<button type="button" class="chip chip--add${selected ? " is-selected" : ""}" data-add="${escapeHtml(
            item.name
          )}" aria-pressed="${selected}">${selected ? "✓" : "+"} ${escapeHtml(item.name)}</button>`;
        })
        .join("")
    : `<span class="empty">该字母下没有症状</span>`;

  renderLetterBar();
}

/** 字母条只渲染当前部位真实存在的首字母，避免一堆点开是空的按钮。 */
function renderLetterBar() {
  const bar = el("letterBar");
  if (!bar) return;
  if (!state.activePart || state.partItems.length === 0) {
    bar.hidden = true;
    bar.innerHTML = "";
    return;
  }

  const available = new Set(state.partItems.map(initialOf));
  const letters = LETTERS.filter((letter) => available.has(letter));
  if (available.has("#")) letters.push("#");

  bar.hidden = false;
  bar.innerHTML = [
    `<button type="button" class="letter${state.partLetter ? "" : " is-active"}" data-letter="">全部</button>`,
    ...letters.map(
      (letter) =>
        `<button type="button" class="letter${state.partLetter === letter ? " is-active" : ""}" data-letter="${letter}">${letter}</button>`
    )
  ].join("");
}

// ---------------------------------------------------------------- 搜索

let searchTimer = null;
let searchSeq = 0;

function closeSuggest() {
  const list = el("suggestList");
  list.hidden = true;
  list.innerHTML = "";
}

async function runSearch(query) {
  const seq = ++searchSeq;
  if (!query) {
    closeSuggest();
    return;
  }
  try {
    const data = await api(`/api/symptoms/search?q=${encodeURIComponent(query)}&limit=12`);
    if (seq !== searchSeq) return;
    const items = data.items ?? [];
    const list = el("suggestList");
    // 症状字典之外的写法（关系表里的原始叫法，如「头痛」）也允许按原文加入
    const free = `<li data-free="${escapeHtml(query)}" class="suggest-free"><span>+ 添加“${escapeHtml(
      query
    )}”</span><span class="meta">按原文匹配</span></li>`;
    list.innerHTML = items.length
      ? items
          .map(
            (item) =>
              `<li data-name="${escapeHtml(item.name)}"><span>${escapeHtml(item.name)}</span><span class="meta">${escapeHtml(
                (item.families ?? []).slice(0, 2).join(" · ")
              )}</span></li>`
          )
          .join("") + free
      : `<li class="empty">字典里没有这个词，可以按原文添加</li>` + free;
    list.hidden = false;
  } catch {
    closeSuggest();
  }
}

// ---------------------------------------------------------------- 分析

function renderResult() {
  const data = state.result;
  const list = el("resultList");
  const related = el("relatedSymptoms");
  if (!data) {
    list.innerHTML = `<p class="empty">暂无结果</p>`;
    related.innerHTML = "";
    return;
  }

  const total = data.input.symptoms.length;
  list.innerHTML =
    (data.diseases ?? [])
      .map((disease, index) => {
        const tags = (disease.families ?? [])
          .slice(0, 3)
          .map((family) => `<span class="result-tag">${escapeHtml(family)}</span>`)
          .join("");
        const symptoms = (disease.symptoms ?? [])
          .slice(0, 6)
          .map((name) => `<span>${escapeHtml(name)}</span>`)
          .join("");
        return `<button type="button" class="result-item" data-disease="${disease.id}">
          <span class="result-rank">${index + 1}</span>
          <span>
            <span class="result-name">
              ${escapeHtml(disease.name)}
              <span class="result-hit">命中 ${disease.matched}/${total}</span>
              ${tags}
            </span>
            <span class="result-intro">${escapeHtml(plainText(disease.intro) || "暂无简介")}</span>
            <span class="result-symptoms">${symptoms}</span>
          </span>
        </button>`;
      })
      .join("") || `<p class="empty">没有找到相关疾病，换个症状词再试试。</p>`;

  related.innerHTML = (data.symptoms ?? [])
    .slice(0, 24)
    .map(
      (name) => `<button type="button" class="chip chip--add" data-add-related="${escapeHtml(name)}">+ ${escapeHtml(name)}</button>`
    )
    .join("");

  const unknown = data.unknownSymptoms ?? [];
  el("resultNote").textContent = unknown.length
    ? `以下症状未收录，未参与分析：${unknown.join("、")}`
    : "结果仅供参考，最终诊断请以医生诊断为准。";
}

async function analyze() {
  if (!state.symptoms.length) {
    toast("请至少选择一个症状");
    goStep(2);
    return;
  }
  const button = el("analyzeBtn");
  const label = button.textContent;
  button.disabled = true;
  button.textContent = "分析中…";
  try {
    const data = await api("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sex: state.sex, age: state.age, symptoms: state.symptoms })
    });
    state.result = data;
    renderResult();
    goStep(3);
  } catch (error) {
    toast(error.message || "分析失败，请重试");
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

// ---------------------------------------------------------------- 详情 + 图谱

let d3Loading = null;

function loadD3() {
  if (window.d3) return Promise.resolve(window.d3);
  if (d3Loading) return d3Loading;
  d3Loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/assets/vendor/d3.v3.min.js";
    script.onload = () => (window.d3 ? resolve(window.d3) : reject(new Error("d3 missing")));
    script.onerror = () => reject(new Error("d3 failed"));
    document.head.appendChild(script);
  });
  return d3Loading;
}

// 弹窗内容每次都从头看：不记忆上一次滚动位置
function resetModalScroll() {
  const body = el("modalBody");
  if (!body) return;
  body.scrollTop = 0;
}

function openModal() {
  el("modal").hidden = false;
  document.body.classList.add("is-locked");
  // 先显示再重置：元素在 display:none 时设 scrollTop 不生效；下一帧再压一次兜底
  resetModalScroll();
  requestAnimationFrame(resetModalScroll);
}

function closeModal() {
  resetModalScroll();
  el("modal").hidden = true;
  document.body.classList.remove("is-locked");
}

function loadingState(text) {
  return `<div class="loading-state"><span class="spinner" aria-hidden="true"></span><span>${escapeHtml(text)}</span></div>`;
}

// 每次打开弹窗自增，慢请求回来时如果已经换了疾病就丢弃，避免旧数据盖新数据
let modalSeq = 0;

const contextCache = new Map();

function currentSymptomQuery() {
  const picked = state.result?.input?.symptoms?.length ? state.result.input.symptoms : state.symptoms;
  return encodeURIComponent(picked.join(","));
}

// 悬停/触摸疾病卡片就预取详情，点击时大多已经到货
function contextRequest(id) {
  const key = `${id}|${currentSymptomQuery()}`;
  let promise = contextCache.get(key);
  if (!promise) {
    promise = api(`/api/diseases/${id}/context?symptoms=${currentSymptomQuery()}`);
    promise.catch(() => {});
    contextCache.set(key, promise);
    if (contextCache.size > 24) contextCache.delete(contextCache.keys().next().value);
  }
  return promise;
}

async function openDisease(id) {
  const seq = ++modalSeq;
  const body = el("modalBody");
  el("modalTitle").textContent = "正在加载";
  body.innerHTML = loadingState("正在加载疾病详情…");
  openModal();

  // 详情和图谱一次请求拿全：多一个往返在内地网络下就多几百毫秒
  let payload;
  try {
    payload = await contextRequest(id);
  } catch (error) {
    if (seq !== modalSeq) return;
    el("modalTitle").textContent = "加载失败";
    body.innerHTML = `<p class="empty">${escapeHtml(error.message || "加载失败")}</p>`;
    return;
  }
  if (seq !== modalSeq) return;

  const disease = payload.disease;
  const graph = payload.graph;
  el("modalTitle").textContent = disease.name;
  const tags = [...(disease.families ?? []), ...(disease.parts ?? [])]
    .map((item) => `<span class="result-tag">${escapeHtml(item)}</span>`)
    .join("");

  const blocks = [
    ["简介", disease.intro],
    ["病因", disease.cause],
    ["症状", disease.symptom],
    ["诊断", disease.diagnose],
    ["治疗", disease.cure],
    ["预防", disease.prevent],
    ["并发症", disease.complication]
  ]
    .map(([title, value]) => {
      const text = formatParagraph(value);
      const long = text.length > 150;
      return `<div class="detail-row">
          <span class="detail-label">${title}</span>
          <div class="detail-value">
            <p class="${long ? "is-clamped" : ""}">${escapeHtml(text || "暂无资料")}</p>
            ${long ? `<button type="button" class="detail-more" data-more>展开全文</button>` : ""}
          </div>
        </div>`;
    })
    .join("");

  body.innerHTML = `
      <div class="modal-tags">${tags}</div>
      <div class="graph-wrap">
        <h4>分析过程 · 你的症状指向哪些疾病</h4>
        <p class="graph-hint">左侧是你勾选的症状，右侧是每个症状可能指向的疾病（含当前这个），连线即推导关系。</p>
        <div class="graph-canvas" id="explainGraph">${loadingState("正在生成推导关系…")}</div>
      </div>
      <h3 class="modal-section">疾病详情</h3>
      <div class="detail-rows">${blocks}</div>
    `;
  // 从加载态换成完整详情后高度会变，统一压回顶部，避免停在上一屏的位置
  body.scrollTop = 0;

  // 有些文本长度超过阈值、但在弹窗里其实并不溢出，此时不该显示「展开全文」
  requestAnimationFrame(() => {
    for (const paragraph of body.querySelectorAll(".detail-value p.is-clamped")) {
      if (paragraph.scrollHeight <= paragraph.clientHeight + 2) {
        paragraph.classList.remove("is-clamped");
        paragraph.closest(".detail-row")?.querySelector("[data-more]")?.remove();
      }
    }
  });

  const host = el("explainGraph");
  if (!graph) {
    host.innerHTML = `<p class="empty" style="padding:20px">图谱加载失败</p>`;
    return;
  }
  loadD3()
    .then((d3) => {
      if (seq === modalSeq) drawExplainGraph(d3, host, graph);
    })
    .catch(() => {
      if (seq === modalSeq) host.innerHTML = `<p class="empty" style="padding:20px">图谱加载失败</p>`;
    });
}

/**
 * 推导图谱：左列是用户勾选的症状，右列是每个症状指向的疾病（含当前疾病）。
 * 用 d3 绘制并分三步出现——症状 → 连线 → 疾病，让「推导过程」看得见。
 */
function drawExplainGraph(d3, host, payload) {
  if (!host) return;

  const width = Math.max(host.clientWidth || 760, 520);
  const padX = 120;
  const padY = 34;

  const symptoms = payload.nodes.filter((node) => node.kind === "symptom");
  const diseases = payload.nodes.filter((node) => node.kind !== "symptom");
  const rows = Math.max(symptoms.length, diseases.length, 1);
  const height = Math.max(320, Math.min(560, rows * 56 + padY * 2));

  const leftX = padX;
  const rightX = width - padX;
  const stepY = (height - padY * 2) / Math.max(rows - 1, 1);

  const positionOf = (list, index) => padY + (stepY * (index + (rows - list.length) / 2));

  const coords = new Map();
  symptoms.forEach((node, index) => coords.set(node.id, { x: leftX, y: positionOf(symptoms, index) }));
  diseases.forEach((node, index) => coords.set(node.id, { x: rightX, y: positionOf(diseases, index) }));

  host.textContent = "";
  const svg = d3
    .select(host)
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

  // 左边症状列 / 右边疾病列的背景带
  svg
    .append("rect")
    .attr("x", 18)
    .attr("y", padY - 22)
    .attr("width", padX * 2 - 8)
    .attr("height", height - padY * 2 + 44)
    .attr("rx", 14)
    .attr("fill", "#f1f8f3");

  svg
    .append("text")
    .attr("x", leftX)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("class", "graph-col-label")
    .text("你选的症状");

  svg
    .append("text")
    .attr("x", rightX)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("class", "graph-col-label")
    .text("可能指向的疾病");

  const link = svg
    .append("g")
    .selectAll("path")
    .data(payload.links)
    .enter()
    .append("path")
    .attr("class", "reason-link")
    .attr("d", (link) => {
      const from = coords.get(link.source);
      const to = coords.get(link.target);
      if (!from || !to) return "";
      const midX = (from.x + to.x) / 2;
      return `M${from.x},${from.y} C${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}`;
    })
    .attr("opacity", 0);

  const symptomNodes = svg
    .append("g")
    .selectAll("g")
    .data(symptoms)
    .enter()
    .append("g")
    .attr("transform", (node) => `translate(${coords.get(node.id).x},${coords.get(node.id).y})`)
    .attr("opacity", 0);

  symptomNodes
    .append("circle")
    .attr("r", 8)
    .attr("fill", "#2f7d52")
    .attr("stroke", "#1d6b47")
    .attr("stroke-width", 1.5);

  symptomNodes
    .append("text")
    .attr("x", -16)
    .attr("y", 4)
    .attr("text-anchor", "end")
    .attr("class", "reason-label")
    .text((node) => node.label);

  const diseaseNodes = svg
    .append("g")
    .selectAll("g")
    .data(diseases)
    .enter()
    .append("g")
    .attr("transform", (node) => `translate(${coords.get(node.id).x},${coords.get(node.id).y})`)
    .attr("opacity", 0);

  diseaseNodes
    .append("circle")
    .attr("r", (node) => (node.kind === "target" ? 15 : 9))
    .attr("fill", (node) => (node.kind === "target" ? "#1d6b47" : "#ffffff"))
    .attr("stroke", (node) => (node.kind === "target" ? "#155238" : "#b7d8c6"))
    .attr("stroke-width", 1.6);

  diseaseNodes
    .append("text")
    .attr("x", 22)
    .attr("y", 4)
    .attr("class", (node) => (node.kind === "target" ? "reason-label reason-label--target" : "reason-label"))
    .text((node) => node.label);

  // 三步动画：症状 → 连线 → 疾病
  symptomNodes.transition().duration(260).attr("opacity", 1);
  link
    .transition()
    .delay(280)
    .duration(420)
    .attr("opacity", 1);
  diseaseNodes
    .transition()
    .delay(700)
    .duration(320)
    .attr("opacity", 1);

  const total = payload.symptoms.length;
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 8)
    .attr("text-anchor", "middle")
    .attr("class", "graph-foot")
    .text(`共 ${total} 个症状参与推导，深绿色为当前疾病`);
}

// ---------------------------------------------------------------- 事件

function bindEvents() {
  el("startBtn").addEventListener("click", () => goStep(2));

  for (const node of document.querySelectorAll("[data-goto]")) {
    node.addEventListener("click", () => goStep(Number(node.dataset.goto)));
  }

  el("sexGroup").addEventListener("click", (event) => {
    const button = event.target.closest("[data-sex]");
    if (!button) return;
    state.sex = button.dataset.sex;
    for (const node of el("sexGroup").querySelectorAll("[data-sex]")) {
      node.classList.toggle("is-active", node === button);
    }
    syncBodyVisibility();
  });

  el("ageSelect").addEventListener("change", (event) => {
    state.age = Number(event.target.value);
    state.ageLabel = event.target.options[event.target.selectedIndex].text;
  });

  const input = el("symptomInput");
  input.addEventListener("input", () => {
    clearTimeout(searchTimer);
    const query = input.value.trim();
    if (!query) {
      closeSuggest();
      return;
    }
    searchTimer = setTimeout(() => runSearch(query), 200);
  });

  el("searchBtn").addEventListener("click", () => {
    const query = input.value.trim();
    if (query) runSearch(query);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    // 回车按用户输入的原文添加，想用字典词条就点建议项
    addSymptom(query);
    input.value = "";
    closeSuggest();
  });

  el("partClose").addEventListener("click", () => {
    state.activePart = null;
    state.partLetter = "";
    state.partItems = [];
    el("partSymptoms").hidden = true;
    setCaption("把鼠标移到人体图上，点击部位查看症状");
  });

  el("analyzeBtn").addEventListener("click", analyze);

  el("restartBtn").addEventListener("click", () => {
    state.symptoms = [];
    state.result = null;
    state.activePart = null;
    state.partLetter = "";
    state.partItems = [];
    el("partSymptoms").hidden = true;
    hideHeadZonesSoon();
    renderLetterBar();
    closeModal();
    renderSelected();
    goStep(1);
  });

  const prefetchDisease = (event) => {
    const card = event.target.closest?.("[data-disease]");
    if (card) contextRequest(Number(card.dataset.disease));
  };
  document.addEventListener("pointerenter", prefetchDisease, true);
  document.addEventListener("touchstart", prefetchDisease, { passive: true, capture: true });

  document.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove]");
    if (remove) {
      removeSymptom(remove.dataset.remove);
      return;
    }

    const add = event.target.closest("[data-add]");
    if (add) {
      const name = add.dataset.add;
      if (state.symptoms.includes(name)) removeSymptom(name);
      else addSymptom(name);
      return;
    }

    const related = event.target.closest("[data-add-related]");
    if (related) {
      addSymptom(related.dataset.addRelated);
      analyze();
      return;
    }

    const zone = event.target.closest("[data-body-zone]");
    if (zone) {
      openPart(zone.dataset.bodyZone);
      return;
    }

    const letter = event.target.closest("[data-letter]");
    if (letter) {
      state.partLetter = letter.dataset.letter;
      renderPartList();
      return;
    }

    const suggestItem = event.target.closest("#suggestList li[data-name]");
    if (suggestItem) {
      addSymptom(suggestItem.dataset.name);
      input.value = "";
      closeSuggest();
      return;
    }

    const freeItem = event.target.closest("#suggestList li[data-free]");
    if (freeItem) {
      addSymptom(freeItem.dataset.free);
      input.value = "";
      closeSuggest();
      return;
    }

    if (!event.target.closest(".search-input-wrap")) closeSuggest();

    const disease = event.target.closest("[data-disease]");
    if (disease) {
      openDisease(Number(disease.dataset.disease));
      return;
    }

    const more = event.target.closest("[data-more]");
    if (more) {
      // 逐行布局里按钮在 .detail-row 内，正文是 .detail-value > p
      const paragraph = more.closest(".detail-row")?.querySelector(".detail-value p");
      if (paragraph) {
        const expanded = paragraph.classList.toggle("is-clamped") === false;
        more.textContent = expanded ? "收起" : "展开全文";
      }
      return;
    }

    if (event.target.closest("[data-close-modal]")) {
      closeModal();
      return;
    }

    // 没有遮罩层，点击弹窗空白区域（卡片之外）也关闭
    if (event.target.id === "modal") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !el("modal").hidden) closeModal();
  });

  const area = document.querySelector(".body-area");
  if (area) {
    area.addEventListener("mouseover", (event) => {
      const zone = event.target.closest("[data-body-zone]");
      if (zone) setCaption(`${zone.dataset.bodyZone} · 点击查看该部位症状`);
      if ((zone && zone.dataset.bodyZone === "头部") || event.target.closest("#headZones")) {
        showHeadZones();
      }
    });
    area.addEventListener("mouseout", (event) => {
      const fromHead =
        event.target.closest('#bodyStage [data-body-zone="头部"]') || event.target.closest("#headZones");
      const to = event.relatedTarget;
      const toHead =
        to && to.closest && (to.closest('#bodyStage [data-body-zone="头部"]') || to.closest("#headZones"));
      if (fromHead && !toHead) hideHeadZonesSoon();
      if (event.target.closest("[data-body-zone]")) setCaption("把鼠标移到人体图上，点击部位查看症状");
    });
  }
}

// ---------------------------------------------------------------- 启动

async function boot() {
  bindEvents();
  renderSelected();
  try {
    const data = await api("/api/parts");
    state.parts = data.items ?? [];
  } catch {
    state.parts = [];
  }
  buildBodyStage();
  renderLetterBar();
}

boot();
