"use client";

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

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** popup ยืนยันก่อนทำ action ที่ย้อนกลับไม่ได้/มีผลกระทบ เช่น ยกเลิก, ยืนยันคำสั่งซื้อ */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="theme-minimals sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose
            render={
              <Button className="h-11 min-w-[100px] px-5 bg-[rgba(145,158,171,0.16)] font-bold text-grey-800 hover:bg-[rgba(145,158,171,0.24)]" />
            }
          >
            ยกเลิก
          </DialogClose>
          <Button
            onClick={onConfirm}
            className="h-11 min-w-[100px] px-5 bg-primary font-bold text-primary-foreground hover:bg-primary/90"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
