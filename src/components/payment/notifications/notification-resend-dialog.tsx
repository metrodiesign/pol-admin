"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { Notification } from "@/lib/mock/notifications";

interface NotificationResendDialogProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (n: Notification) => void;
}

export function NotificationResendDialog({
  notification,
  open,
  onOpenChange,
  onConfirm,
}: NotificationResendDialogProps) {
  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ส่งข้อความซ้ำ</DialogTitle>
          <DialogDescription>
            ระบบจะส่ง {notification.type === "sms" ? "SMS" : "อีเมล"} ไปยัง{" "}
            <span className="font-mono font-semibold text-foreground">
              {notification.recipient}
            </span>{" "}
            อีกครั้ง — รายการจะเข้าคิวส่งใหม่ภายใน 5 วินาที
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-grey-200 bg-grey-50 p-3.5 dark:border-grey-800 dark:bg-grey-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-grey-500 mb-1.5">
            หัวเรื่อง
          </p>
          <p className="text-sm text-foreground">{notification.subject}</p>
          <p className="mt-1.5 font-mono text-xs text-grey-500">
            {notification.templateId}
          </p>
        </div>

        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={() => {
              onConfirm(notification);
              onOpenChange(false);
            }}
            className="gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            ส่งซ้ำ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
