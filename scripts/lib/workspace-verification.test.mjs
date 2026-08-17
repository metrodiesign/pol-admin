import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  signalExitCode,
  stopManagedServer,
  waitForManagedServer,
} from "./workspace-process.mjs";

import {
  assertPortAvailable,
  assertRequiredRoutes,
  assertRouteParity,
  compareRouteParity,
  extractModuleSpecifiers,
  findBoundaryViolations,
  findTestPolicyViolations,
  normalizePageRoutes,
} from "./workspace-verification.mjs";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

test("F-2/F-3: cleanup จบได้เมื่อ child exit พร้อม SIGKILL", async () => {
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

test("F-3: cleanup timeout คืน error พร้อม server, PID และ phase", async () => {
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

test("F-2/F-5: cleanup ปิด process group แม้ leader ปิดไปก่อน", async () => {
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

test("B-8: signal exit code คง 130/143", () => {
  assert.equal(signalExitCode("SIGINT"), 130);
  assert.equal(signalExitCode("SIGTERM"), 143);
});

test("F-6: CI จำกัด smoke step ไม่เกิน 2 นาที", async () => {
  const workflow = await readFile(join(repositoryRoot, ".github/workflows/ci.yml"), "utf8");
  assert.match(
    workflow,
    /- name: Smoke production routes\n\s+timeout-minutes: 2\n\s+run: npm run smoke:routes/,
  );
});

test("runtime smoke ปฏิเสธ port ที่มี owner อยู่แล้วโดยไม่ปิด owner", async () => {
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

test("REQ-3.11 ถึง REQ-3.14: normalize เฉพาะ page routes และคง dynamic notation", () => {
  const routes = normalizePageRoutes({
    "/page": "app/page.js",
    "/dashboard/layout": "app/dashboard/layout.js",
    "/dashboard/page": "app/dashboard/page.js",
    "/_not-found/page": "app/_not-found/page.js",
    "/checkout/[sessionId]/page": "app/checkout/[sessionId]/page.js",
    "/minimals/subpaths/[...segments]/page": "app/minimals/subpaths/[...segments]/page.js",
  });

  assert.deepEqual(routes, [
    "/",
    "/checkout/[sessionId]",
    "/dashboard",
    "/minimals/subpaths/[...segments]",
  ]);
});

test("REQ-3.11: manifest ต้องเป็น JSON object", () => {
  assert.throws(() => normalizePageRoutes(null), /JSON object/);
  assert.throws(() => normalizePageRoutes([]), /JSON object/);
});

test("REQ-3.5 และ REQ-9.10: Merchant ต่างจาก Admin ได้เฉพาะ /register", () => {
  const admin = ["/", "/admin/user/list", "/dashboard"];
  const merchant = [...admin, "/register"];

  assert.doesNotThrow(() => assertRouteParity(admin, merchant));
  assert.deepEqual(compareRouteParity(admin, merchant), {
    adminHasRegister: false,
    missingFromMerchant: [],
    extraInMerchant: [],
  });
});

test("REQ-9.10: parity check รายงาน extra และ missing routes แบบ deterministic", () => {
  assert.throws(
    () => assertRouteParity(["/", "/dashboard"], ["/", "/register", "/unexpected"]),
    /Missing from Merchant: \/dashboard[\s\S]*Extra in Merchant: \/unexpected/,
  );
  assert.throws(
    () => assertRouteParity(["/", "/register"], ["/", "/register"]),
    /Admin contains \/register: true/,
  );
});

test("REQ-3.8 ถึง REQ-3.10: required route guard จับ route สำคัญที่หาย", () => {
  const common = [
    "/",
    "/admin/user/list",
    "/checkout/[sessionId]",
    "/dashboard",
    "/minimals/subpaths/[...segments]",
  ];
  assert.doesNotThrow(() => assertRequiredRoutes(common, [...common, "/register"]));
  assert.throws(() => assertRequiredRoutes(common, ["/", "/register"]), /Merchant \/admin\/user\/list/);
});

test("REQ-9.14: module parser ครอบ static, side-effect, dynamic และ require imports", () => {
  const source = [
    'import value from "alpha";',
    'export { other } from "beta";',
    'import "gamma";',
    'const lazy = import("delta");',
    'const legacy = require("epsilon");',
  ].join("\n");
  assert.deepEqual(extractModuleSpecifiers(source), ["alpha", "beta", "delta", "epsilon", "gamma"]);
});

test("REQ-1.6, REQ-6.6 และ REQ-9.14: boundary scan ปฏิเสธ app-to-app และ package-to-app imports", () => {
  const repo = join("/", "repo");
  const roots = {
    admin: join(repo, "apps/admin"),
    merchant: join(repo, "apps/merchant"),
    packages: join(repo, "packages"),
  };
  const files = [
    {
      file: join(repo, "apps/admin/src/allowed.ts"),
      content: 'import { Logo } from "@pol/ui/logo";',
    },
    {
      file: join(repo, "apps/admin/src/bad.ts"),
      content: 'import value from "../../merchant/src/value";',
    },
    {
      file: join(repo, "apps/merchant/src/bad.ts"),
      content: 'import value from "@pol/admin/internal";',
    },
    {
      file: join(repo, "packages/shared/src/bad.ts"),
      content: 'export { value } from "../../../apps/admin/src/value";',
    },
  ];

  assert.deepEqual(
    findBoundaryViolations(files, roots).map(({ file, specifier }) => [file, specifier]),
    [
      [join(repo, "apps/admin/src/bad.ts"), "../../merchant/src/value"],
      [join(repo, "apps/merchant/src/bad.ts"), "@pol/admin/internal"],
      [join(repo, "packages/shared/src/bad.ts"), "../../../apps/admin/src/value"],
    ],
  );
});

test("REQ-9.15: test policy scan จับ focused และ skipped tests", () => {
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
