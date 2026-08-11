import { PROJECT } from "../config.js";
import { getLanguage, LANGUAGES } from "../i18n.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { escapeHtml, textResponse } from "../proxy-utils.js";
import {
  ADAPTER_TARGETS,
  CONFIG_TARGETS,
  ConfigurationInputError,
  REPOSITORY_UI_TARGETS,
  generateConfiguration,
} from "../repositories/config-generator.js";

const COPY = {
  en: {
    eyebrow: "Source control center",
    title: "Configure every mirror from one reliable interface.",
    lead: "Search official upstreams, generate package-manager configuration, and verify the selected route without changing the repository protocol underneath.",
    configure: "Configure",
    jumpGenerator: "Open generator",
    machineCatalog: "Machine catalog",
    sourceCount: "System sources",
    adapterCount: "Developer routes",
    cachePolicy: "Cache policy",
    storage: "Storage",
    noStore: "Strict no-store",
    none: "None",
    browseTitle: "Browse sources",
    browseHint: "Every card maps to a fixed upstream root. Snapshot channels are marked separately.",
    search: "Search source, ecosystem, route, or upstream",
    all: "All",
    apt: "APT",
    openwrt: "OpenWrt",
    rpm: "RPM",
    pacman: "Pacman / APK",
    other: "Other systems",
    developer: "Developer routes",
    results: "results",
    openRoute: "Open route",
    rolling: "Rolling",
    stable: "Stable",
    images: "Images",
    generatorTitle: "Configuration generator",
    generatorHint: "Choose a target, confirm the domain and version, then copy the exact configuration.",
    domain: "Deployment domain",
    target: "Source or route",
    version: "Version / suite",
    arch: "Architecture / target",
    components: "Components / package / path",
    output: "Generated configuration",
    copy: "Copy",
    copied: "Copied",
    open: "Open",
    probe: "Probe route",
    probing: "Checking…",
    reachable: "Route reachable",
    unavailable: "Route check failed",
    manager: "Manager",
    route: "Route",
    note: "Reliability note",
    adaptersTitle: "Canonical developer routes",
    adaptersHint: "New canonical namespaces and existing compatibility routes share the same backend.",
    reliabilityTitle: "Reliability is part of the interface",
    reliabilityHint: "The generator explains the boundary before you copy a command.",
    readOnlyTitle: "Read-only system routes",
    readOnlyText: "Repository, SDK, and NuGet source routes accept only GET, HEAD, and OPTIONS.",
    noCacheTitle: "No accidental CDN cache",
    noCacheText: "Worker fetches and every response use explicit no-store controls.",
    integrityTitle: "Upstream integrity stays intact",
    integrityText: "Range, signatures, checksums, ETag, and package paths are preserved for raw files.",
    noResults: "No source matches the current search and filter.",
    error: "Unable to generate configuration.",
  },
  es: {
    eyebrow: "Centro de fuentes",
    title: "Configura todos los mirrors desde una interfaz fiable.",
    lead: "Busca upstreams oficiales, genera configuracion para gestores de paquetes y verifica la ruta sin cambiar el protocolo del repositorio.",
    configure: "Configurar",
    jumpGenerator: "Abrir generador",
    machineCatalog: "Catalogo JSON",
    sourceCount: "Fuentes de sistema",
    adapterCount: "Rutas developer",
    cachePolicy: "Cache",
    storage: "Almacenamiento",
    noStore: "no-store estricto",
    none: "Ninguno",
    browseTitle: "Explorar fuentes",
    browseHint: "Cada tarjeta apunta a un upstream fijo. Los canales rolling estan marcados.",
    search: "Buscar fuente, ecosistema, ruta o upstream",
    all: "Todas",
    apt: "APT",
    openwrt: "OpenWrt",
    rpm: "RPM",
    pacman: "Pacman / APK",
    other: "Otros sistemas",
    developer: "Rutas developer",
    results: "resultados",
    openRoute: "Abrir ruta",
    rolling: "Rolling",
    stable: "Stable",
    images: "Imagenes",
    generatorTitle: "Generador de configuracion",
    generatorHint: "Elige una fuente, confirma dominio y version y copia la configuracion exacta.",
    domain: "Dominio desplegado",
    target: "Fuente o ruta",
    version: "Version / suite",
    arch: "Arquitectura / target",
    components: "Componentes / paquete / ruta",
    output: "Configuracion generada",
    copy: "Copiar",
    copied: "Copiado",
    open: "Abrir",
    probe: "Probar ruta",
    probing: "Comprobando…",
    reachable: "Ruta disponible",
    unavailable: "La comprobacion fallo",
    manager: "Gestor",
    route: "Ruta",
    note: "Nota de fiabilidad",
    adaptersTitle: "Rutas canonicas developer",
    adaptersHint: "Los namespaces nuevos y las rutas compatibles usan el mismo backend.",
    reliabilityTitle: "La fiabilidad forma parte de la interfaz",
    reliabilityHint: "El generador muestra los limites antes de copiar.",
    readOnlyTitle: "Rutas de sistema de solo lectura",
    readOnlyText: "Repositorio, SDK y NuGet solo aceptan GET, HEAD y OPTIONS.",
    noCacheTitle: "Sin cache CDN accidental",
    noCacheText: "Los fetch del Worker y cada respuesta usan no-store explicito.",
    integrityTitle: "Integridad upstream intacta",
    integrityText: "Range, firmas, checksums, ETag y rutas de paquetes se conservan.",
    noResults: "Ninguna fuente coincide con la busqueda.",
    error: "No se pudo generar la configuracion.",
  },
  zh: {
    eyebrow: "镜像源控制中心",
    title: "一个可靠界面，配置全部镜像入口。",
    lead: "搜索官方上游，按系统生成包管理器配置，并在不改变底层仓库协议的前提下检查实际路由。",
    configure: "配置",
    jumpGenerator: "打开配置生成器",
    machineCatalog: "机器目录",
    sourceCount: "系统源",
    adapterCount: "开发者入口",
    cachePolicy: "缓存策略",
    storage: "附加存储",
    noStore: "严格 no-store",
    none: "无",
    browseTitle: "浏览全部来源",
    browseHint: "每张卡片都映射到固定上游根目录；滚动版与快照源会单独标记。",
    search: "搜索来源、生态、路由或上游",
    all: "全部",
    apt: "APT",
    openwrt: "OpenWrt",
    rpm: "RPM",
    pacman: "Pacman / APK",
    other: "其他系统",
    developer: "开发者入口",
    results: "项结果",
    openRoute: "打开入口",
    rolling: "滚动版",
    stable: "稳定",
    images: "镜像文件",
    generatorTitle: "配置生成器",
    generatorHint: "选择目标，确认域名、版本和架构，然后复制准确配置。",
    domain: "部署域名",
    target: "来源或入口",
    version: "版本 / Suite",
    arch: "架构 / Target",
    components: "组件 / 包名 / 路径",
    output: "生成结果",
    copy: "复制",
    copied: "已复制",
    open: "打开",
    probe: "检查路由",
    probing: "检查中…",
    reachable: "路由可访问",
    unavailable: "路由检查失败",
    manager: "工具",
    route: "入口",
    note: "可靠性说明",
    adaptersTitle: "规范开发者入口",
    adaptersHint: "新的规范命名空间与原有兼容入口共用同一套可靠后端。",
    reliabilityTitle: "可靠性就是界面的一部分",
    reliabilityHint: "复制配置之前，先把只读、缓存和完整性边界说清楚。",
    readOnlyTitle: "系统源只读",
    readOnlyText: "Repository、SDK 与 NuGet 来源只接受 GET、HEAD、OPTIONS。",
    noCacheTitle: "不产生意外 CDN 缓存",
    noCacheText: "Worker 上游读取和全部响应都使用明确的 no-store 控制。",
    integrityTitle: "保留上游完整性",
    integrityText: "原始文件继续保留 Range、签名、校验和、ETag 与完整包路径。",
    noResults: "当前搜索和筛选条件下没有来源。",
    error: "无法生成配置。",
  },
};

const ZH_DESCRIPTIONS = {
  debian: "Debian 主软件仓库，适用于稳定版、测试版与 sid。",
  "debian-security": "Debian 官方安全更新仓库。",
  "debian-ports": "面向次要架构的 Debian Ports 仓库。",
  ubuntu: "Ubuntu 主架构软件仓库。",
  "ubuntu-security": "Ubuntu 官方安全更新仓库。",
  "ubuntu-ports": "Ubuntu ARM、RISC-V 等移植架构仓库。",
  "ubuntu-releases": "Ubuntu 安装镜像、校验和与签名文件。",
  raspbian: "Raspberry Pi OS 32 位用户空间软件包。",
  raspberrypi: "Raspberry Pi 官方 Debian 软件与固件包。",
  "raspberrypi-images": "Raspberry Pi OS 系统镜像目录。",
  openwrt: "完整 OpenWrt 下载树，兼容 APK 与 OPKG 路径。",
  "openwrt-releases": "OpenWrt 稳定版完整目录。",
  "openwrt-snapshots": "OpenWrt 持续更新的开发快照。",
  "openwrt-packages": "OpenWrt 发行版包与 Feed。",
  "openwrt-firmware": "按版本和 Target 获取 OpenWrt 固件。",
  "openwrt-sdk": "OpenWrt SDK、ImageBuilder 与工具链。",
  immortalwrt: "完整 ImmortalWrt 下载目录。",
  "immortalwrt-releases": "ImmortalWrt 稳定发行版。",
  "immortalwrt-snapshots": "ImmortalWrt 滚动开发快照。",
  arch: "Arch Linux 官方 Geo Mirror 软件包。",
  archlinuxarm: "Arch Linux ARM 官方 Geo Redirector。",
  alpine: "Alpine Linux main、community 等 APK 仓库。",
  fedora: "Fedora release 与 updates 固定 BaseURL。",
  epel: "Enterprise Linux 的 EPEL 扩展软件包。",
  "centos-stream": "CentOS Stream BaseOS 与 AppStream。",
  rocky: "Rocky Linux 官方固定仓库树。",
  almalinux: "AlmaLinux 官方固定仓库树。",
  opensuse: "openSUSE Leap、Tumbleweed 与更新目录。",
  void: "Void Linux glibc XBPS 仓库。",
  "void-musl": "Void Linux musl XBPS 仓库。",
  "freebsd-pkg": "FreeBSD 二进制 pkg 仓库。",
  msys2: "MSYS2 与 MinGW Pacman 软件仓库。",
  termux: "Termux main、root 与 X11 APT 仓库根目录。",
  anaconda: "Anaconda defaults 的 main、r、msys2 Channels。",
  "conda-forge": "完整 conda-forge 社区 Channel。",
};

const ADAPTER_DESCRIPTIONS = {
  pypi: "PyPI simple index 与 PyTorch wheel。",
  hf: "Hugging Face 模型、数据集、API 与 LFS。",
  npm: "npm、pnpm、yarn metadata 与 tarball。",
  nuget: "可用于 restore 与搜索的只读 NuGet v3 Source。",
  go: "兼容 GOPROXY 的模块 metadata 与压缩包。",
  maven: "Maven Central、Google Maven、Gradle Plugin 与 JitPack。",
  crates: "Cargo sparse index 与 .crate 下载。",
  node: "Node.js release、安装包、Headers 与校验和。",
  flutter: "Flutter SDK 归档与工具运行时产物。",
  docker: "Docker Hub 与多 Registry 的 OCI v2 入口。",
  github: "Git clone、Raw、Release 与归档文件。",
  downloads: "Node、Python、Go、Rustup 与 Release 文件。",
  proxy: "面向公开 HTTP/HTTPS 文件的通用下载转发。",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (!new Set(["GET", "HEAD"]).has(request.method.toUpperCase())) {
      return textResponse("Catalog routes are read-only.", {
        status: 405,
        headers: { Allow: "GET, HEAD, OPTIONS" },
      });
    }

    if (url.pathname === "/config") {
      return configurationResponse(request);
    }
    if (url.pathname !== "/" && url.pathname !== "/index.html") {
      return textResponse("Catalog page not found.", { status: 404 });
    }

    return new Response(htmlPage(request), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
};

function configurationResponse(request) {
  const url = new URL(request.url);
  try {
    const result = generateConfiguration({
      id: url.searchParams.get("id") ?? "debian",
      origin: url.searchParams.get("origin") ?? url.origin,
      version: url.searchParams.get("version") ?? undefined,
      arch: url.searchParams.get("arch") ?? undefined,
      components: url.searchParams.get("components") ?? undefined,
    });
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof ConfigurationInputError) {
      return jsonResponse({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}

function htmlPage(request) {
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const htmlLang = LANGUAGES[lang]?.htmlLang ?? "en";
  const catalogBase = getToolBaseUrl(request, "catalog");
  const publicOrigin = new URL(catalogBase).origin;
  const repoBase = `${publicOrigin}/repo`;
  const nav = renderToolNav(request, "catalog");
  const initial = generateConfiguration({ id: "debian", origin: publicOrigin });
  const targetsJson = safeJson(CONFIG_TARGETS.map((item) => ({
    id: item.id,
    title: item.title,
    family: item.family,
    manager: item.manager,
    fields: item.fields,
    defaults: item.defaults,
    kind: item.kind,
  })));

  return `<!doctype html>
<html lang="${escapeHtml(htmlLang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Configure all ${escapeHtml(PROJECT.name)} system repositories and developer routes from one interface.">
  <title>Catalog & Setup | ${escapeHtml(PROJECT.name)}</title>
  <style>${catalogCss()}</style>
</head>
<body>
  ${nav}
  <main class="catalog-shell">
    <section class="catalog-hero" aria-labelledby="catalog-title">
      <div class="hero-copy">
        <span class="eyebrow"><span class="live-dot"></span>${escapeHtml(copy.eyebrow)}</span>
        <h1 id="catalog-title">${escapeHtml(copy.title)}</h1>
        <p>${escapeHtml(copy.lead)}</p>
        <div class="hero-actions">
          <a class="action primary" href="#generator">${escapeHtml(copy.jumpGenerator)}</a>
          <a class="action secondary" href="${escapeHtml(repoBase)}">${escapeHtml(copy.machineCatalog)}</a>
        </div>
      </div>
      <div class="hero-route" aria-label="Canonical route model">
        <span>CANONICAL ROUTE</span>
        <code>/repo/{source}/{upstream-path}</code>
        <div class="route-stripes"><i></i><i></i><i></i><i></i></div>
      </div>
      <div class="hero-metrics">
        ${metric(copy.sourceCount, REPOSITORY_UI_TARGETS.length)}
        ${metric(copy.adapterCount, ADAPTER_TARGETS.length)}
        ${metric(copy.cachePolicy, copy.noStore, "wide")}
        ${metric(copy.storage, copy.none, "wide")}
      </div>
    </section>

    <section class="browse-section" aria-labelledby="browse-title">
      <div class="section-heading">
        <div><span class="section-kicker">01 / SOURCES</span><h2 id="browse-title">${escapeHtml(copy.browseTitle)}</h2><p>${escapeHtml(copy.browseHint)}</p></div>
        <strong id="resultCount" aria-live="polite">${REPOSITORY_UI_TARGETS.length} ${escapeHtml(copy.results)}</strong>
      </div>
      <div class="catalog-controls">
        <label class="search-box"><span class="sr-only">${escapeHtml(copy.search)}</span><input id="sourceSearch" type="search" placeholder="${escapeHtml(copy.search)}" autocomplete="off"><kbd>/</kbd></label>
        <div class="filter-row" role="group" aria-label="Source filters">
          ${filterButton("all", copy.all, true)}
          ${filterButton("apt", copy.apt)}
          ${filterButton("openwrt", copy.openwrt)}
          ${filterButton("rpm", copy.rpm)}
          ${filterButton("pacman", copy.pacman)}
          ${filterButton("other", copy.other)}
        </div>
      </div>
      <div class="source-grid" id="sourceGrid">
        ${REPOSITORY_UI_TARGETS.map((source) => sourceCard(source, lang, copy, repoBase)).join("")}
      </div>
      <p class="empty-state" id="emptyState" hidden>${escapeHtml(copy.noResults)}</p>
    </section>

    <section class="generator-section" id="generator" aria-labelledby="generator-title">
      <div class="generator-intro">
        <span class="section-kicker">02 / GENERATOR</span>
        <h2 id="generator-title">${escapeHtml(copy.generatorTitle)}</h2>
        <p>${escapeHtml(copy.generatorHint)}</p>
        <div class="generator-rail"><span></span><span></span><span></span></div>
      </div>
      <div class="generator-card">
        <form id="configForm" novalidate>
          <div class="field full"><label for="mirrorOrigin">${escapeHtml(copy.domain)}</label><input id="mirrorOrigin" name="origin" type="url" value="${escapeHtml(publicOrigin)}" spellcheck="false" required></div>
          <div class="field full"><label for="configTarget">${escapeHtml(copy.target)}</label><select id="configTarget" name="id">${targetOptions(lang)}</select></div>
          <div class="field" data-config-field="version"><label for="configVersion">${escapeHtml(copy.version)}</label><input id="configVersion" name="version" value="${escapeHtml(CONFIG_TARGETS[0].defaults.version)}" spellcheck="false"></div>
          <div class="field" data-config-field="arch"><label for="configArch">${escapeHtml(copy.arch)}</label><input id="configArch" name="arch" value="${escapeHtml(CONFIG_TARGETS[0].defaults.arch)}" spellcheck="false"></div>
          <div class="field full" data-config-field="components"><label for="configComponents">${escapeHtml(copy.components)}</label><input id="configComponents" name="components" value="${escapeHtml(CONFIG_TARGETS[0].defaults.components)}" spellcheck="false"></div>
        </form>
        <div class="output-panel">
          <div class="output-top"><div><span>${escapeHtml(copy.output)}</span><strong id="outputTitle">${escapeHtml(initial.title)}</strong></div><span class="manager-badge" id="outputManager">${escapeHtml(initial.manager)}</span></div>
          <pre id="configOutput" tabindex="0"><code>${escapeHtml(initial.command)}</code></pre>
          <dl class="output-meta">
            <div><dt>${escapeHtml(copy.route)}</dt><dd><a id="outputRoute" href="${escapeHtml(initial.route)}" target="_blank" rel="noreferrer">${escapeHtml(initial.route)}</a></dd></div>
            <div><dt>${escapeHtml(copy.note)}</dt><dd id="outputNote">${escapeHtml(initial.note)}</dd></div>
          </dl>
          <div class="output-actions">
            <button class="action primary" id="copyConfig" type="button">${escapeHtml(copy.copy)}</button>
            <a class="action secondary" id="openConfigRoute" href="${escapeHtml(initial.route)}" target="_blank" rel="noreferrer">${escapeHtml(copy.open)}</a>
            <button class="action ghost" id="probeRoute" type="button">${escapeHtml(copy.probe)}</button>
          </div>
          <p class="probe-status" id="probeStatus" aria-live="polite"></p>
        </div>
      </div>
    </section>

    <section class="adapter-section" aria-labelledby="adapter-title">
      <div class="section-heading">
        <div><span class="section-kicker">03 / DEV ROUTES</span><h2 id="adapter-title">${escapeHtml(copy.adaptersTitle)}</h2><p>${escapeHtml(copy.adaptersHint)}</p></div>
      </div>
      <div class="adapter-grid">
        ${ADAPTER_TARGETS.map((adapterTarget) => adapterCard(adapterTarget, lang, copy)).join("")}
      </div>
    </section>

    <section class="reliability-section" aria-labelledby="reliability-title">
      <div class="section-heading light"><div><span class="section-kicker">04 / GUARANTEES</span><h2 id="reliability-title">${escapeHtml(copy.reliabilityTitle)}</h2><p>${escapeHtml(copy.reliabilityHint)}</p></div></div>
      <div class="reliability-grid">
        ${reliabilityCard("01", copy.readOnlyTitle, copy.readOnlyText)}
        ${reliabilityCard("02", copy.noCacheTitle, copy.noCacheText)}
        ${reliabilityCard("03", copy.integrityTitle, copy.integrityText)}
      </div>
    </section>
  </main>
  <script>
    (function () {
      var targets = ${targetsJson};
      var catalogBase = ${JSON.stringify(catalogBase)};
      var copyText = ${JSON.stringify(copy.copy)};
      var copiedText = ${JSON.stringify(copy.copied)};
      var labels = ${safeJson({ probing: copy.probing, reachable: copy.reachable, unavailable: copy.unavailable, error: copy.error, results: copy.results })};
      var form = document.getElementById("configForm");
      var targetSelect = document.getElementById("configTarget");
      var originInput = document.getElementById("mirrorOrigin");
      var versionInput = document.getElementById("configVersion");
      var archInput = document.getElementById("configArch");
      var componentsInput = document.getElementById("configComponents");
      var output = document.querySelector("#configOutput code");
      var outputTitle = document.getElementById("outputTitle");
      var outputManager = document.getElementById("outputManager");
      var outputRoute = document.getElementById("outputRoute");
      var outputNote = document.getElementById("outputNote");
      var openRoute = document.getElementById("openConfigRoute");
      var probeStatus = document.getElementById("probeStatus");
      var latestRequest = 0;
      var debounceTimer;

      function getTarget(id) { return targets.find(function (target) { return target.id === id; }); }
      function applyTargetDefaults(id, preserveValues) {
        var target = getTarget(id);
        if (!target) return;
        document.querySelectorAll("[data-config-field]").forEach(function (field) {
          field.hidden = !target.fields.includes(field.dataset.configField);
        });
        if (!preserveValues) {
          versionInput.value = target.defaults.version || "";
          archInput.value = target.defaults.arch || "";
          componentsInput.value = target.defaults.components || "";
        }
        document.querySelectorAll("[data-source-id], [data-adapter-id]").forEach(function (node) {
          node.classList.toggle("selected", (node.dataset.sourceId || node.dataset.adapterId) === id);
        });
      }
      function configParams() {
        var params = new URLSearchParams({ id: targetSelect.value, origin: originInput.value });
        params.set("version", versionInput.value);
        params.set("arch", archInput.value);
        params.set("components", componentsInput.value);
        return params;
      }
      async function refreshConfiguration() {
        var requestId = ++latestRequest;
        probeStatus.textContent = "";
        try {
          var response = await fetch(catalogBase + "/config?" + configParams().toString(), { cache: "no-store" });
          var payload = await response.json();
          if (requestId !== latestRequest) return;
          if (!response.ok) throw new Error(payload.error || labels.error);
          output.textContent = payload.command;
          outputTitle.textContent = payload.title;
          outputManager.textContent = payload.mode ? payload.manager + " · " + payload.mode.toUpperCase() : payload.manager;
          outputRoute.textContent = payload.route;
          outputRoute.href = payload.route;
          outputNote.textContent = payload.note;
          openRoute.href = payload.route;
          history.replaceState(null, "", "#" + encodeURIComponent(payload.id));
        } catch (error) {
          output.textContent = error && error.message ? error.message : labels.error;
          outputTitle.textContent = labels.error;
          outputManager.textContent = "—";
          outputNote.textContent = labels.error;
        }
      }
      function scheduleRefresh() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(refreshConfiguration, 160);
      }
      targetSelect.addEventListener("change", function () { applyTargetDefaults(targetSelect.value, false); refreshConfiguration(); });
      form.addEventListener("input", scheduleRefresh);
      document.querySelectorAll("[data-configure]").forEach(function (button) {
        button.addEventListener("click", function () {
          targetSelect.value = button.dataset.configure;
          applyTargetDefaults(targetSelect.value, false);
          refreshConfiguration();
          document.getElementById("generator").scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
      document.getElementById("copyConfig").addEventListener("click", async function (event) {
        var button = event.currentTarget;
        try {
          await copyToClipboard(output.textContent || "");
          button.textContent = copiedText;
          setTimeout(function () { button.textContent = copyText; }, 1400);
        } catch { button.textContent = copyText; }
      });
      document.getElementById("probeRoute").addEventListener("click", async function (event) {
        var button = event.currentTarget;
        probeStatus.className = "probe-status";
        probeStatus.textContent = labels.probing;
        button.disabled = true;
        try {
          var response = await fetch(outputRoute.href, { method: "HEAD", cache: "no-store" });
          var ok = response.status < 500;
          probeStatus.classList.add(ok ? "ok" : "bad");
          probeStatus.textContent = (ok ? labels.reachable : labels.unavailable) + " · HTTP " + response.status;
        } catch {
          probeStatus.classList.add("bad");
          probeStatus.textContent = labels.unavailable;
        } finally { button.disabled = false; }
      });

      var search = document.getElementById("sourceSearch");
      var cards = Array.from(document.querySelectorAll(".source-card"));
      var filters = Array.from(document.querySelectorAll("[data-filter]"));
      var activeFilter = "all";
      function applyFilters() {
        var query = search.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var matchesFilter = activeFilter === "all" || card.dataset.group === activeFilter;
          var matchesSearch = !query || card.dataset.search.includes(query);
          card.hidden = !(matchesFilter && matchesSearch);
          if (!card.hidden) visible += 1;
        });
        document.getElementById("resultCount").textContent = visible + " " + labels.results;
        document.getElementById("emptyState").hidden = visible !== 0;
      }
      search.addEventListener("input", applyFilters);
      filters.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.dataset.filter;
          filters.forEach(function (item) { item.classList.toggle("active", item === button); item.setAttribute("aria-pressed", item === button ? "true" : "false"); });
          applyFilters();
        });
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "/" && document.activeElement !== search && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {
          event.preventDefault(); search.focus();
        }
      });

      var hashTarget = decodeURIComponent(location.hash.replace(/^#/, ""));
      if (getTarget(hashTarget)) { targetSelect.value = hashTarget; applyTargetDefaults(hashTarget, false); }
      else { applyTargetDefaults(targetSelect.value, true); }
      refreshConfiguration();

      async function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
        var area = document.createElement("textarea");
        area.value = text; area.setAttribute("readonly", ""); area.style.position = "fixed"; area.style.opacity = "0";
        document.body.appendChild(area); area.select();
        var copied = document.execCommand("copy"); area.remove();
        if (!copied) throw new Error("copy failed");
      }
    })();
  </script>
</body>
</html>`;
}

function sourceCard(source, lang, copy, repoBase) {
  const group = filterGroup(source.family);
  const state = sourceState(source);
  const stateLabel = state === "rolling" ? copy.rolling : state === "images" ? copy.images : copy.stable;
  const description = lang === "zh" ? ZH_DESCRIPTIONS[source.id] ?? source.description : source.description;
  const search = [source.id, source.title, source.family, source.manager, source.upstream, description, ...source.aliases].join(" ").toLowerCase();
  const route = `${repoBase}/${source.id}/`;
  return `<article class="source-card" data-source-id="${escapeHtml(source.id)}" data-group="${escapeHtml(group)}" data-search="${escapeHtml(search)}">
    <div class="source-top"><span class="family-mark">${escapeHtml(source.manager)}</span><span class="source-state ${escapeHtml(state)}">${escapeHtml(stateLabel)}</span></div>
    <h3>${escapeHtml(source.title)}</h3><code class="source-id">/repo/${escapeHtml(source.id)}</code>
    <p>${escapeHtml(description)}</p>
    <div class="upstream"><span>UPSTREAM</span><strong>${escapeHtml(new URL(source.upstream).host)}</strong></div>
    <div class="source-actions"><button type="button" data-configure="${escapeHtml(source.id)}">${escapeHtml(copy.configure)}</button><a href="${escapeHtml(route)}" target="_blank" rel="noreferrer">${escapeHtml(copy.openRoute)}</a></div>
  </article>`;
}

function adapterCard(target, lang, copy) {
  const description = lang === "zh" ? ADAPTER_DESCRIPTIONS[target.id] : target.description;
  return `<article class="adapter-card" data-adapter-id="${escapeHtml(target.id)}">
    <div><span>${escapeHtml(target.family.toUpperCase())}</span><strong>${escapeHtml(target.manager)}</strong></div>
    <h3>${escapeHtml(target.title)}</h3><p>${escapeHtml(description)}</p>
    <button type="button" data-configure="${escapeHtml(target.id)}">${escapeHtml(copy.configure)}</button>
  </article>`;
}

function targetOptions(lang) {
  const repositoryOptions = REPOSITORY_UI_TARGETS.map((target) => `<option value="${escapeHtml(target.id)}">${escapeHtml(target.title)} · ${escapeHtml(target.manager)}</option>`).join("");
  const adapterOptions = ADAPTER_TARGETS.map((target) => `<option value="${escapeHtml(target.id)}">${escapeHtml(target.title)} · ${escapeHtml(target.manager)}</option>`).join("");
  const repositoryLabel = lang === "zh" ? "系统源" : lang === "es" ? "Repositorios" : "System repositories";
  const adapterLabel = lang === "zh" ? "开发者入口" : lang === "es" ? "Rutas developer" : "Developer routes";
  return `<optgroup label="${escapeHtml(repositoryLabel)}">${repositoryOptions}</optgroup><optgroup label="${escapeHtml(adapterLabel)}">${adapterOptions}</optgroup>`;
}

function filterGroup(family) {
  if (family === "apt") return "apt";
  if (family === "openwrt") return "openwrt";
  if (["dnf", "zypper"].includes(family)) return "rpm";
  if (["pacman", "apk"].includes(family)) return "pacman";
  return "other";
}

function sourceState(source) {
  if (source.family === "images") return "images";
  if (source.id.includes("snapshot") || ["arch", "archlinuxarm", "void", "void-musl"].includes(source.id)) return "rolling";
  return "stable";
}

function metric(label, value, className = "") {
  return `<div class="metric ${escapeHtml(className)}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function filterButton(id, label, active = false) {
  return `<button type="button" data-filter="${escapeHtml(id)}" class="filter-button${active ? " active" : ""}" aria-pressed="${active ? "true" : "false"}">${escapeHtml(label)}</button>`;
}

function reliabilityCard(number, title, text) {
  return `<article><span>${escapeHtml(number)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`;
}

function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(JSON.stringify(body, null, 2), { ...init, headers });
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
}

function catalogCss() {
  return `
    :root{--ink:#15212f;--navy:#0f1b2a;--navy-2:#17293c;--blue:#4b8fca;--cyan:#7bc4d4;--green:#6bb590;--amber:#d6a85f;--paper:#f4f5f2;--panel:#fff;--muted:#667383;--line:#dfe4e6;--soft:#edf2f4;--code:#0e1b29;--shadow:0 18px 55px rgba(25,42,57,.09)}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;min-height:100vh;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.catalog-shell{width:min(1240px,calc(100% - 32px));margin:0 auto;padding:30px 0 72px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .catalog-hero{position:relative;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(290px,.65fr);gap:14px;padding:clamp(28px,5vw,62px);overflow:hidden;border-radius:20px;background:var(--navy);color:#fff;box-shadow:0 25px 70px rgba(15,27,42,.18)}.catalog-hero::after{content:"";position:absolute;width:420px;height:420px;right:-170px;top:-220px;border:1px solid rgba(123,196,212,.28);border-radius:50%;box-shadow:0 0 0 52px rgba(123,196,212,.05),0 0 0 105px rgba(123,196,212,.035)}.hero-copy,.hero-route,.hero-metrics{position:relative;z-index:1}.eyebrow{display:inline-flex;align-items:center;gap:9px;color:#b9d5e4;font-size:12px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.live-dot{width:8px;height:8px;border-radius:50%;background:#78d6a2;box-shadow:0 0 0 5px rgba(120,214,162,.12)}h1{max-width:820px;margin:20px 0 16px;font-size:clamp(42px,6.5vw,78px);line-height:.98;letter-spacing:-.045em}.hero-copy>p{max-width:720px;margin:0;color:#b7c5d1;font-size:17px;line-height:1.7}.hero-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.action{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 16px;border-radius:9px;text-decoration:none;font-size:13px;font-weight:900;cursor:pointer}.action.primary{border:1px solid #8ec9dc;background:#8ec9dc;color:#112130}.action.secondary{border:1px solid rgba(255,255,255,.19);background:rgba(255,255,255,.06);color:#fff}.action.ghost{border:1px solid var(--line);background:#fff;color:var(--ink)}button.action{font:inherit}.hero-route{align-self:start;padding:17px;border:1px solid rgba(255,255,255,.14);border-radius:13px;background:rgba(255,255,255,.045)}.hero-route>span{display:block;margin-bottom:8px;color:#87a6b9;font-size:10px;font-weight:900;letter-spacing:.15em}.hero-route code{font-size:13px;color:#d9edf5;word-break:break-all}.route-stripes{display:flex;gap:5px;margin-top:18px}.route-stripes i{display:block;height:4px;flex:1;border-radius:5px;background:#4b8fca}.route-stripes i:nth-child(2){background:#7bc4d4}.route-stripes i:nth-child(3){background:#6bb590}.route-stripes i:nth-child(4){background:#d6a85f}.hero-metrics{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:18px}.metric{padding:14px 16px;border-top:1px solid rgba(255,255,255,.13)}.metric span{display:block;color:#849bae;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.metric strong{display:block;margin-top:6px;font-size:23px}.metric.wide strong{font-size:15px;color:#d6e4ec}
    .browse-section,.adapter-section{padding:68px 0 4px}.section-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:20px}.section-heading h2,.generator-intro h2{margin:7px 0 7px;font-size:clamp(30px,4vw,44px);letter-spacing:-.035em}.section-heading p,.generator-intro p{max-width:700px;margin:0;color:var(--muted);line-height:1.65}.section-heading>strong{color:var(--muted);font-size:13px}.section-kicker{color:#4b7799;font-size:10px;font-weight:1000;letter-spacing:.15em}.catalog-controls{display:grid;gap:12px;margin-bottom:18px}.search-box{position:relative;display:block}.search-box input{width:100%;height:52px;padding:0 58px 0 16px;border:1px solid var(--line);border-radius:11px;background:#fff;color:var(--ink);font:inherit;outline:none;box-shadow:0 7px 22px rgba(25,42,57,.04)}.search-box input:focus{border-color:#83afcc;box-shadow:0 0 0 4px rgba(75,143,202,.12)}.search-box kbd{position:absolute;right:14px;top:12px;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:var(--muted);font:12px monospace}.filter-row{display:flex;flex-wrap:wrap;gap:7px}.filter-button{min-height:34px;padding:0 12px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--muted);font-size:12px;font-weight:850;cursor:pointer}.filter-button.active{border-color:var(--navy);background:var(--navy);color:#fff}.source-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}.source-card{position:relative;display:flex;min-height:280px;flex-direction:column;padding:18px;border:1px solid var(--line);border-radius:13px;background:#fff;box-shadow:0 8px 28px rgba(25,42,57,.045);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.source-card:hover{transform:translateY(-3px);border-color:#b9cbd6;box-shadow:var(--shadow)}.source-card.selected{border-color:#4b8fca;box-shadow:0 0 0 3px rgba(75,143,202,.1)}.source-top{display:flex;align-items:center;justify-content:space-between;gap:9px}.family-mark,.source-state{display:inline-flex;align-items:center;min-height:25px;padding:0 8px;border-radius:7px;font-size:10px;font-weight:1000;letter-spacing:.04em}.family-mark{background:#eaf2f7;color:#355f7d}.source-state{background:#eef8f2;color:#3c7657}.source-state.rolling{background:#fff5e5;color:#916728}.source-state.images{background:#f0eefb;color:#685b9c}.source-card h3{margin:17px 0 4px;font-size:20px;letter-spacing:-.02em}.source-id{color:#4b7799;font-size:12px}.source-card>p{min-height:67px;margin:12px 0;color:var(--muted);font-size:13px;line-height:1.55}.upstream{display:grid;gap:3px;margin-top:auto;padding-top:12px;border-top:1px solid var(--line)}.upstream span{color:#929da7;font-size:9px;font-weight:900;letter-spacing:.13em}.upstream strong{overflow:hidden;color:#405162;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.source-actions{display:flex;gap:7px;margin-top:14px}.source-actions button,.source-actions a,.adapter-card button{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 11px;border-radius:8px;font-size:11px;font-weight:900;text-decoration:none;cursor:pointer}.source-actions button,.adapter-card button{border:1px solid var(--navy);background:var(--navy);color:#fff}.source-actions a{border:1px solid var(--line);background:#fff;color:var(--ink)}.empty-state{padding:42px;border:1px dashed #bfc9ce;border-radius:13px;text-align:center;color:var(--muted)}
    .generator-section{display:grid;grid-template-columns:minmax(230px,.42fr) minmax(0,1fr);gap:20px;margin:72px 0 0;padding:28px;border-radius:18px;background:#dfe8e9}.generator-intro{padding:8px}.generator-rail{display:flex;gap:5px;margin-top:28px}.generator-rail span{height:5px;flex:1;border-radius:5px;background:#4b8fca}.generator-rail span:nth-child(2){background:#6bb590}.generator-rail span:nth-child(3){background:#d6a85f}.generator-card{display:grid;grid-template-columns:minmax(240px,.82fr) minmax(0,1.18fr);overflow:hidden;border:1px solid rgba(20,35,48,.11);border-radius:13px;background:#fff;box-shadow:0 18px 45px rgba(25,42,57,.09)}#configForm{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;padding:20px;border-right:1px solid var(--line);align-content:start}.field{display:grid;gap:7px}.field.full{grid-column:1/-1}.field[hidden]{display:none}.field label{color:#566575;font-size:11px;font-weight:900}.field input,.field select{width:100%;height:42px;padding:0 11px;border:1px solid var(--line);border-radius:8px;background:#fbfcfc;color:var(--ink);font:12px "SFMono-Regular",Consolas,monospace;outline:none}.field select{font-family:inherit}.field input:focus,.field select:focus{border-color:#70a6c8;box-shadow:0 0 0 3px rgba(75,143,202,.1)}.output-panel{min-width:0;padding:20px;background:var(--navy);color:#fff}.output-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}.output-top>div{display:grid;gap:3px}.output-top span{color:#8199aa;font-size:9px;font-weight:900;letter-spacing:.13em}.output-top strong{font-size:17px}.manager-badge{display:inline-flex;align-items:center;min-height:27px;padding:0 9px;border:1px solid rgba(123,196,212,.23);border-radius:7px;background:rgba(123,196,212,.09);color:#a9d9e3!important;letter-spacing:.04em!important}#configOutput{min-height:210px;max-height:390px;margin:0;overflow:auto;padding:16px;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:#0a1520;color:#d8e5ed;font-size:12px;line-height:1.65;white-space:pre-wrap;word-break:break-word}#configOutput code{font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace}.output-meta{display:grid;gap:10px;margin:14px 0}.output-meta>div{display:grid;gap:4px}.output-meta dt{color:#8199aa;font-size:9px;font-weight:900;letter-spacing:.13em}.output-meta dd{margin:0;color:#b8c8d3;font-size:11px;line-height:1.5}.output-meta a{color:#95cfe0;word-break:break-all}.output-actions{display:flex;flex-wrap:wrap;gap:7px}.output-actions .secondary{color:#fff}.output-actions .ghost{border-color:rgba(255,255,255,.15);background:transparent;color:#d8e5ed}.output-actions button:disabled{opacity:.55;cursor:wait}.probe-status{min-height:18px;margin:10px 0 0;color:#9eb0bd;font-size:11px}.probe-status.ok{color:#78d6a2}.probe-status.bad{color:#f0a5a5}
    .adapter-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.adapter-card{display:flex;min-height:210px;flex-direction:column;padding:17px;border:1px solid var(--line);border-radius:12px;background:#fff}.adapter-card.selected{border-color:#4b8fca;box-shadow:0 0 0 3px rgba(75,143,202,.1)}.adapter-card>div{display:flex;align-items:center;justify-content:space-between;gap:8px}.adapter-card>div span{color:#4b7799;font-size:9px;font-weight:1000;letter-spacing:.12em}.adapter-card>div strong{color:#7b8791;font-size:10px}.adapter-card h3{margin:20px 0 7px;font-size:18px}.adapter-card p{margin:0;color:var(--muted);font-size:12px;line-height:1.55}.adapter-card button{align-self:flex-start;margin-top:auto}
    .reliability-section{margin-top:72px;padding:36px;border-radius:18px;background:var(--navy);color:#fff}.section-heading.light h2{color:#fff}.section-heading.light p{color:#9eb0bd}.reliability-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.reliability-grid article{padding:18px;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:rgba(255,255,255,.035)}.reliability-grid article>span{color:#7bc4d4;font:900 10px monospace}.reliability-grid h3{margin:20px 0 7px;font-size:17px}.reliability-grid p{margin:0;color:#9eb0bd;font-size:12px;line-height:1.6}
    @media(max-width:1050px){.source-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.adapter-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.generator-section{grid-template-columns:1fr}.generator-intro{display:grid;grid-template-columns:1fr auto;align-items:end}.generator-intro h2,.generator-intro p,.generator-intro .section-kicker{grid-column:1}.generator-rail{grid-column:2;grid-row:1/4;width:120px}.generator-card{grid-template-columns:1fr 1fr}}
    @media(max-width:760px){.catalog-shell{width:min(100% - 20px,680px);padding:14px 0 48px}.catalog-hero{grid-template-columns:1fr;padding:28px 20px;border-radius:14px}.hero-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.hero-route{margin-top:6px}h1{font-size:44px}.browse-section,.adapter-section{padding-top:48px}.section-heading{display:block}.section-heading>strong{display:block;margin-top:10px}.source-grid,.adapter-grid,.reliability-grid{grid-template-columns:1fr}.source-card{min-height:0}.source-card>p{min-height:0}.generator-section{padding:15px;margin-top:52px}.generator-intro{display:block}.generator-rail{width:auto;margin-top:20px}.generator-card{grid-template-columns:1fr}#configForm{border-right:0;border-bottom:1px solid var(--line)}.reliability-section{padding:24px 16px;margin-top:52px}}
    @media(max-width:480px){.hero-metrics{grid-template-columns:1fr}.metric{padding:10px 0}.source-actions,.output-actions{display:grid;grid-template-columns:1fr 1fr}.source-actions button,.source-actions a,.output-actions .action{width:100%}#configForm{grid-template-columns:1fr}.field,.field.full{grid-column:1}h1{font-size:38px}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.source-card{transition:none}}
  `;
}
