import type { ProducerFormData, ProducerPersonType } from "@/types/producer";

/** เลขบัตรประชาชน/เลขผู้เสียภาษี — ตัวเลข 13 หลักเท่านั้น (REQ-5.1) */
export function isThaiId(value: string): boolean {
  return /^\d{13}$/.test(value);
}

/** เบอร์โทร OTP — ตัวเลข 10 หลักเท่านั้น (REQ-5.2) */
export function isThaiPhone(value: string): boolean {
  return /^\d{10}$/.test(value);
}

/**
 * เลขที่ใบอนุญาตตัวแทน (REQ-5.3–5.5):
 * - ว่างได้ (optional)
 * - individual: ตัวเลข 10 หลักเท่านั้น
 * - juristic: free text
 */
export function isValidLicense(
  personType: ProducerPersonType,
  value: string,
): boolean {
  if (value.trim() === "") return true;
  if (personType === "individual") return /^\d{10}$/.test(value);
  return true;
}

/** email format ขั้นพื้นฐาน (REQ-5.6) */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export type ProducerFormErrors = Partial<Record<keyof ProducerFormData, string>>;

/**
 * รวมกฎ required (REQ-5.7) + format (REQ-5.1–5.6). คืน map ของ field -> ข้อความ error
 * (ว่าง = ผ่าน). `requireAcceptTerms` เปิดเฉพาะหน้า create (REQ-4.9).
 */
export function validateProducerForm(
  form: ProducerFormData,
  opts: { requireAcceptTerms?: boolean } = {},
): ProducerFormErrors {
  const errors: ProducerFormErrors = {};

  if (!form.firstName.trim()) errors.firstName = "กรุณากรอกชื่อ";
  if (!form.lastName.trim()) errors.lastName = "กรุณากรอกนามสกุล";
  if (!form.personType) errors.personType = "กรุณาเลือกประเภทบุคคล";

  if (!form.idNumber.trim())
    errors.idNumber = "กรุณากรอกเลขบัตรประชาชน/เลขผู้เสียภาษี";
  else if (!isThaiId(form.idNumber)) errors.idNumber = "ต้องเป็นตัวเลข 13 หลัก";

  if (!form.producerCode.trim()) errors.producerCode = "กรุณากรอกรหัสตัวแทน";

  if (!isValidLicense(form.personType, form.licenseNumber))
    errors.licenseNumber = "กรณีบุคคลธรรมดาต้องเป็นตัวเลข 10 หลัก";

  if (!form.phoneNumber.trim())
    errors.phoneNumber = "กรุณากรอกหมายเลขโทรศัพท์";
  else if (!isThaiPhone(form.phoneNumber))
    errors.phoneNumber = "ต้องเป็นตัวเลข 10 หลัก";

  if (!form.email.trim()) errors.email = "กรุณากรอกอีเมล";
  else if (!isEmail(form.email)) errors.email = "รูปแบบอีเมลไม่ถูกต้อง";

  if (opts.requireAcceptTerms && !form.acceptTerms)
    errors.acceptTerms = "กรุณายอมรับเงื่อนไขการใช้บริการ";

  return errors;
}
