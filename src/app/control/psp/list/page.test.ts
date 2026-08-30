import assert from "node:assert/strict";
import { createElement, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    me: { permissions: ["settings.manage", "merchant.manage", "merchant.view"] },
  }),
}));
vi.mock("@/components/control/psp/resource-hooks", () => ({
  useMerchantCatalog: () => ({ status: "ready", items: [], retry: vi.fn() }),
  usePendingApprovals: () => ({ status: "ready", items: [], retry: vi.fn() }),
}));

import {
  PspConnectionsView,
  PspListHeader,
} from "@/components/control/psp/connections-view";

interface PageHeaderProps {
  title: string;
  description?: unknown;
  breadcrumbs: Array<{ label: string; href?: string }>;
  action?: { label: string; href: string };
  actions?: unknown;
}

const HEADER_PROPS = {
  canSeeCreate: true,
  canCreate: true,
  createDisabledReason: undefined,
};

test("PSP list places ready create action like merchant user list", () => {
  const header = PspListHeader(HEADER_PROPS);
  assert.ok(isValidElement(header));

  const markup = renderToStaticMarkup(header);
  assert.match(markup, /รายชื่อการเชื่อมต่อ PSP/);
  assert.match(markup, /href="\/control\/psp\/create"/);
  assert.match(markup, /h-11/);

  const props = header.props as PageHeaderProps;
  assert.equal(props.title, "รายชื่อการเชื่อมต่อ PSP");
  assert.equal(props.description, undefined);
  assert.deepEqual(props.breadcrumbs, [
    { label: "การเชื่อมต่อ PSP", href: "/control/psp/list" },
    { label: "รายชื่อ" },
  ]);
  assert.deepEqual(props.action, {
    label: "เพิ่มการเชื่อมต่อ",
    href: "/control/psp/create",
  });
  assert.equal(props.actions, undefined);
});

test("PSP list keeps create action disabled while catalog is unavailable", () => {
  const header = PspListHeader({
    canSeeCreate: true,
    canCreate: false,
    createDisabledReason: "กำลังโหลด Merchant catalog",
  });
  assert.ok(isValidElement(header));

  const markup = renderToStaticMarkup(header);
  assert.match(markup, /เพิ่มการเชื่อมต่อ/);
  assert.match(markup, /disabled/);
  assert.match(markup, /h-11/);

  const props = header.props as PageHeaderProps;
  assert.equal(props.action, undefined);
  assert.ok(props.actions);
});

test("PSP list renders its create action in PageHeader, not toolbar", () => {
  const markup = renderToStaticMarkup(createElement(PspConnectionsView));
  const actionIndex = markup.indexOf('href="/control/psp/create"');
  const toolbarIndex = markup.indexOf("ค้นหา Connection ID");

  assert.ok(actionIndex >= 0);
  assert.ok(toolbarIndex >= 0);
  assert.ok(actionIndex < toolbarIndex);
  assert.equal((markup.match(/เพิ่มการเชื่อมต่อ/g) ?? []).length, 1);
});

test("PSP list mirrors merchant user list toolbar and drops mobile cards", () => {
  const markup = renderToStaticMarkup(createElement(PspConnectionsView));

  assert.match(markup, /จำนวนต่อหน้า/);
  assert.match(markup, /lg:grid-cols-3/);
  assert.doesNotMatch(markup, /mmd:hidden/);
  assert.doesNotMatch(markup, /status-spine/);
  assert.doesNotMatch(markup, /Payment operator control room/);
});
