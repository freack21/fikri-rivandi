# Playbook: one-command Coolify deploys for any DIGISION project

**Audience:** an AI coding agent (or a developer) adding deploy tooling to a repository so it can be deployed to the shared DIGISION Coolify instance with one command on the server and automatically from CI afterwards.

**What you produce:** a `setup.sh` the user runs on the server, a Node provisioner that drives the Coolify API, a Dockerfile and compose file adapted to the project's stack, tests for the provisioner, a CI workflow and a human guide. The Coolify side is identical for every project; only the stack-specific parts change.

**Reference implementations** (read them before you start; copy the structure, adapt every project-specific value):

| Repository | Stack | Use it for |
| --- | --- | --- |
| [freack21/fikri-rivandi](https://github.com/freack21/fikri-rivandi/tree/neo-brutalism) (branch `neo-brutalism`) | Static Vite/React SPA served by nginx | **The most recent provisioner**: compose-load race fix, bootstrap deployment, Coolify error details. Start from this `provision.mjs` |
| [freack21/html-to-img](https://github.com/freack21/html-to-img) (branch `main`) | Node API + React SPA, SQLite on a volume | Generated secrets, admin bootstrap, scheduled tasks (backups), named volumes, proxy trust |

Files in `fikri-rivandi` (`neo-brutalism`):

| File | Role |
| --- | --- |
| `deploy/coolify/setup.sh` | Server helper: `check`, `install`, `deploy` |
| `deploy/coolify/provision.mjs` | Idempotent Coolify API provisioner (runs in a throwaway `node:22-alpine` container) |
| `deploy/coolify/provision.test.mjs` | `node:test` suite against a fake Coolify API that mimics real Coolify behaviour |
| `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `deploy/nginx/nginx.conf` | Image and Coolify "Docker Compose" build pack definition |
| `.github/workflows/ci.yml` | Lint, test, build, image build, container smoke test, deploy via webhook on the production branch |
| `docs/deploy-coolify.md` | Human guide |

---

## 1. Fixed facts about the DIGISION environment

Use these as they are. Don't ask the user for them.

| Item | Value |
| --- | --- |
| Coolify dashboard and public API | `https://coolify.digision.dev` (API base `https://coolify.digision.dev/api/v1`) |
| Coolify API from the server itself | `http://127.0.0.1:8000` (used by `setup.sh deploy`) |
| Coolify version | v4 (REST API under `/api/v1`, bearer token auth) |
| Coolify server | the default server named `localhost` |
| **Coolify project for every app** | **`DIGISION-DEV`**, environment `production` (created by the provisioner if missing) |
| DNS | Cloudflare, proxied records, SSL/TLS mode **Full (strict)** |
| Reverse proxy | Coolify's Traefik owns ports 80/443 |
| Other services on the host | MariaDB/MySQL on 3306, phpMyAdmin. Never touch them unless the user asks |
| GitHub Actions secrets for auto-deploy | `COOLIFY_DEPLOY_WEBHOOK`, `COOLIFY_TOKEN` (deploy-only token) |
| Reachability | `raw.githubusercontent.com` and `api.github.com` are reachable from the server; the repository must be **public** for `applications/public` and for `setup.sh` to download the provisioner |

Ask the user only for what is project-specific:

- the **domain** (e.g. `app.digision.dev` or the project's own domain on Cloudflare);
- the **branch to deploy** if it isn't the default branch (e.g. `neo-brutalism` instead of `main`);
- an **admin email**, only if the app bootstraps an admin;
- for **private repositories**: whether a Coolify GitHub App or deploy key exists (see 3.2).

## 2. Hard rules

1. **Secrets never go through the chat.** Never ask the user to paste a token, password or key into the conversation, never commit one. The Coolify token is typed into the hidden `read -s` prompt of `setup.sh` on the server, or stored by the user as a GitHub Actions secret. Generated passwords are printed once on the server terminal.
2. **Everything is idempotent.** Re-running `setup.sh deploy` reuses the project, app, env vars and scheduled tasks; it never duplicates them, resets admin passwords or wipes volumes.
3. **Project `DIGISION-DEV`.** New apps are created there; the project is created if missing. Existing apps are never moved.
4. **Deploy only tested code.** CI runs tests and builds the image; only green pushes to the production branch call the deploy webhook.
5. **Persistent data lives in named volumes or managed databases**, never only in the container filesystem.
6. **Don't touch what you don't own** on the server: other Coolify apps, MariaDB, Apache/Nginx, firewall rules. `setup.sh check` reports; it doesn't fix silently.
7. **Report honestly.** Never say "deployed" until the user's server run printed success and you verified the live URL from outside (section 7, step 9).

## 3. What to build in the target repository

```
deploy/coolify/setup.sh            # check | install | deploy  (bash, run on the server as root)
deploy/coolify/provision.mjs       # Coolify API provisioner (Node 22, no dependencies)
deploy/coolify/provision.test.mjs  # node:test against a fake Coolify API
Dockerfile                         # multi-stage, non-root, HEALTHCHECK
docker-compose.yml                 # Coolify "Docker Compose" build pack, SERVICE_URL_* magic var
.dockerignore
.github/workflows/ci.yml           # test, build image, smoke test, deploy via webhook
docs/deploy-coolify.md             # human guide for this project
```

Keep `provision.mjs` in Node even when the project isn't Node: it runs in `node:22-alpine` via `docker run`, so the server needs no Node install. Everything stack-specific lives in the Dockerfile, the compose file and the provisioner's config block.

### 3.1 Inspect the project first (decides everything else)

Read, don't guess:

| Look at | To decide |
| --- | --- |
| `package.json` (scripts, deps), `composer.json`, `requirements.txt`/`pyproject.toml`, `go.mod`, `Gemfile`, `bun.lockb`, `deno.json` | Stack, package manager, build and start commands |
| `.env.example`, config files, `process.env`/`env()`/`os.environ` usages | Env vars the app reads, which are secrets, which have defaults |
| Server entry point, `listen(...)`, framework config | Port and bind address |
| ORM/migration folders, SQLite files, upload dirs | Database and persistent storage needs |
| Cron files, queues, `schedule:run`, workers | Scheduled tasks or extra services |
| Existing `Dockerfile`, compose, CI | Reuse and extend instead of replacing |
| Lockfile platforms (e.g. `*-linux-x64-musl` entries) | Whether an Alpine (musl) build stage works or you need Debian slim |
| Hard-coded URLs (canonical, OG, sitemap, OpenAPI servers) | Whether they must match the deploy domain |

### 3.2 `provision.mjs` (the Coolify API part)

Start from the `fikri-rivandi` provisioner and edit only its config block and the optional sections. Config block:

```js
export const COMPOSE_SERVICE = "web";   // service name in docker-compose.yml
export const CONTAINER_PORT = 8080;     // port the app listens on inside the container
const DEFAULTS = {
  repository: "https://github.com/<owner>/<repo>",
  branch: "main",                       // the branch the user wants deployed
  project: "DIGISION-DEV",
  appName: "<repo>",
};
```

Flow (all calls `Authorization: Bearer $COOLIFY_TOKEN`, JSON):

1. `GET /servers` → the one named `localhost` (or `SERVER_UUID`).
2. `GET /applications` → find by name **and** repository slug (`owner/name`, compare case-insensitively, normalise `https://github.com/…`, `.git`, `git@github.com:`). If missing:
   - `GET /projects` → `DIGISION-DEV`, else `POST /projects { name, description }`;
   - create the app **with the compose settings in the create body**:
     `POST /applications/public { project_uuid, server_uuid, environment_name: "production", git_repository, git_branch, build_pack: "dockercompose", docker_compose_location: "/docker-compose.yml", docker_compose_domains: [{ name: COMPOSE_SERVICE, domain: "https://<domain>:<CONTAINER_PORT>" }], name, description, instant_deploy: false }`.
   - Private repositories: `POST /applications/private-github-app` (`github_app_uuid`) or `/applications/private-deploy-key` (`private_key_uuid`). Check `GET /github-apps` / `GET /security/keys`; ask the user only if neither exists. Confirm fields against https://coolify.io/docs/api-reference and cover them in tests.
3. Env vars the provisioner owns (generated secrets, admin bootstrap, image overrides): `PATCH /applications/{uuid}/envs/bulk { data: [{ key, value, is_preview: false, is_shown_once? }] }`. Generate secrets with `crypto.randomBytes`, set them **only when the app is created or has never run** (`GET /applications/{uuid}` status not `running*`), print them once **before** deploying.
4. Scheduled tasks if needed: `GET /applications/{uuid}/scheduled-tasks`, `POST` missing ones `{ name, command, frequency, container, enabled: true, timeout }`.
5. **Compose settings with the load-race handling** (see P14):
   - `PATCH /applications/{uuid} { git_branch, docker_compose_location, docker_compose_domains }`;
   - while it fails with **422** whose `errors` mention `docker_compose_raw`, wait `pollMs` and retry, up to ~30 s;
   - if still rejected: `PATCH` without `docker_compose_domains`, run one **bootstrap deployment** (it loads the compose file and logs any read error), then `PATCH` with the domain again (same retry). Skip the bootstrap and fail with instructions when `DEPLOY=0`.
6. Deploy: **`POST /deploy?uuid=<uuid>&force=false`** (never GET, P1), take `deployments[0].deployment_uuid`, poll `GET /deployments/{uuid}` until `finished | failed | cancelled*`, with a timeout. Anything but `finished` is an error pointing to the Deployments tab.
7. Print: site URL, health URL, credentials shown once, and the webhook `https://coolify.digision.dev/api/v1/deploy?uuid=<uuid>&force=false`.

Error handling (human-readable `ProvisionError`):

- network failure → "Cannot reach Coolify at …";
- 401 → "token rejected, create a new one";
- 403 → API access, Allowed IPs, the `coolify` Docker network subnet (`COOLIFY_SOURCE_HINT`) and the root permission;
- other errors → Coolify's `message` **plus `errors`** (P15). Attach `status` and `data` to the error object so callers can branch on them.

Every value is overridable via env: `GIT_REPOSITORY`, `GIT_BRANCH`, `PROJECT_NAME` (default `DIGISION-DEV`), `APP_NAME`, `APP_DOMAIN`, `SERVER_UUID`, image overrides (`NODE_IMAGE`, `NGINX_IMAGE`, `PYTHON_IMAGE`, …), `DEPLOY=0`.

**Databases.** Prefer (a) a second service with a named volume in the project's compose file. Use (b) a Coolify-managed database (`POST /databases/postgresql|mysql|redis` in `DIGISION-DEV`, found by name first) only when the user wants Coolify's DB backups; verify fields in the API reference and test them. Never reuse the host's MariaDB unless the user explicitly asks.

### 3.3 `setup.sh` (copy, then change the constants)

Commands and behaviour stay the same:

- **`check`** (read-only): OS, arch, CPU/RAM/disk, ports 80/443/8000/6001/6002 (owners via `ss`, `/dev/tcp` fallback when `ss` is missing), Coolify running, ufw hint, plus the project's own needs (disk for uploads, RAM for builds).
- **`install`**: `check`, confirm, official `https://cdn.coollabs.io/coolify/install.sh`. On the DIGISION server it prints "already installed".
- **`deploy`**:
  - read the token (hidden) and domain once; save them with `umask 077` to `/etc/<app>/coolify.env` **after** a successful run (so a failed first run asks again; say so in the docs);
  - DNS check: resolves to the server, or `curl -sSI` (**no `-f`**, P16) shows `server: cloudflare`; otherwise warn and confirm;
  - resolve the branch to a commit SHA via `api.github.com/repos/<o>/<r>/commits/<branch>` (`Accept: application/vnd.github.sha`) and download `raw.githubusercontent.com/<o>/<r>/<sha>/deploy/coolify/provision.mjs` (P3);
  - run it with `docker run --rm --network host -v "$WORKDIR:/w:ro" -e VAR … node:22-alpine node /w/provision.mjs`, values passed **by name** so the token never appears in `ps`; fall back to `mirror.gcr.io/library/node:22-alpine`;
  - keep the temp dir in a **global** for the EXIT trap (P4).

Change per project: `GITHUB_REPO`, `CONFIG` path, default `BRANCH`, help text (it is printed from the header comment with `sed -n '2,13p'`, keep the line range in sync), `-e` list and the `--mirror` image set, and extra flags (e.g. `--admin-email`) only when the app needs them. Keep `--domain --branch --project --mirror --reset --yes`.

### 3.4 `Dockerfile` and `docker-compose.yml`

Rules for every stack:

- Multi-stage: build stage, slim runtime stage. Base images via `ARG` (`NODE_IMAGE`, `NGINX_IMAGE`, `PYTHON_IMAGE`, …) so `--mirror` can switch to `mirror.gcr.io/library/...`.
- **Non-root** runtime. Create and `chown` writable data dirs in the image before `USER` (P13); keep application code root-owned and read-only.
- Listen on `0.0.0.0:<CONTAINER_PORT>`, `expose:` not `ports:`, Traefik routes.
- **`/healthz`** that checks real dependencies (DB), plus a Dockerfile `HEALTHCHECK` using a tool that exists in the runtime image (`wget` on Alpine/busybox, `node -e fetch(...)`, `curl` only if installed, `python -c urllib…`).
- Compose: `SERVICE_URL_<SERVICE>_<PORT>: /` so Coolify knows the routed port; if the app needs its public URL, pass it on and normalise it (P6).
- Proxy trust: trust `X-Forwarded-*` from the private Docker network only; trust `CF-Connecting-IP` only when the peer is in Cloudflare's ranges.
- `restart: unless-stopped`, `init: true`, graceful shutdown on SIGTERM (nginx: `STOPSIGNAL SIGQUIT`).
- One replica if state lives in the container (SQLite, in-memory limits). Say so in the docs.

Stack adaptation (pick the row, then follow the project's conventions):

| Stack | Build stage | Runtime | Port | Health | Notes |
| --- | --- | --- | --- | --- | --- |
| **Static SPA** (Vite/React/Vue/Svelte, CRA) | `node:22-alpine`: `npm ci`, `npm run build` | `nginx:stable-alpine` as user `nginx`, custom `nginx.conf` (pid and temp paths in `/tmp`) | 8080 | `location = /healthz { return 200 }`, `wget` HEALTHCHECK | SPA fallback `try_files $uri $uri/ /index.html`; `/assets` immutable 1 y, `index.html` `no-cache`; `absolute_redirect off` (P19); no IPv6 `listen` (P18); no volume. Reference: fikri-rivandi |
| Static site generator (Astro, Hugo, Eleventy, Docusaurus) | its build command | same nginx runtime | 8080 | same | Point `COPY` at its output dir (`dist`, `public`, `build`) |
| Node API / Express / Fastify | `npm ci` (+ `npm run build`) | `node:22-*-slim`, `npm ci --omit=dev`, `USER node` | 3000 | `/healthz` in the app, `node -e fetch` HEALTHCHECK | Debian slim if native modules ship glibc binaries |
| Node API + SPA (one service) | build web workspace in its own stage | API serves `dist` with SPA fallback | API port | app `/healthz` | Reference: html-to-img |
| Next.js | `next build` with `output: "standalone"` | `node server.js`, `HOSTNAME=0.0.0.0` | 3000 | route handler `/api/healthz` or `/healthz` rewrite | Copy `.next/standalone`, `.next/static`, `public` |
| Nuxt | `nuxt build` | `node .output/server/index.mjs` | 3000 | server route `/healthz` | `HOST=0.0.0.0` |
| Laravel (PHP) | `composer install --no-dev`, `npm run build` | `serversideup/php` (fpm-nginx) or FrankenPHP | 8080 | route `/healthz` checking DB | Volume for `storage/`; `php artisan migrate --force` on start; scheduled task `php artisan schedule:run` every minute; queue worker as a second compose service; `APP_KEY` generated once by the provisioner |
| Django / FastAPI | `pip install` (uv/poetry) in a builder | `gunicorn`/`uvicorn` on `0.0.0.0` as non-root | 8000 | `/healthz` | `migrate` + `collectstatic` on start; `SECRET_KEY` generated once; static via WhiteNoise or nginx |
| Go | `go build` in `golang:<ver>` | `distroless`/`alpine` static binary | 8080 | `/healthz`; distroless has no shell, use the binary's own `--healthcheck` flag | Tiny image |
| Bun / Deno | official image | `bun run` / `deno run` | 3000 | `/healthz` | Same rules |

**Use the `dockercompose` build pack** even for a single service, so volumes, health checks and env defaults stay in Git. Switch to `dockerfile`/`nixpacks` only if the user asks.

### 3.5 CI: `.github/workflows/ci.yml`

- On push to the production branch (and other long-lived branches) and on PRs: install, lint, `npm test` (or the stack's tests) **plus the provisioner tests**, build, `bash -n` + `shellcheck` on `setup.sh` (preinstalled on `ubuntu-latest`), `docker build`, then a **container smoke test**: run the image, wait for `/healthz`, request the main routes, assert the user is not root.
- Deploy job: `needs: test`, `if: github.event_name == 'push' && github.ref == 'refs/heads/<production branch>'`, `concurrency: deploy-production` (no cancel), `curl --fail-with-body --request POST --header "Authorization: Bearer $COOLIFY_TOKEN" "$COOLIFY_DEPLOY_WEBHOOK"`, skip with `::notice::` when the secrets are missing.
- Tell the user: deploy-only token for CI, separate from the root token; Coolify's own auto-deploy off.
- Note for your report: with missing secrets the deploy job shows "success" but was **skipped**. Report it as skipped.

### 3.6 Provisioner tests

The fake `fetchImpl` must behave like real Coolify, not just accept everything. At minimum:

- asserts the auth header and request bodies (create body includes `build_pack: "dockercompose"`, compose location and domains, `instant_deploy: false`);
- returns **405** for `GET /deploy` and **422 with `errors.docker_compose_domains` mentioning `docker_compose_raw`** for domain PATCHes until the compose file is "loaded" (configurable count; a deployment marks it loaded);
- covers: first run creates project + app and deploys; second run reuses everything and keeps secrets; `DEPLOY=0`; image overrides; waits through the 422s; bootstrap deployment when the compose never loads in the background (two deploys, domain patched in between); clear error if still not loaded after a deployment; failed deployment; deployment timeout; 401/403/offline messages; other 422s show field errors; existing project chosen by name; same-name app from another repo is not reused.

Wire them into `npm test` (`node --test "deploy/**/*.test.mjs"`) and CI. For non-Node projects, add a CI step `node --test deploy/coolify/*.test.mjs` with `actions/setup-node`.

## 4. Pitfalls we already hit (don't repeat them)

| # | Symptom | Cause | Fix |
| --- | --- | --- | --- |
| P1 | `405 Method Not Allowed` on deploy | `GET /api/v1/deploy` is rejected | `POST /api/v1/deploy?uuid=…&force=false` in the provisioner and CI |
| P2 | `403 You are not allowed to access the API` | API disabled or *Allowed IPs* excludes the caller | Enable API access; leave Allowed IPs empty or include the `coolify` Docker network (`COOLIFY_SOURCE_HINT`); root token for `setup.sh`, deploy token for CI |
| P3 | Server runs an old `provision.mjs` after a fix | `raw.githubusercontent.com` caches branch URLs | Download by commit SHA resolved via the GitHub API |
| P4 | EXIT trap removes nothing | trap referenced a `local` | Global temp dir variable |
| P5 | `check` crashes on minimal images | no `ss` | `/dev/tcp/127.0.0.1/<port>` fallback |
| P6 | Generated URLs contain `https://<domain>:<port>` | `SERVICE_URL_<NAME>_<PORT>` includes the container port | Drop the port from an https public URL when it equals the app's own port, or derive the origin from the request behind a trusted proxy |
| P7 | Traefik `404 page not found` | Domain not attached to the compose service or without the container port | `docker_compose_domains: [{ name: "<service>", domain: "https://<domain>:<port>" }]`, redeploy |
| P8 | Let's Encrypt fails / redirect loop | Cloudflare proxy during first issuance, or SSL mode Flexible | Grey cloud for the first certificate if needed, then orange cloud + Full (strict) |
| P9 | CI: `Could not resolve host` | Wrong Coolify hostname in the webhook | `https://coolify.digision.dev/...` |
| P10 | Build `429 Too Many Requests` | Docker Hub anonymous limit | Base image `ARG`s + `--mirror` (`mirror.gcr.io/library/...`) |
| P11 | App in the wrong project | Created before the default was `DIGISION-DEV`; apps are never moved | Create correctly; move old apps in the UI |
| P12 | Admin password reset on every deploy | Secrets set unconditionally | Only on create or when the app never ran |
| P13 | Volume permission denied | Non-root image, root-owned volume dir | `mkdir -p /data && chown <uid> /data` before `USER` |
| **P14** | `PATCH /applications/{uuid}` → **422 "Validation failed."** right after creating the app | Coolify loads `docker-compose.yml` in a **background job** (`LoadComposeFile`) after `POST /applications/public` with `instant_deploy:false`, and rejects `docker_compose_domains` until `docker_compose_raw` is stored. That job can also **fail silently**; there is no API endpoint to reload the compose file, and `docker_compose_raw` is only visible to tokens that may read secrets | Send compose location + domains in the create body; retry the PATCH on that specific 422 for ~30 s; if still rejected, PATCH without domains, run one bootstrap deployment (the deployment job loads the compose file itself and logs read errors), then attach the domain and deploy again |
| **P15** | Error says only "Validation failed." | Provisioner printed `message` and dropped `errors` | Always print `message` + `JSON.stringify(errors)`; keep `status`/`data` on the error |
| **P16** | DNS check says a Cloudflare-proxied domain "resolves to 104.21.x.x, not this server" | `curl -fsSI` fails on the 5xx Cloudflare returns while the origin is down or not yet moved, so the `server: cloudflare` header is never seen | `curl -sSI` without `-f`; Cloudflare IPs (`104.16.0.0/13`, `172.64.0.0/13`, …) mean "proxied, check the origin in Cloudflare" |
| **P17** | `created project DIGISION-DEV` although the user expected it to exist | No project with that exact name (case/whitespace) | Match exactly, report creation clearly, tell the user to check for near-duplicates |
| **P18** | nginx container exits: `socket() [::]:8080 failed (97: Address family not supported)` | Host/container without IPv6, `listen [::]:<port>` | Listen on IPv4 only; Traefik reaches the container over IPv4 |
| **P19** | Redirects (e.g. `/assets` → `/assets/`) point to `http://<domain>:8080/...` | nginx builds absolute redirects with its own port | `absolute_redirect off; port_in_redirect off;` |
| **P20** | `npm ci` inside `docker build` fails in the agent sandbox ("Exit handler never called", TLS errors) | The sandbox's egress proxy and CA are not available inside build containers | Not a Dockerfile bug. Verify the runtime stage with a locally built `dist`, or build a scratch copy with `--network host`, proxy build args and the sandbox CA (never commit that). CI's `docker build` is the real check |
| **P21** | Token asked again after a failed run | `setup.sh` saves token/domain only after a successful provision | Expected; document it |
| **P22** | Deploy job "success" but nothing deployed | Secrets missing, job skipped with a notice | Report as skipped until the secrets exist |

## 5. Procedure for the agent

1. **Inspect** the repository (section 3.1), the branch to deploy and its git state. Ask the user only for the project-specific facts in section 1.
2. **Make the app container-ready**: bind `0.0.0.0`, `/healthz`, public-URL normalisation (P6), proxy trust, graceful SIGTERM, all secrets from env.
3. **Write `Dockerfile`, `.dockerignore`, `docker-compose.yml`** (and `deploy/nginx/nginx.conf` for static sites) from the stack table.
4. **Copy and adapt `provision.mjs` + tests** from fikri-rivandi; port secret/admin/scheduled-task sections from html-to-img when the app needs them (keeping the P14/P15 handling).
5. **Copy and adapt `setup.sh`**; run `bash -n` and `shellcheck` (install with `pip install shellcheck-py` if missing).
6. **Write CI and `docs/deploy-coolify.md`** (adapt the fikri-rivandi guide: commands, domain, env table, data/backups, troubleshooting).
7. **Verify locally** and report each item honestly as passed / failed / skipped / blocked:
   - project lint/tests/build;
   - provisioner tests;
   - `setup.sh check` (read-only, safe in the sandbox) and `setup.sh help`;
   - Docker: start the daemon if possible (`dockerd &`), build the image (see P20), run it, check `/healthz`, main routes, non-root uid, `healthy` status, `docker compose config` and `docker compose up --no-build` with the built image, graceful stop.
8. **Commit** with Conventional Commits under the user's own Git identity (no AI attribution), logically grouped (image, provisioner, CI, docs), push to the branch the repository workflow requires, and check the first CI run.
9. **Hand off** the exact server commands (the user holds the token):

   ```bash
   curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/<branch>/deploy/coolify/setup.sh -o setup.sh
   sudo bash setup.sh check
   sudo bash setup.sh deploy --domain <domain>
   ```

   plus the Cloudflare record (A → server IP, proxied, Full (strict)), the two GitHub secrets (`COOLIFY_DEPLOY_WEBHOOK` = `https://coolify.digision.dev/api/v1/deploy?uuid=<uuid printed by the script>&force=false`, `COOLIFY_TOKEN` = deploy-only token) and "turn off Coolify auto-deploy".
10. **When the user pastes server output**: read errors literally. If the provisioner reports a Coolify error you don't recognise, read the Coolify source for the endpoint (`app/Http/Controllers/Api/*Controller.php`, `routes/api.php`, `app/Models/Application.php` on `coollabsio/coolify` branch `v4.x`) before changing code, fix the root cause in the provisioner **and** the fake API tests, push, and give the user one re-run command.
11. **Verify from outside** after success: `https://<domain>/healthz` 200, main routes 200, the HTML/JS is from the deployed commit, cache headers as designed, no `:<port>` in generated URLs, browser smoke test without console errors, CI deploy job green on the next push once secrets exist, the app in project **DIGISION-DEV**.

## 6. Done checklist

- [ ] `setup.sh check | install | deploy` exists, is idempotent and never echoes the token.
- [ ] `provision.mjs` creates or reuses the app in **DIGISION-DEV**, sends compose settings on create, handles the compose-load 422 with retry + bootstrap deployment, sets env vars/tasks, deploys with **POST** and waits.
- [ ] Coolify errors show `message` and `errors`.
- [ ] Provisioner tests mimic real Coolify (405, 422 compose race) and run in CI.
- [ ] Image is multi-stage, non-root, with `HEALTHCHECK` and `/healthz`; data in named volumes or a managed DB.
- [ ] Public URL normalisation (P6), proxy trust, no port in redirects (P19).
- [ ] CI smoke-tests the container and deploys only green pushes of the production branch through `https://coolify.digision.dev/api/v1/deploy`.
- [ ] `docs/deploy-coolify.md` covers setup, DNS, secrets, data/backups and troubleshooting for this project.
- [ ] Live site verified from outside.
- [ ] No secrets in Git, chat or logs.
