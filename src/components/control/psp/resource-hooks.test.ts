import { afterEach, describe, expect, it, vi } from "vitest";

import type { ApprovalListQuery } from "@/lib/api/control/psp";

const { listApprovalPage } = vi.hoisted(() => ({ listApprovalPage: vi.fn() }));

vi.mock("@/lib/api/control/psp", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/control/psp")>();
  return { ...actual, listApprovalPage };
});

import { loadPendingApprovals } from "@/components/control/psp/resource-hooks";

const MERCHANT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function emptyPage(query: ApprovalListQuery) {
  return { page: query.page, limit: query.limit, total: 0, items: [] };
}

describe("loadPendingApprovals server-side merchant filter (must-fix 2)", () => {
  afterEach(() => vi.clearAllMocks());

  it("forwards merchantId into the approval query", async () => {
    listApprovalPage.mockImplementation(async (query: ApprovalListQuery) => emptyPage(query));
    const result = await loadPendingApprovals(undefined, undefined, {
      action: null,
      merchantId: MERCHANT,
    });
    expect(result.status).toBe("ready");
    const query = listApprovalPage.mock.calls[0]![0] as ApprovalListQuery;
    expect(query.merchantId).toBe(MERCHANT);
    expect(query.action).toBeUndefined();
    expect(query.status).toBe("pending");
  });

  it("omits merchantId when no option is given (credential-change caller unaffected)", async () => {
    listApprovalPage.mockImplementation(async (query: ApprovalListQuery) => emptyPage(query));
    await loadPendingApprovals(undefined, "search-term");
    const query = listApprovalPage.mock.calls[0]![0] as ApprovalListQuery;
    expect(query.merchantId).toBeUndefined();
    expect(query.action).toBe("psp.credential.change");
  });
});
