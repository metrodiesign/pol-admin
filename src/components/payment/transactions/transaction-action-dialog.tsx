"use client";

import { useState } from "react";
import { ConfirmModal } from "@/components/payment/confirm-modal";
import { Textarea } from "@/components/ui/textarea";
import type { Transaction } from "@/types/transaction";

export type TxnActionKind = "capture" | "void" | "refund";

const ACTION_CONFIG: Record<
  TxnActionKind,
  { title: string; description: string; confirmLabel: string; destructive: boolean }
> = {
  capture: {
    title: "ยืนยันการเก็บเงิน (Capture)",
    description:
      "การเก็บเงินจะทำให้ยอดที่ถูก authorize ไว้ถูกหักออกจากบัญชีลูกค้าจริง การกระทำนี้ไม่สามารถย้อนกลับได้",
    confirmLabel: "ยืนยัน Capture",
    destructive: false,
  },
  void: {
    title: "ยกเลิกธุรกรรม (Void)",
    description:
      "การ Void จะยกเลิกการ authorize และคืนวงเงินให้ลูกค้าทันที สามารถทำได้เฉพาะธุรกรรมที่ยังไม่ถูก capture เท่านั้น",
    confirmLabel: "ยืนยัน Void",
    destructive: true,
  },
  refund: {
    title: "คืนเงินบางส่วน / ทั้งหมด (Refund)",
    description:
      "คืนเงินกลับไปยังช่องทางที่ลูกค้าใช้ชำระ ใช้ระยะเวลา 5–15 วันทำการขึ้นอยู่กับผู้ให้บริการ",
    confirmLabel: "ยืนยันการคืนเงิน",
    destructive: false,
  },
};

interface TransactionActionDialogProps {
  kind: TxnActionKind | null;
  txn: Transaction | null;
  onClose: () => void;
  onSuccess?: (kind: TxnActionKind, reason: string, notify: boolean) => void;
}

export function TransactionActionDialog({
  kind,
  txn,
  onClose,
  onSuccess,
}: TransactionActionDialogProps) {
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!kind || !txn) return null;
  const cfg = ACTION_CONFIG[kind];

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("กรุณาระบุเหตุผลในการดำเนินการ");
      return;
    }
    onSuccess?.(kind, reason.trim(), notify);
    setReason("");
    setNotify(true);
    setError(null);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason("");
      setNotify(true);
      setError(null);
      onClose();
    }
  };

  return (
    <ConfirmModal
      open={!!kind}
      onOpenChange={handleOpenChange}
      title={cfg.title}
      description={`ธุรกรรม ${txn.id} · ลูกค้า ${txn.customer.name}`}
      confirmLabel={cfg.confirmLabel}
      destructive={cfg.destructive}
      onConfirm={handleConfirm}
      className="sm:max-w-md"
    >
      <div className="flex flex-col gap-3 mt-1">
        <p className="text-sm text-grey-500 leading-relaxed">{cfg.description}</p>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" id="action-reason">
            เหตุผล <span className="text-error">*</span>
          </label>
          <Textarea
            aria-labelledby="action-reason"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError(null);
            }}
            placeholder="ระบุเหตุผลในการดำเนินการ (จะแสดงในประวัติและส่งถึงลูกค้า)"
            className="resize-none"
          />
          {error && (
            <p className="text-xs text-error">{error}</p>
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="size-4 rounded accent-primary"
          />
          <span>แจ้งลูกค้าทาง SMS และอีเมล</span>
        </label>
      </div>
    </ConfirmModal>
  );
}
