"use client";

import { useState } from "react";
import { Copy, ShieldCheck, Shield, Info } from "lucide-react";
import { SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { EntityDrawer } from "@/components/payment/entity-drawer";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/payment/status-badge";
import { useToast } from "@/components/payment/toast/toast-provider";
import { cn } from "@/lib/utils";
import type { ConnectedApp } from "@/types/originator";
import type { DrawerTab } from "./app-card";

function fmtInt(n: number): string {
  return n.toLocaleString("th-TH");
}

function fmtVolume(v: number): string {
  return (v / 1_000_000).toFixed(2) + "M";
}

/** Mock call log rows — same as prototype */
const CALL_LOG_ROWS: Array<{
  ep: string;
  status: number;
  latency: number;
  time: string;
}> = [
  { ep: "POST /v1/payment-links", status: 200, latency: 142, time: "14:32:18" },
  { ep: "GET /v1/payment-links/{id}", status: 200, latency: 88, time: "14:31:55" },
  { ep: "POST /v1/payments/{id}/capture", status: 200, latency: 318, time: "14:31:18" },
  { ep: "GET /v1/policies/{id}", status: 200, latency: 64, time: "14:30:44" },
  { ep: "POST /v1/payment-links", status: 422, latency: 12, time: "14:30:18" },
  { ep: "GET /v1/payment-links", status: 200, latency: 156, time: "14:29:30" },
  { ep: "POST /v1/notifications/sms", status: 200, latency: 264, time: "14:28:11" },
];

interface AppDetailDrawerProps {
  app: ConnectedApp | null;
  /** Initial tab to open */
  initialTab?: DrawerTab;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (appId: string, patch: Partial<Pick<ConnectedApp, "owner" | "apiVersion" | "active">>) => void;
}

export function AppDetailDrawer({
  app,
  initialTab = "overview",
  open,
  onOpenChange,
  onSave,
}: AppDetailDrawerProps) {
  const toast = useToast();
  const [tab, setTab] = useState<DrawerTab>(initialTab);
  const [secretVisible, setSecretVisible] = useState(false);

  // Sync tab when drawer opens with a new initialTab
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setTab(initialTab);
    onOpenChange(nextOpen);
  };

  if (!app) return null;

  const clientId = `cli_${app.code.toLowerCase()}_${app.id.slice(-4)}_live`;
  const secretKey = `sk_live_••••••••••••••••••••••••${app.id.slice(-4)}`;
  const apiCallsToday = Math.round(app.txnCount * 4.2);

  const drawerHeader = (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <SheetTitle className="font-mono text-sm font-bold">{app.id}</SheetTitle>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-grey-400"
          aria-label="คัดลอกรหัส"
          onClick={async () => {
            await navigator.clipboard.writeText(app.id);
            toast.info("คัดลอกรหัสแอปแล้ว");
          }}
        >
          <Copy className="size-3.5" />
        </Button>
      </div>
      <SheetDescription className="text-sm font-semibold uppercase tracking-widest text-grey-500">
        แอปเชื่อมต่อ
      </SheetDescription>
    </div>
  );

  return (
    <EntityDrawer
      open={open}
      onOpenChange={handleOpenChange}
      header={drawerHeader}
      width="sm:max-w-[620px]"
    >
      {/* App body */}
      <div className="py-1">
          {/* App hero */}
          <div className="mb-5 flex items-start gap-3.5">
            <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-600 text-base font-bold text-white">
              {app.code}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold">{app.name}</div>
              <div className="mt-0.5 text-sm text-grey-500">
                API {app.apiVersion} · เจ้าของ {app.owner}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <StatusBadge status={app.active ? "active" : "paused"} />
                <span className="text-sm text-grey-500">
                  {app.active
                    ? `ออนไลน์ ${app.lastSeen}`
                    : `หยุดทำงาน ${app.lastSeen}`}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={tab}
            onValueChange={(v) => {
              if (v !== null) setTab(v as DrawerTab);
            }}
          >
            <TabsList variant="line" className="mb-4 w-full justify-start">
              <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
              <TabsTrigger value="apikey">API Key</TabsTrigger>
              <TabsTrigger value="calllog">Call Log (24 ชม.)</TabsTrigger>
              <TabsTrigger value="config">ตั้งค่า</TabsTrigger>
            </TabsList>

            {/* --- Overview --- */}
            <TabsContent value="overview">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "ธุรกรรม 30 วัน", value: fmtInt(app.txnCount) },
                  { label: "มูลค่ารวม", value: `฿${fmtVolume(app.volume)}` },
                  { label: "API Calls (วันนี้)", value: fmtInt(apiCallsToday) },
                  { label: "Success Rate", value: "98.4%" },
                  { label: "Avg Latency", value: "142ms" },
                  { label: "Error Rate", value: "0.6%" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-[rgba(145,158,171,0.12)] bg-muted/40 p-3"
                  >
                    <div className="text-sm text-grey-500">{s.label}</div>
                    <div className="mt-0.5 text-lg font-bold tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* --- API Key --- */}
            <TabsContent value="apikey">
              <div className="flex flex-col gap-3">
                {/* Client ID */}
                <div className="flex items-center gap-3 rounded-lg border border-[rgba(145,158,171,0.12)] bg-muted/40 p-3.5">
                  <ShieldCheck className="size-5 shrink-0 text-success-dark" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-grey-500">Client ID</div>
                    <code className="break-all font-mono text-sm">{clientId}</code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(clientId);
                      toast.info("คัดลอก Client ID แล้ว");
                    }}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>

                {/* Secret Key */}
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[rgba(145,158,171,0.12)] bg-muted/40 p-3.5">
                  <Shield className="size-5 shrink-0 text-warning-dark" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-grey-500">Secret Key · ใช้เฉพาะฝั่ง server</div>
                    <code className="font-mono text-sm">
                      {secretVisible
                        ? `sk_live_realkey_${app.id.slice(-4)}_live`
                        : secretKey}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSecretVisible((v) => !v)}
                  >
                    {secretVisible ? "ซ่อน" : "แสดง"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("หมุน API Key แล้ว")}
                  >
                    หมุน Key
                  </Button>
                </div>

                {/* Scopes info */}
                <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-grey-600">
                  <Info className="mt-px size-3.5 shrink-0 text-primary" />
                  <span>
                    API Key เชื่อมโยงกับ scopes:{" "}
                    <code className="rounded bg-muted px-1 font-mono text-xs">payment.create</code>,{" "}
                    <code className="rounded bg-muted px-1 font-mono text-xs">payment.read</code>,{" "}
                    <code className="rounded bg-muted px-1 font-mono text-xs">policy.read</code>
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* --- Call Log --- */}
            <TabsContent value="calllog">
              <div className="overflow-hidden rounded-lg border border-[rgba(145,158,171,0.12)]">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_70px_70px_60px] gap-2 bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-grey-500">
                  <div>Endpoint</div>
                  <div className="text-right">Status</div>
                  <div className="text-right">Latency</div>
                  <div className="text-right">Time</div>
                </div>
                {CALL_LOG_ROWS.map((row, i) => (
                  <div
                    key={i}
                    className={cn(
                      "grid grid-cols-[1fr_70px_70px_60px] gap-2 px-3 py-2 text-sm",
                      i < CALL_LOG_ROWS.length - 1 &&
                        "border-b border-[rgba(145,158,171,0.12)]",
                    )}
                  >
                    <code className="truncate font-mono text-sm">{row.ep}</code>
                    <div
                      className={cn(
                        "text-right font-mono font-bold",
                        row.status >= 500
                          ? "text-error-dark"
                          : row.status >= 400
                            ? "text-warning-dark"
                            : "text-success-dark",
                      )}
                    >
                      {row.status}
                    </div>
                    <div className="text-right tabular-nums text-grey-500">{row.latency}ms</div>
                    <div className="text-right tabular-nums text-grey-500">{row.time}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* --- Config / Settings --- */}
            <TabsContent value="config">
              <ConfigTab app={app} onSave={onSave} onClose={() => onOpenChange(false)} />
            </TabsContent>
          </Tabs>
        </div>
    </EntityDrawer>
  );
}

/* ------------------------------------------------------------------ */
/* Config tab — extracted to keep parent component readable            */
/* ------------------------------------------------------------------ */

interface ConfigTabProps {
  app: ConnectedApp;
  onSave: (appId: string, patch: Partial<Pick<ConnectedApp, "owner" | "apiVersion" | "active">>) => void;
  onClose: () => void;
}

function ConfigTab({ app, onSave, onClose }: ConfigTabProps) {
  const [owner, setOwner] = useState(app.owner);
  const [apiVersion, setApiVersion] = useState(app.apiVersion);
  const [active, setActive] = useState(app.active);
  const webhookUrl = `https://${app.code.toLowerCase()}.insurer.co.th/webhooks/centropay`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground">เจ้าของ</label>
        <input
          className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground">API Version</label>
        <Select value={apiVersion} onValueChange={(v) => setApiVersion(v ?? "")}>
          <SelectTrigger className="h-8 w-full text-sm">
            <SelectValue placeholder="API Version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="v2.4">v2.4 (current)</SelectItem>
            <SelectItem value="v2.3">v2.3</SelectItem>
            <SelectItem value="v2.2">v2.2 (deprecated)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground">Webhook URL</label>
        <input
          className="h-8 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          defaultValue={webhookUrl}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground">Rate Limit (req/min)</label>
        <input
          className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          type="number"
          defaultValue={600}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="size-4 rounded accent-primary"
        />
        เปิดให้แอปนี้เรียก API ได้
      </label>

      <div className="mt-2 flex gap-2">
        <Button
          onClick={() => {
            onSave(app.id, { owner, apiVersion, active });
            onClose();
          }}
        >
          บันทึก
        </Button>
        <Button variant="ghost" onClick={onClose}>
          ยกเลิก
        </Button>
      </div>
    </div>
  );
}
