import { createServer } from "node:http";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.PSP_CONTRACT_PORT ?? "5100", 10);
const scenario = process.env.PSP_CONTRACT_SCENARIO ?? "happy";
const csrf = "contract-csrf";
const connectionId = "11111111-1111-4111-8111-111111111111";
const secondConnectionId = "22222222-2222-4222-8222-222222222222";
const merchantId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const secondMerchantId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const credentialPendingTargets = new Set();
let unknownCredentialAttempt = null;

function connection(overrides = {}) {
  return {
    pspConnectionId: connectionId,
    merchantId,
    psp: "2c2p",
    enabledMethods: ["card", "promptpay"],
    config: {
      accountId: "contract-account",
      card: true,
      installment: false,
      enabledSources: ["card", "promptpay"],
      returnUrls: ["https://merchant.example/return"],
      futureField: { preserved: true },
    },
    maskedSecrets: { secretKey: "2c2p_l••••••••d9e4" },
    isEnabled: true,
    health: "healthy",
    lastTestedAt: "2026-08-19T02:00:00Z",
    lastTestResult: "authenticated",
    capabilities: { test: true },
    hasPendingCredentialChange: scenario === "approval-lag",
    createdAt: "2026-08-18T00:00:00Z",
    version: scenario === "test-failed" ? 8 : 7,
    environment: "sandbox",
    credentialEnvironment: "sandbox",
    callbackUrl: `https://api.example.test/api/v1/webhooks/${connectionId}`,
    pendingCredentialTest: null,
    webhookRegistration: null,
    ...overrides,
  };
}

const isSettingsScenario = scenario.startsWith("settings-");
const omiseAlphaId = "44444444-4444-4444-8444-444444444444";

const connections = [
  connection(
    scenario === "test-failed"
      ? {
          health: "failed",
          lastTestedAt: "2026-08-19T03:00:00Z",
          lastTestResult: "probe_failed",
        }
      : {},
  ),
  connection({
    pspConnectionId: secondConnectionId,
    merchantId: secondMerchantId,
    psp: "omise",
    enabledMethods: ["card"],
    config: null,
    maskedSecrets: { secretKey: "skey_l••••••••f160" },
    isEnabled: false,
    health: "unknown",
    lastTestedAt: null,
    lastTestResult: null,
    capabilities: { test: false },
    hasPendingCredentialChange: false,
    version: 2,
  }),
];

if (isSettingsScenario) {
  connections.push(
    connection({
      pspConnectionId: omiseAlphaId,
      merchantId,
      psp: "omise",
      enabledMethods: ["card"],
      config: null,
      maskedSecrets: { secretKey: "skey_l••••••••f160" },
      isEnabled: true,
      health: "unknown",
      lastTestedAt: null,
      lastTestResult: null,
      capabilities: { test: true },
      version: 3,
      callbackUrl: `https://api.example.test/api/v1/webhooks/${omiseAlphaId}`,
      pendingCredentialTest: { result: "authenticated", testedAt: "2026-09-06T10:00:00Z" },
      webhookRegistration: { acknowledged: false, acknowledgedAt: null },
    }),
  );
}

// Merchant settings state per Alpha (mutable across environment-change).
const settingsVersion = scenario === "settings-pending-env" ? 5 : 4;
const merchantSettings = {
  merchantId,
  environment: "sandbox",
  pendingEnvironment: scenario === "settings-pending-env" ? "live" : null,
  pendingApprovalId:
    scenario === "settings-pending-env" ? "77777777-7777-4777-8777-777777777777" : null,
  updatedAt: "2026-09-06T00:00:00Z",
  version: settingsVersion,
};

// Account-level method capability per (connectionId, method); Omise disabled with denial.
const accountMethods = new Map();
for (const method of ["card", "promptpay", "installment"]) {
  accountMethods.set(`${connectionId}:${method}`, {
    pspConnectionId: connectionId,
    merchantId,
    provider: "2c2p",
    method,
    enabled: method !== "installment",
    version: 2,
    adapterVerified: true,
    denial: null,
  });
  accountMethods.set(`${omiseAlphaId}:${method}`, {
    pspConnectionId: omiseAlphaId,
    merchantId,
    provider: "omise",
    method,
    enabled: false,
    version: 2,
    adapterVerified: false,
    denial: "adapter_unverified",
  });
}

// Merchant policy per method.
const merchantMethods = new Map(
  ["card", "promptpay", "installment"].map((method) => [
    method,
    {
      merchantId,
      method,
      enabled: method !== "installment",
      effective: method !== "installment",
      version: 2,
      denial: null,
    },
  ]),
);

const advancedRouting = scenario === "settings-advanced-routing";
// settings-no-draft (AC-9): ยังไม่มี draft ruleset -> version 0, PUT ต้องส่ง If-Match "v0".
const noDraft = scenario === "settings-no-draft";
const routingRulesetId = "88888888-8888-4888-8888-888888888888";
let routingVersion = noDraft ? 0 : 3;
const routingRuleset = {
  rulesetId: routingRulesetId,
  merchantId,
  name: "default",
  status: "active",
  approvalId: null,
  version: routingVersion,
  rules: advancedRouting
    ? [
        {
          ruleId: "rule-adv",
          priority: 1,
          method: "card",
          originatorId: null,
          minAmount: "100000",
          maxAmount: null,
          targetConnectionId: connectionId,
          fallbackConnectionId: omiseAlphaId,
          enabled: true,
        },
      ]
    : [
        {
          ruleId: "rule-card",
          priority: 1,
          method: "card",
          originatorId: null,
          minAmount: null,
          maxAmount: null,
          targetConnectionId: connectionId,
          fallbackConnectionId: null,
          enabled: true,
        },
      ],
};

const merchants = Array.from({ length: scenario === "catalog-partial" ? 100 : 2 }, (_, index) => ({
  id:
    index === 0
      ? merchantId
      : index === 1 && scenario !== "catalog-partial"
        ? secondMerchantId
        : `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
  code: `M${String(index + 1).padStart(3, "0")}`,
  name:
    index === 0
      ? "Merchant Alpha"
      : index === 1 && scenario !== "catalog-partial"
        ? "Merchant Beta"
        : `Merchant ${index + 1}`,
  status: "active",
}));

function json(response, status, body, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return JSON.parse(body);
}

function problem(response, status, code) {
  json(response, status, { status, extensions: code ? { code } : {} });
}

function page(items, url) {
  const pageNumber = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "25", 10);
  const start = (pageNumber - 1) * limit;
  return { items: items.slice(start, start + limit), page: pageNumber, limit, total: items.length };
}

function validMutation(request, needsEtag) {
  const etag = request.headers["if-match"];
  return (
    request.headers["x-csrf-token"] === csrf &&
    typeof request.headers["idempotency-key"] === "string" &&
    (!needsEtag || (typeof etag === "string" && /^"v(0|[1-9][0-9]*)"$/.test(etag)))
  );
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);
  const method = request.method ?? "GET";

  if (method === "GET" && url.pathname === "/api/v1/admins/me") {
    if (scenario === "auth-forbidden") return problem(response, 403, "forbidden");
    const permissions =
      scenario === "forbidden"
        ? ["merchant.view", "merchant.manage"]
        : ["settings.manage", "merchant.view", "merchant.manage"];
    return json(
      response,
      200,
      {
        adminId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        email: "operator@example.test",
        tier: "Super",
        accessibleMerchants: { isUnrestricted: true },
        permissions,
      },
      { "Set-Cookie": `adm_csrf=${csrf}; Path=/; SameSite=Lax` },
    );
  }

  if (method === "GET" && url.pathname === "/api/v1/merchants") {
    if (scenario === "merchant-forbidden") return problem(response, 403, "forbidden");
    const pageNumber = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
    if (scenario === "catalog-partial" && pageNumber > 1) return problem(response, 503, "unavailable");
    const result = page(merchants, url);
    if (scenario === "catalog-partial") result.total = 101;
    return json(response, 200, result);
  }

  if (method === "GET" && url.pathname === "/api/v1/approvals") {
    if (scenario === "approval-unavailable") return problem(response, 503, "unavailable");
    const approvals = scenario === "approval-lag"
      ? []
      : [
          {
            approvalId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            merchantId,
            action: "psp.credential.change",
            targetId: secondConnectionId,
            status: "pending",
          },
        ];
    for (const targetId of credentialPendingTargets) {
      approvals.push({
        approvalId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        merchantId,
        action: "psp.credential.change",
        targetId,
        status: "pending",
      });
    }
    // seed approval ให้ Omise ที่มี pendingCredentialTest เพื่อให้ CandidateTestButton แสดง (AC-11)
    if (isSettingsScenario) {
      approvals.push({
        approvalId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        merchantId,
        action: "psp.credential.change",
        targetId: omiseAlphaId,
        status: "pending",
      });
    }
    const filtered = approvals.filter((approval) => {
      const search = url.searchParams.get("search");
      const action = url.searchParams.get("action");
      const status = url.searchParams.get("status");
      return (
        (!search || approval.targetId.includes(search)) &&
        (!action || approval.action === action) &&
        (!status || approval.status === status)
      );
    });
    return json(response, 200, page(filtered, url));
  }

  if (method === "GET" && url.pathname === "/api/v1/payments/psp-connections") {
    if (scenario === "list-forbidden") return problem(response, 403, "forbidden");
    let filtered = connections;
    for (const name of ["merchantId", "psp", "health"]) {
      const value = url.searchParams.get(name);
      if (value) filtered = filtered.filter((item) => String(item[name]) === value);
    }
    const search = url.searchParams.get("search")?.toLowerCase();
    if (search) filtered = filtered.filter((item) => item.pspConnectionId.includes(search));
    return json(response, 200, page(filtered, url));
  }

  const detailMatch = url.pathname.match(/^\/api\/v1\/payments\/psp-connections\/([0-9a-f-]+)$/i);
  if (method === "GET" && detailMatch) {
    const item = connections.find((candidate) => candidate.pspConnectionId === detailMatch[1]?.toLowerCase());
    if (!item) return problem(response, 404, "not_found");
    const headers = scenario === "missing-etag" ? {} : { ETag: `"v${item.version}"` };
    return json(response, 200, item, headers);
  }

  if (method === "POST" && url.pathname === "/api/v1/payments/psp-connections") {
    if (!validMutation(request, false)) return problem(response, 400, "invalid_headers");
    if (scenario === "validation-failed") return problem(response, 400, "validation_failed");
    if (scenario === "duplicate") return problem(response, 409);
    const body = await readJson(request);
    const created = connection({
      pspConnectionId: "33333333-3333-4333-8333-333333333333",
      merchantId: body.merchantId,
      psp: body.psp,
      enabledMethods: body.enabledMethods,
      config: body.config,
      maskedSecrets: { secretKey: body.psp === "omise" ? "skey_l••••••••f160" : "2c2p_l••••••••d9e4" },
      version: 1,
    });
    if (!connections.some((item) => item.pspConnectionId === created.pspConnectionId)) {
      connections.push(created);
    }
    return json(response, 201, created, { ETag: '"v1"' });
  }

  if (method === "PUT" && detailMatch) {
    if (!validMutation(request, true)) return problem(response, 400, "invalid_headers");
    if (scenario === "conflict") return problem(response, 409, "state_conflict");
    const body = await readJson(request);
    const currentIndex = connections.findIndex(
      (candidate) => candidate.pspConnectionId === detailMatch[1]?.toLowerCase(),
    );
    const updated = connection({
      ...(currentIndex >= 0 ? connections[currentIndex] : {}),
      merchantId: body.merchantId,
      enabledMethods: body.enabledMethods,
      config: body.config,
      isEnabled: body.isEnabled,
      version: 8,
    });
    if (currentIndex >= 0) connections[currentIndex] = updated;
    return json(response, 200, updated, { ETag: '"v8"' });
  }

  if (method === "POST" && url.pathname === "/api/v1/admins/auth/logout") {
    if (scenario === "logout-success") {
      response.writeHead(204, {
        "Set-Cookie": ["adm_session=; Max-Age=0; Path=/", "adm_csrf=; Max-Age=0; Path=/"],
      });
      return response.end();
    }
    return problem(response, 500, "logout_failed");
  }

  const testMatch = url.pathname.match(/^\/api\/v1\/payments\/psp-connections\/([0-9a-f-]+)\/test$/i);
  if (method === "POST" && testMatch) {
    if (!validMutation(request, true)) return problem(response, 400, "invalid_headers");
    if (scenario === "operation-in-progress") return problem(response, 409, "operation_in_progress");
    if (scenario === "test-failed") return problem(response, 502, "psp_test_failed");
    return json(
      response,
      200,
      connection({ version: 8, lastTestedAt: "2026-08-19T03:00:00Z" }),
      { ETag: '"v8"' },
    );
  }

  const credentialMatch = url.pathname.match(
    /^\/api\/v1\/payments\/psp-connections\/([0-9a-f-]+)\/credential-change-requests$/i,
  );
  if (method === "POST" && credentialMatch) {
    if (!validMutation(request, true)) return problem(response, 400, "invalid_headers");
    if (scenario === "credential-conflict") return problem(response, 409);
    await readJson(request);
    if (scenario === "unknown-outcome" && unknownCredentialAttempt === null) {
      unknownCredentialAttempt = {
        etag: request.headers["if-match"],
        key: request.headers["idempotency-key"],
      };
      return request.socket.destroy();
    }
    if (
      scenario === "unknown-outcome" &&
      (unknownCredentialAttempt.etag !== request.headers["if-match"] ||
        unknownCredentialAttempt.key !== request.headers["idempotency-key"])
    ) {
      return problem(response, 409, "idempotency_key_reused");
    }
    const targetId = credentialMatch[1]?.toLowerCase();
    const currentIndex = connections.findIndex(
      (candidate) => candidate.pspConnectionId === targetId,
    );
    if (currentIndex >= 0) {
      connections[currentIndex] = {
        ...connections[currentIndex],
        hasPendingCredentialChange: true,
        version: connections[currentIndex].version + 1,
      };
    }
    credentialPendingTargets.add(targetId);
    return json(response, 202, {
      approvalId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      candidateVersionId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      status: "pending",
      replayed: false,
    });
  }

  const settingsMatch = url.pathname.match(
    /^\/api\/v1\/payments\/merchant-settings\/([0-9a-f-]+)$/i,
  );
  if (method === "GET" && settingsMatch) {
    return json(response, 200, merchantSettings, { ETag: `"v${merchantSettings.version}"` });
  }

  const envChangeMatch = url.pathname.match(
    /^\/api\/v1\/payments\/merchant-settings\/([0-9a-f-]+)\/environment-change-requests$/i,
  );
  if (method === "POST" && envChangeMatch) {
    if (!validMutation(request, true)) return problem(response, 400, "invalid_headers");
    if (scenario === "settings-conflict") return problem(response, 409, "state_conflict");
    if (scenario === "settings-pending-env") return problem(response, 409, "approval_pending");
    const body = await readJson(request);
    merchantSettings.pendingEnvironment = body.targetEnvironment;
    merchantSettings.pendingApprovalId = "77777777-7777-4777-8777-777777777777";
    merchantSettings.version += 1;
    return json(response, 202, {
      approvalId: "77777777-7777-4777-8777-777777777777",
      merchantId,
      targetEnvironment: body.targetEnvironment,
      connectionCount: Array.isArray(body.connections) ? body.connections.length : 0,
      status: "pending",
      replayed: false,
    });
  }

  const simpleRoutingMatch = url.pathname.match(
    /^\/api\/v1\/payments\/merchant-settings\/([0-9a-f-]+)\/simple-routing$/i,
  );
  if (simpleRoutingMatch) {
    const rules = ["card", "promptpay", "installment"].map((m) => {
      const rule = routingRuleset.rules.find((r) => r.method === m);
      return {
        method: m,
        primaryConnectionId: rule ? rule.targetConnectionId : null,
        fallbackConnectionId: rule ? rule.fallbackConnectionId : null,
      };
    });
    const view = {
      merchantId,
      rulesetId: noDraft ? null : routingRuleset.rulesetId,
      status: noDraft ? "none" : routingRuleset.status,
      version: routingVersion,
      rules,
      advancedReadOnly: advancedRouting,
    };
    if (method === "GET") {
      return json(response, 200, view, { ETag: `"v${routingVersion}"` });
    }
    if (method === "PUT") {
      if (!validMutation(request, true)) return problem(response, 400, "invalid_headers");
      const body = await readJson(request);
      // EnsureMerchant (AdminControlEndpoints.cs:1085): body.merchantId ว่างหรือไม่ตรง route -> 400
      if (!body.merchantId || body.merchantId !== simpleRoutingMatch[1]?.toLowerCase()) {
        return problem(response, 400, "validation_failed");
      }
      if (advancedRouting) return problem(response, 409, "advanced_routing_read_only");
      if (scenario === "settings-conflict") return problem(response, 409, "state_conflict");
      const nextRules = Array.isArray(body.rules) ? body.rules : rules;
      // persist rules กลับเข้า ruleset เพื่อให้ GET ครั้งถัดไปคืนค่าที่บันทึก (AC-5)
      routingRuleset.rules = nextRules.map((row, index) => {
        const existing = routingRuleset.rules.find((r) => r.method === row.method);
        return {
          ruleId: existing?.ruleId ?? `rule-${row.method}`,
          priority: existing?.priority ?? index + 1,
          method: row.method,
          originatorId: null,
          minAmount: null,
          maxAmount: null,
          targetConnectionId: row.primaryConnectionId ?? null,
          fallbackConnectionId: row.fallbackConnectionId ?? null,
          enabled: true,
        };
      });
      routingVersion += 1;
      routingRuleset.version = routingVersion;
      return json(
        response,
        200,
        { ...view, rulesetId: routingRuleset.rulesetId, status: routingRuleset.status, rules: nextRules, version: routingVersion },
        { ETag: `"v${routingVersion}"` },
      );
    }
  }

  const accountMethodMatch = url.pathname.match(
    /^\/api\/v1\/payments\/psp-connections\/([0-9a-f-]+)\/methods\/([a-z]+)$/i,
  );
  if (accountMethodMatch) {
    if (scenario === "settings-methods-forbidden") return problem(response, 403, "merchant_scope_forbidden");
    const key = `${accountMethodMatch[1]?.toLowerCase()}:${accountMethodMatch[2]}`;
    const state = accountMethods.get(key);
    if (!state) return problem(response, 404, "not_found");
    if (method === "GET") return json(response, 200, state, { ETag: `"v${state.version}"` });
    if (method === "PUT") {
      if (!validMutation(request, true)) return problem(response, 400, "invalid_headers");
      if (scenario === "settings-conflict") return problem(response, 409, "state_conflict");
      const body = await readJson(request);
      state.enabled = Boolean(body.enabled);
      state.version += 1;
      state.denial = state.enabled ? null : state.denial;
      return json(response, 200, state, { ETag: `"v${state.version}"` });
    }
  }

  const merchantMethodsListMatch = url.pathname.match(
    /^\/api\/v1\/payments\/merchants\/([0-9a-f-]+)\/methods$/i,
  );
  if (method === "GET" && merchantMethodsListMatch) {
    if (scenario === "settings-methods-forbidden") return problem(response, 403, "merchant_scope_forbidden");
    const methods = [...merchantMethods.values()]
      .filter((state) => state.effective)
      .map((state) => ({ method: state.method }));
    return json(response, 200, methods);
  }

  const merchantMethodMatch = url.pathname.match(
    /^\/api\/v1\/payments\/merchants\/([0-9a-f-]+)\/methods\/([a-z]+)$/i,
  );
  if (merchantMethodMatch) {
    if (scenario === "settings-methods-forbidden") return problem(response, 403, "merchant_scope_forbidden");
    const state = merchantMethods.get(merchantMethodMatch[2]);
    if (!state) return problem(response, 404, "not_found");
    if (method === "GET") return json(response, 200, state, { ETag: `"v${state.version}"` });
    if (method === "PUT") {
      if (!validMutation(request, true)) return problem(response, 400, "invalid_headers");
      if (scenario === "settings-conflict") return problem(response, 409, "state_conflict");
      const body = await readJson(request);
      state.enabled = Boolean(body.enabled);
      state.effective = state.enabled;
      state.version += 1;
      return json(response, 200, state, { ETag: `"v${state.version}"` });
    }
  }

  if (method === "GET" && url.pathname === "/api/v1/payments/routing-rulesets") {
    const requested = url.searchParams.get("merchantId");
    const items = requested && requested !== merchantId ? [] : [routingRuleset];
    return json(response, 200, page(items, url));
  }

  const activationMatch = url.pathname.match(
    /^\/api\/v1\/payments\/routing-rulesets\/([0-9a-f-]+)\/activation-requests$/i,
  );
  if (method === "POST" && activationMatch) {
    if (!validMutation(request, true)) return problem(response, 400, "invalid_headers");
    const body = await readJson(request);
    // backend ไม่มี EnsureMerchant บน route นี้: merchantId ขาด/ไม่ตรง -> EnsureAccess -> 404 ไม่มี code
    if (!body.merchantId || body.merchantId !== routingRuleset.merchantId) {
      return problem(response, 404);
    }
    if (scenario === "settings-conflict") return problem(response, 409, "state_conflict");
    return json(response, 202, {
      approvalId: "99999999-9999-4999-8999-999999999999",
      ruleset: { ...routingRuleset, status: "pending", approvalId: "99999999-9999-4999-8999-999999999999" },
      replayed: false,
    });
  }

  const candidateTestMatch = url.pathname.match(
    /^\/api\/v1\/payments\/psp-connections\/([0-9a-f-]+)\/credential-change-requests\/([0-9a-f-]+)\/test$/i,
  );
  if (method === "POST" && candidateTestMatch) {
    if (!validMutation(request, true)) return problem(response, 400, "invalid_headers");
    const body = await readJson(request);
    const targetId = candidateTestMatch[1]?.toLowerCase();
    const index = connections.findIndex((c) => c.pspConnectionId === targetId);
    if (index < 0) return problem(response, 404);
    // backend ไม่มี EnsureMerchant บน route นี้: merchantId ขาด/ไม่ตรง -> EnsureAccess -> 404 ไม่มี code
    if (!body.merchantId || body.merchantId !== connections[index].merchantId) {
      return problem(response, 404);
    }
    if (scenario === "settings-candidate-failed") {
      return problem(response, 502, "psp_test_failed");
    }
    // คืน connection เต็ม + ETag ใหม่; ผล test อยู่ที่ pendingCredentialTest (D1)
    const updated = {
      ...connections[index],
      version: connections[index].version + 1,
      pendingCredentialTest: { result: "authenticated", testedAt: "2026-09-06T11:00:00Z" },
    };
    connections[index] = updated;
    return json(response, 200, updated, { ETag: `"v${updated.version}"` });
  }

  return problem(response, 404, "not_found");
});

server.listen(port, host, () => {
  console.log(`PSP contract server: http://${host}:${port} (${scenario})`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
