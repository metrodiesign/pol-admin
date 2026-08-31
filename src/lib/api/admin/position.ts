import type {
  Position,
  PositionCreateInput,
  PositionUpdateInput,
} from "@/types/organization/position";

import { adminFetch } from "./auth";
import { getOrgDetail, getOrgList } from "./org-read-contract";

// CRUD client เฉพาะ position (REQ-7.2) — segment hardcode ในไฟล์ ไม่รับ parameter อีกต่อไป
// contract: pol-core/docs/reference/positions.md
// endpoint อยู่ /api/v1/positions top-level (ไม่ใช่ /admins) — ต้องมี rewrite /api/:path* ใน next.config.ts

const BASE = "/api/v1/positions"; // เปลี่ยน 1 บรรทัดถ้า segment เปลี่ยน
/** GET ทุกหน้าผ่าน shared validated read contract. */
export async function getPositions(): Promise<Position[]> {
  return getOrgList(BASE);
}

/** GET รายตัว. 404 -> null. throw ถ้า status อื่น. */
export async function getPosition(id: string): Promise<Position | null> {
  return getOrgDetail(BASE, id);
}

/** POST — คืน Response ดิบ (caller เช็ค 409 = code ซ้ำ). */
export function createPosition(input: PositionCreateInput): Promise<Response> {
  return adminFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** PUT — full-replace: body ต้องมี name + isActive ครบเสมอ (type บังคับ). คืน Response ดิบ. */
export function updatePosition(id: string, input: PositionUpdateInput): Promise<Response> {
  return adminFetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** DELETE = soft-deactivate ฝั่ง backend (isActive=false) ไม่ใช่ลบถาวร. คืน Response ดิบ. */
export function deactivatePosition(id: string): Promise<Response> {
  return adminFetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
