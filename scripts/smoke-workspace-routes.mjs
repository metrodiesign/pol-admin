import { once } from "node:events";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { assertPortAvailable } from "./lib/workspace-verification.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const servers = [];
let stopping = null;

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

function startServer(name, script, port) {
  const child = spawn(npmCommand, ["run", script], {
    cwd: repositoryRoot,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const server = { child, name, output: "", port, spawnError: null };
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

async function waitForServer(server, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  const url = `http://127.0.0.1:${server.port}/login`;

  while (Date.now() < deadline) {
    if (server.spawnError) throw server.spawnError;
    if (server.child.exitCode !== null) {
      throw new Error(`${server.name} exited before ready (${server.child.exitCode})\n${server.output}`);
    }
    try {
      await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(2_000) });
      return;
    } catch {
      await delay(100);
    }
  }

  throw new Error(`${server.name} did not become ready within ${timeoutMs}ms\n${server.output}`);
}

async function stopServer(server) {
  if (server.child.exitCode !== null) return;
  const exited = once(server.child, "exit");
  server.child.kill("SIGTERM");
  await Promise.race([exited, delay(5_000)]);
  if (server.child.exitCode === null) {
    server.child.kill("SIGKILL");
    await once(server.child, "exit");
  }
}

function stopServers() {
  if (!stopping) stopping = Promise.allSettled(servers.map(stopServer));
  return stopping;
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
    void stopServers().finally(() => process.exit(signal === "SIGINT" ? 130 : 143));
  });
}

try {
  await Promise.all([assertPortAvailable(3001), assertPortAvailable(3002)]);
  const admin = startServer("Admin", "start:admin", 3001);
  const merchant = startServer("Merchant", "start:merchant", 3002);
  await Promise.all([waitForServer(admin), waitForServer(merchant)]);

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
  await stopServers();
}
