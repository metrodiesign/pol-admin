import type { Level, LevelCreateInput, LevelUpdateInput } from "@/types/organization/level";

import { adminFetch } from "./auth";
import { getOrgDetail, getOrgList } from "./org-read-contract";

// CRUD client เฉพาะ level (REQ-7.2) — segment hardcode ในไฟล์ ไม่รับ parameter อีกต่อไป
// contract: pol-core/docs/reference/levels.md
// endpoint อยู่ /api/v1/levels top-level (ไม่ใช่ /admins) — ต้องมี rewrite /api/:path* ใน next.config.ts

const BASE = "/api/v1/levels"; // เปลี่ยน 1 บรรทัดถ้า segment เปลี่ยน
/** GET ทุกหน้าผ่าน shared validated read contract. */
export async function getLevels(): Promise<Level[]> {
  return getOrgList(BASE);
}

/** GET รายตัว. 404 -> null. throw ถ้า status อื่น. */
export async function getLevel(id: string): Promise<Level | null> {
  return getOrgDetail(BASE, id);
}

/** POST — คืน Response ดิบ (caller เช็ค 409 = code ซ้ำ). */
export function createLevel(input: LevelCreateInput): Promise<Response> {
  return adminFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** PUT — full-replace: body ต้องมี name + isActive ครบเสมอ (type บังคับ). คืน Response ดิบ. */
export function updateLevel(id: string, input: LevelUpdateInput): Promise<Response> {
  return adminFetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** DELETE = soft-deactivate ฝั่ง backend (isActive=false) ไม่ใช่ลบถาวร. คืน Response ดิบ. */
export function deactivateLevel(id: string): Promise<Response> {
  return adminFetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
