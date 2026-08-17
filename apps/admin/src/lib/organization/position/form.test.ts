import { describe, expect, it } from "vitest";

import { validatePositionForm } from "./form";

// REQ-4.2, 4.3, 5.3 — ทุก branch ของ validation

describe("validatePositionForm (create)", () => {
  it("ค่า valid ผ่าน -> {}", () => {
    expect(validatePositionForm({ code: "ps_1", name: "ตำแหน่งทดสอบ" }, "create")).toEqual({});
  });

  it("code ว่าง -> error", () => {
    const errors = validatePositionForm({ code: "  ", name: "n" }, "create");
    expect(errors.code).toBe("กรุณากรอกรหัส");
  });

  it("code มี uppercase -> error", () => {
    const errors = validatePositionForm({ code: "PS", name: "n" }, "create");
    expect(errors.code).toBe("รหัสใช้ได้เฉพาะ a-z, 0-9 และ _");
  });

  it("code มีอักขระนอก set (ขีดกลาง/ช่องว่าง/ไทย) -> error", () => {
    for (const code of ["a-b", "a b", "สนง"]) {
      expect(validatePositionForm({ code, name: "n" }, "create").code).toBe(
        "รหัสใช้ได้เฉพาะ a-z, 0-9 และ _",
      );
    }
  });

  it("code ยาว 65 -> error, ยาว 64 -> ผ่าน", () => {
    expect(validatePositionForm({ code: "a".repeat(65), name: "n" }, "create").code).toBe(
      "รหัสยาวได้ไม่เกิน 64 ตัวอักษร",
    );
    expect(validatePositionForm({ code: "a".repeat(64), name: "n" }, "create")).toEqual({});
  });

  it("name ว่าง / whitespace ล้วน -> error", () => {
    expect(validatePositionForm({ code: "c", name: "" }, "create").name).toBe("กรุณากรอกชื่อ");
    expect(validatePositionForm({ code: "c", name: "   " }, "create").name).toBe("กรุณากรอกชื่อ");
  });

  it("name ยาว 201 -> error, ยาว 200 -> ผ่าน", () => {
    expect(validatePositionForm({ code: "c", name: "ก".repeat(201) }, "create").name).toBe(
      "ชื่อยาวได้ไม่เกิน 200 ตัวอักษร",
    );
    expect(validatePositionForm({ code: "c", name: "ก".repeat(200) }, "create")).toEqual({});
  });
});

describe("validatePositionForm (edit)", () => {
  it("ไม่เช็ค code — code ว่าง/ผิด pattern ก็ผ่านถ้า name valid", () => {
    expect(validatePositionForm({ code: "", name: "ชื่อใหม่" }, "edit")).toEqual({});
    expect(validatePositionForm({ code: "PS!", name: "ชื่อใหม่" }, "edit")).toEqual({});
  });

  it("name ยังถูกเช็คเหมือน create", () => {
    expect(validatePositionForm({ code: "c", name: " " }, "edit").name).toBe("กรุณากรอกชื่อ");
  });
});
