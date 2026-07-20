import { describe, it, expect } from "vitest";
import { canApprove, statusTone } from "./approval";
import type { ApprovalRequest } from "@/types/approval";

function makeRequest(over: Partial<ApprovalRequest> = {}): ApprovalRequest {
  return {
    id: "APR-2026-0001",
    actionType: "refund",
    maker: "maker@vprivilege.co.th",
    target: "PAY-VPRV-991023",
    refAmount: 4200,
    merchantId: "vprivilege",
    requestedAt: "2026-06-24T10:00:00",
    status: "pending",
    ...over,
  };
}

describe("canApprove", () => {
  it("blocks the maker from approving their own request", () => {
    const req = makeRequest({ maker: "ops.admin@vprivilege.co.th" });
    expect(canApprove(req, "ops.admin@vprivilege.co.th")).toBe(false);
  });

  it("lets a different actor approve a pending request", () => {
    const req = makeRequest({ maker: "maker@vprivilege.co.th" });
    expect(canApprove(req, "checker@vprivilege.co.th")).toBe(true);
  });

  it("blocks anyone from approving an already-approved request", () => {
    const req = makeRequest({ status: "approved" });
    expect(canApprove(req, "checker@vprivilege.co.th")).toBe(false);
  });

  it("blocks anyone from approving an already-rejected request", () => {
    const req = makeRequest({ status: "rejected" });
    expect(canApprove(req, "checker@vprivilege.co.th")).toBe(false);
  });
});

describe("statusTone", () => {
  it("maps approval status to the shared tone system", () => {
    expect(statusTone("pending")).toBe("warn");
    expect(statusTone("approved")).toBe("ok");
    expect(statusTone("rejected")).toBe("error");
  });
});
