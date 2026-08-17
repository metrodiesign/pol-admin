// validation ฟอร์ม division — pure function คืน {field: message}, ว่าง = ผ่าน
// (pattern เดียวกับ validateRoleForm ใน src/lib/admin/role/permissions.ts)
// เกณฑ์ตาม backend: code ^[a-z0-9_]+$ max 64, name max 200 (REQ-4.2)
// ไม่เช็ค code ซ้ำฝั่ง client — ให้ server ตอบ 409 (REQ-4.6)

export interface DivisionFormInput {
  code: string;
  name: string;
}

export type DivisionFormMode = "create" | "edit";

const CODE_PATTERN = /^[a-z0-9_]+$/;
const CODE_MAX = 64;
const NAME_MAX = 200;

export function validateDivisionForm(
  input: DivisionFormInput,
  mode: DivisionFormMode,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = input.name.trim();
  if (!name) {
    errors.name = "กรุณากรอกชื่อ";
  } else if (name.length > NAME_MAX) {
    errors.name = `ชื่อยาวได้ไม่เกิน ${NAME_MAX} ตัวอักษร`;
  }

  if (mode === "create") {
    const code = input.code.trim();
    if (!code) {
      errors.code = "กรุณากรอกรหัส";
    } else if (!CODE_PATTERN.test(code)) {
      errors.code = "รหัสใช้ได้เฉพาะ a-z, 0-9 และ _";
    } else if (code.length > CODE_MAX) {
      errors.code = `รหัสยาวได้ไม่เกิน ${CODE_MAX} ตัวอักษร`;
    }
  }

  return errors;
}
