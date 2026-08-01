import type { AdminMe } from "@/types/auth";
import type {
  Permission,
  ResourceGroup,
  ResourceKey,
  Role,
  RoleColor,
  RoleFormInput,
  RoleStatus,
} from "@/types/role";

// Admin BFF client — FE ไม่ถือ token; session อยู่ใน httpOnly cookie ที่ backend จัดการ.
// contract: pol-core/docs/reference/admin-fe-integration.md

// login เป็น top-level navigation ตรงไป backend origin (callback ลงทะเบียนที่ backend host จริง) —
// ไม่ผ่าน Next rewrite proxy เพราะ redirect_uri ที่ ASP.NET OIDC handler สร้างต้องตรง host ที่ browser navigate ไปเป๊ะ.
const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "";
const LOGIN_PATH = `${API_ORIGIN}/api/v1/admins/auth/google/login`;
const MICROSOFT_LOGIN_PATH = `${API_ORIGIN}/api/v1/admins/auth/microsoft/login`;
const CSRF_COOKIE = "adm_csrf";
const CSRF_HEADER = "X-CSRF-Token";
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// returnTo ที่ส่งให้ backend — ต้องเป็น subset ของ AdminSession:ReturnUrlAllowlist ฝั่ง backend.
// landing = /main; backend ต้องเพิ่ม /main ใน allowlist (ไม่งั้น reject -> falls back /). ดู coordination item.
const RETURN_TO_ALLOWLIST: readonly string[] = ["/", "/minimals", "/main"];
const DEFAULT_RETURN_TO = "/main";

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

/** สร้าง URL เริ่ม SSO: `/admin/auth/google/login?returnTo=<encoded,clamped>`. */
export function buildLoginUrl(returnTo: string): string {
  return `${LOGIN_PATH}?returnTo=${encodeURIComponent(clampReturnTo(returnTo))}`;
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

/** เริ่ม SSO ด้วย full-page navigate (ไม่ใช่ fetch — flow เด้งออกไป Google แล้วกลับมาที่ returnTo). */
export function login(returnTo: string = DEFAULT_RETURN_TO): void {
  window.location.href = buildLoginUrl(returnTo);
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

/** GET /admin/me — 200 -> AdminMe, 401 -> null (ไม่เด้ง). throw ถ้า status อื่น. */
export async function getMe(): Promise<AdminMe | null> {
  const res = await adminFetch("/admin/me", { redirectOnUnauthorized: false });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`/admin/me ${res.status}`);
  return (await res.json()) as AdminMe;
}

/** RoleResponse จาก backend (`GET /admin/roles`) — field nullable/loose ตาม OpenAPI. */
interface RoleResponse {
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  status: string;
  permissions: string[] | null;
  userCount: number | string;
}

/** map RoleResponse -> Role (coerce null/string กัน table/filter พัง). */
function toRole(r: RoleResponse): Role {
  return {
    code: r.code,
    name: r.name,
    description: r.description ?? "",
    color: (r.color ?? "gray") as RoleColor,
    status: r.status as RoleStatus,
    permissions: r.permissions ?? [],
    userCount: Number(r.userCount) || 0,
  };
}

/** GET /admin/roles — list บทบาททั้งหมด. 401 -> adminFetch เด้ง /login. throw ถ้า status อื่น. */
export async function getRoles(): Promise<Role[]> {
  const res = await adminFetch("/admin/roles");
  if (!res.ok) throw new Error(`/admin/roles ${res.status}`);
  const raw = (await res.json()) as RoleResponse[];
  return raw.map(toRole);
}

/** GET /admin/roles/{code} — รายตัว. 404 -> null. throw ถ้า status อื่น. */
export async function getRole(code: string): Promise<Role | null> {
  const res = await adminFetch(`/admin/roles/${encodeURIComponent(code)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`/admin/roles/${code} ${res.status}`);
  return toRole((await res.json()) as RoleResponse);
}

/** POST /admin/roles — สร้างบทบาท. คืน Response ดิบ (caller เช็ค 409 = code ซ้ำ). */
export function createRole(input: RoleFormInput): Promise<Response> {
  return adminFetch("/admin/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** PUT /admin/roles/{code} — แก้ไข (code immutable, ไม่ส่งใน body). คืน Response ดิบ. */
export function updateRole(code: string, input: RoleFormInput): Promise<Response> {
  const { code: _omit, ...body } = input;
  return adminFetch(`/admin/roles/${encodeURIComponent(code)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** DELETE /admin/roles/{code}. คืน Response ดิบ (caller เช็ค 409 = มีผู้ใช้ผูกอยู่). */
export function deleteRole(code: string): Promise<Response> {
  return adminFetch(`/admin/roles/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
}

/** PermissionCatalogResponse จาก backend (GET /admin/permissions). */
interface PermissionCatalogResponse {
  groups: { key: string; label: string }[];
  permissions: { key: string; label: string; resource: string }[];
}

export interface PermissionCatalog {
  groups: ResourceGroup[];
  permissions: Permission[];
}

/** GET /admin/permissions — catalog สิทธิ์ + resource groups. throw ถ้า status อื่น. */
export async function getPermissionCatalog(): Promise<PermissionCatalog> {
  const res = await adminFetch("/admin/permissions");
  if (!res.ok) throw new Error(`/admin/permissions ${res.status}`);
  const raw = (await res.json()) as PermissionCatalogResponse;
  return {
    groups: raw.groups.map((g) => ({ key: g.key as ResourceKey, label: g.label })),
    permissions: raw.permissions.map((p) => ({
      key: p.key,
      label: p.label,
      resource: p.resource as ResourceKey,
    })),
  };
}

/** ออกจากระบบ (device นี้). */
export function logout(): Promise<Response> {
  return adminFetch("/admin/auth/logout", { method: "POST", redirectOnUnauthorized: false });
}

/** ออกจากระบบทุก device. */
export function logoutAll(): Promise<Response> {
  return adminFetch("/admin/auth/logout-all", { method: "POST", redirectOnUnauthorized: false });
}
