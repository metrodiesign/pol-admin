"use client";

import { useState, useCallback, useId } from "react";
import { Pencil, Plus, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SERVICES, type MinimalsInvoiceStatus } from "@/lib/mock/invoice-minimals";

// Matches minimals fCurrency: thousands separators, trims trailing zeros (max 2 dp)
function fCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

const STATUS_OPTIONS: MinimalsInvoiceStatus[] = ["draft", "paid", "pending", "overdue"];
const STATUS_LABELS: Record<MinimalsInvoiceStatus, string> = {
  draft: "Draft",
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};

interface Address {
  name: string;
  address: string;
  phone: string;
}

interface LineItem {
  title: string;
  description: string;
  service: string;
  qty: number;
  price: number;
}

interface InvoiceNewEditFormProps {
  mode: "create" | "edit";
  initialData?: {
    invoiceNumber: string;
    status: MinimalsInvoiceStatus;
    dateCreate: string;
    dueDate: string;
    from: Address;
    to: Address;
    items: LineItem[];
    shipping: number;
    discount: number;
    taxes: number;
  };
}

// Floating-label outlined input (matches MUI TextField look)
function FloatingField({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  prefix,
  className,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  type?: string;
  prefix?: string;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const fieldId = useId();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        id={fieldId}
        className={cn(
          "select-none text-sm font-medium",
          disabled ? "text-grey-400" : "text-grey-800",
        )}
      >
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center rounded-control border bg-transparent transition-colors",
          focused ? "border-grey-800 ring-1 ring-inset ring-grey-800" : "border-[var(--divider)]",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        {prefix && (
          <span
            className={cn(
              "pl-3 text-sm",
              disabled ? "text-grey-400" : "text-grey-600",
            )}
          >
            {prefix}
          </span>
        )}
        <input
          aria-labelledby={fieldId}
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "h-full w-full bg-transparent text-sm outline-none",
            prefix ? "pl-1 pr-3" : "px-3",
            disabled ? "text-grey-400" : "text-grey-800",
          )}
        />
      </div>
    </div>
  );
}

// Floating-label multiline textarea
function FloatingTextarea({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const fieldId = useId();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        id={fieldId}
        className="select-none text-sm font-medium text-grey-800"
      >
        {label}
      </label>
      <div
        className={cn(
          "rounded-control border bg-transparent transition-colors",
          focused ? "border-grey-800 ring-1 ring-inset ring-grey-800" : "border-[var(--divider)]",
        )}
      >
        <textarea
          aria-labelledby={fieldId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={3}
          className="w-full resize-none bg-transparent px-3 py-3 text-sm text-grey-800 outline-none"
        />
      </div>
    </div>
  );
}

// Floating-label select
function FloatingSelect({
  label,
  value,
  onChange,
  options,
  disabled,
  className,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const fieldId = useId();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        id={fieldId}
        className={cn(
          "select-none text-sm font-medium",
          disabled ? "text-grey-400" : "text-grey-800",
        )}
      >
        {label}
      </label>
      <div
        className={cn(
          "relative flex h-12 items-center rounded-control border bg-transparent transition-colors",
          focused ? "border-grey-800 ring-1 ring-inset ring-grey-800" : "border-[var(--divider)]",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <Select
          value={value}
          disabled={disabled}
          onValueChange={(v) => onChange?.(v ?? "")}
        >
          <SelectTrigger
            aria-labelledby={fieldId}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "h-full w-full border-none pl-3 pr-3 text-sm",
              disabled ? "text-grey-400" : "text-grey-800",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Date input with calendar icon
function DateField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const inputId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label
        id={inputId}
        className={cn(
          "select-none text-sm font-medium",
          disabled ? "text-grey-400" : "text-grey-800",
        )}
      >
        {label}
      </label>
      <div
        className={cn(
          "relative flex h-12 items-center rounded-control border bg-transparent transition-colors",
          focused ? "border-grey-800 ring-1 ring-inset ring-grey-800" : "border-[var(--divider)]",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <input
          aria-labelledby={inputId}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="MM/DD/YYYY"
          className={cn(
            "h-full w-full bg-transparent pl-3 pr-10 text-sm outline-none",
            disabled ? "text-grey-400" : "text-grey-800",
          )}
        />
        <button
          type="button"
          className="absolute right-2 text-grey-400 hover:text-grey-600"
          aria-label="Choose date"
        >
          <Calendar className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function InvoiceNewEditForm({ mode, initialData }: InvoiceNewEditFormProps) {
  const isEdit = mode === "edit";

  const shippingId = useId();
  const discountId = useId();
  const taxesId = useId();

  const defaultFrom: Address = initialData?.from ?? {
    name: "Jayvion Simon",
    address: "19034 Verna Unions Apt. 164 - Honolulu, RI / 87535",
    phone: "+1 202-555-0143",
  };

  const defaultTo: Address = initialData?.to ?? { name: "", address: "", phone: "" };

  const [fromAddress] = useState<Address>(defaultFrom);
  const [toAddress, setToAddress] = useState<Address>(defaultTo);

  const [invoiceNumber] = useState(initialData?.invoiceNumber ?? "INV-1990");
  const [status, setStatus] = useState<MinimalsInvoiceStatus>(initialData?.status ?? "draft");
  const [dateCreate, setDateCreate] = useState(initialData?.dateCreate ?? "06/07/2026");
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? "");

  const [items, setItems] = useState<LineItem[]>(
    initialData?.items ?? [
      { title: "", description: "", service: "Technology", qty: 1, price: 83.74 },
    ],
  );

  const [shipping, setShipping] = useState(initialData?.shipping ?? 0);
  const [discount, setDiscount] = useState(initialData?.discount ?? 0);
  const [taxes, setTaxes] = useState(initialData?.taxes ?? 0);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { title: "", description: "", service: "Technology", qty: 1, price: 0 },
    ]);
  }, []);

  const removeItem = useCallback((idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateItem = useCallback(
    <K extends keyof LineItem>(idx: number, key: K, val: LineItem[K]) => {
      setItems((prev) =>
        prev.map((item, i) => (i === idx ? { ...item, [key]: val } : item)),
      );
    },
    [],
  );

  // Computations
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = subtotal - discount - shipping + (subtotal * taxes) / 100;

  const hasToAddress = toAddress.name.length > 0;

  return (
    <div className="dashboard-card overflow-hidden">
      {/* 1. Addresses block */}
      <div className="grid grid-cols-1 border-b border-dashed border-grey-200 mmd:grid-cols-2">
        {/* From */}
        <div className="relative p-6 max-mmd:border-b max-mmd:border-dashed max-mmd:border-grey-200 mmd:border-r mmd:border-dashed mmd:border-grey-200">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-grey-500">From:</p>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8"
              aria-label="Edit from address"
            >
              <Pencil className="size-4" />
            </button>
          </div>
          <div className="mt-3 space-y-0.5">
            <p className="text-sm font-semibold text-grey-800">{fromAddress.name}</p>
            <p className="text-sm text-grey-600">{fromAddress.address}</p>
            <p className="text-sm text-grey-600">{fromAddress.phone}</p>
          </div>
        </div>

        {/* To */}
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-grey-500">To:</p>
            <button
              type="button"
              onClick={() => {
                if (!hasToAddress) {
                  // stub: open picker - for now pre-fill
                  setToAddress({
                    name: "Amiah Pruitt",
                    address: "74794 Asha Flat Suite 890 - Lancaster, OR / 13466",
                    phone: "+64 9 123 4567",
                  });
                }
              }}
              className="flex size-9 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8"
              aria-label={hasToAddress ? "Edit to address" : "Add to address"}
            >
              {isEdit || hasToAddress ? <Pencil className="size-4" /> : <Plus className="size-4" />}
            </button>
          </div>
          {hasToAddress ? (
            <div className="mt-3 space-y-0.5">
              <p className="text-sm font-semibold text-grey-800">{toAddress.name}</p>
              <p className="text-sm text-grey-600">{toAddress.address}</p>
              <p className="text-sm text-grey-600">{toAddress.phone}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* 2. Invoice meta strip — distinct grey band */}
      <div className="border-b border-dashed border-grey-200 bg-grey-100 px-6 py-5">
        <div className="grid grid-cols-4 gap-4 max-sm:grid-cols-1">
          <FloatingField
            label="Invoice number"
            value={invoiceNumber}
            disabled
          />
          <FloatingSelect
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as MinimalsInvoiceStatus)}
            options={STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
          />
          <DateField
            label="Date create"
            value={dateCreate}
            onChange={setDateCreate}
          />
          <DateField
            label="Due date"
            value={dueDate}
            onChange={setDueDate}
          />
        </div>
      </div>

      {/* 3. Details section */}
      <div className="px-6 pt-6">
        <p className="mb-5 text-lg font-semibold text-grey-500">Details:</p>

        {items.map((item, idx) => {
          const lineTotal = item.qty * item.price;
          const isLast = idx === items.length - 1;
          return (
            <div
              key={idx}
              className={cn(
                "pb-4",
                !isLast && "mb-4 border-b border-dashed border-grey-200",
              )}
            >
              {/* Desktop: row of fields */}
              <div className="grid grid-cols-1 gap-3 mmd:grid-cols-6">
                <FloatingField
                  label="Title"
                  value={item.title}
                  onChange={(v) => updateItem(idx, "title", v)}
                  className="col-span-1"
                />
                <FloatingTextarea
                  label="Description"
                  value={item.description}
                  onChange={(v) => updateItem(idx, "description", v)}
                  className="col-span-1"
                />
                <FloatingSelect
                  label="Service"
                  value={item.service}
                  onChange={(v) => updateItem(idx, "service", v)}
                  options={SERVICES.map((s) => ({ value: s, label: s }))}
                  className="col-span-1"
                />
                <FloatingField
                  label="Quantity"
                  type="number"
                  value={String(item.qty)}
                  onChange={(v) => updateItem(idx, "qty", Number(v) || 0)}
                  className="col-span-1"
                />
                <FloatingField
                  label="Price"
                  type="number"
                  value={String(item.price)}
                  onChange={(v) => updateItem(idx, "price", Number(v) || 0)}
                  prefix="$"
                  className="col-span-1"
                />
                <FloatingField
                  label="Total"
                  value={lineTotal === 0 ? "" : fCurrency(lineTotal)}
                  disabled
                  className="col-span-1"
                />
              </div>

              {/* Remove button */}
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold leading-[22px] text-error hover:opacity-80"
                >
                  <Trash2 className="size-4" />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Totals row */}
      <div className="px-6 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          {/* Add item */}
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-xs font-bold leading-[22px] text-primary hover:opacity-80"
          >
            <Plus className="size-4" />
            Add item
          </button>

          {/* Adjustments + summary */}
          <div className="min-w-[300px] flex-1 max-w-full">
            {/* Adjustment inputs */}
            <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
              <div>
                <label id={shippingId} className="mb-1 block text-xs text-grey-500">Shipping($)</label>
                <input
                  aria-labelledby={shippingId}
                  type="number"
                  value={shipping}
                  onChange={(e) => setShipping(Number(e.target.value) || 0)}
                  className="w-full rounded-control border border-[var(--divider)] bg-transparent px-3 py-2 text-sm text-grey-800 outline-none focus:border-grey-800 focus:ring-1 focus:ring-inset focus:ring-grey-800"
                />
              </div>
              <div>
                <label id={discountId} className="mb-1 block text-xs text-grey-500">Discount($)</label>
                <input
                  aria-labelledby={discountId}
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-full rounded-control border border-[var(--divider)] bg-transparent px-3 py-2 text-sm text-grey-800 outline-none focus:border-grey-800 focus:ring-1 focus:ring-inset focus:ring-grey-800"
                />
              </div>
              <div>
                <label id={taxesId} className="mb-1 block text-xs text-grey-500">Taxes(%)</label>
                <input
                  aria-labelledby={taxesId}
                  type="number"
                  value={taxes}
                  onChange={(e) => setTaxes(Number(e.target.value) || 0)}
                  className="w-full rounded-control border border-[var(--divider)] bg-transparent px-3 py-2 text-sm text-grey-800 outline-none focus:border-grey-800 focus:ring-1 focus:ring-inset focus:ring-grey-800"
                />
              </div>
            </div>

            {/* Summary list */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-grey-500">Subtotal</span>
                <span className="text-sm font-semibold text-grey-800">
                  {fCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-grey-500">Shipping</span>
                <span className={cn("text-sm font-semibold", shipping > 0 ? "text-error" : "text-grey-800")}>
                  {shipping > 0 ? `-${fCurrency(shipping)}` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-grey-500">Discount</span>
                <span className={cn("text-sm font-semibold", discount > 0 ? "text-error" : "text-grey-800")}>
                  {discount > 0 ? `-${fCurrency(discount)}` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-grey-500">Taxes</span>
                <span className="text-sm font-semibold text-grey-800">
                  {taxes > 0 ? `${parseFloat(taxes.toFixed(1))}%` : "-"}
                </span>
              </div>
              <div className="flex justify-between border-t border-grey-200 pt-2">
                <span className="text-base font-bold text-grey-800">Total</span>
                <span className="text-base font-bold text-grey-800">
                  {fCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
