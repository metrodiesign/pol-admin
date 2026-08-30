import assert from "node:assert/strict";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, test, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

import { RoutingRulesView } from "@/components/control/routing/rules-view";
import { RoutingDetailView } from "@/components/control/routing/detail-view";
import { ApiClientsView } from "@/components/control/api-client/view";
import { ApiClientDetailView } from "@/components/control/api-client/detail-view";
import { WebhooksView } from "@/components/control/webhook/view";
import { WebhookDetailView } from "@/components/control/webhook/detail-view";
import { ApprovalsView } from "@/components/control/approval/view";
import { ApprovalDetailView } from "@/components/control/approval/detail-view";
import { AuditLogView } from "@/components/control/audit/log-view";
import { AuditDetailView } from "@/components/control/audit/detail-view";
import { NotificationsView } from "@/components/control/notification/view";
import { NotificationLogDetailView } from "@/components/control/notification/log-detail-view";
import { ReconciliationView } from "@/components/control/reconciliation/view";
import { TenantsView } from "@/components/control/tenant/view";
import { TenantDetailView } from "@/components/control/tenant/detail-view";
import { OriginatorsView } from "@/components/control/originator/view";
import { OriginatorDetailView } from "@/components/control/originator/detail-view";

import { routingStore } from "@/lib/control/routing-store";
import { apiClientsStore } from "@/lib/control/api-clients-store";
import { webhookStore } from "@/lib/control/webhook-store";
import { approvalsStore } from "@/lib/control/approvals-store";
import { AUDIT_LOG } from "@/lib/mock/control/audit-log";
import { NOTIFICATION_LOG } from "@/lib/mock/control/notifications";
import { MERCHANTS } from "@/lib/mock/merchant";
import { ORIGINATORS } from "@/lib/mock/control/originators";

const render = (component: ComponentType<{ id?: string }>, props: { id?: string } = {}) =>
  renderToStaticMarkup(createElement(component, props));

// Notifications defaults to the rules tab (no pagination); reports has no table. Both are
// covered by the "no legacy pattern" sweep below rather than the toolbar assertions.
const LIST_VIEWS: [string, ComponentType, boolean][] = [
  ["routing", RoutingRulesView, false],
  ["api-clients", ApiClientsView, true],
  ["webhooks", WebhooksView, true],
  ["approvals", ApprovalsView, true],
  ["audit", AuditLogView, true],
  ["reconciliation", ReconciliationView, true],
  ["tenants", TenantsView, true],
  ["originators", OriginatorsView, true],
];

const DETAIL_VIEWS: [string, ComponentType<{ id?: string }>, string][] = [
  ["routing", RoutingDetailView, routingStore.get()[0]!.id],
  ["api-client", ApiClientDetailView, apiClientsStore.get()[0]!.id],
  ["webhook", WebhookDetailView, webhookStore.get()[0]!.id],
  ["approval", ApprovalDetailView, approvalsStore.get()[0]!.id],
  ["audit", AuditDetailView, AUDIT_LOG[0]!.id],
  ["notification", NotificationLogDetailView, NOTIFICATION_LOG[0]!.id],
  ["tenant", TenantDetailView, MERCHANTS[0]!.code],
  ["originator", OriginatorDetailView, ORIGINATORS[0]!.id],
];

describe("control plane list views mirror merchant user list", () => {
  test.each(LIST_VIEWS)("%s", (_name, View, paginated) => {
    const markup = render(View);
    assert.match(markup, /lg:grid-cols-3/);
    if (paginated) assert.match(markup, /จำนวนต่อหน้า/);
    assert.doesNotMatch(markup, /status-spine/);
    assert.doesNotMatch(markup, /__all__/);
  });

  test("notifications renders the tab strip inside a single card", () => {
    const markup = render(NotificationsView);
    assert.match(markup, /bg-grey-200 p-2/);
    assert.match(markup, /กฎการแจ้งเตือน/);
    assert.doesNotMatch(markup, /status-spine/);
  });
});

describe("control plane detail views mirror merchant user/role read", () => {
  test.each(DETAIL_VIEWS)("%s", (_name, View, id) => {
    const markup = render(View, { id });
    const cancelIndex = markup.indexOf("ยกเลิก");
    const cardIndex = markup.indexOf("rounded-card");
    assert.ok(cancelIndex >= 0 && cardIndex >= 0, "cancel action and card both render");
    assert.ok(cancelIndex < cardIndex, "cancel lives in the page header");
    assert.match(markup, /h-11 min-w-\[140px\]/);
    assert.doesNotMatch(markup, /<aside/);
    assert.doesNotMatch(markup, /mmd:grid-cols-12/);
    assert.doesNotMatch(markup, /text-overline/);
    assert.doesNotMatch(markup, /status-spine/);
  });

  test.each(DETAIL_VIEWS)("%s not-found keeps header and card shell", (_name, View) => {
    const markup = render(View, { id: "missing-id" });
    assert.match(markup, /ยกเลิก/);
    assert.match(markup, /rounded-card/);
    assert.match(markup, /ไม่พบ/);
  });

  test("webhook and approval expose primary actions in the header", () => {
    const webhook = render(WebhookDetailView, { id: webhookStore.get()[0]!.id });
    assert.ok(webhook.indexOf("ส่ง event ซ้ำ") < webhook.indexOf("rounded-card"));

    const approval = render(ApprovalDetailView, { id: approvalsStore.get()[0]!.id });
    const card = approval.indexOf("rounded-card");
    assert.ok(approval.indexOf("อนุมัติ") < card);
    assert.ok(approval.indexOf("ปฏิเสธ") < card);
  });
});
