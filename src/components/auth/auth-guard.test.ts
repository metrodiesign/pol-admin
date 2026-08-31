import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, test, vi } from "vitest";

import type { AdminMe } from "@/types/auth";

vi.mock("./auth-provider", () => ({
  useAuth: vi.fn(),
}));

import { AuthGuard } from "./auth-guard";
import { useAuth } from "./auth-provider";

const auth = vi.mocked(useAuth);
const noPermissionMe: AdminMe = {
  adminId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  email: "employee@viriyah.co.th",
  tier: "Scoped",
  accessibleMerchants: { isUnrestricted: false, merchants: [] },
  permissions: [],
};

beforeEach(() => auth.mockReset());

test("permissions ว่างแสดง Inline 403 และไม่ render protected child", () => {
  auth.mockReturnValue({ status: "authed", me: noPermissionMe });

  const markup = renderToStaticMarkup(
    createElement(
      AuthGuard,
      null,
      createElement("p", { "data-testid": "protected-child" }, "protected content"),
    ),
  );

  assert.match(markup, />403</);
  assert.match(markup, /ไม่มีสิทธิ์เข้าถึง/);
  assert.match(markup, /บัญชีนี้ไม่มีสิทธิ์เปิดระบบผู้ดูแล/);
  assert.doesNotMatch(markup, /protected-child|protected content/);
  assert.doesNotMatch(markup, /error\/403/);
});

test("permissions ว่างวาง Inline 403 ใน layout wrapper ที่ caller ส่งมา", () => {
  auth.mockReturnValue({ status: "authed", me: noPermissionMe });

  const markup = renderToStaticMarkup(
    // This test deliberately models the required ReactNode prop in a non-JSX test file.
    // eslint-disable-next-line react/no-children-prop
    createElement(
      AuthGuard,
      {
        renderForbidden: (content) =>
          createElement("section", { "data-testid": "main-layout" }, content),
        children: createElement(
          "p",
          { "data-testid": "protected-child" },
          "protected content",
        ),
      },
    ),
  );

  assert.match(markup, /data-testid="main-layout"/);
  assert.match(markup, />403</);
  assert.doesNotMatch(markup, /protected-child|protected content/);
});
