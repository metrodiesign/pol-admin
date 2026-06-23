"use client";

import { AvatarUpload } from "@/components/shared/avatar-upload";
import { Fieldset, Field, Label, Description } from "@/components/shared/fieldset";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ProducerStatus } from "@/types/producer";

interface ProducerEditProfileCardProps {
  avatarUrl: string;
  name: string;
  status: ProducerStatus;
  banned: boolean;
  emailVerified: boolean;
  onBannedChange: (value: boolean) => void;
  onEmailVerifiedChange: (value: boolean) => void;
  onDeleteProducer: () => void;
  onAvatarChange?: (file: File) => void;
  /** Approve a pending producer (admin review). Button shows only when status === "pending". */
  onApprove?: () => void;
  /** View-only: switches disabled, no delete button, avatar not editable. */
  readOnly?: boolean;
}

const statusConfig: Record<
  ProducerStatus,
  { label: string; bg: string; text: string }
> = {
  active: { label: "ใช้งาน", bg: "bg-success/16", text: "text-success-dark" },
  pending: { label: "รอตรวจสอบ", bg: "bg-warning/16", text: "text-warning-dark" },
  banned: { label: "ระงับ", bg: "bg-error/16", text: "text-error-dark" },
  rejected: { label: "ปฏิเสธ", bg: "bg-grey-500/16", text: "text-grey-600" },
  disabled: { label: "ปิดใช้งาน", bg: "bg-grey-500/16", text: "text-grey-600" },
};

function BoolBadge({ value }: { value: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold",
        value
          ? "bg-success/16 text-success-dark"
          : "bg-grey-500/16 text-grey-600",
      )}
    >
      {value ? "ใช่" : "ไม่"}
    </span>
  );
}

export function ProducerEditProfileCard({
  avatarUrl,
  name,
  status,
  banned,
  emailVerified,
  onBannedChange,
  onEmailVerifiedChange,
  onDeleteProducer,
  onAvatarChange,
  onApprove,
  readOnly = false,
}: ProducerEditProfileCardProps) {
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
          "absolute top-6 right-6 inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold",
          badge.bg,
          badge.text,
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
        />
      </div>

      <Fieldset aria-label="การตั้งค่าบัญชี" className="mt-10">
        <div className="space-y-5">
          <Field className="flex-row items-start justify-between gap-4">
            <div>
              <Label className="text-sm font-semibold">ระงับบัญชี</Label>
              <Description>ปิดการใช้งานบัญชีตัวแทนนี้</Description>
            </div>
            {readOnly ? (
              <BoolBadge value={banned} />
            ) : (
              <Switch
                checked={banned}
                onCheckedChange={onBannedChange}
                className="data-checked:bg-success"
              />
            )}
          </Field>

          <Field className="flex-row items-start justify-between gap-4">
            <div>
              <Label className="text-sm font-semibold">ยืนยันอีเมลแล้ว</Label>
              <Description>
                หากปิด ระบบจะส่งอีเมลยืนยันให้ตัวแทนโดยอัตโนมัติ
              </Description>
            </div>
            {readOnly ? (
              <BoolBadge value={emailVerified} />
            ) : (
              <Switch
                checked={emailVerified}
                onCheckedChange={onEmailVerifiedChange}
                className="data-checked:bg-success"
              />
            )}
          </Field>
        </div>
      </Fieldset>

      {!readOnly && (
        <div className="mt-6 flex flex-col items-center gap-3">
          {status === "pending" && onApprove && (
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex h-9 w-full items-center justify-center rounded-control bg-success px-4 text-sm font-bold text-white transition-colors hover:bg-success/90"
            >
              อนุมัติ
            </button>
          )}
          <button
            type="button"
            onClick={onDeleteProducer}
            className="rounded-control bg-error/16 px-3 py-1.5 text-sm font-bold text-error-dark transition-colors hover:bg-error/24"
          >
            ลบตัวแทน
          </button>
        </div>
      )}
    </div>
  );
}
