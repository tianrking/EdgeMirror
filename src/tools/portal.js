import { PROJECT, TOOL_DEFINITIONS } from "../config.js";
import { getLanguage, LANGUAGES } from "../i18n.js";
import { getDockerRegistryHost, getToolBaseUrl, renderToolNav } from "../navigation.js";
import { escapeHtml } from "../proxy-utils.js";

const COPY = {
  en: {
    eyebrow: "EdgeMirror",
    title: "Edge mirrors for every developer source.",
    lead: "Open a guided mirror page, copy a ready command, or configure package managers and CLIs to use the edge routes directly.",
    stable: "Stable accelerators",
    stableHint: "Verified and recommended for daily use.",
    test: "Test accelerators",
    testHint: "New routes ready for validation and feedback.",
    open: "Open",
    command: "Command",
    services: "Services",
    primary: "Primary domain",
    health: "Health check",
  },
  es: {
    eyebrow: "EdgeMirror",
    title: "Mirrors edge para cada fuente developer.",
    lead: "Abre una pagina guiada, copia un comando listo o configura gestores de paquetes y CLIs para usar las rutas edge directamente.",
    stable: "Aceleradores Stable",
    stableHint: "Verificados y recomendados para uso diario.",
    test: "Aceleradores Test",
    testHint: "Rutas nuevas listas para validar y mejorar.",
    open: "Abrir",
    command: "Comando",
    services: "Servicios",
    primary: "Dominio principal",
    health: "Salud",
  },
  zh: {
    eyebrow: "EdgeMirror",
    title: "一个域名，聚合各种源加速。",
    lead: "可以打开网页直接使用，也可以复制命令，把边缘镜像地址写进包管理器、CLI、Docker 或下载工具。",
    stable: "Stable 加速服务",
    stableHint: "已验证，推荐日常使用。",
    test: "Test 加速服务",
    testHint: "新增能力，适合验证后逐步稳定。",
    open: "打开",
    command: "命令",
    services: "服务数量",
    primary: "主域名",
    health: "健康检查",
  },
};

const SERVICE_COPY = {
  pypi: {
    color: "#d89086",
    title: "PyPI / PyTorch",
    desc: {
      en: "Python packages, PyPI simple index, and PyTorch wheel downloads.",
      es: "Paquetes Python, indice simple de PyPI y wheels de PyTorch.",
      zh: "Python 包、PyPI simple index 与 PyTorch wheel 下载加速。",
    },
    command: (urls) => `pip install numpy -i ${urls.pypi}/simple/`,
  },
  hf: {
    color: "#d7aa45",
    title: "Hugging Face",
    desc: {
      en: "Model weights, datasets, API requests, and LFS file downloads.",
      es: "Pesos de modelos, datasets, API y descargas LFS.",
      zh: "模型权重、数据集、API 请求与 LFS 大文件下载加速。",
    },
    command: (urls) => `HF_ENDPOINT=${urls.hf} huggingface-cli download sentence-transformers/all-MiniLM-L6-v2`,
  },
  github: {
    color: "#7ead84",
    title: "GitHub Proxy",
    desc: {
      en: "Git clone, release assets, raw files, archives, and GitHub pages.",
      es: "Git clone, release assets, archivos raw, archivos comprimidos y paginas.",
      zh: "Git clone、Release 文件、Raw 文件、归档包与 GitHub 页面加速。",
    },
    command: (urls) => `git clone ${urls.github}/vercel/next.js.git`,
  },
  docker: {
    color: "#7db8d7",
    title: "Docker Registry",
    desc: {
      en: "Docker Hub and multi-registry image pulls through the current registry host.",
      es: "Pulls de Docker Hub y multiples registros por el host actual.",
      zh: "Docker Hub 与多镜像仓库拉取加速。",
    },
    command: (_urls, dockerHost) => `docker pull ${dockerHost}/library/nginx:latest`,
  },
  mirrors: {
    color: "#a99add",
    title: "Linux Mirrors",
    desc: {
      en: "APT, YUM, DNF, Pacman, wget, and curl mirror pass-through.",
      es: "Passthrough para APT, YUM, DNF, Pacman, wget y curl.",
      zh: "APT、YUM、DNF、Pacman、wget 与 curl 系统源透传加速。",
    },
    command: (urls) => `deb ${urls.mirrors}/http://archive.ubuntu.com/ubuntu/ jammy main restricted universe multiverse`,
  },
  proxy: {
    color: "#77b6ce",
    title: "Universal Proxy",
    desc: {
      en: "Public HTTP/HTTPS file URLs with redirect and filename handling.",
      es: "URLs publicas HTTP/HTTPS con redirecciones y nombres de archivo.",
      zh: "公开 HTTP/HTTPS 文件下载，支持重定向与文件名处理。",
    },
    command: (urls) => {
      const proxyBase = urls.proxy.endsWith("/proxy") ? urls.proxy : `${urls.proxy}/proxy`;
      return `curl -L -O "${proxyBase}/https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi"`;
    },
  },
  npm: {
    color: "#d88c8d",
    title: "npm Registry",
    desc: {
      en: "npm, pnpm, and yarn registry metadata plus tarball downloads.",
      es: "Metadata y tarballs para npm, pnpm y yarn.",
      zh: "npm、pnpm、yarn registry metadata 与 tarball 下载加速。",
    },
    command: (urls) => `npm install lodash --registry=${urls.npm}/`,
  },
  go: {
    color: "#80c6d8",
    title: "Go Modules",
    desc: {
      en: "GOPROXY-compatible module metadata, mod files, and zip downloads.",
      es: "Metadata GOPROXY, archivos mod y descargas zip.",
      zh: "兼容 GOPROXY 的 module metadata、mod 文件与 zip 包下载。",
    },
    command: (urls) => `go env -w GOPROXY=${urls.go},direct`,
  },
  maven: {
    color: "#d58b9a",
    title: "Maven / Gradle",
    desc: {
      en: "Maven Central, Google Maven, Gradle Plugin Portal, and JitPack.",
      es: "Maven Central, Google Maven, Gradle Plugin Portal y JitPack.",
      zh: "Maven Central、Google Maven、Gradle Plugin Portal 与 JitPack 加速。",
    },
    command: (urls) => `maven { url = uri("${urls.maven}/maven-central") }`,
  },
  crates: {
    color: "#c69a6d",
    title: "crates.io Sparse",
    desc: {
      en: "Cargo sparse registry index and crate package downloads.",
      es: "Indice sparse de Cargo y descargas de crates.",
      zh: "Cargo sparse registry index 与 crate 包下载加速。",
    },
    command: (urls) => `sparse+${urls.crates}/`,
  },
  downloads: {
    color: "#76b7ad",
    title: "Downloads",
    desc: {
      en: "Runtime installers, release assets, Open VSX, SourceForge, GitLab, and Gitea files.",
      es: "Instaladores, release assets, Open VSX, SourceForge, GitLab y Gitea.",
      zh: "运行时安装包、Release 文件、Open VSX、SourceForge、GitLab 与 Gitea 文件。",
    },
    command: (urls) => `curl -L -O "${urls.downloads}/node/v22.11.0/node-v22.11.0-x64.msi"`,
  },
};

export default {
  async fetch(request) {
    return new Response(htmlPage(request), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  },
};

function htmlPage(request) {
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const htmlLang = LANGUAGES[lang]?.htmlLang ?? "en";
  const urls = Object.fromEntries(TOOL_DEFINITIONS.map((tool) => [tool.key, getToolBaseUrl(request, tool.key)]));
  urls.portal = getToolBaseUrl(request, "portal");
  urls.help = getToolBaseUrl(request, "help");
  const dockerHost = getDockerRegistryHost(request);
  const nav = renderToolNav(request, "portal");
  const stableTools = TOOL_DEFINITIONS.filter((tool) => tool.status === "stable");
  const testTools = TOOL_DEFINITIONS.filter((tool) => tool.status === "test");

  return `<!doctype html>
<html lang="${htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(PROJECT.name)} | Edge Mirror Gateway</title>
  <meta name="description" content="${escapeHtml(PROJECT.description)}">
  <style>${portalCss()}</style>
</head>
<body>
  ${nav}
  <!-- identity: Edge mirrors -->
  <main class="portal-shell">
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">${escapeHtml(copy.eyebrow)}</span>
        <h1>${escapeHtml(copy.title)}</h1>
        <p>${escapeHtml(copy.lead)}</p>
        <div class="hero-actions">
          <a class="primary-action" href="${escapeHtml(urls.help)}">Help</a>
          <a class="secondary-action" href="${escapeHtml(urls.proxy)}">Proxy</a>
          <a class="secondary-action" href="${escapeHtml(urls.downloads)}">Downloads</a>
        </div>
      </div>
      <aside class="hero-panel">
        <div class="metric"><span>${escapeHtml(copy.services)}</span><strong>${TOOL_DEFINITIONS.length}</strong></div>
        <div class="metric"><span>${escapeHtml(copy.stable)}</span><strong>${stableTools.length}</strong></div>
        <div class="metric"><span>${escapeHtml(copy.test)}</span><strong>${testTools.length}</strong></div>
        <div class="metric wide"><span>${escapeHtml(copy.primary)}</span><strong>${escapeHtml(urls.portal)}</strong></div>
        <div class="metric wide"><span>${escapeHtml(copy.health)}</span><strong>${escapeHtml(urls.portal)}/healthz</strong></div>
      </aside>
    </section>

    ${section(copy.stable, copy.stableHint, stableTools, urls, dockerHost, lang, copy)}
    ${section(copy.test, copy.testHint, testTools, urls, dockerHost, lang, copy)}
  </main>
  <script>
    (function () {
      document.querySelectorAll("[data-copy-value]").forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          var original = button.textContent;
          navigator.clipboard.writeText(button.getAttribute("data-copy-value") || "").then(function () {
            button.textContent = "Copied";
            window.setTimeout(function () { button.textContent = original; }, 1300);
          });
        });
      });
    })();
  </script>
</body>
</html>`;
}

function section(title, hint, tools, urls, dockerHost, lang, copy) {
  return `<section class="service-section">
    <div class="section-head">
      <div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(hint)}</p>
      </div>
    </div>
    <div class="service-grid">
      ${tools.map((tool) => serviceCard(tool, urls, dockerHost, lang, copy)).join("")}
    </div>
  </section>`;
}

function serviceCard(tool, urls, dockerHost, lang, copy) {
  const meta = SERVICE_COPY[tool.key];
  const description = meta?.desc?.[lang] ?? meta?.desc?.en ?? tool.description;
  const command = meta?.command ? meta.command(urls, dockerHost) : urls[tool.key];
  const href = urls[tool.key];
  return `<article class="service-card" style="--accent:${escapeHtml(meta?.color ?? "#7da8dc")}">
    <a class="card-link" href="${escapeHtml(href)}" aria-label="${escapeHtml(copy.open)} ${escapeHtml(meta?.title ?? tool.title)}"></a>
    <div class="card-top">
      <div class="icon-mark">${escapeHtml((meta?.title ?? tool.title).slice(0, 1))}</div>
      <span class="status ${escapeHtml(tool.status)}">${escapeHtml(tool.status)}</span>
    </div>
    <h3>${escapeHtml(meta?.title ?? tool.title)}</h3>
    <p>${escapeHtml(description)}</p>
    <div class="command-row">
      <span>${escapeHtml(copy.command)}</span>
      <code>${escapeHtml(command)}</code>
      <button type="button" data-copy-value="${escapeHtml(command)}">Copy</button>
    </div>
  </article>`;
}

function portalCss() {
  return `
    :root{--bg:#f8fbfd;--panel:#fff;--text:#273445;--muted:#6a7887;--border:#e1eaf2;--shadow:0 18px 44px rgba(86,112,137,.1);--slate:#526678;--mist:#f1f7fa}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 10% 0%,rgba(125,184,215,.18),transparent 32%),radial-gradient(circle at 92% 8%,rgba(216,144,134,.13),transparent 28%),linear-gradient(180deg,#fff 0%,var(--bg) 48%,#f2f7fa 100%);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .portal-shell{width:min(1120px,calc(100% - 32px));margin:0 auto;padding:42px 0 76px}
    .hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.78fr);gap:14px;margin-bottom:16px}
    .hero-copy,.hero-panel,.service-card{background:rgba(255,255,255,.84);border:1px solid var(--border);border-radius:8px;box-shadow:var(--shadow);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
    .hero-copy{padding:clamp(26px,4vw,42px);border-left:6px solid #b8c9d6}
    .eyebrow{display:inline-flex;align-items:center;min-height:28px;padding:0 10px;border-radius:999px;background:var(--mist);color:var(--slate);border:1px solid var(--border);font-size:12px;font-weight:900;text-transform:uppercase}
    h1{margin:16px 0 12px;font-size:clamp(38px,5.6vw,64px);line-height:1.02;letter-spacing:0}p{margin:0;color:var(--muted);font-size:15px;line-height:1.66}.hero-copy p{max-width:760px;font-size:16px}
    .hero-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.primary-action,.secondary-action{display:inline-flex;align-items:center;justify-content:center;min-height:40px;border-radius:8px;padding:0 15px;text-decoration:none;font-size:13px;font-weight:900}.primary-action{background:#e8f1f6;color:#334155;border:1px solid #d5e3ec}.secondary-action{background:#fff;color:var(--slate);border:1px solid var(--border)}
    .hero-panel{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:14px;align-content:start}.metric{display:grid;gap:5px;padding:13px;border:1px solid var(--border);border-radius:8px;background:rgba(255,255,255,.76)}.metric.wide{grid-column:1/-1}.metric span{color:var(--muted);font-size:12px;font-weight:900;text-transform:uppercase}.metric strong{font-size:18px;overflow-wrap:anywhere}.metric:not(.wide) strong{font-size:28px}
    .service-section{margin-top:18px}.section-head{display:flex;justify-content:space-between;gap:16px;align-items:end;margin:0 2px 12px}h2{margin:0 0 4px;font-size:22px}.section-head p{font-size:14px}
    .service-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.service-card{position:relative;overflow:hidden;padding:18px;min-height:238px;display:grid;gap:12px;align-content:start}.service-card::before{content:"";position:absolute;inset:0 auto 0 0;width:5px;background:color-mix(in srgb,var(--accent) 68%,white)}.card-link{position:absolute;inset:0;z-index:1}.card-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.icon-mark{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:8px;background:color-mix(in srgb,var(--accent) 14%,white);color:color-mix(in srgb,var(--accent) 72%,#334155);font-weight:1000}.status{display:inline-flex;align-items:center;min-height:26px;padding:0 9px;border-radius:999px;font-size:11px;font-weight:900;text-transform:uppercase}.status.stable{background:#f2fbf6;color:#477761;border:1px solid #cfeada}.status.test{background:#fff8ec;color:#9b6a2d;border:1px solid #f3ddbd}
    h3{margin:0;font-size:20px}.service-card p{min-height:74px}.command-row{position:relative;z-index:2;margin-top:auto;display:grid;gap:7px;padding:12px;border:1px solid var(--border);border-radius:8px;background:#f8fbfd}.command-row span{color:var(--muted);font-size:11px;font-weight:900;text-transform:uppercase}.command-row code{color:#334155;font-size:12px;line-height:1.45;word-break:break-word;font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace}.command-row button{justify-self:start;min-height:30px;border:1px solid color-mix(in srgb,var(--accent) 34%,#fff);border-radius:8px;background:color-mix(in srgb,var(--accent) 18%,#fff);color:#334155;padding:0 10px;font-size:12px;font-weight:900;cursor:pointer}
    @media(max-width:960px){.hero,.service-grid{grid-template-columns:1fr}.hero-panel{grid-template-columns:repeat(2,minmax(0,1fr));overflow:visible}.metric.wide{grid-column:1/-1}.service-card{min-height:0}.service-card p{min-height:0}}
    @media(max-width:640px){.portal-shell{width:min(100% - 24px,640px);padding:24px 0 56px}h1{font-size:42px}.hero-copy{padding:22px 18px}.hero-panel{padding:10px}.section-head{display:block}.service-grid{gap:10px}}
  `;
}
