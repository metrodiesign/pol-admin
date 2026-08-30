"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import type { MerchantCode } from "@/types/merchant";
import { merchantByCode } from "@/lib/mock/merchant";
import {
  DetailIdentity,
  DetailNotFound,
  DetailSection,
} from "@/components/control/shared/detail-shell";
import { ReadField } from "@/components/control/shared/read-field";
import { cancelClass, cardStyle } from "@/components/control/shared/styles";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { Badge } from "@/components/ui/badge";

function Header({ id }: { id?: string }) {
  return (
    <EditPageHeader
      title="รายละเอียด Merchant"
      backHref="/control/tenants"
      breadcrumbs={[
        { label: "Tenants & Workspaces", href: "/control/tenants" },
        { label: id ?? "รายละเอียด" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/control/tenants" className={cancelClass}>
            ยกเลิก
          </Link>
        </div>
      }
    />
  );
}

export function TenantDetailView({ id }: { id?: string }) {
  const tenant = merchantByCode(id as MerchantCode);
  if (!tenant) {
    return (
      <>
        <Header id={id} />
        <DetailNotFound
          title="ไม่พบบริษัทนี้"
          message="รหัสบริษัทอาจไม่ถูกต้องหรือถูกลบไปแล้ว"
        />
      </>
    );
  }

  return (
    <>
      <Header id={tenant.code} />

      <div className="overflow-hidden rounded-card bg-card" style={cardStyle}>
        <DetailIdentity
          title={tenant.name}
          subtitle={tenant.legalEntityId}
          code={tenant.code}
          badges={
            <span className="inline-flex items-center gap-1 rounded-md bg-grey-500/12 px-1.5 py-1 text-xs font-semibold text-grey-700">
              <Building2 className="size-3.5" />
              นิติบุคคลแยกต่างหาก
            </span>
          }
        />

        <DetailSection
          title="ข้อมูลนิติบุคคล"
          description="เฉพาะผู้ดูแลระดับ Super เท่านั้นที่จัดการได้ — ผู้ดูแลแบบ Scoped เห็นเฉพาะบริษัทของตน (อ่านอย่างเดียว)"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <ReadField label="รหัส" value={tenant.code} mono />
            <ReadField label="นิติบุคคล" value={tenant.legalEntityId} />
            <ReadField label="ขอบเขต SAQ" value={tenant.saqScope} />
            <ReadField label="ผู้ดูแล" value={String(tenant.adminCount)} mono />
          </div>
        </DetailSection>

        <DetailSection
          title="การชำระเงิน"
          description="เงินจากผู้ให้บริการชำระเงิน (PSP) settle เข้าสู่นิติบุคคลนี้โดยตรง — แพลตฟอร์มทำหน้าที่ orchestrate เท่านั้น"
        >
          <ReadField
            label="PSP ที่เปิดใช้"
            value={
              <span className="flex flex-wrap gap-1">
                {tenant.enabledPsps.map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs uppercase">
                    {p}
                  </Badge>
                ))}
              </span>
            }
          />
        </DetailSection>
      </div>
    </>
  );
}
