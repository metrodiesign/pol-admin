"use client";

import { useId, useState, type ChangeEvent } from "react";
import SimpleBar from "simplebar-react";
import { CalendarDays } from "lucide-react";
import { DayPicker, type DropdownProps } from "react-day-picker";
import "react-day-picker/style.css";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import {
  formatThaiDate,
  thaiMonthDropdown,
  thaiMonthYearCaption,
  thaiWeekday,
  thaiYearDropdown,
} from "@/lib/date-range";

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  /** วันก่อนหน้านี้เลือกไม่ได้ (เช่น end date ต้อง >= start date) */
  minDate?: Date;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// เหมือน CalendarDropdown ของ DateRangeField — คงไว้แยกไฟล์เพราะเป็น local renderer ผูกกับ DayPicker instance นี้
function CalendarDropdown({ options = [], value, onChange, "aria-label": ariaLabel }: DropdownProps) {
  const selected = options.find((o) => String(o.value) === String(value));
  return (
    <Select
      value={String(value)}
      onValueChange={(v) => {
        if (v == null) return;
        onChange?.({ target: { value: String(v) } } as ChangeEvent<HTMLSelectElement>);
      }}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-10 gap-1 rounded-control border-transparent px-2.5 font-semibold hover:bg-[var(--action-hover)] data-[size=default]:h-10"
      >
        <SelectValue>{selected?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SimpleBar autoHide={false} style={{ maxHeight: 288 }}>
          {options.map((o) => (
            <SelectItem key={o.value} value={String(o.value)} disabled={o.disabled} className="py-2.5">
              {o.label}
            </SelectItem>
          ))}
        </SimpleBar>
      </SelectContent>
    </Select>
  );
}

/** date picker เดี่ยว (ไม่ใช่ range) — ธีม popover/calendar เดียวกับ DateRangeField แต่ตัด preset/range ทิ้ง. */
export function DatePickerField({ label, value, onChange, placeholder = "เลือกวันที่", minDate }: DatePickerFieldProps) {
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | null>(value);
  const [month, setMonthState] = useState<Date>(() => startOfMonth(value ?? new Date()));
  const [today, setToday] = useState<Date>(() => new Date());

  useScrollLock(open);

  function handleOpenChange(next: boolean) {
    if (next) {
      const now = new Date();
      setToday(now);
      setDraft(value);
      setMonthState(startOfMonth(value ?? now));
    }
    setOpen(next);
  }

  function handleConfirm() {
    if (!draft) return;
    onChange(draft);
    setOpen(false);
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label id={labelId} className="text-sm font-medium text-grey-800">
        {label}
      </label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          aria-labelledby={labelId}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-control border bg-transparent pl-3.5 pr-1.5 text-left transition-colors",
            open ? "border-grey-800 ring-1 ring-inset ring-grey-800" : "border-[var(--divider)]",
          )}
        >
          <span
            className={cn("min-w-0 flex-1 truncate text-sm", value ? "text-foreground" : "text-grey-500")}
          >
            {value ? formatThaiDate(value) : placeholder}
          </span>
          <span className="grid size-10 shrink-0 place-items-center rounded-full text-grey-600">
            <CalendarDays className="size-5" />
          </span>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] gap-0 p-0">
          <div className="date-range-calendar p-3">
            <DayPicker
              mode="single"
              weekStartsOn={0}
              navLayout="around"
              captionLayout="dropdown"
              startMonth={new Date(today.getFullYear() - 10, 0)}
              endMonth={new Date(today.getFullYear() + 1, 11)}
              month={month}
              onMonthChange={setMonthState}
              selected={draft ?? undefined}
              onSelect={(day) => setDraft(day ?? null)}
              disabled={minDate ? { before: minDate } : undefined}
              formatters={{
                formatCaption: thaiMonthYearCaption,
                formatWeekdayName: thaiWeekday,
                formatMonthDropdown: thaiMonthDropdown,
                formatYearDropdown: thaiYearDropdown,
              }}
              components={{ Dropdown: CalendarDropdown }}
            />
          </div>

          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[var(--divider)] bg-popover p-3">
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="min-w-[100px] rounded-control px-3 text-sm font-bold"
                onClick={() => setOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                size="lg"
                className="min-w-[100px] rounded-control px-3 text-sm font-bold"
                disabled={!draft}
                onClick={handleConfirm}
              >
                ตกลง
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
