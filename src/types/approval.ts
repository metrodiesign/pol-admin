import type { TenantId } from "@/types/tenant";

export type ApprovalActionType =
  | "refund"
  | "credential_rotation"
  | "routing_change"
  | "client_revoke";

export type ApprovalStatus = "pending" | "approved" | "rejected";

/**
 * A sensitive control-plane action queued for a SECOND person's sign-off
 * (maker-checker). The person who raised it (`maker`) can never approve their own
 * request — a different operator must be the checker. `refAmount` is shown only for
 * money-moving actions (refunds); money settles PSP → company directly, so this is
 * a reference figure, not a platform-held balance.
 */
export interface ApprovalRequest {
  id: string; // "APR-2026-0481"
  actionType: ApprovalActionType;
  maker: string; // email of the operator who raised the request
  target: string; // entity id / reference the action applies to
  refAmount?: number; // present for refunds only
  tenantId: TenantId;
  requestedAt: string; // ISO datetime
  status: ApprovalStatus;
}
