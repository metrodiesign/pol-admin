import { afterEach, describe, expect, it, vi } from "vitest";

import { producerLogin } from "./producer-api";

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
