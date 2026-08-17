// Master data ตำแหน่ง — โมดูลอิสระ (REQ-7 revised) แยกจาก resource อื่น (office/division/level)
// contract: pol-core/docs/reference/positions.md

export interface Position {
  id: string; // Guid — row key + route param (?id=)
  code: string; // ^[a-z0-9_]+$ max 64, unique, immutable หลัง create
  name: string; // max 200
  isActive: boolean; // false = ปิดใช้งาน (soft-deactivate)
}

export interface PositionCreateInput {
  code: string;
  name: string;
}

/** ทั้งสอง field บังคับ — backend PUT เป็น full-replace, ขาด isActive = โดนปิดใช้งานเงียบ (REQ-5.4) */
export interface PositionUpdateInput {
  name: string;
  isActive: boolean;
}
