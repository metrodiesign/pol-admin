"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { TextField } from "@/components/form/text-field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PERSON_TYPE_LABEL,
  type ProducerFormData,
  type ProducerPersonType,
} from "@/types/producer";
import {
  validateProducerForm,
  validateRegisterForm,
  type ProducerFormErrors,
  type RegisterFormErrors,
} from "@/lib/producer/producer-validation";

interface ProducerEditFormCardProps {
  initialData: ProducerFormData;
  onSave?: (data: ProducerFormData) => void;
  submitLabel?: string;
  /** View-only: render values as plain text (no inputs), no submit button. */
  readOnly?: boolean;
  /** When set, render a Cancel button linking back to this path. */
  cancelHref?: string;
  /** create (registration) only: show + require the accept-terms checkbox. */
  showAcceptTerms?: boolean;
  /**
   * Public registration only (REQ-11.6): bind photo into validation. When set,
   * submit validates with `validateRegisterForm` and reports the photo error via
   * `onError` (the page renders it under its own `AvatarUpload`). Omitted on admin
   * pages → unchanged `validateProducerForm` behavior (REQ-11.8).
   */
  photo?: {
    value: File | null;
    onError: (message?: string) => void;
  };
}

const cancelClass =
  "inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

const PERSON_TYPES: ProducerPersonType[] = ["individual", "juristic"];

export function ProducerEditFormCard({
  initialData,
  onSave,
  submitLabel = "บันทึก",
  readOnly = false,
  cancelHref,
  showAcceptTerms = false,
  photo,
}: ProducerEditFormCardProps) {
  const [form, setForm] = useState<ProducerFormData>(initialData);
  const [errors, setErrors] = useState<ProducerFormErrors>({});

  function update<K extends keyof ProducerFormData>(
    field: K,
    value: ProducerFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (photo) {
      // REQ-11.6: photo bound into validation; report its error to the page,
      // keep field errors in local state.
      const { photo: photoErr, ...fieldErrs }: RegisterFormErrors =
        validateRegisterForm({ ...form, photo: photo.value });
      setErrors(fieldErrs);
      photo.onError(photoErr);
      if (!photoErr && Object.keys(fieldErrs).length === 0) onSave?.(form);
      return;
    }
    const errs = validateProducerForm(form, {
      requireAcceptTerms: showAcceptTerms,
    });
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave?.(form);
  }

  if (readOnly) {
    const isJuristic = form.personType === "juristic";
    const rows: Array<[string, string]> = [
      [isJuristic ? "ชื่อบริษัท" : "ชื่อ", form.firstName],
      [isJuristic ? "สาขา" : "นามสกุล", form.lastName],
      ["ประเภทบุคคล", PERSON_TYPE_LABEL[form.personType]],
      ["เลขบัตรประชาชน/เลขผู้เสียภาษี", form.idNumber],
      ["รหัสตัวแทน", form.producerCode],
      ["เลขที่ใบอนุญาตตัวแทน", form.licenseNumber],
      ["หมายเลขโทรศัพท์", form.phoneNumber],
      ["อีเมล", form.email],
    ];

    return (
      <div className="rounded-card bg-card p-6" style={cardStyle}>
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="text-sm font-medium text-grey-600">{label}</dt>
              <dd className="text-sm text-foreground">{value || "-"}</dd>
            </div>
          ))}
        </dl>

        {cancelHref && (
          <div className="mt-6 flex justify-end">
            <Link href={cancelHref} className={cancelClass}>
              ยกเลิก
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-card bg-card p-6" style={cardStyle}>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-medium text-grey-800">
            ประเภทบุคคล <span className="text-error">*</span>
          </legend>
          <div className="flex gap-6">
            {PERSON_TYPES.map((pt) => (
              <label
                key={pt}
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="radio"
                  name="personType"
                  value={pt}
                  checked={form.personType === pt}
                  onChange={() => update("personType", pt)}
                  className="size-6 accent-grey-800"
                />
                {PERSON_TYPE_LABEL[pt]}
              </label>
            ))}
          </div>
          {errors.personType && (
            <p className="mt-1 text-xs text-error">{errors.personType}</p>
          )}
        </fieldset>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label={form.personType === "juristic" ? "ชื่อบริษัท" : "ชื่อ"}
            required
            value={form.firstName}
            onChange={(v) => update("firstName", v)}
            error={errors.firstName}
          />
          <TextField
            label={form.personType === "juristic" ? "สาขา" : "นามสกุล"}
            required
            value={form.lastName}
            onChange={(v) => update("lastName", v)}
            error={errors.lastName}
          />
          <TextField
            label="เลขบัตรประชาชน/เลขผู้เสียภาษี"
            required
            placeholder="ตัวเลข 13 หลัก"
            value={form.idNumber}
            onChange={(v) => update("idNumber", v)}
            error={errors.idNumber}
          />
          <TextField
            label="รหัสตัวแทน"
            required
            value={form.producerCode}
            onChange={(v) => update("producerCode", v)}
            error={errors.producerCode}
          />
          <TextField
            label="เลขที่ใบอนุญาตตัวแทน"
            value={form.licenseNumber}
            onChange={(v) => update("licenseNumber", v)}
            error={errors.licenseNumber}
            helperText={
              form.personType === "individual"
                ? "ตัวเลข 10 หลัก (กรณีบุคคลธรรมดา)"
                : "ระบุได้อิสระ (กรณีนิติบุคคล)"
            }
          />
          <TextField
            label="หมายเลขโทรศัพท์"
            type="tel"
            required
            placeholder="ตัวเลข 10 หลัก"
            value={form.phoneNumber}
            onChange={(v) => update("phoneNumber", v)}
            error={errors.phoneNumber}
            endAdornment={
              form.phoneNumber ? (
                <button
                  type="button"
                  onClick={() => update("phoneNumber", "")}
                  className="text-grey-400 transition-colors hover:text-grey-600"
                  aria-label="ล้างหมายเลขโทรศัพท์"
                >
                  <X className="size-4" />
                </button>
              ) : undefined
            }
          />
          <TextField
            label="อีเมล"
            type="email"
            required
            value={form.email}
            onChange={(v) => update("email", v)}
            error={errors.email}
          />
        </div>

        {showAcceptTerms && (
          <div className="mt-5">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={form.acceptTerms}
                  onChange={(c) => update("acceptTerms", c)}
                  error={Boolean(errors.acceptTerms)}
                  aria-label="ยอมรับเงื่อนไขการใช้บริการ"
                />
                ยอมรับเงื่อนไขการใช้บริการ
              </label>
              <Dialog>
                <DialogTrigger
                  render={
                    <button
                      type="button"
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                    />
                  }
                >
                  อ่าน
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>เงื่อนไขการใช้บริการ</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 text-sm leading-relaxed text-muted-foreground">
                    <p>
                      1. ผู้สมัครรับรองว่าข้อมูลที่ให้ไว้ในการลงทะเบียนเป็นความจริง
                      ถูกต้อง และเป็นปัจจุบันทุกประการ
                    </p>
                    <p>
                      2. ผู้สมัครยินยอมให้บริษัทเก็บรวบรวม ใช้
                      และเปิดเผยข้อมูลส่วนบุคคลเพื่อวัตถุประสงค์ในการพิจารณาอนุมัติ
                      และการให้บริการตามที่กฎหมายกำหนด
                    </p>
                    <p>
                      3. การลงทะเบียนจะมีผลสมบูรณ์เมื่อได้รับการอนุมัติจากผู้ดูแลระบบ
                      บริษัทขอสงวนสิทธิ์ในการปฏิเสธคำขอโดยไม่จำเป็นต้องแจ้งเหตุผล
                    </p>
                    <p>
                      4. ผู้สมัครตกลงปฏิบัติตามระเบียบ ข้อบังคับ
                      และจรรยาบรรณตัวแทน/นายหน้าประกันภัยที่บริษัทกำหนด
                      รวมถึงกฎหมายที่เกี่ยวข้อง
                    </p>
                    <p>
                      5. บริษัทอาจปรับปรุงเงื่อนไขการใช้บริการได้
                      โดยจะแจ้งให้ทราบผ่านช่องทางที่เหมาะสม
                      และการใช้บริการต่อถือเป็นการยอมรับเงื่อนไขที่ปรับปรุงแล้ว
                    </p>
                  </div>
                  <DialogFooter showCloseButton />
                </DialogContent>
              </Dialog>
            </div>
            {errors.acceptTerms && (
              <p className="mt-1 text-xs text-error">{errors.acceptTerms}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          {cancelHref && (
            <Link href={cancelHref} className={cancelClass}>
              ยกเลิก
            </Link>
          )}
          <button
            type="submit"
            className="inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-grey-800 px-3 text-sm font-bold text-white transition-colors hover:bg-grey-900 dark:bg-white dark:text-grey-900 dark:hover:bg-grey-300"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
