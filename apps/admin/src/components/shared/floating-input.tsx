"use client";

import { TextField } from "@/components/form/text-field";

interface FloatingInputProps {
  label: string;
  defaultValue?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
}

export function FloatingInput({
  label,
  defaultValue = "",
  type = "text",
  multiline = false,
  rows = 4,
}: FloatingInputProps) {
  return (
    <TextField
      label={label}
      defaultValue={defaultValue}
      type={type}
      multiline={multiline}
      rows={rows}
    />
  );
}
