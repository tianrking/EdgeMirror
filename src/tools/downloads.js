import { getLanguage } from "../i18n.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { corsPreflightResponse, htmlResponse, joinUrlPath, parseTargetUrlFromPath, proxyRequest, textResponse } from "../proxy-utils.js";
import { renderAcceleratorPage } from "../tool-page.js";

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
    lead: "Proxy common runtimes, developer tools, Open VSX, SourceForge, GitLab/Gitea release files, and direct HTTP URLs.",
    mapping: "Example mapping",
    note: "Status: Test. Good for binary installers and release assets; authenticated or hotlink-protected upstreams still follow the original site's rules.",
  },
  es: {
    lead: "Proxy para runtimes, herramientas, Open VSX, SourceForge, releases de GitLab/Gitea y URLs HTTP directas.",
    mapping: "Ejemplo de mapeo",
    note: "Estado: Test. Adecuado para instaladores binarios y release assets; los origenes con login o proteccion anti-hotlink siguen sus reglas.",
  },
  zh: {
    lead: "统一代理常见运行时、开发工具、Open VSX、SourceForge、GitLab/Gitea release 文件，也支持直接粘贴完整 HTTP URL。",
    mapping: "映射示例",
    note: "状态：Test。适合二进制安装包和 release asset 下载；带登录态或反盗链的上游仍需要按原站规则处理。",
  },
};

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

  return renderAcceleratorPage({
    accent: "#0f766e",
    accentStrong: "#0f766e",
    cards: [
      { title: "Node.js", command: `${baseUrl}/node/v22.11.0/node-v22.11.0-x64.msi` },
      { title: "Python", command: `${baseUrl}/python/3.12.7/python-3.12.7-amd64.exe` },
      { title: "Go", command: `${baseUrl}/golang/go1.23.3.windows-amd64.msi` },
      { title: "Rustup", command: `${baseUrl}/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe` },
      { title: "Open VSX", command: `${baseUrl}/openvsx/api/redhat/java/latest/file/redhat.java.vsix` },
      { title: "Direct URL", command: `${baseUrl}/https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi` },
      {
        title: copy.mapping,
        command: `Original:\nhttps://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi\n\nAccelerated:\n${baseUrl}/https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi`,
      },
    ],
    copy,
    lang,
    nav,
    note: copy.note,
    pageTitle: "Downloads Proxy | DevBox Workers",
    status: "test",
    title: "Runtime & Release Downloads",
  });
}
