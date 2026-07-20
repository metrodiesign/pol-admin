import { describe, it, expect } from "vitest";
import {
  isThaiId,
  isThaiPhone,
  isValidLicense,
  isEmail,
  validateProducerForm,
  validateRegisterForm,
} from "./producer-validation";
import type {
  MerchantUserFormData,
  MerchantUserRegisterFormData,
} from "@/types/merchant-user";

const base: MerchantUserFormData = {
  firstName: "สมชาย",
  lastName: "ใจดี",
  personType: "Individual",
  idNumber: "1234567890121",
  producerCode: "12345",
  licenseNumber: "",
  phoneNumber: "0970000001",
  email: "test@viriyah.co.th",
  acceptTerms: true,
};

describe("isThaiId (REQ-5.1)", () => {
  it("accepts valid 13-digit ID with correct checksum", () =>
    expect(isThaiId("1234567890121")).toBe(true));
  it("rejects wrong length", () => {
    expect(isThaiId("12345")).toBe(false);
    expect(isThaiId("12345678901211")).toBe(false);
  });
  it("rejects non-digit", () =>
    expect(isThaiId("abcdefghijklm")).toBe(false));
  it("rejects 13 digits with wrong checksum", () =>
    expect(isThaiId("1234567890120")).toBe(false));
});

describe("isThaiPhone (REQ-5.2)", () => {
  it("accepts mobile 06x/08x/09x 10 digits", () => {
    expect(isThaiPhone("0970000001")).toBe(true);
    expect(isThaiPhone("0891234567")).toBe(true);
    expect(isThaiPhone("0612345678")).toBe(true);
  });
  it("rejects wrong length", () => {
    expect(isThaiPhone("097000000")).toBe(false);
    expect(isThaiPhone("09700000012")).toBe(false);
  });
  it("rejects dashes/spaces", () => expect(isThaiPhone("097-000-001")).toBe(false));
  it("rejects non-mobile prefix (landline 02x)", () =>
    expect(isThaiPhone("0270000001")).toBe(false));
});

describe("isValidLicense (REQ-5.3–5.5)", () => {
  it("empty allowed for both types", () => {
    expect(isValidLicense("Individual", "")).toBe(true);
    expect(isValidLicense("Juristic", "")).toBe(true);
  });
  it("individual requires 10 digits when present", () => {
    expect(isValidLicense("Individual", "1234567890")).toBe(true);
    expect(isValidLicense("Individual", "12345")).toBe(false);
    expect(isValidLicense("Individual", "ABCD123456")).toBe(false);
  });
  it("juristic allows free text", () => {
    expect(isValidLicense("Juristic", "LIC/CORP/001")).toBe(true);
  });
});

describe("isEmail (REQ-5.6)", () => {
  it("accepts standard and international TLD", () => {
    expect(isEmail("test@viriyah.co.th")).toBe(true);
    expect(isEmail("user@example.com")).toBe(true);
    expect(isEmail("a@b.photography")).toBe(true);
  });
  it("rejects no-TLD or 1-char TLD", () => {
    expect(isEmail("nope")).toBe(false);
    expect(isEmail("a@b")).toBe(false);
    expect(isEmail("a@b.c")).toBe(false);
  });
});

describe("validateProducerForm", () => {
  it("passes a valid individual form", () => {
    expect(validateProducerForm(base)).toEqual({});
  });
  it("flags bad id (5.1)", () => {
    expect(validateProducerForm({ ...base, idNumber: "123" }).idNumber).toBeDefined();
  });
  it("flags bad phone (5.2)", () => {
    expect(validateProducerForm({ ...base, phoneNumber: "123" }).phoneNumber).toBeDefined();
  });
  it("flags individual license not 10 digits (5.3)", () => {
    expect(
      validateProducerForm({ ...base, licenseNumber: "123" }).licenseNumber,
    ).toBeDefined();
  });
  it("allows juristic free-text license (5.4)", () => {
    expect(
      validateProducerForm({ ...base, personType: "Juristic", licenseNumber: "LIC-CORP" })
        .licenseNumber,
    ).toBeUndefined();
  });
  it("allows empty license (5.5)", () => {
    expect(validateProducerForm({ ...base, licenseNumber: "" }).licenseNumber).toBeUndefined();
  });
  it("flags bad email (5.6)", () => {
    expect(validateProducerForm({ ...base, email: "nope" }).email).toBeDefined();
  });
  it("flags missing required fields (5.7)", () => {
    const errs = validateProducerForm({ ...base, firstName: "", producerCode: "" });
    expect(errs.firstName).toBeDefined();
    expect(errs.producerCode).toBeDefined();
  });
  it("requires acceptTerms only when opted in (4.9)", () => {
    expect(
      validateProducerForm({ ...base, acceptTerms: false }, { requireAcceptTerms: true })
        .acceptTerms,
    ).toBeDefined();
    expect(validateProducerForm({ ...base, acceptTerms: false }).acceptTerms).toBeUndefined();
  });
});

describe("validateRegisterForm (REQ-11.6)", () => {
  const fakePhoto = new File(["x"], "id-card.jpg", { type: "image/jpeg" });
  const regBase: MerchantUserRegisterFormData = { ...base, photo: fakePhoto };

  it("passes a valid registration form", () => {
    expect(validateRegisterForm(regBase)).toEqual({});
  });
  it("photo not required (temporarily disabled)", () => {
    expect(validateRegisterForm({ ...regBase, photo: null }).photo).toBeUndefined();
  });
  it("requires acceptTerms (registration always opts in)", () => {
    expect(validateRegisterForm({ ...regBase, acceptTerms: false }).acceptTerms).toBeDefined();
  });
  it("still flows producer rules through (e.g. bad id)", () => {
    expect(validateRegisterForm({ ...regBase, idNumber: "123" }).idNumber).toBeDefined();
  });
});
