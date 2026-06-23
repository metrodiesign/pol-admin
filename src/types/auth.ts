/** audience ของ OAuth client — admin / producer แยก client_id + aud คนละตัว (REQ-2). */
export type Audience = "admin" | "producer";

/** claim ที่อ่านจาก Google ID token payload (REQ-3.2). decode ฝั่ง client = DEV-only, ไม่ verify ลายเซ็น. */
export interface GoogleIdTokenClaims {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  /** = client_id ที่ใช้ขอ token */
  aud: string;
  /** epoch seconds */
  exp: number;
  /** hosted domain (ถ้ามี) */
  hd?: string;
}

/** mock session: เก็บเฉพาะ field ที่ UI ใช้ (REQ-3.6) — ไม่เก็บ sub/email/PII อื่น. */
export interface MockSession {
  audience: Audience;
  name: string;
  picture?: string;
  /** epoch seconds */
  exp: number;
}
