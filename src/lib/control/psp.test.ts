import { describe, it, expect } from "vitest";
import { maskSecret, healthTone } from "./psp";

describe("maskSecret", () => {
  it("masks the middle, keeps prefix + suffix", () => {
    expect(maskSecret("credref_abcdef1234567890")).toBe(
      "credre••••••••7890",
    );
  });

  it("never reveals the raw value", () => {
    const raw = "credref_donotreveal_payload";
    expect(maskSecret(raw)).not.toContain("donotreveal");
  });

  it("fully masks short values", () => {
    expect(maskSecret("short")).toBe("••••••••");
  });

  it("renders an em dash for empty input", () => {
    expect(maskSecret("")).toBe("—");
  });
});

describe("healthTone", () => {
  it("maps health to the shared tone system", () => {
    expect(healthTone("healthy")).toBe("ok");
    expect(healthTone("degraded")).toBe("warn");
    expect(healthTone("error")).toBe("error");
    expect(healthTone("offline")).toBe("muted");
  });
});
