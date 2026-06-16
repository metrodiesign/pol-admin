"use client";

import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  error?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  error = false,
  className,
  ...props
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-invalid={error || undefined}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-primary/8",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-[4px] border-2 transition-colors",
          checked || indeterminate
            ? "border-primary bg-primary text-white"
            : error
              ? "border-error text-transparent"
              : "border-grey-600 text-transparent"
        )}
      >
        {indeterminate ? (
          <Minus className="size-3.5" strokeWidth={3} />
        ) : (
          <Check className="size-3.5" strokeWidth={3} />
        )}
      </span>
    </button>
  );
}
