"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { PspRoutingRule } from "@/types/psp";
import { PSP_CONFIGS } from "@/lib/mock/psp";

type AmountOp = "any" | "gte" | "lt";

interface RoutingRuleModalProps {
  rule: PspRoutingRule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<PspRoutingRule, "id" | "priority" | "label">) => void;
}

const CHANNEL_OPTIONS = [
  { value: "any", label: "ใดๆ" },
  { value: "card", label: "บัตรเครดิต/เดบิต" },
  { value: "qr", label: "QR PromptPay" },
  { value: "installment", label: "ผ่อนชำระ" },
  { value: "wallet", label: "E-Wallet" },
];

function buildWhenString(
  channel: string,
  amountOp: AmountOp,
  amountVal: string,
): string {
  const chanLabel =
    CHANNEL_OPTIONS.find((c) => c.value === channel)?.label ?? channel;
  const channelPart =
    channel === "any" ? "อื่นๆ ทั้งหมด" : `ช่องทาง = ${chanLabel}`;
  if (amountOp === "any") return channelPart;
  const op = amountOp === "gte" ? "≥" : "<";
  const formatted = Number(amountVal).toLocaleString("th-TH");
  return `${channelPart} AND ยอด ${op} ฿${formatted}`;
}

export function RoutingRuleModal({
  rule,
  open,
  onOpenChange,
  onSave,
}: RoutingRuleModalProps) {
  const isEdit = !!rule;
  const nameId = useId();
  const [name, setName] = useState(rule?.name ?? "");
  const [channel, setChannel] = useState("card");
  const [amountOp, setAmountOp] = useState<AmountOp>("any");
  const [amountVal, setAmountVal] = useState("50000");
  const [target, setTarget] = useState(rule?.then ?? "2C2P");
  const [enabled, setEnabled] = useState(rule?.enabled !== false);

  // Reset when dialog opens for new rule
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && !rule) {
      setName("");
      setChannel("card");
      setAmountOp("any");
      setAmountVal("50000");
      setTarget("2C2P");
      setEnabled(true);
    } else if (nextOpen && rule) {
      setName(rule.name);
      setTarget(rule.then);
      setEnabled(rule.enabled);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const when = buildWhenString(channel, amountOp, amountVal);
    onSave({ name: name.trim(), when, then: target, enabled });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไขกฎ Routing" : "เพิ่มกฎ Routing ใหม่"}
          </DialogTitle>
          <DialogDescription>กำหนดเงื่อนไขและ PSP ปลายทาง</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Rule name */}
          <div className="flex flex-col gap-1.5">
            <Label id={nameId}>
              ชื่อกฎ <span className="text-error">*</span>
            </Label>
            <Input
              aria-labelledby={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ผ่อนชำระ → 2C2P"
            />
          </div>

          {/* Condition section */}
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-grey-500">
            เงื่อนไข (IF)
          </p>

          <div className="flex flex-col gap-1.5">
            <Label>ช่องทาง</Label>
            <Select value={channel} onValueChange={(v) => { if (v !== null) setChannel(v); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>เงื่อนไขยอดเงิน</Label>
            <div className="flex gap-2">
              <Select
                value={amountOp}
                onValueChange={(v) => { if (v !== null) setAmountOp(v as AmountOp); }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">ไม่จำกัด</SelectItem>
                  <SelectItem value="gte">มากกว่าหรือเท่ากับ</SelectItem>
                  <SelectItem value="lt">น้อยกว่า</SelectItem>
                </SelectContent>
              </Select>
              {amountOp !== "any" && (
                <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-input bg-background px-3">
                  <span className="text-sm font-semibold text-grey-500">
                    ฿
                  </span>
                  <input
                    aria-label="จำนวนเงิน (บาท)"
                    className="w-full bg-transparent text-sm tabular-nums outline-none placeholder:text-grey-500"
                    value={amountVal}
                    onChange={(e) => setAmountVal(e.target.value)}
                    placeholder="50000"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action section */}
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-grey-500">
            การทำงาน (THEN)
          </p>

          <div className="flex flex-col gap-1.5">
            <Label>ส่งไปยัง PSP</Label>
            <div className="flex gap-2">
              {PSP_CONFIGS.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center gap-2 rounded-[9px] border-[1.5px] px-3 py-2.5 transition-colors",
                    target === p.name
                      ? "border-primary bg-primary/5"
                      : "border-input bg-grey-500/5 hover:border-grey-500/30",
                  )}
                >
                  <input
                    type="radio"
                    name="rule-target"
                    className="accent-primary"
                    checked={target === p.name}
                    onChange={() => setTarget(p.name)}
                  />
                  <span className="text-sm font-semibold">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 pt-1 text-sm">
            <input
              type="checkbox"
              className="accent-primary"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            เปิดใช้งานกฎนี้
          </label>
        </div>

        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            <Check className="size-3.5" />
            {isEdit ? "บันทึก" : "เพิ่มกฎ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
