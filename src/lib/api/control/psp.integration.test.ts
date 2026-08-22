import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PspApiError,
  createPspConnection,
  getPspConnection,
  listApprovalPage,
  listMerchantPage,
  listPspConnections,
  requestCredentialChange,
  testPspConnection,
  updatePspConnection,
} from "./psp";
import type { PspConnection } from "@/types/control/psp-connection";

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
const ID = "11111111-1111-4111-8111-111111111111";
const MERCHANT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function connection(overrides: Partial<PspConnection> = {}): PspConnection {
  return {
    pspConnectionId: ID,
    merchantId: MERCHANT_ID,
    psp: "2c2p",
    enabledMethods: ["card", "promptpay"],
    config: { accountId: "account", futureField: { preserved: true } },
    maskedSecrets: { secretKey: "masked" },
    isEnabled: true,
    health: "healthy",
    lastTestedAt: "2026-08-19T02:00:00Z",
    lastTestResult: "authenticated",
    capabilities: { test: true },
    hasPendingCredentialChange: false,
    createdAt: "2026-08-18T00:00:00Z",
    version: 7,
    ...overrides,
  };
}

describe("PSP API HTTP contract", () => {
  let server: Server;
  let origin: string;
  let queue: FixtureResponse[];
  let captured: CapturedRequest[];
  let fetchInits: RequestInit[];

  beforeEach(async () => {
    queue = [];
    captured = [];
    fetchInits = [];
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
    vi.stubGlobal("window", { location: { href: "", reload: vi.fn() } });
    vi.stubGlobal("fetch", (input: string | URL | Request, init: RequestInit = {}) => {
      fetchInits.push(init);
      const target = typeof input === "string" && input.startsWith("/")
        ? new URL(input, origin)
        : input;
      return nativeFetch(target, init);
    });
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  it("serialize List queryและ omitค่าว่าง", async () => {
    queue.push({ status: 200, body: { items: [connection()], page: 2, limit: 25, total: 26 } });

    const result = await listPspConnections({
      page: 2,
      limit: 25,
      search: "1111",
      merchantId: MERCHANT_ID,
      psp: "2c2p",
      health: "healthy",
    });

    expect(result.total).toBe(26);
    expect(captured[0]).toMatchObject({
      method: "GET",
      url: `/api/v1/payments/psp-connections?page=2&limit=25&search=1111&merchantId=${MERCHANT_ID}&psp=2c2p&health=healthy`,
      body: "",
    });
    expect(captured[0]?.headers["if-match"]).toBeUndefined();
    expect(captured[0]?.headers["idempotency-key"]).toBeUndefined();
    expect(fetchInits[0]?.credentials).toBe("include");
  });

  it("รักษา 403 จาก PSP List เป็น permission signal", async () => {
    queue.push({ status: 403, body: { code: "forbidden" } });

    await expect(listPspConnections({ page: 1, limit: 25 })).rejects.toMatchObject({
      status: 403,
    });
  });

  it("serialize merchant/approval pagination pathและ mapเฉพาะ safe fields", async () => {
    queue.push(
      {
        status: 200,
        body: {
          items: [{ id: MERCHANT_ID, name: "Merchant A", code: "MA", internal: "drop" }],
          page: 1,
          limit: 100,
          total: 1,
        },
      },
      {
        status: 200,
        body: {
          items: [
            {
              approvalId: "approval-1",
              merchantId: MERCHANT_ID,
              action: "psp.credential.change",
              targetId: ID,
              status: "pending",
              correlationId: "drop",
            },
          ],
          page: 3,
          limit: 100,
          total: 201,
        },
      },
    );

    await expect(listMerchantPage(1, 100)).resolves.toMatchObject({
      items: [{ id: MERCHANT_ID, name: "Merchant A", code: "MA" }],
    });
    await expect(
      listApprovalPage({
        page: 3,
        limit: 100,
        search: ID,
        action: "psp.credential.change",
        status: "pending",
      }),
    ).resolves.toMatchObject({
      items: [
        {
          approvalId: "approval-1",
          merchantId: MERCHANT_ID,
          action: "psp.credential.change",
          targetId: ID,
          status: "pending",
        },
      ],
    });
    expect(captured.map((request) => request.url)).toEqual([
      "/api/v1/merchants?page=1&limit=100",
      `/api/v1/approvals?page=3&limit=100&search=${ID}&action=psp.credential.change&status=pending`,
    ]);
  });

  it("เก็บ raw quoted ETagจาก Info รวม missing ETag", async () => {
    queue.push(
      { status: 200, body: connection(), headers: { ETag: '"v7"' } },
      { status: 200, body: connection() },
    );

    await expect(getPspConnection(ID)).resolves.toMatchObject({ etag: '"v7"' });
    await expect(getPspConnection(ID)).resolves.toMatchObject({ etag: null });
    expect(captured[0]?.url).toBe(`/api/v1/payments/psp-connections/${ID}`);
  });

  it("Create ส่ง JSON, CSRF, key และ credentialใต้ secretsเท่านั้น", async () => {
    queue.push({ status: 201, body: connection(), headers: { ETag: '"v1"' } });
    const input = {
      merchantId: MERCHANT_ID,
      psp: "2c2p" as const,
      enabledMethods: ["card" as const],
      config: null,
      secrets: { secretKey: "create-secret" },
      pspMerchantId: "merchant-account",
    };

    await expect(createPspConnection(input, "create-key")).resolves.toMatchObject({ etag: '"v1"' });

    const request = captured[0]!;
    expect(request.method).toBe("POST");
    expect(request.url).toBe("/api/v1/payments/psp-connections");
    expect(request.headers["content-type"]).toBe("application/json");
    expect(request.headers["x-csrf-token"]).toBe("csrf-token");
    expect(request.headers["idempotency-key"]).toBe("create-key");
    expect(request.headers["if-match"]).toBeUndefined();
    expect(JSON.parse(request.body)).toEqual(input);
    expect(Object.keys(JSON.parse(request.body))).not.toContain("secretKey");
  });

  it("Update round-trip configเดิมและไม่มี credential", async () => {
    const rawConfig = { accountId: "acct", future: { keep: true } };
    queue.push({ status: 200, body: connection({ config: rawConfig }), headers: { ETag: '"v8"' } });

    await updatePspConnection(
      ID,
      { merchantId: MERCHANT_ID, enabledMethods: ["card"], config: rawConfig, isEnabled: false },
      '"v7"',
      "update-key",
    );

    const request = captured[0]!;
    const body = JSON.parse(request.body) as Record<string, unknown>;
    expect(request.method).toBe("PUT");
    expect(request.headers["if-match"]).toBe('"v7"');
    expect(request.headers["idempotency-key"]).toBe("update-key");
    expect(request.headers["x-csrf-token"]).toBe("csrf-token");
    expect(body.config).toEqual(rawConfig);
    expect(body).not.toHaveProperty("secrets");
    expect(body).not.toHaveProperty("pspMerchantId");
  });

  it("Test ส่งเฉพาะ merchantIdและรับ ETagใหม่", async () => {
    queue.push({ status: 200, body: connection({ version: 8 }), headers: { ETag: '"v8"' } });

    await expect(
      testPspConnection(ID, { merchantId: MERCHANT_ID }, '"v7"', "test-key"),
    ).resolves.toMatchObject({ etag: '"v8"' });
    expect(JSON.parse(captured[0]!.body)).toEqual({ merchantId: MERCHANT_ID });
    expect(captured[0]?.headers["if-match"]).toBe('"v7"');
    expect(captured[0]?.headers["idempotency-key"]).toBe("test-key");
  });

  it("Credential request ส่ง secretใต้ secretsและ 202ไม่สร้าง ETag", async () => {
    const accepted = {
      approvalId: "approval-1",
      candidateVersionId: "candidate-1",
      status: "pending",
      replayed: false,
    };
    queue.push({ status: 202, body: accepted });

    await expect(
      requestCredentialChange(
        ID,
        {
          merchantId: MERCHANT_ID,
          secrets: { secretKey: "next-secret" },
          pspMerchantId: "next-account",
        },
        '"v7"',
        "credential-key",
      ),
    ).resolves.toEqual(accepted);
    const body = JSON.parse(captured[0]!.body) as Record<string, unknown>;
    expect(body.secrets).toEqual({ secretKey: "next-secret" });
    expect(body).not.toHaveProperty("secretKey");
    expect(captured[0]?.headers["content-type"]).toBe("application/json");
    expect(captured[0]?.headers["if-match"]).toBe('"v7"');
  });

  it.each([
    [401, null],
    [403, null],
    [404, "not_found"],
    [409, "state_conflict"],
    [409, "idempotency_key_reused"],
    [409, "operation_in_progress"],
    [409, null],
    [502, "psp_test_failed"],
  ] as const)("คืน safe error %s/%s", async (status, code) => {
    const body = code
      ? { detail: "secret backend detail", extensions: { code } }
      : { detail: "secret backend detail" };
    queue.push({ status, body });

    const error = await getPspConnection(ID).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(PspApiError);
    expect(error).toMatchObject({ status, code });
    expect((error as Error).message).not.toContain("secret backend detail");
  });

  it("อ่าน top-level codeและ map network failureโดยไม่เผย errorดิบ", async () => {
    queue.push({ status: 400, body: { code: "validation_failed", detail: "do not expose" } });
    const serverError = await getPspConnection(ID).catch((caught: unknown) => caught);
    expect(serverError).toMatchObject({ status: 400, code: "validation_failed" });

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("request body leaked")));
    const networkError = await getPspConnection(ID).catch((caught: unknown) => caught);
    expect(networkError).toMatchObject({ status: null, code: null });
    expect((networkError as Error).message).not.toContain("request body leaked");
  });
});
