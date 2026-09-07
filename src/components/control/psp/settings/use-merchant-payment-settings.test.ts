import { afterEach, describe, expect, it, vi } from "vitest";

import { PspApiError } from "@/lib/api/control/psp";
import type { PspConnection } from "@/types/control/psp-connection";

const MERCHANT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const C2P = "11111111-1111-4111-8111-111111111111";

const { api, loadPendingApprovals } = vi.hoisted(() => ({
  api: {
    getMerchantPaymentSettings: vi.fn(),
    listMerchantConnections: vi.fn(),
    getMerchantMethod: vi.fn(),
    getAccountMethod: vi.fn(),
    listEffectiveMethods: vi.fn(),
    listRoutingRulesets: vi.fn(),
    getSimpleRouting: vi.fn(),
  },
  loadPendingApprovals: vi.fn(),
}));

vi.mock("@/lib/api/control/merchant-payment-settings", () => api);
vi.mock("@/components/control/psp/resource-hooks", () => ({ loadPendingApprovals }));

import { loadData } from "./use-merchant-payment-settings";

function connection(): PspConnection {
  return {
    pspConnectionId: C2P,
    merchantId: MERCHANT,
    psp: "2c2p",
    enabledMethods: ["card"],
    config: null,
    maskedSecrets: {},
    isEnabled: true,
    health: "healthy",
    lastTestedAt: null,
    lastTestResult: null,
    capabilities: { test: true },
    hasPendingCredentialChange: false,
    createdAt: "2026-08-01T00:00:00Z",
    version: 1,
  };
}

function settingsResource() {
  return {
    settings: {
      merchantId: MERCHANT,
      environment: "sandbox" as const,
      pendingEnvironment: null,
      pendingApprovalId: null,
      updatedAt: "2026-09-06T00:00:00Z",
      version: 4,
    },
    etag: '"v4"',
  };
}

function methodResource(method: "card" | "promptpay" | "installment") {
  return {
    state: { merchantId: MERCHANT, method, enabled: true, effective: true, version: 2, denial: null },
    etag: '"v2"',
  };
}

function accountResource(method: "card" | "promptpay" | "installment") {
  return {
    state: {
      pspConnectionId: C2P,
      merchantId: MERCHANT,
      provider: "2c2p" as const,
      method,
      enabled: true,
      version: 2,
      adapterVerified: true,
      denial: null,
    },
    etag: '"v2"',
  };
}

function routingResource() {
  return {
    routing: {
      merchantId: MERCHANT,
      rulesetId: "r-1",
      status: "active",
      version: 3,
      rules: [],
      advancedReadOnly: false,
    },
    etag: '"v3"',
  };
}

afterEach(() => vi.clearAllMocks());

describe("loadData resilience (AC-3)", () => {
  it("returns not-found/forbidden by the settings status code", async () => {
    api.getMerchantPaymentSettings.mockRejectedValueOnce(new PspApiError(404, "not_found"));
    await expect(loadData(MERCHANT, new AbortController().signal)).resolves.toMatchObject({
      status: "not-found",
    });
    api.getMerchantPaymentSettings.mockRejectedValueOnce(new PspApiError(403, "forbidden"));
    await expect(loadData(MERCHANT, new AbortController().signal)).resolves.toMatchObject({
      status: "forbidden",
    });
  });

  it("marks only the methods section unavailable when method endpoints fail", async () => {
    api.getMerchantPaymentSettings.mockResolvedValue(settingsResource());
    api.listMerchantConnections.mockResolvedValue([connection()]);
    api.getMerchantMethod.mockRejectedValue(new PspApiError(403, "forbidden"));
    api.getAccountMethod.mockRejectedValue(new PspApiError(403, "forbidden"));
    api.listEffectiveMethods.mockRejectedValue(new PspApiError(403, "forbidden"));
    api.listRoutingRulesets.mockResolvedValue([]);
    api.getSimpleRouting.mockResolvedValue(routingResource());
    loadPendingApprovals.mockResolvedValue({ status: "ready", items: [] });

    const result = await loadData(MERCHANT, new AbortController().signal);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") throw new Error("unreachable");
    expect(result.data.sections.methods).toBe("unavailable");
    expect(result.data.sections.routing).toBe("ready");
    expect(result.data.sections.connections).toBe("ready");
  });

  it("marks methods ready when every method endpoint resolves", async () => {
    api.getMerchantPaymentSettings.mockResolvedValue(settingsResource());
    api.listMerchantConnections.mockResolvedValue([connection()]);
    api.getMerchantMethod.mockImplementation((_m: string, method: "card" | "promptpay" | "installment") =>
      Promise.resolve(methodResource(method)),
    );
    api.getAccountMethod.mockImplementation((_c: string, method: "card" | "promptpay" | "installment") =>
      Promise.resolve(accountResource(method)),
    );
    api.listEffectiveMethods.mockResolvedValue(["card"]);
    api.listRoutingRulesets.mockResolvedValue([]);
    api.getSimpleRouting.mockResolvedValue(routingResource());
    loadPendingApprovals.mockResolvedValue({ status: "ready", items: [] });

    const result = await loadData(MERCHANT, new AbortController().signal);
    if (result.status !== "ready") throw new Error("unreachable");
    expect(result.data.sections.methods).toBe("ready");
    expect(result.data.merchantMethods).toHaveLength(3);
    expect(result.data.accountMethods).toHaveLength(3);
  });

  it("marks the approvals section unavailable when approvals fail to load", async () => {
    api.getMerchantPaymentSettings.mockResolvedValue(settingsResource());
    api.listMerchantConnections.mockResolvedValue([connection()]);
    api.getMerchantMethod.mockImplementation((_m: string, method: "card" | "promptpay" | "installment") =>
      Promise.resolve(methodResource(method)),
    );
    api.getAccountMethod.mockImplementation((_c: string, method: "card" | "promptpay" | "installment") =>
      Promise.resolve(accountResource(method)),
    );
    api.listEffectiveMethods.mockResolvedValue(["card"]);
    api.listRoutingRulesets.mockResolvedValue([]);
    api.getSimpleRouting.mockResolvedValue(routingResource());
    loadPendingApprovals.mockResolvedValue({ status: "unavailable", items: [] });

    const result = await loadData(MERCHANT, new AbortController().signal);
    if (result.status !== "ready") throw new Error("unreachable");
    expect(result.data.sections.approvals).toBe("unavailable");
    expect(result.data.approvals).toBeNull();
  });
});
