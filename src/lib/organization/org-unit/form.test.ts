import { describe, expect, it } from "vitest";

import { validateOrgUnitForm } from "./form";

// REQ-4.2, 4.3, 5.3 — ทุก branch ของ validation

describe("validateOrgUnitForm (create)", () => {
  it("ค่า valid ผ่าน -> {}", () => {
    expect(validateOrgUnitForm({ code: "hq_1", name: "สำนักงานใหญ่" }, "create")).toEqual({});
  });

  it("code ว่าง -> error", () => {
    const errors = validateOrgUnitForm({ code: "  ", name: "n" }, "create");
    expect(errors.code).toBe("กรุณากรอกรหัส");
  });

  it("code มี uppercase -> error", () => {
    const errors = validateOrgUnitForm({ code: "HQ", name: "n" }, "create");
    expect(errors.code).toBe("รหัสใช้ได้เฉพาะ a-z, 0-9 และ _");
  });

  it("code มีอักขระนอก set (ขีดกลาง/ช่องว่าง/ไทย) -> error", () => {
    for (const code of ["a-b", "a b", "สนง"]) {
      expect(validateOrgUnitForm({ code, name: "n" }, "create").code).toBe(
        "รหัสใช้ได้เฉพาะ a-z, 0-9 และ _",
      );
    }
  });

  it("code ยาว 65 -> error, ยาว 64 -> ผ่าน", () => {
    expect(validateOrgUnitForm({ code: "a".repeat(65), name: "n" }, "create").code).toBe(
      "รหัสยาวได้ไม่เกิน 64 ตัวอักษร",
    );
    expect(validateOrgUnitForm({ code: "a".repeat(64), name: "n" }, "create")).toEqual({});
  });

  it("name ว่าง / whitespace ล้วน -> error", () => {
    expect(validateOrgUnitForm({ code: "c", name: "" }, "create").name).toBe("กรุณากรอกชื่อ");
    expect(validateOrgUnitForm({ code: "c", name: "   " }, "create").name).toBe("กรุณากรอกชื่อ");
  });

  it("name ยาว 201 -> error, ยาว 200 -> ผ่าน", () => {
    expect(validateOrgUnitForm({ code: "c", name: "ก".repeat(201) }, "create").name).toBe(
      "ชื่อยาวได้ไม่เกิน 200 ตัวอักษร",
    );
    expect(validateOrgUnitForm({ code: "c", name: "ก".repeat(200) }, "create")).toEqual({});
  });
});

describe("validateOrgUnitForm (edit)", () => {
  it("ไม่เช็ค code — code ว่าง/ผิด pattern ก็ผ่านถ้า name valid", () => {
    expect(validateOrgUnitForm({ code: "", name: "ชื่อใหม่" }, "edit")).toEqual({});
    expect(validateOrgUnitForm({ code: "HQ!", name: "ชื่อใหม่" }, "edit")).toEqual({});
  });

  it("name ยังถูกเช็คเหมือน create", () => {
    expect(validateOrgUnitForm({ code: "c", name: " " }, "edit").name).toBe("กรุณากรอกชื่อ");
  });
});
