"use client";

import { useId, useState } from "react";
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
import type { Agent, Branch } from "@/types/originator";
import { Shield, User, Briefcase } from "lucide-react";

interface AgentFormModalProps {
  /** If provided, the modal is in edit mode */
  agent?: Agent;
  /** Lock the branch (e.g. when adding from a branch detail) */
  fixedBranchId?: string;
  branches: Branch[];
  onClose: () => void;
  onSave: (data: Omit<Agent, "id" | "txnCount" | "volume" | "code">) => void;
}

const TYPE_OPTIONS = [
  { value: "staff" as const, label: "พนักงานประจำสาขา", icon: Shield },
  { value: "agent" as const, label: "ตัวแทน", icon: User },
  { value: "broker" as const, label: "นายหน้า", icon: Briefcase },
] as const;

const REGIONS = [
  "กรุงเทพฯ",
  "ปทุมธานี",
  "นนทบุรี",
  "เชียงใหม่",
  "ภูเก็ต",
  "ขอนแก่น",
  "ภาคเหนือ",
  "ภาคใต้",
  "ภาคอีสาน",
  "ภาคตะวันออก",
];

export function AgentFormModal({
  agent,
  fixedBranchId,
  branches,
  onClose,
  onSave,
}: AgentFormModalProps) {
  const isEdit = !!agent;

  const nameId = useId();
  const licenseId = useId();

  const [type, setType] = useState<Agent["type"]>(agent?.type ?? "staff");
  const [name, setName] = useState(agent?.name ?? "");
  const [license, setLicense] = useState(agent?.license ?? "");
  const [region, setRegion] = useState(agent?.region ?? "กรุงเทพฯ");
  const [parentId, setParentId] = useState(
    agent?.parent ?? fixedBranchId ?? (branches[0]?.id ?? ""),
  );
  const [active, setActive] = useState(agent?.active ?? true);
  const [joined] = useState(agent?.joined ?? "2567");

  const [nameError, setNameError] = useState(false);

  const save = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onSave({ type, name: name.trim(), license, region, parent: parentId, active, joined });
    onClose();
  };

  const licenseLabel = type === "staff" ? "รหัสพนักงาน" : "เลขใบอนุญาต";
  const licensePlaceholder =
    type === "staff" ? "EMP-xxxx-xxxx" : type === "agent" ? "L-xxxx-xxxxx" : "B-xxxx-xxxxx";

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[560px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มพนักงาน / ตัวแทน / นายหน้า"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "อัปเดตข้อมูลและสังกัดของบุคลากร"
              : "เพิ่มบุคลากรใหม่เข้าสู่สาขาที่กำหนด"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Type selector */}
          <div>
            <Label className="mb-2 block">ประเภท</Label>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center gap-2 rounded-[9px] border-[1.5px] px-2.5 py-2.5 transition-colors",
                    type === value
                      ? "border-primary bg-primary/5"
                      : "border-[rgba(145,158,171,0.2)] bg-grey-100/50 hover:border-[rgba(145,158,171,0.4)] dark:bg-grey-800/20",
                  )}
                >
                  <input
                    type="radio"
                    name="agent-type"
                    value={value}
                    checked={type === value}
                    onChange={() => setType(value)}
                    className="sr-only"
                  />
                  <Icon className="size-3.5 shrink-0" />
                  <span className="text-sm font-semibold">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label className="mb-1 block" id={nameId}>
              ชื่อ - นามสกุล <span className="text-error">*</span>
            </Label>
            <Input
              aria-labelledby={nameId}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(false);
              }}
              placeholder={type === "broker" ? "ชื่อบริษัทนายหน้า" : "ชื่อ-นามสกุล"}
              className={cn(nameError && "border-error")}
            />
            {nameError && (
              <p className="mt-1 text-xs text-error">กรุณาระบุชื่อ</p>
            )}
          </div>

          {/* License + Region */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block" id={licenseId}>
                {licenseLabel}
              </Label>
              <Input
                aria-labelledby={licenseId}
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder={licensePlaceholder}
                className="font-mono"
              />
            </div>
            <div>
              <Label className="mb-1 block" id="agent-region">
                พื้นที่ดูแล
              </Label>
              <Select value={region} onValueChange={(v) => { if (v != null) setRegion(v); }}>
                <SelectTrigger aria-labelledby="agent-region" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Branch */}
          <div>
            <Label className="mb-1 block" id="agent-branch">
              สังกัดสาขา
            </Label>
            <Select
              value={parentId}
              onValueChange={(v) => { if (v != null) setParentId(v); }}
              disabled={!!fixedBranchId}
            >
              <SelectTrigger aria-labelledby="agent-branch" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    [{b.code}] {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fixedBranchId && (
              <p className="mt-1 text-xs text-grey-500">เพิ่มเข้าสาขาที่เลือกอยู่</p>
            )}
          </div>

          {/* Active toggle (edit only) */}
          {isEdit && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded"
              />
              เปิดใช้งานบัญชีนี้
            </label>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={save}>
            {isEdit ? "บันทึก" : "เพิ่มบุคลากร"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
