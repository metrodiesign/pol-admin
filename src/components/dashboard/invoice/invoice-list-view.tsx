"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MoreVertical,
  CalendarDays,
  EllipsisVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { INVOICE_ROWS, type MinimalsInvoiceStatus } from "@/lib/mock/invoice-minimals";
import { InvoiceStatusLabel } from "./invoice-status-label";

type TabKey = "all" | MinimalsInvoiceStatus;

function buildTabs(rows: typeof INVOICE_ROWS): { key: TabKey; label: string; count: number; chipClass: string }[] {
  const counts: Partial<Record<MinimalsInvoiceStatus, number>> = {};
  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return [
    { key: "all", label: "All", count: rows.length, chipClass: "bg-foreground text-card" },
    { key: "paid", label: "Paid", count: counts.paid ?? 0, chipClass: "bg-success/16 text-success-dark" },
    { key: "pending", label: "Pending", count: counts.pending ?? 0, chipClass: "bg-warning/16 text-warning-dark" },
    { key: "overdue", label: "Overdue", count: counts.overdue ?? 0, chipClass: "bg-error/16 text-error-dark" },
    { key: "draft", label: "Draft", count: counts.draft ?? 0, chipClass: "bg-grey-200 text-grey-600" },
  ];
}

const TABS = buildTabs(INVOICE_ROWS);

// Default (uncolored) minimals avatar uses grey surface + secondary text;
// colored avatars use white text.
function avatarTextColor(bg: string): string {
  return bg.includes("grey") ? "text-grey-600" : "text-white";
}

const SERVICE_OPTIONS = [
  { value: "__all__", label: "All services" },
  { value: "Technology", label: "Technology" },
  { value: "Health And Wellness", label: "Health And Wellness" },
  { value: "Travel", label: "Travel" },
];

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="select-none text-sm font-medium text-grey-800">{label}</span>
      <div
        className={cn(
          "flex h-12 items-center rounded-control border bg-transparent transition-colors pl-3.5 pr-1.5",
          focused
            ? "border-grey-800 ring-1 ring-inset ring-grey-800"
            : "border-[var(--divider)]",
        )}
      >
        <input
          type="text"
          aria-label={label}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-grey-500 outline-none"
        />
        <button
          type="button"
          aria-label="Choose date"
          className="grid size-10 shrink-0 place-items-center rounded-full text-grey-600 transition-colors hover:bg-[var(--action-hover)]"
        >
          <CalendarDays className="size-5" />
        </button>
      </div>
    </div>
  );
}

export function InvoiceListView() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [dense, setDense] = useState(false);
  const [search, setSearch] = useState("");
  const [service, setService] = useState("__all__");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filteredRows = INVOICE_ROWS.filter((row) => {
    if (activeTab !== "all" && row.status !== activeTab) return false;
    if (search && !row.customer.toLowerCase().includes(search.toLowerCase()) && !row.invoiceNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const displayedRows = filteredRows.slice(0, rowsPerPage);
  const total = filteredRows.length;

  const allSelected = displayedRows.length > 0 && displayedRows.every((r) => selected.has(r.id));
  const someSelected = displayedRows.some((r) => selected.has(r.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelected(new Set(displayedRows.map((r) => r.id)));
    else setSelected(new Set());
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const cellPy = dense ? "py-1" : "py-4";

  return (
    <div className="dashboard-card">
      {/* Tabs */}
      <div className="flex overflow-x-auto px-5" style={{ borderBottom: "1px solid rgba(145,158,171,0.08)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 pb-[7px] pt-[9px] text-sm transition-colors",
              "mr-8 last:mr-0",
              activeTab === tab.key
                ? "border-grey-800 font-semibold text-grey-800"
                : "border-transparent font-medium text-grey-600 hover:text-grey-700",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-bold leading-none",
                activeTab === tab.key ? tab.chipClass : "bg-grey-200 text-grey-600",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col gap-3 border-b border-dashed border-[var(--divider)] py-5 pr-2 pl-5 mmd:flex-row mmd:items-stretch mmd:gap-4">
        {/* Service */}
        <SelectField
          label="Service"
          className="w-full mmd:w-[180px] mmd:shrink-0"
          value={service}
          onChange={(v) => setService(v === "__all__" ? "__all__" : v)}
          options={SERVICE_OPTIONS}
        />

        {/* Start date */}
        <div className="w-full mmd:w-[160px] mmd:shrink-0">
          <DateInput label="Start date" value={startDate} onChange={setStartDate} />
        </div>

        {/* End date */}
        <div className="w-full mmd:w-[160px] mmd:shrink-0">
          <DateInput label="End date" value={endDate} onChange={setEndDate} />
        </div>

        {/* Search */}
        <TextField
          label="Search"
          className="flex-1"
          placeholder="Search customer or invoice number..."
          value={search}
          onChange={setSearch}
          startAdornment={<Search className="size-5 text-grey-500" />}
        />

        {/* Kebab — spacer aligns button to input box */}
        <div className="hidden flex-col gap-1.5 mmd:flex">
          <span aria-hidden className="select-none text-sm font-medium">&nbsp;</span>
          <div className="flex flex-1 items-center">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full text-grey-600 transition-colors hover:bg-[var(--action-hover)]"
              aria-label="More actions"
            >
              <EllipsisVertical className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="bg-grey-200">
              <th className="w-12 pl-1 pr-0 py-4 text-left">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold leading-6 text-grey-600">
                Customer
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold leading-6 text-grey-600">
                <button type="button" className="inline-flex items-center gap-1 hover:text-grey-800">
                  Create
                  <ArrowUp className="size-3 text-grey-800" />
                </button>
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold leading-6 text-grey-600">
                <button type="button" className="inline-flex items-center gap-1 hover:text-grey-800">
                  Due
                </button>
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold leading-6 text-grey-600">
                <button type="button" className="inline-flex items-center gap-1 hover:text-grey-800">
                  Amount
                </button>
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold leading-6 text-grey-600">
                Sent
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold leading-6 text-grey-600">
                Status
              </th>
              <th className="w-12 px-4 py-4 leading-6" />
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row) => {
              const avatarCls = `${row.avatarColor} ${avatarTextColor(row.avatarColor)}`;
              const initial = row.customer.charAt(0);
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-dashed border-[var(--divider)] last:border-0 transition-colors",
                    selected.has(row.id)
                      ? "bg-[var(--action-selected)]"
                      : "hover:bg-[var(--action-hover)]",
                  )}
                >
                  <td className={cn("w-12 pl-1 pr-0", cellPy)}>
                    <Checkbox
                      checked={selected.has(row.id)}
                      onChange={(checked) => handleSelectOne(row.id, checked)}
                      aria-label={`Select ${row.customer}`}
                    />
                  </td>
                  {/* Customer */}
                  <td className={cn("px-4", cellPy)}>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                          avatarCls,
                        )}
                      >
                        {initial}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-[22px] text-grey-800">
                          {row.customer}
                        </p>
                        <Link
                          href="/dashboard/invoice/details"
                          className="text-xs text-grey-500 hover:underline"
                        >
                          {row.invoiceNumber}
                        </Link>
                      </div>
                    </div>
                  </td>
                  {/* Create */}
                  <td className={cn("px-4", cellPy)}>
                    <p className="text-sm text-grey-800">{row.createdDate}</p>
                    <p className="text-xs text-grey-500">{row.createdTime}</p>
                  </td>
                  {/* Due */}
                  <td className={cn("px-4", cellPy)}>
                    <p className="text-sm text-grey-800">{row.dueDate}</p>
                    <p className="text-xs text-grey-500">{row.dueTime}</p>
                  </td>
                  {/* Amount */}
                  <td className={cn("px-4", cellPy)}>
                    <p className="text-sm font-semibold text-grey-800">{row.amount}</p>
                  </td>
                  {/* Sent */}
                  <td className={cn("px-4", cellPy)}>
                    <p className="text-sm text-grey-800">{row.sent}</p>
                  </td>
                  {/* Status */}
                  <td className={cn("px-4", cellPy)}>
                    <InvoiceStatusLabel status={row.status} />
                  </td>
                  {/* Actions */}
                  <td className={cn("px-4", cellPy)}>
                    <button
                      type="button"
                      className="rounded-full p-1 text-grey-400 hover:bg-grey-100"
                      aria-label="Row actions"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="border-t border-dashed border-grey-200 px-4 py-3">
        {/* Main row: Dense (left) + pagination controls (right). On mobile: pagination on top row, Dense below */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Dense toggle — hidden on mobile in this row, shown below pagination on mobile */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              role="switch"
              aria-checked={dense}
              onClick={() => setDense((d) => !d)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                dense ? "bg-foreground" : "bg-grey-300",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow transition-transform",
                  dense ? "translate-x-4" : "translate-x-0",
                )}
              />
            </button>
            <span className="text-sm text-grey-600">Dense</span>
          </div>

          {/* Rows per page + count + arrows */}
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <span className="text-sm text-grey-600">Rows per page:</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(v) => setRowsPerPage(Number(v))}
            >
              <SelectTrigger aria-label="Rows per page" className="h-7 w-auto gap-1 border-none px-1 text-sm font-semibold text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-grey-600">
              1–{Math.min(rowsPerPage, total)} of {total}
            </span>
            <button
              type="button"
              disabled
              className="rounded-lg p-1 text-grey-300 disabled:cursor-default"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="rounded-full p-1 text-grey-600 hover:bg-grey-100"
              aria-label="Next page"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Mobile-only Dense toggle row — appears BELOW pagination */}
        <div className="mt-2 flex items-center gap-2 sm:hidden">
          <button
            type="button"
            role="switch"
            aria-checked={dense}
            onClick={() => setDense((d) => !d)}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              dense ? "bg-grey-800" : "bg-grey-300",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow transition-transform",
                dense ? "translate-x-4" : "translate-x-0",
              )}
            />
          </button>
          <span className="text-sm text-grey-600">Dense</span>
        </div>
      </div>
    </div>
  );
}
