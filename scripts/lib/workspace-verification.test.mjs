import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { createServer as createHttpsServer } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  signalExitCode,
  stopManagedServer,
  trackManagedProcessTree,
  waitForManagedServer,
} from "./workspace-process.mjs";

import {
  assertAdminRouteIdentity,
  assertPortAvailable,
  assertRequiredAdminRoutes,
  assertWorkspaceTopology,
  extractModuleSpecifiers,
  findActiveReferenceViolations,
  findBoundaryViolations,
  findTestPolicyViolations,
  forbiddenActiveReferences,
  normalizePageRoutes,
  pageRouteFingerprint,
} from "./workspace-verification.mjs";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

// active-reference-fixture:start
const REMOVED_ADMIN_PACKAGE = "@pol/admin";
const REMOVED_ADMIN_WORKSPACE = "apps/admin";
const REMOVED_MERCHANT_PACKAGE = "@pol/merchant";
const REMOVED_MERCHANT_WORKSPACE = "apps/merchant";
const REMOVED_DEV_ALIAS = "dev:admin";
const REMOVED_BUILD_ALIAS = "build:admin";
const REMOVED_START_ALIAS = "start:admin";
const REMOVED_TEST_ALIAS = "test:admin";
const RAW_FORBIDDEN_FIXTURES = [
  REMOVED_ADMIN_PACKAGE,
  REMOVED_ADMIN_WORKSPACE,
  REMOVED_MERCHANT_PACKAGE,
  REMOVED_MERCHANT_WORKSPACE,
  REMOVED_DEV_ALIAS,
  REMOVED_BUILD_ALIAS,
  REMOVED_START_ALIAS,
  REMOVED_TEST_ALIAS,
];
// active-reference-fixture:end

function validWorkspaceTopology() {
  const workspaces = ["packages/ui", "packages/shared"];
  return {
    lockfile: {
      packages: {
        "": { workspaces },
        "node_modules/@pol/shared": { link: true, resolved: "packages/shared" },
        "node_modules/@pol/ui": { link: true, resolved: "packages/ui" },
        "packages/shared": { name: "@pol/shared" },
        "packages/ui": { name: "@pol/ui" },
      },
    },
    rootManifest: { workspaces },
  };
}

test("REQ-3.3, REQ-5.5: topology guard ยอมรับ retained package workspaces เท่านั้น", () => {
  const { lockfile, rootManifest } = validWorkspaceTopology();
  assert.doesNotThrow(() => assertWorkspaceTopology(rootManifest, lockfile));
});

test("REQ-3.3, REQ-5.4 ถึง REQ-5.6: topology guard ปฏิเสธ wildcard และ removed app link", () => {
  const wildcard = validWorkspaceTopology();
  wildcard.rootManifest.workspaces = ["apps/*", "packages/*"];
  assert.throws(
    () => assertWorkspaceTopology(wildcard.rootManifest, wildcard.lockfile),
    /Root workspaces must equal/,
  );

  const removed = validWorkspaceTopology();
  removed.lockfile.packages[REMOVED_MERCHANT_WORKSPACE] = { name: REMOVED_MERCHANT_PACKAGE };
  removed.lockfile.packages[`node_modules/${REMOVED_MERCHANT_PACKAGE}`] = {
    link: true,
    resolved: REMOVED_MERCHANT_WORKSPACE,
  };
  assert.throws(
    () => assertWorkspaceTopology(removed.rootManifest, removed.lockfile),
    /Lockfile still resolves removed application workspace/,
  );
});

test("REQ-4.14: cleanup จบได้เมื่อ managed child exit พร้อม SIGKILL", async () => {
  const child = new EventEmitter();
  child.exitCode = null;
  child.kill = (signal) => {
    if (signal === "SIGKILL") {
      child.exitCode = 137;
      child.emit("exit", 137, signal);
      child.emit("close", 137, signal);
    }
    return true;
  };

  let timeout;
  try {
    await Promise.race([
      stopManagedServer({ child, name: "fixture" }, { gracefulTimeoutMs: 1 }),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error("cleanup did not settle")), 100);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
});

test("REQ-4.14: cleanup timeout คืน error พร้อม server, PID และ phase", async () => {
  const signals = [];
  let destroyedStreams = 0;
  const child = new EventEmitter();
  child.exitCode = null;
  child.pid = 42;
  child.stdout = { destroy: () => destroyedStreams++ };
  child.stderr = { destroy: () => destroyedStreams++ };
  child.kill = (signal) => {
    signals.push(signal);
    return true;
  };

  await assert.rejects(
    () =>
      stopManagedServer(
        { child, name: "fixture" },
        { forceTimeoutMs: 1, gracefulTimeoutMs: 1 },
      ),
    /fixture cleanup failed \(PID 42, phase SIGKILL\).*within 1ms/,
  );
  assert.deepEqual(signals, ["SIGTERM", "SIGKILL"]);
  assert.equal(destroyedStreams, 2);
});

test("F-2, F-3: process-tree tracking failure ต้องไม่รายงาน cleanup success", async () => {
  let destroyedStreams = 0;
  const trackingError = new Error("ps unavailable");
  const child = {
    exitCode: 0,
    pid: 42,
    stderr: { destroy: () => destroyedStreams++ },
    stdout: { destroy: () => destroyedStreams++ },
  };

  await assert.rejects(
    () =>
      stopManagedServer({
        child,
        didClose: true,
        name: "tracking fixture",
        processTreeTrackingError: trackingError,
      }),
    (error) => {
      assert.match(error.message, /tracking fixture cleanup failed .*phase process-tree/);
      assert.equal(error.cause, trackingError);
      return true;
    },
  );
  assert.equal(destroyedStreams, 2);
});

test("REQ-4.14: cleanup ปิด managed process group แม้ leader ปิดไปก่อน", async () => {
  if (process.platform === "win32") return;

  const descendantSource = `
    process.on("SIGTERM", () => {});
    console.log("ready");
    setInterval(() => {}, 1_000);
  `;
  const leaderSource = `
    const { spawn } = require("node:child_process");
    const descendant = spawn(process.execPath, ["-e", ${JSON.stringify(descendantSource)}], {
      stdio: ["ignore", "pipe", "ignore"],
    });
    descendant.stdout.once("data", () => {
      console.log(descendant.pid);
      descendant.stdout.destroy();
      descendant.unref();
    });
  `;
  const child = spawn(process.execPath, ["-e", leaderSource], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const server = {
    child,
    didClose: false,
    name: "orphan fixture",
    processGroupId: child.pid,
  };
  server.closedPromise = new Promise((resolveClose) => {
    child.once("close", (...result) => {
      server.didClose = true;
      resolveClose(result);
    });
  });

  try {
    await server.closedPromise;
    assert.equal(server.didClose, true);
    await stopManagedServer(server, { forceTimeoutMs: 1_000, gracefulTimeoutMs: 20 });
    assert.throws(
      () => process.kill(-child.pid, 0),
      (error) => error?.code === "ESRCH",
    );
  } finally {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch (error) {
      if (error?.code !== "ESRCH") throw error;
    }
  }
});

test("F-2, F-4, F-6: cleanup closes detached descendant after leader exits", async () => {
  if (process.platform === "win32") return;

  const descendantSource = `
    process.on("SIGTERM", () => process.exit(0));
    console.log("ready");
    setInterval(() => {}, 1_000);
  `;
  const leaderSource = `
    const { spawn } = require("node:child_process");
    const descendant = spawn(process.execPath, ["-e", ${JSON.stringify(descendantSource)}], {
      detached: true,
      stdio: ["ignore", "pipe", "ignore"],
    });
    descendant.stdout.once("data", () => {
      console.log(descendant.pid);
      descendant.stdout.destroy();
      descendant.unref();
      setTimeout(() => process.exit(0), 150);
    });
  `;
  const child = spawn(process.execPath, ["-e", leaderSource], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let descendantPid = null;
  let resolveDescendantReady;
  const descendantReady = new Promise((resolveReady) => {
    resolveDescendantReady = resolveReady;
  });
  child.stdout.on("data", (chunk) => {
    const match = String(chunk).match(/(\d+)/);
    if (match) {
      descendantPid = Number(match[1]);
      resolveDescendantReady(descendantPid);
    }
  });
  const server = {
    child,
    didClose: false,
    name: "detached descendant fixture",
    processGroupId: child.pid,
    processGroupIds: new Set([child.pid]),
  };
  server.closedPromise = new Promise((resolveClose) => {
    child.once("close", (...result) => {
      server.didClose = true;
      resolveClose(result);
    });
  });
  const stopTracking = trackManagedProcessTree(server, 5);

  try {
    await descendantReady;
    assert.ok(descendantPid);
    await server.closedPromise;
    assert.equal(server.didClose, true);
    assert.doesNotThrow(() => process.kill(descendantPid, 0));
    await stopManagedServer(server, { forceTimeoutMs: 1_000, gracefulTimeoutMs: 20 });
    assert.throws(
      () => process.kill(descendantPid, 0),
      (error) => error?.code === "ESRCH",
    );
  } finally {
    stopTracking();
    if (descendantPid) {
      try {
        process.kill(descendantPid, "SIGKILL");
      } catch (error) {
        if (error?.code !== "ESRCH") throw error;
      }
    }
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch (error) {
      if (error?.code !== "ESRCH") throw error;
    }
  }
});

test("B-7: startup failure คง exit code และ recent output", async () => {
  await assert.rejects(
    () =>
      waitForManagedServer({
        child: { exitCode: 7 },
        name: "fixture",
        output: "recent fixture output",
        port: 3001,
        spawnError: null,
      }),
    /fixture exited before ready \(7\)[\s\S]*recent fixture output/,
  );
});

test("REQ-4.14 และ REQ-4.15: signal exit code คง 130/143", () => {
  assert.equal(signalExitCode("SIGINT"), 130);
  assert.equal(signalExitCode("SIGTERM"), 143);
});

test("REQ-5.8: CI จำกัด smoke step ไม่เกิน 2 นาที", async () => {
  const workflow = await readFile(join(repositoryRoot, ".github/workflows/ci.yml"), "utf8");
  assert.match(
    workflow,
    /- name: Smoke production routes\n\s+timeout-minutes: 2\n\s+run: npm run smoke:routes/,
  );
});

test("F-1, F-5, B-8: Admin dev proxy trusts only configured local certificate", async () => {
  const manifest = JSON.parse(
    await readFile(join(repositoryRoot, "package.json"), "utf8"),
  );

  assert.match(
    manifest.scripts.dev,
    /^node --require=\.\/scripts\/dev-tls-ca\.cjs \.\/node_modules\/next\/dist\/bin\/next dev -p 3001 --experimental-https$/,
  );
  assert.equal(manifest.engines.node, ">=22.19.0");
  assert.doesNotMatch(
    manifest.scripts.dev,
    /NODE_TLS_REJECT_UNAUTHORIZED|NODE_EXTRA_CA_CERTS=/,
  );
});

test("F-1, F-4, F-5: Admin production-local start trusts configured local certificate", async () => {
  const manifest = JSON.parse(
    await readFile(join(repositoryRoot, "package.json"), "utf8"),
  );

  assert.match(
    manifest.scripts.start,
    /^node --require=\.\/scripts\/dev-tls-ca\.cjs \.\/node_modules\/next\/dist\/bin\/next start -p 3001$/,
  );
  assert.doesNotMatch(
    manifest.scripts.start,
    /NODE_TLS_REJECT_UNAUTHORIZED|NODE_EXTRA_CA_CERTS=/,
  );
});

test("F-1, F-5, B-8: dev TLS preload appends CA without replacing public roots", async () => {
  const { getCACertificates } = await import("node:tls");
  const originalCertificates = getCACertificates("default");
  const certificate = originalCertificates[0];
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "pol-admin-dev-tls-ca-"));
  const certificatePath = join(temporaryDirectory, "fixture.crt");
  const preloadPath = join(repositoryRoot, "scripts/dev-tls-ca.cjs");

  try {
    await writeFile(certificatePath, certificate);
    const probe = spawnSync(
      process.execPath,
      [
        "-e",
        `
          const assert = require("node:assert/strict");
          const { X509Certificate } = require("node:crypto");
          const { readFileSync } = require("node:fs");
          const tls = require("node:tls");
          const [certificatePath, preloadPath] = process.argv.slice(1);
          const certificate = readFileSync(certificatePath, "utf8");
          const original = tls.getCACertificates("default");
          const fingerprint = (value) => new X509Certificate(value).fingerprint256;
          const targetFingerprint = fingerprint(certificate);
          tls.setDefaultCACertificates(
            original.filter((value) => fingerprint(value) !== targetFingerprint),
          );
          process.env.ADMIN_API_ORIGIN = "https://localhost:5001";
          process.env.ADMIN_API_CA_CERTIFICATE = certificatePath;
          require(preloadPath);
          const updated = new Set(tls.getCACertificates("default").map(fingerprint));
          for (const value of original) assert.ok(updated.has(fingerprint(value)));
        `,
        certificatePath,
        preloadPath,
      ],
      { encoding: "utf8" },
    );

    assert.equal(probe.status, 0, probe.stderr);
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
});

const PROXY_INTEGRATION_PATHS = [
  "/api/v1/merchants?page=1&limit=100",
  "/api/v1/approvals?page=1&limit=100&action=psp.credential.change&status=pending",
  "/api/v1/payments/psp-connections?page=1&limit=25",
];

function sleep(milliseconds) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds));
}

async function reservePort() {
  const probe = createServer();
  await new Promise((resolveListen, rejectListen) => {
    probe.once("error", rejectListen);
    probe.listen(0, "127.0.0.1", resolveListen);
  });
  const address = probe.address();
  assert(address && typeof address === "object");
  await new Promise((resolveClose) => probe.close(resolveClose));
  return address.port;
}

async function createProxyCertificate() {
  const directory = await mkdtemp(join(tmpdir(), "pol-admin-proxy-cert-"));
  const certificatePath = join(directory, "localhost.crt");
  const keyPath = join(directory, "localhost.key");
  const result = spawnSync(
    "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-keyout",
      keyPath,
      "-out",
      certificatePath,
      "-subj",
      "/CN=localhost",
      "-days",
      "1",
      "-addext",
      "subjectAltName=DNS:localhost",
    ],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  return { certificatePath, directory, keyPath };
}

async function runProxyIntegrationProbe(preload, certificatePath, keyPath) {
  const upstreamRequests = [];
  const upstream = createHttpsServer(
    {
      cert: await readFile(certificatePath),
      key: await readFile(keyPath),
    },
    (request, response) => {
      upstreamRequests.push({ method: request.method, url: request.url });
      response.writeHead(207, {
        "Content-Type": "application/problem+json; charset=utf-8",
        "X-Correlation-ID": "proxy-fixture-correlation",
      });
      response.end(JSON.stringify({ marker: "proxy-fixture", path: request.url }));
    },
  );
  await new Promise((resolveListen, rejectListen) => {
    upstream.once("error", rejectListen);
    upstream.listen(0, "::", resolveListen);
  });
  const upstreamAddress = upstream.address();
  assert(upstreamAddress && typeof upstreamAddress === "object");

  const nextPort = await reservePort();
  const nextArgs = preload ? ["--require", "./scripts/dev-tls-ca.cjs"] : [];
  nextArgs.push("./node_modules/next/dist/bin/next", "dev", "-p", String(nextPort));
  const next = spawn(process.execPath, nextArgs, {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      ADMIN_API_CA_CERTIFICATE: certificatePath,
      ADMIN_API_ORIGIN: `https://localhost:${upstreamAddress.port}`,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  const capture = (chunk) => {
    output = `${output}${chunk}`.slice(-20_000);
  };
  next.stdout.on("data", capture);
  next.stderr.on("data", capture);
  const closed = new Promise((resolveClose) => next.once("close", resolveClose));

  try {
    const deadline = Date.now() + 60_000;
    let ready = false;
    while (Date.now() < deadline) {
      if (next.exitCode !== null) {
        throw new Error(`Next proxy exited before ready (${next.exitCode})\\n${output}`);
      }
      try {
        const response = await fetch(`http://127.0.0.1:${nextPort}/login`);
        await response.text();
        ready = true;
        break;
      } catch {
        await sleep(100);
      }
    }
    if (!ready) throw new Error(`Next proxy did not become ready\\n${output}`);

    const results = [];
    for (const path of PROXY_INTEGRATION_PATHS) {
      const response = await fetch(`http://127.0.0.1:${nextPort}${path}`);
      results.push({
        body: await response.text(),
        contentType: response.headers.get("content-type"),
        correlationId: response.headers.get("x-correlation-id"),
        status: response.status,
      });
    }
    return { output, results, upstreamRequests };
  } finally {
    if (next.exitCode === null) next.kill("SIGTERM");
    await Promise.race([
      closed,
      sleep(5_000).then(() => {
        if (next.exitCode === null) next.kill("SIGKILL");
        return closed;
      }),
    ]);
    if (upstream.listening) {
      upstream.closeAllConnections?.();
      await new Promise((resolveClose) => upstream.close(resolveClose));
    }
  }
}

test("F-1, F-2, F-6: Next proxy forwards response after local CA preload", async () => {
  const certificate = await createProxyCertificate();

  try {
    const withoutPreload = await runProxyIntegrationProbe(
      false,
      certificate.certificatePath,
      certificate.keyPath,
    );
    assert.equal(withoutPreload.upstreamRequests.length, 0);
    assert.ok(withoutPreload.results.every(({ status }) => status >= 500));

    const withPreload = await runProxyIntegrationProbe(
      true,
      certificate.certificatePath,
      certificate.keyPath,
    );
  assert.deepEqual(
    withPreload.results.map(({ status }) => status),
    [207, 207, 207],
    `${withPreload.output}\\n${JSON.stringify(withPreload.results)}\\n${JSON.stringify(withPreload.upstreamRequests)}`,
  );
  assert.deepEqual(
    withPreload.results.map(({ contentType, correlationId }) => ({ contentType, correlationId })),
    PROXY_INTEGRATION_PATHS.map(() => ({
      contentType: "application/problem+json; charset=utf-8",
      correlationId: "proxy-fixture-correlation",
    })),
  );
  assert.deepEqual(
    withPreload.results.map(({ body }) => JSON.parse(body)),
    PROXY_INTEGRATION_PATHS.map((path) => ({ marker: "proxy-fixture", path })),
  );
    assert.deepEqual(
      withPreload.upstreamRequests.map(({ method, url }) => ({ method, url })),
      PROXY_INTEGRATION_PATHS.map((url) => ({ method: "GET", url })),
    );
  } finally {
    await rm(certificate.directory, { force: true, recursive: true });
  }
});

test("F-5: dev TLS preload ignores CA for non-local upstream", async () => {
  const { getCACertificates } = await import("node:tls");
  const originalCertificates = getCACertificates("default");
  const certificate = originalCertificates[0];
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "pol-admin-dev-tls-scope-"));
  const certificatePath = join(temporaryDirectory, "fixture.crt");
  const preloadPath = join(repositoryRoot, "scripts/dev-tls-ca.cjs");

  try {
    await writeFile(certificatePath, certificate);
    const probe = spawnSync(
      process.execPath,
      [
        "-e",
        `
          const assert = require("node:assert/strict");
          const { X509Certificate } = require("node:crypto");
          const { readFileSync } = require("node:fs");
          const tls = require("node:tls");
          const [certificatePath, preloadPath] = process.argv.slice(1);
          const certificate = readFileSync(certificatePath, "utf8");
          const fingerprint = (value) => new X509Certificate(value).fingerprint256;
          const targetFingerprint = fingerprint(certificate);
          tls.setDefaultCACertificates(
            tls.getCACertificates("default").filter((value) => fingerprint(value) !== targetFingerprint),
          );
          process.env.ADMIN_API_ORIGIN = "https://example.test:5001";
          process.env.ADMIN_API_CA_CERTIFICATE = certificatePath;
          require(preloadPath);
          const updated = new Set(tls.getCACertificates("default").map(fingerprint));
          assert.equal(updated.has(targetFingerprint), false);
        `,
        certificatePath,
        preloadPath,
      ],
      { encoding: "utf8" },
    );

    assert.equal(probe.status, 0, probe.stderr);
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
});

test("F-3: process restart loads latest local CA configuration", async () => {
  let first;
  let second;

  try {
    first = await createProxyCertificate();
    second = await createProxyCertificate();
    const preloadPath = join(repositoryRoot, "scripts/dev-tls-ca.cjs");
    const probeSource = `
      const assert = require("node:assert/strict");
      const { X509Certificate } = require("node:crypto");
      const { readFileSync } = require("node:fs");
      const tls = require("node:tls");
      const [expectedPath, previousPath, preloadPath] = process.argv.slice(1);
      const fingerprint = (value) => new X509Certificate(value).fingerprint256;
      const expectedFingerprint = fingerprint(readFileSync(expectedPath, "utf8"));
      const previousFingerprint = fingerprint(readFileSync(previousPath, "utf8"));
      process.env.ADMIN_API_ORIGIN = "https://localhost:5001";
      process.env.ADMIN_API_CA_CERTIFICATE = expectedPath;
      tls.setDefaultCACertificates(
        tls.getCACertificates("default").filter((value) => fingerprint(value) !== expectedFingerprint),
      );
      require(preloadPath);
      const updated = new Set(tls.getCACertificates("default").map(fingerprint));
      assert.equal(updated.has(expectedFingerprint), true);
      assert.equal(updated.has(previousFingerprint), false);
    `;

    for (const [expected, previous] of [
      [first.certificatePath, second.certificatePath],
      [second.certificatePath, first.certificatePath],
    ]) {
      const probe = spawnSync(
        process.execPath,
        ["-e", probeSource, expected, previous, preloadPath],
        { encoding: "utf8" },
      );
      assert.equal(probe.status, 0, probe.stderr);
    }
  } finally {
    await Promise.all(
      [first?.directory, second?.directory]
        .filter((directory) => directory !== undefined)
        .map((directory) => rm(directory, { force: true, recursive: true })),
    );
  }
});

test("F-2, F-3, F-6: production build succeeds with Google Fonts network blocked", async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "pol-admin-font-offline-"));
  const guardPath = join(temporaryDirectory, "block-remote-fonts.cjs");
  const guardSource = `
    "use strict";
    const blockedHosts = ["fonts.googleapis.com", "fonts.gstatic.com"];
    function requestUrl(input) {
      if (typeof input === "string") return input;
      if (input instanceof URL) return input.href;
      if (input && typeof input === "object") {
        if (typeof input.href === "string") return input.href;
        return String(input.protocol || "") + "//" + String(input.hostname || input.host || "") + String(input.path || "");
      }
      return "";
    }
    function assertNotFontRequest(input) {
      const url = requestUrl(input);
      if (blockedHosts.some((host) => url.includes(host))) {
        throw new Error("Blocked remote font request");
      }
    }
    const https = require("node:https");
    for (const method of ["request", "get"]) {
      const original = https[method];
      https[method] = function (input, ...args) {
        assertNotFontRequest(input);
        return original.call(this, input, ...args);
      };
    }
    if (typeof globalThis.fetch === "function") {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = function (input, ...args) {
        assertNotFontRequest(input);
        return originalFetch.call(this, input, ...args);
      };
    }
  `;

  try {
    await rm(join(repositoryRoot, ".next/cache/turbopack"), { force: true, recursive: true });
    await writeFile(guardPath, guardSource);
    const result = spawnSync(
      process.execPath,
      ["--require", guardPath, "./node_modules/next/dist/bin/next", "build"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      },
    );
    assert.equal(result.status, 0, `${result.stdout}\\n${result.stderr}`);

    const manifest = await readFile(join(repositoryRoot, ".next/server/next-font-manifest.json"), "utf8");
    assert.doesNotMatch(manifest, /fonts\.googleapis|fonts\.gstatic|internal\/font\/google/);
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
});

test("F-1, F-2, F-4, F-5, F-6: Admin fonts use repository-local assets", async () => {
  const layout = await readFile(join(repositoryRoot, "src/app/layout.tsx"), "utf8");
  assert.doesNotMatch(layout, /next\/font\/google/);
  assert.match(layout, /next\/font\/local/);

  for (const asset of [
    "barlow-600.ttf",
    "barlow-700.ttf",
    "barlow-800.ttf",
    "dm-sans-variable.ttf",
    "ibm-plex-mono-400.ttf",
    "ibm-plex-mono-500.ttf",
    "ibm-plex-mono-600.ttf",
    "inter-variable.ttf",
    "noto-sans-thai-variable.ttf",
    "nunito-sans-variable.ttf",
    "public-sans-variable.ttf",
  ]) {
    await assert.doesNotReject(() => readFile(join(repositoryRoot, "src/app/fonts", asset)));
  }

  for (const license of [
    "LICENSE-barlow.txt",
    "LICENSE-dmsans.txt",
    "LICENSE-ibmplexmono.txt",
    "LICENSE-inter.txt",
    "LICENSE-notosansthai.txt",
    "LICENSE-nunitosans.txt",
    "LICENSE-publicsans.txt",
  ]) {
    const text = await readFile(join(repositoryRoot, "src/app/fonts", license), "utf8");
    assert.match(text, /SIL Open Font License, Version 1\.1/);
  }
});

test("REQ-5.13 ถึง REQ-5.19: smoke จัดการ root Admin port 3001 เท่านั้น", async () => {
  const [smoke, signals] = await Promise.all([
    readFile(join(repositoryRoot, "scripts/smoke-workspace-routes.mjs"), "utf8"),
    readFile(join(repositoryRoot, "scripts/verify-smoke-signals.mjs"), "utf8"),
  ]);

  assert.match(smoke, /startServer\("Admin", "start", 3001\)/);
  assert.match(smoke, /127\.0\.0\.1:3001\/admin\/user\/list/);
  assert.match(smoke, /127\.0\.0\.1:3001\/register/);
  assert.doesNotMatch(smoke, /Merchant|3002/);
  assert.doesNotMatch(signals, /3002/);
  for (const reference of [REMOVED_START_ALIAS, REMOVED_MERCHANT_PACKAGE]) {
    assert.equal(smoke.includes(reference), false);
  }
});

test("REQ-6.1 ถึง REQ-6.10: CI คง full root gates", async () => {
  const workflow = await readFile(join(repositoryRoot, ".github/workflows/ci.yml"), "utf8");

  for (const command of [
    "npm ci",
    "npm audit --omit=dev --audit-level=high",
    "npm run lint",
    "npm run typecheck",
    "npm test",
    "npm run build",
    "npm run verify:workspaces",
    "npm run smoke:routes",
  ]) {
    assert.match(workflow, new RegExp(command.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(workflow, /node-version: '22\.19\.0'/);
  assert.match(workflow, /npm install --global npm@11\.12\.1/);
  assert.match(workflow, /Guard regression tests/);
  assert.match(workflow, /Secret scan/);
  assert.match(workflow, /Spec trace \(REQ coverage\)/);
  assert.doesNotMatch(workflow, /Build Merchant|route parity/);
  for (const reference of forbiddenActiveReferences()) {
    assert.equal(workflow.includes(reference), false);
  }
});

test("REQ-6.11 ถึง REQ-6.28: Dockerfile ใช้ root standalone non-root runtime", async () => {
  const dockerfile = await readFile(join(repositoryRoot, "Dockerfile"), "utf8");
  const dependencyStage = dockerfile.slice(0, dockerfile.indexOf("# ---- builder"));

  assert.match(dockerfile, /FROM node:22\.19\.0-alpine3\.22 AS base/);
  assert.deepEqual(dependencyStage.match(/^COPY .*package.*$/gm), [
    "COPY package.json package-lock.json ./",
    "COPY packages/ui/package.json ./packages/ui/package.json",
    "COPY packages/shared/package.json ./packages/shared/package.json",
  ]);
  assert.match(dockerfile, /RUN npm run build/);
  assert.match(dockerfile, /\/app\/\.next\/standalone \.\//);
  assert.match(dockerfile, /\/app\/public \.\/public/);
  assert.match(dockerfile, /\/app\/\.next\/static \.\/\.next\/static/);
  assert.match(dockerfile, /USER nextjs/);
  assert.match(dockerfile, /EXPOSE 3001/);
  assert.match(dockerfile, /r\.statusCode<500\?0:1/);
  assert.match(dockerfile, /CMD \["node", "server\.js"\]/);
  assert.doesNotMatch(dockerfile, /Merchant image|Merchant service/);
  for (const reference of forbiddenActiveReferences()) {
    assert.equal(dockerfile.includes(reference), false);
  }
});

test("REQ-4.13: Docker context ตัด exact env pattern set ทุกระดับ", async () => {
  const dockerignore = await readFile(join(repositoryRoot, ".dockerignore"), "utf8");
  const envPatterns = dockerignore
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.includes(".env"));
  assert.deepEqual(envPatterns, [".env", ".env.*"]);
});

test("REQ-4.16: runtime smoke ปฏิเสธ port ที่มี owner อยู่แล้วโดยไม่ปิด owner", async () => {
  const owner = createServer();
  await new Promise((resolveListen) => owner.listen(0, "127.0.0.1", resolveListen));
  const address = owner.address();
  assert(address && typeof address === "object");

  try {
    await assert.rejects(() => assertPortAvailable(address.port), /already in use/);
    assert.equal(owner.listening, true);
  } finally {
    if (owner.listening) await new Promise((resolveClose) => owner.close(resolveClose));
  }

  await assert.doesNotReject(() => assertPortAvailable(address.port));
});

test("F-1: runtime smoke ปฏิเสธ IPv6 owner โดยไม่ปิด owner", async () => {
  const owner = createServer();
  await new Promise((resolveListen, rejectListen) => {
    owner.once("error", rejectListen);
    owner.listen(0, "::1", resolveListen);
  });
  const address = owner.address();
  assert(address && typeof address === "object");

  try {
    await assert.rejects(() => assertPortAvailable(address.port), /already in use/);
    assert.equal(owner.listening, true);
  } finally {
    if (owner.listening) await new Promise((resolveClose) => owner.close(resolveClose));
  }

  await assert.doesNotReject(() => assertPortAvailable(address.port));
});

test("F-1: runtime smoke ปฏิเสธ IPv6 wildcard owner โดยไม่ปิด owner", async () => {
  const owner = createServer();
  await new Promise((resolveListen, rejectListen) => {
    owner.once("error", rejectListen);
    owner.listen(0, "::", resolveListen);
  });
  const address = owner.address();
  assert(address && typeof address === "object");

  try {
    await assert.rejects(() => assertPortAvailable(address.port), /already in use/);
    assert.equal(owner.listening, true);
  } finally {
    if (owner.listening) await new Promise((resolveClose) => owner.close(resolveClose));
  }

  await assert.doesNotReject(() => assertPortAvailable(address.port));
});

test("F-1: runtime smoke ข้าม unsupported IPv6 loopback และ wildcard probes", async () => {
  const hosts = [];
  const createProbe = () => {
    let onError;
    return {
      listening: false,
      once(event, handler) {
        if (event === "error") onError = handler;
        return this;
      },
      listen(_port, host, onListening) {
        hosts.push(host);
        queueMicrotask(() => {
          if (host === "127.0.0.1") {
            this.listening = true;
            onListening();
            return;
          }
          onError(Object.assign(new Error("IPv6 unsupported"), { code: "EAFNOSUPPORT" }));
        });
        return this;
      },
      close(onClose) {
        this.listening = false;
        queueMicrotask(onClose);
      },
    };
  };

  await assert.doesNotReject(() => assertPortAvailable(3001, createProbe));
  assert.deepEqual(hosts, ["127.0.0.1", "::1", "::"]);
});

test("REQ-2.12, REQ-5.3: normalize และ fingerprint root page routes แบบ deterministic", () => {
  const routes = normalizePageRoutes({
    "/page": "app/page.js",
    "/admin/user/list/page": "app/admin/user/list/page.js",
    "/dashboard/layout": "app/dashboard/layout.js",
    "/dashboard/page": "app/dashboard/page.js",
    "/_not-found/page": "app/_not-found/page.js",
    "/checkout/[sessionId]/page": "app/checkout/[sessionId]/page.js",
    "/minimals/subpaths/[...segments]/page": "app/minimals/subpaths/[...segments]/page.js",
  });

  assert.deepEqual(routes, [
    "/",
    "/admin/user/list",
    "/checkout/[sessionId]",
    "/dashboard",
    "/minimals/subpaths/[...segments]",
  ]);
  assert.match(pageRouteFingerprint(routes), /^[0-9a-f]{64}$/);
  assert.notEqual(pageRouteFingerprint(routes), pageRouteFingerprint([...routes].reverse()));
  assert.throws(() => assertAdminRouteIdentity(routes), /Admin route identity must equal 114 routes/);
});

test("REQ-4.17: manifest ต้องเป็น JSON object", () => {
  assert.throws(() => normalizePageRoutes(null), /JSON object/);
  assert.throws(() => normalizePageRoutes([]), /JSON object/);
});

test("REQ-4.2, REQ-4.3 และ REQ-4.18: Admin route guard จับ required route และ /register", () => {
  const required = [
    "/",
    "/admin/user/list",
    "/checkout/[sessionId]",
    "/dashboard",
    "/minimals/subpaths/[...segments]",
  ];
  assert.doesNotThrow(() => assertRequiredAdminRoutes(required));
  assert.throws(
    () => assertRequiredAdminRoutes(required.filter((route) => route !== "/admin/user/list")),
    /Admin \/admin\/user\/list/,
  );
  assert.throws(
    () => assertRequiredAdminRoutes([...required, "/register"]),
    /Admin must not expose \/register/,
  );
});

test("REQ-4.5 ถึง REQ-4.8: module parser ครอบ static, side-effect, dynamic และ require imports", () => {
  const source = [
    'import value from "alpha";',
    'export { other } from "beta";',
    'import "gamma";',
    'const lazy = import("delta");',
    'const legacy = require("epsilon");',
  ].join("\n");
  assert.deepEqual(extractModuleSpecifiers(source), ["alpha", "beta", "delta", "epsilon", "gamma"]);
});

test("REQ-3.24, REQ-5.4 ถึง REQ-5.7: boundary scan ปฏิเสธ removed apps และ package-to-app imports", () => {
  const repo = join("/", "repo");
  const roots = {
    appSource: join(repo, "src"),
    packages: join(repo, "packages"),
    removedAdminWorkspace: join(repo, REMOVED_ADMIN_WORKSPACE),
    removedMerchantWorkspace: join(repo, REMOVED_MERCHANT_WORKSPACE),
  };
  const files = [
    {
      file: join(repo, "src/allowed.ts"),
      content: 'import { Logo } from "@pol/ui/logo";',
    },
    {
      file: join(repo, "src/bad-relative.ts"),
      content: `import value from "../${REMOVED_MERCHANT_WORKSPACE}/src/value";`,
    },
    {
      file: join(repo, "src/bad-package.ts"),
      content: `import value from "${REMOVED_ADMIN_PACKAGE}/internal";`,
    },
    {
      file: join(repo, "packages/shared/src/bad-app.ts"),
      content: 'export { value } from "../../../src/value";',
    },
    {
      file: join(repo, "packages/shared/src/bad-merchant.ts"),
      content: `export { value } from "${join(repo, REMOVED_MERCHANT_WORKSPACE, "src/value")}";`,
    },
  ];

  assert.deepEqual(
    findBoundaryViolations(files, roots).map(({ file, specifier }) => [file, specifier]),
    [
      [join(repo, "packages/shared/src/bad-app.ts"), "../../../src/value"],
      [
        join(repo, "packages/shared/src/bad-merchant.ts"),
        join(repo, REMOVED_MERCHANT_WORKSPACE, "src/value"),
      ],
      [join(repo, "src/bad-package.ts"), `${REMOVED_ADMIN_PACKAGE}/internal`],
      [join(repo, "src/bad-relative.ts"), `../${REMOVED_MERCHANT_WORKSPACE}/src/value`],
    ],
  );
});

test("REQ-5.6, REQ-5.8: active-reference scan ยอมเฉพาะ marked negative fixture", () => {
  const fixtureFile = join("/", "repo", "scripts/lib/workspace-verification.test.mjs");
  const fixtureBody = forbiddenActiveReferences().join("\n");
  assert.deepEqual(
    [...forbiddenActiveReferences()].sort(),
    [...RAW_FORBIDDEN_FIXTURES].sort(),
  );
  const markedFixture = [
    `// ${"active-reference-fixture:start"}`,
    fixtureBody,
    `// ${"active-reference-fixture:end"}`,
  ].join("\n");

  assert.deepEqual(
    findActiveReferenceViolations([{ file: fixtureFile, content: markedFixture }]),
    [],
  );

  const violations = findActiveReferenceViolations([
    { file: fixtureFile, content: fixtureBody },
    { file: join("/", "repo", "README.md"), content: fixtureBody },
  ]);
  assert.equal(violations.length, forbiddenActiveReferences().length * 2);
  assert.deepEqual(
    new Set(violations.map(({ reference }) => reference)),
    new Set(forbiddenActiveReferences()),
  );
});

test("REQ-4.9: test policy scan จับ focused และ skipped tests", () => {
  const focusedToken = ["describe", ".", "only", "("].join("");
  const skippedToken = ["test", ".", "skip", "("].join("");
  const violations = findTestPolicyViolations([
    {
      file: "/repo/example.test.ts",
      content: `${focusedToken}\"focused\", () => {});\n${skippedToken}\"skipped\", () => {});`,
    },
    {
      file: "/repo/example.ts",
      content: `${focusedToken}\"not a test file\", () => {});`,
    },
  ]);

  assert.deepEqual(
    violations.map(({ file, line }) => [file, line]),
    [
      ["/repo/example.test.ts", 1],
      ["/repo/example.test.ts", 2],
    ],
  );
});
