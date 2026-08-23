import { describe, expect, it } from "vitest";

import { getLoginErrorContent } from "./login-error";

describe("getLoginErrorContent", () => {
  it("อธิบาย workforce denial และ identity conflict ด้วยข้อความที่ตรงเหตุผล", () => {
    expect(getLoginErrorContent("workforce-access-denied").message).toContain("ไม่ผ่านนโยบายพนักงาน");
    expect(getLoginErrorContent("identity-conflict").message).toContain("identity binding");
  });

  it("ใช้ข้อความ provider-neutral สำหรับ legacy reasons", () => {
    for (const reason of ["not-provisioned", "missing-subject", "email-unverified", "missing-identity"]) {
      expect(getLoginErrorContent(reason).message).not.toMatch(/Google|Microsoft/);
    }
  });

  it("คืน default สำหรับ reason ที่ไม่รู้จัก และคง pending state", () => {
    expect(getLoginErrorContent("unknown").message).toBe("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
    expect(getLoginErrorContent("awaiting-approval")).toMatchObject({
      title: "รอการอนุมัติ",
      isPending: true,
    });
  });
});
