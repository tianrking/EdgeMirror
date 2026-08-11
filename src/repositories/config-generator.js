import { REPOSITORY_SOURCES, getRepositorySource } from "./catalog.js";

const REPOSITORY_UI = {
  debian: target("apt", "APT", "bookworm", "amd64", "main contrib non-free-firmware", ["version", "components"]),
  "debian-security": target("apt", "APT", "bookworm", "amd64", "main contrib non-free-firmware", ["version", "components"]),
  "debian-ports": target("apt", "APT", "sid", "riscv64", "main contrib non-free-firmware", ["version", "components"]),
  ubuntu: target("apt", "APT", "noble", "amd64", "main restricted universe multiverse", ["version", "components"]),
  "ubuntu-security": target("apt", "APT", "noble", "amd64", "main restricted universe multiverse", ["version", "components"]),
  "ubuntu-ports": target("apt", "APT", "noble", "arm64", "main restricted universe multiverse", ["version", "components"]),
  "ubuntu-releases": target("images", "Download", "24.04.3", "amd64", "", ["version"]),
  raspbian: target("apt", "APT", "bookworm", "armhf", "main contrib non-free rpi", ["version", "components"]),
  raspberrypi: target("apt", "APT", "bookworm", "arm64", "main", ["version", "components"]),
  "raspberrypi-images": target("images", "Download", "raspios_arm64", "arm64", "", ["version"]),
  openwrt: target("openwrt", "APK / OPKG", "25.12.0", "x86/64", "", ["version"]),
  "openwrt-releases": target("openwrt", "Download", "25.12.0", "x86/64", "", ["version"]),
  "openwrt-snapshots": target("openwrt", "Download", "snapshots", "x86/64", "", ["arch"]),
  "openwrt-packages": target("openwrt", "APK / OPKG", "25.12.0", "x86_64", "base", ["version", "arch", "components"]),
  "openwrt-firmware": target("openwrt", "Firmware", "25.12.0", "x86/64", "", ["version", "arch"]),
  "openwrt-sdk": target("openwrt", "SDK", "25.12.0", "x86/64", "", ["version", "arch"]),
  immortalwrt: target("openwrt", "OPKG / Download", "24.10.4", "x86/64", "", ["version"]),
  "immortalwrt-releases": target("openwrt", "Download", "24.10.4", "x86/64", "", ["version"]),
  "immortalwrt-snapshots": target("openwrt", "Download", "snapshots", "x86/64", "", ["arch"]),
  arch: target("pacman", "Pacman", "rolling", "$arch", "$repo", ["arch", "components"]),
  archlinuxarm: target("pacman", "Pacman", "rolling", "$arch", "$repo", ["arch", "components"]),
  alpine: target("apk", "APK", "v3.22", "x86_64", "main community", ["version", "components"]),
  fedora: target("dnf", "DNF", "$releasever", "$basearch", "Everything", ["version", "arch"]),
  epel: target("dnf", "DNF", "$releasever", "$basearch", "Everything", ["version", "arch"]),
  "centos-stream": target("dnf", "DNF", "10-stream", "$basearch", "BaseOS AppStream", ["version", "arch", "components"]),
  rocky: target("dnf", "DNF", "9", "$basearch", "BaseOS AppStream", ["version", "arch", "components"]),
  almalinux: target("dnf", "DNF", "9", "$basearch", "BaseOS AppStream", ["version", "arch", "components"]),
  opensuse: target("zypper", "Zypper", "15.6", "$basearch", "oss", ["version", "components"]),
  void: target("xbps", "XBPS", "current", "x86_64", "", []),
  "void-musl": target("xbps", "XBPS", "current", "x86_64-musl", "", []),
  "freebsd-pkg": target("pkg", "FreeBSD pkg", "quarterly", "${ABI}", "", ["version", "arch"]),
  msys2: target("pacman", "Pacman", "rolling", "x86_64", "mingw msys", ["arch", "components"]),
  termux: target("apt", "APT", "stable", "aarch64", "main", ["version", "components"]),
  anaconda: target("conda", "Conda", "defaults", "noarch", "main r msys2", []),
  "conda-forge": target("conda", "Conda", "conda-forge", "noarch", "", []),
};

export const ADAPTER_TARGETS = Object.freeze([
  adapter("pypi", "PyPI / PyTorch", "developer", "pip", ["components"], "numpy"),
  adapter("hf", "Hugging Face", "developer", "huggingface-cli", ["components"], "sentence-transformers/all-MiniLM-L6-v2"),
  adapter("npm", "npm Registry", "developer", "npm / pnpm / yarn", ["components"], "lodash"),
  adapter("nuget", "NuGet v3", "developer", "dotnet / NuGet", [], ""),
  adapter("go", "Go Modules", "developer", "Go", [], ""),
  adapter("maven", "Maven Central", "developer", "Maven / Gradle", [], ""),
  adapter("crates", "crates.io Sparse", "developer", "Cargo", [], ""),
  adapter("node", "Node.js SDK", "sdk", "Download", ["version", "arch"], "", "v24.0.0", "win-x64"),
  adapter("flutter", "Flutter SDK", "sdk", "Flutter", [], ""),
  adapter("docker", "Docker Registry", "oci", "Docker / OCI", ["components"], "library/nginx:latest"),
  adapter("github", "GitHub", "git", "Git", ["components"], "owner/repository.git"),
  adapter("downloads", "Runtime Downloads", "sdk", "Download", ["version", "arch"], "", "v24.0.0", "win-x64"),
  adapter("proxy", "Universal File Proxy", "developer", "curl / wget", ["components"], "https://example.com/file.zip"),
]);

export const REPOSITORY_UI_TARGETS = Object.freeze(REPOSITORY_SOURCES.map((source) => {
  const ui = REPOSITORY_UI[source.id];
  if (!ui) {
    throw new Error(`Missing repository UI definition: ${source.id}`);
  }
  return Object.freeze({ ...source, ...ui, kind: "repository" });
}));

export const CONFIG_TARGETS = Object.freeze([...REPOSITORY_UI_TARGETS, ...ADAPTER_TARGETS]);

export function generateConfiguration(input = {}) {
  const id = String(input.id ?? "debian").trim().toLowerCase();
  const origin = normalizePublicOrigin(input.origin ?? "https://edgemirror.example.com");
  const targetDefinition = CONFIG_TARGETS.find((item) => item.id === id);
  if (!targetDefinition) {
    throw new ConfigurationInputError(`Unknown configuration target: ${id}`);
  }

  const version = cleanToken(input.version, targetDefinition.defaults.version, "version");
  const arch = cleanPathToken(input.arch, targetDefinition.defaults.arch, "architecture");
  const components = cleanList(input.components, targetDefinition.defaults.components, "components");

  if (targetDefinition.kind === "adapter") {
    return generateAdapterConfiguration({ id, origin, version, arch, components, targetDefinition });
  }

  const source = getRepositorySource(id);
  const route = `${origin}/repo/${source.id}`;
  const common = {
    id: source.id,
    title: source.title,
    family: source.family,
    manager: targetDefinition.manager,
    route: `${route}/`,
    upstream: source.upstream,
    version,
    arch,
    components,
  };

  return { ...common, ...repositoryRecipe(source.id, route, version, arch, components) };
}

export function normalizePublicOrigin(value) {
  let candidate = String(value ?? "").trim();
  if (!candidate) {
    throw new ConfigurationInputError("Domain is required.");
  }
  if (!candidate.includes("://")) {
    candidate = `https://${candidate}`;
  }

  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new ConfigurationInputError("Domain must be a valid HTTP or HTTPS URL.");
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new ConfigurationInputError("Domain must use HTTP or HTTPS and cannot contain credentials.");
  }
  return url.origin;
}

export class ConfigurationInputError extends Error {}

function repositoryRecipe(id, route, version, arch, components) {
  const componentList = components || "main";
  switch (id) {
    case "debian":
    case "debian-ports":
    case "ubuntu":
    case "ubuntu-ports":
    case "raspbian":
    case "raspberrypi":
      return recipe(
        `deb ${route} ${version} ${componentList}`,
        `Add this line to a dedicated APT source file, then run apt update.`,
        "source-list",
      );
    case "debian-security":
    case "ubuntu-security": {
      const suite = version.endsWith("-security") ? version : `${version}-security`;
      return recipe(`deb ${route} ${suite} ${componentList}`, "Use the distribution's existing official signing keys.", "source-list");
    }
    case "termux":
      return recipe(`deb ${route}/termux-main ${version} ${componentList}`, "Use with Termux's existing repository signing key.", "source-list");
    case "ubuntu-releases":
    case "raspberrypi-images":
      return recipe(`${route}/${version}/`, "Open the generated directory and choose the image plus its checksum/signature file.", "download-url");
    case "openwrt":
      return openWrtRecipe(route, version);
    case "openwrt-releases":
      return recipe(`${route}/${version}/`, "Stable release tree containing targets, packages, firmware, SDKs, and ImageBuilders.", "download-url");
    case "openwrt-snapshots":
      return recipe(`${route}/targets/${arch}/`, "Snapshot paths move continuously; verify target and package compatibility before upgrading.", "download-url");
    case "openwrt-packages":
      return recipe(`${route}/${version}/packages/${arch}/${componentList}/`, "Select the feed and architecture that exactly match the running firmware.", "download-url");
    case "openwrt-firmware":
    case "openwrt-sdk":
      return recipe(`${route}/${version}/targets/${arch}/`, "Use the same version and target pair as the device firmware.", "download-url");
    case "immortalwrt":
      return recipe(
        `sed -i 's#https://downloads.immortalwrt.org/#${route}/#g' /etc/opkg/distfeeds.conf\nopkg update`,
        "Review the active feed file first and keep version/architecture aligned with the installed firmware.",
        "shell",
      );
    case "immortalwrt-releases":
      return recipe(`${route}/${version}/`, "Stable ImmortalWrt release tree.", "download-url");
    case "immortalwrt-snapshots":
      return recipe(`${route}/targets/${arch}/`, "Rolling snapshot tree; package ABI may change without notice.", "download-url");
    case "arch":
      return recipe(`Server = ${route}/${components || "$repo"}/os/${arch || "$arch"}`, "Add to /etc/pacman.d/mirrorlist before a full database refresh.", "mirror-list");
    case "archlinuxarm":
      return recipe(`Server = ${route}/${arch || "$arch"}/${components || "$repo"}`, "Keep Arch Linux ARM package signing enabled.", "mirror-list");
    case "alpine":
      return recipe(
        componentList.split(" ").map((component) => `${route}/${version}/${component}`).join("\n"),
        "Write the lines to /etc/apk/repositories, then run apk update.",
        "source-list",
      );
    case "fedora":
      return recipe(
        dnfBlocks([
          ["edgemirror-fedora", `${route}/releases/${version}/Everything/${arch}/os/`],
          ["edgemirror-fedora-updates", `${route}/updates/${version}/Everything/${arch}/`],
        ]),
        "Retain Fedora's official GPG keys and enable gpgcheck.",
        "repo-file",
      );
    case "epel":
      return recipe(dnfBlocks([["edgemirror-epel", `${route}/${version}/Everything/${arch}/`]]), "Retain EPEL's official GPG keys.", "repo-file");
    case "centos-stream":
    case "rocky":
    case "almalinux":
      return recipe(
        dnfBlocks(componentList.split(" ").map((component) => [`edgemirror-${id}-${component.toLowerCase()}`, `${route}/${version}/${component}/${arch}/os/`])),
        "Retain the distribution's official GPG keys and disable mirrorlist only for the matching repository entries.",
        "repo-file",
      );
    case "opensuse":
      return recipe(
        `sudo zypper ar -f ${route}/distribution/leap/${version}/repo/${componentList}/ edgemirror-${componentList}`,
        "For Tumbleweed, replace the generated Leap path with the corresponding tumbleweed/repo path.",
        "shell",
      );
    case "void":
    case "void-musl":
      return recipe(`repository=${route}`, "Add to an XBPS repository configuration file, then run xbps-install -S.", "source-list");
    case "freebsd-pkg":
      return recipe(
        `EdgeMirror: {\n  url: \"pkg+${route}/${arch}/${version}\",\n  enabled: yes\n}`,
        "Save as /usr/local/etc/pkg/repos/EdgeMirror.conf and retain signature_type from your trusted policy.",
        "repo-file",
      );
    case "msys2":
      return recipe(
        componentList.split(" ").map((repoName) => `Server = ${route}/${repoName}/${arch}`).join("\n"),
        "Place each Server line in the matching MSYS2 mirror list.",
        "mirror-list",
      );
    case "anaconda":
      return recipe(
        `default_channels:\n  - ${route}/main\n  - ${route}/r\n  - ${route}/msys2`,
        "Merge into .condarc. Package signatures and channel policy remain controlled by Conda.",
        "yaml",
      );
    case "conda-forge":
      return recipe(`conda config --add channels ${route}\nconda config --set channel_priority strict`, "The route is a complete conda-forge channel root.", "shell");
    default:
      return recipe(`${route}/`, "Open the source root and retain upstream path structure.", "download-url");
  }
}

function generateAdapterConfiguration({ id, origin, version, arch, components, targetDefinition }) {
  const base = adapterBaseUrl(id, origin);
  const common = {
    id,
    title: targetDefinition.title,
    family: targetDefinition.family,
    manager: targetDefinition.manager,
    route: base,
    upstream: "",
    version,
    arch,
    components,
  };

  switch (id) {
    case "pypi":
      return { ...common, ...recipe(`pip install ${components || "numpy"} -i ${origin}/pypi/simple/`, "PyTorch wheels remain available under /pypi/pytorch/{channel}.", "shell") };
    case "hf":
      return { ...common, ...recipe(`HF_ENDPOINT=${origin}/hf huggingface-cli download ${components}`, "Use the same endpoint for model, dataset, API, and LFS requests.", "shell") };
    case "npm":
      return { ...common, ...recipe(`npm install ${components || "lodash"} --registry=${origin}/pkg/npm/`, "The legacy /npm/ registry entry remains compatible.", "shell") };
    case "nuget":
      return { ...common, ...recipe(`dotnet nuget add source ${origin}/pkg/nuget/v3/index.json --name EdgeMirror`, "The source is read-only; publish capabilities are intentionally removed.", "shell") };
    case "go":
      return { ...common, ...recipe(`go env -w GOPROXY=${origin}/go,direct`, "Keep the default sumdb or another trusted checksum database.", "shell") };
    case "maven":
      return { ...common, ...recipe(`maven { url = uri(\"${origin}/maven/maven-central\") }`, "Google Maven, Gradle Plugin Portal, and JitPack use sibling paths.", "gradle") };
    case "crates":
      return { ...common, ...recipe(`[source.crates-io]\nreplace-with = \"edgemirror\"\n\n[source.edgemirror]\nregistry = \"sparse+${origin}/crates/\"`, "Publish, yank, and token APIs remain outside the read path.", "toml") };
    case "node":
      return { ...common, ...recipe(`${origin}/sdk/node/${version}/node-${version}-${arch}.zip`, "Use /sdk/node/index.json to discover current release filenames.", "download-url") };
    case "flutter":
      return { ...common, ...recipe(`# PowerShell\n$env:FLUTTER_STORAGE_BASE_URL=\"${origin}/sdk/flutter\"\n\n# bash / zsh\nexport FLUTTER_STORAGE_BASE_URL=${origin}/sdk/flutter`, "Flutter appends flutter_infra_release/... to this storage root.", "shell") };
    case "docker":
      return { ...common, ...recipe(`docker pull ${new URL(origin).host}/${components || "library/nginx:latest"}`, `The canonical raw API is ${origin}/oci/docker/v2/; Docker clients continue to use the registry host root.`, "shell") };
    case "github":
      return { ...common, ...recipe(`git clone ${origin}/git/github/${components || "owner/repository.git"}`, "The legacy /github path remains compatible for existing commands.", "shell") };
    case "downloads":
      return { ...common, ...recipe(`${origin}/downloads/node/${version}/node-${version}-${arch}.zip`, "The canonical Node tree is also available at /sdk/node/.", "download-url") };
    case "proxy":
      return { ...common, ...recipe(`curl -L -O \"${origin}/proxy/${components}\"`, "Only use public HTTP/HTTPS targets you are authorized to fetch.", "shell") };
    default:
      throw new ConfigurationInputError(`Unsupported adapter target: ${id}`);
  }
}

function adapterBaseUrl(id, origin) {
  const paths = {
    pypi: "/pypi/",
    hf: "/hf/",
    npm: "/pkg/npm/",
    nuget: "/pkg/nuget/v3/index.json",
    go: "/go/",
    maven: "/maven/",
    crates: "/crates/",
    node: "/sdk/node/",
    flutter: "/sdk/flutter/",
    docker: "/oci/docker/v2/",
    github: "/git/github/",
    downloads: "/downloads/",
    proxy: "/proxy/",
  };
  return `${origin}${paths[id]}`;
}

function openWrtRecipe(route, version) {
  const useApk = compareOpenWrtVersion(version, "25.12") >= 0;
  if (useApk) {
    return recipe(
      `sed -i 's#https://downloads.openwrt.org/#${route}/#g' /etc/apk/repositories.d/distfeeds.list\napk update`,
      `OpenWrt ${version} uses APK. Review the feed file before replacement and keep the complete upstream path.`,
      "shell",
      "apk",
    );
  }
  return recipe(
    `sed -i 's#https://downloads.openwrt.org/#${route}/#g' /etc/opkg/distfeeds.conf\nopkg update`,
    `OpenWrt ${version} uses OPKG. Review the feed file before replacement and keep the complete upstream path.`,
    "shell",
    "opkg",
  );
}

function compareOpenWrtVersion(left, right) {
  const parse = (value) => String(value).split(/[.-]/).slice(0, 2).map((part) => Number.parseInt(part, 10) || 0);
  const [leftMajor, leftMinor] = parse(left);
  const [rightMajor, rightMinor] = parse(right);
  return leftMajor === rightMajor ? leftMinor - rightMinor : leftMajor - rightMajor;
}

function dnfBlocks(entries) {
  return entries.map(([name, baseurl]) => `[${name}]\nname=${name}\nbaseurl=${baseurl}\nenabled=1\ngpgcheck=1`).join("\n\n");
}

function recipe(command, note, format, mode = "") {
  return { command, note, format, mode };
}

function target(family, manager, version, arch, components, fields) {
  return Object.freeze({
    family,
    manager,
    fields: Object.freeze([...fields]),
    defaults: Object.freeze({ version, arch, components }),
  });
}

function adapter(id, title, family, manager, fields, components, version = "", arch = "") {
  return Object.freeze({
    id,
    title,
    family,
    manager,
    fields: Object.freeze([...fields]),
    defaults: Object.freeze({ version, arch, components }),
    aliases: Object.freeze([]),
    description: `${title} canonical configuration.`,
    upstream: "",
    kind: "adapter",
  });
}

function cleanToken(value, fallback, label) {
  const result = String(value ?? fallback ?? "").trim() || String(fallback ?? "");
  if (result && !/^[A-Za-z0-9._${}-]+$/.test(result)) {
    throw new ConfigurationInputError(`Invalid ${label}.`);
  }
  return result;
}

function cleanPathToken(value, fallback, label) {
  const result = String(value ?? fallback ?? "").trim() || String(fallback ?? "");
  if (result && !/^[A-Za-z0-9._${}/-]+$/.test(result)) {
    throw new ConfigurationInputError(`Invalid ${label}.`);
  }
  return result;
}

function cleanList(value, fallback, label) {
  const result = String(value ?? fallback ?? "").trim() || String(fallback ?? "");
  const parts = result ? result.split(/\s+/) : [];
  if (parts.some((part) => !/^[A-Za-z0-9._${}:+/-]+$/.test(part))) {
    throw new ConfigurationInputError(`Invalid ${label}.`);
  }
  return parts.join(" ");
}
