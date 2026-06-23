import { getLanguage } from "../i18n.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { corsPreflightResponse, htmlResponse, joinUrlPath, proxyRequest } from "../proxy-utils.js";
import { renderAcceleratorPage } from "../tool-page.js";

const INDEX_UPSTREAM = "https://index.crates.io";
const DOWNLOAD_UPSTREAM = "https://static.crates.io/crates";

const COPY = {
  en: {
    lead: "Proxy the crates.io sparse index and crate downloads for Rust / Cargo dependency fetching.",
    env: "One-shot environment variable",
    testIndex: "Test index",
    mapping: "Example mapping",
    note: "Status: Test. Sparse index and crate downloads are proxied; publish, yank, and token APIs are outside the current stable scope.",
  },
  es: {
    lead: "Proxy del sparse index de crates.io y descargas .crate para Rust / Cargo.",
    env: "Variable de entorno puntual",
    testIndex: "Probar index",
    mapping: "Ejemplo de mapeo",
    note: "Estado: Test. Sparse index y descargas .crate estan proxied; publish, yank y token API quedan fuera del alcance estable.",
  },
  zh: {
    lead: "代理 crates.io sparse index 和 crate 包下载，适合 Rust / Cargo 项目依赖拉取。",
    env: "单次环境变量",
    testIndex: "测试 index",
    mapping: "映射示例",
    note: "状态：Test。Sparse index 与 crate download 已代理；publish、yank、token API 不在当前稳定范围。",
  },
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseUrl = getToolBaseUrl(request, "crates");

    if (request.method === "OPTIONS") {
      return corsPreflightResponse();
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return htmlResponse(renderPage(request, baseUrl));
    }

    const downloadMatch = url.pathname.match(/^\/api\/v1\/crates\/([^/]+)\/([^/]+)\/download$/);
    if (downloadMatch) {
      const [, crateName, version] = downloadMatch;
      const target = joinUrlPath(DOWNLOAD_UPSTREAM, `/${crateName}/${crateName}-${version}.crate`, url.search);
      return proxyRequest(request, target, {
        redirectBaseUrl: baseUrl,
        cacheControl: "public, max-age=31536000, immutable",
      });
    }

    const target = joinUrlPath(INDEX_UPSTREAM, url.pathname, url.search);
    return proxyRequest(request, target, {
      redirectBaseUrl: baseUrl,
      cacheControl: "public, max-age=300",
      forceTextTransform: url.pathname === "/config.json",
      transformText: (body) => rewriteSparseConfig(body, baseUrl, url.pathname),
    });
  },
};

function rewriteSparseConfig(body, baseUrl, pathname) {
  if (pathname !== "/config.json") {
    return body;
  }

  try {
    const config = JSON.parse(body);
    config.dl = `${baseUrl}/api/v1/crates`;
    return `${JSON.stringify(config, null, 2)}\n`;
  } catch {
    return body;
  }
}

function renderPage(request, baseUrl) {
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const nav = renderToolNav(request, "crates");

  return renderAcceleratorPage({
    accent: "#c9a47d",
    accentStrong: "#a98462",
    cards: [
      {
        title: ".cargo/config.toml",
        command: `[source.crates-io]\nreplace-with = "edgemirror"\n\n[source.edgemirror]\nregistry = "sparse+${baseUrl}/"`,
      },
      { title: copy.env, command: "CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse cargo fetch" },
      { title: copy.testIndex, command: `${baseUrl}/config.json` },
      {
        title: copy.mapping,
        command: `Original:\nsparse+https://index.crates.io/\nserde = "1"\n\nAccelerated:\nsparse+${baseUrl}/\nserde = "1"`,
      },
    ],
    copy,
    lang,
    nav,
    note: copy.note,
    pageTitle: "Crates Proxy | EdgeMirror",
    status: "test",
    title: "crates.io Sparse Proxy",
  });
}
