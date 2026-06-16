"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/payment/status-badge";
import { cn } from "@/lib/utils";
import { Plus, Globe, MoreHorizontal, Settings, Send, RefreshCw, Pause, Play, Trash2 } from "lucide-react";
import type { WebhookEndpoint } from "@/types/webhook";

interface EndpointListProps {
  endpoints: WebhookEndpoint[];
  onAdd: () => void;
  onEdit: (endpoint: WebhookEndpoint) => void;
  onToggleStatus: (endpoint: WebhookEndpoint) => void;
  onDelete: (endpoint: WebhookEndpoint) => void;
  onSendTest: (endpoint: WebhookEndpoint) => void;
  onRotateSecret: (endpoint: WebhookEndpoint) => void;
}

export function EndpointList({
  endpoints,
  onAdd,
  onEdit,
  onToggleStatus,
  onDelete,
  onSendTest,
  onRotateSecret,
}: EndpointListProps) {
  return (
    <Card>
      <CardHeader className="border-b border-[rgba(145,158,171,0.12)]">
        <CardTitle>Webhook Endpoints ที่ตั้งค่าไว้</CardTitle>
        <CardDescription>
          ระบบต้นทางที่จะรับ event notifications จาก CentroPay
        </CardDescription>
        <CardAction>
          <Button size="sm" onClick={onAdd}>
            <Plus />
            เพิ่ม Endpoint
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-2 pb-4">
        {endpoints.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            ยังไม่มี endpoint — กด &ldquo;เพิ่ม Endpoint&rdquo; เพื่อเริ่มต้น
          </div>
        )}
        <div className="flex flex-col gap-2">
          {endpoints.map((w) => (
            <div
              key={w.id}
              className="rounded-xl border border-border bg-muted/30 px-4 py-3.5"
            >
              {/* Top row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Globe className="size-4 shrink-0 text-primary" />
                <code className="inline-flex items-center rounded-md bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-foreground break-all">
                  {w.url}
                </code>
                <StatusBadge status={w.status} />
                <div className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  Success Rate
                </span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    w.successRate > 99
                      ? "text-success-dark"
                      : w.successRate > 95
                        ? "text-warning-dark"
                        : "text-error-dark"
                  )}
                >
                  {w.successRate}%
                </span>

                {/* Actions dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon-sm" aria-label="ตัวเลือก">
                        <MoreHorizontal />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(w)}>
                      <Settings />
                      แก้ไข Endpoint
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSendTest(w)}>
                      <Send />
                      ส่ง Test Event
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRotateSecret(w)}>
                      <RefreshCw />
                      หมุน Signing Secret
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onToggleStatus(w)}>
                      {w.status === "paused" ? (
                        <>
                          <Play />
                          เปิดใช้งาน
                        </>
                      ) : (
                        <>
                          <Pause />
                          พักใช้งาน
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(w)}
                    >
                      <Trash2 />
                      ลบ Endpoint
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Events chips */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 self-center text-xs text-muted-foreground">
                  รับ events:
                </span>
                {w.events.map((evt) => (
                  <span
                    key={evt}
                    className="inline-flex items-center rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    {evt}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
