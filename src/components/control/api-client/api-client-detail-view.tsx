"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck, ShieldOff, Boxes, Loader2 } from "lucide-react";
import { useControlStore } from "@/lib/control/store";
import { apiClientsStore, revokeClient } from "@/lib/control/api-clients-store";
import { showControlToast } from "@/components/control/shared/control-toast";
import {
  STATUS_LABEL,
  statusTone,
  scopeLabel,
  maskSecret,
} from "@/lib/control/api-client";
import { MERCHANT_LABEL } from "@/lib/mock/merchants";
import { formatDateTime } from "@/lib/control/format";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/control-status-badge";
import { StatusSpine } from "@/components/control/shared/status-spine";
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
      <p className="text-h6 text-foreground">ไม่พบ API Client นี้</p>
      <p className="mt-1 text-sm text-grey-600">
        รหัส client อาจไม่ถูกต้องหรือถูกลบไปแล้ว
      </p>
    </div>
  );
}

export function ApiClientDetailView({ id }: { id?: string }) {
  const clients = useControlStore(apiClientsStore);
  const client = clients.find((c) => c.id === id);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  if (!client) return <NotFound />;

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
                Control plane · ไคลเอนต์ API
              </span>
              <h1 className="text-h5 text-foreground">{client.name}</h1>
              <p className="text-data mt-1 text-xs break-all text-grey-600">
                {client.clientId}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ControlStatusBadge
              tone={tone}
              label={STATUS_LABEL[currentStatus]}
            />
            <span className="inline-flex items-center gap-1 rounded-md bg-success/12 px-1.5 py-1 text-xs font-semibold text-success-dark">
              <ShieldCheck className="size-3.5" />
              OAuth2 · client-credentials
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--divider)] pt-5">
            <ReadField label="บริษัท" value={MERCHANT_LABEL[client.merchantId]} />
            <ReadField label="รหัส client" value={client.id} mono />
            <ReadField
              label="สร้างเมื่อ"
              value={formatDateTime(client.createdAt)}
              mono
            />
            <ReadField
              label="ใช้งานล่าสุด"
              value={formatDateTime(client.lastUsedAt)}
              mono
            />
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="flex flex-col gap-6 mmd:col-span-8">
        <DetailCard
          title="ข้อมูลทั่วไป"
          icon={<Boxes className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField label="ชื่อ" value={client.name} />
            <ReadField label="บริษัท" value={MERCHANT_LABEL[client.merchantId]} />
            <ReadField
              label="รหัสไคลเอนต์"
              value={client.clientId}
              mono
              className="sm:col-span-2"
            />
            <ReadField
              label="สร้างเมื่อ"
              value={formatDateTime(client.createdAt)}
              mono
            />
            <ReadField
              label="ใช้งานล่าสุด"
              value={formatDateTime(client.lastUsedAt)}
              mono
            />
            <ReadField label="สถานะ" value={STATUS_LABEL[currentStatus]} />
          </div>
        </DetailCard>

        <DetailCard
          title="ขอบเขตสิทธิ์"
          icon={<ShieldCheck className="size-5 text-grey-600" />}
        >
          <p className="mb-4 text-sm text-grey-600">
            สิทธิ์ที่ client นี้เรียกใช้งานผ่าน API ได้ —
            จำกัดเฉพาะ scope ที่ได้รับอนุมัติ
          </p>
          <div className="flex flex-wrap gap-1.5">
            {client.scopes.map((s) => (
              <Badge key={s} variant="outline" title={scopeLabel(s)}>
                {s}
              </Badge>
            ))}
          </div>
        </DetailCard>

        <DetailCard
          title="ที่เก็บข้อมูลลับ"
          icon={<KeyRound className="size-5 text-grey-600" />}
        >
          <p className="mb-4 text-sm text-grey-600">
            Client secret ถูกเก็บใน vault — แสดงแบบปิดบังเท่านั้น
            ค่าจริงแสดงเต็มครั้งเดียวตอนสร้าง เก็บไว้ให้ปลอดภัย
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ReadField
              label="คีย์ลับไคลเอนต์"
              value={maskSecret(client.clientSecret)}
              mono
            />
          </div>
          <div className="mt-5 border-t border-[var(--divider)] pt-5">
            <p className="mb-3 text-xs text-grey-600">
              การเพิกถอน client จะตัดการเข้าถึง API ทันทีและย้อนกลับไม่ได้
            </p>
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
        </DetailCard>
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
    </div>
  );
}
