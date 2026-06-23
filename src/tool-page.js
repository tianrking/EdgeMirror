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
    </section>

    <p class="note-panel">${escapeHtml(note)}</p>
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
      --bg: #f6f8fb;
      --panel: #ffffff;
      --text: #0f172a;
      --muted: #5f6b7a;
      --border: #dbe4ef;
      --code-bg: #0f172a;
      --code-text: #dff7ec;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      background: linear-gradient(180deg, #ffffff 0%, var(--bg) 46%, #edf3f8 100%);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .accelerator-shell {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 48px 0 72px;
    }
    .accelerator-hero {
      display: grid;
      grid-template-columns: minmax(0, 0.95fr) minmax(360px, 1.05fr);
      gap: 22px;
      align-items: stretch;
      margin-bottom: 20px;
    }
    .hero-copy {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 252px;
      padding: 30px 0 30px 20px;
      border-left: 6px solid var(--accent-strong);
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
      font-size: clamp(36px, 5vw, 58px);
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
    .recipe-card,
    .note-panel {
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
    }
    .quick-card {
      display: grid;
      align-content: stretch;
      overflow: hidden;
      min-height: 252px;
    }
    .recipe-section { margin-top: 22px; }
    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
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
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
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
      background: #ffffff;
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
      margin-top: 18px;
      padding: 16px 18px;
      color: var(--muted);
      line-height: 1.68;
      font-size: 14px;
    }
    @media (max-width: 860px) {
      .accelerator-shell {
        width: min(100% - 28px, 680px);
        padding: 30px 0 52px;
      }
      .accelerator-hero {
        grid-template-columns: 1fr;
      }
      .hero-copy {
        min-height: 0;
        padding: 18px 0 18px 16px;
      }
      .quick-card {
        min-height: 0;
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
