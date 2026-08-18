"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormHelperText({
  error,
  className,
  children,
}: {
  error?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={cn("text-xs", error ? "text-error" : "text-grey-600", className)}>
      {children}
    </p>
  );
}

interface FormControlProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormControl({
  label,
  htmlFor,
  error,
  helperText,
  required,
  className,
  children,
}: FormControlProps) {
  const reactId = useId();
  const id = htmlFor ?? reactId;
  const hasError = Boolean(error);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          id={id}
          className={cn(
            "select-none text-sm font-medium",
            hasError ? "text-error" : "text-foreground",
          )}
        >
          {label}
          {required ? <span className="text-error"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error || helperText ? (
        <FormHelperText error={hasError}>{error ?? helperText}</FormHelperText>
      ) : null}
    </div>
  );
}
