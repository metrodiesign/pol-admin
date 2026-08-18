import type { ApprovalRequest } from "@/types/control/approval";

// UI-only, ไม่มี endpoint รองรับ — pol-core ไม่มี maker-checker approval-queue
// endpoint เลย ต้องมี endpoint นี้ก่อนถึงจะ align ได้ (REQ-7.2).
// The operator currently signed in to this control session. Two of the seeded
// requests below were raised BY this actor — their approve/reject controls must
// render inert to demonstrate the maker-checker self-approval block.
export const CURRENT_ACTOR = "ops.admin@vprivilege.co.th";

// Deterministic seed — no real PII. A mix of action types, merchants, and statuses.
export const APPROVAL_REQUESTS: ApprovalRequest[] = [
  {
    id: "APR-2026-0481",
    actionType: "refund",
    maker: "ops.admin@vprivilege.co.th", // === CURRENT_ACTOR → self-approval blocked
    target: "PAY-VPRV-991023",
    refAmount: 18500,
    merchantId: "vprivilege",
    requestedAt: "2026-06-24T13:42:09",
    status: "pending",
  },
  {
    id: "APR-2026-0480",
    actionType: "credential_rotation",
    maker: "ops.admin@vprivilege.co.th", // === CURRENT_ACTOR → self-approval blocked
    target: "PSP-VPRV-OMISE-LIVE",
    merchantId: "vprivilege",
    requestedAt: "2026-06-24T12:08:55",
    status: "pending",
  },
  {
    id: "APR-2026-0479",
    actionType: "routing_change",
    maker: "napats@vprivilege.co.th",
    target: "ROUTE-VPRV-DEFAULT",
    merchantId: "vprivilege",
    requestedAt: "2026-06-24T11:51:30",
    status: "pending",
  },
  {
    id: "APR-2026-0478",
    actionType: "refund",
    maker: "wuttichai@vcommerce.co.th",
    target: "PAY-VCOM-440871",
    refAmount: 7320,
    merchantId: "vcommerce",
    requestedAt: "2026-06-24T10:27:14",
    status: "pending",
  },
  {
    id: "APR-2026-0477",
    actionType: "client_revoke",
    maker: "siriporn@vsouvenir.co.th",
    target: "CLIENT-VSVN-checkout-web",
    merchantId: "vsouvenir",
    requestedAt: "2026-06-24T09:13:42",
    status: "pending",
  },
  {
    id: "APR-2026-0475",
    actionType: "refund",
    maker: "napats@vprivilege.co.th",
    target: "PAY-VPRV-988104",
    refAmount: 2450,
    merchantId: "vprivilege",
    requestedAt: "2026-06-23T16:55:01",
    status: "approved",
  },
  {
    id: "APR-2026-0474",
    actionType: "credential_rotation",
    maker: "wuttichai@vcommerce.co.th",
    target: "PSP-VCOM-OMISE-LIVE",
    merchantId: "vcommerce",
    requestedAt: "2026-06-23T14:30:48",
    status: "approved",
  },
  {
    id: "APR-2026-0470",
    actionType: "routing_change",
    maker: "siriporn@vsouvenir.co.th",
    target: "ROUTE-VSVN-2C2P",
    merchantId: "vsouvenir",
    requestedAt: "2026-06-22T18:09:37",
    status: "rejected",
  },
];
