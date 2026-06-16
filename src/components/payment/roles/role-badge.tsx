import { cn } from "@/lib/utils";
import type { RoleColor, RolePortal } from "@/types/role";

const COLOR_MAP: Record<RoleColor, string> = {
  danger:  "bg-error/12 text-error-dark",
  warning: "bg-warning/12 text-warning-dark",
  info:    "bg-primary/10 text-primary",
  neutral: "bg-grey-500/10 text-grey-600",
  success: "bg-success/12 text-success-dark",
};

interface RoleBadgeProps {
  color: RoleColor;
  name: string;
  className?: string;
}

export function RoleBadge({ color, name, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold",
        COLOR_MAP[color],
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current opacity-80" />
      {name}
    </span>
  );
}

const PORTAL_MAP: Record<RolePortal, string> = {
  admin:    "bg-primary/10 text-primary",
  merchant: "bg-success/12 text-success-dark",
};

const PORTAL_LABEL: Record<RolePortal, string> = {
  admin:    "Admin Portal",
  merchant: "Merchant Portal",
};

interface PortalBadgeProps {
  portal: RolePortal;
  className?: string;
}

export function PortalBadge({ portal, className }: PortalBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold",
        PORTAL_MAP[portal],
        className,
      )}
    >
      {PORTAL_LABEL[portal]}
    </span>
  );
}
