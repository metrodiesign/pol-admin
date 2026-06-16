"use client";

import { useState } from "react";
import { Settings, Activity, History, CheckCircle, Loader2, MoreHorizontal } from "lucide-react";
import { useToast } from "@/components/payment/toast/toast-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/payment/status-badge";
import { ChannelTag } from "@/components/payment/channel-tag";
import { cn } from "@/lib/utils";
import type { PspConfig } from "@/types/psp";
import type { PaymentChannel } from "@/types/transaction";

type TestState = "idle" | "testing" | "success";

interface PspProviderCardProps {
  psp: PspConfig;
  onConfigure: (psp: PspConfig) => void;
  onViewHistory: (psp: PspConfig) => void;
  onToggleLive: (id: string, live: boolean) => void;
}

function PspLogo({ pspId }: { pspId: string }) {
  const is2c2p = pspId === "2c2p";
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white",
        is2c2p
          ? "bg-gradient-to-br from-red-600 to-red-800"
          : "bg-gradient-to-br from-blue-600 to-blue-800",
      )}
    >
      {is2c2p ? "2C2P" : "OMS"}
    </div>
  );
}

function PspStatTile({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-[110px]">
      <p className="text-xs text-grey-500">{label}</p>
      <p className={cn("mt-0.5 text-lg font-bold tabular-nums", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

function formatVolume(baht: number): string {
  if (baht >= 1_000_000) return `฿${(baht / 1_000_000).toFixed(2)}M`;
  return `฿${baht.toLocaleString("th-TH")}`;
}

export function PspProviderCard({
  psp,
  onConfigure,
  onViewHistory,
  onToggleLive,
}: PspProviderCardProps) {
  const [testState, setTestState] = useState<TestState>("idle");
  const toast = useToast();

  const handleConnectionTest = () => {
    setTestState("testing");
    setTimeout(() => {
      setTestState("success");
      toast.success("เชื่อมต่อสำเร็จ · 148ms");
      setTimeout(() => setTestState("idle"), 3000);
    }, 900);
  };

  return (
    <Card>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <PspLogo pspId={psp.id} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold">{psp.label}</span>
              {psp.primary && (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  PSP หลัก
                </span>
              )}
              <StatusBadge status={psp.live ? "active" : "paused"} />
            </div>
            <p className="mt-1 text-sm leading-relaxed text-grey-500">
              {psp.fees}
            </p>
            <p className="mt-0.5 text-sm text-grey-500">
              รอบกระทบยอด:{" "}
              <span className="font-semibold text-foreground">{psp.settlement}</span>
              {" · "}Merchant ID:{" "}
              <code className="rounded bg-grey-500/8 px-1 py-0.5 font-mono text-xs">
                {psp.merchantId}
              </code>
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="เมนูเพิ่มเติม" />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onConfigure(psp)}>
                <Settings className="size-3.5" />
                ตั้งค่า
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onViewHistory(psp)}>
                <History className="size-3.5" />
                ดูประวัติ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onToggleLive(psp.id, !psp.live)}
              >
                {psp.live ? "พักใช้งาน PSP" : "เปิดใช้งาน PSP"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* KPI Tiles */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          <PspStatTile
            label="ธุรกรรมวันนี้"
            value={psp.todayTxn.toLocaleString("th-TH")}
          />
          <PspStatTile
            label="มูลค่าวันนี้"
            value={formatVolume(psp.todayVolume)}
          />
          <PspStatTile
            label="Success Rate"
            value={`${psp.successRate}%`}
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* Channels */}
        <div className="mt-3.5">
          <p className="mb-1.5 text-xs text-grey-500">ช่องทางที่รองรับ</p>
          <div className="flex flex-wrap gap-2">
            {psp.channels.map((ch) => (
              <ChannelTag key={ch} channel={ch as PaymentChannel} />
            ))}
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[rgba(145,158,171,0.12)] pt-3.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigure(psp)}
          >
            <Settings className="size-3.5" />
            ตั้งค่า
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleConnectionTest}
            disabled={testState === "testing"}
          >
            {testState === "testing" ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                กำลังทดสอบ...
              </>
            ) : testState === "success" ? (
              <>
                <CheckCircle className="size-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  สำเร็จ · 148ms
                </span>
              </>
            ) : (
              <>
                <Activity className="size-3.5" />
                ทดสอบการเชื่อมต่อ
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewHistory(psp)}
          >
            <History className="size-3.5" />
            ประวัติ
          </Button>

          <div className="flex-1" />

          <Switch
            checked={psp.live}
            onCheckedChange={(checked) => onToggleLive(psp.id, checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
