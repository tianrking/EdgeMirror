import worker from "../src/index.js";

const BASE_URL = "https://edgemirror.vercel.app";
const CHECKS = [
  ["Debian APT", "/repo/debian/dists/stable/InRelease"],
  ["Ubuntu APT", "/repo/ubuntu/dists/noble/InRelease"],
  ["Raspberry Pi APT", "/repo/raspberrypi/dists/bookworm/InRelease"],
  ["OpenWrt", "/repo/openwrt/releases/25.12.0/targets/x86/64/"],
  ["Arch Pacman", "/repo/arch/core/os/x86_64/core.db"],
  ["Fedora DNF", "/repo/fedora/releases/"],
  ["Void XBPS", "/repo/void/x86_64-repodata"],
  ["conda-forge", "/repo/conda-forge/noarch/repodata.json"],
];

await Promise.all(CHECKS.map(async ([name, path]) => {
  const response = await worker.fetch(new Request(`${BASE_URL}${path}`, {
    method: "HEAD",
    signal: AbortSignal.timeout(30_000),
  }));

  if (response.status !== 200) {
    throw new Error(`${name} live check failed with status ${response.status}`);
  }
  if (response.headers.get("cache-control") !== "no-store") {
    throw new Error(`${name} live check did not return Cache-Control: no-store`);
  }
  if (!response.headers.get("x-edgemirror-source")) {
    throw new Error(`${name} live check is missing X-EdgeMirror-Source`);
  }

  console.log(`ok ${name} live HEAD`);
}));
