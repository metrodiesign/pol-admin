"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSectionCardProps {
  title: string;
  caption: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function FormSectionCard({
  title,
  caption,
  children,
  defaultOpen = true,
}: FormSectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-card bg-card"
      style={{
        boxShadow:
          "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      {/* Card header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 pt-6 pb-0 text-left"
      >
        <div>
          <p className="text-base font-semibold leading-7 text-grey-800">
            {title}
          </p>
          <p className="text-sm text-grey-500">{caption}</p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-grey-500 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {/* Divider */}
      {open && <div className="mx-6 mt-5 h-px bg-grey-200" />}

      {/* Body */}
      {open && <div className="px-6 py-6">{children}</div>}
    </div>
  );
}
