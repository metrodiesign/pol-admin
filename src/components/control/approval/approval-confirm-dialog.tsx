"use client";

import type { ApprovalRequest } from "@/types/approval";
import { ACTION_LABEL } from "@/lib/control/approval";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { formatDateTime } from "@/lib/control/format";
import { formatTHB } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReadField } from "@/components/control/shared/read-field";

export type ApprovalConfirmMode = "approve" | "reject";

const MODE_COPY: Record<
  ApprovalConfirmMode,
  { title: string; description: string; confirm: string; variant: "default" | "destructive" }
> = {
  approve: {
    title: "ยืนยันการอนุมัติ",
    description:
      "คุณกำลังอนุมัติคำขอนี้ในฐานะผู้ตรวจสอบคนที่สอง การดำเนินการจะถูกบันทึก",
    confirm: "อนุมัติ",
    variant: "default",
  },
  reject: {
    title: "ยืนยันการปฏิเสธ",
    description:
      "คุณกำลังปฏิเสธคำขอนี้ ผู้ขอจะต้องยื่นคำขอใหม่หากยังต้องการดำเนินการ",
    confirm: "ปฏิเสธ",
    variant: "destructive",
  },
};

/**
 * Confirmation step for both approve and reject — summarizes the request before the
 * actor commits. Same dialog, switched by `mode`. Controlled open state so the view
 * owns which request is in flight.
 */
export function ApprovalConfirmDialog({
  request,
  mode,
  onConfirm,
  onClose,
}: {
  request: ApprovalRequest | null;
  mode: ApprovalConfirmMode;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const copy = MODE_COPY[mode];

  return (
    <Dialog open={request !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {request ? (
          <>
            <DialogHeader>
              <DialogTitle>{copy.title}</DialogTitle>
              <DialogDescription>{copy.description}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <ReadField
                label="การดำเนินการ"
                value={ACTION_LABEL[request.actionType]}
              />
              <ReadField label="รหัสคำขอ" value={request.id} mono />
              <ReadField label="เป้าหมาย" value={request.target} mono />
              <ReadField label="ผู้ขอ" value={request.maker} mono />
              <ReadField
                label="บริษัท"
                value={MERCHANT_LABEL[request.merchantId]}
              />
              <ReadField
                label="ขอเมื่อ"
                value={formatDateTime(request.requestedAt)}
                mono
              />
              {request.refAmount != null ? (
                <ReadField
                  label="อ้างอิง — เงิน settle PSP→บริษัทโดยตรง"
                  value={formatTHB(request.refAmount)}
                  className="col-span-2"
                />
              ) : null}
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                ยกเลิก
              </DialogClose>
              <Button variant={copy.variant} onClick={onConfirm}>
                {copy.confirm}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
