import type {
  Division,
  DivisionCreateInput,
  DivisionUpdateInput,
} from "@/types/organization/division";

import { adminFetch } from "./auth";
import { getOrgDetail, getOrgList } from "./org-read-contract";

// CRUD client เฉพาะ division (REQ-7.2) — segment hardcode ในไฟล์ ไม่รับ parameter อีกต่อไป
// contract: pol-core/docs/reference/divisions.md
// endpoint อยู่ /api/v1/divisions top-level (ไม่ใช่ /admins) — ต้องมี rewrite /api/:path* ใน next.config.ts

const BASE = "/api/v1/divisions"; // เปลี่ยน 1 บรรทัดถ้า segment เปลี่ยน
/** GET ทุกหน้าผ่าน shared validated read contract. */
export async function getDivisions(): Promise<Division[]> {
  return getOrgList(BASE);
}

/** GET รายตัว. 404 -> null. throw ถ้า status อื่น. */
export async function getDivision(id: string): Promise<Division | null> {
  return getOrgDetail(BASE, id);
}

/** POST — คืน Response ดิบ (caller เช็ค 409 = code ซ้ำ). */
export function createDivision(input: DivisionCreateInput): Promise<Response> {
  return adminFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** PUT — full-replace: body ต้องมี name + isActive ครบเสมอ (type บังคับ). คืน Response ดิบ. */
export function updateDivision(id: string, input: DivisionUpdateInput): Promise<Response> {
  return adminFetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** DELETE = soft-deactivate ฝั่ง backend (isActive=false) ไม่ใช่ลบถาวร. คืน Response ดิบ. */
export function deactivateDivision(id: string): Promise<Response> {
  return adminFetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
