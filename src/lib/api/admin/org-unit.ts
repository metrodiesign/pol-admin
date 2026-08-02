import type {
  OrgUnit,
  OrgUnitCreateInput,
  OrgUnitSegment,
  OrgUnitUpdateInput,
} from "@/types/organization/org-unit";

import { adminFetch } from "./auth";

// Generic CRUD client ของ master data โครงสร้างองค์กร — 4 resource ใช้ contract เดียวกัน
// parametrize ด้วย segment (REQ-7.2). contract: pol-core/docs/reference/{offices,...}.md
// endpoint อยู่ /api/v1/{segment} top-level (ไม่ใช่ /admins) — ต้องมี rewrite /api/:path* ใน next.config.ts

const BASE = "/api/v1"; // prefix จุดเดียว — เปลี่ยน 1 บรรทัดถ้า infra เปลี่ยน
const PAGE_LIMIT = 25; // เพดาน limit ของ backend (clamp 1..25)

/** MasterResponse จาก backend — field ตรงกับ OrgUnit อยู่แล้ว (id/code/name/isActive). */
interface PagedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

async function fetchPage(segment: OrgUnitSegment, page: number): Promise<PagedResult<OrgUnit>> {
  const res = await adminFetch(`${BASE}/${segment}?page=${page}&limit=${PAGE_LIMIT}`);
  if (!res.ok) throw new Error(`${BASE}/${segment} ${res.status}`);
  return (await res.json()) as PagedResult<OrgUnit>;
}

/**
 * GET ทุกหน้าแล้ว concat — server ไม่รองรับ filter/sort จึงกรองฝั่ง client ทั้งหมด (REQ-2.1)
 * ponytail: fetch-all เพดานข้อมูลหลักสิบแถว/resource — โตเกินหลักร้อยค่อยย้าย server pagination
 */
export async function getOrgUnits(segment: OrgUnitSegment): Promise<OrgUnit[]> {
  const first = await fetchPage(segment, 1);
  if (first.totalPages <= 1) return first.items;
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) => fetchPage(segment, i + 2)),
  );
  return first.items.concat(...rest.map((p) => p.items));
}

/** GET รายตัว. 404 -> null. throw ถ้า status อื่น. */
export async function getOrgUnit(segment: OrgUnitSegment, id: string): Promise<OrgUnit | null> {
  const res = await adminFetch(`${BASE}/${segment}/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${BASE}/${segment}/${id} ${res.status}`);
  return (await res.json()) as OrgUnit;
}

/** POST — คืน Response ดิบ (caller เช็ค 409 = code ซ้ำ). */
export function createOrgUnit(
  segment: OrgUnitSegment,
  input: OrgUnitCreateInput,
): Promise<Response> {
  return adminFetch(`${BASE}/${segment}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** PUT — full-replace: body ต้องมี name + isActive ครบเสมอ (type บังคับ). คืน Response ดิบ. */
export function updateOrgUnit(
  segment: OrgUnitSegment,
  id: string,
  input: OrgUnitUpdateInput,
): Promise<Response> {
  return adminFetch(`${BASE}/${segment}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** DELETE = soft-deactivate ฝั่ง backend (isActive=false) ไม่ใช่ลบถาวร. คืน Response ดิบ. */
export function deactivateOrgUnit(segment: OrgUnitSegment, id: string): Promise<Response> {
  return adminFetch(`${BASE}/${segment}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
