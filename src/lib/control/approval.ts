import type {
  ApprovalRequest,
  ApprovalActionType,
  ApprovalStatus,
} from "@/types/control/approval";
import type { Tone } from "@/lib/control/status";

export const ACTION_LABEL: Record<ApprovalActionType, string> = {
  refund: "คืนเงิน",
  credential_rotation: "หมุนเวียน credential",
  routing_change: "เปลี่ยน routing",
  client_revoke: "เพิกถอน client",
};

export const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  rejected: "ปฏิเสธแล้ว",
};

export function statusTone(status: ApprovalStatus): Tone {
  switch (status) {
    case "pending":
      return "warn";
    case "approved":
      return "ok";
    case "rejected":
      return "error";
  }
}

/**
 * Maker-checker core rule. A request can be approved only when it is still pending
 * AND the actor is NOT the maker — a person can never sign off on their own request.
 * Pure + tested; the UI disables the approve/reject controls whenever this is false.
 */
export function canApprove(req: ApprovalRequest, actorId: string): boolean {
  return req.status === "pending" && req.maker !== actorId;
}
