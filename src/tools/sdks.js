import { joinUrlPath, proxyRequest, textResponse } from "../proxy-utils.js";

const SDK_SOURCES = Object.freeze([
  Object.freeze({
    id: "node",
    title: "Node.js",
    upstream: "https://nodejs.org/dist",
    description: "Node.js release binaries, checksums, headers, and release indexes.",
  }),
  Object.freeze({
    id: "flutter",
    title: "Flutter",
    upstream: "https://storage.googleapis.com/flutter_infra_release",
    description: "Flutter SDK archives and Flutter tool artifacts.",
  }),
]);

const SOURCE_BY_ID = new Map(SDK_SOURCES.map((source) => [source.id, source]));
const ALLOWED_METHODS = new Set(["GET", "HEAD"]);

export default {
  async fetch(request) {
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

    if (!ALLOWED_METHODS.has(request.method.toUpperCase())) {
      return textResponse("SDK routes are read-only.", {
        status: 405,
        headers: { Allow: "GET, HEAD, OPTIONS" },
      });
    }

    const url = new URL(request.url);
    const [encodedSourceId] = url.pathname.split("/").filter(Boolean);

    if (!encodedSourceId) {
      return sdkIndexResponse(request);
    }

    let sourceId;
    try {
      sourceId = decodeURIComponent(encodedSourceId).toLowerCase();
    } catch {
      return textResponse("Invalid SDK source id.", { status: 400 });
    }

    const source = SOURCE_BY_ID.get(sourceId);
    if (!source) {
      return textResponse(`Unknown SDK source: ${sourceId}`, { status: 404 });
    }

    const sourcePrefix = `/${encodedSourceId}`;
    let sourcePath = url.pathname.slice(sourcePrefix.length) || "/";
    if (source.id === "flutter") {
      sourcePath = stripFlutterBucketPrefix(sourcePath);
    }

    const target = joinUrlPath(source.upstream, sourcePath, url.search);
    const sourceBaseUrl = getSourceBaseUrl(request, source.id);
    const shouldRewriteFlutterJson = source.id === "flutter" && request.method.toUpperCase() === "GET";

    return proxyRequest(request, target, {
      redirect: "follow",
      responseHeaders: {
        "X-EdgeMirror-Adapter": "sdk-static-tree",
        "X-EdgeMirror-Source": source.id,
        "X-EdgeMirror-Upstream-Host": new URL(source.upstream).host,
      },
      ...(shouldRewriteFlutterJson
        ? { transformText: (body) => rewriteFlutterMetadata(body, sourceBaseUrl) }
        : {}),
    });
  },
};

function sdkIndexResponse(request) {
  const url = new URL(request.url);
  const basePath = request.headers.get("X-EdgeMirror-Base-Path") || "/sdk";
  const baseUrl = `${url.origin}${basePath}`;
  const body = {
    service: "EdgeMirror SDK gateway",
    cache: "disabled",
    route: `${baseUrl}/{source}/{upstream-path}`,
    count: SDK_SOURCES.length,
    sources: SDK_SOURCES.map(({ id, title, upstream, description }) => ({
      id,
      title,
      route: `${baseUrl}/${id}/`,
      upstream,
      description,
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function getSourceBaseUrl(request, sourceId) {
  const url = new URL(request.url);
  const basePath = request.headers.get("X-EdgeMirror-Base-Path") || "/sdk";
  return `${url.origin}${basePath}/${sourceId}`;
}

function stripFlutterBucketPrefix(pathname) {
  const bucketPrefix = "/flutter_infra_release";
  if (pathname === bucketPrefix) {
    return "/";
  }
  if (pathname.startsWith(`${bucketPrefix}/`)) {
    return pathname.slice(bucketPrefix.length);
  }
  return pathname;
}

function rewriteFlutterMetadata(body, sourceBaseUrl) {
  try {
    const metadata = JSON.parse(body);
    if (
      metadata
      && typeof metadata === "object"
      && typeof metadata.base_url === "string"
      && metadata.base_url.startsWith("https://storage.googleapis.com/flutter_infra_release")
    ) {
      metadata.base_url = `${sourceBaseUrl}/releases`;
    }
    return `${JSON.stringify(metadata, null, 2)}\n`;
  } catch {
    return body;
  }
}
