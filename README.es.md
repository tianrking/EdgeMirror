<p align="center">
  <a href="README.md">English</a> | <strong>Español</strong> | <a href="README.zh-CN.md">中文</a>
</p>

<h1 align="center">EdgeMirror</h1>

<p align="center">
  Gateway edge mirror de solo lectura y sin caché para repositorios de sistemas y fuentes de desarrollo.
</p>

<p align="center">
  Un Cloudflare Worker, 35 repositorios de sistema, 13 adaptadores de desarrollo, 48 configuraciones generadas y todas las rutas anteriores conservadas.
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
  <img alt="JavaScript ESM" src="https://img.shields.io/badge/JavaScript-ESM-f7df1e?style=for-the-badge&labelColor=111827">
  <img alt="Single domain" src="https://img.shields.io/badge/single--domain-paths-2563eb?style=for-the-badge">
  <img alt="One click deploy" src="https://img.shields.io/badge/one--click-deploy-7c3aed?style=for-the-badge">
</p>

## Resumen

EdgeMirror es un gateway edge mirror de un solo dominio. El modelo recomendado usa un `YOUR_DOMAIN` público con namespaces canónicos en `/repo`, `/pkg`, `/sdk`, `/oci` y `/git`. Las rutas existentes como `/pypi`, `/npm`, `/go`, `/maven`, `/crates`, `/downloads`, `/github` y `/v2` siguen siendo compatibles.

Deployment actual del mantenedor: [box.w0x7ce.eu](https://box.w0x7ce.eu/). Los forks personales pueden usar `workers.dev`; el custom domain es opcional.

Mantenedor: [tianrking](https://github.com/tianrking)

Palabras clave: Cloudflare Workers proxy, Vercel Functions proxy, PyPI mirror, PyTorch wheels, Hugging Face mirror, Docker registry proxy, GitHub raw proxy, Linux mirror proxy, npm registry proxy, Go module proxy, Maven proxy, Gradle mirror, crates.io sparse registry proxy.

## Matriz de servicios

`Stable` significa recomendado para uso diario. `Test` significa implementado y cubierto por smoke tests, pero conviene validarlo en tu propio flujo antes de tratarlo como estable.

| Estado | Servicio | Ruta | Que acelera |
| --- | --- | --- | --- |
| Stable | EdgeMirror Portal | `/` o `/edgemirror` | Panel visual y ejemplos de uso |
| Stable | Help | `/help` | Guia de rutas, uso web, comandos y configuracion en English, Español y 中文 |
| Stable | PyPI / PyTorch | `/pypi` | PyPI simple index, paquetes Python y wheels de PyTorch |
| Stable | Hugging Face | `/hf` | Modelos, datasets, API y descargas LFS |
| Stable | GitHub | `/github` | Git clone, raw files, releases y paginas |
| Stable | Docker | `/docker` UI, `/v2` API | Docker Hub y registros con prefijos `quay`, `gcr`, `k8s`, `ghcr`, `nvcr` |
| Stable | Linux Mirrors | `/mirrors` | APT, YUM, DNF, Pacman, wget y curl |
| Stable | Repository Gateway | `/repo/{source}` | Repositorios fijos, de solo lectura y sin cache para APT, DNF/YUM, Pacman, APK/OPKG, XBPS, FreeBSD pkg y Conda |
| Stable | Catalog & Setup UI | `/catalog` | Busca 35 fuentes, genera configuracion para 48 targets, copia comandos y prueba rutas |
| Stable | Canonical Route Layer | `/pkg`, `/sdk`, `/oci`, `/git` | Rutas canonicas para npm, NuGet v3 de solo lectura, Node.js, Flutter, Docker Registry v2 y GitHub |
| Stable | Universal Proxy | `/proxy` | Cualquier URL HTTP/HTTPS |
| Test | npm Registry | `/npm` | npm, pnpm, yarn metadata y tarballs |
| Test | Go Modules | `/go` | GOPROXY metadata, `.mod` y `.zip` |
| Test | Maven / Gradle | `/maven` | Maven Central, Google Maven, Gradle Plugin Portal y JitPack |
| Test | crates.io Sparse | `/crates` | Cargo sparse index y paquetes `.crate` |
| Test | Downloads | `/downloads` | Runtimes, Open VSX, SourceForge, GitLab, Gitea y URLs directas |

La interfaz `/catalog` cubre todos los repositorios y rutas developer; `/repo`, `/pkg` y `/sdk` siguen siendo APIs legibles por maquinas. Consulta [REPOSITORIES.md](REPOSITORIES.md) para fuentes, compatibilidad y ejemplos.

## Versión actual: 2.0.0

| Dimensión | Cobertura actual |
| --- | --- |
| Repositorios de sistema | 35 raíces upstream oficiales y fijas |
| Adaptadores developer y SDK | 13 targets canónicos |
| Generador de Catalog | 48 targets de configuración completos |
| Gestores de paquetes | APT, DNF/YUM, Zypper, Pacman, APK, OPKG, XBPS, FreeBSD pkg y Conda |
| Namespaces canónicos | `/repo`, `/pkg`, `/sdk`, `/oci`, `/git` |
| Compatibilidad | Continúan `/pypi`, `/npm`, `/go`, `/maven`, `/crates`, `/downloads`, `/github` y `/v2` |
| Política de caché | `no-store` estricto en navegador, CDN y peticiones upstream |
| Infraestructura adicional | Sin Cache API, KV, R2, D1, base de datos ni VPS |

El Worker es deliberadamente una capa transparente y de solo lectura. Metadatos, checksums, firmas, peticiones Range, ETags y Last-Modified siguen formando parte del protocolo upstream y no se copian a almacenamiento personal.

## Catálogo completo de repositorios

| Ecosistema | Source IDs |
| --- | --- |
| Debian / Ubuntu | `debian`, `debian-security`, `debian-ports`, `ubuntu`, `ubuntu-security`, `ubuntu-ports`, `ubuntu-releases` |
| Raspberry Pi | `raspbian`, `raspberrypi`, `raspberrypi-images` |
| OpenWrt / ImmortalWrt | `openwrt`, `openwrt-releases`, `openwrt-snapshots`, `openwrt-packages`, `openwrt-firmware`, `openwrt-sdk`, `immortalwrt`, `immortalwrt-releases`, `immortalwrt-snapshots` |
| Pacman / APK | `arch`, `archlinuxarm`, `alpine`, `msys2` |
| DNF / YUM / Zypper | `fedora`, `epel`, `centos-stream`, `rocky`, `almalinux`, `opensuse` |
| XBPS / pkg / Termux | `void`, `void-musl`, `freebsd-pkg`, `termux` |
| Conda | `anaconda`, `conda-forge` |

Todos los repositorios usan la misma ruta de máquina:

```text
https://YOUR_DOMAIN/repo/{source}/{upstream-path}
```

`GET /repo` devuelve el catálogo desplegado en JSON con IDs canónicos, aliases, upstreams y URLs completas. También se aceptan aliases como `debian-archive`, `ubuntu-archive`, `raspi`, `archlinux`, `fedora-epel`, `centos`, `rockylinux`, `alma`, `freebsd` y `conda-defaults`.

## Mapa de rutas canónicas

| Ruta canónica | Función | Ruta compatible |
| --- | --- | --- |
| `/repo/{source}/...` | Repositorios fijos de sistemas | Namespace nuevo |
| `/pkg/npm/...` | npm registry | `/npm/...` |
| `/pkg/nuget/v3/index.json` | NuGet v3 de solo lectura y su cadena de recursos | Namespace nuevo |
| `/sdk/node/...` | Árbol de releases de Node.js | `/downloads/node/...` |
| `/sdk/flutter/...` | Metadata de Flutter SDK y storage root | Namespace nuevo |
| `/oci/docker/v2/...` | Docker Registry v2 API | `/v2/...`, `/docker/...` |
| `/git/github/...` | Git, raw files y releases de GitHub | `/github/...` |

El adaptador NuGet reescribe toda la cadena v3 hacia EdgeMirror y elimina capacidades de publicación. Flutter reescribe metadata y storage URLs al dominio desplegado. Los adaptadores de Docker, npm y otros protocolos también corrigen tokens, redirects y URLs de artefactos.

## Catalog y generador de configuración

Abre `/catalog` para usar la interfaz completa:

- Busca las 35 fuentes por distribución, gestor de paquetes, ruta o upstream.
- Filtra APT, OpenWrt, RPM, Pacman/APK y otros grupos.
- Genera configuración exacta para los 48 targets usando el dominio desplegado.
- Muestra solamente los campos de versión, arquitectura y componentes necesarios.
- Copia comandos, abre la ruta seleccionada o ejecuta una prueba `HEAD` real.
- Funciona en escritorio y móvil en English, Español y 中文.

La interfaz usa el endpoint JSON de solo lectura:

```text
GET /catalog/config?id=debian&origin=https://YOUR_DOMAIN&version=bookworm&components=main%20contrib
```

El endpoint valida dominio, target, versión, arquitectura y componentes. Solo acepta `GET`, `HEAD` y `OPTIONS`.

La selección de OpenWrt es automática:

```text
OpenWrt 24.10 y anteriores -> OPKG -> /etc/opkg/distfeeds.conf
OpenWrt 25.12 y posteriores -> APK  -> /etc/apk/repositories.d/distfeeds.list
```

## Despliegue en Cloudflare Workers

Usa el botón de Cloudflare al principio del README o abre:

```text
https://deploy.workers.cloudflare.com/?url=https://github.com/tianrking/edgemirror
```

Cloudflare lee `wrangler.toml`, crea el Worker y lo despliega con el nombre indicado por la cuenta. La configuración portable activa `workers.dev`, desactiva preview URLs y no vincula el dominio personal del mantenedor.

El deployment verificado del mantenedor es `https://box.w0x7ce.eu`. Los forks personales pueden usar el hostname `workers.dev` que devuelve Wrangler o añadir su propio custom domain.

Para desplegar desde una copia local autenticada:

```bash
npm install
npm run verify
npm run deploy:cloudflare
```

Después del despliegue puedes añadir un custom domain en Cloudflare sin cambiar el modelo de rutas.

## Despliegue en Vercel

Vercel usa `api/index.js` como Web Handler y `vercel.json` para dirigir todas las rutas a la misma función:

```text
https://vercel.com/new/clone?repository-url=https://github.com/tianrking/edgemirror
```

## Ejemplos

APT Debian:

```text
deb https://YOUR_DOMAIN/repo/debian bookworm main contrib non-free-firmware
deb https://YOUR_DOMAIN/repo/debian-security bookworm-security main contrib non-free-firmware
```

OpenWrt:

```bash
# 25.12 o posterior
sed -i 's#https://downloads.openwrt.org/#https://YOUR_DOMAIN/repo/openwrt/#g' /etc/apk/repositories.d/distfeeds.list
apk update

# 24.10 o anterior
sed -i 's#https://downloads.openwrt.org/#https://YOUR_DOMAIN/repo/openwrt/#g' /etc/opkg/distfeeds.conf
opkg update
```

Developer y SDK:

```bash
pip install numpy -i https://YOUR_DOMAIN/pypi/simple/
export HF_ENDPOINT=https://YOUR_DOMAIN/hf
huggingface-cli download gpt2
git clone https://YOUR_DOMAIN/github/vercel/next.js.git
docker pull YOUR_DOMAIN/library/nginx:latest
npm install lodash --registry=https://YOUR_DOMAIN/pkg/npm/
dotnet nuget add source https://YOUR_DOMAIN/pkg/nuget/v3/index.json --name EdgeMirror
go env -w GOPROXY=https://YOUR_DOMAIN/go,direct
curl -L -O "https://YOUR_DOMAIN/downloads/node/v22.11.0/node-v22.11.0-x64.msi"
```

## Desarrollo local

```bash
npm install
npm run verify
npm run dev
```

| Comando | Función |
| --- | --- |
| `npm run check` | Comprueba la sintaxis de todos los archivos JavaScript |
| `npm run smoke:repositories` | Verifica 35 mappings, aliases, métodos, headers y no-store |
| `npm run smoke:repositories:live` | Prueba upstreams oficiales representativos |
| `npm run smoke:canonical` | Verifica npm, NuGet, SDK, OCI y Git con upstreams controlados |
| `npm run smoke:canonical:live` | Prueba rutas canónicas contra servicios oficiales reales |
| `npm run smoke:catalog` | Verifica 48 targets, el límite OpenWrt, validación y UI |
| `npm run smoke:vercel` | Verifica el entrypoint y las rutas de Vercel |
| `npm run verify` | Ejecuta todas las pruebas anteriores y `npm audit` |
| `npm run deploy:cloudflare` | Despliega el Worker con Wrangler |

## Estructura del proyecto

```text
api/index.js                  Entrada Vercel Web Handler
REPOSITORIES.md               IDs, rutas y recetas de gestores de paquetes
scripts/smoke-*.mjs           Pruebas de repositorios, rutas, Catalog y upstreams
src/index.js                  Router principal y health checks
src/proxy-utils.js            CORS, redirects, headers y helpers de proxy
src/repositories/             Catálogo fijo y generador validado
src/tools/catalog.js          Catalog UI y endpoint de configuración
src/tools/repositories.js     Gateway de repositorios
src/tools/nuget.js            Adaptador NuGet v3 de solo lectura
src/tools/sdks.js             Rutas canónicas de Node.js y Flutter
wrangler.toml                 Configuración portable de Cloudflare Workers
vercel.json                   Routing de Vercel
```

## Política de producción

- Mantén `npm run verify` en verde antes de desplegar.
- `/catalog` es la interfaz humana; `/repo`, `/pkg` y `/sdk` son APIs de máquina.
- Los endpoints de repositorio y configuración solo aceptan `GET`, `HEAD` y `OPTIONS`.
- Navegador, CDN y upstream usan `no-store`; esta versión no habilita caché pública.
- Se conservan Range, ETag, Last-Modified, Content-Range, checksums y firmas upstream.
- Los límites, autenticación y términos de cada servicio upstream siguen aplicando.

## Notas

- La experiencia publica recomendada usa un solo dominio y rutas.
- Los nombres de herramientas se mantienen en ingles.
- Todas las paginas incluyen un selector compartido para English, Español y 中文. Los nombres de herramientas se mantienen en ingles, mientras que explicaciones, notas de uso y etiquetas comunes siguen el idioma seleccionado.
- El deployment no necesita Cache API, KV, R2, D1, base de datos ni VPS.
