export type ResourceKey = "txn" | "merchant" | "finance" | "user" | "system";

export type RoleColor =
  | "red"
  | "orange"
  | "amber"
  | "green"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "pink"
  | "gray";

/** สถานะการใช้งานบทบาท: active = ใช้งาน, inactive = ปิดใช้งาน */
export type RoleStatus = "active" | "inactive";

export interface ResourceGroup {
  key: ResourceKey;
  /** ธุรกรรม / ร้านค้า / การเงิน / ผู้ใช้งาน / ระบบ */
  label: string;
}

export interface Permission {
  /** `${resource}.${action}` เช่น "txn.view" */
  key: string;
  /** label ไทย */
  label: string;
  resource: ResourceKey;
}

export interface Role {
  /** identity, immutable หลังสร้าง (REQ-7.3) */
  code: string;
  /** ชื่อไทย */
  name: string;
  description: string;
  color: RoleColor;
  status: RoleStatus;
  /** subset ของ catalog key (REQ-5.4) */
  permissions: string[];
  /** seed คงที่ (read-only mock, REQ-10) */
  userCount: number;
}

export type RoleFormMode = "create" | "edit" | "duplicate";

export interface RoleFormInput {
  code: string;
  name: string;
  description: string;
  color: RoleColor;
  status: RoleStatus;
  permissions: string[];
}
