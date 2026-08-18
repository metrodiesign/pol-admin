"use client";

import {
  Combobox,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { CountryFlag } from "@/components/form/country-flag";
import { PHONE_COUNTRIES, type PhoneCountry } from "@/lib/phone-countries";

interface PhoneCountrySelectProps {
  /** Selected ISO 3166-1 alpha-2 (lowercase). */
  value: string;
  onChange: (iso2: string) => void;
}

/**
 * Phone calling-code picker: a flag button (in the phone field adornment) that
 * opens a searchable dropdown of every country with round flag, name, ISO code
 * and dial code — built on the shared shadcn Combobox.
 */
export function PhoneCountrySelect({ value, onChange }: PhoneCountrySelectProps) {
  const selected = PHONE_COUNTRIES.find((c) => c.iso2 === value) ?? null;

  return (
    <Combobox
      items={PHONE_COUNTRIES}
      value={selected}
      onValueChange={(c) => onChange(c?.iso2 ?? "")}
      isItemEqualToValue={(a, b) => a.iso2 === b.iso2}
      itemToStringLabel={(c) => c.name}
      filter={(c, query) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.iso2.includes(q) ||
          c.dialCode.includes(q)
        );
      }}
    >
      <ComboboxTrigger
        aria-label="Select country calling code"
        className="flex items-center gap-1 text-grey-700 outline-none [&>svg]:text-grey-500"
      >
        <CountryFlag iso2={selected?.iso2} />
      </ComboboxTrigger>
      <ComboboxContent className="w-[320px] min-w-[320px]">
        <ComboboxInput placeholder="Search..." showTrigger={false} />
        <ComboboxEmpty>No results</ComboboxEmpty>
        <ComboboxList className="max-h-[300px]">
          {(c: PhoneCountry) => (
            <ComboboxItem key={c.iso2} value={c} className="gap-2 pl-2">
              <CountryFlag iso2={c.iso2} />
              <span className="flex-1 truncate">
                {c.name} ({c.iso2.toUpperCase()})
              </span>
              <span className="text-grey-500">+{c.dialCode}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
