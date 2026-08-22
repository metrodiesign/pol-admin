import { describe, expect, it } from "vitest";

import {
  APPROVAL_LABEL,
  HEALTH_LABEL,
  PROVIDER_LABEL,
  beginIdempotencyIntent,
  connectionActionGate,
  enabledLabel,
  healthTone,
  isSupportedMethod,
  lastTestLabel,
  mapPspProblem,
  normalizePspConnectionId,
  resetProviderFields,
  resolveCredentialReconciliation,
  resolveApprovalState,
  toPspConfigView,
  transitionIdempotencyIntent,
  validateCreateDraft,
  validateCredentialDraft,
  validateEditDraft,
} from "./psp";

const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("PSP provider contract", () => {
  it("รองรับ provider และ methodตาม allowlist", () => {
    expect(PROVIDER_LABEL).toEqual({ "2c2p": "2C2P", omise: "Omise" });
    expect(isSupportedMethod("2c2p", "card")).toBe(true);
    expect(isSupportedMethod("2c2p", "promptpay")).toBe(true);
    expect(isSupportedMethod("2c2p", "installment")).toBe(true);
    expect(isSupportedMethod("omise", "card")).toBe(true);
    expect(isSupportedMethod("omise", "promptpay")).toBe(false);
  });

  it("reset provider-specific fieldsทั้งหมด", () => {
    expect(resetProviderFields()).toEqual({
      enabledMethods: [],
      pspMerchantId: "",
      secretKey: "",
    });
  });
});

describe("validation", () => {
  it("Create บังคับ identity, method และ credential", () => {
    expect(
      validateCreateDraft({ merchantId: "", provider: "", enabledMethods: [] }),
    ).toEqual({
      merchantId: "เลือก Merchant",
      provider: "เลือก PSP",
      enabledMethods: "เลือกช่องทางอย่างน้อยหนึ่งรายการ",
      secretKey: "กรอก secretKey",
    });
  });

  it("2C2P บังคับ merchant id และ reject methodนอก allowlist", () => {
    const errors = validateCreateDraft({
      merchantId: ID,
      provider: "2c2p",
      enabledMethods: ["wallet"],
      secretKey: "secret",
      pspMerchantId: " ",
    });
    expect(errors.enabledMethods).toBe("ช่องทางไม่รองรับโดยผู้ให้บริการนี้");
    expect(errors.pspMerchantId).toBe("กรอก 2C2P Merchant ID");
  });

  it("Omise ใช้ cardและไม่บังคับ provider merchant id", () => {
    expect(
      validateCreateDraft({
        merchantId: ID,
        provider: "omise",
        enabledMethods: ["card"],
        secretKey: "secret",
      }),
    ).toEqual({});
    expect(validateEditDraft("omise", ["promptpay"])).toHaveProperty("enabledMethods");
    expect(validateCredentialDraft("omise", "", "")).toEqual({ secretKey: "กรอก secretKey" });
  });
});

describe("safe read mapping", () => {
  it("map statusและ unknown resultโดยไม่เผย wire value", () => {
    expect(HEALTH_LABEL).toEqual({ unknown: "Unknown", healthy: "Healthy", failed: "Failed" });
    expect(healthTone("unknown")).toBe("muted");
    expect(healthTone("healthy")).toBe("ok");
    expect(healthTone("failed")).toBe("error");
    expect(enabledLabel(true)).toBe("เปิดใช้งาน");
    expect(APPROVAL_LABEL.unavailable).toBe("ตรวจสถานะอนุมัติไม่ได้");
    expect(lastTestLabel("authenticated")).toBe("สำเร็จ");
    expect(lastTestLabel("probe_failed")).toBe("ล้มเหลว");
    expect(lastTestLabel(null)).toBe("ยังไม่เคยทดสอบ");
    expect(lastTestLabel("internal_wire_value")).toBe("ไม่ทราบผล");
  });

  it("render configเฉพาะ allowlistและไม่เปลี่ยน raw snapshot", () => {
    const raw = {
      accountId: "acct",
      card: true,
      installment: "wrong",
      enabledSources: ["card"],
      returnUrls: ["https://merchant.test/return"],
      secretKey: "must-not-render",
    };
    const snapshot = structuredClone(raw);
    expect(toPspConfigView(raw)).toEqual({
      accountId: "acct",
      card: true,
      enabledSources: ["card"],
      returnUrls: ["https://merchant.test/return"],
    });
    expect(raw).toEqual(snapshot);
  });
});

describe("approval และ UUID safety", () => {
  const approval = {
    approvalId: "approval",
    merchantId: null,
    action: "psp.credential.change",
    targetId: ID,
    status: "pending",
  };

  it("normalize UUIDเป็น lowercaseและ reject invalid", () => {
    expect(normalizePspConnectionId(ID.toUpperCase())).toBe(ID);
    expect(normalizePspConnectionId("not-a-uuid")).toBeNull();
    expect(normalizePspConnectionId(undefined)).toBeNull();
  });

  it("positive sourceชนะและ clearต้องมีทั้ง field falseกับ lookup", () => {
    expect(resolveApprovalState(ID.toUpperCase(), false, [approval])).toBe("pending");
    expect(resolveApprovalState(ID, true, [])).toBe("pending");
    expect(resolveApprovalState(ID, false, [])).toBe("clear");
    expect(resolveApprovalState(ID, undefined, [])).toBe("unavailable");
    expect(resolveApprovalState(ID, false, null)).toBe("unavailable");
  });
});

describe("Problem Details mapping", () => {
  it.each([
    [403, null, "read", "forbidden"],
    [404, null, "read", "not-found"],
    [409, "state_conflict", "update", "conflict"],
    [409, "idempotency_key_reused", "create", "key-reused"],
    [409, "operation_in_progress", "credential", "in-progress"],
    [502, "psp_test_failed", "test", "test-failed"],
  ] as const)("map %s/%s", (status, code, operation, kind) => {
    expect(mapPspProblem(status, code, operation).kind).toBe(kind);
  });

  it("unknown errorใช้ safe generic message", () => {
    const result = mapPspProblem(500, "secret_backend_detail", "create");
    expect(result.kind).toBe("unknown");
    expect(result.retryable).toBe(true);
    expect(result.message).not.toContain("secret_backend_detail");
  });
});

describe("idempotency intent", () => {
  it("สร้าง keyใหม่และ reuse keyเดิมเฉพาะ uncertain/in-progress retry", () => {
    const first = beginIdempotencyIntent(null, () => "key-1");
    const uncertain = transitionIdempotencyIntent(first, "uncertain");
    expect(uncertain).toEqual({ key: "key-1", status: "uncertain" });
    expect(beginIdempotencyIntent(uncertain, () => "key-2")).toEqual({
      key: "key-1",
      status: "in-flight",
    });
    const waiting = transitionIdempotencyIntent(first, "operation-in-progress");
    expect(beginIdempotencyIntent(waiting, () => "key-2").key).toBe("key-1");
  });

  it.each(["terminal", "key-reused", "payload-changed", "resource-changed"] as const)(
    "%s จบ intentเดิม",
    (event) => {
      expect(transitionIdempotencyIntent({ key: "key-1", status: "in-flight" }, event)).toBeNull();
    },
  );

  it("credential resource change quarantineและห้าม reuse", () => {
    const quarantined = transitionIdempotencyIntent(
      { key: "key-1", status: "uncertain" },
      "credential-resource-changed",
    );
    expect(quarantined).toEqual({ key: null, status: "quarantined" });
    expect(beginIdempotencyIntent(quarantined, () => "key-2").key).toBe("key-2");
  });
});

describe("credential outcome reconciliation", () => {
  const resource = {
    connection: {
      pspConnectionId: ID,
      merchantId: ID,
      psp: "omise" as const,
      enabledMethods: ["card" as const],
      config: null,
      maskedSecrets: { secretKey: "masked" },
      isEnabled: true,
      health: "healthy" as const,
      lastTestedAt: null,
      lastTestResult: null,
      capabilities: { test: true },
      hasPendingCredentialChange: false,
      createdAt: "2026-08-19T00:00:00Z",
      version: 1,
    },
    etag: '"v1"',
  };

  it("retryได้เฉพาะ ETagเดิมและ authoritative clear", () => {
    expect(resolveCredentialReconciliation('"v1"', resource, [])).toBe("retry-safe");
    expect(resolveCredentialReconciliation('"v0"', resource, [])).toBe("unknown");
    expect(resolveCredentialReconciliation('"v1"', resource, null)).toBe("unknown");
  });

  it("pendingจาก sourceใด sourceหนึ่งชนะ", () => {
    expect(
      resolveCredentialReconciliation(
        '"v1"',
        { ...resource, connection: { ...resource.connection, hasPendingCredentialChange: true } },
        [],
      ),
    ).toBe("pending");
  });
});

it("ไม่มี client plaintext masking helperใน PSP module", async () => {
  const pspModule = await import("./psp");
  expect(pspModule).not.toHaveProperty("maskSecret");
});

describe("connection action gate", () => {
  const base = {
    permissions: ["settings.manage", "merchant.manage"],
    connection: {
      pspConnectionId: ID,
      merchantId: ID,
      psp: "omise" as const,
      enabledMethods: ["card" as const],
      config: null,
      maskedSecrets: { secretKey: "masked" },
      isEnabled: true,
      health: "healthy" as const,
      lastTestedAt: null,
      lastTestResult: null,
      capabilities: { test: true },
      hasPendingCredentialChange: false,
      createdAt: "2026-08-19T00:00:00Z",
      version: 1,
    },
    etag: '"v1"',
    approvalState: "clear" as const,
  };

  it("เปิด actionเฉพาะ permission + raw ETag + authoritative clear", () => {
    expect(connectionActionGate("edit", base)).toEqual({ allowed: true, reason: null });
    expect(connectionActionGate("test", base)).toEqual({ allowed: true, reason: null });
    expect(connectionActionGate("credential", base)).toEqual({ allowed: true, reason: null });
  });

  it("Test ใช้ capabilities.testเป็น source of truth", () => {
    expect(
      connectionActionGate("test", {
        ...base,
        connection: { ...base.connection, capabilities: {} },
      }).allowed,
    ).toBe(false);
  });

  it.each([
    [{ etag: null }, "ไม่มี ETag"],
    [{ connection: { ...base.connection, hasPendingCredentialChange: undefined } }, "pending state"],
    [{ connection: { ...base.connection, hasPendingCredentialChange: true } }, "รออนุมัติ"],
    [{ approvalState: "unavailable" as const }, "ตรวจสถานะอนุมัติไม่ได้"],
  ])("fail closed: %o", (override, reason) => {
    expect(connectionActionGate("credential", { ...base, ...override }).reason).toContain(reason);
  });
});
