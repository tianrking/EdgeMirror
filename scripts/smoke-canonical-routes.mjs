import worker from "../src/index.js";

const BASE_URL = "https://edge.example.com";
const realFetch = globalThis.fetch;
const fetchCalls = [];

globalThis.fetch = async (input, init = {}) => {
  const request = input instanceof Request ? input : new Request(input, init);
  fetchCalls.push({
    cache: init.cache,
    method: request.method,
    redirect: request.redirect,
    url: request.url,
  });

  if (request.url === "https://registry.npmjs.org/is-number") {
    return jsonResponse({
      name: "is-number",
      versions: {
        "7.0.0": {
          dist: { tarball: "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz" },
        },
      },
    });
  }

  if (request.url === "https://api.nuget.org/v3/index.json") {
    return jsonResponse({
      version: "3.0.0",
      resources: [
        { "@id": "https://api.nuget.org/v3-flatcontainer/", "@type": "PackageBaseAddress/3.0.0" },
        { "@id": "https://azuresearch-usnc.nuget.org/query", "@type": "SearchQueryService/3.5.0" },
        { "@id": "https://www.nuget.org/api/v2/package", "@type": "PackagePublish/2.0.0" },
        {
          "@id": "https://www.nuget.org/packages/{id}/{version}?_src=template",
          "@type": "PackageDetailsUriTemplate/5.1.0",
        },
      ],
    });
  }

  if (request.url === "https://api.nuget.org/v3-flatcontainer/example/index.json") {
    return jsonResponse({
      versions: ["1.0.0"],
      catalogEntry: "https://api.nuget.org/v3/registration5-gz-semver2/example/1.0.0.json",
    });
  }

  if (request.url === "https://nodejs.org/dist/index.json") {
    return jsonResponse([{ version: "v24.0.0", files: ["win-x64-msi"] }]);
  }

  if (request.url === "https://storage.googleapis.com/flutter_infra_release/releases/releases_windows.json") {
    return jsonResponse({
      base_url: "https://storage.googleapis.com/flutter_infra_release/releases",
      current_release: { stable: "example-hash" },
      releases: [{ hash: "example-hash", archive: "stable/windows/flutter_windows_example.zip" }],
    });
  }

  if (request.url === "https://storage.googleapis.com/flutter_infra_release/flutter/example/artifact.zip") {
    return new Response("flutter-artifact", { headers: { "Content-Type": "application/zip" } });
  }

  if (request.url === "https://registry-1.docker.io/v2/") {
    return new Response(null, {
      status: 401,
      headers: {
        "Www-Authenticate": "Bearer realm=\"https://auth.docker.io/token\",service=\"registry.docker.io\"",
      },
    });
  }

  if (request.url.startsWith("https://auth.docker.io/token?")) {
    return jsonResponse({ token: "test-token" });
  }

  if (request.url === "https://github.com/owner/repo/archive/refs/heads/main.zip") {
    return new Response(null, {
      status: 302,
      headers: { Location: "https://codeload.github.com/owner/repo/zip/refs/heads/main" },
    });
  }

  return new Response(`unexpected upstream: ${request.url}`, { status: 599 });
};

try {
  const packageIndexResponse = await worker.fetch(new Request(`${BASE_URL}/pkg`));
  const packageIndex = await packageIndexResponse.json();
  assert(packageIndexResponse.status === 200, "package index should return 200");
  assert(packageIndex.adapters.map((adapter) => adapter.id).join(",") === "npm,nuget", "package index mismatch");
  assertNoStore(packageIndexResponse, "package index");
  console.log("ok canonical package index");

  fetchCalls.length = 0;
  const npmResponse = await worker.fetch(new Request(`${BASE_URL}/pkg/npm/is-number`));
  const npmBody = await npmResponse.text();
  assert(npmResponse.status === 200, "canonical npm route should return 200");
  assert(
    npmBody.includes(`${BASE_URL}/pkg/npm/is-number/-/is-number-7.0.0.tgz`),
    "canonical npm metadata should use the canonical base path",
  );
  assert(fetchCalls[0]?.url === "https://registry.npmjs.org/is-number", "canonical npm target mismatch");
  assert(fetchCalls[0]?.cache === "no-store", "canonical npm fetch must bypass cache");
  assertNoStore(npmResponse, "canonical npm response");

  const legacyNpmResponse = await worker.fetch(new Request(`${BASE_URL}/npm/is-number`));
  const legacyNpmBody = await legacyNpmResponse.text();
  assert(
    legacyNpmBody.includes(`${BASE_URL}/npm/is-number/-/is-number-7.0.0.tgz`),
    "legacy npm metadata rewrite must remain unchanged",
  );
  console.log("ok canonical npm route and legacy alias");

  fetchCalls.length = 0;
  const nugetIndexResponse = await worker.fetch(new Request(`${BASE_URL}/pkg/nuget/v3/index.json`));
  const nugetIndex = await nugetIndexResponse.json();
  assert(nugetIndexResponse.status === 200, "NuGet service index should return 200");
  assert(
    nugetIndex.resources.every((resource) => !String(resource["@type"]).startsWith("PackagePublish")),
    "NuGet read-only service index must not advertise package publishing",
  );
  assert(
    nugetIndex.resources.every((resource) => resource["@id"].startsWith(`${BASE_URL}/pkg/nuget/upstream/`)),
    "NuGet service index resources must point back through EdgeMirror",
  );
  assert(fetchCalls[0]?.url === "https://api.nuget.org/v3/index.json", "NuGet service index target mismatch");
  assert(fetchCalls[0]?.cache === "no-store", "NuGet service index fetch must bypass cache");
  assert(nugetIndexResponse.headers.get("etag") === null, "transformed NuGet JSON must not retain upstream ETag");
  assertNoStore(nugetIndexResponse, "NuGet service index");

  fetchCalls.length = 0;
  const nugetResourceResponse = await worker.fetch(new Request(
    `${BASE_URL}/pkg/nuget/upstream/https://api.nuget.org/v3-flatcontainer/example/index.json`,
  ));
  const nugetResource = await nugetResourceResponse.json();
  assert(
    fetchCalls[0]?.url === "https://api.nuget.org/v3-flatcontainer/example/index.json",
    "NuGet nested resource target mismatch",
  );
  assert(
    nugetResource.catalogEntry === `${BASE_URL}/pkg/nuget/upstream/https://api.nuget.org/v3/registration5-gz-semver2/example/1.0.0.json`,
    "NuGet nested JSON URLs must stay on EdgeMirror",
  );

  const forbiddenNugetResponse = await worker.fetch(new Request(
    `${BASE_URL}/pkg/nuget/upstream/https://example.com/file.json`,
  ));
  assert(forbiddenNugetResponse.status === 403, "NuGet adapter must reject non-NuGet hosts");

  const writeNugetResponse = await worker.fetch(new Request(`${BASE_URL}/pkg/nuget/v3/index.json`, { method: "POST" }));
  assert(writeNugetResponse.status === 405, "NuGet adapter must reject write methods");
  console.log("ok read-only NuGet v3 resource-chain rewrite");

  const sdkIndexResponse = await worker.fetch(new Request(`${BASE_URL}/sdk`));
  const sdkIndex = await sdkIndexResponse.json();
  assert(sdkIndex.sources.map((source) => source.id).join(",") === "node,flutter", "SDK index mismatch");
  assertNoStore(sdkIndexResponse, "SDK index");

  fetchCalls.length = 0;
  const nodeResponse = await worker.fetch(new Request(`${BASE_URL}/sdk/node/index.json`));
  assert(nodeResponse.status === 200, "Node SDK route should return 200");
  assert(fetchCalls[0]?.url === "https://nodejs.org/dist/index.json", "Node SDK target mismatch");
  assert(fetchCalls[0]?.cache === "no-store", "Node SDK fetch must bypass cache");
  assertNoStore(nodeResponse, "Node SDK response");

  fetchCalls.length = 0;
  const flutterMetadataResponse = await worker.fetch(new Request(`${BASE_URL}/sdk/flutter/releases/releases_windows.json`));
  const flutterMetadata = await flutterMetadataResponse.json();
  assert(
    fetchCalls[0]?.url === "https://storage.googleapis.com/flutter_infra_release/releases/releases_windows.json",
    "Flutter metadata target mismatch",
  );
  assert(
    flutterMetadata.base_url === `${BASE_URL}/sdk/flutter/releases`,
    "Flutter metadata base_url should use EdgeMirror",
  );

  fetchCalls.length = 0;
  const flutterStorageResponse = await worker.fetch(new Request(
    `${BASE_URL}/sdk/flutter/flutter_infra_release/flutter/example/artifact.zip`,
  ));
  assert(flutterStorageResponse.status === 200, "Flutter storage-base route should return 200");
  assert(
    fetchCalls[0]?.url === "https://storage.googleapis.com/flutter_infra_release/flutter/example/artifact.zip",
    "Flutter storage-base target mismatch",
  );
  console.log("ok Node and Flutter SDK routes");

  fetchCalls.length = 0;
  const dockerResponse = await worker.fetch(new Request(`${BASE_URL}/oci/docker/v2/`, { method: "HEAD" }));
  assert(dockerResponse.status === 401, "canonical Docker v2 route should preserve registry auth status");
  assert(
    dockerResponse.headers.get("www-authenticate")?.includes(`realm=\"${BASE_URL}/oci/docker/token\"`),
    "canonical Docker auth realm mismatch",
  );
  assert(fetchCalls[0]?.url === "https://registry-1.docker.io/v2/", "canonical Docker target mismatch");
  assert(fetchCalls[0]?.cache === "no-store", "canonical Docker fetch must bypass cache");
  assertNoStore(dockerResponse, "canonical Docker response");

  fetchCalls.length = 0;
  const tokenResponse = await worker.fetch(new Request(
    `${BASE_URL}/oci/docker/token?service=registry.docker.io&scope=repository:library/nginx:pull`,
  ));
  assert(tokenResponse.status === 200, "canonical Docker token route should return 200");
  assert(fetchCalls[0]?.url.startsWith("https://auth.docker.io/token?"), "canonical Docker token target mismatch");
  console.log("ok canonical OCI Docker route");

  fetchCalls.length = 0;
  const githubResponse = await worker.fetch(new Request(
    `${BASE_URL}/git/github/owner/repo/archive/refs/heads/main.zip`,
  ));
  assert(githubResponse.status === 302, "canonical GitHub route should preserve redirect status");
  assert(
    githubResponse.headers.get("location") === `${BASE_URL}/git/github/https://codeload.github.com/owner/repo/zip/refs/heads/main`,
    "canonical GitHub redirect mismatch",
  );
  assert(
    fetchCalls[0]?.url === "https://github.com/owner/repo/archive/refs/heads/main.zip",
    "canonical GitHub target mismatch",
  );
  assertNoStore(githubResponse, "canonical GitHub response");
  console.log("ok canonical GitHub route");

  const unknownPackageResponse = await worker.fetch(new Request(`${BASE_URL}/pkg/not-real/file`));
  const unknownOciResponse = await worker.fetch(new Request(`${BASE_URL}/oci/not-real/v2/`));
  const unknownGitResponse = await worker.fetch(new Request(`${BASE_URL}/git/not-real/repo`));
  assert(unknownPackageResponse.status === 404, "unknown package adapter should return 404");
  assert(unknownOciResponse.status === 404, "unknown OCI adapter should return 404");
  assert(unknownGitResponse.status === 404, "unknown git adapter should return 404");
  console.log("ok unknown canonical route handling");
} finally {
  globalThis.fetch = realFetch;
}

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",
      ETag: '"upstream-etag"',
    },
  });
}

function assertNoStore(response, name) {
  assert(response.headers.get("cache-control") === "no-store", `${name} Cache-Control mismatch`);
  assert(response.headers.get("cdn-cache-control") === "no-store", `${name} CDN-Cache-Control mismatch`);
  assert(
    response.headers.get("cloudflare-cdn-cache-control") === "no-store",
    `${name} Cloudflare-CDN-Cache-Control mismatch`,
  );
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
