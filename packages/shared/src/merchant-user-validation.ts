import type {
  MerchantUserFormData,
  PersonType,
  MerchantUserRegisterFormData,
} from "./merchant-user";

/** เลขบัตรประชาชน/เลขผู้เสียภาษี — 13 หลัก + checksum (REQ-5.1) */
export function isThaiId(value: string): boolean {
  if (!/^\d{13}$/.test(value)) return false;
  const digits = value.split("").map(Number);
  const sum = digits.slice(0, 12).reduce((acc, d, i) => acc + d * (13 - i), 0);
  return digits[12] === (11 - (sum % 11)) % 10;
}

/** เบอร์มือถือไทย 06x/08x/09x 10 หลัก (REQ-5.2) */
export function isThaiPhone(value: string): boolean {
  return /^0[689]\d{8}$/.test(value);
}

/**
 * เลขที่ใบอนุญาตตัวแทน (REQ-5.3–5.5):
 * - ว่างได้ (optional)
 * - individual: ตัวเลข 10 หลักเท่านั้น
 * - juristic: free text
 */
export function isValidLicense(
  personType: PersonType,
  value: string,
): boolean {
  if (value.trim() === "") return true;
  if (personType === "Individual") return /^\d{10}$/.test(value);
  return true;
}

/** email — TLD ต้องมีอย่างน้อย 2 ตัวอักษร (REQ-5.6) */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export type MerchantUserFormErrors = Partial<Record<keyof MerchantUserFormData, string>>;

/**
 * รวมกฎ required (REQ-5.7) + format (REQ-5.1–5.6). คืน map ของ field -> ข้อความ error
 * (ว่าง = ผ่าน). `requireAcceptTerms` เปิดเฉพาะหน้า create (REQ-4.9).
 */
export function validateMerchantUserForm(
  form: MerchantUserFormData,
  opts: { requireAcceptTerms?: boolean } = {},
): MerchantUserFormErrors {
  const errors: MerchantUserFormErrors = {};

  if (!form.firstName.trim()) errors.firstName = "กรุณากรอกชื่อ";
  if (!form.lastName.trim()) errors.lastName = "กรุณากรอกนามสกุล";
  if (!form.personType) errors.personType = "กรุณาเลือกประเภทบุคคล";

  if (!form.idNumber.trim())
    errors.idNumber = "กรุณากรอกเลขบัตรประชาชน/เลขผู้เสียภาษี";
  else if (!isThaiId(form.idNumber)) errors.idNumber = "ต้องเป็นตัวเลข 13 หลักที่ถูกต้อง";

  if (!form.producerCode.trim()) {
    errors.producerCode = "กรุณากรอกรหัสตัวแทน";
  } else {
    const maxCode = form.personType === "Individual" ? 10 : 20;
    if (form.producerCode.length > maxCode)
      errors.producerCode = `รหัสตัวแทนต้องไม่เกิน ${maxCode} ตัวอักษร`;
  }

  if (!isValidLicense(form.personType, form.licenseNumber))
    errors.licenseNumber = "กรณีบุคคลธรรมดาต้องเป็นตัวเลข 10 หลัก";

  if (!form.phoneNumber.trim())
    errors.phoneNumber = "กรุณากรอกหมายเลขโทรศัพท์";
  else if (!isThaiPhone(form.phoneNumber))
    errors.phoneNumber = "ต้องเป็นเบอร์มือถือไทย (06x, 08x, 09x) 10 หลัก";

  if (!form.email.trim()) errors.email = "กรุณากรอกอีเมล";
  else if (!isEmail(form.email)) errors.email = "รูปแบบอีเมลไม่ถูกต้อง";

  if (opts.requireAcceptTerms && !form.acceptTerms)
    errors.acceptTerms = "กรุณายอมรับเงื่อนไขการใช้บริการ";

  return errors;
}

export type RegisterFormErrors = Partial<
  Record<keyof MerchantUserRegisterFormData, string>
>;

/**
 * Validation หน้า public `/register` (REQ-11.4, 11.6): reuse `validateMerchantUserForm`
 * (acceptTerms required) แล้วเพิ่มกฎ photo required. ไม่ duplicate regex.
 */
export function validateRegisterForm(
  form: MerchantUserRegisterFormData,
): RegisterFormErrors {
  return validateMerchantUserForm(form, { requireAcceptTerms: true });
}
