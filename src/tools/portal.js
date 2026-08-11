import { CATALOG_DEFINITION, PROJECT, TOOL_DEFINITIONS } from "../config.js";
import { getLanguage, LANGUAGES } from "../i18n.js";
import { getDockerRegistryHost, getToolBaseUrl, renderToolNav } from "../navigation.js";
import { escapeHtml } from "../proxy-utils.js";
import { ADAPTER_TARGETS, REPOSITORY_UI_TARGETS } from "../repositories/config-generator.js";

const COPY = {
  en: {
    eyebrow: "One domain · every source",
    title: "Your install traffic, routed with intent.",
    lead: "EdgeMirror turns one Cloudflare deployment into a read-only gateway for operating-system repositories, developer registries, SDKs, OCI images, Git, and direct downloads.",
    openCatalog: "Configure sources",
    readGuide: "Read the guide",
    live: "Gateway online",
    checking: "Checking gateway",
    unavailable: "Gateway unavailable",
    sourceCount: "System sources",
    routeCount: "Developer routes",
    cache: "Cache",
    storage: "Extra storage",
    noStore: "NO-STORE",
    none: "NONE",
    coverageKicker: "Coverage",
    coverageTitle: "One gateway, eight package ecosystems.",
    coverageHint: "Fixed upstream roots keep generated configuration predictable and auditable.",
    servicesKicker: "Developer routes",
    servicesTitle: "Existing accelerators stay compatible.",
    servicesHint: "Old paths continue working while canonical namespaces provide a clearer long-term model.",
    open: "Open",
    copy: "Copy",
    copied: "Copied",
    architectureKicker: "Route model",
    architectureTitle: "Clear namespaces, unchanged upstream paths.",
    architectureHint: "The Worker identifies the source, forwards the remaining path, and returns the stream without persistent storage.",
    configureAll: "Open all configurations",
  },
  es: {
    eyebrow: "Un dominio · todas las fuentes",
    title: "Trafico de instalacion, enrutado con intencion.",
    lead: "EdgeMirror convierte un despliegue Cloudflare en un gateway de solo lectura para repositorios, registries, SDKs, OCI, Git y descargas.",
    openCatalog: "Configurar fuentes",
    readGuide: "Abrir guia",
    live: "Gateway disponible",
    checking: "Comprobando gateway",
    unavailable: "Gateway no disponible",
    sourceCount: "Fuentes de sistema",
    routeCount: "Rutas developer",
    cache: "Cache",
    storage: "Almacenamiento",
    noStore: "NO-STORE",
    none: "NINGUNO",
    coverageKicker: "Cobertura",
    coverageTitle: "Un gateway, ocho ecosistemas de paquetes.",
    coverageHint: "Upstreams fijos mantienen la configuracion predecible y auditable.",
    servicesKicker: "Rutas developer",
    servicesTitle: "Los aceleradores existentes siguen compatibles.",
    servicesHint: "Las rutas antiguas siguen activas y los namespaces canonicos ofrecen un modelo mas claro.",
    open: "Abrir",
    copy: "Copiar",
    copied: "Copiado",
    architectureKicker: "Modelo de rutas",
    architectureTitle: "Namespaces claros, paths upstream intactos.",
    architectureHint: "El Worker identifica la fuente, reenvia el resto del path y devuelve el stream sin almacenamiento persistente.",
    configureAll: "Abrir todas las configuraciones",
  },
  zh: {
    eyebrow: "一个域名 · 全部来源",
    title: "把每一次安装请求，准确送到该去的地方。",
    lead: "EdgeMirror 将一次 Cloudflare 部署变成只读镜像网关，统一承载系统仓库、开发者 Registry、SDK、OCI 镜像、Git 与直接下载。",
    openCatalog: "配置全部来源",
    readGuide: "查看使用指南",
    live: "网关在线",
    checking: "正在检查网关",
    unavailable: "网关不可用",
    sourceCount: "系统源",
    routeCount: "开发者入口",
    cache: "缓存",
    storage: "附加存储",
    noStore: "NO-STORE",
    none: "无",
    coverageKicker: "覆盖范围",
    coverageTitle: "一个网关，覆盖八类包管理生态。",
    coverageHint: "固定上游根目录，让生成的配置可预测、可审计。",
    servicesKicker: "开发者入口",
    servicesTitle: "原有加速器继续兼容。",
    servicesHint: "旧路径保持可用，同时用规范命名空间建立更清晰的长期结构。",
    open: "打开",
    copy: "复制",
    copied: "已复制",
    architectureKicker: "路由模型",
    architectureTitle: "命名空间清晰，上游路径不变。",
    architectureHint: "Worker 只识别来源、转发剩余路径并流式返回，不引入持久化存储。",
    configureAll: "打开完整配置中心",
  },
};

const ECOSYSTEMS = [
  ["APT", "Debian · Ubuntu · Raspberry Pi · Termux", "apt", "#76b9d2"],
  ["RPM", "Fedora · EPEL · CentOS · Rocky · Alma · openSUSE", "rpm", "#d9a35d"],
  ["PACMAN", "Arch · Arch Linux ARM · MSYS2", "pacman", "#78b58e"],
  ["APK / OPKG", "Alpine · OpenWrt · ImmortalWrt", "openwrt", "#c68ba0"],
  ["XBPS / PKG", "Void glibc · Void musl · FreeBSD", "other", "#9a91cf"],
  ["CONDA", "Anaconda defaults · conda-forge", "other", "#6bb8b1"],
  ["SDK", "Node.js · Flutter · Runtime downloads", "developer", "#7e9fc4"],
  ["OCI / GIT", "Docker Registry · GitHub", "developer", "#8caa71"],
];

const SERVICE_META = {
  pypi: ["PyPI / PyTorch", "pip", (urls) => `pip install numpy -i ${urls.pypi}/simple/`],
  hf: ["Hugging Face", "model", (urls) => `HF_ENDPOINT=${urls.hf} huggingface-cli download MODEL_ID`],
  github: ["GitHub", "git", (urls) => `git clone ${urls.github}/owner/repository.git`],
  docker: ["Docker Registry", "oci", (_urls, host) => `docker pull ${host}/library/nginx:latest`],
  mirrors: ["Linux Mirrors", "repo", (urls) => `${urls.mirrors}/https://archive.ubuntu.com/ubuntu/`],
  proxy: ["Universal Proxy", "file", (urls) => `${urls.proxy}/https://example.com/file.zip`],
  npm: ["npm Registry", "pkg", (urls) => `npm install lodash --registry=${urls.npm}/`],
  go: ["Go Modules", "pkg", (urls) => `go env -w GOPROXY=${urls.go},direct`],
  maven: ["Maven / Gradle", "pkg", (urls) => `${urls.maven}/maven-central/`],
  crates: ["crates.io Sparse", "pkg", (urls) => `sparse+${urls.crates}/`],
  downloads: ["Runtime Downloads", "sdk", (urls) => `${urls.downloads}/node/v24.0.0/`],
};

export default {
  async fetch(request) {
    return new Response(htmlPage(request), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
};

function htmlPage(request) {
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const htmlLang = LANGUAGES[lang]?.htmlLang ?? "en";
  const urls = Object.fromEntries(TOOL_DEFINITIONS.map((tool) => [tool.key, getToolBaseUrl(request, tool.key)]));
  urls.portal = getToolBaseUrl(request, "portal");
  urls.catalog = getToolBaseUrl(request, CATALOG_DEFINITION.key);
  urls.help = getToolBaseUrl(request, "help");
  const dockerHost = getDockerRegistryHost(request);
  const nav = renderToolNav(request, "portal");
  const stableTools = TOOL_DEFINITIONS.filter((tool) => tool.status === "stable");
  const testTools = TOOL_DEFINITIONS.filter((tool) => tool.status === "test");

  return `<!doctype html>
<html lang="${escapeHtml(htmlLang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(PROJECT.description)}">
  <title>${escapeHtml(PROJECT.name)} | Source Acceleration Gateway</title>
  <style>${portalCss()}</style>
</head>
<body>
  ${nav}
  <!-- identity: Edge mirrors -->
  <main class="portal-shell">
    <section class="hero" aria-labelledby="portal-title">
      <div class="hero-copy">
        <span class="eyebrow">${escapeHtml(copy.eyebrow)}</span>
        <h1 id="portal-title">${escapeHtml(copy.title)}</h1>
        <p>${escapeHtml(copy.lead)}</p>
        <div class="hero-actions"><a class="button primary" href="${escapeHtml(urls.catalog)}">${escapeHtml(copy.openCatalog)}</a><a class="button secondary" href="${escapeHtml(urls.help)}">${escapeHtml(copy.readGuide)}</a></div>
      </div>
      <aside class="hero-console">
        <div class="console-head"><span class="console-lights"><i></i><i></i><i></i></span><strong>EDGEMIRROR / STATUS</strong></div>
        <div class="status-line"><span class="status-dot" id="healthDot"></span><strong id="healthLabel">${escapeHtml(copy.checking)}</strong><code>${escapeHtml(new URL(request.url).host)}</code></div>
        <div class="console-route"><span>CANONICAL</span><code>/repo/{source}/{path}</code></div>
        <div class="console-route"><span>POLICY</span><code>GET · HEAD · OPTIONS · NO-STORE</code></div>
      </aside>
      <div class="metrics">
        ${metric(copy.sourceCount, REPOSITORY_UI_TARGETS.length)}
        ${metric(copy.routeCount, ADAPTER_TARGETS.length)}
        ${metric(copy.cache, copy.noStore)}
        ${metric(copy.storage, copy.none)}
      </div>
    </section>

    <section class="coverage section-block">
      ${sectionHeading("01", copy.coverageKicker, copy.coverageTitle, copy.coverageHint)}
      <div class="ecosystem-grid">${ECOSYSTEMS.map((item, index) => ecosystemCard(item, index, urls.catalog)).join("")}</div>
    </section>

    <section class="services section-block">
      ${sectionHeading("02", copy.servicesKicker, copy.servicesTitle, copy.servicesHint)}
      <div class="service-layout">
        <div class="service-stats"><div><span>STABLE</span><strong>${stableTools.length}</strong></div><div><span>TEST</span><strong>${testTools.length}</strong></div><div><span>LEGACY BREAKS</span><strong>0</strong></div></div>
        <div class="service-grid">${TOOL_DEFINITIONS.filter((tool) => tool.key !== "portal").map((tool) => serviceCard(tool, urls, dockerHost, copy)).join("")}</div>
      </div>
    </section>

    <section class="architecture section-block">
      ${sectionHeading("03", copy.architectureKicker, copy.architectureTitle, copy.architectureHint)}
      <div class="route-map">
        ${routeNode("/repo", "APT · RPM · PACMAN · APK · XBPS · PKG · CONDA", "35 SOURCES")}
        ${routeNode("/pkg", "NPM · NUGET", "PACKAGE")}
        ${routeNode("/sdk", "NODE · FLUTTER", "RUNTIME")}
        ${routeNode("/oci", "DOCKER V2", "IMAGES")}
        ${routeNode("/git", "GITHUB", "SOURCE")}
      </div>
      <a class="catalog-cta" href="${escapeHtml(urls.catalog)}"><span>${escapeHtml(copy.configureAll)}</span><code>${escapeHtml(urls.catalog)}</code></a>
    </section>
  </main>
  <script>
    (function () {
      var healthLabel = document.getElementById("healthLabel");
      var healthDot = document.getElementById("healthDot");
      fetch("/healthz", { cache: "no-store" }).then(function (response) {
        if (!response.ok) throw new Error("health");
        healthLabel.textContent = ${JSON.stringify(copy.live)};
        healthDot.classList.add("online");
      }).catch(function () {
        healthLabel.textContent = ${JSON.stringify(copy.unavailable)};
        healthDot.classList.add("offline");
      });
      document.querySelectorAll("[data-copy]").forEach(function (button) {
        button.addEventListener("click", async function () {
          var value = button.dataset.copy || "";
          var original = button.textContent;
          try {
            if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
            else {
              var area = document.createElement("textarea"); area.value = value; area.style.position = "fixed"; area.style.opacity = "0"; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
            }
            button.textContent = ${JSON.stringify(copy.copied)};
            setTimeout(function () { button.textContent = original; }, 1300);
          } catch { button.textContent = original; }
        });
      });
    })();
  </script>
</body>
</html>`;
}

function metric(label, value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function sectionHeading(number, kicker, title, hint) {
  return `<div class="section-heading"><div class="section-number">${escapeHtml(number)}</div><div><span>${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(hint)}</p></div></div>`;
}

function ecosystemCard([name, description, filter, color], index, catalogUrl) {
  return `<a class="ecosystem-card" href="${escapeHtml(catalogUrl)}#${filter === "developer" ? "npm" : ecosystemDefault(filter)}" style="--accent:${escapeHtml(color)}"><span>${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(name)}</h3><p>${escapeHtml(description)}</p><i></i></a>`;
}

function ecosystemDefault(filter) {
  return { apt: "debian", rpm: "fedora", pacman: "arch", openwrt: "openwrt", other: "void" }[filter] ?? "debian";
}

function serviceCard(tool, urls, dockerHost, copy) {
  const [title, type, commandBuilder] = SERVICE_META[tool.key] ?? [tool.title, tool.key, () => urls[tool.key]];
  const command = commandBuilder(urls, dockerHost);
  return `<article class="service-card"><div class="service-top"><span>${escapeHtml(type.toUpperCase())}</span><em class="${escapeHtml(tool.status)}">${escapeHtml(tool.status)}</em></div><h3>${escapeHtml(title)}</h3><code>${escapeHtml(command)}</code><div><a href="${escapeHtml(urls[tool.key])}">${escapeHtml(copy.open)}</a><button type="button" data-copy="${escapeHtml(command)}">${escapeHtml(copy.copy)}</button></div></article>`;
}

function routeNode(path, description, label) {
  return `<article><span>${escapeHtml(label)}</span><h3>${escapeHtml(path)}</h3><p>${escapeHtml(description)}</p></article>`;
}

function portalCss() {
  return `
    :root{--ink:#182330;--navy:#101d2b;--blue:#4e91c4;--cyan:#87c7d5;--green:#71b58f;--paper:#f3f5f2;--panel:#fff;--muted:#667586;--line:#dfe4e3;--shadow:0 22px 65px rgba(23,39,52,.1)}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.portal-shell{width:min(1240px,calc(100% - 32px));margin:0 auto;padding:30px 0 76px}
    .hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(330px,.8fr);gap:14px;padding:clamp(30px,5vw,64px);border-radius:20px;background:var(--navy);color:#fff;box-shadow:0 26px 75px rgba(16,29,43,.18)}.hero-copy{align-self:center}.eyebrow{color:#8dc9d7;font-size:11px;font-weight:1000;letter-spacing:.16em;text-transform:uppercase}.hero h1{max-width:760px;margin:18px 0 16px;font-size:clamp(43px,6.5vw,78px);line-height:.98;letter-spacing:-.05em}.hero-copy>p{max-width:710px;margin:0;color:#afbeca;font-size:16px;line-height:1.72}.hero-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:27px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:43px;padding:0 16px;border-radius:9px;text-decoration:none;font-size:13px;font-weight:900}.button.primary{background:#91cbd9;color:#10202e}.button.secondary{border:1px solid rgba(255,255,255,.17);background:rgba(255,255,255,.05);color:#fff}.hero-console{align-self:center;overflow:hidden;border:1px solid rgba(255,255,255,.13);border-radius:13px;background:#0a1520}.console-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);color:#748b9d;font:900 9px monospace;letter-spacing:.12em}.console-lights{display:flex;gap:5px}.console-lights i{width:7px;height:7px;border-radius:50%;background:#d87f7f}.console-lights i:nth-child(2){background:#d8b16d}.console-lights i:nth-child(3){background:#72bb8c}.status-line{display:grid;grid-template-columns:auto 1fr;gap:4px 9px;align-items:center;padding:18px 15px}.status-line code{grid-column:2;color:#788f9f;font-size:10px}.status-dot{width:9px;height:9px;border-radius:50%;background:#d8b16d;box-shadow:0 0 0 5px rgba(216,177,109,.1)}.status-dot.online{background:#72cf94;box-shadow:0 0 0 5px rgba(114,207,148,.1)}.status-dot.offline{background:#e08383}.console-route{display:grid;grid-template-columns:80px 1fr;gap:10px;padding:12px 15px;border-top:1px solid rgba(255,255,255,.07)}.console-route span{color:#658296;font:900 9px monospace}.console-route code{color:#b5c9d6;font-size:10px;word-break:break-word}.metrics{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:18px}.metric{padding:13px 0;border-top:1px solid rgba(255,255,255,.13)}.metric span{display:block;color:#7f94a5;font-size:9px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.metric strong{display:block;margin-top:6px;font-size:22px}
    .section-block{padding-top:72px}.section-heading{display:grid;grid-template-columns:55px 1fr;gap:16px;align-items:start;margin-bottom:21px}.section-number{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border:1px solid #cbd4d5;border-radius:50%;color:#54758c;font:900 11px monospace}.section-heading span{color:#4e7898;font-size:10px;font-weight:1000;letter-spacing:.15em;text-transform:uppercase}.section-heading h2{margin:6px 0 7px;font-size:clamp(31px,4vw,45px);line-height:1.07;letter-spacing:-.04em}.section-heading p{max-width:740px;margin:0;color:var(--muted);line-height:1.65}.ecosystem-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.ecosystem-card{position:relative;display:flex;min-height:205px;flex-direction:column;padding:18px;overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff;color:var(--ink);text-decoration:none;transition:transform .18s ease,border-color .18s ease}.ecosystem-card:hover{transform:translateY(-3px);border-color:var(--accent)}.ecosystem-card>span{color:#91a0aa;font:900 10px monospace}.ecosystem-card h3{margin:31px 0 8px;font-size:19px}.ecosystem-card p{margin:0;color:var(--muted);font-size:12px;line-height:1.55}.ecosystem-card i{position:absolute;left:18px;right:18px;bottom:0;height:4px;background:var(--accent);border-radius:4px 4px 0 0}
    .service-layout{display:grid;grid-template-columns:170px 1fr;gap:12px}.service-stats{display:grid;align-content:start;gap:8px}.service-stats>div{padding:15px;border:1px solid var(--line);border-radius:11px;background:#e7ecec}.service-stats span{display:block;color:#71818d;font-size:9px;font-weight:900;letter-spacing:.12em}.service-stats strong{display:block;margin-top:5px;font-size:27px}.service-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.service-card{display:flex;min-height:190px;flex-direction:column;padding:16px;border:1px solid var(--line);border-radius:11px;background:#fff}.service-top{display:flex;align-items:center;justify-content:space-between}.service-top>span{color:#4e7898;font-size:9px;font-weight:1000;letter-spacing:.11em}.service-top em{display:inline-flex;align-items:center;min-height:22px;padding:0 7px;border-radius:6px;font-style:normal;font-size:9px;font-weight:900;text-transform:uppercase}.service-top em.stable{background:#ecf7f0;color:#42785a}.service-top em.test{background:#fff5e6;color:#91672c}.service-card h3{margin:18px 0 8px;font-size:17px}.service-card>code{display:block;overflow:hidden;color:#627585;font-size:10px;line-height:1.5;text-overflow:ellipsis;white-space:nowrap}.service-card>div:last-child{display:flex;gap:7px;margin-top:auto}.service-card a,.service-card button{display:inline-flex;align-items:center;justify-content:center;min-height:31px;padding:0 9px;border-radius:7px;font-size:10px;font-weight:900;text-decoration:none;cursor:pointer}.service-card a{border:1px solid var(--navy);background:var(--navy);color:#fff}.service-card button{border:1px solid var(--line);background:#fff;color:var(--ink)}
    .route-map{display:grid;grid-template-columns:2fr repeat(4,1fr);gap:8px}.route-map article{min-height:150px;padding:17px;border:1px solid var(--line);border-radius:11px;background:#fff}.route-map span{color:#7d8e9a;font-size:9px;font-weight:900;letter-spacing:.12em}.route-map h3{margin:25px 0 7px;font:800 25px "SFMono-Regular",Consolas,monospace}.route-map p{margin:0;color:var(--muted);font-size:10px;line-height:1.55}.catalog-cta{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:10px;padding:17px 18px;border-radius:11px;background:var(--navy);color:#fff;text-decoration:none}.catalog-cta span{font-size:14px;font-weight:900}.catalog-cta code{color:#8ccbd8;font-size:11px;word-break:break-all}
    @media(max-width:1000px){.ecosystem-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.service-layout{grid-template-columns:1fr}.service-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.service-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.route-map{grid-template-columns:repeat(2,minmax(0,1fr))}.route-map article:first-child{grid-column:1/-1}}
    @media(max-width:760px){.portal-shell{width:min(100% - 20px,680px);padding:14px 0 50px}.hero{grid-template-columns:1fr;padding:28px 20px;border-radius:14px}.hero h1{font-size:44px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.section-block{padding-top:52px}.ecosystem-grid,.service-grid,.route-map{grid-template-columns:1fr}.service-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.route-map article:first-child{grid-column:auto}.catalog-cta{display:grid}.section-heading{grid-template-columns:44px 1fr}.section-number{width:40px;height:40px}}
    @media(max-width:480px){.metrics,.ecosystem-grid,.service-stats{grid-template-columns:1fr}.hero-actions{display:grid}.button{width:100%}.section-heading{display:block}.section-number{margin-bottom:12px}}
    @media(prefers-reduced-motion:reduce){.ecosystem-card{transition:none}}
  `;
}
