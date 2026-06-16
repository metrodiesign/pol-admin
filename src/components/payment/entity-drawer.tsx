"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface EntityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Used only when `header` slot is absent */
  title?: string;
  description?: string;
  /** Custom header — rendered instead of the default title/description block */
  header?: React.ReactNode;
  /** Non-scrolling footer rendered below the scroll area */
  footer?: React.ReactNode;
  /** Pass false to suppress the built-in X button (e.g. when the header has its own close button) */
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Sheet width — defaults to sm:max-w-md */
  width?: string;
  /** Sheet side — defaults to right */
  side?: "right" | "left" | "top" | "bottom";
}

export function EntityDrawer({
  open,
  onOpenChange,
  title,
  description,
  header,
  footer,
  showCloseButton,
  children,
  className,
  width = "sm:max-w-md",
  side = "right",
}: EntityDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        showCloseButton={showCloseButton}
        className={cn("flex flex-col gap-0 p-0", width, className)}
      >
        {header ? (
          <SheetHeader className="flex flex-row items-center gap-3 border-b border-border px-5 py-4">
            {header}
          </SheetHeader>
        ) : (
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
            {description && (
              <SheetDescription className="text-sm text-grey-500">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center gap-2 border-t border-border px-5 py-3">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
