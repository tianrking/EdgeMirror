import { getLanguage, LANGUAGES } from "../i18n.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { corsPreflightResponse, escapeHtml, htmlResponse, joinUrlPath, parseTargetUrlFromPath, proxyRequest, textResponse } from "../proxy-utils.js";

const SOURCES = {
  node: "https://nodejs.org/dist",
  python: "https://www.python.org/ftp/python",
  golang: "https://go.dev/dl",
  rustup: "https://static.rust-lang.org",
  openvsx: "https://open-vsx.org",
  sourceforge: "https://downloads.sourceforge.net",
  gitlab: "https://gitlab.com",
  gitea: "https://gitea.com",
  cmake: "https://github.com/Kitware/CMake/releases/download",
  "git-for-windows": "https://github.com/git-for-windows/git/releases/download",
};

const COPY = {
  en: {
    lead: "Paste a release asset or runtime installer URL, then download it through the edge or copy ready-to-run wget and curl commands.",
    note: "Status: Test. Good for binary installers and release assets; authenticated or hotlink-protected upstreams still follow the original site's rules.",
    placeholder: "Paste a file URL, or choose an example below",
    inputLabel: "File URL",
    downloadNow: "Download now",
    browser: "Browser download",
    terminal: "Terminal commands",
    examples: "Ready examples",
    copy: "Copy",
    copied: "Copied",
  },
  es: {
    lead: "Pega la URL de un instalador o release asset, luego descargalo por el edge o copia comandos wget y curl listos.",
    note: "Estado: Test. Adecuado para instaladores binarios y release assets; los origenes con login o proteccion anti-hotlink siguen sus reglas.",
    placeholder: "Pega una URL de archivo o elige un ejemplo",
    inputLabel: "URL de archivo",
    downloadNow: "Descargar ahora",
    browser: "Descarga en navegador",
    terminal: "Comandos de terminal",
    examples: "Ejemplos listos",
    copy: "Copiar",
    copied: "Copiado",
  },
  zh: {
    lead: "粘贴安装包或 release 文件地址，即可通过边缘节点下载，也可以直接复制 wget / curl 命令。",
    note: "状态：Test。适合二进制安装包和 release asset 下载；需要登录或防盗链的上游仍然遵循原站规则。",
    placeholder: "粘贴文件 URL，或选择下方示例",
    inputLabel: "文件 URL",
    downloadNow: "立即下载",
    browser: "网页下载",
    terminal: "命令行",
    examples: "常用示例",
    copy: "复制",
    copied: "已复制",
  },
};

const EXAMPLES = [
  ["Node.js", "https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi"],
  ["Python", "https://www.python.org/ftp/python/3.12.7/python-3.12.7-amd64.exe"],
  ["Go", "https://go.dev/dl/go1.23.3.windows-amd64.msi"],
  ["Rustup", "https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe"],
];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseUrl = getToolBaseUrl(request, "downloads");

    if (request.method === "OPTIONS") {
      return corsPreflightResponse();
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return htmlResponse(renderPage(request, baseUrl));
    }

    const directTarget = parseTargetUrlFromPath(url.pathname, url.search);
    if (directTarget) {
      return proxyRequest(request, directTarget, {
        redirectBaseUrl: baseUrl,
        cacheControl: "public, max-age=300",
      });
    }

    const [, sourceKey, ...rest] = url.pathname.split("/");
    const upstream = SOURCES[sourceKey];
    if (!upstream) {
      return textResponse(`Unknown download source: ${sourceKey || "(empty)"}`, { status: 404 });
    }

    const target = joinUrlPath(upstream, `/${rest.join("/")}`, url.search);
    return proxyRequest(request, target, {
      redirectBaseUrl: `${baseUrl}/${sourceKey}`,
      cacheControl: "public, max-age=300",
    });
  },
};

function renderPage(request, baseUrl) {
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const nav = renderToolNav(request, "downloads");
  const exampleUrl = EXAMPLES[0][1];
  const acceleratedUrl = `${baseUrl}/${exampleUrl}`;

  return `<!doctype html>
<html lang="${LANGUAGES[lang].htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Downloads Proxy | EdgeMirror</title>
  <style>${downloadPageCss()}</style>
</head>
<body>
  ${nav}
  <!-- identity: Runtime & Release Downloads -->
  <main class="downloads-shell">
    <section class="download-hero">
      <div class="hero-copy">
        <span class="status">Test accelerator</span>
        <h1>Runtime & Release Downloads</h1>
        <p>${escapeHtml(copy.lead)}</p>
      </div>
      <div class="download-panel">
        <label for="fileUrl">${escapeHtml(copy.inputLabel)}</label>
        <input id="fileUrl" type="url" value="${escapeHtml(exampleUrl)}" placeholder="${escapeHtml(copy.placeholder)}" autocomplete="off">
        <div class="result-box">
          <span>${escapeHtml(copy.browser)}</span>
          <code id="acceleratedUrl">${escapeHtml(acceleratedUrl)}</code>
          <a class="download-btn" id="downloadBtn" href="${escapeHtml(acceleratedUrl)}" target="_blank" rel="noreferrer">${escapeHtml(copy.downloadNow)}</a>
        </div>
      </div>
    </section>

    <section class="command-grid">
      <article class="mini-card">
        <div class="mini-head"><span>wget</span><button type="button" data-copy-target="wgetCommand">${escapeHtml(copy.copy)}</button></div>
        <pre><code id="wgetCommand">wget "${escapeHtml(acceleratedUrl)}"</code></pre>
      </article>
      <article class="mini-card">
        <div class="mini-head"><span>curl</span><button type="button" data-copy-target="curlCommand">${escapeHtml(copy.copy)}</button></div>
        <pre><code id="curlCommand">curl -L -O "${escapeHtml(acceleratedUrl)}"</code></pre>
      </article>
    </section>

    <section class="examples">
      <div class="section-title">${escapeHtml(copy.examples)}</div>
      <div class="example-grid">
        ${EXAMPLES.map(([name, url]) => `<button type="button" class="example-card" data-example-url="${escapeHtml(url)}"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(url)}</span></button>`).join("")}
      </div>
    </section>

    <p class="note-panel">${escapeHtml(copy.note)}</p>
  </main>
  <script>
    (function () {
      var baseUrl = ${JSON.stringify(baseUrl)};
      var copyText = ${JSON.stringify(copy.copy)};
      var copiedText = ${JSON.stringify(copy.copied)};
      var input = document.getElementById("fileUrl");
      var accelerated = document.getElementById("acceleratedUrl");
      var downloadBtn = document.getElementById("downloadBtn");
      var wget = document.getElementById("wgetCommand");
      var curl = document.getElementById("curlCommand");

      function buildUrl(value) {
        var raw = (value || "").trim();
        if (!/^https?:\\/\\//i.test(raw)) return "";
        return baseUrl + "/" + raw;
      }

      function update() {
        var next = buildUrl(input.value);
        if (!next) return;
        accelerated.textContent = next;
        downloadBtn.href = next;
        wget.textContent = 'wget "' + next + '"';
        curl.textContent = 'curl -L -O "' + next + '"';
      }

      input.addEventListener("input", update);
      document.querySelectorAll("[data-example-url]").forEach(function (button) {
        button.addEventListener("click", function () {
          input.value = button.getAttribute("data-example-url") || "";
          update();
        });
      });
      document.querySelectorAll("[data-copy-target]").forEach(function (button) {
        button.addEventListener("click", function () {
          var target = document.getElementById(button.getAttribute("data-copy-target"));
          navigator.clipboard.writeText(target.textContent || "").then(function () {
            button.textContent = copiedText;
            window.setTimeout(function () { button.textContent = copyText; }, 1400);
          });
        });
      });
    })();
  </script>
</body>
</html>`;
}

function downloadPageCss() {
  return `
    :root{--accent:#76b7ad;--accent-dark:#5e9d94;--bg:#f8fbfd;--text:#273445;--muted:#6a7887;--border:#e1eaf2;--panel:#fff;--code:#f8fbfd;--code-text:#334155;--shadow:0 18px 44px rgba(86,112,137,.1)}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 12% 4%,rgba(118,183,173,.18),transparent 30%),radial-gradient(circle at 88% 8%,rgba(125,184,215,.12),transparent 28%),linear-gradient(180deg,#fff 0%,var(--bg) 52%,#f3f7fa 100%);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .downloads-shell{width:min(980px,calc(100% - 32px));margin:0 auto;padding:42px 0 72px}
    .download-hero{display:grid;grid-template-columns:minmax(0,.86fr) minmax(340px,1.14fr);gap:14px;align-items:stretch;margin-bottom:14px}
    .hero-copy,.download-panel,.mini-card,.examples,.note-panel{background:rgba(255,255,255,.86);border:1px solid var(--border);border-radius:8px;box-shadow:var(--shadow)}
    .hero-copy{padding:26px;border-left:6px solid #b7dcd6;display:flex;flex-direction:column;justify-content:center}
    .status{align-self:flex-start;background:#f2fbf9;color:#5e9d94;border:1px solid #cce8e2;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900;text-transform:uppercase}
    h1{margin:14px 0 10px;font-size:clamp(31px,4vw,44px);line-height:1.08;letter-spacing:0}p{margin:0;color:var(--muted);font-size:15px;line-height:1.66}
    .download-panel{padding:22px;display:grid;gap:12px}label,.section-title{font-size:13px;font-weight:900;color:var(--text)}input{width:100%;min-height:46px;border:1px solid var(--border);border-radius:8px;padding:0 13px;color:var(--text);background:#fff;font:13px "SFMono-Regular",Consolas,monospace;outline:none}input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(15,118,110,.12)}
    .result-box{display:grid;gap:8px}.result-box span{font-size:12px;font-weight:900;color:var(--muted);text-transform:uppercase}.result-box code{display:block;background:#f8fafc;border:1px solid var(--border);border-radius:8px;padding:12px;color:var(--text);font-size:12px;line-height:1.5;word-break:break-word}
    .download-btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;border-radius:8px;background:#e6f4f1;color:#334155;border:1px solid #cce8e2;text-decoration:none;font-size:13px;font-weight:900}.download-btn:hover{background:#d9eee9}
    .command-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:14px}.mini-card{overflow:hidden}.mini-head{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:50px;padding:12px 14px;border-bottom:1px solid var(--border)}.mini-head span{font-size:13px;font-weight:900;text-transform:uppercase}.mini-head button{min-height:32px;border:1px solid #cce8e2;background:#e6f4f1;color:#334155;border-radius:8px;padding:0 11px;font-size:12px;font-weight:900;cursor:pointer}
    pre{margin:0;padding:14px;background:var(--code);color:var(--code-text);font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word}code{font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace}
    .examples{padding:16px;margin-bottom:14px}.section-title{margin-bottom:12px}.example-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.example-card{display:grid;gap:6px;text-align:left;border:1px solid var(--border);border-radius:8px;background:#fff;padding:12px;cursor:pointer}.example-card:hover{border-color:var(--accent)}.example-card strong{font-size:14px}.example-card span{color:var(--muted);font-size:12px;line-height:1.4;word-break:break-word}
    .note-panel{padding:14px 16px;color:var(--muted);font-size:13px;line-height:1.65}
    @media(max-width:760px){.downloads-shell{width:min(100% - 24px,640px);padding:24px 0 54px}.download-hero,.command-grid{grid-template-columns:1fr}.hero-copy,.download-panel{padding:18px}.example-grid{grid-template-columns:1fr}h1{font-size:34px}}
  `;
}
