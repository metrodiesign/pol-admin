"use client";

import type { Role } from "@/types/role";
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

interface RoleDeleteDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** UI-shell: ยืนยันแล้วปิด — ไม่ลบออกจากรายการจริง (REQ-10.2) */
  onConfirm: (role: Role) => void;
}

export function RoleDeleteDialog({
  role,
  open,
  onOpenChange,
  onConfirm,
}: RoleDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>ลบบทบาท</DialogTitle>
          <DialogDescription>
            ต้องการลบบทบาท “{role?.name}” ใช่หรือไม่? การกระทำนี้ย้อนกลับไม่ได้
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>ยกเลิก</DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              if (role) onConfirm(role);
              onOpenChange(false);
            }}
          >
            ลบบทบาท
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
