import type {
  Permission,
  ResourceGroup,
  ResourceKey,
  Role,
  RoleColor,
  RoleFormInput,
  RoleStatus,
} from "@/types/admin/role";

import { adminFetch } from "./auth";

// Admin BFF client (role CRUD + permission catalog) — ใช้ adminFetch จาก ./auth
// contract: pol-core/docs/reference/admin-fe-integration.md

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
