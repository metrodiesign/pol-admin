import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  signalExitCode,
  stopManagedServer,
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
