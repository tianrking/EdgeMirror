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
  accent = "#2563eb",
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
  const ui = UI_COPY[lang] ?? UI_COPY.en;
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
      --bg: #f4f7fb;
      --panel: #ffffff;
      --text: #0f172a;
      --muted: #526173;
      --border: #d8e1ed;
      --soft: #eef3f8;
      --code-bg: #111827;
      --code-text: #d9fce8;
      --shadow: 0 16px 38px rgba(15, 23, 42, 0.07);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      background: linear-gradient(180deg, #ffffff 0%, var(--bg) 42%, #eaf0f7 100%);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .accelerator-shell {
      width: min(1160px, calc(100% - 32px));
      margin: 0 auto;
      padding: 40px 0 72px;
    }
    .accelerator-hero {
      display: grid;
      grid-template-columns: minmax(0, 0.9fr) minmax(380px, 1.1fr);
      gap: 0;
      align-items: stretch;
      overflow: hidden;
      margin-bottom: 18px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .hero-copy {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 288px;
      padding: 34px 32px;
      border-left: 6px solid var(--accent-strong);
      background: linear-gradient(180deg, #ffffff, #f8fafc);
    }
    .status-pill {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 0 11px;
      border-radius: 999px;
      color: #9a3412;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .status-pill[data-status="stable"] {
      color: #166534;
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    h1 {
      margin: 16px 0 12px;
      font-size: clamp(34px, 4.4vw, 54px);
      line-height: 1.02;
      letter-spacing: 0;
    }
    p {
      margin: 0;
      color: var(--muted);
      font-size: 17px;
      line-height: 1.72;
      max-width: 720px;
    }
    .quick-card,
    .recipe-card { background: var(--panel); }
    .quick-card {
      display: grid;
      align-content: stretch;
      overflow: hidden;
      min-height: 288px;
      border-left: 1px solid var(--border);
    }
    .recipe-section {
      padding: 20px;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
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
      grid-template-columns: repeat(2, minmax(320px, 1fr));
      gap: 14px;
    }
    .recipe-card {
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
    }
    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 52px;
      padding: 13px 15px;
      border-bottom: 1px solid var(--border);
      background: #f8fafc;
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
      border: 1px solid var(--accent-strong);
      color: #ffffff;
      background: var(--accent-strong);
      font-size: 12px;
      font-weight: 900;
      cursor: pointer;
      transition: transform 0.18s ease, filter 0.18s ease;
    }
    button:hover { transform: translateY(-1px); filter: brightness(0.96); }
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
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    @media (max-width: 860px) {
      .accelerator-shell {
        width: min(100% - 24px, 680px);
        padding: 24px 0 52px;
      }
      .accelerator-hero {
        grid-template-columns: 1fr;
      }
      .hero-copy {
        min-height: 0;
        padding: 22px 18px;
      }
      .quick-card {
        min-height: 0;
        border-left: 0;
        border-top: 1px solid var(--border);
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
      .recipe-section {
        padding: 14px;
      }
    }
  `;
}
