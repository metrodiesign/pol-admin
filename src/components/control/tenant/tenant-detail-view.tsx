"use client";

import { Building2, CreditCard } from "lucide-react";
import type { TenantId } from "@/types/tenant";
import { tenantById } from "@/lib/mock/tenants";
import { TENANT_STATUS_LABEL, tenantStatusTone } from "@/lib/control/tenant";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/control-status-badge";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { Badge } from "@/components/ui/badge";

function DetailCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl bg-card p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h2 className="mb-5 flex items-center gap-2 text-h6 text-foreground">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function NotFound() {
  return (
    <div
      className="rounded-2xl bg-card p-10 text-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-h6 text-foreground">ไม่พบบริษัทนี้</p>
      <p className="mt-1 text-sm text-grey-600">
        รหัสบริษัทอาจไม่ถูกต้องหรือถูกลบไปแล้ว
      </p>
    </div>
  );
}

export function TenantDetailView({ id }: { id?: string }) {
  const tenant = tenantById(id as TenantId);
  if (!tenant) return <NotFound />;

  const tone = tenantStatusTone(tenant.status);

  return (
    <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
      {/* Summary */}
      <div className="mmd:col-span-4">
        <div
          className="flex flex-col gap-5 rounded-2xl bg-card p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-stretch gap-3">
            <StatusSpine tone={tone} className="h-auto" />
            <div className="min-w-0">
              <span className="text-overline text-grey-500">
                Control plane · Tenant
              </span>
              <h1 className="text-h5 text-foreground">{tenant.name}</h1>
              <p className="text-data mt-1 text-xs break-all text-grey-600">
                {tenant.code}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ControlStatusBadge
              tone={tone}
              label={TENANT_STATUS_LABEL[tenant.status]}
            />
            <span className="inline-flex items-center gap-1 rounded-md bg-grey-500/12 px-1.5 py-1 text-xs font-semibold text-grey-700">
              <Building2 className="size-3.5" />
              นิติบุคคลแยกต่างหาก
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--divider)] pt-5">
            <ReadField label="รหัส" value={tenant.code} mono />
            <ReadField label="ผู้ดูแล" value={String(tenant.adminCount)} mono />
          </div>

          <p className="border-t border-[var(--divider)] pt-5 text-xs text-grey-600">
            เฉพาะผู้ดูแลระดับ Super เท่านั้นที่จัดการได้ — ผู้ดูแลแบบ Scoped
            เห็นเฉพาะบริษัทของตน (อ่านอย่างเดียว)
          </p>
        </div>
      </div>

      {/* Detail */}
      <div className="flex flex-col gap-6 mmd:col-span-8">
        <DetailCard
          title="ข้อมูลนิติบุคคล"
          icon={<Building2 className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField
              label="นิติบุคคล"
              value={tenant.legalEntity}
              className="sm:col-span-2"
            />
            <ReadField
              label="ขอบเขต SAQ"
              value={tenant.saqScope}
              className="sm:col-span-2"
            />
            <ReadField
              label="สถานะ"
              value={TENANT_STATUS_LABEL[tenant.status]}
            />
          </div>
        </DetailCard>

        <DetailCard
          title="การชำระเงิน"
          icon={<CreditCard className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField
              label="PSP ที่เปิดใช้"
              value={
                <span className="flex flex-wrap gap-1">
                  {tenant.enabledPsps.map((p) => (
                    <Badge
                      key={p}
                      variant="secondary"
                      className="text-[11px] uppercase"
                    >
                      {p}
                    </Badge>
                  ))}
                </span>
              }
              className="sm:col-span-2"
            />
            <ReadField label="ผู้ดูแล" value={String(tenant.adminCount)} mono />
          </div>
          <p className="mt-5 border-t border-[var(--divider)] pt-5 text-sm text-grey-600">
            เงินจากผู้ให้บริการชำระเงิน (PSP) settle เข้าสู่นิติบุคคลนี้โดยตรง
            — แพลตฟอร์มทำหน้าที่ orchestrate เท่านั้น
          </p>
        </DetailCard>
      </div>
    </div>
  );
}
