"use client";

import { useState, useCallback } from "react";
import { Copy, AlertTriangle, CheckCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SecretRevealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  secret: string;
}

export function SecretRevealModal({
  open,
  onOpenChange,
  clientName,
  secret,
}: SecretRevealModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — fallback silent
    }
  }, [secret]);

  const handleClose = useCallback(() => {
    setCopied(false);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[560px]"
      >
        <DialogHeader>
          <DialogTitle>Client Secret ใหม่</DialogTitle>
          <DialogDescription>
            Secret ของ <span className="font-semibold text-foreground">{clientName}</span>{" "}
            จะแสดงเพียงครั้งเดียว · กรุณาคัดลอกและเก็บในที่ปลอดภัย
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Secret display box */}
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted px-3.5 py-3">
            <code className="flex-1 break-all font-mono text-sm text-foreground">
              {secret}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className={cn(
                "shrink-0 gap-1.5 transition-colors",
                copied && "border-success/40 bg-success/10 text-success-dark",
              )}
            >
              {copied ? (
                <>
                  <CheckCheck className="size-3.5" />
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  คัดลอก
                </>
              )}
            </Button>
          </div>

          {/* 24h grace period warning */}
          <div className="flex gap-2 rounded-lg border border-warning/30 bg-warning/8 p-3">
            <AlertTriangle className="mt-px size-4 shrink-0 text-warning-dark" />
            <p className="text-sm text-grey-600 dark:text-grey-400">
              Secret เดิมจะใช้ได้อีก{" "}
              <span className="font-semibold text-foreground">24 ชั่วโมง</span>{" "}
              เพื่อให้คุณอัปเดต integration ทัน หลังจากนั้นจะถูก revoke อัตโนมัติ
            </p>
          </div>
        </div>

        <DialogFooter showCloseButton={false}>
          <Button onClick={handleClose}>เข้าใจแล้ว</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
