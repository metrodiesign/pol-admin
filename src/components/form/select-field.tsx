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
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
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
  clearable = false,
  disabled = false,
  required = false,
  error,
  helperText,
}: SelectFieldProps) {
  const id = useId();
  const descId = `${id}-desc`;
  const selected = options.find((o) => o.value === value) ?? null;
  const hasError = Boolean(error);

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(v) => onChange(v?.value ?? "")}
      isItemEqualToValue={(a, b) => a.value === b.value}
      disabled={disabled}
    >
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        <label id={id} className={cn("text-sm font-medium", hasError ? "text-error" : "text-grey-800")}>
          {label}
          {required ? <span className="text-error"> *</span> : null}
        </label>
        <ComboboxInput
          aria-labelledby={id}
          aria-describedby={error || helperText ? descId : undefined}
          aria-invalid={hasError || undefined}
          aria-required={required || undefined}
          disabled={disabled}
          placeholder={placeholder}
          showClear={clearable}
          className={cn(
            "h-12 rounded-control border-[var(--divider)] text-sm",
            hasError
              ? "border-error ring-1 ring-inset ring-error"
              : "focus-within:border-primary focus-within:ring-1 focus-within:ring-inset focus-within:ring-primary",
            disabled && "pointer-events-none opacity-60",
            "[&_[data-slot=input-group-control]]:pl-3.5 [&_[data-slot=input-group-control]]:text-sm",
          )}
        />
        {error || helperText ? (
          <p id={descId} className={cn("text-xs", hasError ? "text-error" : "text-grey-600")}>
            {error || helperText}
          </p>
        ) : null}
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No results</ComboboxEmpty>
        <ComboboxList>
          {(item: SelectOption) => (
            <ComboboxItem key={item.value} value={item} className="py-2.5">
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
