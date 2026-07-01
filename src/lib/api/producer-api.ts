import type { ProducerFormData } from "@/types/producer";

// Producer BFF client — full-page navigate เริ่ม SSO; ไม่ถือ token (session = httpOnly cookie ฝั่ง backend).
// contract: pol-core/docs/reference/producer-google-sso.md
const PRODUCER_LOGIN_PATH = "/producer/auth/login";
const PRODUCER_REGISTER_PATH = "/producer/register";

// landing หลัง login สำเร็จ (active producer). ต้องอยู่ใน Producer:Session:ReturnUrlAllowlist ฝั่ง backend.
// producer ใหม่/ถูก reject backend จะ redirect ไป RegisterUrl?ticket เองจาก callback (ไม่ผ่าน returnTo).
const PRODUCER_DEFAULT_RETURN_TO = "/register";

/** เริ่ม SSO ด้วย full-page navigate (flow เด้งออกไป Google แล้วกลับมาที่ returnTo). */
export function producerLogin(returnTo: string = PRODUCER_DEFAULT_RETURN_TO): void {
  window.location.href = `${PRODUCER_LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}

// map ProducerFormData -> multipart ตาม wire contract (§7). แยกเป็น pure fn เพราะ field-name
// mismatch = silent 400: `phoneNumber` ฝั่ง FE ต้องส่งเป็น `phone`; email/acceptTerms ไม่ส่ง
// (backend อ่าน email จาก ticket, REQ-4.2); licenseNumber ว่างไม่ append. identity มาจาก ticket.
export function buildRegisterFormData(
  data: ProducerFormData,
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
 * POST multipart ไป /producer/register (anonymous + ticket-gated, ไม่มี CSRF — pre-session route).
 * ห้าม set Content-Type เอง — ให้ browser ใส่ multipart boundary. คืน raw Response ให้ caller
 * เช็ค status (201/400/409/413/429) เอง (mirror adminFetch).
 */
export function producerRegister(fd: FormData): Promise<Response> {
  return fetch(PRODUCER_REGISTER_PATH, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
}
