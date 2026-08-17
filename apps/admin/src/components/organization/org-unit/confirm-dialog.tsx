"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OrgUnitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  /** destructive = ปุ่มแดง (ปิดใช้งาน), default = ปุ่มปกติ (ยืนยันออกจากฟอร์ม) */
  confirmVariant?: "destructive" | "default";
  /** async ได้ — ระหว่างรอ ปุ่มถูก disable กันกดซ้ำ (REQ-6.2); caller เป็นคนปิด dialog เอง */
  onConfirm: () => Promise<void> | void;
}

/** Dialog ยืนยัน generic ของโมดูล org unit — ใช้ทั้งปิดใช้งานและยืนยันยกเลิกฟอร์ม. */
export function OrgUnitConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmVariant = "default",
  onConfirm,
}: OrgUnitConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={pending} />}>
            ยกเลิก
          </DialogClose>
          <Button
            variant={confirmVariant}
            disabled={pending}
            onClick={async () => {
              setPending(true);
              try {
                await onConfirm();
              } finally {
                setPending(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
