# Repository Gateway / 固定系统源网关

EdgeMirror 2.0.0 exposes 35 fixed system sources and 13 developer adapters, for 48 configuration targets in total. The repository gateway is a read-only, no-cache route family. The `/catalog` web UI provides search, configuration generation, copy actions, and route probes without changing the machine API.

EdgeMirror 2.0.0 共提供 35 个固定系统源和 13 个开发者适配入口，总计 48 个配置目标。固定系统源网关是只读、严格无缓存的路由族。`/catalog` 网页提供搜索、配置生成、复制和路由检查；机器接口保持不变：

```text
https://YOUR_DOMAIN/repo/{source}/{upstream-path}
```

访问 `https://YOUR_DOMAIN/repo` 可以获取当前部署的机器可读来源目录、别名、上游和完整入口。

## 规范入口与旧入口

这次同时加入新的规范命名空间；旧路径继续保留，不需要迁移现有配置：

| 规范入口 | 作用 | 兼容入口 |
| --- | --- | --- |
| `/repo/{source}/...` | 固定系统仓库 | 新入口 |
| `/pkg/npm/...` | npm registry | `/npm/...` |
| `/pkg/nuget/v3/index.json` | 只读 NuGet v3 source | 新入口 |
| `/sdk/node/...` | Node.js release tree | `/downloads/node/...` |
| `/sdk/flutter/...` | Flutter SDK 与工具产物 | 新入口 |
| `/oci/docker/v2/...` | Docker Registry v2 API | `/v2/...`、`/docker/...` |
| `/git/github/...` | GitHub 文件与 release | `/github/...` |

`/pkg`、`/sdk` 和 `/repo` 都会返回机器可读目录；`/catalog` 是完整可视化配置中心，已经加入共享导航。

常用配置：

```sh
npm config set registry https://YOUR_DOMAIN/pkg/npm/
dotnet nuget add source https://YOUR_DOMAIN/pkg/nuget/v3/index.json --name EdgeMirror
```

Node.js release 文件可以将 `https://nodejs.org/dist/` 替换为 `https://YOUR_DOMAIN/sdk/node/`。

Flutter SDK 归档：

```text
https://YOUR_DOMAIN/sdk/flutter/releases/releases_windows.json
https://YOUR_DOMAIN/sdk/flutter/releases/releases_macos.json
https://YOUR_DOMAIN/sdk/flutter/releases/releases_linux.json
```

Flutter 工具的存储根可以这样配置；该入口兼容工具自动拼接的 `flutter_infra_release/...` 路径：

```sh
export FLUTTER_STORAGE_BASE_URL=https://YOUR_DOMAIN/sdk/flutter
```

Windows PowerShell：

```powershell
$env:FLUTTER_STORAGE_BASE_URL="https://YOUR_DOMAIN/sdk/flutter"
```

NuGet 的 service index 及其后续 JSON 资源地址都会回写到 `/pkg/nuget/upstream/...`；发布相关 capability 会被移除，避免把个人部署变成开放写入代理。

## 已上线来源

| 生态 | Source IDs |
| --- | --- |
| Debian / Ubuntu APT | `debian`, `debian-security`, `debian-ports`, `ubuntu`, `ubuntu-security`, `ubuntu-ports`, `ubuntu-releases` |
| Raspberry Pi | `raspbian`, `raspberrypi`, `raspberrypi-images` |
| OpenWrt / ImmortalWrt | `openwrt`, `openwrt-releases`, `openwrt-snapshots`, `openwrt-packages`, `openwrt-firmware`, `openwrt-sdk`, `immortalwrt`, `immortalwrt-releases`, `immortalwrt-snapshots` |
| Pacman / APK | `arch`, `archlinuxarm`, `alpine`, `msys2` |
| DNF / YUM / Zypper | `fedora`, `epel`, `centos-stream`, `rocky`, `almalinux`, `opensuse` |
| XBPS / pkg / Termux | `void`, `void-musl`, `freebsd-pkg`, `termux` |
| Conda | `anaconda`, `conda-forge` |

兼容别名包括 `debian-archive`、`ubuntu-archive`、`raspberry-pi`、`raspi`、`archlinux`、`arch-arm`、`fedora-epel`、`centos`、`rockylinux`、`alma`、`void-glibc`、`freebsd`、`conda-defaults` 等。响应头 `X-EdgeMirror-Source` 始终返回 canonical source ID。

## APT 示例

Debian：

```text
deb https://YOUR_DOMAIN/repo/debian stable main contrib non-free-firmware
deb https://YOUR_DOMAIN/repo/debian-security stable-security main contrib non-free-firmware
```

Ubuntu：

```text
deb https://YOUR_DOMAIN/repo/ubuntu noble main restricted universe multiverse
deb https://YOUR_DOMAIN/repo/ubuntu-security noble-security main restricted universe multiverse
```

Raspberry Pi OS：

```text
deb https://YOUR_DOMAIN/repo/raspbian bookworm main contrib non-free rpi
deb https://YOUR_DOMAIN/repo/raspberrypi bookworm main
```

## OpenWrt APK / OPKG

OpenWrt 25.12 及以后使用 APK，保留原有路径，只替换域名前缀：

```sh
sed -i 's#https://downloads.openwrt.org/#https://YOUR_DOMAIN/repo/openwrt/#g' /etc/apk/repositories.d/distfeeds.list
apk update
```

OpenWrt 24.10 及以前使用 OPKG：

```sh
sed -i 's#https://downloads.openwrt.org/#https://YOUR_DOMAIN/repo/openwrt/#g' /etc/opkg/distfeeds.conf
opkg update
```

`openwrt-releases`、`openwrt-packages`、`openwrt-firmware`、`openwrt-sdk` 都以官方 releases tree 为根，适合生成更短、用途明确的地址；`openwrt` 则保留完整官方目录结构。

## Pacman / Alpine

Arch Linux `/etc/pacman.d/mirrorlist`：

```text
Server = https://YOUR_DOMAIN/repo/arch/$repo/os/$arch
```

Arch Linux ARM：

```text
Server = https://YOUR_DOMAIN/repo/archlinuxarm/$arch/$repo
```

Alpine `/etc/apk/repositories`：

```text
https://YOUR_DOMAIN/repo/alpine/latest-stable/main
https://YOUR_DOMAIN/repo/alpine/latest-stable/community
```

## DNF / YUM

Fedora 固定 baseurl 示例：

```ini
[edgemirror-fedora]
name=EdgeMirror Fedora
baseurl=https://YOUR_DOMAIN/repo/fedora/releases/$releasever/Everything/$basearch/os/
enabled=1
gpgcheck=1
```

Rocky / AlmaLinux 可使用相同模式：

```text
https://YOUR_DOMAIN/repo/rocky/9/BaseOS/$basearch/os/
https://YOUR_DOMAIN/repo/almalinux/9/BaseOS/$basearch/os/
```

签名 key 继续使用系统原有官方 key；EdgeMirror 不修改 `repomd.xml`、RPM 或签名文件。

## Void / FreeBSD / Conda

Void glibc 与 musl：

```text
repository=https://YOUR_DOMAIN/repo/void
repository=https://YOUR_DOMAIN/repo/void-musl
```

FreeBSD pkg repository URL：

```text
pkg+https://YOUR_DOMAIN/repo/freebsd-pkg/${ABI}/quarterly
```

Conda defaults 与 conda-forge：

```text
https://YOUR_DOMAIN/repo/anaconda/main
https://YOUR_DOMAIN/repo/anaconda/r
https://YOUR_DOMAIN/repo/anaconda/msys2
https://YOUR_DOMAIN/repo/conda-forge
```

## 固定策略

- 仅允许 `GET`、`HEAD`、`OPTIONS`；
- 上游请求使用 `cache: no-store`；
- 返回 `Cache-Control`、`CDN-Cache-Control`、`Cloudflare-CDN-Cache-Control: no-store`；
- 原样保留 Range、ETag、Last-Modified、Content-Range 和官方签名文件；
- 不使用 Cache API、R2、KV、D1 或 VPS；
- 旧 `/pypi`、`/npm`、`/go`、`/maven`、`/crates`、`/downloads` 等路由保持兼容。
