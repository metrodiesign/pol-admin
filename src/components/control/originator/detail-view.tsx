"use client";

import Link from "next/link";
import type { Originator } from "@/types/control/originator";
import { ORIGINATORS } from "@/lib/mock/control/originators";
import { TYPE_LABEL, STATUS_LABEL, statusTone } from "@/lib/control/originator";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import {
  DetailIdentity,
  DetailNotFound,
  DetailSection,
} from "@/components/control/shared/detail-shell";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { cancelClass, cardStyle, controlBadgeClass } from "@/components/control/shared/styles";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { Badge } from "@/components/ui/badge";

function Header({ id }: { id?: string }) {
  return (
    <EditPageHeader
      title="รายละเอียด Originator"
      backHref="/control/originators"
      breadcrumbs={[
        { label: "Originators", href: "/control/originators" },
        { label: id ?? "รายละเอียด" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/control/originators" className={cancelClass}>
            ยกเลิก
          </Link>
        </div>
      }
    />
  );
}

export function OriginatorDetailView({ id }: { id?: string }) {
  const originator: Originator | undefined = ORIGINATORS.find(
    (o) => o.id === id,
  );
  if (!originator) {
    return (
      <>
        <Header id={id} />
        <DetailNotFound
          title="ไม่พบ Originator นี้"
          message="รหัส Originator อาจไม่ถูกต้องหรือถูกลบไปแล้ว"
        />
      </>
    );
  }

  const tone = statusTone(originator.status);

  return (
    <>
      <Header id={originator.id} />

      <div className="overflow-hidden rounded-card bg-card" style={cardStyle}>
        <DetailIdentity
          title={originator.name}
          subtitle={MERCHANT_LABEL[originator.merchantId]}
          code={originator.code}
          badges={
            <>
              <ControlStatusBadge tone={tone} label={STATUS_LABEL[originator.status]} />
              <Badge variant="outline" className={controlBadgeClass}>{TYPE_LABEL[originator.type]}</Badge>
            </>
          }
        />

        <DetailSection title="แหล่งที่มา">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <ReadField label="รหัส" value={originator.code} mono />
            <ReadField label="ชื่อ" value={originator.name} />
            <ReadField label="ประเภท" value={TYPE_LABEL[originator.type]} />
            <ReadField label="บริษัท" value={MERCHANT_LABEL[originator.merchantId]} />
            <ReadField label="สถานะ" value={STATUS_LABEL[originator.status]} />
          </div>
        </DetailSection>

        <DetailSection
          title="การยืนยันตัวตน"
          description="Originator ประเภทแอปเชื่อมต่อยืนยันตัวตนผ่าน API client ส่วนสาขาและตัวแทนใช้วิธีอื่นและไม่ผูก API client"
        >
          <ReadField label="ไคลเอนต์ API" value={originator.linkedApiClientId ?? "—"} mono />
        </DetailSection>
      </div>
    </>
  );
}
