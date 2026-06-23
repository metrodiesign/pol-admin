"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { TextField } from "@/components/form/text-field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PERSON_TYPE_LABEL,
  type ProducerFormData,
  type ProducerPersonType,
} from "@/types/producer";
import {
  validateProducerForm,
  type ProducerFormErrors,
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
    const errs = validateProducerForm(form, {
      requireAcceptTerms: showAcceptTerms,
    });
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave?.(form);
  }

  if (readOnly) {
    const rows: Array<[string, string]> = [
      ["ชื่อ", form.firstName],
      ["นามสกุล", form.lastName],
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
              <dd className="text-[15px] text-foreground">{value || "-"}</dd>
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
                className="flex cursor-pointer items-center gap-2 text-[15px] text-foreground"
              >
                <input
                  type="radio"
                  name="personType"
                  value={pt}
                  checked={form.personType === pt}
                  onChange={() => update("personType", pt)}
                  className="size-4 accent-grey-800"
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
            label="ชื่อ"
            required
            value={form.firstName}
            onChange={(v) => update("firstName", v)}
            error={errors.firstName}
          />
          <TextField
            label="นามสกุล"
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
            label="หมายเลขโทรศัพท์ (ยืนยัน OTP)"
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
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={form.acceptTerms}
                onChange={(c) => update("acceptTerms", c)}
                error={Boolean(errors.acceptTerms)}
                aria-label="ยอมรับเงื่อนไขการใช้บริการ"
              />
              ยอมรับเงื่อนไขการใช้บริการ
            </label>
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
