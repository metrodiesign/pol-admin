import type { Office, OfficeCreateInput, OfficeUpdateInput } from "@/types/organization/office";

import { adminFetch } from "./auth";

// CRUD client เฉพาะ office (REQ-7.2) — segment hardcode ในไฟล์ ไม่รับ parameter อีกต่อไป
// contract: pol-core/docs/reference/offices.md
// endpoint อยู่ /api/v1/offices top-level (ไม่ใช่ /admins) — ต้องมี rewrite /api/:path* ใน next.config.ts

const BASE = "/api/v1/offices"; // เปลี่ยน 1 บรรทัดถ้า segment เปลี่ยน
const PAGE_LIMIT = 25; // เพดาน limit ของ backend (clamp 1..25)

/** MasterResponse จาก backend — field ตรงกับ Office อยู่แล้ว (id/code/name/isActive). */
interface PagedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

async function fetchPage(page: number): Promise<PagedResult<Office>> {
  const res = await adminFetch(`${BASE}?page=${page}&limit=${PAGE_LIMIT}`);
  if (!res.ok) throw new Error(`${BASE} ${res.status}`);
  return (await res.json()) as PagedResult<Office>;
}

/**
 * GET ทุกหน้าแล้ว concat — server ไม่รองรับ filter/sort จึงกรองฝั่ง client ทั้งหมด (REQ-2.1)
 * ponytail: fetch-all เพดานข้อมูลหลักสิบแถว/resource — โตเกินหลักร้อยค่อยย้าย server pagination
 */
export async function getOffices(): Promise<Office[]> {
  const first = await fetchPage(1);
  if (first.totalPages <= 1) return first.items;
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) => fetchPage(i + 2)),
  );
  return first.items.concat(...rest.map((p) => p.items));
}

/** GET รายตัว. 404 -> null. throw ถ้า status อื่น. */
export async function getOffice(id: string): Promise<Office | null> {
  const res = await adminFetch(`${BASE}/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${BASE}/${id} ${res.status}`);
  return (await res.json()) as Office;
}

/** POST — คืน Response ดิบ (caller เช็ค 409 = code ซ้ำ). */
export function createOffice(input: OfficeCreateInput): Promise<Response> {
  return adminFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** PUT — full-replace: body ต้องมี name + isActive ครบเสมอ (type บังคับ). คืน Response ดิบ. */
export function updateOffice(id: string, input: OfficeUpdateInput): Promise<Response> {
  return adminFetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** DELETE = soft-deactivate ฝั่ง backend (isActive=false) ไม่ใช่ลบถาวร. คืน Response ดิบ. */
export function deactivateOffice(id: string): Promise<Response> {
  return adminFetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
