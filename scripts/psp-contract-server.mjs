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
    ...overrides,
  };
}

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
    (!needsEtag || (typeof etag === "string" && /^"v[1-9][0-9]*"$/.test(etag)))
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

  return problem(response, 404, "not_found");
});

server.listen(port, host, () => {
  console.log(`PSP contract server: http://${host}:${port} (${scenario})`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
