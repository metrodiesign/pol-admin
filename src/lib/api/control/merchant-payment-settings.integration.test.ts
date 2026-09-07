import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PspApiError } from "./psp";
import {
  getMerchantPaymentSettings,
  getSimpleRouting,
  listEffectiveMethods,
  listRoutingRulesets,
  putSimpleRouting,
  requestEnvironmentChange,
  requestRoutingActivation,
  setAccountMethod,
  setMerchantMethod,
  testCandidateCredential,
} from "./merchant-payment-settings";

interface CapturedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

interface FixtureResponse {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

const nativeFetch = globalThis.fetch.bind(globalThis);
const MERCHANT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CONNECTION = "11111111-1111-4111-8111-111111111111";
const RULESET = "88888888-8888-4888-8888-888888888888";
const APPROVAL = "77777777-7777-4777-8777-777777777777";

describe("Merchant payment settings HTTP contract", () => {
  let server: Server;
  let origin: string;
  let queue: FixtureResponse[];
  let captured: CapturedRequest[];

  beforeEach(async () => {
    queue = [];
    captured = [];
    server = createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", () => {
        captured.push({
          method: request.method ?? "GET",
          url: request.url ?? "/",
          headers: Object.fromEntries(
            Object.entries(request.headers).flatMap(([name, value]) =>
              value === undefined ? [] : [[name, Array.isArray(value) ? value.join(", ") : value]],
            ),
          ),
          body: Buffer.concat(chunks).toString("utf8"),
        });
        const fixture = queue.shift() ?? { status: 500, body: { code: "missing_fixture" } };
        response.writeHead(fixture.status, {
          "Content-Type": "application/json",
          ...fixture.headers,
        });
        response.end(fixture.body === undefined ? "" : JSON.stringify(fixture.body));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address() as AddressInfo;
    origin = `http://127.0.0.1:${address.port}`;

    vi.stubGlobal("document", { cookie: "adm_csrf=csrf-token" });
    vi.stubGlobal("window", { location: { href: "" } });
    vi.stubGlobal("fetch", (input: string | URL | Request, init: RequestInit = {}) => {
      const target =
        typeof input === "string" && input.startsWith("/") ? new URL(input, origin) : input;
      return nativeFetch(target, init);
    });
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  it("reads settings and preserves the quoted ETag", async () => {
    queue.push({
      status: 200,
      body: {
        merchantId: MERCHANT,
        environment: "sandbox",
        pendingEnvironment: null,
        pendingApprovalId: null,
        updatedAt: "2026-09-06T00:00:00Z",
        version: 4,
      },
      headers: { ETag: '"v4"' },
    });

    const result = await getMerchantPaymentSettings(MERCHANT);
    expect(result.etag).toBe('"v4"');
    expect(result.settings.environment).toBe("sandbox");
    expect(captured[0]).toMatchObject({
      method: "GET",
      url: `/api/v1/payments/merchant-settings/${MERCHANT}`,
    });
    expect(captured[0]?.headers["idempotency-key"]).toBeUndefined();
  });

  it("sends Idempotency-Key, If-Match and X-CSRF-Token on environment change", async () => {
    queue.push({
      status: 202,
      body: {
        approvalId: APPROVAL,
        merchantId: MERCHANT,
        targetEnvironment: "live",
        connectionCount: 1,
        status: "pending",
        replayed: false,
      },
    });

    const accepted = await requestEnvironmentChange(
      MERCHANT,
      {
        targetEnvironment: "live",
        omiseWebhookRegistered: true,
        connections: [
          { pspConnectionId: CONNECTION, psp: "2c2p", pspMerchantId: "acct", secrets: { secretKey: "sk" } },
        ],
      },
      '"v4"',
      "idem-1",
    );

    expect(accepted.status).toBe("pending");
    expect(captured[0]?.method).toBe("POST");
    expect(captured[0]?.headers["idempotency-key"]).toBe("idem-1");
    expect(captured[0]?.headers["if-match"]).toBe('"v4"');
    expect(captured[0]?.headers["x-csrf-token"]).toBe("csrf-token");
  });

  it("round-trips ETag on method PUTs and carries the required headers", async () => {
    queue.push({
      status: 200,
      body: {
        pspConnectionId: CONNECTION,
        merchantId: MERCHANT,
        provider: "2c2p",
        method: "card",
        enabled: true,
        version: 3,
      },
      headers: { ETag: '"v3"' },
    });
    queue.push({
      status: 200,
      body: { merchantId: MERCHANT, method: "card", enabled: true, effective: true, version: 3 },
      headers: { ETag: '"v3"' },
    });

    const account = await setAccountMethod(CONNECTION, "card", true, '"v2"', "idem-a");
    const merchant = await setMerchantMethod(MERCHANT, "card", true, '"v2"', "idem-m");

    expect(account.etag).toBe('"v3"');
    expect(merchant.etag).toBe('"v3"');
    expect(captured[0]?.headers["if-match"]).toBe('"v2"');
    expect(captured[0]?.headers["idempotency-key"]).toBe("idem-a");
    expect(captured[0]?.url).toBe(`/api/v1/payments/psp-connections/${CONNECTION}/methods/card`);
    expect(captured[1]?.url).toBe(`/api/v1/payments/merchants/${MERCHANT}/methods/card`);
  });

  it("reads effective methods and paginates routing rulesets", async () => {
    queue.push({ status: 200, body: [{ method: "card" }, { method: "promptpay" }] });
    queue.push({
      status: 200,
      body: {
        items: [
          { rulesetId: RULESET, merchantId: MERCHANT, name: "default", status: "active", approvalId: null, rules: [], version: 3 },
        ],
        page: 1,
        limit: 100,
        total: 1,
      },
    });

    await expect(listEffectiveMethods(MERCHANT)).resolves.toEqual(["card", "promptpay"]);
    const rulesets = await listRoutingRulesets(MERCHANT);
    expect(rulesets).toHaveLength(1);
    expect(captured[1]?.url).toBe(
      `/api/v1/payments/routing-rulesets?merchantId=${MERCHANT}&page=1&limit=100`,
    );
  });

  it("saves simple routing draft and requests activation with headers and merchantId body (D2/D3)", async () => {
    queue.push({
      status: 200,
      body: {
        merchantId: MERCHANT,
        rulesetId: RULESET,
        status: "draft",
        version: 4,
        rules: [{ method: "card", primaryConnectionId: CONNECTION, fallbackConnectionId: null }],
        advancedReadOnly: false,
      },
      headers: { ETag: '"v4"' },
    });
    queue.push({
      status: 202,
      body: {
        approvalId: APPROVAL,
        ruleset: {
          rulesetId: RULESET,
          merchantId: MERCHANT,
          name: "default",
          status: "pending",
          approvalId: APPROVAL,
          rules: [],
          version: 4,
        },
        replayed: false,
      },
    });

    const routing = await putSimpleRouting(
      MERCHANT,
      [{ method: "card", primaryConnectionId: CONNECTION, fallbackConnectionId: null }],
      '"v3"',
      "idem-r",
    );
    expect(routing.etag).toBe('"v4"');
    expect(routing.routing.rules).toHaveLength(1);
    expect(captured[0]?.headers["if-match"]).toBe('"v3"');
    expect(captured[0]?.headers["x-csrf-token"]).toBe("csrf-token");
    // D3 body: {merchantId, rules}
    const routingBody = JSON.parse(captured[0]?.body ?? "{}");
    expect(routingBody.merchantId).toBe(MERCHANT);
    expect(routingBody.rules).toHaveLength(1);

    const activation = await requestRoutingActivation(RULESET, MERCHANT, '"v4"', "idem-act");
    expect(activation.ruleset.status).toBe("pending");
    expect(activation.replayed).toBe(false);
    expect(captured[1]?.url).toBe(
      `/api/v1/payments/routing-rulesets/${RULESET}/activation-requests`,
    );
    // D2 body: {merchantId}
    expect(JSON.parse(captured[1]?.body ?? "{}").merchantId).toBe(MERCHANT);
    expect(captured[1]?.headers["if-match"]).toBe('"v4"');
  });

  it("maps 409 settings codes to a PspApiError carrying only the safe code", async () => {
    queue.push({ status: 409, body: { status: 409, extensions: { code: "advanced_routing_read_only" } } });

    await expect(
      putSimpleRouting(MERCHANT, [], '"v3"', "idem-x"),
    ).rejects.toMatchObject({ status: 409, code: "advanced_routing_read_only" });
  });

  it("never surfaces a secret in the error object", async () => {
    queue.push({
      status: 413,
      body: { status: 413, extensions: { code: "request_too_large" }, secret: "must-not-leak" },
    });

    const error = await requestEnvironmentChange(
      MERCHANT,
      {
        targetEnvironment: "live",
        omiseWebhookRegistered: true,
        connections: [
          { pspConnectionId: CONNECTION, psp: "2c2p", pspMerchantId: "acct", secrets: { secretKey: "top-secret" } },
        ],
      },
      '"v4"',
      "idem-secret",
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(PspApiError);
    const serialized = JSON.stringify({
      message: (error as PspApiError).message,
      status: (error as PspApiError).status,
      code: (error as PspApiError).code,
    });
    expect(serialized).not.toContain("top-secret");
    expect(serialized).not.toContain("must-not-leak");
    expect((error as PspApiError).code).toBe("request_too_large");
  });

  it("returns the connection with a fresh ETag and pending test, sending merchantId (D1)", async () => {
    queue.push({
      status: 200,
      body: {
        pspConnectionId: CONNECTION,
        merchantId: MERCHANT,
        psp: "2c2p",
        enabledMethods: ["card"],
        config: null,
        maskedSecrets: { secretKey: "2c2p_l••••••••d9e4" },
        isEnabled: true,
        health: "healthy",
        lastTestedAt: null,
        lastTestResult: null,
        capabilities: { test: true },
        createdAt: "2026-08-18T00:00:00Z",
        version: 8,
        pendingCredentialTest: { result: "authenticated", testedAt: "2026-09-06T11:00:00Z" },
        webhookRegistration: null,
      },
      headers: { ETag: '"v8"' },
    });

    const result = await testCandidateCredential(CONNECTION, MERCHANT, APPROVAL, '"v4"', "idem-t");
    expect(result.etag).toBe('"v8"');
    expect(result.connection.pendingCredentialTest?.result).toBe("authenticated");
    expect(captured[0]?.url).toBe(
      `/api/v1/payments/psp-connections/${CONNECTION}/credential-change-requests/${APPROVAL}/test`,
    );
    expect(captured[0]?.headers["if-match"]).toBe('"v4"');
    // D1 body: {merchantId}
    expect(JSON.parse(captured[0]?.body ?? "{}").merchantId).toBe(MERCHANT);
    // credential hint ต้อง masked เท่านั้น (ไม่มี secret ดิบใน state)
    expect(result.connection.maskedSecrets.secretKey).toContain("•");
  });

  it("reads simple routing with its ETag (D3 shape)", async () => {
    queue.push({
      status: 200,
      body: {
        merchantId: MERCHANT,
        rulesetId: RULESET,
        status: "active",
        version: 3,
        rules: [],
        advancedReadOnly: true,
      },
      headers: { ETag: '"v3"' },
    });
    const result = await getSimpleRouting(MERCHANT);
    expect(result.etag).toBe('"v3"');
    expect(result.routing.advancedReadOnly).toBe(true);
  });

  it("sends If-Match \"v0\" when simple-routing has no draft yet (AC-9)", async () => {
    queue.push({
      status: 200,
      body: {
        merchantId: MERCHANT,
        rulesetId: null,
        status: "none",
        version: 0,
        rules: [],
        advancedReadOnly: false,
      },
      headers: { ETag: '"v0"' },
    });
    queue.push({
      status: 200,
      body: {
        merchantId: MERCHANT,
        rulesetId: RULESET,
        status: "draft",
        version: 1,
        rules: [{ method: "card", primaryConnectionId: CONNECTION, fallbackConnectionId: null }],
        advancedReadOnly: false,
      },
      headers: { ETag: '"v1"' },
    });

    const read = await getSimpleRouting(MERCHANT);
    expect(read.etag).toBe('"v0"');
    expect(read.routing.rulesetId).toBeNull();

    await putSimpleRouting(
      MERCHANT,
      [{ method: "card", primaryConnectionId: CONNECTION, fallbackConnectionId: null }],
      read.etag!,
      "idem-v0",
    );
    expect(captured[1]?.headers["if-match"]).toBe('"v0"');
    expect(JSON.parse(captured[1]?.body ?? "{}").merchantId).toBe(MERCHANT);
  });
});
