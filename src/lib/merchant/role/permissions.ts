import type {
  Permission,
  ResourceGroup,
  ResourceKey,
  Role,
  RoleFormInput,
  RoleFormMode,
} from "@/types/merchant/user/role";

/**
 * Pure selectors สำหรับโมดูล Role — ไม่มี React, ไม่มี side-effect, test-ready.
 * View ชั้นบนเรียกใช้; ไม่ฝังสูตรเหล่านี้ในตัว view (ARCHITECTURE).
 */

/** จำนวน permission ของ role ที่อยู่ใน catalog จริง — ตัด key เถื่อนทิ้ง (REQ-5.5). */
export function grantedCount(
  permissions: string[],
  catalog: Permission[],
): number {
  const valid = new Set(catalog.map((p) => p.key));
  return permissions.filter((key) => valid.has(key)).length;
}

export interface GroupedCatalogEntry {
  group: ResourceGroup;
  permissions: Permission[];
}

/** catalog จัดกลุ่มตาม resource เรียงตามลำดับ `groups` (REQ-4.4, matrix). */
export function groupedCatalog(
  catalog: Permission[],
  groups: ResourceGroup[],
): GroupedCatalogEntry[] {
  return groups.map((group) => ({
    group,
    permissions: catalog.filter((p) => p.resource === group.key),
  }));
}

/** จำนวนสิทธิ์ที่ได้รับ/ทั้งหมด ของ resource group หนึ่ง (REQ-4.4). */
export function groupGranted(
  role: Role,
  groupKey: ResourceKey,
  catalog: Permission[],
): { granted: number; total: number } {
  const inGroup = catalog.filter((p) => p.resource === groupKey);
  const held = new Set(role.permissions);
  return {
    granted: inGroup.filter((p) => held.has(p.key)).length,
    total: inGroup.length,
  };
}

/** กรอง roles ตามชื่อ/รหัส/คำอธิบาย แบบ case-insensitive (REQ-12.2). */
export function filterRoles(roles: Role[], query: string): Role[] {
  const q = query.trim().toLowerCase();
  if (!q) return roles;
  return roles.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q),
  );
}

/** บทบาทลบได้เมื่อไม่มีผู้ใช้ผูกอยู่ (REQ-9). */
export function isRoleDeletable(role: Role): boolean {
  return role.userCount === 0;
}

/**
 * รหัสสำเนาที่ยังไม่ซ้ำ: `${srcCode}_copy`, ถ้าซ้ำต่อ `_copy2`, `_copy3`, ... (REQ-8.1).
 */
export function makeCopyCode(srcCode: string, existingCodes: string[]): string {
  const taken = new Set(existingCodes);
  const base = `${srcCode}_copy`;
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}${n}`)) n += 1;
  return `${base}${n}`;
}

/** รหัสบทบาทที่ derive จากชื่อ (สร้างใหม่ — ไม่มีช่องกรอกรหัสแยก): slug ชื่อ, ซ้ำต่อเลข */
export function makeCodeFromName(name: string, existingCodes: string[]): string {
  const taken = new Set(existingCodes);
  const base = name.trim().toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "_").replace(/^_+|_+$/g, "") || "role";
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}${n}`)) n += 1;
  return `${base}${n}`;
}

/**
 * Validate ฟอร์มบทบาท — คืน map `{ field: message }` (ว่าง = ผ่าน).
 * create/duplicate เช็ค code ว่าง + code ซ้ำ; edit ไม่เช็ค code (read-only identity, REQ-7.3).
 * REQ-6.4 / 6.5 / 7.4 / 8.1.
 */
export function validateRoleForm(
  input: RoleFormInput,
  existingCodes: string[],
  mode: RoleFormMode,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.name.trim()) {
    errors.name = "กรุณากรอกชื่อบทบาท";
  }

  if (mode !== "edit") {
    const code = input.code.trim();
    if (!code) {
      errors.code = "กรุณากรอกรหัสบทบาท";
    } else if (existingCodes.includes(code)) {
      errors.code = "รหัสนี้ถูกใช้แล้ว";
    }
  }

  return errors;
}
