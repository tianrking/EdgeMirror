import worker from "../src/index.js";

const BASE_URL = "https://edge.example.com";

await Promise.all([
  checkHead("Node SDK", "/sdk/node/index.json", [200], "node"),
  checkFlutter(),
  checkNuget(),
  checkNpm(),
  checkHead("Docker OCI", "/oci/docker/v2/", [200, 401]),
  checkHead(
    "GitHub",
    "/git/github/https://raw.githubusercontent.com/github/gitignore/main/README.md",
    [200],
  ),
]);

async function checkHead(name, path, acceptedStatuses, expectedSource) {
  const response = await worker.fetch(new Request(`${BASE_URL}${path}`, {
    method: "HEAD",
    signal: AbortSignal.timeout(30_000),
  }));

  if (!acceptedStatuses.includes(response.status)) {
    throw new Error(`${name} live check failed with status ${response.status}`);
  }
  assertNoStore(response, name);
  if (expectedSource && response.headers.get("x-edgemirror-source") !== expectedSource) {
    throw new Error(`${name} live check source header mismatch`);
  }
  console.log(`ok ${name} live HEAD`);
}

async function checkFlutter() {
  const response = await worker.fetch(new Request(`${BASE_URL}/sdk/flutter/releases/releases_linux.json`, {
    signal: AbortSignal.timeout(30_000),
  }));
  const payload = await response.json();

  if (response.status !== 200 || payload.base_url !== `${BASE_URL}/sdk/flutter/releases`) {
    throw new Error(`Flutter live metadata check failed with status ${response.status}`);
  }
  assertNoStore(response, "Flutter");
  console.log("ok Flutter live metadata rewrite");
}

async function checkNuget() {
  const response = await worker.fetch(new Request(`${BASE_URL}/pkg/nuget/v3/index.json`, {
    signal: AbortSignal.timeout(30_000),
  }));
  const payload = await response.json();

  if (response.status !== 200 || !Array.isArray(payload.resources)) {
    throw new Error(`NuGet live service-index check failed with status ${response.status}`);
  }
  if (payload.resources.some((resource) => String(resource["@type"]).startsWith("PackagePublish"))) {
    throw new Error("NuGet live service index still advertises package publishing");
  }
  if (!payload.resources.every((resource) => resource["@id"].startsWith(`${BASE_URL}/pkg/nuget/upstream/`))) {
    throw new Error("NuGet live service index contains a direct upstream resource");
  }
  assertNoStore(response, "NuGet");
  console.log("ok NuGet live service-index rewrite");
}

async function checkNpm() {
  const response = await worker.fetch(new Request(`${BASE_URL}/pkg/npm/is-number`, {
    signal: AbortSignal.timeout(30_000),
  }));
  const body = await response.text();

  if (response.status !== 200 || !body.includes(`${BASE_URL}/pkg/npm/is-number/-/`)) {
    throw new Error(`npm canonical live check failed with status ${response.status}`);
  }
  assertNoStore(response, "npm");
  console.log("ok npm canonical live metadata rewrite");
}

function assertNoStore(response, name) {
  if (response.headers.get("cache-control") !== "no-store") {
    throw new Error(`${name} live check did not return Cache-Control: no-store`);
  }
}
