"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { useControlStore } from "@/lib/control/store";
import { apiClientsStore, revokeClient } from "@/lib/control/api-clients-store";
import { showControlToast } from "@/components/control/shared/toast";
import {
  STATUS_LABEL,
  statusTone,
  scopeLabel,
  maskSecret,
} from "@/lib/control/api-client";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { formatDateTime } from "@/lib/control/format";
import {
  DetailIdentity,
  DetailNotFound,
  DetailSection,
} from "@/components/control/shared/detail-shell";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { cancelClass, cardStyle, controlBadgeClass } from "@/components/control/shared/styles";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

function Header({ id }: { id?: string }) {
  return (
    <EditPageHeader
      title="รายละเอียด API Client"
      backHref="/control/api-clients"
      breadcrumbs={[
        { label: "ไคลเอนต์ API", href: "/control/api-clients" },
        { label: id ?? "รายละเอียด" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/control/api-clients" className={cancelClass}>
            ยกเลิก
          </Link>
        </div>
      }
    />
  );
}

export function ApiClientDetailView({ id }: { id?: string }) {
  const clients = useControlStore(apiClientsStore);
  const client = clients.find((c) => c.id === id);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  if (!client) {
    return (
      <>
        <Header id={id} />
        <DetailNotFound
          title="ไม่พบ API Client นี้"
          message="รหัส client อาจไม่ถูกต้องหรือถูกลบไปแล้ว"
        />
      </>
    );
  }

  const currentStatus = client.status;
  const isRevoked = currentStatus === "revoked";
  const tone = statusTone(currentStatus);

  function handleConfirmRevoke() {
    if (!client) return;
    setRevoking(true);
    setConfirmOpen(false);
    const clientId = client.id;
    setTimeout(() => {
      revokeClient(clientId);
      showControlToast("เพิกถอน API client แล้ว", "error");
      setRevoking(false);
    }, 600);
  }

  return (
    <>
      <Header id={client.id} />

      <div className="overflow-hidden rounded-card bg-card" style={cardStyle}>
        <DetailIdentity
          title={client.name}
          subtitle={MERCHANT_LABEL[client.merchantId]}
          code={client.clientId}
          badges={
            <>
              <ControlStatusBadge tone={tone} label={STATUS_LABEL[currentStatus]} />
              <span className={`${controlBadgeClass} bg-success/12 text-success-dark`}>
                <ShieldCheck className="size-3.5" />
                OAuth2 · client-credentials
              </span>
            </>
          }
        />

        <DetailSection title="ข้อมูลทั่วไป">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <ReadField label="ชื่อ" value={client.name} />
            <ReadField label="บริษัท" value={MERCHANT_LABEL[client.merchantId]} />
            <ReadField label="รหัส client" value={client.id} mono />
            <ReadField label="รหัสไคลเอนต์" value={client.clientId} mono />
            <ReadField label="สร้างเมื่อ" value={formatDateTime(client.createdAt)} mono />
            <ReadField label="ใช้งานล่าสุด" value={formatDateTime(client.lastUsedAt)} mono />
            <ReadField label="สถานะ" value={STATUS_LABEL[currentStatus]} />
          </div>
        </DetailSection>

        <DetailSection
          title="ขอบเขตสิทธิ์"
          description="สิทธิ์ที่ client นี้เรียกใช้งานผ่าน API ได้ — จำกัดเฉพาะ scope ที่ได้รับอนุมัติ"
        >
          <div className="flex flex-wrap gap-1.5">
            {client.scopes.map((s) => (
              <Badge key={s} variant="outline" className={controlBadgeClass} title={scopeLabel(s)}>
                {s}
              </Badge>
            ))}
          </div>
        </DetailSection>

        <DetailSection
          title="ที่เก็บข้อมูลลับ"
          description="Client secret ถูกเก็บใน vault — แสดงแบบปิดบังเท่านั้น ค่าจริงแสดงเต็มครั้งเดียวตอนสร้าง เก็บไว้ให้ปลอดภัย"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ReadField label="คีย์ลับไคลเอนต์" value={maskSecret(client.clientSecret)} mono />
          </div>
        </DetailSection>

        <div className="flex flex-col gap-3 border-t border-[var(--divider)] p-6">
          <p className="text-xs text-grey-600">
            การเพิกถอน client จะตัดการเข้าถึง API ทันทีและย้อนกลับไม่ได้
          </p>
          <div>
            <Button
              variant="destructive"
              size="lg"
              disabled={isRevoked || revoking}
              onClick={() => setConfirmOpen(true)}
            >
              {revoking ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldOff className="size-4" />
              )}
              {isRevoked
                ? "เพิกถอนแล้ว"
                : revoking
                  ? "กำลังเพิกถอน..."
                  : "เพิกถอน client"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิกถอน client นี้?</DialogTitle>
            <DialogDescription>
              {client.name} ({client.clientId}) จะไม่สามารถเรียกใช้ API ได้อีก
              การกระทำนี้ย้อนกลับไม่ได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              ยกเลิก
            </DialogClose>
            <Button
              variant="destructive"
              disabled={revoking}
              onClick={handleConfirmRevoke}
            >
              {revoking ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldOff className="size-4" />
              )}
              เพิกถอน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
