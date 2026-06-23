import { getLanguage } from "../i18n.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { corsPreflightResponse, htmlResponse, joinUrlPath, proxyRequest } from "../proxy-utils.js";
import { renderAcceleratorPage } from "../tool-page.js";

const UPSTREAM = "https://proxy.golang.org";

const COPY = {
  en: {
    lead: "GOPROXY-compatible module list, version metadata, .mod files, and .zip downloads.",
    temporary: "Temporary use",
    persistent: "Persistent config",
    restore: "Restore default",
    mapping: "Example mapping",
    note: "Status: Test. Module proxy paths are available; keep Go's default sumdb settings or your own trusted configuration.",
  },
  es: {
    lead: "Compatible con GOPROXY: module list, metadata de version, archivos .mod y .zip.",
    temporary: "Uso temporal",
    persistent: "Configuracion persistente",
    restore: "Restaurar valor predeterminado",
    mapping: "Ejemplo de mapeo",
    note: "Estado: Test. Las rutas de modulo estan disponibles; conserva sumdb por defecto o tu configuracion confiable.",
  },
  zh: {
    lead: "兼容 Go module proxy 协议，代理 module list、version metadata、mod 文件和 zip 包下载。",
    temporary: "临时使用",
    persistent: "长期配置",
    restore: "恢复默认",
    mapping: "映射示例",
    note: "状态：Test。模块代理路径已可用；sumdb 仍建议使用 Go 默认设置或你自己的可信配置。",
  },
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseUrl = getToolBaseUrl(request, "go");

    if (request.method === "OPTIONS") {
      return corsPreflightResponse();
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return htmlResponse(renderPage(request, baseUrl));
    }

    const target = joinUrlPath(UPSTREAM, url.pathname, url.search);
    return proxyRequest(request, target, {
      redirectBaseUrl: baseUrl,
      cacheControl: "public, max-age=300",
    });
  },
};

function renderPage(request, baseUrl) {
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const nav = renderToolNav(request, "go");

  return renderAcceleratorPage({
    accent: "#80c6d8",
    accentStrong: "#5f9fb4",
    cards: [
      { title: copy.temporary, command: `GOPROXY=${baseUrl},direct go install golang.org/x/tools/cmd/stringer@latest` },
      { title: copy.persistent, command: `go env -w GOPROXY=${baseUrl},direct` },
      { title: copy.restore, command: "go env -w GOPROXY=https://proxy.golang.org,direct" },
      {
        title: copy.mapping,
        command: `Original:\nGOPROXY=https://proxy.golang.org,direct go install golang.org/x/tools/cmd/stringer@latest\n\nAccelerated:\nGOPROXY=${baseUrl},direct go install golang.org/x/tools/cmd/stringer@latest`,
      },
    ],
    copy,
    lang,
    nav,
    note: copy.note,
    pageTitle: "Go Module Proxy | EdgeMirror",
    status: "test",
    title: "Go Module Proxy",
  });
}
