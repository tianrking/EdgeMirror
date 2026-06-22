<p align="center">
  <strong>中文</strong> | <a href="README.md">English</a>
</p>

<h1 align="center">DevBox Workers</h1>

<p align="center">
  一个可生产部署的开发者加速工具箱，覆盖 PyPI、PyTorch、Hugging Face、GitHub、Docker 镜像仓库、Linux 软件源和通用文件下载代理。
</p>

<p align="center">
  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/tianrking/box-tools">
    <img alt="Deploy to Cloudflare" src="https://deploy.workers.cloudflare.com/button">
  </a>
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/tianrking/box-tools">
    <img alt="Deploy with Vercel" src="https://vercel.com/button">
  </a>
</p>

<p align="center">
  <img alt="Runtime" src="https://img.shields.io/badge/runtime-Cloudflare%20Workers%20%7C%20Vercel%20Functions-0f172a?style=for-the-badge">
  <img alt="Language" src="https://img.shields.io/badge/language-JavaScript%20ESM-f7df1e?style=for-the-badge&labelColor=111827">
  <img alt="Package manager" src="https://img.shields.io/badge/package-npm-cb3837?style=for-the-badge">
  <img alt="Maintainer" src="https://img.shields.io/badge/maintainer-tianrking-2563eb?style=for-the-badge">
</p>

## 项目定位

DevBox Workers 用一个边缘函数仓库提供一组常用开发加速服务。它以 Cloudflare Workers 作为主运行时，同时提供 Vercel Functions 入口，因此可以从 Cloudflare 或 Vercel 账户一键部署。

维护者：[tianrking](https://github.com/tianrking)

关键词：Cloudflare Workers 代理，Vercel Functions 代理，PyPI 加速，PyTorch wheel 代理，Hugging Face 镜像，Docker registry 代理，GitHub raw 代理，Linux 软件源代理，开发者工具箱。

## 技术栈标签卡片

<table>
  <tr>
    <td align="center"><strong>边缘运行时</strong><br><img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-f38020?style=flat-square"> <img alt="Vercel Functions" src="https://img.shields.io/badge/Vercel-Functions-000?style=flat-square"></td>
    <td align="center"><strong>开发语言</strong><br><img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ESM-f7df1e?style=flat-square&labelColor=111827"></td>
    <td align="center"><strong>路由模式</strong><br><img alt="Host routing" src="https://img.shields.io/badge/host-routing-2563eb?style=flat-square"> <img alt="Path routing" src="https://img.shields.io/badge/path-routing-16a34a?style=flat-square"></td>
  </tr>
  <tr>
    <td align="center"><strong>代理目标</strong><br><img alt="PyPI" src="https://img.shields.io/badge/PyPI-packages-3775a9?style=flat-square"> <img alt="Hugging Face" src="https://img.shields.io/badge/Hugging%20Face-models-ffd21e?style=flat-square&labelColor=111827"> <img alt="Docker" src="https://img.shields.io/badge/Docker-registry-0db7ed?style=flat-square"></td>
    <td align="center"><strong>质量门禁</strong><br><img alt="Syntax check" src="https://img.shields.io/badge/syntax-check-22c55e?style=flat-square"> <img alt="Smoke test" src="https://img.shields.io/badge/smoke-tested-22c55e?style=flat-square"> <img alt="Audit" src="https://img.shields.io/badge/npm-audit-22c55e?style=flat-square"></td>
    <td align="center"><strong>部署体验</strong><br><img alt="One click" src="https://img.shields.io/badge/one--click-deploy-7c3aed?style=flat-square"> <img alt="Wrangler" src="https://img.shields.io/badge/Wrangler-4.x-f38020?style=flat-square"></td>
  </tr>
</table>

## 服务清单

| 服务 | 默认域名 | 路径前缀 | 功能 |
| --- | --- | --- | --- |
| DevBox Portal | `box.w0x7ce.eu` | `/box` | 所有工具的可视化入口和使用示例 |
| PyPI / PyTorch | `pypi.w0x7ce.eu` | `/pypi` | PyPI simple index、Python 包文件、PyTorch wheel 代理 |
| Hugging Face | `hf.w0x7ce.eu` | `/hf` | Hugging Face API 与 LFS 大文件下载代理 |
| GitHub | `github.w0x7ce.eu` | `/github` | Git clone、Raw 文件、Release 资源和页面代理 |
| Docker Registry | `docker.w0x7ce.eu` | `/docker` | Docker Hub 以及 `quay`、`gcr`、`k8s`、`ghcr`、`nvcr` 前缀 |
| Linux Mirrors | `mirrors.w0x7ce.eu` | `/mirrors` | APT、YUM、DNF、Pacman、wget、curl 的透传软件源代理 |
| Universal Proxy | `proxy.w0x7ce.eu` | `/proxy` | 通用 URL 转发和下载文件名处理 |

## 一键部署

### 部署到 Cloudflare Workers

点击 README 顶部的 Cloudflare 按钮，或直接打开：

```text
https://deploy.workers.cloudflare.com/?url=https://github.com/tianrking/box-tools
```

Cloudflare 会读取 `wrangler.toml`，创建 Worker，并应用项目配置。`wrangler.toml` 中的自定义域名必须已经属于当前 Cloudflare 账户。

### 部署到 Vercel

点击 README 顶部的 Vercel 按钮，或直接打开：

```text
https://vercel.com/new/clone?repository-url=https://github.com/tianrking/box-tools
```

Vercel 会使用 `api/index.js` 作为 Web Handler 函数入口，并根据 `vercel.json` 把所有路径转发到该函数。在单个 Vercel 域名下使用 `/pypi`、`/hf`、`/github`、`/docker`、`/mirrors`、`/proxy` 这类路径前缀。

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
| `npm run smoke:vercel` | 导入 Vercel 函数入口并验证核心路由 |
| `npm run verify` | 运行语法检查、Vercel smoke test 和高危 npm audit |
| `npm run deploy:cloudflare` | 使用 Wrangler 部署到 Cloudflare |
| `npm run deploy:vercel` | 使用 `npx vercel@latest --prod` 部署到 Vercel 生产环境 |

## 路由模型

DevBox Workers 支持两种路由方式：

| 路由方式 | 示例 | 说明 |
| --- | --- | --- |
| 域名路由 | `https://pypi.w0x7ce.eu/simple/` | 适合 Cloudflare 自定义域名 |
| 路径路由 | `https://your-worker.workers.dev/pypi/simple/` | 适合本地开发和单域名 Vercel 部署 |

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
pip install numpy -i https://pypi.w0x7ce.eu/simple/
```

安装 PyTorch wheel：

```bash
pip install torch torchvision --index-url https://pypi.w0x7ce.eu/pytorch/cu118
```

下载 Hugging Face 模型：

```bash
export HF_ENDPOINT=https://hf.w0x7ce.eu
huggingface-cli download gpt2
```

通过 GitHub 代理克隆仓库：

```bash
git clone https://github.w0x7ce.eu/tianrking/box-tools.git
```

拉取 Docker 镜像：

```bash
docker pull docker.w0x7ce.eu/library/nginx:latest
```

代理任意文件：

```bash
curl -L -O "https://proxy.w0x7ce.eu/proxy/https://example.com/file.zip"
```

## 项目结构

```text
api/index.js              Vercel Functions Web Handler 入口
scripts/check-syntax.mjs  跨平台 JavaScript 语法检查脚本
scripts/smoke-vercel.mjs  Vercel 运行时 smoke test
src/config.js             项目元数据、服务注册表、健康检查路径
src/html.js               非 Cloudflare 运行时的 HTML rewrite fallback
src/index.js              域名/路径路由和健康检查入口
src/tools/*.js            各工具实现
vercel.json               Vercel 路由与构建配置
wrangler.toml             Cloudflare Workers 配置
```

## 配置说明

新增、重命名或说明工具时，优先修改 `src/config.js`。修改 Cloudflare Worker 名称、兼容日期或自定义域名时，修改 `wrangler.toml`。

如果要在 Vercel 使用自定义域名，请在 Vercel 控制台添加域名。只要 Vercel 收到对应 Host，当前 Host Router 也能按服务域名分发。

## 生产注意事项

- 部署前保持 `npm run verify` 通过。
- 保持 `wrangler` 更新，它是本地 Cloudflare 开发和部署工具链。
- `wrangler.toml` 中的 Cloudflare 自定义域名与账户绑定。
- Vercel 默认使用路径路由；配置匹配的自定义域名后，也可以使用域名路由。
- 上游服务自己的限流、认证要求和服务条款仍然适用。

## 后续路线

- 支持通过环境变量配置服务域名。
- 增加结构化访问日志和可选请求追踪。
- 为每个工具补充 mock upstream 的 smoke test。
- 增加 GitHub Actions，在每次 push 时自动验证。
