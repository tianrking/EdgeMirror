import { HELP_DEFINITION, PROJECT, TOOL_DEFINITIONS } from "./config.js";
import { getLanguage, preserveLanguageUrl, renderClientI18nScript, renderHeaderLanguageSwitch } from "./i18n.js";

const TOOL_BY_KEY = new Map(TOOL_DEFINITIONS.map((tool) => [tool.key, tool]));
const KNOWN_HOSTS = new Set(TOOL_DEFINITIONS.map((tool) => tool.host));
const NAV_ITEMS = [...TOOL_DEFINITIONS, HELP_DEFINITION];

const NAV_LABELS = {
  portal: "EdgeMirror",
  pypi: "PyPI",
  hf: "Hugging Face",
  github: "GitHub",
  docker: "Docker",
  mirrors: "Linux",
  proxy: "Proxy",
  npm: "npm",
  go: "Go",
  maven: "Maven",
  crates: "Crates",
  downloads: "Downloads",
  help: "Help",
};

export function getToolBaseUrl(request, key) {
  const url = new URL(request.url);
  const origin = getAppOrigin(url);
  const item = key === HELP_DEFINITION.key ? HELP_DEFINITION : TOOL_BY_KEY.get(key);

  if (!item) {
    return origin;
  }

  return `${origin}${item.path ?? `/${key}`}`;
}

export function getDockerRegistryHost(request) {
  const url = new URL(request.url);
  return new URL(getAppOrigin(url)).host;
}

export function renderToolNav(request, activeKey) {
  const lang = getLanguage(request);
  const links = NAV_ITEMS.map((item) => {
    const active = item.key === activeKey ? ' class="active"' : "";
    const href = preserveLanguageUrl(getToolBaseUrl(request, item.key), lang);
    return `<a href="${href}"${active}>${NAV_LABELS[item.key] ?? item.title}</a>`;
  });
  const languageSwitch = renderHeaderLanguageSwitch(request, lang);

  return `${renderSharedHeaderStyles()}<div class="edgemirror-header"><nav class="nav" aria-label="Tool navigation">${links.join("")}</nav>${languageSwitch}</div>${renderClientI18nScript(lang)}`;
}

function renderSharedHeaderStyles() {
  return `<style>
    :root { --edgemirror-header-height: 74px; }
    body { padding-top: var(--edgemirror-header-height) !important; }
    .edgemirror-header {
      position: fixed !important;
      top: 20px !important;
      left: 24px !important;
      right: 30px !important;
      z-index: 10000 !important;
      height: auto !important;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 12px !important;
      padding: 0 !important;
      margin: 0 !important;
      min-height: 0 !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      animation: none !important;
      pointer-events: none !important;
    }
    .edgemirror-header .nav {
      position: static !important;
      inset: auto !important;
      width: auto !important;
      max-width: 100% !important;
      height: auto !important;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      flex-wrap: wrap !important;
      gap: 10px !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      padding: 0 !important;
      margin: 0 !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      scrollbar-width: none !important;
      pointer-events: auto !important;
    }
    .edgemirror-lang-switch {
      flex: 0 0 auto !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
      padding: 3px !important;
      border-radius: 20px !important;
      background: rgba(255, 255, 255, 0.78) !important;
      border: 1px solid rgba(15, 23, 42, 0.08) !important;
      box-shadow: none !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      pointer-events: auto !important;
    }
    .edgemirror-lang-switch a {
      flex: 0 0 auto !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-height: 28px !important;
      min-width: 34px !important;
      padding: 0 9px !important;
      border-radius: 16px !important;
      color: #475569 !important;
      text-decoration: none !important;
      font-size: 12px !important;
      font-weight: 900 !important;
      line-height: 1 !important;
      white-space: nowrap !important;
      background: transparent !important;
      border: 0 !important;
    }
    .edgemirror-lang-switch a.active {
      background: #eef5f8 !important;
      color: #334155 !important;
      border: 1px solid rgba(99, 124, 145, 0.18) !important;
    }
    .edgemirror-header .nav::-webkit-scrollbar { display: none !important; }
    .edgemirror-header .nav a {
      flex: 0 0 auto !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-height: 34px !important;
      padding: 0 14px !important;
      border-radius: 20px !important;
      border: 1px solid rgba(15, 23, 42, 0.08) !important;
      background: rgba(255, 255, 255, 0.72) !important;
      color: #64748b !important;
      text-decoration: none !important;
      font-size: 13px !important;
      font-weight: 800 !important;
      line-height: 1 !important;
      white-space: nowrap !important;
      transform: none !important;
      box-shadow: none !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease !important;
    }
    .edgemirror-header .nav a:hover {
      background: #ffffff !important;
      color: #334155 !important;
      border-color: rgba(15, 23, 42, 0.16) !important;
      transform: translateY(-1px) !important;
    }
    .edgemirror-header .nav a.active {
      background: #eef5f8 !important;
      color: #334155 !important;
      border-color: rgba(99, 124, 145, 0.2) !important;
      box-shadow: 0 8px 22px rgba(86, 112, 137, 0.12) !important;
    }
    @media (max-width: 640px) {
      :root { --edgemirror-header-height: 70px; }
      .edgemirror-header {
        top: 12px !important;
        left: 12px !important;
        right: 12px !important;
        justify-content: flex-start !important;
        gap: 8px !important;
      }
      .edgemirror-header .nav {
        width: 100% !important;
        justify-content: flex-start !important;
        flex-wrap: nowrap !important;
        gap: 6px !important;
      }
      .edgemirror-header .nav a { min-height: 32px !important; padding: 0 11px !important; font-size: 12px !important; }
      .edgemirror-lang-switch { gap: 3px !important; padding: 2px !important; }
      .edgemirror-lang-switch a { min-height: 28px !important; min-width: 30px !important; padding: 0 7px !important; font-size: 11px !important; }
    }
  </style>`;
}

export function getAppOrigin(url) {
  if (KNOWN_HOSTS.has(url.hostname.toLowerCase())) {
    return `https://${PROJECT.primaryHost}`;
  }

  return url.origin;
}
