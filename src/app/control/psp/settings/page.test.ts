import { describe, expect, it, vi } from "vitest";

const { notFound } = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@/components/control/psp/psp-route-gate", () => ({
  PspRouteGate: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/components/control/psp/settings/view", () => ({
  MerchantPaymentSettingsView: () => null,
}));

import MerchantPaymentSettingsPage from "./page";

const VALID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("MerchantPaymentSettingsPage (AC-2)", () => {
  it("calls notFound for a missing merchantId", async () => {
    await expect(
      MerchantPaymentSettingsPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("calls notFound for a non-UUID merchantId", async () => {
    await expect(
      MerchantPaymentSettingsPage({ searchParams: Promise.resolve({ merchantId: "not-a-uuid" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the gate with settings.manage and merchant.view for a valid UUID", async () => {
    const element = await MerchantPaymentSettingsPage({
      searchParams: Promise.resolve({ merchantId: VALID }),
    });
    expect(element.props.requiredPermissions).toEqual(["settings.manage", "merchant.view"]);
    expect(element.props.children.props.merchantId).toBe(VALID);
  });
});
