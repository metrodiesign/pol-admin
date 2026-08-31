import type { AdminMe, AuthBootstrapResult, AuthStatus } from "@/types/auth";

// Admin BFF client (auth) — FE ไม่ถือ token; session อยู่ใน httpOnly cookie ที่ backend จัดการ.
// contract: pol-core/docs/reference/admin-fe-integration.md

// login เป็น top-level navigation ตรงไป backend origin (callback ลงทะเบียนที่ backend host จริง) —
// ไม่ผ่าน Next rewrite proxy เพราะ redirect_uri ที่ ASP.NET OIDC handler สร้างต้องตรง host ที่ browser navigate ไปเป๊ะ.
const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "";
const MICROSOFT_LOGIN_PATH = `${API_ORIGIN}/api/v1/admins/auth/microsoft/login`;
const CSRF_COOKIE = "adm_csrf";
const CSRF_HEADER = "X-CSRF-Token";
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// returnTo ที่ส่งให้ backend — ต้องเป็น subset ของ AdminSession:ReturnUrlAllowlist ฝั่ง backend.
// landing = /dashboard; backend ต้องเพิ่ม /dashboard ใน allowlist (ไม่งั้น reject -> falls back /). ดู coordination item.
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

/** สร้าง URL เริ่ม SSO ผ่าน Microsoft/Entra: `/admin/auth/microsoft/login?returnTo=<encoded,clamped>`. */
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

/** GET /admin/me — แยก auth failure ออกจาก bootstrap/system failure. */
export async function getMe(): Promise<AuthBootstrapResult> {
  try {
    const res = await adminFetch("/admin/me", { redirectOnUnauthorized: false });
    if (res.status === 401) return { status: "anon", me: null };
    if (res.status === 403) return { status: "forbidden", me: null };
    if (!res.ok) return { status: "error", me: null };
    return { status: "authed", me: (await res.json()) as AdminMe };
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

/** ออกจากระบบ (device นี้); ถือว่า success เฉพาะตาม endpoint contract ที่คืน 204. */
export async function logout(): Promise<Response> {
  const response = await adminFetch("/admin/auth/logout", {
    method: "POST",
    redirectOnUnauthorized: false,
  });
  if (response.status !== 204) throw new Error("admin-logout-failed");
  return response;
}

/** ออกจากระบบทุก device. */
export function logoutAll(): Promise<Response> {
  return adminFetch("/admin/auth/logout-all", { method: "POST", redirectOnUnauthorized: false });
}
