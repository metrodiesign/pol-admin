import type { Permission, ResourceGroup, Role } from "@/types/role";

/**
 * Typed mock — single source ของ seed สำหรับโมดูล Role (frontend-only, read-only).
 * CRUD ใน UI เป็น UI-shell: ไม่ mutate ค่าเหล่านี้ (REQ-10).
 */

/** Resource groups (5) — เรียงตามลำดับที่ใช้แสดงผลทั้ง matrix และ detail. */
export const RESOURCE_GROUPS: ResourceGroup[] = [
  { key: "txn", label: "ธุรกรรม" },
  { key: "merchant", label: "ร้านค้า" },
  { key: "finance", label: "การเงิน" },
  { key: "user", label: "ผู้ใช้งาน" },
  { key: "system", label: "ระบบ" },
];

/**
 * Permission catalog (14) — denominator `total` ของ REQ-3.5/4.3 = `PERMISSION_CATALOG.length`.
 * key ทุกตัวไม่ซ้ำกัน (REQ-5.3).
 */
export const PERMISSION_CATALOG: Permission[] = [
  { key: "txn.view", label: "ดูรายการธุรกรรม", resource: "txn" },
  { key: "txn.refund", label: "สั่งคืนเงิน", resource: "txn" },
  { key: "txn.export", label: "ส่งออกข้อมูลธุรกรรม", resource: "txn" },
  { key: "merchant.view", label: "ดูข้อมูลร้านค้า", resource: "merchant" },
  { key: "merchant.manage", label: "เพิ่ม/แก้ไข/ระงับร้านค้า", resource: "merchant" },
  { key: "invoice.view", label: "ดูใบแจ้งหนี้", resource: "finance" },
  { key: "invoice.manage", label: "ออก/ยกเลิกใบแจ้งหนี้", resource: "finance" },
  { key: "settlement.run", label: "สั่ง Settlement รอบพิเศษ", resource: "finance" },
  { key: "user.view", label: "ดูรายชื่อผู้ใช้งาน", resource: "user" },
  { key: "user.manage", label: "เปิด/แก้ไข/ปิดบัญชีผู้ใช้", resource: "user" },
  { key: "user.roles", label: "กำหนดบทบาทให้ผู้ใช้", resource: "user" },
  { key: "audit.view", label: "ดูบันทึกกิจกรรม (audit)", resource: "system" },
  { key: "settings.manage", label: "ตั้งค่าระบบและความปลอดภัย", resource: "system" },
  { key: "apikey.manage", label: "จัดการ API client / secret", resource: "system" },
];

/** Seed roles (5) — granted ตรงกับ ui-reference (14/6/5/3/3). */
export const ROLES: Role[] = [
  {
    code: "super_admin",
    name: "ผู้ดูแลระบบสูงสุด",
    description: "เข้าถึงได้ทุกส่วนของระบบ รวมถึงการตั้งค่าความปลอดภัย",
    color: "red",
    status: "active",
    userCount: 1,
    permissions: PERMISSION_CATALOG.map((p) => p.key),
  },
  {
    code: "ops_admin",
    name: "ผู้ดูแลฝ่ายปฏิบัติการ",
    description: "ดูแลธุรกรรมและร้านค้าประจำวัน",
    color: "blue",
    status: "active",
    userCount: 2,
    permissions: [
      "txn.view",
      "txn.refund",
      "txn.export",
      "merchant.view",
      "merchant.manage",
      "user.view",
    ],
  },
  {
    code: "finance",
    name: "ผู้ดูแลการเงิน",
    description: "จัดการใบแจ้งหนี้และรอบ Settlement",
    color: "green",
    status: "active",
    userCount: 2,
    permissions: [
      "txn.view",
      "txn.export",
      "invoice.view",
      "invoice.manage",
      "settlement.run",
    ],
  },
  {
    code: "support",
    name: "เจ้าหน้าที่ซัพพอร์ต",
    description: "ตอบคำถามลูกค้า ดูข้อมูลได้อย่างเดียว",
    color: "amber",
    status: "active",
    userCount: 2,
    permissions: ["txn.view", "merchant.view", "user.view"],
  },
  {
    code: "auditor",
    name: "ผู้ตรวจสอบ",
    description: "เข้าถึงบันทึกกิจกรรมและรายงานแบบอ่านอย่างเดียว",
    color: "gray",
    status: "inactive",
    userCount: 1,
    permissions: ["txn.view", "invoice.view", "audit.view"],
  },
];
