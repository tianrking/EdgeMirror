import { getLanguage } from "../i18n.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { corsPreflightResponse, htmlResponse, joinUrlPath, proxyRequest } from "../proxy-utils.js";
import { renderAcceleratorPage } from "../tool-page.js";

const UPSTREAM = "https://registry.npmjs.org";

const COPY = {
  en: {
    lead: "Proxy npm registry metadata and tarball downloads for temporary or persistent Node.js dependency installs.",
    note: "Status: Test. Registry metadata rewrite and tarball downloads are supported; private npm tokens and publish flows should be validated in a test environment.",
    mapping: "Example mapping",
  },
  es: {
    lead: "Proxy de metadata y tarballs de npm para instalaciones temporales o persistentes en proyectos Node.js.",
    note: "Estado: Test. Soporta metadata rewrite y tarballs; valida tokens privados y publish en un entorno de prueba.",
    mapping: "Ejemplo de mapeo",
  },
  zh: {
    lead: "代理 npm registry metadata 与 tarball 下载，适合 Node.js 项目安装依赖时临时或长期配置。",
    note: "状态：Test。已支持 registry metadata rewrite 和 tarball 下载；企业私有 npm token、publish 流程建议先在测试环境验证。",
    mapping: "映射示例",
  },
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseUrl = getToolBaseUrl(request, "npm");

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
      transformText: (body) => rewriteRegistryUrls(body, baseUrl),
    });
  },
};

function rewriteRegistryUrls(body, baseUrl) {
  return body
    .replaceAll("https://registry.npmjs.org", baseUrl)
    .replaceAll("http://registry.npmjs.org", baseUrl);
}

function renderPage(request, baseUrl) {
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const nav = renderToolNav(request, "npm");
  const npmCommand = `npm install lodash --registry=${baseUrl}/`;
  const pnpmCommand = `pnpm install lodash --registry=${baseUrl}/`;
  const yarnCommand = `yarn config set registry ${baseUrl}/`;

  return renderAcceleratorPage({
    accent: "#d88c8d",
    accentStrong: "#b76f74",
    cards: [
      { title: "npm", command: npmCommand },
      { title: "pnpm", command: pnpmCommand },
      { title: "yarn", command: yarnCommand },
      { title: ".npmrc", command: `registry=${baseUrl}/` },
      {
        title: copy.mapping,
        command: `Original:\nnpm install lodash --registry=https://registry.npmjs.org/\n\nAccelerated:\nnpm install lodash --registry=${baseUrl}/`,
      },
    ],
    copy,
    lang,
    nav,
    note: copy.note,
    pageTitle: "npm Proxy | EdgeMirror",
    status: "test",
    title: "npm / pnpm / yarn Proxy",
  });
}
