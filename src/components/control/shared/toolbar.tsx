"use client";

import { Search } from "lucide-react";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";

export interface ControlToolbarFilter {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

interface ControlToolbarProps {
  search?: { value: string; onChange: (value: string) => void; placeholder: string };
  filters?: ControlToolbarFilter[];
  rowsPerPage?: { value: number; onChange: (n: number) => void; options: number[] };
}

/**
 * List toolbar shared by every control-plane screen. Mirrors the merchant user/role
 * toolbar grid: search, clearable selects with a "ทั้งหมด" placeholder, rows per page.
 */
export function ControlToolbar({ search, filters, rowsPerPage }: ControlToolbarProps) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
      {search ? (
        <TextField
          label="ค้นหา"
          placeholder={search.placeholder}
          value={search.value}
          onChange={search.onChange}
          startAdornment={<Search className="size-5 text-grey-500" />}
        />
      ) : null}

      {filters?.map((f) => (
        <SelectField
          key={f.label}
          label={f.label}
          value={f.value}
          onChange={f.onChange}
          options={f.options}
          placeholder="ทั้งหมด"
          clearable
        />
      ))}

      {rowsPerPage ? (
        <SelectField
          label="จำนวนต่อหน้า"
          value={String(rowsPerPage.value)}
          onChange={(v) => rowsPerPage.onChange(Number(v))}
          options={rowsPerPage.options.map((n) => ({ value: String(n), label: String(n) }))}
        />
      ) : null}
    </div>
  );
}
