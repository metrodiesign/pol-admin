import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { PAYMENT_SESSIONS } from "./transactions";
import { ORDERS } from "./orders";
import { MERCHANTS } from "./merchant";
import { MERCHANT_USERS } from "./merchant/users";
import { PSP_CONNECTIONS } from "./control/psp-connections";
import type { MerchantCode } from "@/types/merchant";

const MONEY_AMOUNT_RE = /^\d+\.\d{4}$/;
const MONEY_CURRENCY_RE = /^[A-Z]{3}$/;
const MERCHANT_CODE_ALLOWLIST: MerchantCode[] = ["vprivilege", "vcommerce", "vsouvenir"];
const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_STATUS_VALUES = ["AwaitingPayment", "Paid", "Cancelled"];
const PAYMENT_SESSION_STATUS_VALUES = ["Created", "Redirected", "Paid", "Failed", "Expired"];

// REQ-9.6: allowlist ไฟล์ POL-scope เท่านั้น — ห้าม scan ทั้งโฟลเดอร์ (REQ-9.6a, Codex P1 finding)
// รายชื่อไฟล์คือ replacement จริงหลัง implement (tenant->merchant, producer->merchant-user,
// settlement->reconciliation, transaction->order-payment — ตามที่ REQ-9.6 เองระบุไว้).
const FORBIDDEN_WORD_ALLOWLIST = [
  "src/lib/mock/merchant/index.ts",
  "src/lib/mock/merchant/users.ts",
  "src/lib/mock/control/psp-connections.ts",
  "src/lib/mock/control/reconciliation.ts",
  "src/lib/mock/transactions.ts",
  "src/lib/mock/orders.ts",
  "src/lib/mock/analytics.ts",
  "src/lib/mock/dashboard.ts",
  "src/lib/mock/main.ts",
  "src/lib/mock/control/audit-log.ts",
  "src/lib/mock/control/api-clients.ts",
  "src/lib/mock/control/routing-rules.ts",
  "src/lib/mock/control/webhook-events.ts",
  "src/lib/mock/control/approvals.ts",
  "src/lib/mock/control/originators.ts",
  "src/lib/mock/control/notifications.ts",
  "src/lib/mock/policies.ts",
  "src/types/merchant/index.ts",
  "../../packages/shared/src/merchant-user.ts",
  "src/types/control/psp-connection.ts",
  "src/types/control/reconciliation.ts",
  "src/types/order-payment.ts",
];
const FORBIDDEN_WORDS = ["completed", "refunded", "banned", "disabled", "vcentral", "tenant", "minorUnits"];

// REQ-9.6a: ไฟล์ Minimals demo เดิมที่เหลืออยู่ — ต้องไม่อยู่ใน allowlist ข้างบนเด็ดขาด
const MINIMALS_DEMO_FILES = [
  "banking",
  "booking",
  "calendar",
  "chat",
  "course",
  "ecommerce",
  "file",
  "file-manager",
  "invoice-minimals",
  "job",
  "kanban",
  "mail",
  "order",
  "post",
  "product",
  "tour",
  "user-profile",
  "topbar",
  "admin/role",
  "admin/users",
  "merchant/role",
];

describe("Money (REQ-9.1, 9.2)", () => {
  const allMoney = [
    ...PAYMENT_SESSIONS.map((s) => s.amount),
    ...PAYMENT_SESSIONS.flatMap((s) => s.items.map((i) => i.amount)),
    ...ORDERS.map((o) => o.amount),
  ];

  it("every Money.amount is a string matching /^\\d+\\.\\d{4}$/", () => {
    for (const m of allMoney) {
      expect(typeof m.amount).toBe("string");
      expect(m.amount).toMatch(MONEY_AMOUNT_RE);
    }
  });

  it("every Money.currency matches /^[A-Z]{3}$/", () => {
    for (const m of allMoney) {
      expect(m.currency).toMatch(MONEY_CURRENCY_RE);
    }
  });
});

describe("Status enums (REQ-9.3)", () => {
  it("every order status is one of the 3 PascalCase OrderStatus values", () => {
    for (const o of ORDERS) {
      expect(ORDER_STATUS_VALUES).toContain(o.status);
    }
  });

  it("every payment session status is one of the 5 PascalCase PaymentSessionStatus values", () => {
    for (const s of PAYMENT_SESSIONS) {
      expect(PAYMENT_SESSION_STATUS_VALUES).toContain(s.status);
    }
  });
});

describe("Merchant code + id (REQ-9.4, 9.4a)", () => {
  it("every merchant code is in the 3-value allowlist", () => {
    for (const m of MERCHANTS) {
      expect(MERCHANT_CODE_ALLOWLIST).toContain(m.code);
    }
  });

  it("every merchant id is a valid GUID (separate from the code allowlist)", () => {
    for (const m of MERCHANTS) {
      expect(m.id).toMatch(GUID_RE);
    }
  });
});

describe("MerchantUser invariant (REQ-9.5)", () => {
  it("PendingApproval implies merchantId === null", () => {
    for (const u of MERCHANT_USERS) {
      if (u.status === "PendingApproval") {
        expect(u.merchantId).toBeNull();
      }
    }
  });
});

describe("Forbidden-word scan (REQ-9.6, 9.6a)", () => {
  it("allowlist files contain none of the forbidden words", () => {
    for (const file of FORBIDDEN_WORD_ALLOWLIST) {
      const content = readFileSync(join(process.cwd(), file), "utf-8").toLowerCase();
      for (const word of FORBIDDEN_WORDS) {
        expect(content, `${file} should not contain "${word}"`).not.toContain(word.toLowerCase());
      }
    }
  });

  it("Minimals demo files are not in the allowlist", () => {
    for (const demo of MINIMALS_DEMO_FILES) {
      expect(FORBIDDEN_WORD_ALLOWLIST).not.toContain(`src/lib/mock/${demo}.ts`);
    }
  });

  it("the scan actually catches an injected forbidden word (meta-test, REQ-9.9)", () => {
    const injected = "export const X = { status: \"disabled\" };".toLowerCase();
    expect(FORBIDDEN_WORDS.some((w) => injected.includes(w.toLowerCase()))).toBe(true);
  });
});

describe("No plaintext secrets (REQ-9.7, 5.1)", () => {
  it("psp-connections.ts has no secretKey/webhookSecret/publicKey field", () => {
    const content = readFileSync(
      join(process.cwd(), "src/lib/mock/control/psp-connections.ts"),
      "utf-8",
    );
    expect(content).not.toMatch(/secretKey|webhookSecret|publicKey/i);
  });

  it("no PSP connection exposes an unmasked secret value", () => {
    for (const conn of PSP_CONNECTIONS) {
      for (const value of Object.values(conn.maskedSecrets)) {
        expect(value).toMatch(/•/);
      }
    }
  });
});
