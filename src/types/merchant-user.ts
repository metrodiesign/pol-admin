export type MerchantUserStatus = "PendingApproval" | "Active" | "Rejected" | "Suspended";

export type PersonType = "Individual" | "Juristic";

export interface MerchantUser {
  id: string;
  /** ISO 8601 — วันที่สมัคร/สร้างบัญชี */
  createdAt: string;
  firstName: string;
  lastName: string;
  /** server-computed `"{firstName} {lastName}"` (REQ-4.8) — ไม่ใช่ค่าที่ฟอร์มส่ง */
  displayName: string;
  personType: PersonType | null;
  /** เลขบัตรประชาชน/เลขผู้เสียภาษี — 13 digits */
  idNumber: string | null;
  producerCode: string | null;
  /** เลขที่ใบอนุญาตตัวแทน — individual = 10 digits, juristic = free text */
  licenseNumber: string | null;
  /** เบอร์โทรยืนยัน OTP — 10 digits */
  phone: string | null;
  /** opaque server-generated key (REQ-4.4/4.9) — ห้ามประกอบ/เก็บ URL, ไม่มี HTTP endpoint serve รูปจริง */
  photoObjectKey: string | null;
  photoContentType: string | null;
  email: string;
  status: MerchantUserStatus;
  /** NULL จนกว่า admin approve; PendingApproval ⇒ null เสมอ (REQ-4.5, 4.6) */
  merchantId: string | null;
}

/**
 * ฟอร์มลงทะเบียน public `/register` — คนละสัญญากับ `MerchantUser` domain model โดยเจตนา
 * (REQ-4.1a): ฟอร์มยัง require ครบทุก field (ไม่ nullable) แม้ domain model ยอม null.
 */
export interface MerchantUserFormData {
  firstName: string;
  lastName: string;
  personType: PersonType;
  idNumber: string;
  producerCode: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  acceptTerms: boolean;
}

/** เพิ่ม photo (required) จาก `MerchantUserFormData` (REQ-11.4) */
export interface MerchantUserRegisterFormData extends MerchantUserFormData {
  photo: File | null;
}

export const PERSON_TYPE_LABEL: Record<PersonType, string> = {
  Individual: "บุคคลธรรมดา",
  Juristic: "นิติบุคคล",
};
