import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test, vi } from "vitest";

import type { PspConnection } from "@/types/control/psp-connection";
import type {
  AccountMethodResource,
  MerchantMethodResource,
} from "@/types/control/merchant-payment-settings";
import type { MerchantPaymentSettingsData } from "@/components/control/psp/settings/use-merchant-payment-settings";

const MERCHANT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const C2P = "11111111-1111-4111-8111-111111111111";
const OMISE = "44444444-4444-4444-8444-444444444444";

function connection(overrides: Partial<PspConnection> = {}): PspConnection {
  return {
    pspConnectionId: C2P,
    merchantId: MERCHANT,
    psp: "2c2p",
    enabledMethods: ["card"],
    config: null,
    maskedSecrets: { secretKey: "2c2p_****d9e4" },
    isEnabled: true,
    health: "healthy",
    lastTestedAt: null,
    lastTestResult: null,
    capabilities: { test: true },
    hasPendingCredentialChange: false,
    createdAt: "2026-08-01T00:00:00Z",
    version: 7,
    environment: "sandbox",
    credentialEnvironment: "sandbox",
    callbackUrl: `https://api.example.test/api/v1/webhooks/${C2P}`,
    pendingCredentialTest: null,
    webhookRegistration: null,
    ...overrides,
  };
}

function merchantMethod(method: "card" | "promptpay" | "installment", enabled: boolean): MerchantMethodResource {
  return {
    state: { merchantId: MERCHANT, method, enabled, effective: enabled, version: 2 },
    etag: '"v2"',
  };
}

function accountMethod(
  pspConnectionId: string,
  method: "card" | "promptpay" | "installment",
  enabled: boolean,
): AccountMethodResource {
  return {
    state: {
      pspConnectionId,
      merchantId: MERCHANT,
      provider: pspConnectionId === OMISE ? "omise" : "2c2p",
      method,
      enabled,
      version: 2,
      reason: null,
    },
    etag: '"v2"',
  };
}

const connections = [connection(), connection({ pspConnectionId: OMISE, psp: "omise", isEnabled: true })];
const methods = ["card", "promptpay", "installment"] as const;

function baseData(): MerchantPaymentSettingsData {
  return {
    settings: {
      merchantId: MERCHANT,
      environment: "sandbox",
      pendingEnvironment: null,
      pendingApprovalId: null,
      updatedAt: "2026-09-06T00:00:00Z",
      version: 4,
    },
    settingsEtag: '"v4"',
    connections,
    merchantMethods: methods.map((m) => merchantMethod(m, m !== "installment")),
    accountMethods: connections.flatMap((c) =>
      methods.map((m) => accountMethod(c.pspConnectionId, m, c.psp === "2c2p" && m === "card")),
    ),
    effectiveMethods: ["card", "promptpay"],
    ruleset: {
      rulesetId: "88888888-8888-4888-8888-888888888888",
      merchantId: MERCHANT,
      name: "default",
      status: "active",
      approvalId: null,
      version: 3,
      rules: [
        {
          ruleId: "rule-card",
          priority: 1,
          method: "card",
          originatorId: null,
          minAmount: null,
          maxAmount: null,
          targetConnectionId: C2P,
          fallbackConnectionId: null,
          enabled: true,
        },
      ],
    },
    routing: {
      rulesetId: "88888888-8888-4888-8888-888888888888",
      status: "active",
      version: 3,
      rows: [
        { method: "card", primaryConnectionId: C2P, fallbackConnectionId: null },
        { method: "promptpay", primaryConnectionId: null, fallbackConnectionId: null },
        { method: "installment", primaryConnectionId: null, fallbackConnectionId: null },
      ],
      advancedRoutingReadOnly: false,
    },
    routingEtag: '"v3"',
    approvals: [],
    sections: { connections: "ready", methods: "ready", routing: "ready", approvals: "ready" },
  };
}

let permissions = ["settings.manage", "merchant.view", "merchant.manage"];
let data: MerchantPaymentSettingsData = baseData();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ me: { permissions } }),
}));
vi.mock("@/components/control/psp/settings/use-merchant-payment-settings", () => ({
  useMerchantPaymentSettings: () => ({
    status: "ready",
    data,
    refetch: vi.fn(),
    replaceConnection: vi.fn(),
  }),
}));
vi.mock("@/components/control/psp/resource-hooks", () => ({
  useMerchantCatalog: () => ({
    status: "ready",
    items: [{ id: MERCHANT, name: "ร้านทดสอบ", code: "M001" }],
    retry: vi.fn(),
  }),
  useConnectionResource: () => ({
    status: "ready",
    resource: { connection: connection(), etag: '"v7"' },
    refetch: vi.fn(),
    replace: vi.fn(),
  }),
}));

import { MerchantPaymentSettingsView } from "@/components/control/psp/settings/view";

test("renders readiness rail, both providers and a three-method matrix", () => {
  permissions = ["settings.manage", "merchant.view", "merchant.manage"];
  data = baseData();
  const markup = renderToStaticMarkup(createElement(MerchantPaymentSettingsView, { merchantId: MERCHANT }));

  // 5 readiness steps rendered (ordered labels)
  for (const label of [
    "สภาพแวดล้อม",
    "การเชื่อมต่อ",
    "ช่องทางชำระเงิน",
    "การกำหนดเส้นทาง",
    "พร้อมรับชำระ",
  ]) {
    assert.ok(markup.includes(label), `missing readiness step ${label}`);
  }
  // both providers
  assert.ok(markup.includes("2C2P"), "2C2P provider card");
  assert.ok(markup.includes("Omise"), "Omise provider card");
  // three canonical methods
  assert.ok(markup.includes("บัตร") && markup.includes("PromptPay") && markup.includes("ผ่อนชำระ"));
  // environment mutation available with merchant.manage
  assert.match(markup, /ขอเปลี่ยนเป็น/);
  // routing matrix uses selects in simple mode
  assert.match(markup, /<select/);
  // aria-current marks the first non-done step
  assert.match(markup, /aria-current="step"/);
});

test("shows Omise account method as unavailable with the sandbox reason", () => {
  permissions = ["settings.manage", "merchant.view", "merchant.manage"];
  const next = baseData();
  // Omise account methods all disabled -> reason surfaces
  next.accountMethods = next.accountMethods.map((resource) =>
    resource.state.provider === "omise"
      ? { ...resource, state: { ...resource.state, enabled: false } }
      : resource,
  );
  data = next;
  const markup = renderToStaticMarkup(createElement(MerchantPaymentSettingsView, { merchantId: MERCHANT }));
  assert.ok(markup.includes("รอ integration ผ่าน sandbox"), "omise sandbox reason");
});

test("environment + routing mutations gate on settings.manage, not merchant.manage (AC-7)", () => {
  // settings.manage แต่ไม่มี merchant.manage: environment change + routing draft/activate ต้องแสดง
  permissions = ["settings.manage", "merchant.view"];
  data = baseData();
  const markup = renderToStaticMarkup(createElement(MerchantPaymentSettingsView, { merchantId: MERCHANT }));
  permissions = ["settings.manage", "merchant.view", "merchant.manage"];
  assert.match(markup, /ขอเปลี่ยนเป็น/);
  assert.match(markup, /บันทึก draft/);
  assert.match(markup, /ส่งคำขอเปิดใช้/);
  // connection create ยังคงต้อง merchant.manage (พฤติกรรมเดิม ไม่เปลี่ยน)
  assert.doesNotMatch(markup, /สร้างการเชื่อมต่อ/);
});

test("hides settings mutations without settings.manage (AC-7)", () => {
  // ไม่มี settings.manage: environment change + routing draft/activate ต้องถูกซ่อน
  permissions = ["merchant.view", "merchant.manage"];
  data = baseData();
  const markup = renderToStaticMarkup(createElement(MerchantPaymentSettingsView, { merchantId: MERCHANT }));
  permissions = ["settings.manage", "merchant.view", "merchant.manage"];
  assert.doesNotMatch(markup, /ขอเปลี่ยนเป็น/);
  assert.doesNotMatch(markup, /บันทึก draft/);
  assert.doesNotMatch(markup, /ส่งคำขอเปิดใช้/);
});

test("candidate test button renders for pending approval with settings.manage (AC-11)", () => {
  permissions = ["settings.manage", "merchant.view", "merchant.manage"];
  const next = baseData();
  next.connections = [
    connection(),
    connection({
      pspConnectionId: OMISE,
      psp: "omise",
      isEnabled: true,
      pendingCredentialTest: { result: "authenticated", testedAt: "2026-09-06T10:00:00Z" },
    }),
  ];
  next.approvals = [
    {
      approvalId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      merchantId: MERCHANT,
      action: "psp.credential.change",
      targetId: OMISE,
      status: "pending",
    },
  ];
  data = next;
  const markup = renderToStaticMarkup(createElement(MerchantPaymentSettingsView, { merchantId: MERCHANT }));
  data = baseData();
  assert.match(markup, /ทดสอบชุดใหม่/);
});

test("candidate test button hidden without settings.manage (AC-7/AC-11)", () => {
  permissions = ["merchant.view", "merchant.manage"];
  const next = baseData();
  next.connections = [
    connection(),
    connection({
      pspConnectionId: OMISE,
      psp: "omise",
      isEnabled: true,
      pendingCredentialTest: { result: "authenticated", testedAt: "2026-09-06T10:00:00Z" },
    }),
  ];
  next.approvals = [
    {
      approvalId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      merchantId: MERCHANT,
      action: "psp.credential.change",
      targetId: OMISE,
      status: "pending",
    },
  ];
  data = next;
  const markup = renderToStaticMarkup(createElement(MerchantPaymentSettingsView, { merchantId: MERCHANT }));
  permissions = ["settings.manage", "merchant.view", "merchant.manage"];
  data = baseData();
  assert.doesNotMatch(markup, /ทดสอบชุดใหม่/);
});

test("unconnected provider links to create with prefill and returnTo (AC-10)", () => {
  permissions = ["settings.manage", "merchant.view", "merchant.manage"];
  const next = baseData();
  // เหลือแค่ 2C2P → การ์ด Omise เป็น UnconnectedCard พร้อมปุ่ม CTA
  next.connections = [connection()];
  next.accountMethods = methods.map((m) => accountMethod(C2P, m, m === "card"));
  data = next;
  const markup = renderToStaticMarkup(createElement(MerchantPaymentSettingsView, { merchantId: MERCHANT }));
  data = baseData();
  assert.match(markup, /สร้างการเชื่อมต่อ/);
  assert.match(
    markup,
    new RegExp(
      `href="/control/psp/create\\?merchantId=${MERCHANT}&amp;psp=omise&amp;returnTo=settings"`,
    ),
  );
});

test("advanced ruleset renders routing read-only without any select", () => {
  permissions = ["settings.manage", "merchant.view", "merchant.manage"];
  const next = baseData();
  next.routing = { ...next.routing!, advancedRoutingReadOnly: true };
  data = next;
  const markup = renderToStaticMarkup(createElement(MerchantPaymentSettingsView, { merchantId: MERCHANT }));
  assert.doesNotMatch(markup, /<select/);
  assert.match(markup, /อ่านอย่างเดียว/);
  assert.match(markup, /href="\/control\/routing\/read\?id=/);
});
