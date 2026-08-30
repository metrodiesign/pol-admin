import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test, vi } from "vitest";

import type { PspConnection } from "@/types/control/psp-connection";

const connection: PspConnection = {
  pspConnectionId: "3f6a2c1e-9b4d-4c8a-a1f2-0d5e6b7c8d9e",
  merchantId: "m-1",
  psp: "omise",
  enabledMethods: ["card"],
  config: null,
  maskedSecrets: { secretKey: "skey_****1234" },
  isEnabled: true,
  health: "healthy",
  lastTestedAt: null,
  lastTestResult: null,
  capabilities: { test: true },
  hasPendingCredentialChange: false,
  createdAt: "2026-08-01T00:00:00Z",
  version: 1,
};

let permissions = ["settings.manage", "merchant.manage", "merchant.view"];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ me: { permissions } }),
}));
vi.mock("@/components/control/psp/resource-hooks", () => ({
  useMerchantCatalog: () => ({
    status: "ready",
    items: [{ id: "m-1", name: "ร้านทดสอบ", code: "M001" }],
    retry: vi.fn(),
  }),
  usePendingApprovals: () => ({ status: "ready", items: [], retry: vi.fn() }),
  useConnectionResource: () => ({
    status: "ready",
    resource: { connection, etag: "W/\"1\"" },
    refetch: vi.fn(),
    replace: vi.fn(),
  }),
}));

import { PspDetailView } from "@/components/control/psp/detail-view";

test("PSP read places cancel/edit in header and actions at card footer like merchant read", () => {
  const markup = renderToStaticMarkup(createElement(PspDetailView, { id: connection.pspConnectionId }));

  const cancelIndex = markup.indexOf("ยกเลิก");
  const editIndex = markup.indexOf("แก้ไข");
  const cardIndex = markup.indexOf("rounded-card");
  const testIndex = markup.indexOf("ทดสอบ Credential ที่ใช้งานอยู่");

  assert.ok(cancelIndex >= 0 && editIndex >= 0 && cardIndex >= 0 && testIndex >= 0);
  assert.ok(cancelIndex < cardIndex, "cancel lives in the page header");
  assert.ok(editIndex < cardIndex, "edit lives in the page header");
  assert.ok(testIndex > cardIndex, "test action lives inside the card");
  assert.match(markup, /href="\/control\/psp\/edit\?id=/);
  assert.match(markup, /h-11 min-w-\[140px\]/);
  assert.match(markup, /ร้านทดสอบ/);
  assert.doesNotMatch(markup, /Payment operator control room/);
  assert.doesNotMatch(markup, /<aside/);
});

test("PSP read hides edit without merchant.manage", () => {
  permissions = ["settings.manage", "merchant.view"];
  const markup = renderToStaticMarkup(createElement(PspDetailView, { id: connection.pspConnectionId }));
  permissions = ["settings.manage", "merchant.manage", "merchant.view"];

  assert.doesNotMatch(markup, /href="\/control\/psp\/edit\?id=/);
  assert.match(markup, /ยกเลิก/);
});
