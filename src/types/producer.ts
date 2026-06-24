export type ProducerStatus =
  | "active"
  | "pending"
  | "banned"
  | "rejected"
  | "disabled";

export type ProducerPersonType = "individual" | "juristic";

export interface Producer {
  id: string;
  firstName: string;
  lastName: string;
  personType: ProducerPersonType;
  /** เลขบัตรประชาชน/เลขผู้เสียภาษี — 13 digits */
  idNumber: string;
  producerCode: string;
  /** เลขที่ใบอนุญาตตัวแทน — optional; individual = 10 digits, juristic = free text */
  licenseNumber: string;
  avatarUrl: string;
  /** เบอร์โทรยืนยัน OTP — 10 digits */
  phoneNumber: string;
  email: string;
  status: ProducerStatus;
}

export interface ProducerFormData {
  firstName: string;
  lastName: string;
  personType: ProducerPersonType;
  idNumber: string;
  producerCode: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  acceptTerms: boolean;
}

/** ฟอร์มลงทะเบียน public `/register` — เพิ่ม photo (required) จาก ProducerFormData (REQ-11.4) */
export interface ProducerRegisterFormData extends ProducerFormData {
  photo: File | null;
}

export const PERSON_TYPE_LABEL: Record<ProducerPersonType, string> = {
  individual: "บุคคลธรรมดา",
  juristic: "นิติบุคคล",
};
