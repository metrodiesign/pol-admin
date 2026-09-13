import { afterEach, describe, expect, it, vi } from "vitest";

import {
  adminFetch,
  buildMicrosoftLoginUrl,
  buildRequestInit,
  getMe,
  isLogoutSuccessStatus,
  isMutation,
  logout,
  readCookieFrom,
  shouldRedirectToLogin,
  shouldShowForbidden,
  toAdminMe,
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
      "/api/v1/auth/employees/login?returnTo=%2Fminimals",
    );
  });
  it("allow '/'", () => {
    expect(buildMicrosoftLoginUrl("/")).toBe("/api/v1/auth/employees/login?returnTo=%2F");
  });
  it("allow /dashboard", () => {
    expect(buildMicrosoftLoginUrl("/dashboard")).toBe(
      "/api/v1/auth/employees/login?returnTo=%2Fdashboard",
    );
  });
  it("clamp path นอก allowlist -> /dashboard (default)", () => {
    expect(buildMicrosoftLoginUrl("/transaction")).toBe(
      "/api/v1/auth/employees/login?returnTo=%2Fdashboard",
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

describe("toAdminMe", () => {
  it("map accountId/displayName/hasPlatformAccess/permissions", () => {
    expect(
      toAdminMe(
        { accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", displayName: "สมชาย", email: "somchai@viriyah.co.th" },
        { hasPlatformAccess: true, permissions: ["settings.manage"] },
      ),
    ).toEqual({
      adminId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      displayName: "สมชาย",
      email: "somchai@viriyah.co.th",
      hasPlatformAccess: true,
      permissions: ["settings.manage"],
    });
  });

  it("ไม่มี platform access -> hasPlatformAccess false, displayName null คงไว้", () => {
    const me = toAdminMe(
      { accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", displayName: null, email: null },
      { hasPlatformAccess: false, permissions: [] },
    );
    expect(me.hasPlatformAccess).toBe(false);
    expect(me.displayName).toBeNull();
    expect(me.email).toBeNull();
  });
});

describe("getMe", () => {
  const meBody = {
    accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    displayName: "สมชาย",
    email: "somchai@viriyah.co.th",
    accountType: "EMPLOYEE",
  };
  const accessBody = { hasPlatformAccess: false, permissions: ["settings.manage", "merchant.view"] };
  // adminFetch ลอง refresh หลัง 401: ให้ refresh ตอบ 401 (session หมดจริง) และมี document สำหรับอ่าน csrf
  const fetchByPath = (statuses: Record<string, number>) => {
    vi.stubGlobal("document", { cookie: "" });
    return vi.fn(async (path: string) => {
      const status = statuses[path] ?? (path === "/api/v1/auth/session/refresh" ? 401 : 200);
      const body = status !== 200 ? null : path === "/api/v1/me" ? meBody : accessBody;
      return new Response(body ? JSON.stringify(body) : null, { status });
    });
  };

  it("เรียก /api/v1/me + /api/v1/me/access แล้ว map เป็น authed", async () => {
    const fetchMock = fetchByPath({});
    vi.stubGlobal("fetch", fetchMock);

    await expect(getMe()).resolves.toEqual({
      status: "authed",
      me: {
        adminId: meBody.accountId,
        displayName: "สมชาย",
        email: "somchai@viriyah.co.th",
        hasPlatformAccess: false,
        permissions: ["settings.manage", "merchant.view"],
      },
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/me", expect.objectContaining({ credentials: "include" }));
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/me/access", expect.objectContaining({ credentials: "include" }));
  });

  it("คงสถานะ authed เมื่อ backend คืน permissions ว่าง", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (path: string) =>
        new Response(JSON.stringify(path === "/api/v1/me" ? meBody : { hasPlatformAccess: false, permissions: [] }), {
          status: 200,
        }),
      ),
    );

    await expect(getMe()).resolves.toMatchObject({ status: "authed", me: { permissions: [] } });
  });

  it.each([
    [401, "anon"],
    [403, "forbidden"],
    [500, "error"],
  ] as const)("map %s จาก /me เป็น %s", async (status, expected) => {
    vi.stubGlobal("fetch", fetchByPath({ "/api/v1/me": status }));
    await expect(getMe()).resolves.toEqual({ status: expected, me: null });
  });

  it("map 401 จาก /me/access เป็น anon แม้ /me ตอบ 200", async () => {
    vi.stubGlobal("fetch", fetchByPath({ "/api/v1/me/access": 401 }));
    await expect(getMe()).resolves.toEqual({ status: "anon", me: null });
  });

  it("map network failure เป็น error ไม่ใช่ anon", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));
    await expect(getMe()).resolves.toEqual({ status: "error", me: null });
  });
});

describe("logout", () => {
  it.each([204, 401])("ถือว่า %s เป็น terminal logout success", async (status) => {
    vi.stubGlobal("document", { cookie: "pol_csrf=csrf-token" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(logout()).resolves.toMatchObject({ status });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/auth/logout",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  it("403 (csrf_failed) ไม่ใช่ logout สำเร็จ — session ยังอยู่", async () => {
    vi.stubGlobal("document", { cookie: "pol_csrf=csrf-token" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 403 })));

    await expect(logout()).rejects.toThrow("admin-logout-failed");
  });

  it("ไม่รายงาน logout สำเร็จเมื่อ backend คืน 500", async () => {
    vi.stubGlobal("document", { cookie: "pol_csrf=csrf-token" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(logout()).rejects.toThrow("admin-logout-failed");
  });

  it("ไม่รายงาน logout สำเร็จเมื่อ network ล้มเหลว", async () => {
    vi.stubGlobal("document", { cookie: "pol_csrf=csrf-token" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));

    await expect(logout()).rejects.toThrow("network down");
  });
});


describe("isLogoutSuccessStatus", () => {
  it.each([204, 401])("%s คือ success", (status) => {
    expect(isLogoutSuccessStatus(status)).toBe(true);
  });

  it.each([200, 400, 403, 404, 409, 500])("%s ไม่ใช่ logout success", (status) => {
    expect(isLogoutSuccessStatus(status)).toBe(false);
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
      displayName: null,
      email: "employee@viriyah.co.th",
      hasPlatformAccess: false,
      permissions: [],
    };

    expect(shouldShowForbidden("authed", me)).toBe(true);
    expect(shouldShowForbidden("authed", { ...me, permissions: ["dashboard.view"] })).toBe(false);
    expect(shouldShowForbidden("forbidden", null)).toBe(true);
    expect(shouldShowForbidden("anon", null)).toBe(false);
  });
});

describe("adminFetch refresh-on-401", () => {
  const REFRESH = "/api/v1/auth/session/refresh";
  afterEach(() => vi.unstubAllGlobals());

  function stub(statuses: Record<string, number[]>, refreshStatus: number) {
    const calls: { path: string; init: RequestInit }[] = [];
    const cookieJar = { cookie: "pol_csrf=old" };
    vi.stubGlobal("document", cookieJar);
    vi.stubGlobal("window", { location: { href: "" } });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (path: string, init: RequestInit = {}) => {
        calls.push({ path, init });
        if (path === REFRESH) {
          if (refreshStatus === 200) cookieJar.cookie = "pol_csrf=new";
          return new Response(null, { status: refreshStatus });
        }
        const queue = statuses[path] ?? [200];
        return new Response(null, { status: queue.length > 1 ? queue.shift()! : queue[0]! });
      }),
    );
    return { calls };
  }

  it("200 -> ไม่เรียก refresh", async () => {
    const { calls } = stub({ "/admin/roles": [200] }, 200);
    const res = await adminFetch("/admin/roles");
    expect(res.status).toBe(200);
    expect(calls.map((c) => c.path)).toEqual(["/admin/roles"]);
  });

  it("401 -> refresh 200 -> retry ด้วย pol_csrf ใหม่ ไม่เด้ง /login", async () => {
    const { calls } = stub({ "/admin/roles/x": [401, 200] }, 200);
    const res = await adminFetch("/admin/roles/x", { method: "PUT", body: "{}" });
    expect(res.status).toBe(200);
    expect(calls.map((c) => c.path)).toEqual(["/admin/roles/x", REFRESH, "/admin/roles/x"]);
    expect(new Headers(calls[0]!.init.headers).get("X-CSRF-Token")).toBe("old");
    expect(new Headers(calls[1]!.init.headers).get("X-CSRF-Token")).toBe("old");
    expect(new Headers(calls[2]!.init.headers).get("X-CSRF-Token")).toBe("new");
    expect(window.location.href).toBe("");
  });

  it("401 -> refresh 401 -> คืน 401 เดิมและเด้ง /login", async () => {
    const { calls } = stub({ "/admin/roles": [401] }, 401);
    const res = await adminFetch("/admin/roles");
    expect(res.status).toBe(401);
    expect(calls.map((c) => c.path)).toEqual(["/admin/roles", REFRESH]);
    expect(window.location.href).toBe("/login");
  });

  it("redirectOnUnauthorized:false -> refresh ล้มแล้วไม่เด้ง", async () => {
    stub({ "/api/v1/me": [401] }, 401);
    const res = await adminFetch("/api/v1/me", { redirectOnUnauthorized: false });
    expect(res.status).toBe(401);
    expect(window.location.href).toBe("");
  });

  it("หลาย 401 พร้อมกันแชร์ refresh เดียว", async () => {
    const { calls } = stub({ "/api/v1/me": [401, 200], "/api/v1/me/access": [401, 200] }, 200);
    const [a, b] = await Promise.all([
      adminFetch("/api/v1/me", { redirectOnUnauthorized: false }),
      adminFetch("/api/v1/me/access", { redirectOnUnauthorized: false }),
    ]);
    expect([a.status, b.status]).toEqual([200, 200]);
    expect(calls.filter((c) => c.path === REFRESH)).toHaveLength(1);
  });
});
