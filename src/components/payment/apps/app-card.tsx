"use client";

import { Clock, Key, History, Settings, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/payment/status-badge";
import type { ConnectedApp } from "@/types/originator";

export type DrawerTab = "overview" | "apikey" | "calllog" | "config";

function fmtInt(n: number): string {
  return n.toLocaleString("th-TH");
}

function fmtVolume(v: number): string {
  return (v / 1_000_000).toFixed(2) + "M";
}

interface AppCardProps {
  app: ConnectedApp;
  onSelect: (app: ConnectedApp, tab?: DrawerTab) => void;
  onToggle: (appId: string, active: boolean) => void;
}

export function AppCard({ app, onSelect, onToggle }: AppCardProps) {
  const apiCallsToday = Math.round(app.txnCount * 4.2);

  return (
    <div className="rounded-2xl border border-[rgba(145,158,171,0.12)] bg-card p-5 shadow-sm">
      {/* Header row */}
      <div className="flex items-start gap-3.5">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-600 text-sm font-bold text-white">
          {app.code}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold">{app.name}</span>
            <StatusBadge status={app.active ? "active" : "paused"} />
          </div>
          <div className="mt-1 text-sm text-grey-500">
            <span className="font-mono">{app.id}</span>
            {" · "}API {app.apiVersion}
            {" · "}เจ้าของ {app.owner}
          </div>
          <div className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-grey-500">
            <Clock className="size-3 shrink-0" />
            {app.active ? (
              <>
                เชื่อมต่อล่าสุด{" "}
                <strong className="text-success-dark">{app.lastSeen} น. (online)</strong>
              </>
            ) : (
              <>หยุดทำงานตั้งแต่ {app.lastSeen} น.</>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-grey-400"
          onClick={() => onSelect(app, "overview")}
          aria-label="ตัวเลือกเพิ่มเติม"
        >
          <MoreHorizontal />
        </Button>
      </div>

      {/* KPI stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <div className="text-sm text-grey-500">ธุรกรรม 30 วัน</div>
          <div className="mt-0.5 text-lg font-bold tabular-nums">{fmtInt(app.txnCount)}</div>
        </div>
        <div>
          <div className="text-sm text-grey-500">มูลค่ารวม</div>
          <div className="mt-0.5 text-lg font-bold tabular-nums">฿{fmtVolume(app.volume)}</div>
        </div>
        <div>
          <div className="text-sm text-grey-500">API Calls (วันนี้)</div>
          <div className="mt-0.5 text-lg font-bold tabular-nums">{fmtInt(apiCallsToday)}</div>
        </div>
      </div>

      {/* Action row */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[rgba(145,158,171,0.12)] pt-3.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(app, "apikey")}
        >
          <Key className="size-3.5" />
          API Key
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(app, "calllog")}
        >
          <History className="size-3.5" />
          Call log
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(app, "config")}
        >
          <Settings className="size-3.5" />
          ตั้งค่า
        </Button>
        <div className="flex-1" />
        <Switch
          checked={app.active}
          onCheckedChange={(checked: boolean) => onToggle(app.id, checked)}
          aria-label={app.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
        />
      </div>
    </div>
  );
}
