"use client";

import { useId } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

/**
 * Searchable select rendered in the "with label" layout: a static label above a
 * single-line outlined box that filters its options as you type, matching the
 * TextField and CountrySelect used across the user forms.
 */
export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
}: SelectFieldProps) {
  const id = useId();
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(v) => onChange(v?.value ?? "")}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        <label id={id} className="text-sm font-medium text-grey-800">
          {label}
        </label>
        <ComboboxInput
          aria-labelledby={id}
          placeholder={placeholder}
          className={cn(
            "h-12 rounded-control border-[var(--divider)] text-[15px]",
            "focus-within:border-grey-800 focus-within:ring-1 focus-within:ring-inset focus-within:ring-grey-800",
            "[&_[data-slot=input-group-control]]:pl-3.5 [&_[data-slot=input-group-control]]:text-[15px]",
          )}
        />
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No results</ComboboxEmpty>
        <ComboboxList>
          {(item: SelectOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
