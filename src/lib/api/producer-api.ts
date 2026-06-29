// Producer BFF client — full-page navigate เริ่ม SSO; ไม่ถือ token (session = httpOnly cookie ฝั่ง backend).
// contract: pol-core/docs/reference/producer-google-sso.md
const PRODUCER_LOGIN_PATH = "/producer/auth/login";

// landing หลัง login สำเร็จ (active producer). ต้องอยู่ใน Producer:Session:ReturnUrlAllowlist ฝั่ง backend.
// producer ใหม่/ถูก reject backend จะ redirect ไป RegisterUrl?ticket เองจาก callback (ไม่ผ่าน returnTo).
const PRODUCER_DEFAULT_RETURN_TO = "/register";

/** เริ่ม SSO ด้วย full-page navigate (flow เด้งออกไป Google แล้วกลับมาที่ returnTo). */
export function producerLogin(returnTo: string = PRODUCER_DEFAULT_RETURN_TO): void {
  window.location.href = `${PRODUCER_LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}
