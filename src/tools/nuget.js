import { joinUrlPath, parseTargetUrlFromPath, proxyRequest, textResponse } from "../proxy-utils.js";

const SERVICE_INDEX = "https://api.nuget.org/v3/index.json";
const API_ROOT = "https://api.nuget.org";
const ALLOWED_METHODS = new Set(["GET", "HEAD"]);
const UNSAFE_RESOURCE_TYPES = ["PackagePublish", "SymbolPackagePublish"];

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
      return textResponse("NuGet routes are read-only.", {
        status: 405,
        headers: { Allow: "GET, HEAD, OPTIONS" },
      });
    }

    const url = new URL(request.url);
    const baseUrl = getNugetBaseUrl(request);
    const target = resolveTarget(url);

    if (!target) {
      return textResponse("Invalid or unsupported NuGet upstream URL.", { status: 400 });
    }
    if (!isAllowedNugetHost(target.hostname)) {
      return textResponse(`NuGet upstream host is not allowed: ${target.hostname}`, { status: 403 });
    }

    const shouldTransform = request.method.toUpperCase() === "GET";
    return proxyRequest(request, target, {
      redirectBaseUrl: `${baseUrl}/upstream`,
      responseHeaders: {
        "X-EdgeMirror-Adapter": "nuget-v3",
        "X-EdgeMirror-Source": "nuget",
        "X-EdgeMirror-Upstream-Host": target.host,
      },
      ...(shouldTransform
        ? { transformText: (body) => rewriteNugetJson(body, baseUrl) }
        : {}),
    });
  },
};

function resolveTarget(url) {
  if (url.pathname === "/" || url.pathname === "/index.json" || url.pathname === "/v3/index.json") {
    return new URL(SERVICE_INDEX);
  }

  const upstreamPrefix = "/upstream/";
  if (url.pathname.startsWith(upstreamPrefix)) {
    const rawTarget = url.pathname.slice(upstreamPrefix.length) + url.search;
    return parseTargetUrlFromPath(rawTarget);
  }

  return joinUrlPath(API_ROOT, url.pathname, url.search);
}

function getNugetBaseUrl(request) {
  const url = new URL(request.url);
  const basePath = request.headers.get("X-EdgeMirror-Base-Path") || "/pkg/nuget";
  return `${url.origin}${basePath}`;
}

function rewriteNugetJson(body, baseUrl) {
  try {
    const payload = JSON.parse(body);

    if (Array.isArray(payload?.resources)) {
      payload.resources = payload.resources.filter((resource) => {
        const type = String(resource?.["@type"] ?? "");
        return !UNSAFE_RESOURCE_TYPES.some((unsafeType) => type.startsWith(unsafeType));
      });
    }

    return `${JSON.stringify(rewriteNugetValue(payload, baseUrl), null, 2)}\n`;
  } catch {
    return body;
  }
}

function rewriteNugetValue(value, baseUrl) {
  if (typeof value === "string") {
    if (!value.startsWith("https://") && !value.startsWith("http://")) {
      return value;
    }

    try {
      const target = new URL(value);
      return isAllowedNugetHost(target.hostname)
        ? `${baseUrl}/upstream/${value}`
        : value;
    } catch {
      return value;
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => rewriteNugetValue(item, baseUrl));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewriteNugetValue(item, baseUrl)]),
    );
  }

  return value;
}

function isAllowedNugetHost(hostname) {
  const normalized = hostname.toLowerCase();
  return normalized === "nuget.org" || normalized.endsWith(".nuget.org");
}
