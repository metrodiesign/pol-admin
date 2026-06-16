"use client";

import { CheckCircle, Send, Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionsBulkBarProps {
  count: number;
  onCapture: () => void;
  onEmail: () => void;
  onFlag: () => void;
  onClear: () => void;
}

export function TransactionsBulkBar({
  count,
  onCapture,
  onEmail,
  onFlag,
  onClear,
}: TransactionsBulkBarProps) {
  if (count === 0) return null;
  return (
    <div className="mx-5 my-2.5 flex flex-wrap items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
        <CheckCircle className="size-4" />
        เลือก {count} ธุรกรรม
      </span>
      <Button
        size="sm"
        className="gap-1.5 bg-success text-white hover:bg-success/90 border-0"
        onClick={onCapture}
      >
        <CheckCircle className="size-3.5" />
        Capture ทั้งหมด
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={onEmail}>
        <Send className="size-3.5" />
        ส่งใบเสร็จ
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={onFlag}>
        <Flag className="size-3.5" />
        ทำเครื่องหมาย
      </Button>
      <div className="flex-1" />
      <Button variant="ghost" size="sm" onClick={onClear}>
        <X className="size-3.5" />
        ยกเลิก
      </Button>
    </div>
  );
}
