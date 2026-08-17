"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PublishStatus = "Published" | "Draft";

interface ProductPublishButtonProps {
  defaultStatus: PublishStatus;
}

const OPTIONS: { value: PublishStatus; label: string; Icon: LucideIcon }[] = [
  { value: "Published", label: "Published", Icon: Eye },
  { value: "Draft", label: "Draft", Icon: EyeOff },
];

export function ProductPublishButton({ defaultStatus }: ProductPublishButtonProps) {
  const [status, setStatus] = useState<PublishStatus>(defaultStatus);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg bg-grey-500/16 px-3 py-1.5 text-sm font-bold text-grey-700 transition-colors hover:bg-grey-500/24"
      >
        {status}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl bg-white py-1 shadow-[0_0_2px_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)]">
            {OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setStatus(value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-[var(--action-hover)]",
                  status === value
                    ? "font-semibold text-foreground"
                    : "text-grey-600",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
