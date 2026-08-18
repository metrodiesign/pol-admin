"use client";

import { useState } from "react";
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
}

export function UserEditFormCard({
  initialData,
  onSave,
  submitLabel = "Save changes",
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

  return (
    <div
      className="rounded-card bg-card p-6"
      style={{
        boxShadow:
          "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="Full name"
            value={form.fullName}
            onChange={(v) => update("fullName", v)}
          />
          <TextField
            label="Email address"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
          />

          <TextField
            label="Phone number"
            type="tel"
            placeholder="Enter phone number"
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
                  aria-label="Clear phone number"
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
            label="State/region"
            value={form.stateRegion}
            onChange={(v) => update("stateRegion", v)}
          />
          <TextField
            label="City"
            value={form.city}
            onChange={(v) => update("city", v)}
          />
          <TextField
            label="Address"
            value={form.address}
            onChange={(v) => update("address", v)}
          />
          <TextField
            label="Zip/code"
            value={form.zipCode}
            onChange={(v) => update("zipCode", v)}
          />
          <TextField
            label="Company"
            value={form.company}
            onChange={(v) => update("company", v)}
          />
          <TextField
            label="Role"
            value={form.role}
            onChange={(v) => update("role", v)}
          />
        </div>

        <div className="mt-6 flex flex-col items-end">
          <button
            type="submit"
            className="h-9 rounded-control bg-grey-800 px-3 text-sm font-bold text-white transition-colors hover:bg-grey-900 dark:bg-white dark:text-grey-900 dark:hover:bg-grey-300"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
