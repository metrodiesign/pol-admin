import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildMicrosoftLoginUrl,
  buildRequestInit,
  getMe,
  isMutation,
  logout,
  readCookieFrom,
  shouldRedirectToLogin,
  shouldShowForbidden,
} from "./auth";

afterEach(() => vi.unstubAllGlobals());

describe("readCookieFrom", () => {
  it("อ่านค่า cookie ตามชื่อ", () => {
    expect(readCookieFrom("adm_csrf=abc123", "adm_csrf")).toBe("abc123");
  });
  it("เลือก cookie ถูกตัวจากหลายตัว", () => {
    expect(readCookieFrom("a=1; adm_csrf=xyz; b=2", "adm_csrf")).toBe("xyz");
  });
  it("decode ค่า url-encoded", () => {
    expect(readCookieFrom("t=a%2Fb%3Dc", "t")).toBe("a/b=c");
  });
  it("ไม่มี cookie -> null", () => {
    expect(readCookieFrom("a=1; b=2", "adm_csrf")).toBeNull();
  });
  it("string ว่าง -> null", () => {
    expect(readCookieFrom("", "adm_csrf")).toBeNull();
  });
});

describe("isMutation", () => {
  it("safe method -> false", () => {
    expect(isMutation("GET")).toBe(false);
    expect(isMutation("HEAD")).toBe(false);
    expect(isMutation("OPTIONS")).toBe(false);
  });
  it("mutation method -> true", () => {
    for (const m of ["POST", "PUT", "PATCH", "DELETE"]) expect(isMutation(m)).toBe(true);
  });
  it("case-insensitive", () => {
    expect(isMutation("post")).toBe(true);
    expect(isMutation("get")).toBe(false);
  });
});

describe("buildMicrosoftLoginUrl", () => {
  it("encode returnTo ที่อยู่ใน allowlist", () => {
    expect(buildMicrosoftLoginUrl("/minimals")).toBe(
      "/api/v1/admins/auth/microsoft/login?returnTo=%2Fminimals",
    );
  });
  it("allow '/'", () => {
    expect(buildMicrosoftLoginUrl("/")).toBe("/api/v1/admins/auth/microsoft/login?returnTo=%2F");
  });
  it("allow /dashboard", () => {
    expect(buildMicrosoftLoginUrl("/dashboard")).toBe(
      "/api/v1/admins/auth/microsoft/login?returnTo=%2Fdashboard",
    );
  });
  it("clamp path นอก allowlist -> /dashboard (default)", () => {
    expect(buildMicrosoftLoginUrl("/transaction")).toBe(
      "/api/v1/admins/auth/microsoft/login?returnTo=%2Fdashboard",
    );
  });
});

describe("buildRequestInit", () => {
  it("credentials:'include' เสมอ", () => {
    expect(buildRequestInit({}, null).credentials).toBe("include");
  });
  it("ไม่ใส่ CSRF บน GET แม้มี token", () => {
    const init = buildRequestInit({ method: "GET" }, "tok");
    expect(new Headers(init.headers).get("X-CSRF-Token")).toBeNull();
  });
  it("ใส่ CSRF บน mutation เมื่อมี token", () => {
    const init = buildRequestInit({ method: "POST" }, "tok");
    expect(new Headers(init.headers).get("X-CSRF-Token")).toBe("tok");
  });
  it("ไม่ใส่ CSRF บน mutation เมื่อไม่มี token", () => {
    const init = buildRequestInit({ method: "POST" }, null);
    expect(new Headers(init.headers).get("X-CSRF-Token")).toBeNull();
  });
});

describe("getMe", () => {
  it("map 200 พร้อม permissions และ accessibleMerchants เป็น authed", async () => {
    const me = {
      adminId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      email: "admin@example.test",
      tier: "Scoped",
      accessibleMerchants: {
        isUnrestricted: false,
        merchants: [{ id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", code: null }],
      },
      permissions: ["settings.manage", "merchant.view"],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(me), { status: 200 })));

    await expect(getMe()).resolves.toEqual({ status: "authed", me });
  });

  it("คงสถานะ authed เมื่อ backend คืน permissions ว่าง", async () => {
    const me = {
      adminId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      email: "employee@viriyah.co.th",
      tier: "Scoped",
      accessibleMerchants: { isUnrestricted: false, merchants: [] },
      permissions: [],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(me), { status: 200 })));

    await expect(getMe()).resolves.toEqual({ status: "authed", me });
  });

  it.each([
    [401, "anon"],
    [403, "forbidden"],
    [500, "error"],
  ] as const)("map %s เป็น %s", async (status, expected) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status })));
    await expect(getMe()).resolves.toEqual({ status: expected, me: null });
  });

  it("map network failure เป็น error ไม่ใช่ anon", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));
    await expect(getMe()).resolves.toEqual({ status: "error", me: null });
  });
});

describe("logout", () => {
  it("ถือว่า 204 เท่านั้นเป็น local logout สำเร็จ", async () => {
    vi.stubGlobal("document", { cookie: "adm_csrf=csrf-token" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(logout()).resolves.toMatchObject({ status: 204 });
    expect(fetchMock).toHaveBeenCalledWith(
      "/admin/auth/logout",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  it.each([401, 403, 500])("ไม่รายงาน logout สำเร็จเมื่อ backend คืน %s", async (status) => {
    vi.stubGlobal("document", { cookie: "adm_csrf=csrf-token" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status })));

    await expect(logout()).rejects.toThrow("admin-logout-failed");
  });

  it("ไม่รายงาน logout สำเร็จเมื่อ network ล้มเหลว", async () => {
    vi.stubGlobal("document", { cookie: "adm_csrf=csrf-token" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));

    await expect(logout()).rejects.toThrow("network down");
  });
});

describe("auth redirect decision", () => {
  it("redirect loginเฉพาะ anon", () => {
    expect(shouldRedirectToLogin("anon")).toBe(true);
    for (const status of ["loading", "authed", "forbidden", "error"] as const) {
      expect(shouldRedirectToLogin(status)).toBe(false);
    }
  });

  it("แสดง 403 สำหรับ authenticated account ที่ไม่มี permission", () => {
    const me = {
      adminId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      email: "employee@viriyah.co.th",
      tier: "Scoped" as const,
      accessibleMerchants: { isUnrestricted: false, merchants: [] },
      permissions: [],
    };

    expect(shouldShowForbidden("authed", me)).toBe(true);
    expect(shouldShowForbidden("authed", { ...me, permissions: ["dashboard.view"] })).toBe(false);
    expect(shouldShowForbidden("forbidden", null)).toBe(true);
    expect(shouldShowForbidden("anon", null)).toBe(false);
  });
});
