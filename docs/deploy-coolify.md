# Deploying with Docker and Coolify

The portfolio is deployed to the shared DIGISION [Coolify](https://coolify.io) instance at `https://coolify.digision.dev`. Coolify builds the site from GitHub with Docker, serves it behind its Traefik proxy with HTTPS, and redeploys it when CI passes.

**What gets deployed:** the `neo-brutalism` branch of `https://github.com/freack21/fikri-rivandi`, built by the Coolify **Docker Compose** build pack from `/docker-compose.yml`, in the Coolify project **DIGISION-DEV** (environment `production`).

The site is static: a multi-stage `Dockerfile` builds the Vite app with Node and serves `dist/` with an unprivileged nginx on container port **8080**. There is no database, no volume and no secret in the app itself.

| Step | Who | Time |
| --- | --- | --- |
| 1. Check the server | `setup.sh check` | 1 min |
| 2. Point the domain at the server | you, in Cloudflare | 2 min |
| 3. Create a Coolify API token | you, in the Coolify dashboard | 2 min |
| 4. Create and deploy the app | `setup.sh deploy` | 3–5 min |
| 5. Deploy automatically after CI passes | you, in GitHub | 3 min |

Coolify is already installed on the DIGISION server, so `setup.sh install` only prints "already installed". MariaDB/MySQL and phpMyAdmin on the same host are left untouched.

## 1. Check the server

```bash
curl -fsSL https://raw.githubusercontent.com/freack21/fikri-rivandi/neo-brutalism/deploy/coolify/setup.sh -o setup.sh
sudo bash setup.sh check
```

The check is read-only: OS, architecture, CPU/RAM/disk, ports 80/443/8000/6001/6002 (owned by Coolify's proxy once it is installed) and the firewall.

## 2. Point the domain at the server

In Cloudflare, add a record for the site's domain (for example `refandi.my.id`):

| Type | Name | Value | Proxy |
| --- | --- | --- | --- |
| `A` | `@` (or the subdomain) | the server's public IP | Proxied (orange cloud) |

Set SSL/TLS mode to **Full (strict)**. If Let's Encrypt fails on the very first deploy, switch the record to **DNS only** (grey cloud), deploy, then turn the proxy back on.

The canonical, Open Graph and Twitter URLs in `index.html` and `public/sitemap.xml` point to `https://refandi.my.id/`. If the site is served from another domain, update them too.

## 3. Create a Coolify API token

In `https://coolify.digision.dev`:

1. **Settings → Advanced → API**: API access **Enabled**. Leave *Allowed IPs* empty, or include the `coolify` Docker network that `setup.sh` reports in a 403 error.
2. **Keys & Tokens → API tokens**: create a token named `setup` with the **root** permission and copy it.

Type the token only into the hidden prompt of `setup.sh`. Never paste it into a chat, an issue or a file in Git.

## 4. Create and deploy the app

```bash
sudo bash setup.sh deploy --domain refandi.my.id
```

The script asks for the Coolify API token (input hidden), then:

1. verifies that the domain points to the server or is proxied by Cloudflare;
2. downloads `deploy/coolify/provision.mjs` pinned to the current commit of `neo-brutalism` and runs it in a throwaway `node:22-alpine` container;
3. creates the application `fikri-rivandi` in project **DIGISION-DEV** (the project is created if missing; an existing app is reused and never moved);
4. sets branch `neo-brutalism`, compose file `/docker-compose.yml` and the domain `https://<domain>:8080` on the `web` service (`:8080` is the container port Traefik routes to; visitors use plain `https://<domain>`);
5. deploys with `POST /api/v1/deploy` and waits until the build finishes;
6. prints the site URL and the deploy webhook path.

The token and domain are saved to `/etc/fikri-rivandi/coolify.env` (root-only), so later runs are just `sudo bash setup.sh deploy`. Re-running is safe: it reuses the app and redeploys.

| Option | Purpose |
| --- | --- |
| `--domain <host>` | Site domain. Without it the first run asks; empty gives a temporary `sslip.io` domain |
| `--branch <name>` | Deploy another branch (default `neo-brutalism`) |
| `--project <name>` | Coolify project for a **new** app (default `DIGISION-DEV`) |
| `--mirror` | Build from `mirror.gcr.io` when Docker Hub answers `429 Too Many Requests` |
| `--reset` | Forget the saved token and domain |
| `--yes` | Skip confirmations |

Check the result from outside:

```bash
curl -fsS https://refandi.my.id/healthz
curl -fsSI https://refandi.my.id/works
```

Both should return `200`.

## 5. Deploy automatically after CI passes

`.github/workflows/ci.yml` runs on every push and pull request: lint, provisioner tests, the Vite build, `bash -n` + `shellcheck` for `setup.sh`, then a Docker build and a container smoke test (`/healthz`, `/`, `/works`, non-root user). For pushes to **`neo-brutalism`** only, the `deploy` job then calls the Coolify webhook.

1. Coolify → **Keys & Tokens → API tokens**: create a token with only the **deploy** permission (separate from the `setup` root token).
2. GitHub → repository **Settings → Secrets and variables → Actions**, add:
   - `COOLIFY_DEPLOY_WEBHOOK`: `https://coolify.digision.dev/api/v1/deploy?uuid=<uuid printed by setup.sh>&force=false`
   - `COOLIFY_TOKEN`: the deploy-only token.
3. Keep Coolify's own auto-deploy on push **off**, otherwise each push is deployed twice (and untested).

Without the secrets, the deploy job is skipped with a notice.

## Runtime details

| Item | Value |
| --- | --- |
| Compose service | `web` |
| Container port | `8080` (nginx, user `nginx` / uid 101) |
| Health check | `GET /healthz` → `200 ok` (also the Dockerfile `HEALTHCHECK`) |
| Routing | SPA fallback: unknown paths such as `/works` serve `index.html`; missing files return 404 |
| Caching | `/assets/*` (hashed) 1 year immutable; images, CV, favicon 7 days; `index.html` `no-cache` |
| Data | none: stateless, no volume. Scaling to more replicas is safe |

### Environment variables

Set under the application's **Environment Variables** in Coolify, then redeploy. `setup.sh deploy --mirror` sets both.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_IMAGE` | `node:22-alpine` | Build image. Use `mirror.gcr.io/library/node:22-alpine` on Docker Hub rate limits |
| `NGINX_IMAGE` | `nginx:stable-alpine` | Runtime image. Use `mirror.gcr.io/library/nginx:stable-alpine` on rate limits |

## Day-to-day operations

| Task | How |
| --- | --- |
| Update the site | Push to `neo-brutalism`; CI deploys when it is green |
| Redeploy by hand | Coolify → application → **Redeploy**, or `sudo bash setup.sh deploy` |
| Logs | Application → **Logs** (nginx access/error log) or **Deployments** (build log) |
| Roll back | Application → **Deployments** → redeploy an earlier commit, or revert on `neo-brutalism` |

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `setup.sh deploy`: `403 … API access must be Enabled` | Enable API access; empty *Allowed IPs* or add the `coolify` Docker network shown in the error; use a **root** token |
| `setup.sh deploy`: `401` | Token mistyped or deleted. Create a new one and run `sudo bash setup.sh deploy --reset` |
| `405 Method Not Allowed` on deploy | The deploy endpoint is `POST`, not `GET` (the script and CI already use `POST`) |
| Traefik `404 page not found` | The domain is not attached to the `web` service with its port. It must be `https://<domain>:8080`; re-run `setup.sh deploy --domain <domain>` |
| Build fails with `429 Too Many Requests` | `sudo bash setup.sh deploy --mirror` |
| HTTPS error / redirect loop | Cloudflare SSL/TLS must be **Full (strict)**; grey cloud for the first certificate if issuance fails |
| CI deploy: `Could not resolve host` | `COOLIFY_DEPLOY_WEBHOOK` must start with `https://coolify.digision.dev/` |
| Server runs an old `provision.mjs` | `setup.sh` already downloads it by commit SHA; push the fix to `neo-brutalism` first, then re-run |
| App sits in the wrong Coolify project | Existing apps are never moved. Move it in the Coolify UI (project gear icon) |
| Old images after an update | Hashed assets change names on every build; `index.html` is `no-cache`. If Cloudflare caches HTML, purge the cache |
