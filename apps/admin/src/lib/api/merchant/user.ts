import type { MerchantUserFormData } from "@pol/shared/merchant-user";

// Merchant user BFF client — full-page navigate เริ่ม SSO; ไม่ถือ token (session = httpOnly cookie ฝั่ง backend).
// contract: pol-core/docs/reference/producer-google-sso.md
// login เป็น top-level navigation ตรงไป backend origin (เหตุผลเดียวกับ lib/api/admin/auth.ts: redirect_uri ต้องตรง host จริง).
const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "";
const MERCHANT_USER_LOGIN_PATH = `${API_ORIGIN}/api/v1/merchants/auth/google/login`;
const MERCHANT_USER_MICROSOFT_LOGIN_PATH = `${API_ORIGIN}/api/v1/merchants/auth/microsoft/login`;
const MERCHANT_USER_REGISTER_PATH = "/producer/users/register";

// landing หลัง login สำเร็จ (active merchant user). ต้องอยู่ใน Producer:Session:ReturnUrlAllowlist ฝั่ง backend.
// merchant user ใหม่/ถูก reject backend จะ redirect ไป RegisterUrl?ticket เองจาก callback (ไม่ผ่าน returnTo).
const MERCHANT_USER_DEFAULT_RETURN_TO = "/register";

/** เริ่ม SSO ด้วย full-page navigate (flow เด้งออกไป Google แล้วกลับมาที่ returnTo). */
export function merchantUserLogin(returnTo: string = MERCHANT_USER_DEFAULT_RETURN_TO): void {
  window.location.href = `${MERCHANT_USER_LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}

/** เริ่ม SSO ผ่าน Microsoft/Entra ด้วย full-page navigate. */
export function merchantUserMicrosoftLogin(returnTo: string = MERCHANT_USER_DEFAULT_RETURN_TO): void {
  window.location.href = `${MERCHANT_USER_MICROSOFT_LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}

// map MerchantUserFormData -> multipart ตาม wire contract (§7). แยกเป็น pure fn เพราะ field-name
// mismatch = silent 400: `phoneNumber` ฝั่ง FE ต้องส่งเป็น `phone`; email/acceptTerms ไม่ส่ง
// (backend อ่าน email จาก ticket, REQ-4.2); licenseNumber ว่างไม่ append. identity มาจาก ticket.
export function buildRegisterFormData(
  data: MerchantUserFormData,
  ticket: string,
  photo: File | null,
): FormData {
  const fd = new FormData();
  fd.append("ticket", ticket);
  fd.append("firstName", data.firstName);
  fd.append("lastName", data.lastName);
  fd.append("personType", data.personType);
  fd.append("idNumber", data.idNumber);
  fd.append("producerCode", data.producerCode);
  if (data.licenseNumber.trim()) fd.append("licenseNumber", data.licenseNumber);
  fd.append("phone", data.phoneNumber);
  if (photo) fd.append("photo", photo);
  return fd;
}

/**
 * POST multipart ไป /producer/users/register (anonymous + ticket-gated, ไม่มี CSRF — pre-session route).
 * ห้าม set Content-Type เอง — ให้ browser ใส่ multipart boundary. คืน raw Response ให้ caller
 * เช็ค status (201/400/409/413/429) เอง (mirror adminFetch).
 */
export function merchantUserRegister(fd: FormData): Promise<Response> {
  return fetch(MERCHANT_USER_REGISTER_PATH, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
}
