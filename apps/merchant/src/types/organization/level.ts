// Master data ระดับ — โมดูลอิสระ (REQ-7 revised) แยกจาก resource อื่น (office/division/position)
// contract: pol-core/docs/reference/levels.md

export interface Level {
  id: string; // Guid — row key + route param (?id=)
  code: string; // ^[a-z0-9_]+$ max 64, unique, immutable หลัง create
  name: string; // max 200
  isActive: boolean; // false = ปิดใช้งาน (soft-deactivate)
}

export interface LevelCreateInput {
  code: string;
  name: string;
}

/** ทั้งสอง field บังคับ — backend PUT เป็น full-replace, ขาด isActive = โดนปิดใช้งานเงียบ (REQ-5.4) */
export interface LevelUpdateInput {
  name: string;
  isActive: boolean;
}
