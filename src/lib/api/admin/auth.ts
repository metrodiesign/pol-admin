import type { AdminMe, AuthBootstrapResult, AuthStatus } from "@/types/auth";

// Employee BFF client (auth) — FE ไม่ถือ token; session อยู่ใน httpOnly cookie ที่ backend จัดการ.
// contract: pol-core src/Api/Api/IdentityAccess/IdentityAccessEndpoints.cs (employee stack: /api/v1/auth/*, /api/v1/me*)

// login เป็น top-level navigation ตรงไป backend origin (callback ลงทะเบียนที่ backend host จริง) —
// ไม่ผ่าน Next rewrite proxy เพราะ redirect_uri ที่ ASP.NET OIDC handler สร้างต้องตรง host ที่ browser navigate ไปเป๊ะ.
const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "";
const MICROSOFT_LOGIN_PATH = `${API_ORIGIN}/api/v1/auth/employees/login`;
const CSRF_COOKIE = "pol_csrf";
const CSRF_HEADER = "X-CSRF-Token";
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// returnTo ที่ส่งให้ backend — employee stack รับ path ที่ขึ้นต้นด้วย "/" ทุกค่า (ไม่มี allowlist);
// clamp ฝั่ง FE ไว้เพื่อกัน open-redirect-ish path ที่ไม่ใช่ landing ของแอป.
const RETURN_TO_ALLOWLIST: readonly string[] = ["/", "/minimals", "/dashboard"];
const DEFAULT_RETURN_TO = "/dashboard";

// --- pure helpers (node-testable, ไม่แตะ window/document/fetch) ---

/** อ่านค่า cookie ชื่อ `name` จาก cookie string (เช่น document.cookie) แล้ว decode. null ถ้าไม่มี. */
export function readCookieFrom(cookieString: string, name: string): string | null {
  const value = cookieString.match(new RegExp("(?:^|; )" + name + "=([^;]+)"))?.[1];
  return value === undefined ? null : decodeURIComponent(value);
}

/** method ที่ต้องแนบ CSRF (POST/PUT/PATCH/DELETE). case-insensitive. */
export function isMutation(method: string): boolean {
  return MUTATION_METHODS.has(method.toUpperCase());
}

/** clamp returnTo เข้า allowlist ฝั่ง FE (กัน backend reject แล้ว falls back ไป "/"). */
function clampReturnTo(returnTo: string): string {
  return RETURN_TO_ALLOWLIST.includes(returnTo) ? returnTo : DEFAULT_RETURN_TO;
}

/** สร้าง URL เริ่ม SSO ผ่าน Microsoft/Entra: `/api/v1/auth/employees/login?returnTo=<encoded,clamped>`. */
export function buildMicrosoftLoginUrl(returnTo: string): string {
  return `${MICROSOFT_LOGIN_PATH}?returnTo=${encodeURIComponent(clampReturnTo(returnTo))}`;
}

/** ประกอบ RequestInit: `credentials:'include'` เสมอ; แนบ `X-CSRF-Token` เฉพาะ mutation ที่มี csrf. */
export function buildRequestInit(opts: RequestInit, csrf: string | null): RequestInit {
  const headers = new Headers(opts.headers);
  if (isMutation(opts.method ?? "GET") && csrf) headers.set(CSRF_HEADER, csrf);
  return { ...opts, headers, credentials: "include" };
}

// --- browser bindings (ใช้ globals; ทดสอบใน E2E ไม่ใช่ unit) ---

/** อ่าน cookie จาก document.cookie. */
export function cookie(name: string): string | null {
  return readCookieFrom(document.cookie, name);
}

/** เริ่ม SSO ผ่าน Microsoft/Entra ด้วย full-page navigate. */
export function microsoftLogin(returnTo: string = DEFAULT_RETURN_TO): void {
  window.location.href = buildMicrosoftLoginUrl(returnTo);
}

export interface AdminFetchOptions extends RequestInit {
  /** default true; false = ไม่เด้งไป login เมื่อเจอ 401 (ใช้โดย getMe ให้ guard เป็นคนตัดสิน). */
  redirectOnUnauthorized?: boolean;
}

const SESSION_PATH = "/api/v1/auth/session";
const SESSION_REFRESH_PATH = "/api/v1/auth/session/refresh";

/** payload GET /api/v1/auth/session และ POST session/refresh (เฉพาะ field ที่ใช้). */
interface SessionResponse {
  expiresAt: string;
}

async function expiresAtOf(res: Response): Promise<string | null> {
  if (res.status !== 200) return null;
  const body = (await res.json()) as SessionResponse;
  return body.expiresAt;
}

/** GET session ปัจจุบัน -> expiresAt (ISO) หรือ null เมื่อไม่มี session. */
export async function getSessionExpiry(): Promise<string | null> {
  try {
    return await expiresAtOf(await fetch(SESSION_PATH, buildRequestInit({}, null)));
  } catch {
    return null;
  }
}

// BFF session ไม่ slide ฝั่ง server (absolute BffSessionMinutes) และ refresh รับเฉพาะ ticket ที่ยัง live
// จึงต้อง refresh เชิงรุกก่อน expiresAt (ดู lib/auth/session-keepalive) — เรียกซ้ำพร้อมกันให้แชร์ครั้งเดียว
let refreshInFlight: Promise<string | null> | null = null;

/** POST session/refresh (dedupe) -> expiresAt ใหม่ หรือ null เมื่อต่ออายุไม่ได้ (session ตาย ปล่อยให้ 401 ถัดไปเด้ง /login). */
export function refreshSession(): Promise<string | null> {
  refreshInFlight ??= fetch(
    SESSION_REFRESH_PATH,
    buildRequestInit({ method: "POST" }, cookie(CSRF_COOKIE)),
  )
    .then(expiresAtOf)
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

/** fetch admin API: credentials:'include', แนบ CSRF เมื่อ mutation, 401 -> เด้งไปหน้า /login. */
export async function adminFetch(
  path: string,
  opts: AdminFetchOptions = {},
): Promise<Response> {
  const { redirectOnUnauthorized = true, ...init } = opts;
  const csrf = isMutation(init.method ?? "GET") ? cookie(CSRF_COOKIE) : null;
  const res = await fetch(path, buildRequestInit(init, csrf));
  if (res.status === 401 && redirectOnUnauthorized) {
    window.location.href = "/login"; // session หมด -> หน้า login (ผู้ใช้เริ่ม SSO เอง)
  }
  return res;
}

/** payload GET /api/v1/me (เฉพาะ field ที่ใช้). */
interface MeResponse {
  accountId: string;
  displayName: string | null;
  email: string | null;
}

/** payload GET /api/v1/me/access (เฉพาะ field ที่ใช้). */
interface AccessResponse {
  hasPlatformAccess: boolean;
  permissions: string[];
}

/** ประกอบ AdminMe จาก /me + /me/access (permissions ใช้ vocabulary Iam Keys เดียวกับ stack เก่า). */
export function toAdminMe(me: MeResponse, access: AccessResponse): AdminMe {
  return {
    adminId: me.accountId,
    displayName: me.displayName,
    email: me.email ?? null,
    hasPlatformAccess: access.hasPlatformAccess,
    permissions: access.permissions,
  };
}

/** GET /api/v1/me + /api/v1/me/access — แยก auth failure ออกจาก bootstrap/system failure. */
export async function getMe(): Promise<AuthBootstrapResult> {
  try {
    const [meRes, accessRes] = await Promise.all([
      adminFetch("/api/v1/me", { redirectOnUnauthorized: false }),
      adminFetch("/api/v1/me/access", { redirectOnUnauthorized: false }),
    ]);
    const status = meRes.status === 200 ? accessRes.status : meRes.status;
    if (status === 401) return { status: "anon", me: null };
    if (status === 403) return { status: "forbidden", me: null };
    if (status !== 200) return { status: "error", me: null };
    const [me, access] = (await Promise.all([meRes.json(), accessRes.json()])) as [MeResponse, AccessResponse];
    return { status: "authed", me: toAdminMe(me, access) };
  } catch {
    return { status: "error", me: null };
  }
}

export function shouldRedirectToLogin(status: AuthStatus): boolean {
  return status === "anon";
}

/** authenticated session ที่ไม่มี effective permission ต้องแสดง Inline 403 โดยไม่ mount protected child. */
export function shouldShowForbidden(status: AuthStatus, me: AdminMe | null): boolean {
  return status === "forbidden" || (status === "authed" && me !== null && me.permissions.length === 0);
}

/** 204 = logout สำเร็จ, 401 = ไม่มี session อยู่แล้ว (terminal). 403 ใน stack ใหม่คือ csrf_failed ขณะ session ยังอยู่ จึงไม่นับ. */
export function isLogoutSuccessStatus(status: number): boolean {
  return status === 204 || status === 401;
}

/** ออกจากระบบ (device นี้) POST /api/v1/auth/logout; 401 คือ terminal logged-out state ที่ retry กู้ไม่ได้จาก UI. */
export async function logout(): Promise<Response> {
  const response = await adminFetch("/api/v1/auth/logout", {
    method: "POST",
    redirectOnUnauthorized: false,
  });
  if (!isLogoutSuccessStatus(response.status)) throw new Error("admin-logout-failed");
  return response;
}
