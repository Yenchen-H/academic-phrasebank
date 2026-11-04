/* =========================================================
   學術佳句庫｜全站唯一腳本
   1. 把 .template 中的 [[ ]] 轉成上色的 slot
   2. 每張卡片加「複製模板」按鈕
   3. 依 data-tags 自動產生標籤篩選按鈕
   卡片格式見 AGENTS.md 4.2，請勿任意更改解析邏輯
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
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
        const t = (c.dataset.tags || "").split(/\s+/);
        c.hidden = tag !== null && !t.includes(tag);
      });
    });
    bar.appendChild(b);
    return b;
  };

  makeBtn(`全部（${cards.length}）`, null).classList.add("active");
  allTags.forEach((t) => makeBtn(t, t));
});
