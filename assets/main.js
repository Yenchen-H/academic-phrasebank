/* =========================================================
   學術佳句庫｜全站唯一腳本
   1. 把 .template 中的 [[ ]] 轉成上色的 slot
   2. 每張卡片加「複製模板」按鈕
   3. 依 data-tags 自動產生標籤篩選按鈕
   4. 自訂句型：在網頁上新增，存在瀏覽器 localStorage（見 AGENTS.md 4.4）
   5. 首頁：自訂句型統計、匯出與匯入
   卡片格式見 AGENTS.md 4.2，請勿任意更改解析邏輯
   ========================================================= */

const STORE_KEY = "phrasebank-custom-v1";

/* ---------- localStorage 讀寫（失敗時不讓網頁壞掉） ---------- */
function loadCustom() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}
function saveCustom(list) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    alertBox("這個瀏覽器無法儲存資料（可能是無痕模式），句型沒有被保存。");
    return false;
  }
}
function alertBox(msg) {
  const box = document.querySelector(".custom-msg");
  if (box) { box.textContent = msg; box.hidden = false; }
}

/* ---------- 建立一張自訂卡片（格式與 AGENTS.md 4.2 相同） ---------- */
function buildCustomCard(item) {
  const card = document.createElement("article");
  card.className = "phrase custom";
  card.id = item.id;
  card.dataset.tags = (item.tags || []).join(" ");
  card.dataset.customId = item.id;

  const head = document.createElement("div");
  head.className = "phrase-head";
  const pid = document.createElement("span");
  pid.className = "phrase-id";
  pid.textContent = item.id;
  const badge = document.createElement("span");
  badge.className = "custom-badge";
  badge.textContent = "我的";
  const func = document.createElement("h3");
  func.className = "func";
  func.textContent = item.func;
  head.append(pid, badge, func);
  card.appendChild(head);

  [["template", item.template], ["example", item.example], ["note", item.note]].forEach(([cls, text]) => {
    if (!text) return;
    const p = document.createElement("p");
    p.className = cls;
    p.textContent = text;
    card.appendChild(p);
  });
  return card;
}

/* ---------- 章節頁：顯示自訂卡片 + 新增表單 ---------- */
function setupCustomOnPage() {
  const list = document.querySelector(".phrase-list");
  const codeEl = document.querySelector(".page-header .code");
  if (!list || !codeEl) return;
  const code = codeEl.textContent.trim();
  const mine = loadCustom().filter((x) => x.page === code);

  mine.forEach((item) => list.appendChild(buildCustomCard(item)));

  // 新增表單（插在篩選列之前）
  const bar = document.querySelector(".filter-bar");
  const wrap = document.createElement("section");
  wrap.className = "custom-add";
  wrap.innerHTML = `
    <button type="button" class="custom-toggle">＋ 新增我的句型</button>
    <form class="custom-form" hidden>
      <p class="custom-hint">新增的句型只存在這個瀏覽器。要換裝置或正式收錄，請到首頁「我的自訂句型」匯出。</p>
      <label>功能（中文，例如：指出資料集規模太小）<input name="func" required maxlength="30"></label>
      <label>模板（要替換的地方用 [[ ]] 包起來）<textarea name="template" required rows="2"></textarea></label>
      <label>例句<textarea name="example" rows="2"></textarea></label>
      <label>說明（什麼時候用、要注意什麼）<textarea name="note" rows="2"></textarea></label>
      <label>標籤（1 到 3 個，用空白分開）<input name="tags" placeholder="例如：缺乏研究 資料"></label>
      <p class="custom-msg" hidden></p>
      <div class="custom-actions">
        <button type="submit" class="custom-save">儲存</button>
        <button type="button" class="custom-cancel">取消</button>
      </div>
    </form>`;
  bar.parentNode.insertBefore(wrap, bar);

  const form = wrap.querySelector(".custom-form");
  const toggle = wrap.querySelector(".custom-toggle");
  toggle.addEventListener("click", () => { form.hidden = !form.hidden; });
  wrap.querySelector(".custom-cancel").addEventListener("click", () => { form.hidden = true; });

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const f = new FormData(form);
    const item = {
      page: code,
      func: f.get("func").trim(),
      template: f.get("template").trim(),
      example: f.get("example").trim(),
      note: f.get("note").trim(),
      tags: f.get("tags").trim().split(/\s+/).filter(Boolean).slice(0, 3),
    };
    // 英文規則檢查（AGENTS.md 5.1）
    const en = item.template + " " + item.example;
    if (/[—–;]/.test(en)) {
      alertBox("模板或例句裡有破折號（— –）或分號（;），請改用逗號、括號，或拆成兩句。");
      return;
    }
    if (!/\[\[.+?\]\]/.test(item.template)) {
      alertBox("模板裡至少要有一個 [[ ]]，標出要替換的地方。");
      return;
    }
    const all = loadCustom();
    const used = all.filter((x) => x.page === code)
      .map((x) => parseInt(x.id.split("-U")[1], 10) || 0);
    const n = (used.length ? Math.max(...used) : 0) + 1;
    item.id = `${code}-U${String(n).padStart(2, "0")}`;
    item.created = new Date().toISOString().slice(0, 10);
    all.push(item);
    if (saveCustom(all)) location.reload();
  });
}

/* ---------- 刪除自訂卡片 ---------- */
function addDeleteButtons() {
  document.querySelectorAll(".phrase.custom").forEach((card) => {
    const del = document.createElement("button");
    del.type = "button";
    del.className = "copy-btn custom-del";
    del.textContent = "刪除";
    del.addEventListener("click", () => {
      if (!confirm(`確定刪除 ${card.dataset.customId}？`)) return;
      saveCustom(loadCustom().filter((x) => x.id !== card.dataset.customId));
      location.reload();
    });
    card.querySelector(".phrase-head").appendChild(del);
  });
}

/* ---------- 首頁：統計、匯出、匯入 ---------- */
function setupIndex() {
  const box = document.querySelector(".custom-summary");
  if (!box) return;
  const all = loadCustom();
  const countEl = box.querySelector(".custom-count");
  countEl.textContent = all.length;

  // 每個章節卡片顯示自訂數量
  document.querySelectorAll(".chapter").forEach((ch) => {
    const code = ch.querySelector(".code").textContent.trim();
    const n = all.filter((x) => x.page === code).length;
    if (n) {
      const s = document.createElement("span");
      s.className = "custom-count-chip";
      s.textContent = `＋ 我的 ${n}`;
      ch.querySelector(".count").after(s);
    }
  });

  box.querySelector(".custom-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `my-phrases-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  const input = box.querySelector(".custom-import");
  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data)) throw new Error();
      const merged = loadCustom();
      const ids = new Set(merged.map((x) => x.id));
      data.forEach((x) => { if (x && x.id && x.page && !ids.has(x.id)) merged.push(x); });
      if (saveCustom(merged)) location.reload();
    } catch (e) {
      alertBox("檔案格式不正確，請選擇從本網站匯出的 JSON 檔。");
    }
  });
}

/* ---------- 主流程 ---------- */
document.addEventListener("DOMContentLoaded", () => {
  setupIndex();
  setupCustomOnPage();

  const cards = [...document.querySelectorAll(".phrase")];
  if (!cards.length) return;

  const escapeHTML = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  cards.forEach((card) => {
    const tpl = card.querySelector(".template");
    const raw = tpl.textContent.trim();
    card.dataset.raw = raw;

    // 1. [[ ]] 上色
    tpl.innerHTML = escapeHTML(raw).replace(
      /\[\[(.+?)\]\]/g,
      '<span class="slot">$1</span>'
    );

    // 2. 複製按鈕
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.textContent = "複製模板";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(card.dataset.raw);
        btn.textContent = "已複製";
        btn.classList.add("done");
        setTimeout(() => {
          btn.textContent = "複製模板";
          btn.classList.remove("done");
        }, 1400);
      } catch (e) {
        btn.textContent = "請手動選取";
      }
    });
    card.querySelector(".phrase-head").appendChild(btn);

    // 卡片底部顯示標籤
    const tags = (card.dataset.tags || "").split(/\s+/).filter(Boolean);
    if (tags.length) {
      const list = document.createElement("div");
      list.className = "tag-list";
      list.innerHTML = tags.map((t) => `<span>#${escapeHTML(t)}</span>`).join("");
      card.appendChild(list);
    }
  });

  addDeleteButtons();

  // 3. 標籤篩選
  const bar = document.querySelector(".filter-bar");
  if (!bar) return;
  const allTags = [...new Set(cards.flatMap((c) =>
    (c.dataset.tags || "").split(/\s+/).filter(Boolean)))];

  const makeBtn = (label, tag) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", () => {
      bar.querySelectorAll("button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      cards.forEach((c) => {
        if (tag === "__mine__") { c.hidden = !c.classList.contains("custom"); return; }
        const t = (c.dataset.tags || "").split(/\s+/);
        c.hidden = tag !== null && !t.includes(tag);
      });
    });
    bar.appendChild(b);
    return b;
  };

  makeBtn(`全部（${cards.length}）`, null).classList.add("active");
  const mineCount = cards.filter((c) => c.classList.contains("custom")).length;
  if (mineCount) makeBtn(`我的（${mineCount}）`, "__mine__");
  allTags.forEach((t) => makeBtn(t, t));
});
