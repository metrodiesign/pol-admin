"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextFieldProps {
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  type?: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  className?: string;
  maxLength?: number;
  autoComplete?: string;
  spellCheck?: boolean;
}

export function TextField({
  label,
  value,
  defaultValue = "",
  onChange,
  type = "text",
  multiline = false,
  rows = 4,
  error,
  helperText,
  required,
  disabled,
  placeholder,
  name,
  id,
  startAdornment,
  endAdornment,
  className,
  maxLength,
  autoComplete,
  spellCheck,
}: TextFieldProps) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const descId = `${fieldId}-desc`;

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? value : internal;
  const [focused, setFocused] = useState(false);

  const hasError = Boolean(error);

  function handleChange(v: string) {
    if (!isControlled) setInternal(v);
    onChange?.(v);
  }

  const borderState = hasError
    ? "border-error ring-1 ring-inset ring-error"
    : focused
      ? "border-primary ring-1 ring-inset ring-primary"
      : "border-[var(--divider)]";

  const describedBy = error || helperText ? descId : undefined;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <label
        id={fieldId}
        className={cn(
          "text-sm font-medium",
          hasError ? "text-error" : "text-grey-800",
        )}
      >
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </label>

      <div
        className={cn(
          "flex items-center rounded-control border bg-transparent transition-colors",
          multiline ? "items-stretch" : "h-12",
          borderState,
          disabled && "pointer-events-none opacity-60",
        )}
      >
        {startAdornment ? (
          <span className="pl-3.5 text-grey-600">{startAdornment}</span>
        ) : null}

        {multiline ? (
          <textarea
            aria-labelledby={fieldId}
            name={name}
            rows={rows}
            value={current}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            autoComplete={autoComplete}
            spellCheck={spellCheck}
            aria-invalid={hasError || undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full resize-none bg-transparent px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-grey-500"
          />
        ) : (
          <input
            aria-labelledby={fieldId}
            name={name}
            type={type}
            value={current}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            autoComplete={autoComplete}
            spellCheck={spellCheck}
            aria-invalid={hasError || undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "h-full w-full bg-transparent px-3.5 text-sm text-foreground outline-none placeholder:text-grey-500",
              startAdornment && "pl-2",
            )}
          />
        )}

        {endAdornment ? (
          <span className="pr-3 text-grey-600">{endAdornment}</span>
        ) : null}
      </div>

      {error || helperText ? (
        <p
          id={descId}
          className={cn("text-xs", hasError ? "text-error" : "text-grey-600")}
        >
          {error || helperText}
        </p>
      ) : null}
    </div>
  );
}
