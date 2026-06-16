"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleFormSectionProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleFormSection({
  title,
  subtitle,
  children,
  defaultOpen = true,
}: CollapsibleFormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="dashboard-card">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div>
          <p className="text-[17px] font-bold text-foreground">{title}</p>
          <p className="mt-0.5 text-sm text-grey-500">{subtitle}</p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 text-grey-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Body */}
      {open && (
        <div className="border-t border-dashed border-[var(--divider)] px-6 pb-6 pt-5">
          {children}
        </div>
      )}
    </div>
  );
}
