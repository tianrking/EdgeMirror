<p align="center">
  <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <strong>中文</strong>
</p>

<h1 align="center">EdgeMirror</h1>

<p align="center">
  面向系统仓库和开发者资源的只读、严格无缓存边缘镜像网关。
</p>

<p align="center">
  一个 Cloudflare Worker，35 个系统源、13 个开发者入口、48 个配置目标，并完整保留原有兼容路由。
</p>

<p align="center">
  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/tianrking/edgemirror">
    <img alt="Deploy to Cloudflare" src="https://img.shields.io/badge/Deploy%20to-Cloudflare-f38020?style=for-the-badge&logo=cloudflare&logoColor=white&labelColor=111827">
  </a>
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/tianrking/edgemirror">
    <img alt="Deploy with Vercel" src="https://img.shields.io/badge/Deploy%20with-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white&labelColor=111827">
  </a>
</p>

<p align="center">
  <img alt="Verify" src="https://img.shields.io/github/actions/workflow/status/tianrking/edgemirror/verify.yml?branch=main&style=for-the-badge&label=verify">
  <img alt="Runtime" src="https://img.shields.io/badge/runtime-Cloudflare%20Workers%20%7C%20Vercel%20Functions-0f172a?style=for-the-badge">
  <img alt="Language" src="https://img.shields.io/badge/language-JavaScript%20ESM-f7df1e?style=for-the-badge&labelColor=111827">
  <img alt="Package manager" src="https://img.shields.io/badge/package-npm-cb3837?style=for-the-badge">
  <img alt="Maintainer" src="https://img.shields.io/badge/maintainer-tianrking-2563eb?style=for-the-badge">
</p>

## 项目定位

EdgeMirror 是一个单域名边缘镜像网关，用一个仓库提供一组常用开发源加速服务。推荐的生产玩法是一个公开 `YOUR_DOMAIN`，规范命名空间使用 `/repo`、`/pkg`、`/sdk`、`/oci`、`/git`；原有 `/pypi`、`/npm`、`/go`、`/maven`、`/crates`、`/downloads`、`/github`、`/v2` 等入口继续兼容。

维护者当前在线部署：[box.w0x7ce.eu](https://box.w0x7ce.eu/)。个人 Fork 可以直接使用 `workers.dev`，自定义域名是可选项。

维护者：[tianrking](https://github.com/tianrking)

关键词：边缘镜像网关，CDN 风格源加速，Cloudflare Workers 代理，Vercel Functions 代理，PyPI 加速，PyTorch wheel 代理，Hugging Face 镜像，Docker registry 代理，GitHub raw 代理，Linux 软件源代理，npm registry 代理，Go module proxy，Maven / Gradle 镜像，crates.io sparse registry 代理，运行时下载加速。

## 技术栈标签卡片

<p align="center">
  <img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-f38020?style=for-the-badge">
  <img alt="Vercel Functions" src="https://img.shields.io/badge/Vercel-Functions-000?style=for-the-badge">
  <img alt="JavaScript ESM" src="https://img.shields.io/badge/JavaScript-ESM-f7df1e?style=for-the-badge&labelColor=111827">
  <img alt="Single domain" src="https://img.shields.io/badge/single--domain-paths-2563eb?style=for-the-badge">
  <img alt="Path routing" src="https://img.shields.io/badge/path-routing-16a34a?style=for-the-badge">
  <img alt="PyPI" src="https://img.shields.io/badge/PyPI-packages-3775a9?style=for-the-badge">
  <img alt="PyTorch" src="https://img.shields.io/badge/PyTorch-wheels-ee4c2c?style=for-the-badge">
  <img alt="Hugging Face" src="https://img.shields.io/badge/Hugging%20Face-models-ffd21e?style=for-the-badge&labelColor=111827">
  <img alt="GitHub" src="https://img.shields.io/badge/GitHub-proxy-2da44e?style=for-the-badge">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-registry-0db7ed?style=for-the-badge">
  <img alt="Linux mirrors" src="https://img.shields.io/badge/Linux-mirrors-8b5cf6?style=for-the-badge">
  <img alt="Universal proxy" src="https://img.shields.io/badge/Universal-file%20proxy-d946ef?style=for-the-badge">
  <img alt="npm" src="https://img.shields.io/badge/npm-registry-cb3837?style=for-the-badge">
  <img alt="Go modules" src="https://img.shields.io/badge/Go-modules-00add8?style=for-the-badge">
  <img alt="Maven" src="https://img.shields.io/badge/Maven-Gradle-c71a36?style=for-the-badge">
  <img alt="crates.io" src="https://img.shields.io/badge/crates.io-sparse-dea584?style=for-the-badge&labelColor=111827">
  <img alt="Downloads" src="https://img.shields.io/badge/runtime-downloads-0f766e?style=for-the-badge">
  <img alt="Syntax check" src="https://img.shields.io/badge/syntax-check-22c55e?style=for-the-badge">
  <img alt="Smoke test" src="https://img.shields.io/badge/smoke-tested-22c55e?style=for-the-badge">
  <img alt="npm audit" src="https://img.shields.io/badge/npm-audit-22c55e?style=for-the-badge">
  <img alt="One click deploy" src="https://img.shields.io/badge/one--click-deploy-7c3aed?style=for-the-badge">
  <img alt="Wrangler" src="https://img.shields.io/badge/Wrangler-4.x-f38020?style=for-the-badge">
</p>

## 服务矩阵

`Stable` 表示已经适合日常使用。`Test` 表示功能已经实现、接入 smoke test，并适合继续验证，稳定后再提升为 Stable。

每个页面都有统一的 English / Español / 中文 切换。工具名称保持英文，说明、用法提示和常见 UI 标签会跟随所选语言显示。

| 状态 | 服务 | 单域名路径 | 可加速资源 |
| --- | --- | --- | --- |
| Stable | EdgeMirror Portal | `/` 或 `/edgemirror` | 所有源加速服务的可视化入口和使用示例 |
| Stable | Help | `/help` | 支持英文、西班牙语、中文的路径地图、网页用法、命令行示例和配置说明 |
| Stable | PyPI / PyTorch | `/pypi` | PyPI simple index、Python 包文件、PyTorch wheel 下载 |
| Stable | Hugging Face | `/hf` | Hugging Face API、模型、数据集和 LFS 大文件下载 |
| Stable | GitHub | `/github` | Git clone、Raw 文件、Release 资源和 GitHub 页面 |
| Stable | Docker Registry | `/docker` UI，`/v2` API | Docker Hub 以及 `quay`、`gcr`、`k8s`、`ghcr`、`nvcr` 前缀 |
| Stable | Linux Mirrors | `/mirrors` | APT、YUM、DNF、Pacman、wget、curl 的透传软件源路径 |
| Stable | Repository Gateway | `/repo/{source}` | 固定、只读、无缓存的 APT、DNF/YUM、Pacman、APK/OPKG、XBPS、FreeBSD pkg 与 Conda 系统源 |
| Stable | Catalog & Setup UI | `/catalog` | 搜索全部 35 个系统源，为 48 个目标生成配置、复制命令并检查所选路由 |
| Stable | Canonical Route Layer | `/pkg`、`/sdk`、`/oci`、`/git` | npm、只读 NuGet v3、Node.js、Flutter、Docker Registry v2 与 GitHub 规范入口 |
| Stable | Universal Proxy | `/proxy` | 任意 HTTP/HTTPS 文件 URL 和下载文件名处理 |
| Test | npm Registry | `/npm` | npm、pnpm、yarn metadata 和 tarball 下载 |
| Test | Go Module Proxy | `/go` | GOPROXY module list、版本 metadata、`.mod` 和 `.zip` 文件 |
| Test | Maven / Gradle | `/maven` | Maven Central、Google Maven、Gradle Plugin Portal、JitPack |
| Test | crates.io Sparse | `/crates` | Cargo sparse index 和 `.crate` 包下载 |
| Test | Runtime Downloads | `/downloads` | Node.js、Python、Go、Rustup、Open VSX、SourceForge、GitLab、Gitea 和直接 URL 文件 |

`/catalog` 可视化配置中心已经覆盖全部系统源和规范开发者入口；`/repo`、`/pkg`、`/sdk` 继续作为机器可读接口。来源 ID、兼容入口和配置示例见 [REPOSITORIES.md](REPOSITORIES.md)。

## 当前版本：2.0.0

| 维度 | 当前覆盖 |
| --- | --- |
| 系统仓库 | 35 个固定官方上游根目录 |
| 开发者与 SDK 入口 | 13 个规范目标 |
| Catalog 配置生成器 | 48 个完整配置目标 |
| 包管理器 | APT、DNF/YUM、Zypper、Pacman、APK、OPKG、XBPS、FreeBSD pkg、Conda |
| 规范命名空间 | `/repo`、`/pkg`、`/sdk`、`/oci`、`/git` |
| 兼容性 | 原有 `/pypi`、`/npm`、`/go`、`/maven`、`/crates`、`/downloads`、`/github`、`/v2` 继续可用 |
| 缓存策略 | 浏览器、CDN 和上游请求全部严格 `no-store` |
| 附加基础设施 | 不使用 Cache API、KV、R2、D1、数据库或 VPS |

Worker 被刻意设计为透明、只读的转发层。官方 metadata、校验和、签名、Range 请求、ETag 和 Last-Modified 继续由上游协议负责，不复制到个人存储中。

## 完整系统源目录

| 生态 | Source IDs |
| --- | --- |
| Debian / Ubuntu | `debian`、`debian-security`、`debian-ports`、`ubuntu`、`ubuntu-security`、`ubuntu-ports`、`ubuntu-releases` |
| Raspberry Pi | `raspbian`、`raspberrypi`、`raspberrypi-images` |
| OpenWrt / ImmortalWrt | `openwrt`、`openwrt-releases`、`openwrt-snapshots`、`openwrt-packages`、`openwrt-firmware`、`openwrt-sdk`、`immortalwrt`、`immortalwrt-releases`、`immortalwrt-snapshots` |
| Pacman / APK | `arch`、`archlinuxarm`、`alpine`、`msys2` |
| DNF / YUM / Zypper | `fedora`、`epel`、`centos-stream`、`rocky`、`almalinux`、`opensuse` |
| XBPS / pkg / Termux | `void`、`void-musl`、`freebsd-pkg`、`termux` |
| Conda | `anaconda`、`conda-forge` |

全部系统源使用同一机器接口：

```text
https://YOUR_DOMAIN/repo/{source}/{upstream-path}
```

`GET /repo` 会返回当前部署的 JSON 来源目录，包括 canonical ID、兼容别名、官方上游和完整入口。`debian-archive`、`ubuntu-archive`、`raspi`、`archlinux`、`fedora-epel`、`centos`、`rockylinux`、`alma`、`freebsd`、`conda-defaults` 等别名继续可用。

## 规范路由地图

| 规范入口 | 作用 | 兼容入口 |
| --- | --- | --- |
| `/repo/{source}/...` | 固定系统仓库 | 新命名空间 |
| `/pkg/npm/...` | npm registry | `/npm/...` |
| `/pkg/nuget/v3/index.json` | 只读 NuGet v3 service index 和后续资源链 | 新命名空间 |
| `/sdk/node/...` | Node.js release tree | `/downloads/node/...` |
| `/sdk/flutter/...` | Flutter SDK metadata 与 storage root | 新命名空间 |
| `/oci/docker/v2/...` | Docker Registry v2 API | `/v2/...`、`/docker/...` |
| `/git/github/...` | GitHub Git、Raw 文件和 Release 资源 | `/github/...` |

NuGet 会把完整 v3 资源链回写到 EdgeMirror，并移除 publish capability；Flutter release metadata 与 storage URL 会回写到部署域名。Docker token/blob redirect、npm tarball URL 等协议专用地址也由各自适配器处理。

## Catalog 与配置生成器

打开 `/catalog` 即可使用完整新版 UI：

- 按发行版、包管理器、路由或上游搜索全部 35 个系统源；
- 筛选 APT、OpenWrt、RPM、Pacman/APK 和其他仓库类别；
- 使用当前部署域名为全部 48 个目标生成准确配置；
- 只显示当前目标真正需要的版本、架构和组件字段；
- 一键复制配置、打开入口，或执行真实 `HEAD` 路由探测；
- 桌面和手机端均支持 English、Español、中文。

网页调用只读 JSON 生成接口：

```text
GET /catalog/config?id=debian&origin=https://YOUR_DOMAIN&version=bookworm&components=main%20contrib
```

接口会验证域名、目标 ID、版本、架构和组件列表，只接受 `GET`、`HEAD`、`OPTIONS`。

OpenWrt 会按版本自动选择包管理器：

```text
OpenWrt 24.10 及以前 -> OPKG -> /etc/opkg/distfeeds.conf
OpenWrt 25.12 及以后 -> APK  -> /etc/apk/repositories.d/distfeeds.list
```

## 一键部署

### 部署到 Cloudflare Workers

点击 README 顶部的 Cloudflare 按钮，或直接打开：

```text
https://deploy.workers.cloudflare.com/?url=https://github.com/tianrking/edgemirror
```

Cloudflare 会读取 `wrangler.toml`，创建 Worker，并部署到当前账户提供的 Worker 名称。默认配置是可移植的一键部署配置：启用 `workers.dev`，关闭 preview URLs，并且不会默认绑定维护者自己的自定义域名。

当前已经验证的维护者部署地址为 `https://box.w0x7ce.eu`。个人部署时可以使用 Wrangler 返回的 `workers.dev` 主机名，或在部署成功后再绑定自己的自定义域名。

Worker 部署成功后，可以在 Cloudflare 控制台添加一个自定义域名；也可以确认该域名属于当前 Cloudflare 账户后，把 `wrangler.custom-domain.example.toml` 里的 route 配置复制到 `wrangler.toml`。所有工具仍然使用同一套路径路由。

### 部署到 Vercel

点击 README 顶部的 Vercel 按钮，或直接打开：

```text
https://vercel.com/new/clone?repository-url=https://github.com/tianrking/edgemirror
```

Vercel 会使用 `api/index.js` 作为 Web Handler 函数入口，并根据 `vercel.json` 把所有路径转发到该函数。Vercel 部署使用同一套路由：`/edgemirror`、`/pypi`、`/hf`、`/github`、`/docker`、`/mirrors`、`/proxy`、`/npm`、`/go`、`/maven`、`/crates`、`/downloads`、`/help`。Docker Registry API 流量会在 `/v2`、`/token`、`/_worker_blob_proxy` 自动识别，因此单个 Vercel 域名也可以直接用于 Docker pull，不需要把 `/docker` 写进镜像名。

## 本地开发

```bash
npm install
npm run verify
npm run dev
```

常用命令：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动 Cloudflare Worker 本地开发服务器 |
| `npm run dev:cloudflare` | 与 `npm run dev` 相同 |
| `npm run dev:vercel` | 使用 `npx vercel@latest dev` 启动 Vercel 本地开发 |
| `npm run check` | 语法检查 `src` 和 `scripts` 下所有 JavaScript 文件 |
| `npm run smoke:repositories` | 验证 35 个仓库映射、别名、方法、响应头和无缓存策略 |
| `npm run smoke:repositories:live` | 探测代表性的官方 APT、DNF、Pacman、APK、XBPS 和 Conda 上游 |
| `npm run smoke:canonical` | 使用受控上游验证 npm、NuGet、SDK、OCI、Git 规范路由 |
| `npm run smoke:canonical:live` | 对代表性的规范路由执行真实官方服务验证 |
| `npm run smoke:catalog` | 验证 48 个配置目标、OpenWrt 分界、输入校验、UI 数量与旧导航 |
| `npm run smoke:vercel` | 导入 Vercel 函数入口并验证核心路由 |
| `npm run verify` | 运行语法、系统源、真实上游、规范路由、Catalog、Vercel 和安全检查 |
| `npm run deploy:cloudflare` | 使用 Wrangler 部署到 Cloudflare |
| `npm run deploy:vercel` | 使用 `npx vercel@latest --prod` 部署到 Vercel 生产环境 |

## 路由模型

EdgeMirror 以单域名路径路由为主：

| 路由方式 | 示例 | 说明 |
| --- | --- | --- |
| 路径路由 | `https://YOUR_DOMAIN/pypi/simple/` | 推荐生产模式 |
| Vercel 路径路由 | `https://your-app.vercel.app/pypi/simple/` | Vercel 一键部署后使用同样路径 |

单域名部署下的 Docker 用法：

```bash
docker pull your-app.vercel.app/library/nginx:latest
```

路由器会自动把 Docker 的 `/v2`、`/token` 和 blob redirect 流量转交给 Docker 工具。

健康检查路径：

```text
/health
/healthz
/__health
```

健康检查会返回项目版本和已注册服务列表。

## 使用示例

安装 Python 包：

```bash
pip install numpy -i https://YOUR_DOMAIN/pypi/simple/
```

安装 PyTorch wheel：

```bash
pip install torch torchvision --index-url https://YOUR_DOMAIN/pypi/pytorch/cu118
```

下载 Hugging Face 模型：

```bash
export HF_ENDPOINT=https://YOUR_DOMAIN/hf
huggingface-cli download gpt2
```

通过 GitHub 代理克隆仓库：

```bash
git clone https://YOUR_DOMAIN/github/vercel/next.js.git
```

拉取 Docker 镜像：

```bash
docker pull YOUR_DOMAIN/library/nginx:latest
```

代理任意文件：

```bash
curl -L -O "https://YOUR_DOMAIN/proxy/https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi"
```

使用新增的 Test npm registry 路由：

```bash
npm install lodash --registry=https://YOUR_DOMAIN/npm/
pnpm install lodash --registry=https://YOUR_DOMAIN/npm/
```

使用新增的 Test Go module 路由：

```bash
go env -w GOPROXY=https://YOUR_DOMAIN/go,direct
```

使用新增的 Test Maven / Gradle 路由：

```kotlin
repositories {
    maven { url = uri("https://YOUR_DOMAIN/maven/maven-central") }
    maven { url = uri("https://YOUR_DOMAIN/maven/google") }
    maven { url = uri("https://YOUR_DOMAIN/maven/gradle-plugin") }
}
```

使用新增的 Test crates.io sparse 路由：

```toml
[source.crates-io]
replace-with = "edgemirror"

[source.edgemirror]
registry = "sparse+https://YOUR_DOMAIN/crates/"
```

使用新增的 Test 运行时下载路由：

```bash
curl -L -O "https://YOUR_DOMAIN/downloads/node/v22.11.0/node-v22.11.0-x64.msi"
curl -L -O "https://YOUR_DOMAIN/downloads/https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi"
```

## 项目结构

```text
api/index.js              Vercel Functions Web Handler 入口
REPOSITORIES.md           完整来源 ID、规范路由与包管理器配置方法
scripts/check-syntax.mjs  跨平台 JavaScript 语法检查脚本
scripts/smoke-*.mjs       系统源、规范路由、Catalog、真实上游与 Vercel 测试
scripts/smoke-vercel.mjs  Vercel 运行时 smoke test
src/config.js             项目元数据、服务注册表、健康检查路径
src/html.js               非 Cloudflare 运行时的 HTML rewrite fallback
src/i18n.js               语言检测、语言切换链接和本地化 URL
src/index.js              域名/路径路由和健康检查入口
src/proxy-utils.js        共享 CORS、重定向、请求头和代理工具
src/repositories/         固定上游目录与经过校验的配置生成器
src/tools/catalog.js      Catalog UI 与只读配置接口
src/tools/repositories.js 系统源网关处理器
src/tools/nuget.js        只读 NuGet v3 资源链适配器
src/tools/sdks.js         Node.js 与 Flutter 规范 SDK 路由
src/tools/*.js            各工具实现
vercel.json               Vercel 路由与构建配置
wrangler.toml             可移植的 Cloudflare Workers 部署配置
wrangler.custom-domain.example.toml  可选自定义域名配置示例
```

## 配置说明

新增、重命名或说明工具时，优先修改 `src/config.js`。修改 Cloudflare Worker 名称或兼容日期时，修改 `wrangler.toml`。

如果要在 Cloudflare 使用自定义域名，请先在 Cloudflare 控制台添加该域名，或参考 `wrangler.custom-domain.example.toml`。如果要在 Vercel 使用自定义域名，请在 Vercel 控制台添加一个主域名，并继续使用同样的路径路由。

## 生产注意事项

- 部署前保持 `npm run verify` 通过。
- `/catalog` 是面向人的配置界面，`/repo`、`/pkg`、`/sdk` 是机器接口。
- 系统源与配置接口保持只读，只允许 `GET`、`HEAD`、`OPTIONS`。
- 浏览器、CDN 和上游请求保持 `no-store`，当前版本明确不启用公开缓存。
- 保留上游 Range、ETag、Last-Modified、Content-Range、校验和与签名行为。
- 保持 `wrangler` 更新，它是本地 Cloudflare 开发和部署工具链。
- Cloudflare 自定义域名与账户绑定，因此默认 `wrangler.toml` 不硬编码自定义域名。
- 公开产品体验推荐使用一个主域名；旧的多工具多域名不是推荐交互模型。
- 上游服务自己的限流、认证要求和服务条款仍然适用。

## 后续路线

- 新增 Test 加速器经过更多上游兼容性验证后提升为 Stable。
- 支持通过环境变量配置服务域名。
- 增加结构化访问日志和可选请求追踪。
- 在不让部署依赖所有上游在线的前提下，扩大真实架构与来源探测范围。
- 增加门户和工具页面的部署预览截图。
