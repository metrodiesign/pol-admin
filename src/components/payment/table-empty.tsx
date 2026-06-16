"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentTableEmptyProps {
  title: string;
  description: string;
  onClear: () => void;
}

/**
 * Empty-state shown inside the shared DataTable's body when a CentroPay table
 * has no rows for the active filters. Passed via the DataTable `emptyState` prop.
 */
export function PaymentTableEmpty({
  title,
  description,
  onClear,
}: PaymentTableEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-grey-100 dark:bg-grey-800">
        <Search className="size-6 text-grey-500" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-grey-500">{description}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onClear}>
        ล้างตัวกรองทั้งหมด
      </Button>
    </div>
  );
}
