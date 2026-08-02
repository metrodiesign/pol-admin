"use client";

import { KeyRound, Radio } from "lucide-react";
import type { Originator } from "@/types/originator";
import { ORIGINATORS } from "@/lib/mock/originators";
import { TYPE_LABEL, STATUS_LABEL, statusTone } from "@/lib/control/originator";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
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
      <p className="text-h6 text-foreground">ไม่พบ Originator นี้</p>
      <p className="mt-1 text-sm text-grey-600">
        รหัส Originator อาจไม่ถูกต้องหรือถูกลบไปแล้ว
      </p>
    </div>
  );
}

export function OriginatorDetailView({ id }: { id?: string }) {
  const originator: Originator | undefined = ORIGINATORS.find(
    (o) => o.id === id,
  );
  if (!originator) return <NotFound />;

  const tone = statusTone(originator.status);

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
                Control plane · ต้นทางคำสั่ง
              </span>
              <h1 className="text-data text-h5 text-foreground break-all">
                {originator.code}
              </h1>
              <p className="mt-1 text-sm text-grey-600">{originator.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ControlStatusBadge
              tone={tone}
              label={STATUS_LABEL[originator.status]}
            />
            <Badge variant="outline">{TYPE_LABEL[originator.type]}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--divider)] pt-5">
            <ReadField label="บริษัท" value={MERCHANT_LABEL[originator.merchantId]} />
            <ReadField label="ประเภท" value={TYPE_LABEL[originator.type]} />
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="flex flex-col gap-6 mmd:col-span-8">
        <DetailCard
          title="แหล่งที่มา"
          icon={<Radio className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField label="รหัส" value={originator.code} mono />
            <ReadField label="ประเภท" value={TYPE_LABEL[originator.type]} />
            <ReadField
              label="ชื่อ"
              value={originator.name}
              className="sm:col-span-2"
            />
            <ReadField label="บริษัท" value={MERCHANT_LABEL[originator.merchantId]} />
            <ReadField label="สถานะ" value={STATUS_LABEL[originator.status]} />
          </div>
        </DetailCard>

        <DetailCard
          title="การยืนยันตัวตน"
          icon={<KeyRound className="size-5 text-grey-600" />}
        >
          <p className="mb-4 text-sm text-grey-600">
            Originator ประเภทแอปเชื่อมต่อยืนยันตัวตนผ่าน API client
            ส่วนสาขาและตัวแทนใช้วิธีอื่นและไม่ผูก API client
          </p>
          <div className="grid grid-cols-1 gap-5">
            <ReadField
              label="ไคลเอนต์ API"
              value={originator.linkedApiClientId ?? "—"}
              mono
            />
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
