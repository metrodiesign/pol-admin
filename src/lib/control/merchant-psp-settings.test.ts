import { describe, expect, it } from "vitest";

import {
  buildEnvironmentChangeConnections,
  buildMethodMatrix,
  CANONICAL_METHODS,
  currentReadinessStep,
  deriveReadiness,
  hasAdvancedRules,
  mapSettingsProblem,
  methodToggleGate,
  OMISE_UNVERIFIED_MESSAGE,
  resolveActivationTarget,
  routingCandidates,
  simpleRowsFromRuleset,
  validateEnvironmentChange,
  validateSimpleRouting,
  type EnvironmentConnectionDraft,
} from "./merchant-psp-settings";
import type {
  AccountMethodState,
  MerchantMethodState,
  MerchantPaymentSettings,
  RoutingRuleset,
  SimpleRoutingView,
} from "@/types/control/merchant-payment-settings";
import type { PspConnection } from "@/types/control/psp-connection";

const MERCHANT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const C2P = "11111111-1111-4111-8111-111111111111";
const OMISE = "22222222-2222-4222-8222-222222222222";

function settings(overrides: Partial<MerchantPaymentSettings> = {}): MerchantPaymentSettings {
  return {
    merchantId: MERCHANT,
    environment: "sandbox",
    pendingEnvironment: null,
    pendingApprovalId: null,
    updatedAt: "2026-09-01T00:00:00Z",
    version: 3,
    ...overrides,
  };
}

function connection(overrides: Partial<PspConnection> = {}): PspConnection {
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
    credentialEnvironment: "sandbox",
    ...overrides,
  };
}

function merchantMethod(
  method: MerchantMethodState["method"],
  enabled: boolean,
): MerchantMethodState {
  return { merchantId: MERCHANT, method, enabled, effective: enabled, version: 1, denial: null };
}

function accountMethod(
  pspConnectionId: string,
  method: AccountMethodState["method"],
  enabled: boolean,
  denial: string | null = null,
): AccountMethodState {
  return {
    pspConnectionId,
    merchantId: MERCHANT,
    provider: pspConnectionId === OMISE ? "omise" : "2c2p",
    method,
    enabled,
    version: 1,
    adapterVerified: enabled,
    denial,
  };
}

function routingView(
  rules: SimpleRoutingView["rules"],
  overrides: Partial<SimpleRoutingView> = {},
): SimpleRoutingView {
  return {
    merchantId: MERCHANT,
    rulesetId: "r-1",
    status: "draft",
    version: 1,
    rules,
    advancedReadOnly: false,
    ...overrides,
  };
}

describe("deriveReadiness", () => {
  it("returns 5 steps and marks environment blocked when settings missing", () => {
    const steps = deriveReadiness({
      settings: null,
      connections: [],
      merchantMethods: [],
      routing: null,
    });
    expect(steps.map((s) => s.id)).toEqual([
      "environment",
      "connections",
      "methods",
      "routing",
      "ready",
    ]);
    expect(steps[0]?.state).toBe("blocked");
  });

  it("marks environment pending when there is a pending target", () => {
    const steps = deriveReadiness({
      settings: settings({ pendingEnvironment: "live" }),
      connections: [connection(), connection({ pspConnectionId: OMISE, psp: "omise" })],
      merchantMethods: CANONICAL_METHODS.map((m) => merchantMethod(m, true)),
      routing: null,
    });
    expect(steps[0]?.state).toBe("pending");
    expect(steps[0]?.detail).toContain("LIVE");
  });

  it("counts connections and routing coverage", () => {
    const steps = deriveReadiness({
      settings: settings(),
      connections: [connection()],
      merchantMethods: [merchantMethod("card", true), merchantMethod("promptpay", true)],
      routing: routingView([
        { method: "card", primaryConnectionId: C2P, fallbackConnectionId: null },
        { method: "promptpay", primaryConnectionId: null, fallbackConnectionId: null },
      ]),
    });
    expect(steps[1]?.detail).toBe("เชื่อมต่อแล้ว 1/2");
    expect(steps[1]?.state).toBe("attention");
    expect(steps[2]?.detail).toBe("เปิดใช้ 2/3");
    expect(steps[3]?.detail).toBe("กำหนดหลักแล้ว 1/2");
    expect(steps[3]?.state).toBe("blocked");
  });

  it("marks ready done when every prior step is done", () => {
    const steps = deriveReadiness({
      settings: settings(),
      connections: [connection(), connection({ pspConnectionId: OMISE, psp: "omise" })],
      merchantMethods: CANONICAL_METHODS.map((m) => merchantMethod(m, true)),
      routing: routingView(
        CANONICAL_METHODS.map((method) => ({
          method,
          primaryConnectionId: C2P,
          fallbackConnectionId: null,
        })),
      ),
    });
    expect(steps[4]?.state).toBe("done");
    expect(currentReadinessStep(steps)).toBeNull();
  });

  it("currentReadinessStep points at the first non-done step", () => {
    const steps = deriveReadiness({
      settings: settings(),
      connections: [connection()],
      merchantMethods: [],
      routing: null,
    });
    expect(currentReadinessStep(steps)).toBe("connections");
  });
});

describe("buildMethodMatrix", () => {
  it("always renders three canonical rows regardless of provider support", () => {
    const rows = buildMethodMatrix({
      connections: [connection()],
      merchantMethods: [],
      accountMethods: [],
      routing: null,
    });
    expect(rows.map((r) => r.method)).toEqual(["card", "promptpay", "installment"]);
  });

  it("marks unconnected provider not-connected and reads enabled from account state", () => {
    const rows = buildMethodMatrix({
      connections: [connection()],
      merchantMethods: [merchantMethod("card", true)],
      accountMethods: [accountMethod(C2P, "card", true)],
      routing: null,
    });
    const card = rows[0]!;
    expect(card.providers["2c2p"]).toEqual({ status: "enabled", reason: null });
    expect(card.providers.omise).toEqual({ status: "not-connected" });
  });

  it("shows Omise disabled with backend reason, falling back to sandbox message", () => {
    const rows = buildMethodMatrix({
      connections: [connection({ pspConnectionId: OMISE, psp: "omise" })],
      merchantMethods: [],
      accountMethods: [accountMethod(OMISE, "card", false)],
      routing: null,
    });
    expect(rows[0]!.providers.omise).toEqual({
      status: "disabled",
      reason: OMISE_UNVERIFIED_MESSAGE,
    });
  });

  it("marks connected provider unavailable when no account state exists", () => {
    const rows = buildMethodMatrix({
      connections: [connection({ pspConnectionId: OMISE, psp: "omise" })],
      merchantMethods: [],
      accountMethods: [],
      routing: null,
    });
    expect(rows[0]!.providers.omise).toEqual({
      status: "unavailable",
      reason: OMISE_UNVERIFIED_MESSAGE,
    });
  });
});

describe("methodToggleGate", () => {
  it("requires merchant.manage", () => {
    expect(methodToggleGate(["settings.manage"], '"v1"')).toEqual({
      allowed: false,
      reason: "ไม่มีสิทธิ์ merchant.manage",
    });
  });

  it("requires an ETag", () => {
    expect(methodToggleGate(["merchant.manage"], null).allowed).toBe(false);
  });

  it("allows when permission and ETag present (pending credential does not block)", () => {
    expect(methodToggleGate(["merchant.manage"], '"v1"')).toEqual({
      allowed: true,
      reason: null,
    });
  });
});

describe("routingCandidates", () => {
  const conns = [
    connection(),
    connection({ pspConnectionId: OMISE, psp: "omise" }),
  ];
  const accounts = [accountMethod(C2P, "card", true), accountMethod(OMISE, "card", true)];

  it("disables a connection that is not enabled", () => {
    const result = routingCandidates({
      method: "card",
      connections: [connection({ isEnabled: false })],
      accountMethods: accounts,
      environment: "sandbox",
    });
    expect(result[0]!.disabledReason).toBe("ไม่เปิดใช้");
  });

  it("disables when the account-level method is off", () => {
    const result = routingCandidates({
      method: "card",
      connections: [connection()],
      accountMethods: [accountMethod(C2P, "card", false)],
      environment: "sandbox",
    });
    expect(result[0]!.disabledReason).toBe("ช่องทางระดับบัญชีไม่เปิด");
  });

  it("disables on credential environment mismatch", () => {
    const result = routingCandidates({
      method: "card",
      connections: [connection({ credentialEnvironment: "live" })],
      accountMethods: accounts,
      environment: "sandbox",
    });
    expect(result[0]!.disabledReason).toBe("credential ไม่ตรง environment");
  });

  it("disables the primary as a fallback option", () => {
    const result = routingCandidates({
      method: "card",
      connections: conns,
      accountMethods: accounts,
      environment: "sandbox",
      primaryConnectionId: C2P,
    });
    expect(result.find((c) => c.connectionId === C2P)!.disabledReason).toBe("ซ้ำกับหลัก");
    expect(result.find((c) => c.connectionId === OMISE)!.disabledReason).toBeNull();
  });

  it("returns null reason for an eligible candidate", () => {
    const result = routingCandidates({
      method: "card",
      connections: [connection()],
      accountMethods: accounts,
      environment: "sandbox",
    });
    expect(result[0]!.disabledReason).toBeNull();
  });
});

describe("hasAdvancedRules + simpleRowsFromRuleset", () => {
  function ruleset(rules: RoutingRuleset["rules"]): RoutingRuleset {
    return {
      rulesetId: "r-1",
      merchantId: MERCHANT,
      name: "default",
      status: "active",
      approvalId: null,
      rules,
      version: 1,
    };
  }

  it("detects amount, originator and any-method predicates", () => {
    expect(
      hasAdvancedRules(
        ruleset([
          {
            ruleId: "x",
            priority: 1,
            method: "any",
            originatorId: null,
            minAmount: null,
            maxAmount: null,
            targetConnectionId: C2P,
            fallbackConnectionId: null,
            enabled: true,
          },
        ]),
      ),
    ).toBe(true);
    expect(
      hasAdvancedRules(
        ruleset([
          {
            ruleId: "x",
            priority: 1,
            method: "card",
            originatorId: null,
            minAmount: "100",
            maxAmount: null,
            targetConnectionId: C2P,
            fallbackConnectionId: null,
            enabled: true,
          },
        ]),
      ),
    ).toBe(true);
  });

  it("returns false for plain per-method rules and null ruleset", () => {
    expect(hasAdvancedRules(null)).toBe(false);
    expect(
      hasAdvancedRules(
        ruleset([
          {
            ruleId: "x",
            priority: 1,
            method: "card",
            originatorId: null,
            minAmount: null,
            maxAmount: null,
            targetConnectionId: C2P,
            fallbackConnectionId: OMISE,
            enabled: true,
          },
        ]),
      ),
    ).toBe(false);
  });

  it("projects simple rows per canonical method", () => {
    const rows = simpleRowsFromRuleset(
      ruleset([
        {
          ruleId: "x",
          priority: 1,
          method: "card",
          originatorId: null,
          minAmount: null,
          maxAmount: null,
          targetConnectionId: C2P,
          fallbackConnectionId: OMISE,
          enabled: true,
        },
      ]),
    );
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({
      method: "card",
      primaryConnectionId: C2P,
      fallbackConnectionId: OMISE,
    });
    expect(rows[1]!.primaryConnectionId).toBeNull();
  });
});

describe("validateSimpleRouting", () => {
  it("flags enabled methods with no primary as routing_incomplete", () => {
    const result = validateSimpleRouting(
      [
        { method: "card", primaryConnectionId: C2P, fallbackConnectionId: null },
        { method: "promptpay", primaryConnectionId: null, fallbackConnectionId: null },
      ],
      ["card", "promptpay"],
    );
    expect(result.code).toBe("routing_incomplete");
    expect(result.incompleteMethods).toEqual(["promptpay"]);
  });

  it("passes when every enabled method has a primary", () => {
    const result = validateSimpleRouting(
      [{ method: "card", primaryConnectionId: C2P, fallbackConnectionId: null }],
      ["card"],
    );
    expect(result.code).toBeNull();
    expect(result.incompleteMethods).toEqual([]);
  });
});

describe("validateEnvironmentChange", () => {
  function draft(overrides: Partial<EnvironmentConnectionDraft> = {}): EnvironmentConnectionDraft {
    return {
      pspConnectionId: C2P,
      psp: "2c2p",
      pspMerchantId: "acct",
      secretKey: "secret",
      publicKey: "",
      webhookSecret: "",
      ...overrides,
    };
  }

  it("requires 2C2P pspMerchantId and secretKey", () => {
    const result = validateEnvironmentChange(
      [draft({ pspMerchantId: "", secretKey: "" })],
      "sandbox",
      false,
    );
    expect(result.valid).toBe(false);
    expect(result.connectionErrors[C2P]).toMatchObject({
      pspMerchantId: expect.any(String),
      secretKey: expect.any(String),
    });
  });

  it("requires Omise secretKey but treats publicKey/webhookSecret as optional", () => {
    const result = validateEnvironmentChange(
      [draft({ pspConnectionId: OMISE, psp: "omise", pspMerchantId: "", secretKey: "sk" })],
      "sandbox",
      false,
    );
    expect(result.valid).toBe(true);
  });

  it("forces Omise webhook confirmation when target is live", () => {
    const result = validateEnvironmentChange(
      [draft({ pspConnectionId: OMISE, psp: "omise", pspMerchantId: "", secretKey: "sk" })],
      "live",
      false,
    );
    expect(result.valid).toBe(false);
    expect(result.formError).not.toBeNull();
  });

  it("passes live Omise once webhook is confirmed", () => {
    const result = validateEnvironmentChange(
      [draft({ pspConnectionId: OMISE, psp: "omise", pspMerchantId: "", secretKey: "sk" })],
      "live",
      true,
    );
    expect(result.valid).toBe(true);
  });

  it("rejects a field over 4096 characters", () => {
    const result = validateEnvironmentChange(
      [draft({ secretKey: "a".repeat(4097) })],
      "sandbox",
      false,
    );
    expect(result.valid).toBe(false);
    expect(result.connectionErrors[C2P]?.secretKey).toContain("4096");
  });
});

describe("buildEnvironmentChangeConnections", () => {
  it("omits empty optional Omise secrets and 2C2P pspMerchantId for Omise", () => {
    const body = buildEnvironmentChangeConnections([
      {
        pspConnectionId: OMISE,
        psp: "omise",
        pspMerchantId: "",
        secretKey: "sk",
        publicKey: "",
        webhookSecret: "wh",
      },
    ]);
    expect(body[0]).toEqual({
      pspConnectionId: OMISE,
      psp: "omise",
      secrets: { secretKey: "sk", webhookSecret: "wh" },
    });
  });

  it("includes 2C2P pspMerchantId trimmed", () => {
    const body = buildEnvironmentChangeConnections([
      {
        pspConnectionId: C2P,
        psp: "2c2p",
        pspMerchantId: " acct ",
        secretKey: "sk",
        publicKey: "",
        webhookSecret: "",
      },
    ]);
    expect(body[0]).toEqual({
      pspConnectionId: C2P,
      psp: "2c2p",
      pspMerchantId: "acct",
      secrets: { secretKey: "sk" },
    });
  });
});

describe("mapSettingsProblem", () => {
  it("maps each 409 settings code to a distinct kind", () => {
    expect(mapSettingsProblem(409, "approval_pending", "environment").kind).toBe(
      "approval-pending",
    );
    expect(
      mapSettingsProblem(409, "environment_credentials_incomplete", "environment").kind,
    ).toBe("credentials-incomplete");
    expect(mapSettingsProblem(409, "webhook_not_ready", "environment").kind).toBe(
      "webhook-not-ready",
    );
    expect(mapSettingsProblem(409, "routing_incomplete", "routing").kind).toBe(
      "routing-incomplete",
    );
    expect(mapSettingsProblem(409, "advanced_routing_read_only", "routing").kind).toBe(
      "advanced-read-only",
    );
    expect(mapSettingsProblem(409, "state_conflict", "routing").kind).toBe("conflict");
    expect(mapSettingsProblem(409, "legacy_snapshot_blocked", "environment").kind).toBe(
      "legacy-blocked",
    );
  });

  it("maps 413 and 403 authorization_stale", () => {
    expect(mapSettingsProblem(413, "request_too_large", "environment").kind).toBe("too-large");
    expect(mapSettingsProblem(403, "authorization_stale", "method").kind).toBe("auth-stale");
    expect(mapSettingsProblem(403, "forbidden", "method").kind).toBe("forbidden");
  });

  it("maps 403 merchant_scope_forbidden to a merchant-scope message, not stale (AC-8)", () => {
    const scoped = mapSettingsProblem(403, "merchant_scope_forbidden", "method");
    expect(scoped.kind).toBe("forbidden");
    expect(scoped.message).toContain("ร้านค้า");
    // ต้องต่างจากทั้ง auth-stale และ generic forbidden
    expect(scoped.message).not.toBe(mapSettingsProblem(403, "forbidden", "method").message);
    expect(scoped.message).not.toBe(mapSettingsProblem(403, "authorization_stale", "method").message);
  });

  it("differentiates candidate test failures from active test failures", () => {
    expect(mapSettingsProblem(502, "psp_test_failed", "candidate-test").message).toContain(
      "ชุดใหม่",
    );
    expect(mapSettingsProblem(502, "psp_test_failed", "settings").message).toContain(
      "ใช้งานอยู่",
    );
  });

  it("marks conflict/approval kinds as needing refetch", () => {
    expect(mapSettingsProblem(409, "state_conflict", "routing").refetch).toBe(true);
    expect(mapSettingsProblem(409, "approval_pending", "environment").refetch).toBe(true);
  });
});

describe("resolveActivationTarget", () => {
  const ruleset = (
    rulesetId: string,
    status: RoutingRuleset["status"],
  ): RoutingRuleset => ({
    rulesetId,
    merchantId: MERCHANT,
    name: "default",
    status,
    approvalId: null,
    version: 3,
    rules: [],
  });

  const routing = (rulesetId: string | null): SimpleRoutingView => ({
    merchantId: MERCHANT,
    rulesetId,
    status: rulesetId ? "draft" : "none",
    version: 3,
    rules: [],
    advancedReadOnly: false,
  });

  it("targets routing.rulesetId even when list has an active ruleset before the draft", () => {
    // list คืน active ก่อน draft; เป้าต้องเป็น draft ที่เพิ่งบันทึก (routing.rulesetId)
    const active = ruleset("active-ruleset", "active");
    const draftRouting = routing("draft-ruleset");
    expect(resolveActivationTarget(draftRouting, active)).toBe("draft-ruleset");
  });

  it("targets routing.rulesetId when the ruleset list is empty", () => {
    expect(resolveActivationTarget(routing("draft-ruleset"), null)).toBe("draft-ruleset");
  });

  it("falls back to a draft/pending ruleset only when routing.rulesetId is null", () => {
    expect(resolveActivationTarget(routing(null), ruleset("draft-ruleset", "draft"))).toBe(
      "draft-ruleset",
    );
    expect(resolveActivationTarget(routing(null), ruleset("pending-ruleset", "pending"))).toBe(
      "pending-ruleset",
    );
  });

  it("returns null when routing has no id and the ruleset is not draft/pending", () => {
    expect(resolveActivationTarget(routing(null), ruleset("active-ruleset", "active"))).toBeNull();
    expect(resolveActivationTarget(null, null)).toBeNull();
  });
});
