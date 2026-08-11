import worker from "../src/index.js";
import { readFile } from "node:fs/promises";
import {
  ADAPTER_TARGETS,
  CONFIG_TARGETS,
  ConfigurationInputError,
  REPOSITORY_UI_TARGETS,
  generateConfiguration,
} from "../src/repositories/config-generator.js";

const BASE_URL = "https://edge.example.com";

assert(REPOSITORY_UI_TARGETS.length === 35, `expected 35 repository UI targets, got ${REPOSITORY_UI_TARGETS.length}`);
assert(ADAPTER_TARGETS.length === 13, `expected 13 adapter UI targets, got ${ADAPTER_TARGETS.length}`);
assert(CONFIG_TARGETS.length === 48, `expected 48 total configuration targets, got ${CONFIG_TARGETS.length}`);

for (const target of CONFIG_TARGETS) {
  const generated = generateConfiguration({ id: target.id, origin: BASE_URL });
  assert(generated.id === target.id, `${target.id} generated id mismatch`);
  assert(generated.command && typeof generated.command === "string", `${target.id} generated an empty command`);
  assert(generated.route.startsWith(BASE_URL), `${target.id} generated route does not use active origin`);
  assert(!generated.command.includes("undefined"), `${target.id} generated command contains undefined`);
  assert(generated.note && generated.manager, `${target.id} is missing UI metadata`);
}
console.log("ok all 48 catalog targets generate usable configuration");

const apk = generateConfiguration({ id: "openwrt", origin: BASE_URL, version: "25.12.0" });
const opkg = generateConfiguration({ id: "openwrt", origin: BASE_URL, version: "24.10.4" });
assert(apk.mode === "apk" && apk.command.includes("/etc/apk/repositories.d/distfeeds.list"), "OpenWrt 25.12 should generate APK configuration");
assert(opkg.mode === "opkg" && opkg.command.includes("/etc/opkg/distfeeds.conf"), "OpenWrt 24.10 should generate OPKG configuration");
console.log("ok OpenWrt APK and OPKG version boundary");

assertThrows(
  () => generateConfiguration({ id: "debian", origin: "javascript:alert(1)" }),
  ConfigurationInputError,
  "unsafe origin",
);
assertThrows(
  () => generateConfiguration({ id: "debian", origin: BASE_URL, components: "main; reboot" }),
  ConfigurationInputError,
  "unsafe component token",
);
assertThrows(
  () => generateConfiguration({ id: "not-real", origin: BASE_URL }),
  ConfigurationInputError,
  "unknown target",
);
console.log("ok catalog configuration input validation");

const catalogResponse = await worker.fetch(new Request(`${BASE_URL}/catalog?lang=zh`));
const catalogHtml = await catalogResponse.text();
assert(catalogResponse.status === 200, "catalog page should return 200");
assert(catalogResponse.headers.get("content-type")?.includes("text/html"), "catalog page should return HTML");
assertNoStore(catalogResponse, "catalog page");
assert((catalogHtml.match(/class="source-card"/g) ?? []).length === 35, "catalog page should render 35 source cards");
assert((catalogHtml.match(/class="adapter-card"/g) ?? []).length === 13, "catalog page should render 13 adapter cards");
for (const marker of [
  'id="configForm"',
  'id="sourceSearch"',
  'id="probeRoute"',
  'data-configure="openwrt"',
  'data-configure="nuget"',
  "一个可靠界面，配置全部镜像入口。",
  "/repo/{source}/{upstream-path}",
]) {
  assert(catalogHtml.includes(marker), `catalog page is missing ${marker}`);
}
console.log("ok complete Chinese catalog UI rendering");

const configResponse = await worker.fetch(new Request(
  `${BASE_URL}/catalog/config?id=freebsd-pkg&origin=${encodeURIComponent(BASE_URL)}&version=latest&arch=${encodeURIComponent("${ABI}")}`,
));
const config = await configResponse.json();
assert(configResponse.status === 200, "catalog config endpoint should return 200");
assert(config.command.includes(`pkg+${BASE_URL}/repo/freebsd-pkg/${"${ABI}"}/latest`), "FreeBSD generated config mismatch");
assertNoStore(configResponse, "catalog config endpoint");

const badConfigResponse = await worker.fetch(new Request(
  `${BASE_URL}/catalog/config?id=debian&origin=${encodeURIComponent("javascript:alert(1)")}`,
));
assert(badConfigResponse.status === 400, "catalog config endpoint should reject unsafe origin");

const methodResponse = await worker.fetch(new Request(`${BASE_URL}/catalog/config`, { method: "POST" }));
assert(methodResponse.status === 405, "catalog should reject write methods");
assert(methodResponse.headers.get("allow") === "GET, HEAD, OPTIONS", "catalog Allow header mismatch");
console.log("ok catalog config endpoint and read-only policy");

const portalResponse = await worker.fetch(new Request(`${BASE_URL}/edgemirror?lang=zh`));
const portalHtml = await portalResponse.text();
assert(portalResponse.status === 200, "new portal should return 200");
assert(portalHtml.includes(`${BASE_URL}/catalog`), "new portal should link to catalog");
assert(portalHtml.includes("35"), "new portal should expose source count");
assert(portalHtml.includes("把每一次安装请求"), "new portal should render the new Chinese product hero");
assertNoStore(portalResponse, "new portal");

const legacyPageResponse = await worker.fetch(new Request(`${BASE_URL}/pypi`));
const legacyPageHtml = await legacyPageResponse.text();
assert(legacyPageHtml.includes(`${BASE_URL}/catalog`), "legacy tool navigation should include Catalog");
assert(legacyPageResponse.status === 200, "legacy tool page should remain available");
console.log("ok new portal and legacy-page Catalog navigation");

const documentationChecks = [
  ["README.md", ["Current Release: 2.0.0", "35 fixed upstream roots", "48 complete configuration targets", "Canonical Route Map", "/catalog/config", "OpenWrt 25.12", "https://box.w0x7ce.eu"]],
  ["README.zh-CN.md", ["当前版本：2.0.0", "35 个固定官方上游根目录", "48 个完整配置目标", "规范路由地图", "/catalog/config", "OpenWrt 25.12", "https://box.w0x7ce.eu"]],
  ["README.es.md", ["Versión actual: 2.0.0", "35 raíces upstream oficiales", "48 targets de configuración", "Mapa de rutas canónicas", "/catalog/config", "OpenWrt 25.12", "https://box.w0x7ce.eu"]],
  ["REPOSITORIES.md", ["Repository Gateway", "35", "/repo/{source}", "/pkg/nuget/v3/index.json", "OpenWrt 25.12"]],
];

for (const [filename, markers] of documentationChecks) {
  const document = await readFile(new URL(`../${filename}`, import.meta.url), "utf8");
  for (const marker of markers) {
    assert(document.includes(marker), `${filename} is missing current-release marker: ${marker}`);
  }
}
console.log("ok multilingual README and repository guide release consistency");

function assertNoStore(response, name) {
  assert(response.headers.get("cache-control") === "no-store", `${name} Cache-Control mismatch`);
  assert(response.headers.get("cdn-cache-control") === "no-store", `${name} CDN-Cache-Control mismatch`);
  assert(response.headers.get("cloudflare-cdn-cache-control") === "no-store", `${name} Cloudflare cache header mismatch`);
}

function assertThrows(callback, expectedError, name) {
  try {
    callback();
  } catch (error) {
    assert(error instanceof expectedError, `${name} threw the wrong error type`);
    return;
  }
  throw new Error(`${name} did not throw`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
