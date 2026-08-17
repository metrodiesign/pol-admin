import assert from "node:assert/strict";
import { createServer } from "node:net";
import { join } from "node:path";
import test from "node:test";

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
