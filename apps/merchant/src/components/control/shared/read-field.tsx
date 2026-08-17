import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Read-only field for detail sheets: small grey label above a plain bold value.
 * Plain-text style (not an input box) — chosen once here so every control detail
 * sheet renders fields the same way (LESSONS.md: decide read-field style upfront).
 * Pass `mono` for machine identifiers (keys, IDs, refs) → renders in the data face.
 */
export function ReadField({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs font-medium text-grey-600">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold text-foreground break-all",
          mono && "text-data font-medium",
        )}
      >
        {value}
      </span>
    </div>
  );
}
