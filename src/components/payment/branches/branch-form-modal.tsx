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
import type { Branch } from "@/types/originator";

const REGIONS = [
  "กรุงเทพฯ",
  "ภาคเหนือ",
  "ภาคใต้",
  "ภาคอีสาน",
  "ภาคตะวันออก",
  "ภาคตะวันตก",
  "ภาคกลาง",
];

interface BranchFormData {
  name: string;
  code: string;
  region: string;
  address: string;
  manager: string;
  phone: string;
  active: boolean;
}

interface BranchFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, editing mode; otherwise add mode */
  branch?: Branch;
  onSave: (data: BranchFormData) => void;
}

export function BranchFormModal({
  open,
  onOpenChange,
  branch,
  onSave,
}: BranchFormModalProps) {
  const isEdit = !!branch;

  const nameId = useId();
  const codeId = useId();
  const managerId = useId();
  const phoneId = useId();
  const regionId = useId();
  const addressId = useId();

  const [name, setName] = useState(branch?.name ?? "");
  const [code, setCode] = useState(branch?.code ?? "");
  const [region, setRegion] = useState(branch?.region ?? "กรุงเทพฯ");
  const [address, setAddress] = useState(branch?.address ?? "");
  const [manager, setManager] = useState(branch?.manager ?? "");
  const [phone, setPhone] = useState(branch?.phone ?? "");
  const [active, setActive] = useState(branch?.active !== false);
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  // Reset form when branch changes (open new vs edit)
  function resetForm() {
    setName(branch?.name ?? "");
    setCode(branch?.code ?? "");
    setRegion(branch?.region ?? "กรุงเทพฯ");
    setAddress(branch?.address ?? "");
    setManager(branch?.manager ?? "");
    setPhone(branch?.phone ?? "");
    setActive(branch?.active !== false);
    setErrors({});
  }

  function handleOpenChange(v: boolean) {
    if (!v) resetForm();
    onOpenChange(v);
  }

  function handleSave() {
    const newErrors: { name?: string; code?: string } = {};
    if (!name.trim()) newErrors.name = "กรุณาระบุชื่อสาขา";
    if (!code.trim()) newErrors.code = "กรุณาระบุรหัสสาขา";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      region,
      address: address.trim(),
      manager: manager.trim(),
      phone: phone.trim(),
      active,
    });
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "แก้ไขสาขา" : "เพิ่มสาขาใหม่"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "อัปเดตข้อมูลและสถานะของสาขา"
              : "สร้างสาขาใหม่เพื่อรองรับบุคลากรและธุรกรรม"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-1">
          {/* Name + Code */}
          <div className="grid grid-cols-[2fr_1fr] gap-3">
            <div className="flex flex-col gap-1.5">
              <Label id={nameId}>
                ชื่อสาขา <span className="text-destructive">*</span>
              </Label>
              <Input
                aria-labelledby={nameId}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="เช่น สาขาสุขุมวิท"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label id={codeId}>
                รหัส <span className="text-destructive">*</span>
              </Label>
              <Input
                aria-labelledby={codeId}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().slice(0, 3));
                  if (errors.code) setErrors((p) => ({ ...p, code: undefined }));
                }}
                maxLength={3}
                placeholder="SKV"
                className="font-mono uppercase"
                aria-invalid={!!errors.code}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code}</p>
              )}
            </div>
          </div>

          {/* Region */}
          <div className="flex flex-col gap-1.5">
            <Label id={regionId}>ภูมิภาค</Label>
            <Select value={region} onValueChange={(v) => { if (v !== null) setRegion(v); }}>
              <SelectTrigger aria-labelledby={regionId} className="w-full h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <Label id={addressId}>ที่อยู่</Label>
            <textarea
              aria-labelledby={addressId}
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
              className="min-h-0 w-full rounded-lg border border-grey-300 bg-transparent px-3.5 py-2.5 text-sm text-foreground transition-colors outline-0 focus:border-grey-800 placeholder:text-grey-500 resize-none"
            />
          </div>

          {/* Manager + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label id={managerId}>ผู้จัดการสาขา</Label>
              <Input
                aria-labelledby={managerId}
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                placeholder="ชื่อ-นามสกุล"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label id={phoneId}>โทรศัพท์</Label>
              <Input
                aria-labelledby={phoneId}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="02-xxx-xxxx"
                className="font-mono"
              />
            </div>
          </div>

          {/* Active checkbox (edit mode only) */}
          {isEdit && (
            <label className="flex items-center gap-2 text-sm pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="size-4 rounded border-grey-300 accent-primary"
              />
              เปิดใช้งานสาขานี้ (รับชำระเงินได้)
            </label>
          )}
        </div>

        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave}>
            <Check size={14} strokeWidth={2.5} />
            {isEdit ? "บันทึก" : "เพิ่มสาขา"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
