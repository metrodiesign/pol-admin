import { describe, it, expect } from "vitest";
import { evaluateRouting, enabledTone } from "./routing";
import type { RoutingRule } from "@/types/routing-rule";

const rules: RoutingRule[] = [
  {
    id: "RR-1",
    priority: 10,
    merchantId: "vprivilege",
    channel: "card",
    targetPsp: "omise",
    fallbackPsp: "2c2p",
    enabled: true,
  },
  {
    id: "RR-2",
    priority: 5,
    merchantId: "vprivilege",
    channel: "card",
    targetPsp: "2c2p",
    enabled: true,
  },
  {
    id: "RR-3",
    priority: 1,
    merchantId: "vprivilege",
    channel: "card",
    targetPsp: "omise",
    enabled: false, // disabled — must be skipped despite lowest priority
  },
  {
    id: "RR-4",
    priority: 20,
    merchantId: "vprivilege",
    channel: "card",
    minAmount: 5000,
    maxAmount: 50000,
    targetPsp: "2c2p",
    enabled: true,
  },
  {
    id: "RR-5",
    priority: 30,
    merchantId: "vprivilege",
    channel: "any",
    targetPsp: "omise",
    enabled: true,
  },
  {
    id: "RR-6",
    priority: 1,
    merchantId: "vcommerce",
    channel: "card",
    targetPsp: "omise",
    enabled: true,
  },
];

describe("evaluateRouting", () => {
  it("picks the lowest-priority enabled match", () => {
    // RR-3 (priority 1) is disabled, so RR-2 (priority 5) wins over RR-1 (10).
    const result = evaluateRouting(rules, {
      channel: "card",
      amount: 1000,
      merchantId: "vprivilege",
    });
    expect(result).toEqual({ targetPsp: "2c2p" });
  });

  it("returns the fallback when present on the winning rule", () => {
    // Without RR-2/RR-3, RR-1 carries a fallback.
    const subset = rules.filter((r) => r.id === "RR-1");
    expect(
      evaluateRouting(subset, {
        channel: "card",
        amount: 1000,
        merchantId: "vprivilege",
      }),
    ).toEqual({ targetPsp: "omise", fallbackPsp: "2c2p" });
  });

  it("respects amount bounds", () => {
    // Above RR-2's open band still matches RR-2 first; isolate RR-4's band.
    const banded = rules.filter((r) => r.id === "RR-4");
    expect(
      evaluateRouting(banded, {
        channel: "card",
        amount: 4999,
        merchantId: "vprivilege",
      }),
    ).toBeNull();
    expect(
      evaluateRouting(banded, {
        channel: "card",
        amount: 5000,
        merchantId: "vprivilege",
      }),
    ).toEqual({ targetPsp: "2c2p" });
  });

  it('matches a channel "any" rule for a specific channel', () => {
    const anyOnly = rules.filter((r) => r.id === "RR-5");
    expect(
      evaluateRouting(anyOnly, {
        channel: "promptpay",
        amount: 100,
        merchantId: "vprivilege",
      }),
    ).toEqual({ targetPsp: "omise" });
  });

  it("scopes by tenant", () => {
    expect(
      evaluateRouting(rules, {
        channel: "card",
        amount: 100,
        merchantId: "vcommerce",
      }),
    ).toEqual({ targetPsp: "omise" });
  });

  it("returns null when nothing matches", () => {
    expect(
      evaluateRouting(rules, {
        channel: "installment",
        amount: 100,
        merchantId: "vsouvenir",
      }),
    ).toBeNull();
  });
});

describe("enabledTone", () => {
  it("maps enabled state to the shared tone system", () => {
    expect(enabledTone(true)).toBe("ok");
    expect(enabledTone(false)).toBe("muted");
  });
});
