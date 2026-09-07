import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/control/psp/psp-route-gate", () => ({
  PspRouteGate: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/components/control/psp/create-view", () => ({
  PspCreateView: () => null,
}));

import PspCreatePage from "./page";

const VALID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("PspCreatePage (AC-10 query prefill)", () => {
  it("prefills merchantId, psp and returnTo from the query", async () => {
    const element = await PspCreatePage({
      searchParams: Promise.resolve({ merchantId: VALID, psp: "omise", returnTo: "settings" }),
    });
    const view = element.props.children;
    expect(view.props.initialMerchantId).toBe(VALID);
    expect(view.props.initialProvider).toBe("omise");
    expect(view.props.returnTo).toBe("settings");
  });

  it("drops an invalid psp", async () => {
    const element = await PspCreatePage({
      searchParams: Promise.resolve({ merchantId: VALID, psp: "stripe" }),
    });
    expect(element.props.children.props.initialProvider).toBeUndefined();
  });

  it("drops a non-UUID merchantId", async () => {
    const element = await PspCreatePage({
      searchParams: Promise.resolve({ merchantId: "not-a-uuid", psp: "2c2p" }),
    });
    expect(element.props.children.props.initialMerchantId).toBeUndefined();
  });

  it("drops a returnTo other than settings", async () => {
    const element = await PspCreatePage({
      searchParams: Promise.resolve({ merchantId: VALID, returnTo: "list" }),
    });
    expect(element.props.children.props.returnTo).toBeUndefined();
  });
});
