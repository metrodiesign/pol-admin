import { describe, it, expect } from "vitest";
import { matchSettlement, variance, statusTone } from "./settlement";
import type { SettlementBatch } from "@/types/settlement";

describe("matchSettlement", () => {
  it("equal amounts match", () => {
    expect(matchSettlement(12500, 12500)).toBe("matched");
  });

  it("a sub-satang diff still matches (tolerance)", () => {
    expect(matchSettlement(12500, 12500.005)).toBe("matched");
  });

  it("a real diff is a variance", () => {
    expect(matchSettlement(12500, 12450)).toBe("variance");
  });

  it("a one-satang diff is a variance (at the boundary)", () => {
    expect(matchSettlement(100, 100.01)).toBe("variance");
  });
});

describe("variance", () => {
  const base = (expected: number, reported: number): SettlementBatch => ({
    id: "STL-TEST",
    batchRef: "BATCH-TEST",
    psp: "omise",
    tenantId: "vcentral",
    expected,
    reported,
    matchStatus: "variance",
    settledAt: "2026-06-23T18:00:00",
    lineItems: [],
  });

  it("is positive when the PSP reported more than expected", () => {
    expect(variance(base(10000, 10500))).toBe(500);
  });

  it("is negative when the PSP reported less than expected", () => {
    expect(variance(base(10000, 9500))).toBe(-500);
  });

  it("is zero for a matched batch", () => {
    expect(variance(base(10000, 10000))).toBe(0);
  });
});

describe("statusTone", () => {
  it("maps match status to the shared tone system", () => {
    expect(statusTone("matched")).toBe("ok");
    expect(statusTone("variance")).toBe("warn");
    expect(statusTone("unreconciled")).toBe("muted");
  });
});
