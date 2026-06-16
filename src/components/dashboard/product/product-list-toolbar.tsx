"use client";

import { Search, Columns3, SlidersHorizontal, Download, Settings2 } from "lucide-react";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";

const STOCK_OPTIONS = [
  { value: "__all__", label: "All" },
  { value: "in stock", label: "In stock" },
  { value: "low stock", label: "Low stock" },
  { value: "out of stock", label: "Out of stock" },
];

const PUBLISH_OPTIONS = [
  { value: "__all__", label: "All" },
  { value: "Published", label: "Published" },
  { value: "Draft", label: "Draft" },
];

const ACTION_BUTTONS = [
  { Icon: Columns3, label: "Columns" },
  { Icon: SlidersHorizontal, label: "Filters" },
  { Icon: Download, label: "Export" },
  { Icon: Settings2, label: "Settings" },
] as const;

interface ProductListToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  stock: string;
  onStockChange: (v: string) => void;
  publish: string;
  onPublishChange: (v: string) => void;
}

export function ProductListToolbar({
  search,
  onSearchChange,
  stock,
  onStockChange,
  publish,
  onPublishChange,
}: ProductListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-dashed border-[var(--divider)] py-5 pr-2 pl-5 sm:flex-row sm:items-stretch sm:gap-4">
      {/* Stock */}
      <SelectField
        label="Stock"
        className="w-full sm:w-[180px] sm:shrink-0"
        value={stock || "__all__"}
        onChange={(v) => onStockChange(v === "__all__" ? "" : v)}
        options={STOCK_OPTIONS}
      />

      {/* Publish */}
      <SelectField
        label="Publish"
        className="w-full sm:w-[180px] sm:shrink-0"
        value={publish || "__all__"}
        onChange={(v) => onPublishChange(v === "__all__" ? "" : v)}
        options={PUBLISH_OPTIONS}
      />

      {/* Search */}
      <TextField
        label="Search"
        className="flex-1"
        placeholder="Search..."
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
      />

      {/* Action buttons — spacer keeps them aligned to input box */}
      <div className="hidden flex-col gap-1.5 sm:flex">
        <span aria-hidden className="select-none text-sm font-medium">&nbsp;</span>
        <div className="flex flex-1 items-center gap-0.5">
          {ACTION_BUTTONS.map(({ Icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex h-[30px] items-center gap-1.5 rounded-lg px-2 text-[13px] font-bold text-grey-800 transition-colors duration-[250ms] hover:bg-[var(--action-hover)]"
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: action buttons row */}
      <div className="flex items-center gap-0.5 sm:hidden">
        {ACTION_BUTTONS.map(({ Icon, label }) => (
          <button
            key={label}
            type="button"
            className="flex h-[30px] items-center gap-1.5 rounded-lg px-2 text-[13px] font-bold text-grey-800 transition-colors duration-[250ms] hover:bg-[var(--action-hover)]"
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
