"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Same icon-button treatment as merchant user/role table row actions.
const actionClass =
  "size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white";

export function RowActions({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-1.5">{children}</div>
    </TooltipProvider>
  );
}

export function RowActionLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button
          render={<Link href={href} />}
          nativeButton={false}
          variant="ghost"
          size="icon-lg"
          className={actionClass}
          aria-label={label}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function RowActionButton({
  label,
  icon,
  onClick,
  disabled,
  tooltip,
  className,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** Tooltip text; defaults to the label (e.g. the reason while disabled). */
  tooltip?: string;
  className?: string;
}) {
  return (
    <Tooltip>
      {/* disabled buttons swallow pointer events — wrap so the tooltip still fires */}
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className={cn(actionClass, className)}
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip ?? label}</TooltipContent>
    </Tooltip>
  );
}
