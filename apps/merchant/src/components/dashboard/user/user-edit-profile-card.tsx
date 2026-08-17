"use client";

import { AvatarUpload } from "@pol/ui/avatar-upload";
import { Fieldset, Field, Label, Description } from "@pol/ui/fieldset";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type UserStatus = "active" | "pending" | "banned" | "rejected";

interface UserEditProfileCardProps {
  avatarUrl: string;
  name: string;
  status: UserStatus;
  banned: boolean;
  emailVerified: boolean;
  onBannedChange: (value: boolean) => void;
  onEmailVerifiedChange: (value: boolean) => void;
  onDeleteUser: () => void;
  onAvatarChange?: (file: File) => void;
}

const statusConfig: Record<
  UserStatus,
  { label: string; bg: string; text: string }
> = {
  active: { label: "Active", bg: "bg-success/16", text: "text-success-dark" },
  pending: {
    label: "Pending",
    bg: "bg-warning/16",
    text: "text-warning-dark",
  },
  banned: { label: "Banned", bg: "bg-error/16", text: "text-error-dark" },
  rejected: {
    label: "Rejected",
    bg: "bg-grey-500/16",
    text: "text-grey-600",
  },
};

export function UserEditProfileCard({
  avatarUrl,
  name,
  status,
  banned,
  emailVerified,
  onBannedChange,
  onEmailVerifiedChange,
  onDeleteUser,
  onAvatarChange,
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
          "absolute top-6 right-6 inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold",
          badge.bg,
          badge.text
        )}
      >
        {badge.label}
      </span>

      <AvatarUpload
        src={avatarUrl}
        alt={name}
        size={144}
        onFileSelect={onAvatarChange}
      />

      <Fieldset aria-label="Account settings" className="mt-10">
        <div className="space-y-5">
          <Field className="flex-row items-start justify-between gap-4">
            <div>
              <Label className="text-sm font-semibold">Banned</Label>
              <Description>Apply disable account</Description>
            </div>
            <Switch
              checked={banned}
              onCheckedChange={onBannedChange}
              className="data-checked:bg-success"
            />
          </Field>

          <Field className="flex-row items-start justify-between gap-4">
            <div>
              <Label className="text-sm font-semibold">Email verified</Label>
              <Description>
                Disabling this will automatically send the user a verification
                email
              </Description>
            </div>
            <Switch
              checked={emailVerified}
              onCheckedChange={onEmailVerifiedChange}
              className="data-checked:bg-success"
            />
          </Field>
        </div>
      </Fieldset>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onDeleteUser}
          className="rounded-control bg-error/16 px-3 py-1.5 text-sm font-bold text-error-dark transition-colors hover:bg-error/24"
        >
          Delete user
        </button>
      </div>
    </div>
  );
}
