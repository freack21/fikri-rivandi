import { test } from "node:test";
import assert from "node:assert/strict";
import { provision, ProvisionError } from "./provision.mjs";

/** In-memory stand-in for the subset of the Coolify API that provision() uses. */
function fakeCoolify({ deployStatuses = ["in_progress", "finished"], status = 200, composeLoadsAfter = 0 } = {}) {
  // composeLoadsAfter: how many PATCHes with docker_compose_domains are rejected while Coolify's
  // background LoadComposeFile job has not stored docker_compose_raw yet (real Coolify behaviour).
  const state = { projects: [], apps: [], envs: {}, patches: [], calls: [], composeRejections: 0 };
  let statuses = [...deployStatuses];
  const json = (code, body) => new Response(JSON.stringify(body), { status: code, headers: { "content-type": "application/json" } });

  const fetchImpl = async (url, init) => {
    const { pathname, search } = new URL(url);
    const path = pathname.replace("/api/v1", "") + search;
    const body = init.body ? JSON.parse(init.body) : undefined;
    state.calls.push(`${init.method} ${path}`);
    assert.equal(init.headers.authorization, "Bearer token-1");
    if (status !== 200) return json(status, { message: "nope" });

    let m;
    if (init.method === "GET" && path === "/servers") return json(200, [{ uuid: "srv-x", name: "other" }, { uuid: "srv-1", name: "localhost" }]);
    if (init.method === "GET" && path === "/projects") return json(200, state.projects);
    if (init.method === "POST" && path === "/projects") {
      const project = { uuid: `prj-${state.projects.length + 1}`, name: body.name };
      state.projects.push(project);
      return json(201, { uuid: project.uuid });
    }
    if (init.method === "GET" && path === "/applications") return json(200, state.apps);
    if (init.method === "POST" && path === "/applications/public") {
      assert.equal(body.build_pack, "dockercompose");
      assert.equal(body.server_uuid, "srv-1");
      assert.equal(body.environment_name, "production");
      assert.equal(body.instant_deploy, false);
      state.lastAppBody = body;
      // Coolify stores the repository as "owner/name".
      const app = { uuid: `app-${state.apps.length + 1}`, name: body.name, git_repository: "freack21/fikri-rivandi" };
      state.apps.push(app);
      return json(201, { uuid: app.uuid });
    }
    if (init.method === "PATCH" && (m = /^\/applications\/([\w-]+)$/.exec(path))) {
      if (body.docker_compose_domains && state.composeRejections < composeLoadsAfter) {
        state.composeRejections += 1;
        return json(422, {
          message: "Validation failed.",
          errors: {
            docker_compose_domains:
              "Cannot set docker_compose_domains without docker_compose_raw. Reload the compose file from the git repository first.",
          },
        });
      }
      state.patches.push(body);
      return json(200, { uuid: m[1] });
    }
    if (init.method === "PATCH" && (m = /^\/applications\/([\w-]+)\/envs\/bulk$/.exec(path))) {
      state.envs[m[1]] = [...(state.envs[m[1]] || []), ...body.data];
      return json(201, body.data);
    }
    if (init.method === "GET" && path.startsWith("/deploy?")) return json(405, { message: "This endpoint has changed to a POST request." });
    if (init.method === "POST" && path.startsWith("/deploy?uuid=")) {
      statuses = [...deployStatuses];
      return json(200, { deployments: [{ deployment_uuid: "dep-1", resource_uuid: "app-1", message: "queued" }] });
    }
    if (init.method === "GET" && path === "/deployments/dep-1") return json(200, { status: statuses.shift() ?? "finished" });
    return json(404, { message: `no route ${init.method} ${path}` });
  };
  return { state, fetchImpl };
}

const base = { COOLIFY_URL: "http://coolify.test:8000/", COOLIFY_TOKEN: "token-1" };
const quiet = { log: () => {}, sleep: async () => {}, pollMs: 0 };

test("first run creates the project and app on neo-brutalism, sets the domain and deploys", async () => {
  const { state, fetchImpl } = fakeCoolify();
  const result = await provision({ ...base, APP_DOMAIN: "https://refandi.my.id/" }, { fetchImpl, ...quiet });

  assert.deepEqual(state.projects.map((p) => p.name), ["DIGISION-DEV"]);
  assert.equal(state.apps.length, 1);
  assert.equal(state.lastAppBody.name, "fikri-rivandi");
  assert.equal(state.lastAppBody.git_repository, "https://github.com/freack21/fikri-rivandi");
  assert.equal(state.lastAppBody.git_branch, "neo-brutalism");
  assert.equal(state.lastAppBody.docker_compose_location, "/docker-compose.yml");
  assert.deepEqual(state.lastAppBody.docker_compose_domains, [{ name: "web", domain: "https://refandi.my.id:8080" }]);
  assert.deepEqual(state.patches[0], {
    git_branch: "neo-brutalism",
    docker_compose_location: "/docker-compose.yml",
    docker_compose_domains: [{ name: "web", domain: "https://refandi.my.id:8080" }],
  });
  assert.equal(state.envs["app-1"], undefined, "no env vars without image overrides");
  assert.ok(state.calls.includes("POST /deploy?uuid=app-1&force=false"));
  assert.equal(result.url, "https://refandi.my.id");
  assert.deepEqual(result.deployment, { uuid: "dep-1", status: "finished" });
  assert.equal(result.webhookPath, "/api/v1/deploy?uuid=app-1&force=false");
});

test("re-running reuses the app and does not touch projects", async () => {
  const { state, fetchImpl } = fakeCoolify();
  const env = { ...base, APP_DOMAIN: "refandi.my.id", DEPLOY: "0" };
  await provision(env, { fetchImpl, ...quiet });
  const callsBefore = state.calls.length;
  const second = await provision(env, { fetchImpl, ...quiet });

  assert.equal(state.projects.length, 1);
  assert.equal(state.apps.length, 1);
  assert.equal(second.appUuid, "app-1");
  assert.ok(!state.calls.slice(callsBefore).some((c) => c.includes("/projects") || c.includes("/applications/public")));
});

test("DEPLOY=0 configures without deploying", async () => {
  const { state, fetchImpl } = fakeCoolify();
  const result = await provision({ ...base, DEPLOY: "0" }, { fetchImpl, ...quiet });
  assert.equal(result.deployment, null);
  assert.equal(result.url, null);
  assert.ok(!state.patches[0].docker_compose_domains, "no domain means a Coolify-generated one");
  assert.ok(!state.calls.some((c) => c.includes("/deploy?")));
});

test("image overrides are stored as env vars and a custom branch is applied", async () => {
  const { state, fetchImpl } = fakeCoolify();
  await provision(
    {
      ...base,
      GIT_BRANCH: "master",
      NODE_IMAGE: "mirror.gcr.io/library/node:22-alpine",
      NGINX_IMAGE: "mirror.gcr.io/library/nginx:stable-alpine",
      DEPLOY: "0",
    },
    { fetchImpl, ...quiet },
  );
  assert.equal(state.lastAppBody.git_branch, "master");
  assert.equal(state.patches[0].git_branch, "master");
  assert.deepEqual(
    state.envs["app-1"].map(({ key, value, is_preview }) => [key, value, is_preview]),
    [
      ["NODE_IMAGE", "mirror.gcr.io/library/node:22-alpine", false],
      ["NGINX_IMAGE", "mirror.gcr.io/library/nginx:stable-alpine", false],
    ],
  );
});

test("a failed deployment is reported", async () => {
  const { fetchImpl } = fakeCoolify({ deployStatuses: ["in_progress", "failed"] });
  await assert.rejects(provision(base, { fetchImpl, ...quiet }), (err) => err instanceof ProvisionError && /status "failed"/.test(err.message));
});

test("a deployment that never finishes times out", async () => {
  const { fetchImpl } = fakeCoolify({ deployStatuses: Array(1000).fill("in_progress") });
  await assert.rejects(provision(base, { fetchImpl, ...quiet, timeoutMs: -1 }), /still "queued"/);
});

test("API access errors explain how to fix them", async () => {
  const { fetchImpl } = fakeCoolify({ status: 403 });
  await assert.rejects(provision(base, { fetchImpl, ...quiet }), /Coolify says: "nope".*API access must be Enabled/);
  await assert.rejects(
    provision({ ...base, COOLIFY_SOURCE_HINT: "10.0.1.0/24" }, { fetchImpl, ...quiet }),
    /Docker network 10\.0\.1\.0\/24, so Allowed IPs must include it/,
  );
  const unauthorized = fakeCoolify({ status: 401 });
  await assert.rejects(provision(base, { fetchImpl: unauthorized.fetchImpl, ...quiet }), /rejected the API token \(401\)/);
  await assert.rejects(provision({ COOLIFY_URL: "", COOLIFY_TOKEN: "" }, quiet), /required/);
  const offline = async () => {
    throw Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNREFUSED" } });
  };
  await assert.rejects(provision(base, { fetchImpl: offline, ...quiet }), /Cannot reach Coolify.*ECONNREFUSED/);
});

test("a new application goes into an existing project chosen by name", async () => {
  const { state, fetchImpl } = fakeCoolify();
  state.projects.push({ uuid: "prj-existing", name: "Team Apps" });
  await provision({ ...base, PROJECT_NAME: "Team Apps", DEPLOY: "0" }, { fetchImpl, ...quiet });
  assert.equal(state.projects.length, 1);
  assert.equal(state.lastAppBody.project_uuid, "prj-existing");
});

test("an app with the same name but another repository is not reused", async () => {
  const { state, fetchImpl } = fakeCoolify();
  state.apps.push({ uuid: "app-other", name: "fikri-rivandi", git_repository: "someone/else" });
  const result = await provision({ ...base, DEPLOY: "0" }, { fetchImpl, ...quiet });
  assert.notEqual(result.appUuid, "app-other");
  assert.equal(state.apps.length, 2);
});

test("waits for Coolify to load the compose file before setting the domain", async () => {
  const { state, fetchImpl } = fakeCoolify({ composeLoadsAfter: 3 });
  const lines = [];
  const result = await provision({ ...base, APP_DOMAIN: "refandi.my.id" }, { fetchImpl, ...quiet, log: (l) => lines.push(l) });
  assert.equal(state.composeRejections, 3);
  assert.deepEqual(state.patches[0].docker_compose_domains, [{ name: "web", domain: "https://refandi.my.id:8080" }]);
  assert.equal(lines.filter((l) => l.includes("waiting for Coolify to load")).length, 1);
  assert.equal(result.deployment.status, "finished");
});

test("gives up with instructions when the compose file never loads", async () => {
  const { state, fetchImpl } = fakeCoolify({ composeLoadsAfter: Infinity });
  await assert.rejects(
    provision({ ...base, APP_DOMAIN: "refandi.my.id" }, { fetchImpl, ...quiet, composeWaitMs: -1 }),
    /has not loaded \/docker-compose\.yml.*Reload Compose File/,
  );
  assert.ok(!state.calls.some((c) => c.includes("/deploy?")), "nothing is deployed without a domain");
});

test("other validation errors show Coolify's field errors", async () => {
  const { fetchImpl } = fakeCoolify();
  const failing = async (url, init) =>
    init.method === "PATCH"
      ? new Response(JSON.stringify({ message: "Validation failed.", errors: { git_branch: "bad branch" } }), { status: 422 })
      : fetchImpl(url, init);
  await assert.rejects(provision(base, { fetchImpl: failing, ...quiet }), /HTTP 422: Validation failed\. \{"git_branch":"bad branch"\}/);
});
