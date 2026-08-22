import { describe, expect, it } from "vitest";

import type { AdminMe } from "@/types/auth";
import { shouldRedirectToForbidden } from "./psp-route-gate";

const me: AdminMe = {
  adminId: "admin-1",
  email: "admin@example.test",
  tier: "Super",
  accessibleMerchants: { isUnrestricted: true },
  permissions: ["merchant.view"],
};

describe("PSP route RBAC redirect", () => {
  it("redirects authenticated account missing required permission", () => {
    expect(shouldRedirectToForbidden("authed", me, ["settings.manage"])).toBe(true);
  });

  it.each(["loading", "anon", "forbidden", "error"] as const)(
    "does not redirect non-authed state %s",
    (status) => {
      expect(shouldRedirectToForbidden(status, me, ["settings.manage"])).toBe(false);
    },
  );

  it("does not redirect authenticated account with required permission", () => {
    expect(
      shouldRedirectToForbidden(
        "authed",
        { ...me, permissions: ["settings.manage"] },
        ["settings.manage"],
      ),
    ).toBe(false);
  });
});
