import { REPOSITORY_SOURCES, getRepositorySource } from "../repositories/catalog.js";
import { joinUrlPath, proxyRequest, textResponse } from "../proxy-utils.js";

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
      return textResponse("Repository routes are read-only.", {
        status: 405,
        headers: { Allow: "GET, HEAD, OPTIONS" },
      });
    }

    const url = new URL(request.url);
    const [encodedSourceId] = url.pathname.split("/").filter(Boolean);

    if (!encodedSourceId) {
      return repositoryIndexResponse(request);
    }

    let routeId;
    try {
      routeId = decodeURIComponent(encodedSourceId).toLowerCase();
    } catch {
      return textResponse("Invalid repository source id.", { status: 400 });
    }

    const source = getRepositorySource(routeId);
    if (!source) {
      return textResponse(`Unknown repository source: ${routeId}`, { status: 404 });
    }

    const sourcePrefix = `/${encodedSourceId}`;
    const sourcePath = url.pathname.slice(sourcePrefix.length) || "/";
    const target = joinUrlPath(source.upstream, sourcePath, url.search);

    return proxyRequest(request, target, {
      redirect: "follow",
      responseHeaders: {
        "X-EdgeMirror-Adapter": "static-tree",
        "X-EdgeMirror-Source": source.id,
        "X-EdgeMirror-Upstream-Host": new URL(source.upstream).host,
      },
    });
  },
};

function repositoryIndexResponse(request) {
  const url = new URL(request.url);
  const basePath = request.headers.get("X-EdgeMirror-Base-Path") || "/repo";
  const baseUrl = `${url.origin}${basePath}`;
  const body = {
    service: "EdgeMirror repository gateway",
    cache: "disabled",
    route: `${baseUrl}/{source}/{upstream-path}`,
    count: REPOSITORY_SOURCES.length,
    sources: REPOSITORY_SOURCES.map(({ id, aliases, title, family, upstream, description }) => ({
      id,
      aliases,
      title,
      family,
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
