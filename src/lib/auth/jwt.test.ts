import { describe, expect, it } from "vitest";

import { decodeJwtPayload } from "./jwt";

// สร้าง JWT mock: Buffer base64url คืน url-safe (-_ ) + ไม่มี padding -> ตรงรูปแบบที่ decoder ต้องรับ (M2)
function b64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), "utf-8").toString("base64url");
}
function token(payload: unknown): string {
  return `${b64url({ alg: "none" })}.${b64url(payload)}.sig`;
}

describe("decodeJwtPayload", () => {
  it("decode payload ของ token ปกติได้ครบ (REQ-3.1)", () => {
    const claims = { sub: "1", aud: "x", exp: 123, email_verified: true };
    expect(decodeJwtPayload(token(claims))).toEqual(claims);
  });

  it("รองรับชื่อ UTF-8/ไทย + base64url -_ + pad โดยไม่เพี้ยน (M2)", () => {
    const claims = { name: "ก้อง-สมหญิง_๑ ÿÿÿ", email: "a@b.co" };
    expect(decodeJwtPayload(token(claims))).toEqual(claims);
  });

  it("คืน null เมื่อไม่ครบ 3 ส่วน (REQ-3.3)", () => {
    expect(decodeJwtPayload("abc")).toBeNull();
    expect(decodeJwtPayload("a.b")).toBeNull();
    expect(decodeJwtPayload("a.b.c.d")).toBeNull();
    expect(decodeJwtPayload("")).toBeNull();
  });

  it("คืน null เมื่อ payload ว่าง", () => {
    expect(decodeJwtPayload("a..c")).toBeNull();
  });

  it("คืน null เมื่อ payload ไม่ใช่ base64 ที่ถูก (atob พัง) (REQ-3.3)", () => {
    expect(decodeJwtPayload("a.@@@.c")).toBeNull();
  });

  it("คืน null เมื่อ decode แล้วไม่ใช่ JSON (REQ-3.3)", () => {
    const bad = Buffer.from("notjson{", "utf-8").toString("base64url");
    expect(decodeJwtPayload(`a.${bad}.c`)).toBeNull();
  });

  it("คืน null เมื่อ JSON ไม่ใช่ object (number/array/null)", () => {
    expect(decodeJwtPayload(token(123))).toBeNull();
    expect(decodeJwtPayload(token([1, 2]))).toBeNull();
    expect(decodeJwtPayload(token(null))).toBeNull();
  });
});
