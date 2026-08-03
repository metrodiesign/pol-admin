// Master data สำนักงาน — โมดูลอิสระ (REQ-7 revised) แยกจาก resource อื่น (division/level/position)
// contract: pol-core/docs/reference/offices.md

export interface Office {
  id: string; // Guid — row key + route param (?id=)
  code: string; // ^[a-z0-9_]+$ max 64, unique, immutable หลัง create
  name: string; // max 200
  isActive: boolean; // false = ปิดใช้งาน (soft-deactivate)
}

export interface OfficeCreateInput {
  code: string;
  name: string;
}

/** ทั้งสอง field บังคับ — backend PUT เป็น full-replace, ขาด isActive = โดนปิดใช้งานเงียบ (REQ-5.4) */
export interface OfficeUpdateInput {
  name: string;
  isActive: boolean;
}
