"use client";

import { AvatarUpload } from "@/components/shared/avatar-upload";
import { cn } from "@/lib/utils";

type UserStatus = "active" | "pending" | "banned" | "rejected";

interface UserEditProfileCardProps {
  avatarUrl?: string;
  name: string;
  status: UserStatus;
  onAvatarChange?: (file: File) => void;
  /** View-only: avatar not editable. */
  readOnly?: boolean;
}

const statusConfig: Record<
  UserStatus,
  { label: string; bg: string; text: string }
> = {
  active: { label: "ใช้งาน", bg: "bg-success/16", text: "text-success-dark" },
  pending: {
    label: "รอตรวจสอบ",
    bg: "bg-warning/16",
    text: "text-warning-dark",
  },
  banned: { label: "ระงับ", bg: "bg-error/16", text: "text-error-dark" },
  rejected: {
    label: "ปฏิเสธ",
    bg: "bg-grey-500/16",
    text: "text-grey-600",
  },
};

export function UserEditProfileCard({
  avatarUrl,
  name,
  status,
  onAvatarChange,
  readOnly = false,
}: UserEditProfileCardProps) {
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
          badge.text
        )}
      >
        {badge.label}
      </span>

      <div className={readOnly ? "pointer-events-none" : undefined}>
        <AvatarUpload
          src={avatarUrl}
          alt={name}
          size={144}
          onFileSelect={onAvatarChange}
          hideHint={readOnly}
        />
      </div>
    </div>
  );
}
