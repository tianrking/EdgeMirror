import { LANGUAGES } from "./i18n.js";
import { escapeHtml } from "./proxy-utils.js";

const UI_COPY = {
  en: {
    quickStart: "Quick start",
    examples: "Recipes",
    statusStable: "Stable accelerator",
    statusTest: "Test accelerator",
    copy: "Copy",
    copied: "Copied",
  },
  es: {
    quickStart: "Inicio rapido",
    examples: "Recetas",
    statusStable: "Acelerador estable",
    statusTest: "Acelerador en prueba",
    copy: "Copiar",
    copied: "Copiado",
  },
  zh: {
    quickStart: "快速开始",
    examples: "使用示例",
    statusStable: "稳定加速器",
    statusTest: "测试加速器",
    copy: "复制",
    copied: "已复制",
  },
};

export function renderAcceleratorPage({
  accent = "#7da8dc",
  accentStrong = accent,
  cards,
  copy,
  lang,
  nav,
  note,
  primaryCommand,
  status = "test",
  title,
  pageTitle,
}) {
  const ui = normalizeUiCopy(lang, UI_COPY[lang] ?? UI_COPY.en);
  const primaryCard = primaryCommand ?? cards[0];

  return `<!doctype html>
<html lang="${LANGUAGES[lang].htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <style>${acceleratorPageCss(accent, accentStrong)}</style>
</head>
<body>
  ${nav}
  <!-- identity: ${title.replaceAll("--", "")} -->
  <main class="accelerator-shell">
    <section class="accelerator-hero">
      <div class="hero-copy">
        <span class="status-pill" data-status="${escapeHtml(status)}">${escapeHtml(status === "stable" ? ui.statusStable : ui.statusTest)}</span>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(copy.lead)}</p>
      </div>
      <article class="quick-card">
        <div class="card-head">
          <span>${escapeHtml(ui.quickStart)}</span>
          <button type="button" data-copy-command="${escapeHtml(primaryCard.command)}">${escapeHtml(ui.copy)}</button>
        </div>
        <pre><code>${escapeHtml(primaryCard.command)}</code></pre>
      </article>
    </section>

    <section class="recipe-section">
      <div class="section-title">
        <span>${escapeHtml(ui.examples)}</span>
      </div>
      <div class="recipe-grid">
        ${cards.map((card) => commandCard(card, ui)).join("")}
      </div>
      <p class="note-panel">${escapeHtml(note)}</p>
    </section>
  </main>
  <script>
    (function () {
      var copiedText = ${JSON.stringify(ui.copied)};
      var copyText = ${JSON.stringify(ui.copy)};
      document.querySelectorAll("[data-copy-command]").forEach(function (button) {
        button.addEventListener("click", function () {
          var text = button.getAttribute("data-copy-command") || "";
          navigator.clipboard.writeText(text).then(function () {
            button.textContent = copiedText;
            window.setTimeout(function () { button.textContent = copyText; }, 1400);
          }).catch(function () {
            button.textContent = copyText;
          });
        });
      });
    })();
  </script>
</body>
</html>`;
}

function normalizeUiCopy(lang, ui) {
  if (lang !== "zh") return ui;
  return {
    ...ui,
    quickStart: "快速开始",
    examples: "使用示例",
    statusStable: "稳定加速器",
    statusTest: "测试加速器",
    copy: "复制",
    copied: "已复制",
  };
}

function commandCard(card, ui) {
  return `<article class="recipe-card">
    <div class="card-head">
      <h2>${escapeHtml(card.title)}</h2>
      <button type="button" data-copy-command="${escapeHtml(card.command)}">${escapeHtml(ui.copy)}</button>
    </div>
    <pre><code>${escapeHtml(card.command)}</code></pre>
  </article>`;
}

function acceleratorPageCss(accent, accentStrong) {
  return `
    :root {
      --accent: ${accent};
      --accent-strong: ${accentStrong};
      --bg: #f8fbfd;
      --panel: #ffffff;
      --text: #243141;
      --muted: #6d7b8a;
      --border: #e1eaf2;
      --soft: #f4f8fb;
      --code-bg: #f7fafc;
      --code-text: #2d3d4f;
      --shadow: 0 18px 42px rgba(86, 112, 137, 0.09);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 13%, transparent) 0, transparent 32%),
        linear-gradient(180deg, #ffffff 0%, var(--bg) 54%, #f2f7fa 100%);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .accelerator-shell {
      width: min(980px, calc(100% - 32px));
      margin: 0 auto;
      padding: 42px 0 72px;
    }
    .accelerator-hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
      align-items: stretch;
      margin-bottom: 16px;
    }
    .hero-copy {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      justify-content: flex-start;
      min-height: 0;
      padding: 22px 24px 8px;
    }
    .status-pill {
      align-self: center;
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 0 11px;
      border-radius: 999px;
      color: #9b6a2d;
      background: #fff8ec;
      border: 1px solid #f3ddbd;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .status-pill[data-status="stable"] {
      color: #477761;
      background: #f2fbf6;
      border-color: #cfeada;
    }
    h1 {
      margin: 14px 0 10px;
      font-size: clamp(30px, 4vw, 42px);
      line-height: 1.08;
      letter-spacing: 0;
    }
    p {
      margin: 0;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.66;
      max-width: 720px;
    }
    .quick-card,
    .recipe-card {
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .quick-card {
      display: grid;
      align-content: stretch;
      overflow: hidden;
      min-height: 0;
    }
    .recipe-section {
      padding: 0;
      background: transparent;
      border: 0;
      border-radius: 0;
      box-shadow: none;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 2px 12px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .section-title::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    .recipe-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    .recipe-card {
      overflow: hidden;
    }
    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 52px;
      padding: 13px 15px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(180deg, #ffffff, #fbfdff);
    }
    .card-head span,
    h2 {
      min-width: 0;
      margin: 0;
      color: var(--text);
      font-size: 14px;
      font-weight: 900;
      overflow-wrap: anywhere;
    }
    button {
      flex: 0 0 auto;
      min-height: 32px;
      padding: 0 11px;
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--accent-strong) 44%, #ffffff);
      color: #334155;
      background: color-mix(in srgb, var(--accent) 18%, #ffffff);
      font-size: 12px;
      font-weight: 900;
      cursor: pointer;
      transition: transform 0.18s ease, filter 0.18s ease;
    }
    button:hover { transform: translateY(-1px); filter: saturate(1.05); background: color-mix(in srgb, var(--accent) 26%, #ffffff); }
    pre {
      min-height: 100%;
      margin: 0;
      padding: 16px;
      overflow-x: auto;
      color: var(--code-text);
      background: var(--code-bg);
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }
    code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    }
    .note-panel {
      margin: 16px 0 0;
      padding: 14px 16px;
      color: var(--muted);
      line-height: 1.68;
      font-size: 14px;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    @media (max-width: 860px) {
      .accelerator-shell {
        width: min(100% - 24px, 680px);
        padding: 24px 0 52px;
      }
      .hero-copy {
        padding: 12px 8px 6px;
      }
      .recipe-grid {
        grid-template-columns: 1fr;
      }
      h1 {
        font-size: 34px;
      }
      p {
        font-size: 15px;
      }
      .card-head {
        align-items: flex-start;
      }
    }
  `;
}
