"use client";

import { useState } from "react";
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
import { RefreshCw, Check } from "lucide-react";
import type { WebhookEndpoint } from "@/types/webhook";

const ALL_EVENT_TYPES = [
  "payment.succeeded",
  "payment.failed",
  "payment.refunded",
  "payment.voided",
  "payment.authorized",
  "payment.captured",
  "payment.pending",
  "link.created",
  "link.viewed",
  "link.expired",
] as const;

type EndpointFormData = {
  url: string;
  events: string[];
  secret: string;
};

interface EndpointFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint?: WebhookEndpoint;
  onSave: (data: EndpointFormData) => void;
}

function generateSecret(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "whsec_";
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function EndpointFormDialog({
  open,
  onOpenChange,
  endpoint,
  onSave,
}: EndpointFormDialogProps) {
  const isEdit = !!endpoint;
  const [url, setUrl] = useState(endpoint?.url ?? "https://");
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(
    new Set(endpoint?.events ?? ["payment.succeeded"])
  );
  const [secret, setSecret] = useState(generateSecret);
  const [urlError, setUrlError] = useState("");

  function toggleEvent(eventType: string) {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventType)) {
        next.delete(eventType);
      } else {
        next.add(eventType);
      }
      return next;
    });
  }

  function handleSave() {
    if (!url.startsWith("https://")) {
      setUrlError("URL ต้องเป็น https://");
      return;
    }
    if (selectedEvents.size === 0) {
      return;
    }
    setUrlError("");
    onSave({ url, events: Array.from(selectedEvents), secret });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไข Webhook Endpoint" : "เพิ่ม Webhook Endpoint"}
          </DialogTitle>
          <DialogDescription>
            URL ปลายทางที่จะรับ event notifications จาก CentroPay
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Endpoint URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              Endpoint URL <span className="text-destructive">*</span>
            </label>
            <input
              className={cn(
                "h-8 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none transition-colors",
                "focus:border-ring focus:ring-3 focus:ring-ring/20",
                urlError ? "border-destructive" : "border-border"
              )}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlError("");
              }}
              placeholder="https://your-app.co.th/webhooks/centropay"
              spellCheck={false}
            />
            {urlError ? (
              <p className="text-xs text-destructive">{urlError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                ต้องเป็น HTTPS · ระบบจะส่ง POST request พร้อม HMAC signature
              </p>
            )}
          </div>

          {/* Signing Secret */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Signing Secret</label>
            <div className="flex gap-2">
              <input
                className="h-8 flex-1 rounded-lg border border-border bg-muted/50 px-3 font-mono text-sm outline-none"
                value={secret}
                readOnly
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSecret(generateSecret())}
                title="สร้าง secret ใหม่"
              >
                <RefreshCw />
              </Button>
            </div>
          </div>

          {/* Event Types */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Events ที่จะรับ{" "}
              <span className="text-muted-foreground">
                ({selectedEvents.size}/{ALL_EVENT_TYPES.length})
              </span>
            </label>
            {selectedEvents.size === 0 && (
              <p className="text-xs text-destructive">
                เลือก event อย่างน้อย 1 รายการ
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {ALL_EVENT_TYPES.map((evt) => {
                const active = selectedEvents.has(evt);
                return (
                  <button
                    key={evt}
                    type="button"
                    onClick={() => toggleEvent(evt)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {active && <Check className="size-3" />}
                    {evt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave} disabled={selectedEvents.size === 0}>
            {isEdit ? "บันทึก" : "เพิ่ม Endpoint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
