# AGENTS.md｜學術佳句庫 Academic Phrasebank

> 給 AI 的專案手冊。每次開始工作前請先完整讀完這份文件，再動手修改任何檔案。
> 如果使用者的要求和這份文件衝突，先指出衝突並詢問，不要自行決定。

---

## 1. 專案目的

這是一個「依論文章節分類」的英文學術句型庫，給正在寫 SCI 期刊論文、英文寫作信心不足的研究生使用。

- 使用者在讀論文時看到好用的句子，把它**抽象成句型模板**收進來，之後寫論文時直接套用。
- 每一個句型都要回答三個問題：**這句話在做什麼（功能）、怎麼套（模板）、套完長什麼樣（例句）**。
- 例句的領域以作者的研究為主：運動選才、多準則決策（AHP、FAHP、VIKOR、TOPSIS）、機器學習與 SHAP、姿態估計與動作分析。

網站是純靜態網頁（HTML + CSS + 原生 JavaScript），部署在 GitHub Pages，**不使用任何框架、建置工具或資料庫**。

---

## 2. 資料夾結構

```
academic-phrasebank/
├── AGENTS.md              ← 本文件（主要規則）
├── CLAUDE.md              ← 指向本文件，另含 Claude 專用提醒
├── README.md              ← 給人看的專案介紹
├── .nojekyll              ← 空檔案，讓 GitHub Pages 不經過 Jekyll 處理（不可刪除）
├── index.html             ← 首頁：章節卡片目錄
├── pages/                 ← 每個論文章節一頁
│   ├── 01-background.html
│   ├── 02-research-gap.html
│   └── ...
├── templates/
│   └── page-template.html ← 新增章節頁時「複製這個檔案」
└── assets/
    ├── style.css          ← 全站唯一的樣式表
    └── main.js            ← 全站唯一的腳本（模板高亮、複製、標籤篩選）
```

規則：

- 新頁面**只能**放在 `pages/`。不要在根目錄或其他地方建立 HTML。
- 不要新增第二個 CSS 或 JS 檔。需要新樣式就加在 `assets/style.css` 最後面，並寫上註解說明用途。
- 不要在 HTML 裡寫 `<style>` 或 inline `style="..."`，也不要寫 `<script>` 內容（只能引用 `main.js`）。

---

## 3. 檔案命名

| 項目 | 規則 | 範例 |
|---|---|---|
| 章節頁 | `兩位數序號-英文小寫-連字號.html` | `07-conclusion.html` |
| 序號 | 依論文出現順序，接續最後一個號碼 | 現有到 06，下一個就是 07 |
| 句型編號（ID） | `章節代碼-兩位數流水號` | `GAP-04` |

**章節代碼對照表**（新增章節時要在這裡補一列）：

| 檔案 | 章節 | 代碼 |
|---|---|---|
| 01-background.html | 研究背景 Background | BG |
| 02-research-gap.html | 研究缺口 Research Gap | GAP |
| 03-aim-contribution.html | 研究目的與貢獻 Aim & Contribution | AIM |
| 04-methods.html | 研究方法 Methods | MTD |
| 05-results.html | 結果呈現 Results | RES |
| 06-discussion-limitation.html | 討論與限制 Discussion & Limitation | DIS |

句型編號一旦給出就不要改，刪除句型時也**不要重新編號**，避免使用者筆記中的引用失效。

---

## 4. 頁面結構

### 4.1 章節頁（`pages/*.html`）

一律從 `templates/page-template.html` 複製，結構固定為：

1. `<header class="page-header">`：返回首頁連結、章節代碼徽章、中文標題、英文標題、一句話說明這個章節在論文中的任務。
2. `<section class="usage">`：「寫作提醒」，2 到 4 點，說明這個章節常見的寫作錯誤或結構建議。
3. `<div class="filter-bar">`：留空即可，`main.js` 會自動依卡片的 `data-tags` 產生篩選按鈕。
4. `<main class="phrase-list">`：句型卡片，**每頁 5 到 12 張**。
5. `<footer>`：上一章 / 下一章連結。第一頁沒有上一章、最後一頁沒有下一章。

### 4.2 句型卡片（唯一允許的格式）

```html
<article class="phrase" id="GAP-01" data-tags="對比 既有研究">
  <div class="phrase-head">
    <span class="phrase-id">GAP-01</span>
    <h3 class="func">指出既有研究忽略的面向</h3>
  </div>
  <p class="template">Although [[previous studies]] have examined [[A]], few have considered [[B]].</p>
  <p class="example">Although previous studies have examined physical fitness indicators, few have considered how coaches weigh them in practice.</p>
  <p class="note">先肯定前人做過什麼，再用 few have 帶出缺口。語氣比 no study has 保守，審稿人比較不會挑戰。</p>
</article>
```

欄位規則：

- `id` 必須等於 `.phrase-id` 的文字，且全站唯一。
- `data-tags`：1 到 3 個**中文**標籤，以半形空白分隔。優先沿用同一頁已有的標籤，不要每張卡都發明新標籤。
- `.func`：用中文寫「這句話的功能」，動詞開頭，12 個字以內。
- `.template`：英文句型。需要替換的部分用 `[[ ]]` 包起來，`main.js` 會自動上色，複製時會保留括號。
- `.example`：套用模板後的完整英文例句，必須和模板結構一致。
- `.note`：中文說明，1 到 3 句，講「什麼時候用、要注意什麼」，不要只是翻譯例句。

### 4.3 首頁（`index.html`）

- 章節卡片放在 `<!-- PAGES:START -->` 和 `<!-- PAGES:END -->` 之間，依序號排列。
- 每張卡片顯示：代碼、中文標題、英文標題、一句說明、句型數量（`n 個句型`）。
- 新增或刪除句型後，**一定要同步更新首頁的句型數量**和頁尾的總數。

---

## 5. 英文寫作規則（非常重要）

所有 `.template` 與 `.example` 的英文都要符合以下規則，這也是使用者自己寫論文時的規則：

1. **絕對不要使用破折號 em dash（—）或 en dash（–）**，也不要用分號代替破折號。需要補充說明時，改用逗號、括號，或拆成兩句。
2. 避免空洞的強調開頭，例如 *It should be emphasized that*、*It is worth noting that*、*Notably,* 開頭的句子不要收。
3. 避免過度對稱的排比句（例如連續三個 not only... but also...）。
4. 語氣是工程類論文、研究生自然寫出來的程度，不需要華麗辭藻。
5. 一個句型只示範一個功能。如果一句話同時在講背景和缺口，拆成兩張卡片。
6. 例句**必須是原創**。可以參考讀到的論文句子結構，但不可整句照抄，也不要放真實的數據或作者名，避免看起來像引用。

收錄前自我檢查：在要新增的內容裡搜尋 `—`、`–`、`;`，有出現就改寫。

---

## 6. 視覺風格

- 風格關鍵字：**乾淨的紫色系筆記本**。淡紫底、深紫字、紫色強調、粉紅點綴，細線分隔，不要漸層、陰影過重或 emoji。
- 配色由 `style.css` 最上方 6 個 `--hb-*` 色票決定（background #F9F5FF、surface #D3C4FF、text #21123B、primary #865DFF、accent #FF8DC7、on-primary #FFFFFF），要換配色只改這 6 個值。
- 顏色只能使用 `style.css` 中 `:root` 定義的變數，不要寫死色碼。
- 中文標題用 Noto Serif TC，內文用 Noto Sans TC，英文句型用 Source Serif 4。
- 手機寬度（360px）也要能閱讀，不可出現橫向捲軸。

---

## 7. 常見任務流程

### A. 在既有章節新增句型

1. 打開對應的 `pages/xx-*.html`，找到最後一張卡片的編號，新卡片 +1。
2. 依 4.2 格式寫卡片，加在 `phrase-list` 最後面。
3. 依第 5 節檢查英文。
4. 更新 `index.html` 該章節的句型數量與頁尾總數。

### B. 新增一個章節頁

1. 決定序號、英文 slug、章節代碼，先在第 3 節的對照表補一列。
2. 複製 `templates/page-template.html` 到 `pages/`，依命名規則改檔名。
3. 填入所有 `{{ }}` 佔位文字，**完成後檔案中不可殘留任何 `{{`**。
4. 至少放 5 張句型卡片。
5. 修改前一頁的「下一章」連結，讓新頁面接上。
6. 在 `index.html` 的 PAGES 區塊加入章節卡片，更新總數。

### C. 使用者貼上一段論文原文，請你收錄

1. 先判斷這段話屬於哪個章節、在做什麼功能。
2. 把專有名詞、數字、研究對象抽換成 `[[ ]]`，變成模板。
3. 用作者的研究領域重寫一個**新的**例句（不要直接用原文當例句）。
4. 先把「建議放在哪一頁、編號、模板、例句」列給使用者確認，再寫入檔案。

### D. 使用者上傳 PDF 文獻，請你批次收錄

1. 讀完整篇 PDF，只從 Introduction、Methods、Results、Discussion、Conclusion 挑句子，跳過摘要、參考文獻、圖表說明。
2. 挑出 **3 到 8 句**「結構好、可以重複使用」的句子。只有專有名詞和數字的句子不要收。
3. 先用表格列給使用者確認，欄位為：原文句子、建議章節、功能、模板、新例句。
   使用者勾選要收哪幾句後，才依任務 A 寫入檔案。
4. 模板與例句一樣要遵守第 5 節，原文句子**只出現在確認表格裡，不寫進網頁**。
5. 如果某句不屬於現有任何章節，建議使用者是否依任務 B 新增章節，不要硬塞。

---

## 8. 不要做的事

- 不要改動 `main.js` 的卡片解析邏輯，除非使用者明確要求。
- 不要把網站改成 React、Vue 或加入 npm 套件。
- 不要大幅改版視覺風格。使用者要求「優化畫面」時，只調整間距、字級、易讀性。
- 不要刪除使用者已收錄的句型，除非使用者明確指定編號。
