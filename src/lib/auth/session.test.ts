import { describe, expect, it } from "vitest";

import type { MockSession } from "@/types/auth";

import {
  chooseLanding,
  isSessionValid,
  validateClaims,
  verifyAndBuildSession,
  type VerifyOpts,
} from "./session";

const ADMIN_ID = "admin-client.apps.googleusercontent.com";

const baseClaims = {
  sub: "123",
  email: "user@example.com",
  email_verified: true,
  name: "ก้อง",
  picture: "https://example.com/p.png",
  aud: ADMIN_ID,
  exp: 2000,
};

const opts: VerifyOpts = {
  audience: "admin",
  expectedClientId: ADMIN_ID,
  nowSec: 1000,
};

function b64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), "utf-8").toString("base64url");
}
function token(payload: unknown): string {
  return `${b64url({ alg: "none" })}.${b64url(payload)}.sig`;
}

describe("validateClaims", () => {
  it("claim ครบ + aud ตรง -> ok, session เก็บเฉพาะ audience/name/picture/exp (REQ-3.4, 3.6)", () => {
    const res = validateClaims(baseClaims, opts);
    expect(res).toEqual({
      ok: true,
      session: { audience: "admin", name: "ก้อง", picture: baseClaims.picture, exp: 2000 },
    });
    if (res.ok) {
      expect(res.session).not.toHaveProperty("email");
      expect(res.session).not.toHaveProperty("sub");
    }
  });

  it("ไม่มี picture -> session ไม่มี field picture", () => {
    const { picture: _omit, ...noPic } = baseClaims;
    const res = validateClaims(noPic, opts);
    expect(res.ok && res.session.picture).toBeUndefined();
  });

  it("aud ไม่ตรง client_id ที่กด -> aud_mismatch (REQ-3.4)", () => {
    const res = validateClaims({ ...baseClaims, aud: "other-client" }, opts);
    expect(res).toEqual({ ok: false, reason: "aud_mismatch" });
  });

  it("exp อนาคต -> ok; exp อดีต/เท่ากับ now -> expired (REQ-3.5)", () => {
    expect(validateClaims({ ...baseClaims, exp: 1001 }, opts).ok).toBe(true);
    expect(validateClaims({ ...baseClaims, exp: 999 }, opts)).toEqual({ ok: false, reason: "expired" });
    expect(validateClaims({ ...baseClaims, exp: 1000 }, opts)).toEqual({ ok: false, reason: "expired" });
  });

  it("email_verified false/\"false\" -> email_unverified; \"true\" -> ผ่าน (REQ-3.9, m4)", () => {
    expect(validateClaims({ ...baseClaims, email_verified: false }, opts)).toEqual({
      ok: false,
      reason: "email_unverified",
    });
    expect(validateClaims({ ...baseClaims, email_verified: "false" }, opts)).toEqual({
      ok: false,
      reason: "email_unverified",
    });
    expect(validateClaims({ ...baseClaims, email_verified: "true" }, opts).ok).toBe(true);
  });

  it("claim หลักขาด (aud/exp/email_verified/name) -> missing_claims (REQ-3.2, M1)", () => {
    for (const key of ["aud", "exp", "email_verified", "name", "sub", "email"] as const) {
      const { [key]: _omit, ...partial } = baseClaims;
      expect(validateClaims(partial, opts)).toEqual({ ok: false, reason: "missing_claims" });
    }
  });

  it("hd: ไม่มี allow list -> ผ่าน; ตรง -> ผ่าน; ไม่ตรง/ขาด -> hd_blocked (REQ-3.8)", () => {
    const withHd = { ...baseClaims, hd: "pol.co.th" };
    expect(validateClaims(withHd, opts).ok).toBe(true); // allow list ว่าง = ปิด check
    const hdOpts: VerifyOpts = { ...opts, allowedHostedDomains: ["pol.co.th"] };
    expect(validateClaims(withHd, hdOpts).ok).toBe(true);
    expect(validateClaims({ ...baseClaims, hd: "evil.com" }, hdOpts)).toEqual({
      ok: false,
      reason: "hd_blocked",
    });
    expect(validateClaims(baseClaims, hdOpts)).toEqual({ ok: false, reason: "hd_blocked" }); // hd ขาด
  });
});

describe("verifyAndBuildSession", () => {
  it("token malformed -> malformed (REQ-3.3)", () => {
    expect(verifyAndBuildSession("not-a-jwt", opts)).toEqual({ ok: false, reason: "malformed" });
  });

  it("token ถูกต้อง -> ok + session", () => {
    const res = verifyAndBuildSession(token(baseClaims), opts);
    expect(res.ok).toBe(true);
  });
});

describe("chooseLanding", () => {
  it("admin -> /main; producer -> /main (REQ-4.1, 4.2, 4.3)", () => {
    expect(chooseLanding("admin")).toBe("/main");
    expect(chooseLanding("producer")).toBe("/main");
  });
});

describe("isSessionValid", () => {
  const s: MockSession = { audience: "admin", name: "ก้อง", exp: 2000 };
  it("ยังไม่หมดอายุ -> true; หมดอายุ/เท่ากับ now -> false (REQ-4.4, 4.5)", () => {
    expect(isSessionValid(s, 1999)).toBe(true);
    expect(isSessionValid(s, 2000)).toBe(false);
    expect(isSessionValid(s, 2001)).toBe(false);
  });
});
