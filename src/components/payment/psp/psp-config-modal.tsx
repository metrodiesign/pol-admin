"use client";

import { useId, useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import { useToast } from "@/components/payment/toast/toast-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PspConfig } from "@/types/psp";

interface PspConfigModalProps {
  psp: PspConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, patch: Partial<PspConfig>) => void;
}

export function PspConfigModal({
  psp,
  open,
  onOpenChange,
  onSave,
}: PspConfigModalProps) {
  const [merchantId, setMerchantId] = useState(psp?.merchantId ?? "");
  const [apiKey, setApiKey] = useState(psp?.apiKey ?? "");
  const [feeCard, setFeeCard] = useState("2.5");
  const [feeQr, setFeeQr] = useState("0.8");
  const [feeInstall, setFeeInstall] = useState("3.2");
  const [settlement, setSettlement] = useState(psp?.settlement ?? "T+2");
  const [primary, setPrimary] = useState(psp?.primary ?? false);
  const merchantIdId = useId();
  const apiKeyId = useId();
  const feeCardId = useId();
  const feeQrId = useId();
  const feeInstallId = useId();
  const toast = useToast();

  // Reset local state when PSP changes (modal re-opens for different PSP)
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && psp) {
      setMerchantId(psp.merchantId);
      setApiKey(psp.apiKey);
      setSettlement(psp.settlement);
      setPrimary(psp.primary);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    if (!psp) return;
    onSave(psp.id, {
      merchantId,
      apiKey,
      settlement,
      primary,
      fees: `บัตร ${feeCard}% / QR ${feeQr}% / ผ่อน ${feeInstall}%`,
    });
    toast.success("บันทึกการตั้งค่าแล้ว");
    onOpenChange(false);
  };

  if (!psp) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>ตั้งค่า {psp.label}</DialogTitle>
          <DialogDescription>
            Credentials, ค่าธรรมเนียม, รอบกระทบยอด
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Credentials */}
          <div className="flex flex-col gap-1.5">
            <Label id={merchantIdId}>Merchant ID</Label>
            <Input
              aria-labelledby={merchantIdId}
              className="font-mono"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label id={apiKeyId}>API Key</Label>
            <div className="flex gap-2">
              <Input
                aria-labelledby={apiKeyId}
                className="font-mono flex-1"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setApiKey(`sk_live_${psp.id}_••••••••••••${Math.random().toString(36).slice(-4)}`);
                  toast.success("หมุน API Key แล้ว");
                }}
              >
                <RefreshCw className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Fees */}
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-grey-500">
            อัตราค่าธรรมเนียม (%)
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label id={feeCardId}>บัตรเครดิต/เดบิต</Label>
              <Input
                aria-labelledby={feeCardId}
                className="tabular-nums"
                value={feeCard}
                onChange={(e) => setFeeCard(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label id={feeQrId}>QR PromptPay</Label>
              <Input
                aria-labelledby={feeQrId}
                className="tabular-nums"
                value={feeQr}
                onChange={(e) => setFeeQr(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label id={feeInstallId}>ผ่อนชำระ</Label>
              <Input
                aria-labelledby={feeInstallId}
                className="tabular-nums"
                value={feeInstall}
                onChange={(e) => setFeeInstall(e.target.value)}
              />
            </div>
          </div>

          {/* Settlement */}
          <div className="flex flex-col gap-1.5">
            <Label>รอบกระทบยอด (Settlement)</Label>
            <Select value={settlement} onValueChange={(v) => { if (v !== null) setSettlement(v); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="T+1">T+1 (วันถัดไป)</SelectItem>
                <SelectItem value="T+2">T+2 (2 วันทำการ)</SelectItem>
                <SelectItem value="T+3">T+3 (3 วันทำการ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary"
              checked={primary}
              onChange={(e) => setPrimary(e.target.checked)}
            />
            <span>
              ใช้เป็น PSP หลัก (ถูกเลือกก่อนเสมอเมื่อไม่มีกฎ routing บังคับ)
            </span>
          </label>
        </div>

        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave}>
            <Check className="size-3.5" />
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
