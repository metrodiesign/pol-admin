"use client";

import { useState } from "react";
import { Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/payment/toast/toast-provider";

const PERIODS = [
  { key: "today",   label: "วันนี้" },
  { key: "7d",      label: "7 วัน" },
  { key: "30d",     label: "30 วัน" },
  { key: "month",   label: "เดือนนี้" },
  { key: "quarter", label: "ไตรมาส" },
  { key: "year",    label: "ปีนี้" },
] as const;

type PeriodKey = (typeof PERIODS)[number]["key"];

interface DateRangeBarProps {
  onExcelExport?: () => void;
  onPdfExport?: () => void;
}

export function DateRangeBar({ onExcelExport, onPdfExport }: DateRangeBarProps) {
  const [active, setActive] = useState<PeriodKey>("30d");
  const toast = useToast();

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-2 py-3">
        <span className="text-sm font-semibold text-muted-foreground shrink-0">
          ช่วงเวลา:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setActive(p.key)}
              className={cn(
                "rounded-lg px-3 py-1 text-sm font-medium transition-colors",
                active === p.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Calendar className="size-3.5" />
          <span>25 เม.ย. - 24 พ.ค. 2569</span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onExcelExport?.();
              toast.success("กำลังดาวน์โหลด Excel", {
                description: "ไฟล์รายงานจะดาวน์โหลดในไม่ช้า",
              });
            }}
          >
            <Download className="size-3.5" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onPdfExport?.();
              toast.success("กำลังดาวน์โหลด PDF", {
                description: "ไฟล์รายงานจะดาวน์โหลดในไม่ช้า",
              });
            }}
          >
            <Download className="size-3.5" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
