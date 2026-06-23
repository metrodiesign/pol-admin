import { describe, it, expect } from "vitest";
import {
  isThaiId,
  isThaiPhone,
  isValidLicense,
  isEmail,
  validateProducerForm,
} from "./producer-validation";
import type { ProducerFormData } from "@/types/producer";

const base: ProducerFormData = {
  firstName: "สมชาย",
  lastName: "ใจดี",
  personType: "individual",
  idNumber: "1103702450000",
  producerCode: "12345",
  licenseNumber: "",
  phoneNumber: "0970000001",
  email: "test@viriyah.co.th",
  acceptTerms: true,
};

describe("isThaiId (REQ-5.1)", () => {
  it("accepts exactly 13 digits", () => expect(isThaiId("1103702450000")).toBe(true));
  it("rejects wrong length / non-digit", () => {
    expect(isThaiId("12345")).toBe(false);
    expect(isThaiId("11037024500001")).toBe(false);
    expect(isThaiId("abcdefghijklm")).toBe(false);
  });
});

describe("isThaiPhone (REQ-5.2)", () => {
  it("accepts exactly 10 digits", () => expect(isThaiPhone("0970000001")).toBe(true));
  it("rejects otherwise", () => {
    expect(isThaiPhone("097000000")).toBe(false);
    expect(isThaiPhone("09700000012")).toBe(false);
    expect(isThaiPhone("097-000-001")).toBe(false);
  });
});

describe("isValidLicense (REQ-5.3–5.5)", () => {
  it("empty allowed for both types", () => {
    expect(isValidLicense("individual", "")).toBe(true);
    expect(isValidLicense("juristic", "")).toBe(true);
  });
  it("individual requires 10 digits when present", () => {
    expect(isValidLicense("individual", "1234567890")).toBe(true);
    expect(isValidLicense("individual", "12345")).toBe(false);
    expect(isValidLicense("individual", "ABCD123456")).toBe(false);
  });
  it("juristic allows free text", () => {
    expect(isValidLicense("juristic", "LIC/CORP/001")).toBe(true);
  });
});

describe("isEmail (REQ-5.6)", () => {
  it("accepts valid", () => expect(isEmail("test@viriyah.co.th")).toBe(true));
  it("rejects invalid", () => {
    expect(isEmail("nope")).toBe(false);
    expect(isEmail("a@b")).toBe(false);
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
      validateProducerForm({ ...base, personType: "juristic", licenseNumber: "LIC-CORP" })
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
