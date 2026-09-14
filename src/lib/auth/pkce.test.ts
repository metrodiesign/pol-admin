import { describe, expect, it } from "vitest";

import { base64Url, codeChallengeOf, randomToken } from "./pkce";

describe("pkce", () => {
  it("base64Url: ไม่มี +,/,= (RFC 7636)", () => {
    expect(base64Url(new Uint8Array([251, 255, 254]))).toBe("-__-");
    expect(base64Url(new Uint8Array([1]))).toBe("AQ");
  });

  it("randomToken: 43 ตัวอักษร unreserved และไม่ซ้ำ", () => {
    const a = randomToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(randomToken()).not.toBe(a);
  });

  it("codeChallengeOf: ตรง test vector RFC 7636 Appendix B", async () => {
    await expect(codeChallengeOf("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).resolves.toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });
});
