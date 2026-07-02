import { afterEach, describe, expect, it, vi } from "vitest";

import { buildRegisterFormData, producerLogin } from "./producer-api";
import type { ProducerFormData } from "@/types/producer";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("producerLogin", () => {
  it("navigate ไป /producer/auth/login พร้อม returnTo default (/register, encoded)", () => {
    const location = { href: "" };
    vi.stubGlobal("window", { location });
    producerLogin();
    expect(location.href).toBe("/producer/auth/login?returnTo=%2Fregister");
  });

  it("encode returnTo ที่ส่งเข้ามา", () => {
    const location = { href: "" };
    vi.stubGlobal("window", { location });
    producerLogin("/a/b");
    expect(location.href).toBe("/producer/auth/login?returnTo=%2Fa%2Fb");
  });
});

describe("buildRegisterFormData", () => {
  const base: ProducerFormData = {
    firstName: "สมชาย",
    lastName: "ใจดี",
    personType: "individual",
    idNumber: "1234567890121",
    producerCode: "P001",
    licenseNumber: "1234567890",
    phoneNumber: "0812345678",
    email: "s@example.com",
    acceptTerms: true,
  };

  it("map phoneNumber -> phone (ไม่ส่ง phoneNumber)", () => {
    const fd = buildRegisterFormData(base, "tkt", null);
    expect(fd.get("phone")).toBe("0812345678");
    expect(fd.has("phoneNumber")).toBe(false);
  });

  it("ไม่ส่ง email / acceptTerms (identity มาจาก ticket)", () => {
    const fd = buildRegisterFormData(base, "tkt", null);
    expect(fd.has("email")).toBe(false);
    expect(fd.has("acceptTerms")).toBe(false);
  });

  it("ส่ง ticket + field หลักถูกต้อง", () => {
    const fd = buildRegisterFormData(base, "tkt", null);
    expect(fd.get("ticket")).toBe("tkt");
    expect(fd.get("firstName")).toBe("สมชาย");
    expect(fd.get("lastName")).toBe("ใจดี");
    expect(fd.get("personType")).toBe("individual");
    expect(fd.get("idNumber")).toBe("1234567890121");
    expect(fd.get("producerCode")).toBe("P001");
  });

  it("photo null → ไม่ append; photo File → append", () => {
    expect(buildRegisterFormData(base, "tkt", null).has("photo")).toBe(false);
    const file = new File(["x"], "id.png", { type: "image/png" });
    const fd = buildRegisterFormData(base, "tkt", file);
    expect(fd.get("photo")).toBeInstanceOf(File);
  });

  it("licenseNumber ว่าง → ไม่ append", () => {
    const fd = buildRegisterFormData({ ...base, licenseNumber: "  " }, "tkt", null);
    expect(fd.has("licenseNumber")).toBe(false);
  });
});
