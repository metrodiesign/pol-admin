"use client";

import { AvatarUpload } from "@/components/shared/avatar-upload";
import { cn } from "@/lib/utils";
import type { MerchantUserStatus } from "@/types/merchant/user";

interface MerchantUserEditProfileCardProps {
  name: string;
  status: MerchantUserStatus;
  onAvatarChange?: (file: File) => void;
  /** Approve/reject a pending merchant user (admin review). Buttons show only when status === "PendingApproval". */
  onApprove?: () => void;
  onReject?: () => void;
  /** View-only: avatar not editable. Approve/reject buttons show here instead of edit mode. */
  readOnly?: boolean;
}

const statusConfig: Record<
  MerchantUserStatus,
  { label: string; bg: string; text: string }
> = {
  Active: { label: "ใช้งาน", bg: "bg-success/16", text: "text-success-dark" },
  PendingApproval: { label: "รอตรวจสอบ", bg: "bg-warning/16", text: "text-warning-dark" },
  Rejected: { label: "ปฏิเสธ", bg: "bg-grey-500/16", text: "text-grey-600" },
  Suspended: { label: "ระงับ", bg: "bg-error/16", text: "text-error-dark" },
};

export function MerchantUserEditProfileCard({
  name,
  status,
  onAvatarChange,
  onApprove,
  onReject,
  readOnly = false,
}: MerchantUserEditProfileCardProps) {
  const badge = statusConfig[status];

  return (
    <div
      className="relative rounded-card bg-card pt-20 px-6 pb-10"
      style={{
        boxShadow:
          "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
      }}
    >
      <span
        className={cn(
          "absolute top-6 right-6 inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold",
          badge.bg,
          badge.text,
        )}
      >
        {badge.label}
      </span>

      <div className={readOnly ? "pointer-events-none" : undefined}>
        {/* photoObjectKey ไม่มี HTTP endpoint serve รูปจริง (REQ-4.9) — placeholder เสมอ */}
        <AvatarUpload
          src={undefined}
          alt={name}
          size={144}
          onFileSelect={onAvatarChange}
          hideHint={readOnly}
        />
      </div>

      {readOnly && status === "PendingApproval" && (onApprove || onReject) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {onReject && (
            <button
              type="button"
              onClick={onReject}
              className="inline-flex h-11 flex-1 min-w-[120px] items-center justify-center rounded-control bg-error/16 px-4 text-sm font-bold text-error-dark transition-colors hover:bg-error/24"
            >
              ไม่อนุมัติ
            </button>
          )}
          {onApprove && (
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex h-11 flex-1 min-w-[120px] items-center justify-center rounded-control bg-success px-4 text-sm font-bold text-white transition-colors hover:bg-success/90"
            >
              อนุมัติ
            </button>
          )}
        </div>
      )}
    </div>
  );
}
