import type { Audience, MockSession } from "@/types/auth";

import { LANDING_BY_AUDIENCE } from "./auth-config";
import { decodeJwtPayload } from "./jwt";

/**
 * Pure decision fns ของ auth — ไม่มี React, ไม่แตะ window/storage, test-ready (ARCHITECTURE).
 * View ชั้นบนเรียกใช้; inject `nowSec` แทนอ่านนาฬิกาเอง -> deterministic.
 */

export type ClaimReason =
  | "malformed"
  | "missing_claims"
  | "aud_mismatch"
  | "expired"
  | "email_unverified"
  | "hd_blocked";

export type ClaimResult =
  | { ok: true; session: MockSession }
  | { ok: false; reason: ClaimReason };

export interface VerifyOpts {
  audience: Audience;
  /** aud ใน token ต้องตรงกับ client_id ที่กด (REQ-3.4) */
  expectedClientId: string;
  /** ว่าง/undefined = ไม่ตรวจ hd (REQ-3.8) */
  allowedHostedDomains?: string[];
  /** inject เวลา -> pure/testable */
  nowSec: number;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

/** email_verified จาก Google อาจมาเป็น boolean หรือ string "true"/"false" (m4). null = ขาด/ชนิดแปลก. */
function normalizeEmailVerified(v: unknown): boolean | null {
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return null;
}

/**
 * ตรวจ claim แล้วสร้าง MockSession — ลำดับ: missing -> aud -> expired -> email_verified -> hd.
 * REQ-3.2, 3.4, 3.5, 3.6, 3.8, 3.9. คืน session ที่มีเฉพาะ audience/name/picture/exp (ไม่เก็บ sub/email).
 */
export function validateClaims(
  payload: Record<string, unknown>,
  opts: VerifyOpts,
): ClaimResult {
  const { audience, expectedClientId, allowedHostedDomains, nowSec } = opts;

  const sub = payload.sub;
  const email = payload.email;
  const name = payload.name;
  const aud = payload.aud;
  const exp = payload.exp;
  const emailVerified = normalizeEmailVerified(payload.email_verified);

  // required claims (REQ-3.2, M1) — name รวมด้วยเพราะ MockSession.name จำเป็น
  if (
    !isNonEmptyString(sub) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(name) ||
    !isNonEmptyString(aud) ||
    typeof exp !== "number" ||
    !Number.isFinite(exp) ||
    emailVerified === null
  ) {
    return { ok: false, reason: "missing_claims" };
  }

  if (aud !== expectedClientId) return { ok: false, reason: "aud_mismatch" };
  if (exp <= nowSec) return { ok: false, reason: "expired" };
  if (!emailVerified) return { ok: false, reason: "email_unverified" };

  // hosted domain — ตรวจเมื่อ audience นั้นตั้ง allow list เท่านั้น (REQ-3.8)
  if (allowedHostedDomains && allowedHostedDomains.length > 0) {
    const hd = payload.hd;
    if (!isNonEmptyString(hd) || !allowedHostedDomains.includes(hd)) {
      return { ok: false, reason: "hd_blocked" };
    }
  }

  const picture = payload.picture;
  const session: MockSession = {
    audience,
    name,
    exp,
    ...(isNonEmptyString(picture) ? { picture } : {}),
  };
  return { ok: true, session };
}

/** orchestrator (known audience): decode token + validate -> ผลเดียว (REQ-3.1, 3.3). */
export function verifyAndBuildSession(token: string, opts: VerifyOpts): ClaimResult {
  const payload = decodeJwtPayload(token);
  if (!payload) return { ok: false, reason: "malformed" };
  return validateClaims(payload, opts);
}

export interface ResolveCredentialOpts {
  /** map aud (client_id) -> audience; ไม่ตรง client เรา -> null */
  audienceForClientId: (clientId: string) => Audience | null;
  /** allowed hd ต่อ audience (REQ-3.8) */
  allowedHostedDomains: (audience: Audience) => string[];
  nowSec: number;
}

/**
 * orchestrator สำหรับโหมดโชว์ปุ่ม Google ทั้ง 2 audience พร้อมกัน (callback ร่วม ไม่รู้ audience ล่วงหน้า):
 * decode -> derive audience จาก `aud` -> validate. aud ไม่ตรง client เรา -> `aud_mismatch` (REQ-3.1, 3.3, 3.4).
 */
export function resolveCredential(
  token: string,
  opts: ResolveCredentialOpts,
): ClaimResult {
  const payload = decodeJwtPayload(token);
  if (!payload) return { ok: false, reason: "malformed" };
  const aud = typeof payload.aud === "string" ? payload.aud : "";
  const audience = aud ? opts.audienceForClientId(aud) : null;
  if (!audience) return { ok: false, reason: "aud_mismatch" };
  return validateClaims(payload, {
    audience,
    expectedClientId: aud,
    allowedHostedDomains: opts.allowedHostedDomains(audience),
    nowSec: opts.nowSec,
  });
}

/** landing route จาก audience ผ่าน map เดียว (REQ-4.1). */
export function chooseLanding(audience: Audience): string {
  return LANDING_BY_AUDIENCE[audience];
}

/** session ยังใช้ได้ = ยังไม่หมดอายุ (REQ-4.4, 4.5). */
export function isSessionValid(session: MockSession, nowSec: number): boolean {
  return session.exp > nowSec;
}
