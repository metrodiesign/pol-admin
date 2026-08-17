"use client";

import { useId } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { CountryFlag } from "@/components/form/country-flag";
import { cn } from "@/lib/utils";

interface CountryOption {
  value: string;
  iso2: string;
}

interface CountrySelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: CountryOption[];
  className?: string;
}

/**
 * Country select rendered in the "with label" layout: a static label above a
 * searchable outlined box (flag prefix of the selected country + trailing
 * chevron) that filters its options as you type, matching the SelectField and
 * TextField used across the user forms.
 */
export function CountrySelect({
  label = "ประเทศ",
  value,
  onChange,
  options,
  className,
}: CountrySelectProps) {
  const id = useId();
  const anchor = useComboboxAnchor();
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(v) => onChange(v?.value ?? "")}
      isItemEqualToValue={(a, b) => a.value === b.value}
      itemToStringLabel={(o) => o.value}
    >
      <div ref={anchor} className={cn("flex w-full flex-col gap-1.5", className)}>
        <label id={id} className="select-none text-sm font-medium text-grey-800">
          {label}
        </label>
        <ComboboxInput
          aria-labelledby={id}
          className={cn(
            "h-12 rounded-control border-[var(--divider)] text-sm",
            "focus-within:border-grey-800 focus-within:ring-1 focus-within:ring-inset focus-within:ring-grey-800",
            "[&_[data-slot=input-group-control]]:text-sm",
          )}
        >
          {selected ? (
            <InputGroupAddon align="inline-start" className="pl-3.5">
              <CountryFlag iso2={selected.iso2} />
            </InputGroupAddon>
          ) : null}
        </ComboboxInput>
      </div>
      <ComboboxContent anchor={anchor} className="w-(--anchor-width) min-w-(--anchor-width)">
        <ComboboxEmpty>No results</ComboboxEmpty>
        <ComboboxList className="max-h-[300px]">
          {(item: CountryOption) => (
            <ComboboxItem key={item.value} value={item} className="gap-2 pr-2 pl-2 [&_svg]:hidden">
              <CountryFlag iso2={item.iso2} />
              <span className="flex-1 truncate">{item.value}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
