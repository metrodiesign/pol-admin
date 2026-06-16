"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/payment/confirm-modal";
import { ShieldCheck, Shield, Copy, Eye, EyeOff, RefreshCw, Check } from "lucide-react";
import { useToast } from "@/components/payment/toast/toast-provider";

const PUBLIC_KEY = "pk_live_centropay_a8b9c2d4e5f6g7h8i9j0k1l2m3n4";
const SECRET_KEY_MASKED = "sk_live_••••••••••••••••••••••••8d27";
const SECRET_KEY_REVEALED = "sk_live_centropay_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f";

export function ApiKeysCard() {
  const toast = useToast();
  const [publicCopied, setPublicCopied] = useState(false);
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [rotateOpen, setRotateOpen] = useState(false);
  const [rotated, setRotated] = useState(false);

  async function copyPublicKey() {
    try {
      await navigator.clipboard.writeText(PUBLIC_KEY);
      setPublicCopied(true);
      toast.success("คัดลอก Public Key แล้ว");
      setTimeout(() => setPublicCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  function handleRevealToggle() {
    if (!secretRevealed) {
      toast.info("แสดง Secret Key แล้ว");
    }
    setSecretRevealed((v) => !v);
  }

  function handleRotate() {
    setRotated(true);
    setSecretRevealed(false);
    setRotateOpen(false);
    toast.success("หมุน secret แล้ว");
  }

  return (
    <>
      <Card>
        <CardHeader className="border-b border-[rgba(145,158,171,0.12)]">
          <CardTitle>API Keys (Live)</CardTitle>
          <CardDescription>
            ใช้สำหรับการเรียก CentroPay API จากแอปองค์กร
          </CardDescription>
        </CardHeader>

        <CardContent className="py-4 space-y-3">
          {/* Publishable Key */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-success/12">
              <ShieldCheck className="size-5 text-success-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">
                Publishable Key (Public)
              </p>
              <code className="font-mono text-xs text-foreground break-all">
                {PUBLIC_KEY}
              </code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyPublicKey}
              title="คัดลอก Public Key"
            >
              {publicCopied ? (
                <Check className="size-3.5 text-success-dark" />
              ) : (
                <Copy />
              )}
              {publicCopied ? "คัดลอกแล้ว" : "คัดลอก"}
            </Button>
          </div>

          {/* Secret Key */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-warning/12">
              <Shield className="size-5 text-warning-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">
                Secret Key · ใช้เฉพาะฝั่ง server
              </p>
              <code className="font-mono text-xs text-foreground break-all">
                {secretRevealed
                  ? rotated
                    ? "sk_live_centropay_NEW_KEY_••••••••••••"
                    : SECRET_KEY_REVEALED
                  : SECRET_KEY_MASKED}
              </code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevealToggle}
              title={secretRevealed ? "ซ่อน Secret Key" : "แสดง Secret Key"}
            >
              {secretRevealed ? <EyeOff /> : <Eye />}
              {secretRevealed ? "ซ่อน" : "แสดง"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotateOpen(true)}
            >
              <RefreshCw />
              หมุน Key
            </Button>
          </div>

          {/* Info note */}
          <div className="rounded-lg border border-warning/30 bg-warning/5 px-3.5 py-2.5">
            <p className="text-xs text-warning-dark leading-relaxed">
              <strong>ข้อควรระวัง:</strong> Secret Key ต้องเก็บไว้เฉพาะฝั่ง
              server เท่านั้น ห้ามใส่ใน client-side code หรือ repository สาธารณะ
            </p>
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        open={rotateOpen}
        onOpenChange={setRotateOpen}
        title="หมุน Secret Key"
        description="ระบบจะออก key ใหม่ — key เดิมยังใช้งานได้อีก 24 ชั่วโมง จากนั้นจะถูกปิดใช้งานทันที"
        confirmLabel="หมุน Key"
        onConfirm={handleRotate}
      />
    </>
  );
}
