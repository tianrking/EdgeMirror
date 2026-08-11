import worker from "../src/index.js";
import { REPOSITORY_SOURCES } from "../src/repositories/catalog.js";

const BASE_URL = "https://edge.example.com";
const EXPECTED_IDS = [
  "debian",
  "debian-security",
  "debian-ports",
  "ubuntu",
  "ubuntu-security",
  "ubuntu-ports",
  "ubuntu-releases",
  "raspbian",
  "raspberrypi",
  "raspberrypi-images",
  "openwrt",
  "openwrt-releases",
  "openwrt-snapshots",
  "openwrt-packages",
  "openwrt-firmware",
  "openwrt-sdk",
  "immortalwrt",
  "immortalwrt-releases",
  "immortalwrt-snapshots",
  "arch",
  "archlinuxarm",
  "alpine",
  "fedora",
  "epel",
  "centos-stream",
  "rocky",
  "almalinux",
  "opensuse",
  "void",
  "void-musl",
  "freebsd-pkg",
  "msys2",
  "termux",
  "anaconda",
  "conda-forge",
];

assertDeepEqual(
  REPOSITORY_SOURCES.map((source) => source.id),
  EXPECTED_IDS,
  "repository source ids",
);

const realFetch = globalThis.fetch;
const fetchCalls = [];

globalThis.fetch = async (input, init = {}) => {
  const request = input instanceof Request ? input : new Request(input, init);
  fetchCalls.push({
    cache: init.cache,
    ifNoneMatch: request.headers.get("if-none-match"),
    method: request.method,
    range: request.headers.get("range"),
    redirect: request.redirect,
    url: request.url,
  });

  return new Response("repository-payload", {
    headers: {
      Age: "300",
      "Cache-Control": "public, max-age=3600, immutable",
      "CDN-Cache-Control": "public, s-maxage=3600",
      "Accept-Ranges": "bytes",
      "Content-Range": "bytes 0-9/100",
      ETag: '"upstream-etag"',
      Expires: "Wed, 01 Jan 2031 00:00:00 GMT",
    },
  });
};

try {
  for (const source of REPOSITORY_SOURCES) {
    fetchCalls.length = 0;
    const response = await worker.fetch(new Request(`${BASE_URL}/repo/${source.id}/probe/file.bin?channel=stable`));
    const body = await response.text();
    const expectedTarget = `${source.upstream.replace(/\/$/, "")}/probe/file.bin?channel=stable`;

    assert(response.status === 200, `${source.id} should return 200`);
    assert(body === "repository-payload", `${source.id} should stream the upstream body`);
    assert(fetchCalls.length === 1, `${source.id} should issue one upstream request`);
    assert(fetchCalls[0].url === expectedTarget, `${source.id} target mismatch: ${fetchCalls[0].url}`);
    assert(fetchCalls[0].cache === "no-store", `${source.id} upstream fetch must bypass cache`);
    assert(fetchCalls[0].redirect === "follow", `${source.id} should follow trusted upstream redirects`);
    assert(fetchCalls[0].method === "GET", `${source.id} should preserve the request method`);
    assertNoStore(response, `${source.id} response`);
    assert(response.headers.get("etag") === '"upstream-etag"', `${source.id} should preserve ETag`);
    assert(response.headers.get("accept-ranges") === "bytes", `${source.id} should preserve Accept-Ranges`);
    assert(response.headers.get("content-range") === "bytes 0-9/100", `${source.id} should preserve Content-Range`);
    assert(response.headers.get("age") === null, `${source.id} should remove Age`);
    assert(response.headers.get("expires") === null, `${source.id} should remove Expires`);
    assert(response.headers.get("x-edgemirror-source") === source.id, `${source.id} source header mismatch`);
    assert(response.headers.get("x-edgemirror-adapter") === "static-tree", `${source.id} adapter header mismatch`);
  }
  console.log(`ok ${REPOSITORY_SOURCES.length} repository source mappings`);

  fetchCalls.length = 0;
  const rangeResponse = await worker.fetch(new Request(`${BASE_URL}/repo/debian/pool/example.deb`, {
    headers: {
      Range: "bytes=0-9",
      "If-None-Match": '"upstream-etag"',
    },
  }));
  await rangeResponse.arrayBuffer();
  assert(fetchCalls[0]?.range === "bytes=0-9", "repository route should forward Range");
  assert(fetchCalls[0]?.ifNoneMatch === '"upstream-etag"', "repository route should forward If-None-Match");
  assertNoStore(rangeResponse, "repository range response");
  console.log("ok repository range and conditional headers");

  fetchCalls.length = 0;
  const aliasResponse = await worker.fetch(new Request(`${BASE_URL}/repo/conda-defaults/main/noarch/repodata.json`));
  await aliasResponse.arrayBuffer();
  assert(
    fetchCalls[0]?.url === "https://repo.anaconda.com/pkgs/main/noarch/repodata.json",
    `repository alias target mismatch: ${fetchCalls[0]?.url}`,
  );
  assert(aliasResponse.headers.get("x-edgemirror-source") === "anaconda", "alias should expose canonical source id");
  console.log("ok repository aliases");

  fetchCalls.length = 0;
  const indexResponse = await worker.fetch(new Request(`${BASE_URL}/repo`));
  const index = await indexResponse.json();
  assert(indexResponse.status === 200, "repository index should return 200");
  assert(index.count === REPOSITORY_SOURCES.length, "repository index count mismatch");
  assert(index.sources.every((source) => source.route.startsWith(`${BASE_URL}/repo/`)), "repository index routes mismatch");
  assert(fetchCalls.length === 0, "repository index must not call an upstream");
  assertNoStore(indexResponse, "repository index");
  console.log("ok repository index");

  fetchCalls.length = 0;
  const methodResponse = await worker.fetch(new Request(`${BASE_URL}/repo/debian/dists/stable/InRelease`, { method: "POST" }));
  assert(methodResponse.status === 405, "repository write method should return 405");
  assert(methodResponse.headers.get("allow") === "GET, HEAD, OPTIONS", "repository Allow header mismatch");
  assert(fetchCalls.length === 0, "repository write method must not call an upstream");
  assertNoStore(methodResponse, "repository method rejection");
  console.log("ok repository read-only policy");

  const unknownResponse = await worker.fetch(new Request(`${BASE_URL}/repo/not-a-source/file`));
  assert(unknownResponse.status === 404, "unknown repository source should return 404");
  assertNoStore(unknownResponse, "unknown repository response");
  console.log("ok unknown repository handling");

  const optionsResponse = await worker.fetch(new Request(`${BASE_URL}/repo/debian/`, { method: "OPTIONS" }));
  assert(optionsResponse.status === 200, "repository OPTIONS should return 200");
  assert(optionsResponse.headers.get("access-control-allow-methods") === "GET,HEAD,OPTIONS", "repository CORS methods mismatch");
  assertNoStore(optionsResponse, "repository OPTIONS");
  console.log("ok repository CORS policy");

  fetchCalls.length = 0;
  const legacyResponse = await worker.fetch(new Request(`${BASE_URL}/downloads/node/v22.11.0/SHASUMS256.txt`));
  await legacyResponse.arrayBuffer();
  assert(
    fetchCalls[0]?.url === "https://nodejs.org/dist/v22.11.0/SHASUMS256.txt",
    `legacy downloads target mismatch: ${fetchCalls[0]?.url}`,
  );
  assert(fetchCalls[0]?.cache === "no-store", "legacy downloads upstream fetch must bypass cache");
  assertNoStore(legacyResponse, "legacy downloads response");
  console.log("ok legacy downloads route compatibility");

  const helpResponse = await worker.fetch(new Request(`${BASE_URL}/help`));
  assert(helpResponse.status === 200, "legacy help route should return 200");
  assertNoStore(helpResponse, "legacy help response");

  const adsResponse = await worker.fetch(new Request(`${BASE_URL}/ads.txt`));
  assert(adsResponse.status === 200, "legacy ads.txt route should return 200");
  assertNoStore(adsResponse, "legacy ads.txt response");
  console.log("ok legacy page no-store policy");
} finally {
  globalThis.fetch = realFetch;
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

function assertDeepEqual(actual, expected, name) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${name} mismatch`);
}
