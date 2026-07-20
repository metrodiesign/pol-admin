"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { PERSON_TYPE_LABEL, type PersonType } from "@/types/merchant-user";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";

const PERSON_TYPES: PersonType[] = ["Individual", "Juristic"];

const PERSON_TYPE_OPTIONS = [
  { value: "__all__", label: "ทุกประเภท" },
  ...PERSON_TYPES.map((pt) => ({ value: pt, label: PERSON_TYPE_LABEL[pt] })),
];

interface ProducerListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  personType: string;
  onPersonTypeChange: (value: string) => void;
}

export function ProducerListToolbar({
  search,
  onSearchChange,
  personType,
  onPersonTypeChange,
}: ProducerListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 py-5 pr-2 pl-5 sm:flex-row sm:items-stretch sm:gap-2">
      <SelectField
        label="ประเภท"
        className="w-full sm:w-[200px]"
        value={personType || "__all__"}
        onChange={(v) => onPersonTypeChange(v === "__all__" ? "" : v)}
        options={PERSON_TYPE_OPTIONS}
      />

      <TextField
        label="ค้นหา"
        className="flex-1"
        placeholder="ค้นหาชื่อหรืออีเมล..."
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
        endAdornment={
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-control text-grey-700 transition-colors hover:bg-[var(--action-hover)] sm:hidden"
            aria-label="ตัวกรอง"
          >
            <SlidersHorizontal className="size-5" />
          </button>
        }
      />

      {/* Spacer label mirrors the fields so the button centers on the input box, not the full field */}
      <div className="hidden flex-col gap-1.5 sm:flex">
        <span aria-hidden className="select-none text-sm font-medium">
          &nbsp;
        </span>
        <div className="flex flex-1 items-center">
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-[var(--divider)] text-grey-700 transition-colors hover:bg-[var(--action-hover)]"
            aria-label="ตัวกรอง"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
