import { getLanguage } from "../i18n.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { corsPreflightResponse, htmlResponse, joinUrlPath, proxyRequest, textResponse } from "../proxy-utils.js";
import { renderAcceleratorPage } from "../tool-page.js";

const REPOSITORIES = {
  "maven-central": "https://repo1.maven.org/maven2",
  google: "https://dl.google.com/dl/android/maven2",
  "gradle-plugin": "https://plugins.gradle.org/m2",
  jitpack: "https://jitpack.io",
};

const COPY = {
  en: {
    lead: "Unified path proxy for Maven Central, Google Maven, Gradle Plugin Portal, and JitPack.",
    mapping: "Example mapping",
    note: "Status: Test. Downloads and metadata proxying are available; validate Gradle plugin markers and private repository auth per project.",
  },
  es: {
    lead: "Proxy unificado para Maven Central, Google Maven, Gradle Plugin Portal y JitPack.",
    mapping: "Ejemplo de mapeo",
    note: "Estado: Test. Descargas y metadata estan disponibles; valida plugin markers y repos privados por proyecto.",
  },
  zh: {
    lead: "为 Maven Central、Google Maven、Gradle Plugin Portal 和 JitPack 提供统一路径代理。",
    mapping: "映射示例",
    note: "状态：Test。下载和 metadata 代理已可用；Gradle plugin marker 与私有仓库认证建议先做项目级验证。",
  },
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseUrl = getToolBaseUrl(request, "maven");

    if (request.method === "OPTIONS") {
      return corsPreflightResponse();
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return htmlResponse(renderPage(request, baseUrl));
    }

    const [, repositoryKey, ...rest] = url.pathname.split("/");
    const upstream = REPOSITORIES[repositoryKey];
    if (!upstream) {
      return textResponse(`Unknown Maven repository: ${repositoryKey || "(empty)"}`, { status: 404 });
    }

    const target = joinUrlPath(upstream, `/${rest.join("/")}`, url.search);
    return proxyRequest(request, target, {
      redirectBaseUrl: `${baseUrl}/${repositoryKey}`,
      cacheControl: "public, max-age=300",
    });
  },
};

function renderPage(request, baseUrl) {
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const nav = renderToolNav(request, "maven");

  return renderAcceleratorPage({
    accent: "#d58b9a",
    accentStrong: "#b76f80",
    cards: [
      {
        title: "Gradle Kotlin DSL",
        command: `repositories {\n    maven { url = uri("${baseUrl}/maven-central") }\n    maven { url = uri("${baseUrl}/google") }\n    maven { url = uri("${baseUrl}/gradle-plugin") }\n}`,
      },
      {
        title: "Gradle Groovy DSL",
        command: `repositories {\n    maven { url "${baseUrl}/maven-central" }\n    maven { url "${baseUrl}/google" }\n    maven { url "${baseUrl}/gradle-plugin" }\n}`,
      },
      { title: "Maven Central path", command: `${baseUrl}/maven-central/com/google/guava/guava/maven-metadata.xml` },
      {
        title: copy.mapping,
        command: `Original:\nhttps://repo1.maven.org/maven2/com/google/guava/guava/maven-metadata.xml\n\nAccelerated:\n${baseUrl}/maven-central/com/google/guava/guava/maven-metadata.xml`,
      },
    ],
    copy,
    lang,
    nav,
    note: copy.note,
    pageTitle: "Maven Proxy | EdgeMirror",
    primaryCommand: {
      title: "Maven Central",
      command: `${baseUrl}/maven-central/com/google/guava/guava/maven-metadata.xml`,
    },
    status: "test",
    title: "Maven / Gradle Proxy",
  });
}
