<p align="center">
  <a href="README.zh-CN.md">中文</a> | <strong>English</strong>
</p>

<h1 align="center">DevBox Workers</h1>

<p align="center">
  A production-ready developer accelerator toolbox for PyPI, PyTorch, Hugging Face, GitHub, Docker registries, Linux mirrors, and universal file downloads.
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
  <img alt="Verify workflow" src="https://github.com/tianrking/box-tools/actions/workflows/verify.yml/badge.svg">
  <img alt="Runtime" src="https://img.shields.io/badge/runtime-Cloudflare%20Workers%20%7C%20Vercel%20Functions-0f172a?style=for-the-badge">
  <img alt="Language" src="https://img.shields.io/badge/language-JavaScript%20ESM-f7df1e?style=for-the-badge&labelColor=111827">
  <img alt="Package manager" src="https://img.shields.io/badge/package-npm-cb3837?style=for-the-badge">
  <img alt="Maintainer" src="https://img.shields.io/badge/maintainer-tianrking-2563eb?style=for-the-badge">
</p>

## Why DevBox Workers

DevBox Workers is a single edge application that turns one repository into a fast, self-hostable developer toolbox. It keeps the Cloudflare Worker version as the primary runtime, while also shipping a Vercel Functions entry so the same codebase can be deployed from either account with one click.

Maintainer: [tianrking](https://github.com/tianrking)

Keywords: Cloudflare Workers proxy, Vercel Functions proxy, PyPI mirror accelerator, PyTorch wheel proxy, Hugging Face mirror, Docker registry proxy, GitHub raw proxy, Linux mirror proxy, developer toolbox.

## Tool Stack

<table>
  <tr>
    <td align="center"><strong>Edge Runtime</strong><br><img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-f38020?style=flat-square"> <img alt="Vercel Functions" src="https://img.shields.io/badge/Vercel-Functions-000?style=flat-square"></td>
    <td align="center"><strong>Language</strong><br><img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ESM-f7df1e?style=flat-square&labelColor=111827"></td>
    <td align="center"><strong>Routing</strong><br><img alt="Host routing" src="https://img.shields.io/badge/host-routing-2563eb?style=flat-square"> <img alt="Path routing" src="https://img.shields.io/badge/path-routing-16a34a?style=flat-square"></td>
  </tr>
  <tr>
    <td align="center"><strong>Proxy Targets</strong><br><img alt="PyPI" src="https://img.shields.io/badge/PyPI-packages-3775a9?style=flat-square"> <img alt="Hugging Face" src="https://img.shields.io/badge/Hugging%20Face-models-ffd21e?style=flat-square&labelColor=111827"> <img alt="Docker" src="https://img.shields.io/badge/Docker-registry-0db7ed?style=flat-square"></td>
    <td align="center"><strong>Quality Gates</strong><br><img alt="Syntax check" src="https://img.shields.io/badge/syntax-check-22c55e?style=flat-square"> <img alt="Smoke test" src="https://img.shields.io/badge/smoke-tested-22c55e?style=flat-square"> <img alt="Audit" src="https://img.shields.io/badge/npm-audit-22c55e?style=flat-square"></td>
    <td align="center"><strong>Deploy</strong><br><img alt="One click" src="https://img.shields.io/badge/one--click-deploy-7c3aed?style=flat-square"> <img alt="Wrangler" src="https://img.shields.io/badge/Wrangler-4.x-f38020?style=flat-square"></td>
  </tr>
</table>

## Services

| Service | Default host | Path prefix | What it does |
| --- | --- | --- | --- |
| DevBox Portal | `box.w0x7ce.eu` | `/box` | Visual dashboard and usage snippets for every tool |
| PyPI / PyTorch | `pypi.w0x7ce.eu` | `/pypi` | PyPI simple index, package files, and PyTorch wheel proxy |
| Hugging Face | `hf.w0x7ce.eu` | `/hf` | Hugging Face API and LFS download forwarding |
| GitHub | `github.w0x7ce.eu` | `/github` | Git clone, raw file, release asset, and page proxy |
| Docker Registry | `docker.w0x7ce.eu` | `/docker` | Docker Hub plus `quay`, `gcr`, `k8s`, `ghcr`, `nvcr` prefixes |
| Linux Mirrors | `mirrors.w0x7ce.eu` | `/mirrors` | Pass-through mirror proxy for APT, YUM, DNF, Pacman, wget, curl |
| Universal Proxy | `proxy.w0x7ce.eu` | `/proxy` | Universal URL forwarding and attachment filename handling |

## One-Click Deployment

### Deploy to Cloudflare Workers

Click the Cloudflare button at the top of this README, or open:

```text
https://deploy.workers.cloudflare.com/?url=https://github.com/tianrking/box-tools
```

Cloudflare reads `wrangler.toml`, creates the Worker, and applies the configured Worker settings. Custom domains in `wrangler.toml` must already belong to the Cloudflare account that deploys the project.

### Deploy to Vercel

Click the Vercel button at the top of this README, or open:

```text
https://vercel.com/new/clone?repository-url=https://github.com/tianrking/box-tools
```

Vercel uses `api/index.js` as a Web Handler function and `vercel.json` to route every path to that function. On a single Vercel domain, use path prefixes like `/pypi`, `/hf`, `/github`, `/docker`, `/mirrors`, and `/proxy`.

## Local Development

```bash
npm install
npm run verify
npm run dev
```

Useful scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Cloudflare Worker dev server |
| `npm run dev:cloudflare` | Same as `npm run dev` |
| `npm run dev:vercel` | Start Vercel local development with `npx vercel@latest dev` |
| `npm run check` | Syntax-check every JavaScript file under `src` and `scripts` |
| `npm run smoke:vercel` | Import the Vercel function entry and verify core routes |
| `npm run verify` | Run syntax check, Vercel smoke test, and high-severity npm audit |
| `npm run deploy:cloudflare` | Deploy with Wrangler |
| `npm run deploy:vercel` | Deploy to Vercel production with `npx vercel@latest --prod` |

## Routing Model

DevBox Workers supports two routing styles:

| Runtime style | Example | Notes |
| --- | --- | --- |
| Host routing | `https://pypi.w0x7ce.eu/simple/` | Best for Cloudflare custom domains |
| Path routing | `https://your-worker.workers.dev/pypi/simple/` | Best for local dev and single-domain Vercel deployments |

Health checks are available at:

```text
/health
/healthz
/__health
```

They return JSON with the project version and the registered service list.

## Examples

Install a Python package:

```bash
pip install numpy -i https://pypi.w0x7ce.eu/simple/
```

Install PyTorch wheels:

```bash
pip install torch torchvision --index-url https://pypi.w0x7ce.eu/pytorch/cu118
```

Download a Hugging Face model:

```bash
export HF_ENDPOINT=https://hf.w0x7ce.eu
huggingface-cli download gpt2
```

Clone through the GitHub proxy:

```bash
git clone https://github.w0x7ce.eu/tianrking/box-tools.git
```

Pull a Docker image:

```bash
docker pull docker.w0x7ce.eu/library/nginx:latest
```

Proxy a generic file:

```bash
curl -L -O "https://proxy.w0x7ce.eu/proxy/https://example.com/file.zip"
```

## Project Layout

```text
api/index.js              Vercel Functions Web Handler entry
scripts/check-syntax.mjs  Cross-platform JavaScript syntax checker
scripts/smoke-vercel.mjs  Vercel runtime smoke test
src/config.js             Project metadata, service registry, health paths
src/html.js               HTML rewrite fallback for non-Cloudflare runtimes
src/index.js              Host/path router and health endpoint
src/tools/*.js            Individual tool implementations
vercel.json               Vercel routing and build configuration
wrangler.toml             Cloudflare Workers configuration
```

## Configuration

Edit `src/config.js` when adding, renaming, or documenting a tool. Edit `wrangler.toml` when changing Cloudflare Worker names, compatibility dates, or custom domains.

For Vercel custom domains, add the domains in the Vercel dashboard. The same host router will work when Vercel receives traffic for a configured service host.

## Production Notes

- Keep `npm run verify` green before deploying.
- Keep `wrangler` updated; it is the local Cloudflare dev/deploy toolchain.
- Cloudflare custom domains in `wrangler.toml` are account-specific.
- Vercel deployments use path routing unless you configure matching custom domains.
- Some upstream services may have rate limits, authentication requirements, or terms of service that still apply through a proxy.

## Roadmap

- Add configurable service domains through environment variables.
- Add structured access logs and optional request tracing.
- Add per-tool smoke tests with mocked upstream responses.
- Add deployment preview screenshots for the portal and tool pages.
