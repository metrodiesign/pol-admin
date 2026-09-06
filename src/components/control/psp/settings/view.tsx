"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { Button } from "@/components/ui/button";
import { cardStyle } from "@/components/control/shared/styles";
import { useMerchantCatalog } from "@/components/control/psp/resource-hooks";
import {
  SETTINGS_PROVIDERS,
  deriveReadiness,
} from "@/lib/control/merchant-psp-settings";
import { cn } from "@/lib/utils";
import type { PspProvider } from "@/types/control/psp-connection";
import { useMerchantPaymentSettings } from "./use-merchant-payment-settings";
import { ReadinessRail } from "./readiness-rail";
import { EnvironmentBanner } from "./environment-banner";
import { EnvironmentChangeDialog } from "./environment-change-dialog";
import { ProviderCard } from "./provider-card";
import { MethodMatrix } from "./method-matrix";
import { RoutingMatrix } from "./routing-matrix";

function Header({ merchantName }: { merchantName: string }) {
  return (
    <EditPageHeader
      title="ตั้งค่าการรับชำระของร้านค้า"
      backHref="/control/psp/list"
      breadcrumbs={[
        { label: "การเชื่อมต่อ PSP", href: "/control/psp/list" },
        { label: merchantName },
      ]}
    />
  );
}

function BlockingState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-card bg-card px-5 py-12 text-center" style={cardStyle} role="alert">
      <h1 className="text-h6 text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-grey-600">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-4" />
          ลองใหม่
        </Button>
      ) : null}
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "error" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-error/30 bg-error/8 text-error-dark"
          : "border-warning/30 bg-warning/8 text-warning-dark",
      )}
      role="alert"
    >
      {children}
    </div>
  );
}

function SectionUnavailable({ title, label }: { title: string; label: string }) {
  return (
    <section className="rounded-card bg-card p-6" style={cardStyle} aria-label={title}>
      <h2 className="text-lg font-bold leading-7 text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-grey-600" role="status">
        {label}
      </p>
    </section>
  );
}

export function MerchantPaymentSettingsView({ merchantId }: { merchantId: string }) {
  const { me } = useAuth();
  const permissions = me?.permissions ?? [];
  const hasMerchantView = permissions.includes("merchant.view");
  // environment change ใช้ settings.manage ตามตาราง permission ของ design.md (AC-7)
  const canManageSettings = permissions.includes("settings.manage");
  const state = useMerchantPaymentSettings(merchantId);
  const merchants = useMerchantCatalog(hasMerchantView);
  const [environmentDialogOpen, setEnvironmentDialogOpen] = useState(false);

  const merchantName = useMemo(() => {
    const match = merchants.items.find((item) => item.id === merchantId);
    return match?.name ?? merchantId;
  }, [merchants.items, merchantId]);

  if (state.status === "loading") {
    return (
      <>
        <Header merchantName={merchantName} />
        <div className="flex min-h-[40vh] items-center justify-center" aria-busy="true">
          <p className="text-sm text-grey-600" role="status">
            กำลังโหลดการตั้งค่า...
          </p>
        </div>
      </>
    );
  }
  if (state.status === "not-found") {
    return (
      <>
        <Header merchantName={merchantName} />
        <BlockingState title="ไม่พบร้านค้า" message="ร้านค้านี้อาจไม่มีอยู่หรือเข้าถึงไม่ได้" />
      </>
    );
  }
  if (state.status === "forbidden") {
    return (
      <>
        <Header merchantName={merchantName} />
        <BlockingState title="ไม่มีสิทธิ์เข้าถึง" message="คุณไม่มีสิทธิ์ดูการตั้งค่าของร้านค้านี้" />
      </>
    );
  }
  if (state.status === "error") {
    return (
      <>
        <Header merchantName={merchantName} />
        <BlockingState
          title="โหลดการตั้งค่าไม่สำเร็จ"
          message="กรุณาลองใหม่อีกครั้ง"
          onRetry={state.refetch}
        />
      </>
    );
  }

  const data = state.data;
  if (!data) return null;
  const readiness = deriveReadiness({
    settings: data.settings,
    connections: data.connections,
    merchantMethods: data.merchantMethods.map((resource) => resource.state),
    routing: data.routing,
  });

  const connectionOf = (provider: PspProvider) =>
    data.connections.find((connection) => connection.psp === provider);

  const canRequestEnvironmentChange =
    data.settingsEtag !== null &&
    data.settings.pendingEnvironment === null &&
    data.connections.length > 0;
  const environmentDisabledReason = !data.settingsEtag
    ? "ไม่มี ETag ล่าสุด"
    : data.settings.pendingEnvironment
      ? "มีคำขอรออนุมัติอยู่"
      : data.connections.length === 0
        ? "ยังไม่มี connection"
        : null;

  return (
    <>
      <Header merchantName={merchantName} />

      <div className="flex flex-col gap-5">
        {!data.settingsEtag ? (
          <Notice tone="error">Response ไม่มี ETag จึงปิดการเปลี่ยนสภาพแวดล้อม กรุณาโหลดข้อมูลใหม่</Notice>
        ) : null}
        {data.sections.approvals === "unavailable" ? (
          <Notice tone="warning">ตรวจสถานะคำขออนุมัติไม่ได้ บางการทำงานอาจถูกจำกัด</Notice>
        ) : null}
        {data.sections.connections === "unavailable" ? (
          <Notice tone="error">โหลดรายการ connection ไม่ได้</Notice>
        ) : null}

        <ReadinessRail steps={readiness} />

        <EnvironmentBanner
          settings={data.settings}
          canManage={canManageSettings}
          canRequestChange={canRequestEnvironmentChange}
          disabledReason={environmentDisabledReason}
          onRequestChange={() => setEnvironmentDialogOpen(true)}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {SETTINGS_PROVIDERS.map((provider) => (
            <ProviderCard
              key={provider}
              provider={provider}
              connection={connectionOf(provider)}
              merchantId={merchantId}
              merchantName={merchantName}
              permissions={permissions}
              approvals={data.approvals}
            />
          ))}
        </div>

        {data.sections.methods === "unavailable" ? (
          <SectionUnavailable
            title="ช่องทางชำระเงิน"
            label="โหลดสถานะช่องทางไม่ได้ (อาจไม่มีสิทธิ์ merchant.view)"
          />
        ) : (
          <MethodMatrix
            connections={data.connections}
            merchantMethods={data.merchantMethods}
            accountMethods={data.accountMethods}
            routing={data.routing}
            permissions={permissions}
            merchantId={merchantId}
            onChanged={state.refetch}
          />
        )}

        {data.sections.routing === "unavailable" ? (
          <SectionUnavailable title="การกำหนดเส้นทาง" label="โหลดข้อมูลการกำหนดเส้นทางไม่ได้" />
        ) : (
          <RoutingMatrix
            connections={data.connections}
            accountMethods={data.accountMethods}
            merchantMethods={data.merchantMethods}
            routing={data.routing}
            routingEtag={data.routingEtag}
            ruleset={data.ruleset}
            environment={data.settings.environment}
            permissions={permissions}
            merchantId={merchantId}
            onChanged={state.refetch}
          />
        )}
      </div>

      <EnvironmentChangeDialog
        open={environmentDialogOpen}
        onOpenChange={setEnvironmentDialogOpen}
        merchantId={merchantId}
        settingsEtag={data.settingsEtag}
        connections={data.connections}
        currentEnvironment={data.settings.environment}
        onAccepted={() => {
          setEnvironmentDialogOpen(false);
          state.refetch();
        }}
        onRefetch={state.refetch}
      />
    </>
  );
}
