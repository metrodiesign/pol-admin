"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";

export interface ControlFilter {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  widthClass?: string;
}

/** ALL sentinel for "no filter". Screens map it back to "" themselves. */
export const ALL = "__all__";

/**
 * Reusable search + dropdown-filters bar for every control-plane list screen.
 * Keeps the toolbar look identical across screens — pass filters as config.
 */
export function ControlListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  actions,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder: string;
  filters?: ControlFilter[];
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 px-5 py-5 lg:flex-row lg:items-end">
      <TextField
        label=""
        className="flex-1"
        placeholder={searchPlaceholder}
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
      />

      {filters?.map((f) => (
        <SelectField
          key={f.label}
          label={f.label}
          className={f.widthClass ?? "w-full lg:w-[180px]"}
          value={f.value || ALL}
          onChange={(v) => f.onChange(v === ALL ? "" : v)}
          options={[{ value: ALL, label: "ทั้งหมด" }, ...f.options]}
        />
      ))}

      {actions ? (
        <>
          <div className="lg:flex-1" />
          {actions}
        </>
      ) : null}
    </div>
  );
}
