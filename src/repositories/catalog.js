const sources = [
  {
    id: "debian",
    aliases: ["debian-archive"],
    title: "Debian Archive",
    family: "apt",
    upstream: "https://deb.debian.org/debian",
    description: "Debian package archive.",
  },
  {
    id: "debian-security",
    title: "Debian Security",
    family: "apt",
    upstream: "https://deb.debian.org/debian-security",
    description: "Debian security updates.",
  },
  {
    id: "debian-ports",
    title: "Debian Ports",
    family: "apt",
    upstream: "https://deb.debian.org/debian-ports",
    description: "Debian ports archive for secondary architectures.",
  },
  {
    id: "ubuntu",
    aliases: ["ubuntu-archive"],
    title: "Ubuntu Archive",
    family: "apt",
    upstream: "https://archive.ubuntu.com/ubuntu",
    description: "Ubuntu package archive for primary architectures.",
  },
  {
    id: "ubuntu-security",
    title: "Ubuntu Security",
    family: "apt",
    upstream: "https://security.ubuntu.com/ubuntu",
    description: "Ubuntu security updates.",
  },
  {
    id: "ubuntu-ports",
    title: "Ubuntu Ports",
    family: "apt",
    upstream: "https://ports.ubuntu.com/ubuntu-ports",
    description: "Ubuntu package archive for port architectures.",
  },
  {
    id: "ubuntu-releases",
    title: "Ubuntu Releases",
    family: "images",
    upstream: "https://releases.ubuntu.com",
    description: "Ubuntu release images and checksums.",
  },
  {
    id: "raspbian",
    title: "Raspbian Archive",
    family: "apt",
    upstream: "https://archive.raspbian.org/raspbian",
    description: "Raspbian packages used by 32-bit Raspberry Pi OS images.",
  },
  {
    id: "raspberrypi",
    aliases: ["raspberry-pi", "raspi"],
    title: "Raspberry Pi Archive",
    family: "apt",
    upstream: "https://archive.raspberrypi.com/debian",
    description: "Raspberry Pi maintained Debian packages and firmware.",
  },
  {
    id: "raspberrypi-images",
    aliases: ["raspberry-pi-images", "raspi-images"],
    title: "Raspberry Pi Images",
    family: "images",
    upstream: "https://downloads.raspberrypi.com",
    description: "Raspberry Pi OS images and related downloads.",
  },
  {
    id: "openwrt",
    title: "OpenWrt Downloads",
    family: "openwrt",
    upstream: "https://downloads.openwrt.org",
    description: "Complete OpenWrt download tree.",
  },
  {
    id: "openwrt-releases",
    title: "OpenWrt Releases",
    family: "openwrt",
    upstream: "https://downloads.openwrt.org/releases",
    description: "Stable OpenWrt releases, packages, firmware, SDKs, and ImageBuilders.",
  },
  {
    id: "openwrt-snapshots",
    title: "OpenWrt Snapshots",
    family: "openwrt",
    upstream: "https://downloads.openwrt.org/snapshots",
    description: "OpenWrt development snapshots.",
  },
  {
    id: "openwrt-packages",
    title: "OpenWrt Release Packages",
    family: "openwrt",
    upstream: "https://downloads.openwrt.org/releases",
    description: "OpenWrt APK and legacy OPKG release feeds, rooted at the releases tree.",
  },
  {
    id: "openwrt-firmware",
    title: "OpenWrt Firmware",
    family: "openwrt",
    upstream: "https://downloads.openwrt.org/releases",
    description: "OpenWrt release firmware targets, rooted at the releases tree.",
  },
  {
    id: "openwrt-sdk",
    title: "OpenWrt SDK",
    family: "openwrt",
    upstream: "https://downloads.openwrt.org/releases",
    description: "OpenWrt SDK, ImageBuilder, and toolchain files, rooted at the releases tree.",
  },
  {
    id: "immortalwrt",
    title: "ImmortalWrt Downloads",
    family: "openwrt",
    upstream: "https://downloads.immortalwrt.org",
    description: "Complete ImmortalWrt download tree.",
  },
  {
    id: "immortalwrt-releases",
    title: "ImmortalWrt Releases",
    family: "openwrt",
    upstream: "https://downloads.immortalwrt.org/releases",
    description: "Stable ImmortalWrt releases.",
  },
  {
    id: "immortalwrt-snapshots",
    title: "ImmortalWrt Snapshots",
    family: "openwrt",
    upstream: "https://downloads.immortalwrt.org/snapshots",
    description: "ImmortalWrt development snapshots.",
  },
  {
    id: "arch",
    aliases: ["archlinux"],
    title: "Arch Linux",
    family: "pacman",
    upstream: "https://geo.mirror.pkgbuild.com",
    description: "Arch Linux package repositories through the official geo mirror.",
  },
  {
    id: "archlinuxarm",
    aliases: ["arch-arm", "archlinux-arm"],
    title: "Arch Linux ARM",
    family: "pacman",
    upstream: "http://mirror.archlinuxarm.org",
    description: "Arch Linux ARM package repositories through the official geo redirector.",
  },
  {
    id: "alpine",
    title: "Alpine Linux",
    family: "apk",
    upstream: "https://dl-cdn.alpinelinux.org/alpine",
    description: "Alpine Linux package repositories.",
  },
  {
    id: "fedora",
    title: "Fedora Linux",
    family: "dnf",
    upstream: "https://dl.fedoraproject.org/pub/fedora/linux",
    description: "Direct Fedora release and update repository tree.",
  },
  {
    id: "epel",
    aliases: ["fedora-epel"],
    title: "Fedora EPEL",
    family: "dnf",
    upstream: "https://dl.fedoraproject.org/pub/epel",
    description: "Extra Packages for Enterprise Linux.",
  },
  {
    id: "centos-stream",
    aliases: ["centos"],
    title: "CentOS Stream",
    family: "dnf",
    upstream: "https://mirror.stream.centos.org",
    description: "Direct CentOS Stream repository tree.",
  },
  {
    id: "rocky",
    aliases: ["rockylinux"],
    title: "Rocky Linux",
    family: "dnf",
    upstream: "https://dl.rockylinux.org/pub/rocky",
    description: "Direct Rocky Linux repository tree.",
  },
  {
    id: "almalinux",
    aliases: ["alma"],
    title: "AlmaLinux",
    family: "dnf",
    upstream: "https://repo.almalinux.org/almalinux",
    description: "Direct AlmaLinux repository tree.",
  },
  {
    id: "opensuse",
    aliases: ["opensuse-download"],
    title: "openSUSE",
    family: "zypper",
    upstream: "https://download.opensuse.org",
    description: "openSUSE distribution, update, and Build Service repositories.",
  },
  {
    id: "void",
    aliases: ["void-glibc"],
    title: "Void Linux glibc",
    family: "xbps",
    upstream: "https://repo-default.voidlinux.org/current",
    description: "Void Linux glibc package repositories.",
  },
  {
    id: "void-musl",
    title: "Void Linux musl",
    family: "xbps",
    upstream: "https://repo-default.voidlinux.org/current/musl",
    description: "Void Linux musl package repositories.",
  },
  {
    id: "freebsd-pkg",
    aliases: ["freebsd"],
    title: "FreeBSD pkg",
    family: "pkg",
    upstream: "https://pkg.freebsd.org",
    description: "FreeBSD binary package repositories.",
  },
  {
    id: "msys2",
    title: "MSYS2",
    family: "pacman",
    upstream: "https://repo.msys2.org",
    description: "MSYS2 and MinGW package repositories.",
  },
  {
    id: "termux",
    title: "Termux",
    family: "apt",
    upstream: "https://packages.termux.dev/apt",
    description: "Termux main, root, and X11 APT repositories.",
  },
  {
    id: "anaconda",
    aliases: ["conda-defaults"],
    title: "Anaconda Defaults",
    family: "conda",
    upstream: "https://repo.anaconda.com/pkgs",
    description: "Anaconda default package channels.",
  },
  {
    id: "conda-forge",
    title: "conda-forge",
    family: "conda",
    upstream: "https://conda.anaconda.org/conda-forge",
    description: "conda-forge package channel.",
  },
];

export const REPOSITORY_SOURCES = Object.freeze(
  sources.map((source) => Object.freeze({
    ...source,
    aliases: Object.freeze([...(source.aliases ?? [])]),
  })),
);

const sourceByRoute = new Map();

for (const source of REPOSITORY_SOURCES) {
  registerRoute(source.id, source);
  for (const alias of source.aliases) {
    registerRoute(alias, source);
  }
}

export function getRepositorySource(routeId) {
  return sourceByRoute.get(String(routeId).toLowerCase());
}

function registerRoute(routeId, source) {
  const normalized = routeId.toLowerCase();
  if (sourceByRoute.has(normalized)) {
    throw new Error(`Duplicate repository route: ${routeId}`);
  }
  sourceByRoute.set(normalized, source);
}
