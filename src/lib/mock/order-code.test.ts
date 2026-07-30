import { describe, it, expect } from "vitest";
import { currentBeYear2Digit, generateOrderCode } from "./order-code";

describe("order-code", () => {
  it("computes BE 2-digit year from CE year", () => {
    expect(currentBeYear2Digit(new Date(2026, 0, 1))).toBe("69");
  });

  it("formats ORD + year + zero-padded 8-digit sequence", () => {
    expect(generateOrderCode(1, "69")).toBe("ORD6900000001");
    expect(generateOrderCode(48, "69")).toBe("ORD6900000048");
  });
});
