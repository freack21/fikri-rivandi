// Provisions the fikri-rivandi portfolio on a Coolify v4 instance through its REST API, then deploys it.
// Safe to re-run: it reuses the project and application it finds by name and repository.
//
// Required env:
//   COOLIFY_URL     Coolify base URL, e.g. http://127.0.0.1:8000
//   COOLIFY_TOKEN   API token with the "root" permission (or read + write + deploy)
// Optional env:
//   APP_DOMAIN      Public domain for the site, e.g. refandi.my.id (empty = Coolify-generated domain)
//   GIT_REPOSITORY  default https://github.com/freack21/fikri-rivandi
//   GIT_BRANCH      default neo-brutalism
//   PROJECT_NAME    project for a new application, default DIGISION-DEV
//   APP_NAME        default fikri-rivandi
//   SERVER_UUID     default: the "localhost" server, else the first server
//   NODE_IMAGE      build image override (e.g. mirror.gcr.io/library/node:22-alpine)
//   NGINX_IMAGE     runtime image override (e.g. mirror.gcr.io/library/nginx:stable-alpine)
//   DEPLOY          set to 0 to configure without deploying
//
// The site is static (nginx serving the Vite build), so there are no secrets, volumes or scheduled tasks.

export const COMPOSE_SERVICE = "web";
export const CONTAINER_PORT = 8080;
const DEFAULTS = {
  repository: "https://github.com/freack21/fikri-rivandi",
  branch: "neo-brutalism",
  project: "DIGISION-DEV",
  appName: "fikri-rivandi",
};
const DONE_STATUSES = new Set(["finished", "failed", "cancelled-by-user", "cancelled"]);
const COMPOSE_LOAD_WAIT_MS = 30 * 1000;

// Coolify loads docker-compose.yml from Git in a background job after the app is created, and rejects
// docker_compose_domains until that job has stored docker_compose_raw.
const isComposeNotLoaded = (err) =>
  err instanceof ProvisionError && err.status === 422 && JSON.stringify(err.data?.errors ?? "").includes("docker_compose_raw");

export class ProvisionError extends Error {}

function createClient({ baseUrl, token, fetchImpl, sourceHint }) {
  const root = `${baseUrl.replace(/\/+$/, "")}/api/v1`;
  return async function request(method, path, body) {
    let res;
    try {
      res = await fetchImpl(root + path, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          accept: "application/json",
          ...(body !== undefined && { "content-type": "application/json" }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      throw new ProvisionError(
        `Cannot reach Coolify at ${baseUrl} (${err.cause?.code || err.cause?.errors?.[0]?.code || err.cause?.message || err.message}). Is COOLIFY_URL correct?`,
      );
    }
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (res.status === 401) throw new ProvisionError("Coolify rejected the API token (401). Create a new token and try again.");
    if (res.status === 403) {
      const reason = typeof data === "object" && data?.message ? ` Coolify says: "${data.message}".` : "";
      const network = sourceHint
        ? ` Requests from this script reach Coolify through the Docker network ${sourceHint}, so Allowed IPs must include it (or be left empty).`
        : "";
      throw new ProvisionError(
        `Coolify refused the request (403).${reason} Check Settings > Advanced: API access must be Enabled and Allowed IPs must include the caller.${network} The token needs the root permission.`,
      );
    }
    if (!res.ok) {
      let detail = text;
      if (typeof data === "object" && data) {
        const errors = data.errors && Object.keys(data.errors).length ? ` ${JSON.stringify(data.errors)}` : "";
        detail = data.message ? `${data.message}${errors}` : JSON.stringify(data);
      }
      throw Object.assign(new ProvisionError(`${method} ${path} failed with HTTP ${res.status}: ${detail}`), { status: res.status, data });
    }
    return data;
  };
}

function pickServer(servers, wanted) {
  if (!Array.isArray(servers) || servers.length === 0) throw new ProvisionError("Coolify has no servers yet. Finish the onboarding first.");
  if (wanted) {
    const server = servers.find((s) => s.uuid === wanted);
    if (!server) throw new ProvisionError(`SERVER_UUID ${wanted} not found. Available: ${servers.map((s) => `${s.name} (${s.uuid})`).join(", ")}`);
    return server;
  }
  return servers.find((s) => s.name === "localhost") ?? servers[0];
}

// "https://github.com/Owner/Repo.git" and "Owner/Repo" both become "owner/repo".
const repoSlug = (url) =>
  String(url || "")
    .trim()
    .replace(/\.git$/, "")
    .replace(/\/+$/, "")
    .replace(/^(?:https?:\/\/|git@)?github\.com[/:]/i, "")
    .toLowerCase();

/**
 * @returns {Promise<{ appUuid: string, url: string|null, webhookPath: string, deployment: object|null }>}
 */
export async function provision(
  env,
  { fetchImpl = fetch, log = console.log, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), pollMs = 5000, timeoutMs = 20 * 60 * 1000, composeWaitMs = COMPOSE_LOAD_WAIT_MS } = {},
) {
  if (!env.COOLIFY_URL || !env.COOLIFY_TOKEN) throw new ProvisionError("COOLIFY_URL and COOLIFY_TOKEN are required.");
  const request = createClient({ baseUrl: env.COOLIFY_URL, token: env.COOLIFY_TOKEN, fetchImpl, sourceHint: env.COOLIFY_SOURCE_HINT });
  const repo = env.GIT_REPOSITORY || DEFAULTS.repository;
  const branch = env.GIT_BRANCH || DEFAULTS.branch;
  const projectName = env.PROJECT_NAME || DEFAULTS.project;
  const appName = env.APP_NAME || DEFAULTS.appName;
  const domain = (env.APP_DOMAIN || "").trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  const composeDomains = domain ? [{ name: COMPOSE_SERVICE, domain: `https://${domain}:${CONTAINER_PORT}` }] : null;

  log("• Checking API access…");
  const server = pickServer(await request("GET", "/servers"), env.SERVER_UUID);
  log(`  server: ${server.name} (${server.uuid})`);

  log("• Application…");
  const apps = await request("GET", "/applications");
  let app = (apps || []).find((a) => a.name === appName && repoSlug(a.git_repository) === repoSlug(repo));
  if (!app) {
    // The project only matters when creating the app; an existing app stays wherever it lives.
    const projects = await request("GET", "/projects");
    let project = (projects || []).find((p) => p.name === projectName);
    if (!project) {
      project = await request("POST", "/projects", { name: projectName, description: "DIGISION development apps" });
      log(`  created project ${projectName}`);
    } else {
      log(`  using project ${projectName}`);
    }
    app = await request("POST", "/applications/public", {
      project_uuid: project.uuid,
      server_uuid: server.uuid,
      environment_name: "production",
      git_repository: repo,
      git_branch: branch,
      build_pack: "dockercompose",
      docker_compose_location: "/docker-compose.yml",
      ...(composeDomains && { docker_compose_domains: composeDomains }),
      name: appName,
      description: "Fikri Rivandi portfolio (static React SPA served by nginx)",
      instant_deploy: false,
    });
    log(`  created application ${appName} (${app.uuid}) in project ${projectName}`);
  } else {
    log(`  using existing application ${appName} (${app.uuid})`);
  }

  const deploy = async (label) => {
    log(label);
    const queued = await request("POST", `/deploy?uuid=${app.uuid}&force=false`);
    const deploymentUuid = queued?.deployments?.[0]?.deployment_uuid;
    if (!deploymentUuid) throw new ProvisionError(`Coolify did not start a deployment: ${JSON.stringify(queued)}`);
    let status = "queued";
    const deadline = Date.now() + timeoutMs;
    while (!DONE_STATUSES.has(status)) {
      if (Date.now() > deadline) throw new ProvisionError(`Deployment ${deploymentUuid} is still "${status}"; check it in the Coolify dashboard.`);
      await sleep(pollMs);
      const deployment = await request("GET", `/deployments/${deploymentUuid}`);
      if (deployment?.status && deployment.status !== status) log(`  status: ${deployment.status}`);
      status = deployment?.status ?? status;
    }
    if (status !== "finished") {
      throw new ProvisionError(
        `Deployment ${deploymentUuid} ended with status "${status}". Open the application's Deployments tab in Coolify for the build log.`,
      );
    }
    return { uuid: deploymentUuid, status };
  };

  // PATCHes the app, waiting while Coolify still rejects docker_compose_domains because its background
  // job has not loaded the compose file. Returns false if it is still not loaded after `waitMs`.
  const patchApp = async (body, waitMs) => {
    const until = Date.now() + waitMs;
    for (let waiting = false; ; waiting = true) {
      try {
        await request("PATCH", `/applications/${app.uuid}`, body);
        return true;
      } catch (err) {
        if (!isComposeNotLoaded(err)) throw err;
        if (Date.now() > until) return false;
        if (!waiting) log("  waiting for Coolify to load /docker-compose.yml from Git…");
        await sleep(pollMs);
      }
    }
  };

  log("• Environment variables…");
  const envs = [];
  if (env.NODE_IMAGE) envs.push({ key: "NODE_IMAGE", value: env.NODE_IMAGE });
  if (env.NGINX_IMAGE) envs.push({ key: "NGINX_IMAGE", value: env.NGINX_IMAGE });
  if (envs.length) {
    await request("PATCH", `/applications/${app.uuid}/envs/bulk`, { data: envs.map((e) => ({ is_preview: false, ...e })) });
    log(`  set ${envs.map((e) => e.key).join(", ")}`);
  } else {
    log("  nothing to change");
  }

  log("• Compose settings…");
  const settings = { git_branch: branch, docker_compose_location: "/docker-compose.yml" };
  // The port is the container port Traefik routes to; visitors still use https://<domain>.
  const withDomain = composeDomains ? { ...settings, docker_compose_domains: composeDomains } : settings;
  const result = {
    appUuid: app.uuid,
    url: domain ? `https://${domain}` : null,
    webhookPath: `/api/v1/deploy?uuid=${app.uuid}&force=false`,
    deployment: null,
  };

  if (!(await patchApp(withDomain, composeWaitMs))) {
    // Coolify's background compose loader did not finish (it can fail silently). A deployment loads the
    // compose file itself and logs any error, so deploy once without the domain, then attach it.
    await patchApp(settings, 0);
    if (env.DEPLOY === "0") {
      throw new ProvisionError(
        `Coolify has not loaded /docker-compose.yml for ${appName} yet. Run again without DEPLOY=0, or click "Reload Compose File" in Coolify.`,
      );
    }
    await deploy("  compose file not loaded yet: running a first deployment to load it…");
    if (!(await patchApp(withDomain, composeWaitMs))) {
      throw new ProvisionError(
        `Coolify still has no compose file for ${appName} after a successful deployment. Open the application in Coolify, click "Reload Compose File", then run this again.`,
      );
    }
  }
  log(`  compose file /docker-compose.yml, branch ${branch}${domain ? `, domain https://${domain}` : ""}`);

  if (env.DEPLOY === "0") return result;
  result.deployment = await deploy("• Deploying (the first build takes a few minutes)…");
  return result;
}

async function main() {
  try {
    const result = await provision(process.env);
    console.log("\n✅ fikri-rivandi is configured" + (result.deployment ? " and deployed." : "."));
    if (result.url) console.log(`   Site:        ${result.url}  (health: ${result.url}/healthz)`);
    else console.log("   Site:        see the generated domain on the application page in Coolify");
    console.log(`   Deploy webhook (GitHub secret COOLIFY_DEPLOY_WEBHOOK): https://coolify.digision.dev${result.webhookPath}`);
  } catch (err) {
    console.error(`\n❌ ${err instanceof ProvisionError ? err.message : err.stack}`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
