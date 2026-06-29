"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { TextField } from "@/components/form/text-field";
import { CountrySelect } from "@/components/form/country-select";
import { PhoneCountrySelect } from "@/components/form/phone-country-select";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import { DEFAULT_PHONE_ISO } from "@/lib/phone-countries";

interface UserFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  stateRegion: string;
  city: string;
  address: string;
  zipCode: string;
  company: string;
  role: string;
}

interface UserEditFormCardProps {
  initialData: UserFormData;
  onSave?: (data: UserFormData) => void;
  submitLabel?: string;
  /** View-only: render values as plain text (no inputs), no submit button. */
  readOnly?: boolean;
  /** When set, render a Cancel button linking back to this path. */
  cancelHref?: string;
}

const cancelClass =
  "inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

export function UserEditFormCard({
  initialData,
  onSave,
  submitLabel = "บันทึกการเปลี่ยนแปลง",
  readOnly = false,
  cancelHref,
}: UserEditFormCardProps) {
  const [form, setForm] = useState<UserFormData>(initialData);
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_PHONE_ISO);

  function update(field: keyof UserFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave?.(form);
  }

  if (readOnly) {
    const rows: Array<[string, string]> = [
      ["ชื่อ-นามสกุล", form.fullName],
      ["อีเมล", form.email],
      ["เบอร์โทรศัพท์", form.phoneNumber],
      ["ประเทศ", form.country],
      ["รัฐ/ภูมิภาค", form.stateRegion],
      ["เมือง", form.city],
      ["ที่อยู่", form.address],
      ["รหัสไปรษณีย์", form.zipCode],
      ["บริษัท", form.company],
      ["บทบาท", form.role],
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
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="ชื่อ-นามสกุล"
            value={form.fullName}
            onChange={(v) => update("fullName", v)}
          />
          <TextField
            label="อีเมล"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
          />

          <TextField
            label="เบอร์โทรศัพท์"
            type="tel"
            placeholder="กรอกเบอร์โทรศัพท์"
            value={form.phoneNumber}
            onChange={(v) => update("phoneNumber", v)}
            startAdornment={
              <PhoneCountrySelect value={phoneCountry} onChange={setPhoneCountry} />
            }
            endAdornment={
              form.phoneNumber ? (
                <button
                  type="button"
                  onClick={() => update("phoneNumber", "")}
                  className="text-grey-400 transition-colors hover:text-grey-600"
                  aria-label="ล้างเบอร์โทรศัพท์"
                >
                  <X className="size-4" />
                </button>
              ) : undefined
            }
          />

          <CountrySelect
            value={form.country}
            onChange={(v) => update("country", v)}
            options={COUNTRY_OPTIONS}
          />

          <TextField
            label="รัฐ/ภูมิภาค"
            value={form.stateRegion}
            onChange={(v) => update("stateRegion", v)}
          />
          <TextField
            label="เมือง"
            value={form.city}
            onChange={(v) => update("city", v)}
          />
          <TextField
            label="ที่อยู่"
            value={form.address}
            onChange={(v) => update("address", v)}
          />
          <TextField
            label="รหัสไปรษณีย์"
            value={form.zipCode}
            onChange={(v) => update("zipCode", v)}
          />
          <TextField
            label="บริษัท"
            value={form.company}
            onChange={(v) => update("company", v)}
          />
          <TextField
            label="บทบาท"
            value={form.role}
            onChange={(v) => update("role", v)}
          />
        </div>

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
