import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearTokens, getTokens, setTokens } from "@/lib/auth/token-store";
import {
  adminFetch,
  beginLogin,
  buildAuthorizeUrl,
  clampReturnTo,
  completeLogin,
  getMe,
  isLogoutSuccessStatus,
  logout,
  refreshTokens,
  shouldRedirectToLogin,
  shouldShowForbidden,
  toAdminMe,
  toTokenPair,
  withBearer,
} from "./auth";

/** sessionStorage จำลอง (vitest env = node). */
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
  };
}

const LIVE = { accessToken: "at1", refreshToken: "rt1", expiresAt: Date.now() + 10 * 60_000 };
const TOKEN_BODY = { access_token: "at2", refresh_token: "rt2", expires_in: 900, token_type: "Bearer" };

let location: { href: string; origin: string; search: string; replace: (u: string) => void };

beforeEach(() => {
  vi.stubGlobal("sessionStorage", memoryStorage());
  vi.stubGlobal("localStorage", memoryStorage());
  vi.stubGlobal("navigator", {});
  location = { href: "", origin: "https://localhost:3001", search: "", replace: () => {} };
  vi.stubGlobal("window", { location });
  clearTokens();
});
afterEach(() => vi.unstubAllGlobals());

/** stub fetch ตอบตาม (path -> Response factory) ที่ให้; path อื่น 200 ว่าง. */
function stubFetch(routes: Record<string, (init: RequestInit) => Response | Promise<Response>>) {
  const mock = vi.fn(async (path: string, init: RequestInit = {}) => {
    const handler = routes[path];
    return handler ? handler(init) : new Response(null, { status: 200 });
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const bearerOf = (init: RequestInit) => new Headers(init.headers).get("Authorization");
const formOf = (init: RequestInit) => Object.fromEntries(new URLSearchParams(init.body as string));

describe("pure helpers", () => {
  it("clampReturnTo: allowlist ผ่าน นอกนั้น /dashboard", () => {
    expect(clampReturnTo("/")).toBe("/");
    expect(clampReturnTo("/minimals")).toBe("/minimals");
    expect(clampReturnTo("/evil")).toBe("/dashboard");
    expect(clampReturnTo("https://x")).toBe("/dashboard");
  });

  it("buildAuthorizeUrl: code + PKCE S256 + scope openid offline_access", () => {
    const url = new URL(
      buildAuthorizeUrl({ state: "s", codeChallenge: "c", redirectUri: "https://localhost:3001/auth/callback" }),
      "https://api.test",
    );
    expect(url.pathname).toBe("/oauth/authorize");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: "pol-admin",
      redirect_uri: "https://localhost:3001/auth/callback",
      response_type: "code",
      scope: "openid offline_access",
      state: "s",
      code_challenge: "c",
      code_challenge_method: "S256",
    });
  });

  it("toTokenPair: expiresAt = now + expires_in วินาที", () => {
    expect(toTokenPair(TOKEN_BODY, 1_000)).toEqual({ accessToken: "at2", refreshToken: "rt2", expiresAt: 901_000 });
  });

  it("withBearer: ใส่ Authorization ไม่ใส่ credentials", () => {
    const init = withBearer({ method: "PUT", headers: { "If-Match": '"v1"' } }, "tok");
    expect(bearerOf(init)).toBe("Bearer tok");
    expect(new Headers(init.headers).get("If-Match")).toBe('"v1"');
    expect(init.credentials).toBeUndefined();
  });
});

describe("beginLogin", () => {
  it("เก็บ verifier/state/returnTo ใน sessionStorage แล้ว navigate ไป authorize พร้อม challenge", async () => {
    await beginLogin("/minimals");
    const pkce = JSON.parse(sessionStorage.getItem("pol_pkce")!);
    expect(pkce.returnTo).toBe("/minimals");
    expect(pkce.verifier).toHaveLength(43);
    const params = new URL(location.href, "https://api.test").searchParams;
    expect(params.get("state")).toBe(pkce.state);
    expect(params.get("redirect_uri")).toBe("https://localhost:3001/auth/callback");
    expect(params.get("code_challenge")).toHaveLength(43);
    expect(params.get("code_challenge")).not.toBe(pkce.verifier);
  });

  it("returnTo นอก allowlist ถูก clamp", async () => {
    await beginLogin("/evil");
    expect(JSON.parse(sessionStorage.getItem("pol_pkce")!).returnTo).toBe("/dashboard");
  });
});

describe("completeLogin", () => {
  const seedPkce = () =>
    sessionStorage.setItem("pol_pkce", JSON.stringify({ verifier: "ver", state: "st", returnTo: "/minimals" }));

  it("แลก code ที่ /oauth/token (form, client_id, redirect_uri) เก็บ token แล้วคืน returnTo", async () => {
    seedPkce();
    const fetchMock = stubFetch({ "/oauth/token": () => json(TOKEN_BODY) });
    await expect(completeLogin("?code=abc&state=st")).resolves.toEqual({ ok: true, returnTo: "/minimals" });
    const init = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/x-www-form-urlencoded");
    expect(formOf(init)).toEqual({
      grant_type: "authorization_code",
      code: "abc",
      code_verifier: "ver",
      redirect_uri: "https://localhost:3001/auth/callback",
      client_id: "pol-admin",
    });
    expect(getTokens()).toMatchObject({ accessToken: "at2", refreshToken: "rt2" });
    expect(sessionStorage.getItem("pol_pkce")).toBeNull();
  });

  it("consume PKCE state ก่อน fetch: เรียกซ้ำ -> pkce_missing โดยไม่ยิง token อีก", async () => {
    seedPkce();
    const fetchMock = stubFetch({ "/oauth/token": () => json(TOKEN_BODY) });
    await completeLogin("?code=abc&state=st");
    await expect(completeLogin("?code=abc&state=st")).resolves.toEqual({ ok: false, reason: "pkce_missing" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("state ไม่ตรง / ไม่มี code -> state_mismatch ไม่ยิง token", async () => {
    seedPkce();
    const fetchMock = stubFetch({});
    await expect(completeLogin("?code=abc&state=other")).resolves.toEqual({ ok: false, reason: "state_mismatch" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("?error= จาก authorize -> reason นั้น", async () => {
    seedPkce();
    stubFetch({});
    await expect(completeLogin("?error=access_denied&state=st")).resolves.toEqual({ ok: false, reason: "access_denied" });
  });

  it("token 400 -> reason จาก body.error และไม่เก็บ token", async () => {
    seedPkce();
    stubFetch({ "/oauth/token": () => json({ error: "invalid_grant" }, 400) });
    await expect(completeLogin("?code=abc&state=st")).resolves.toEqual({ ok: false, reason: "invalid_grant" });
    expect(getTokens()).toBeNull();
  });
});

describe("refreshTokens", () => {
  it("200 -> เก็บคู่ใหม่ (single-flight: เรียกพร้อมกันยิงครั้งเดียว)", async () => {
    setTokens(LIVE);
    const fetchMock = stubFetch({ "/oauth/token": () => json(TOKEN_BODY) });
    const [a, b] = await Promise.all([refreshTokens(), refreshTokens()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(formOf(fetchMock.mock.calls[0]![1] as RequestInit)).toEqual({
      grant_type: "refresh_token",
      refresh_token: "rt1",
      client_id: "pol-admin",
    });
    expect(a).toEqual(b);
    expect(getTokens()?.refreshToken).toBe("rt2");
  });

  it("400 invalid_grant -> ล้าง token", async () => {
    setTokens(LIVE);
    stubFetch({ "/oauth/token": () => json({ error: "invalid_grant" }, 400) });
    await expect(refreshTokens()).resolves.toBeNull();
    expect(getTokens()).toBeNull();
  });

  it("network error / 5xx -> null แต่คง token เดิม", async () => {
    setTokens(LIVE);
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))));
    await expect(refreshTokens()).resolves.toBeNull();
    expect(getTokens()).toEqual(LIVE);
    stubFetch({ "/oauth/token": () => new Response(null, { status: 503 }) });
    await expect(refreshTokens()).resolves.toBeNull();
    expect(getTokens()).toEqual(LIVE);
  });

  it("ไม่มี token -> null ไม่ยิง", async () => {
    const fetchMock = stubFetch({});
    await expect(refreshTokens()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ข้ามแท็บ: แท็บอื่นหมุนไปแล้วระหว่างรอ lock -> ใช้คู่ใหม่จาก storage ไม่ยิง refresh ซ้ำ", async () => {
    setTokens(LIVE);
    const OTHER = { accessToken: "at9", refreshToken: "rt9", expiresAt: Date.now() + 900_000 };
    const request = vi.fn(async (_name: string, work: () => Promise<unknown>) => {
      setTokens(OTHER); // แท็บอื่น refresh สำเร็จก่อนเราได้ lock
      return work();
    });
    vi.stubGlobal("navigator", { locks: { request } });
    const fetchMock = stubFetch({ "/oauth/token": () => json(TOKEN_BODY) });
    await expect(refreshTokens()).resolves.toEqual(OTHER);
    expect(request).toHaveBeenCalledWith("pol_refresh", expect.any(Function));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ข้ามแท็บ: ได้ lock แล้ว token ยังตัวเดิม -> ยิง refresh ภายใต้ lock", async () => {
    setTokens(LIVE);
    const request = vi.fn((_name: string, work: () => Promise<unknown>) => work());
    vi.stubGlobal("navigator", { locks: { request } });
    const fetchMock = stubFetch({ "/oauth/token": () => json(TOKEN_BODY) });
    await expect(refreshTokens()).resolves.toMatchObject({ refreshToken: "rt2" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("adminFetch", () => {
  it("แนบ Bearer ของ token ที่ยังสด ไม่มี credentials/CSRF", async () => {
    setTokens(LIVE);
    const fetchMock = stubFetch({});
    await adminFetch("/admin/roles", { method: "PUT", headers: { "If-Match": '"v1"' } });
    const [path, init] = fetchMock.mock.calls[0]! as [string, RequestInit];
    expect(path).toBe("/admin/roles");
    expect(bearerOf(init)).toBe("Bearer at1");
    expect(init.credentials).toBeUndefined();
    expect(new Headers(init.headers).has("X-CSRF-Token")).toBe(false);
  });

  it("token ใกล้หมด (< 60s) -> refresh ก่อนแล้วใช้ตัวใหม่", async () => {
    setTokens({ ...LIVE, expiresAt: Date.now() + 30_000 });
    const fetchMock = stubFetch({ "/oauth/token": () => json(TOKEN_BODY) });
    await adminFetch("/api/v1/me");
    expect(fetchMock.mock.calls.map(([p]) => p)).toEqual(["/oauth/token", "/api/v1/me"]);
    expect(bearerOf(fetchMock.mock.calls[1]![1] as RequestInit)).toBe("Bearer at2");
  });

  it("401 -> refresh 1 ครั้ง -> retry ด้วย token ใหม่ (สำเร็จ ไม่เด้ง)", async () => {
    setTokens(LIVE);
    const fetchMock = stubFetch({
      "/oauth/token": () => json(TOKEN_BODY),
      "/api/v1/me": (init) => new Response(null, { status: bearerOf(init) === "Bearer at2" ? 200 : 401 }),
    });
    const res = await adminFetch("/api/v1/me");
    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls.map(([p]) => p)).toEqual(["/api/v1/me", "/oauth/token", "/api/v1/me"]);
    expect(location.href).toBe("");
  });

  it("request พร้อมกันโดน 401 ทั้งคู่ -> แชร์ refresh ครั้งเดียว", async () => {
    setTokens(LIVE);
    const fetchMock = stubFetch({
      "/oauth/token": () => json(TOKEN_BODY),
      "/api/v1/me": (init) => new Response(null, { status: bearerOf(init) === "Bearer at2" ? 200 : 401 }),
      "/api/v1/me/access": (init) => new Response(null, { status: bearerOf(init) === "Bearer at2" ? 200 : 401 }),
    });
    const [a, b] = await Promise.all([adminFetch("/api/v1/me"), adminFetch("/api/v1/me/access")]);
    expect([a.status, b.status]).toEqual([200, 200]);
    expect(fetchMock.mock.calls.filter(([p]) => p === "/oauth/token")).toHaveLength(1);
  });

  it("401 แล้ว refresh ตาย (400) -> ล้าง token + เด้ง /login ไม่ retry", async () => {
    setTokens(LIVE);
    const fetchMock = stubFetch({
      "/oauth/token": () => json({ error: "invalid_grant" }, 400),
      "/api/v1/me": () => new Response(null, { status: 401 }),
    });
    const res = await adminFetch("/api/v1/me");
    expect(res.status).toBe(401);
    expect(fetchMock.mock.calls.map(([p]) => p)).toEqual(["/api/v1/me", "/oauth/token"]);
    expect(getTokens()).toBeNull();
    expect(location.href).toBe("/login");
  });

  it("redirectOnUnauthorized:false -> ล้าง token แต่ไม่เด้ง", async () => {
    setTokens(LIVE);
    stubFetch({
      "/oauth/token": () => json({ error: "invalid_grant" }, 400),
      "/api/v1/me": () => new Response(null, { status: 401 }),
    });
    await adminFetch("/api/v1/me", { redirectOnUnauthorized: false });
    expect(getTokens()).toBeNull();
    expect(location.href).toBe("");
  });

  it("ไม่มี token -> 401 สังเคราะห์ ไม่ยิง network เด้ง /login", async () => {
    const fetchMock = stubFetch({});
    const res = await adminFetch("/admin/roles");
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(location.href).toBe("/login");
  });
});

describe("toAdminMe", () => {
  it("map accountId/displayName/hasPlatformAccess/permissions", () => {
    expect(
      toAdminMe(
        { accountId: "a", displayName: "สมชาย", email: "s@x" },
        { hasPlatformAccess: true, permissions: ["p1"] },
      ),
    ).toEqual({ adminId: "a", displayName: "สมชาย", email: "s@x", hasPlatformAccess: true, permissions: ["p1"] });
  });
  it("email null คงไว้", () => {
    expect(toAdminMe({ accountId: "a", displayName: null, email: null }, { hasPlatformAccess: false, permissions: [] }).email).toBeNull();
  });
});

describe("getMe", () => {
  const meBody = { accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", displayName: "สมชาย", email: "somchai@viriyah.co.th" };
  const accessBody = { hasPlatformAccess: false, permissions: ["settings.manage", "merchant.view"] };
  const fetchByPath = (statuses: Record<string, number>) =>
    stubFetch({
      "/api/v1/me": () => (statuses["/api/v1/me"] ?? 200) === 200 ? json(meBody) : new Response(null, { status: statuses["/api/v1/me"] }),
      "/api/v1/me/access": () =>
        (statuses["/api/v1/me/access"] ?? 200) === 200 ? json(accessBody) : new Response(null, { status: statuses["/api/v1/me/access"] }),
      "/oauth/token": () => json({ error: "invalid_grant" }, 400),
    });

  it("ไม่มี token -> anon ไม่ยิง network", async () => {
    const fetchMock = stubFetch({});
    await expect(getMe()).resolves.toEqual({ status: "anon", me: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("เรียก /api/v1/me + /api/v1/me/access ด้วย Bearer แล้ว map เป็น authed", async () => {
    setTokens(LIVE);
    const fetchMock = fetchByPath({});
    await expect(getMe()).resolves.toEqual({
      status: "authed",
      me: { adminId: meBody.accountId, displayName: "สมชาย", email: "somchai@viriyah.co.th", hasPlatformAccess: false, permissions: accessBody.permissions },
    });
    expect(bearerOf(fetchMock.mock.calls[0]![1] as RequestInit)).toBe("Bearer at1");
  });

  it.each([
    [401, "anon"],
    [403, "forbidden"],
    [500, "error"],
  ] as const)("map %s จาก /me เป็น %s (401 ไม่เด้งเอง ให้ guard ตัดสิน)", async (status, expected) => {
    setTokens(LIVE);
    fetchByPath({ "/api/v1/me": status });
    await expect(getMe()).resolves.toEqual({ status: expected, me: null });
    expect(location.href).toBe("");
  });

  it("/me 200 แต่ /me/access 403 -> forbidden", async () => {
    setTokens(LIVE);
    fetchByPath({ "/api/v1/me/access": 403 });
    await expect(getMe()).resolves.toEqual({ status: "forbidden", me: null });
  });

  it("network error -> error", async () => {
    setTokens(LIVE);
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))));
    await expect(getMe()).resolves.toEqual({ status: "error", me: null });
  });
});

describe("guards", () => {
  it("shouldRedirectToLogin เฉพาะ anon", () => {
    expect(shouldRedirectToLogin("anon")).toBe(true);
    expect(shouldRedirectToLogin("loading")).toBe(false);
    expect(shouldRedirectToLogin("error")).toBe(false);
  });
  it("shouldShowForbidden: forbidden หรือ authed ที่ permissions ว่าง", () => {
    const me = { adminId: "a", displayName: null, email: null, hasPlatformAccess: false, permissions: [] };
    expect(shouldShowForbidden("forbidden", null)).toBe(true);
    expect(shouldShowForbidden("authed", me)).toBe(true);
    expect(shouldShowForbidden("authed", { ...me, permissions: ["x"] })).toBe(false);
  });
  it("isLogoutSuccessStatus: 204/401 เท่านั้น", () => {
    expect(isLogoutSuccessStatus(204)).toBe(true);
    expect(isLogoutSuccessStatus(401)).toBe(true);
    expect(isLogoutSuccessStatus(403)).toBe(false);
    expect(isLogoutSuccessStatus(500)).toBe(false);
  });
});

describe("logout", () => {
  it("POST /api/v1/auth/logout พร้อม Bearer แล้วล้าง token", async () => {
    setTokens(LIVE);
    const fetchMock = stubFetch({ "/api/v1/auth/logout": () => new Response(null, { status: 204 }) });
    await expect(logout()).resolves.toMatchObject({ status: 204 });
    const [path, init] = fetchMock.mock.calls[0]! as [string, RequestInit];
    expect(path).toBe("/api/v1/auth/logout");
    expect(init.method).toBe("POST");
    expect(bearerOf(init)).toBe("Bearer at1");
    expect(getTokens()).toBeNull();
  });

  it("401 = terminal logged-out -> ล้าง token ไม่ throw", async () => {
    setTokens(LIVE);
    stubFetch({ "/api/v1/auth/logout": () => new Response(null, { status: 401 }) });
    await expect(logout()).resolves.toMatchObject({ status: 401 });
    expect(getTokens()).toBeNull();
  });

  it("ไม่มี token -> 401 ทันที ไม่ยิง", async () => {
    const fetchMock = stubFetch({});
    await expect(logout()).resolves.toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("500 -> throw และคง token ไว้ให้ retry", async () => {
    setTokens(LIVE);
    stubFetch({ "/api/v1/auth/logout": () => new Response(null, { status: 500 }) });
    await expect(logout()).rejects.toThrow("admin-logout-failed");
    expect(getTokens()).toEqual(LIVE);
  });
});
