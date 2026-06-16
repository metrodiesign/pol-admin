"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/payment/status-badge";
import { RefreshCw, Filter } from "lucide-react";
import type { WebhookEvent } from "@/types/webhook";

interface EventLogTableProps {
  events: WebhookEvent[];
  onRowClick: (event: WebhookEvent) => void;
}

export function EventLogTable({ events, onRowClick }: EventLogTableProps) {
  return (
    <Card>
      <CardHeader className="border-b border-[rgba(145,158,171,0.12)]">
        <CardTitle>Event Log</CardTitle>
        <CardDescription>
          Webhook events ทั้งหมด · เก็บย้อนหลัง 30 วัน
        </CardDescription>
        <CardAction>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter />
              กรอง
            </Button>
            <Button variant="outline" size="icon-sm">
              <RefreshCw />
              <span className="sr-only">รีเฟรช</span>
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="h-9 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                Event ID
              </th>
              <th className="h-9 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                ประเภท Event
              </th>
              <th className="h-9 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                อ้างอิง
              </th>
              <th className="h-9 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                PSP
              </th>
              <th className="h-9 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                สถานะส่ง
              </th>
              <th className="h-9 px-4 text-right align-middle text-xs font-medium text-muted-foreground">
                ครั้งที่ลอง
              </th>
              <th className="h-9 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                Latency
              </th>
              <th className="h-9 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                เวลา
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr
                key={e.id}
                onClick={() => onRowClick(e)}
                className="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {e.id}
                </td>
                <td className="px-4 py-2.5">
                  <code className="inline-flex items-center rounded-md bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-foreground">
                    {e.type}
                  </code>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {e.txn}
                </td>
                <td className="px-4 py-2.5 text-sm font-semibold">{e.psp}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge
                    status={
                      e.status === "delivered"
                        ? "succeeded"
                        : e.status === "retrying"
                          ? "queued"
                          : "failed"
                    }
                    label={
                      e.status === "delivered"
                        ? "ส่งสำเร็จ"
                        : e.status === "retrying"
                          ? "กำลังลองใหม่"
                          : "ล้มเหลว"
                    }
                  />
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-sm">
                  {e.attempts}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {e.latency}
                </td>
                <td className="px-4 py-2.5 text-sm text-muted-foreground">
                  {e.ts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
