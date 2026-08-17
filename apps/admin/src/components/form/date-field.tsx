"use client";

import { Calendar } from "lucide-react";
import { TextField } from "./text-field";

type DateFieldProps = Omit<
  React.ComponentProps<typeof TextField>,
  "type" | "multiline" | "rows" | "endAdornment"
>;

export function DateField(props: DateFieldProps) {
  return (
    <TextField
      {...props}
      type="date"
      endAdornment={<Calendar className="size-4.5" />}
    />
  );
}
