// Master data โครงสร้างองค์กร — ทั้ง 4 resource (offices/divisions/positions/levels)
// ใช้ shape เดียวกัน 100% ฝั่ง backend (MasterResponse) ต่างแค่ path segment.
// contract: pol-core/docs/reference/{offices,divisions,positions,levels}.md

export type OrgUnitSegment = "offices" | "divisions" | "positions" | "levels";

export interface OrgUnit {
  id: string; // Guid — row key + route param (?id=)
  code: string; // ^[a-z0-9_]+$ max 64, unique, immutable หลัง create
  name: string; // max 200
  isActive: boolean; // false = ปิดใช้งาน (soft-deactivate)
}

export interface OrgUnitCreateInput {
  code: string;
  name: string;
}

/** ทั้งสอง field บังคับ — backend PUT เป็น full-replace, ขาด isActive = โดนปิดใช้งานเงียบ (REQ-5.4) */
export interface OrgUnitUpdateInput {
  name: string;
  isActive: boolean;
}

/** ค่าใน UI (select/filter) map จาก isActive */
export type OrgUnitStatus = "active" | "inactive";
