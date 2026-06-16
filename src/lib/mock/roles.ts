import type { Role } from "@/types/role";
import type { Permission } from "@/types/permission";

export const PERMISSIONS: Permission[] = [
  { id: "payment.create", label: "สร้างลิงก์ชำระเงิน", group: "Payment" },
  { id: "payment.read", label: "ดูธุรกรรม/ลิงก์", group: "Payment" },
  { id: "payment.capture", label: "Capture ธุรกรรม", group: "Payment" },
  { id: "payment.void", label: "Void ธุรกรรม", group: "Payment" },
  { id: "payment.refund", label: "Refund ธุรกรรม", group: "Payment" },
  { id: "policy.read", label: "ดูกรมธรรม์", group: "Policy" },
  { id: "policy.write", label: "แก้ไขกรมธรรม์", group: "Policy" },
  { id: "user.read", label: "ดูผู้ใช้งาน", group: "Users" },
  { id: "user.approve", label: "อนุมัติผู้ใช้งานใหม่", group: "Users" },
  { id: "user.write", label: "แก้ไขผู้ใช้งาน/Role", group: "Users" },
  { id: "config.psp", label: "ตั้งค่า PSP", group: "System" },
  { id: "config.webhook", label: "ตั้งค่า Webhooks", group: "System" },
  { id: "config.apiclient", label: "จัดการ API Clients", group: "System" },
  { id: "audit.read", label: "ดู Audit Log", group: "System" },
  { id: "report.read", label: "ดูรายงาน", group: "Reports" },
  { id: "report.export", label: "ส่งออกรายงาน", group: "Reports" },
];

const ALL_PERMISSION_IDS = PERMISSIONS.map((p) => p.id);

export const ROLES: Role[] = [
  { id: "admin.system", portal: "admin", name: "ผู้ดูแลระบบ", desc: "สิทธิ์สูงสุด · จัดการระบบ ผู้ใช้ และตั้งค่าทั้งหมด", color: "danger", permissions: ALL_PERMISSION_IDS },
  { id: "admin.finance", portal: "admin", name: "ผู้ดูแลการเงิน", desc: "จัดการ refund, reconcile, รายงานการเงิน", color: "warning", permissions: ["payment.read", "payment.refund", "policy.read", "audit.read", "report.read", "report.export"] },
  { id: "admin.operator", portal: "admin", name: "ผู้ปฏิบัติการ", desc: "ดำเนินการธุรกรรม (capture/void), จัดการลิงก์", color: "info", permissions: ["payment.create", "payment.read", "payment.capture", "payment.void", "policy.read", "user.read", "report.read"] },
  { id: "admin.viewer", portal: "admin", name: "ผู้ดูข้อมูล", desc: "ดูข้อมูลทั้งหมด · อ่านอย่างเดียว", color: "neutral", permissions: ["payment.read", "policy.read", "user.read", "audit.read", "report.read"] },
  { id: "merchant.system", portal: "merchant", name: "Merchant System", desc: "จัดการระบบของ Merchant", color: "danger", permissions: ["payment.create", "payment.read", "payment.capture", "payment.void", "policy.read", "user.read", "user.write", "report.read"] },
  { id: "merchant.finance", portal: "merchant", name: "Merchant Finance", desc: "จัดการการเงินของ Merchant", color: "warning", permissions: ["payment.read", "payment.refund", "policy.read", "report.read", "report.export"] },
  { id: "merchant.operator", portal: "merchant", name: "Merchant Operator", desc: "สร้าง/ส่งลิงก์ชำระเงิน", color: "info", permissions: ["payment.create", "payment.read", "policy.read", "report.read"] },
  { id: "merchant.viewer", portal: "merchant", name: "Merchant Viewer", desc: "ดูข้อมูลเฉพาะของตน", color: "neutral", permissions: ["payment.read", "policy.read", "report.read"] },
];
