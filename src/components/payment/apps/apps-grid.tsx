"use client";

import { useState } from "react";
import { Plus, Info } from "lucide-react";
import { AppCard } from "./app-card";
import type { DrawerTab } from "./app-card";
import { AppDetailDrawer } from "./app-detail-drawer";
import { useToast } from "@/components/payment/toast/toast-provider";
import type { ConnectedApp } from "@/types/originator";

interface AppsGridProps {
  initialApps: ConnectedApp[];
}

export function AppsGrid({ initialApps }: AppsGridProps) {
  const toast = useToast();
  const [apps, setApps] = useState<ConnectedApp[]>(initialApps);
  const [selectedApp, setSelectedApp] = useState<ConnectedApp | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleSelect(app: ConnectedApp, tab: DrawerTab = "overview") {
    setSelectedApp(app);
    setDrawerTab(tab);
    setDrawerOpen(true);
  }

  function handleToggle(appId: string, active: boolean) {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, active } : a)),
    );
  }

  function handleSave(
    appId: string,
    patch: Partial<Pick<ConnectedApp, "owner" | "apiVersion" | "active">>,
  ) {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, ...patch } : a)),
    );
    toast.success("บันทึกการตั้งค่าแอปแล้ว");
  }

  return (
    <>
      {/* Info banner */}
      <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-grey-600">
          <strong>Single Integration Point</strong> — แอปองค์กรเชื่อมเข้ามาที่ CentroPay เพียงครั้งเดียวเพื่อใช้บริการรับชำระเงิน ·
          ทุกธุรกรรมจะถูกระบุ originator app เพื่อให้ตรวจสอบและกระทบยอดย้อนกลับได้
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {apps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            onSelect={handleSelect}
            onToggle={handleToggle}
          />
        ))}

        {/* Add new app — dashed card */}
        <button
          type="button"
          className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[rgba(145,158,171,0.3)] p-6 text-grey-500 transition-colors hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/5"
          aria-label="เชื่อมต่อแอปใหม่"
          onClick={() => toast.success("เชื่อมต่อแอปใหม่แล้ว")}
        >
          <div className="grid size-11 place-items-center rounded-full bg-muted text-primary">
            <Plus className="size-5" strokeWidth={2.5} />
          </div>
          <div className="text-sm font-semibold text-foreground">เชื่อมต่อแอปใหม่</div>
          <div className="max-w-[240px] text-center text-sm">
            ออก API key + กำหนด webhook endpoint สำหรับแอปที่ต้องการใช้บริการ CentroPay
          </div>
        </button>
      </div>

      {/* Detail drawer */}
      <AppDetailDrawer
        app={selectedApp}
        initialTab={drawerTab}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={handleSave}
      />
    </>
  );
}
