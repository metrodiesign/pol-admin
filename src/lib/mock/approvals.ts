import type { ApprovalRequest } from "@/types/approval";

// The operator currently signed in to this control session. Two of the seeded
// requests below were raised BY this actor — they must render with disabled
// controls to demonstrate the maker-checker self-approval block.
export const CURRENT_ACTOR = "ops.admin@vcentral.co.th";

// Deterministic seed — no real PII. A mix of action types, tenants, and statuses.
export const APPROVAL_REQUESTS: ApprovalRequest[] = [
  {
    id: "APR-2026-0481",
    actionType: "refund",
    maker: "ops.admin@vcentral.co.th", // === CURRENT_ACTOR → self-approval blocked
    target: "PAY-VCTL-991023",
    refAmount: 18500,
    tenantId: "vcentral",
    requestedAt: "2026-06-24T13:42:09",
    status: "pending",
  },
  {
    id: "APR-2026-0480",
    actionType: "credential_rotation",
    maker: "ops.admin@vcentral.co.th", // === CURRENT_ACTOR → self-approval blocked
    target: "PSP-VCTL-OMISE-LIVE",
    tenantId: "vcentral",
    requestedAt: "2026-06-24T12:08:55",
    status: "pending",
  },
  {
    id: "APR-2026-0479",
    actionType: "routing_change",
    maker: "napats@vcentral.co.th",
    target: "ROUTE-VCTL-DEFAULT",
    tenantId: "vcentral",
    requestedAt: "2026-06-24T11:51:30",
    status: "pending",
  },
  {
    id: "APR-2026-0478",
    actionType: "refund",
    maker: "wuttichai@vcommerce.co.th",
    target: "PAY-VCOM-440871",
    refAmount: 7320,
    tenantId: "vcommerce",
    requestedAt: "2026-06-24T10:27:14",
    status: "pending",
  },
  {
    id: "APR-2026-0477",
    actionType: "client_revoke",
    maker: "siriporn@vsouvenir.co.th",
    target: "CLIENT-VSVN-checkout-web",
    tenantId: "vsouvenir",
    requestedAt: "2026-06-24T09:13:42",
    status: "pending",
  },
  {
    id: "APR-2026-0475",
    actionType: "refund",
    maker: "napats@vcentral.co.th",
    target: "PAY-VCTL-988104",
    refAmount: 2450,
    tenantId: "vcentral",
    requestedAt: "2026-06-23T16:55:01",
    status: "approved",
  },
  {
    id: "APR-2026-0474",
    actionType: "credential_rotation",
    maker: "wuttichai@vcommerce.co.th",
    target: "PSP-VCOM-OMISE-LIVE",
    tenantId: "vcommerce",
    requestedAt: "2026-06-23T14:30:48",
    status: "approved",
  },
  {
    id: "APR-2026-0470",
    actionType: "routing_change",
    maker: "siriporn@vsouvenir.co.th",
    target: "ROUTE-VSVN-2C2P",
    tenantId: "vsouvenir",
    requestedAt: "2026-06-22T18:09:37",
    status: "rejected",
  },
];
