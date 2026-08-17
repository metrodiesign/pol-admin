import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  signalExitCode,
  stopManagedServer,
  waitForManagedServer,
} from "./lib/workspace-process.mjs";
import { assertPortAvailable } from "./lib/workspace-verification.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const servers = [];
let cleanup = null;
let stopping = null;

function startServer(name, script, port) {
  const child = spawn(npmCommand, ["run", script], {
    cwd: repositoryRoot,
    detached: process.platform !== "win32",
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const server = {
    child,
    didClose: false,
    name,
    output: "",
    port,
    processGroupId: process.platform === "win32" ? null : child.pid,
    spawnError: null,
  };
  server.closedPromise = new Promise((resolveClose) => {
    child.once("close", (...result) => {
      server.didClose = true;
      resolveClose(result);
    });
  });
  const capture = (chunk) => {
    server.output = `${server.output}${chunk}`.slice(-20_000);
  };
  child.stdout.on("data", capture);
  child.stderr.on("data", capture);
  child.on("error", (error) => {
    server.spawnError = error;
  });
  servers.push(server);
  return server;
}

function stopServers() {
  if (!stopping) {
    stopping = Promise.allSettled(servers.map((server) => stopManagedServer(server))).then(
      (results) => {
        const failures = results
          .filter((result) => result.status === "rejected")
          .map((result) =>
            result.reason instanceof Error ? result.reason.message : String(result.reason),
          );
        if (failures.length > 0) throw new Error(failures.join("\n"));
      },
    );
  }
  return stopping;
}

function cleanupAndVerifyPorts() {
  if (!cleanup) {
    cleanup = stopServers().then(() =>
      Promise.all([assertPortAvailable(3001), assertPortAvailable(3002)]),
    );
  }
  return cleanup;
}

async function probe(name, url, assertion) {
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(5_000),
  });
  assertion(response);
  console.log(`${name}: ${response.status}`);
}

function assertRedirectToDashboard(response) {
  const location = response.headers.get("location");
  if (![307, 308].includes(response.status) || !location) {
    throw new Error(`Expected dashboard redirect, got ${response.status} ${location ?? "-"}`);
  }
  if (new URL(location, response.url).pathname !== "/dashboard") {
    throw new Error(`Expected redirect location /dashboard, got ${location}`);
  }
}

function assertStatus(expected) {
  return (response) => {
    if (response.status !== expected) {
      throw new Error(`Expected status ${expected}, got ${response.status} for ${response.url}`);
    }
  };
}

function assertNotFoundIsFalse(response) {
  if (response.status === 404) throw new Error(`Expected non-404 status for ${response.url}`);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    void cleanupAndVerifyPorts()
      .catch((error) => console.error(error instanceof Error ? error.message : error))
      .finally(() => process.exit(signalExitCode(signal)));
  });
}

try {
  await Promise.all([assertPortAvailable(3001), assertPortAvailable(3002)]);
  const admin = startServer("Admin", "start:admin", 3001);
  const merchant = startServer("Merchant", "start:merchant", 3002);
  await Promise.all([waitForManagedServer(admin), waitForManagedServer(merchant)]);

  await probe("Admin /", "http://127.0.0.1:3001/", assertRedirectToDashboard);
  await probe("Merchant /", "http://127.0.0.1:3002/", assertRedirectToDashboard);
  await probe(
    "Merchant /admin/user/list",
    "http://127.0.0.1:3002/admin/user/list",
    assertNotFoundIsFalse,
  );
  await probe("Admin /register", "http://127.0.0.1:3001/register", assertStatus(404));
  await probe(
    "Merchant /register",
    "http://127.0.0.1:3002/register",
    assertNotFoundIsFalse,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await cleanupAndVerifyPorts();
}
