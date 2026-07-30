"use client";

import { useId, useState, type ChangeEvent } from "react";
import { CalendarDays } from "lucide-react";
import {
  DayPicker,
  type DateRange as RdpRange,
  type DropdownProps,
  type Modifiers,
} from "react-day-picker";
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
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import {
  PRESETS,
  computePreset,
  detectPreset,
  formatThaiRange,
  thaiMonthDropdown,
  thaiMonthYearCaption,
  thaiWeekday,
  thaiYearDropdown,
  type DateRange,
  type PresetKey,
} from "@/lib/date-range";

// draft.end อาจยังไม่มีระหว่างเลือกครึ่งเดียว — ต่างจาก DateRange ของ lib ที่ fields บังคับทั้งคู่
type Draft = { start: Date; end?: Date } | null;

interface DateRangeFieldProps {
  label: string;
  value: DateRange | null;
  onChange: (range: DateRange) => void;
  placeholder?: string;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// แทน native <select> ของ RDP ด้วย Select ของธีม (base-ui popup เดียวกับ toolbar)
// RDP ส่ง onChange แบบ ChangeEventHandler<HTMLSelectElement> — ยิง synthetic event กลับ
function CalendarDropdown({ options = [], value, onChange, "aria-label": ariaLabel }: DropdownProps) {
  // base-ui SelectValue ไม่ map value -> label ให้เอง — resolve label จาก options ตรงนี้
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
        size="sm"
        aria-label={ariaLabel}
        className="gap-1 border-transparent px-1.5 font-semibold hover:bg-[var(--action-hover)]"
      >
        <SelectValue>{selected?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72 min-w-0">
        {options.map((o) => (
          <SelectItem key={o.value} value={String(o.value)} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DateRangeField({
  label,
  value,
  onChange,
  placeholder = "กำหนดเอง",
}: DateRangeFieldProps) {
  const labelId = useId();
  const isMobile = useIsMobile(640);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(value);
  const [month, setMonthState] = useState<Date>(() =>
    startOfMonth(value ? value.start : new Date()),
  );
  // recompute ทุกครั้งที่เปิด (ห้าม render อะไรที่พึ่ง today นอก popover — กัน hydration drift ข้ามเที่ยงคืน)
  const [today, setToday] = useState<Date>(() => new Date());

  useScrollLock(open);

  function handleOpenChange(next: boolean) {
    if (next) {
      const now = new Date();
      setToday(now);
      setDraft(value);
      setMonthState(startOfMonth(value ? value.start : now));
    }
    setOpen(next);
  }

  function handlePresetClick(key: PresetKey) {
    if (key === "custom") {
      setDraft(null);
      return;
    }
    const range = computePreset(key, today);
    if (!range) return;
    setDraft(range);
    setMonthState(startOfMonth(range.start));
  }

  function handleSelect(range: RdpRange | undefined, triggerDate: Date) {
    if (!range) {
      setDraft(null);
      return;
    }
    if (!draft || draft.end !== undefined) {
      setDraft({ start: triggerDate, end: undefined });
      return;
    }
    if (triggerDate < draft.start) {
      setDraft({ start: triggerDate, end: undefined });
      return;
    }
    setDraft({ start: draft.start, end: triggerDate });
  }

  function handleDayClick(day: Date, modifiers: Modifiers) {
    if (modifiers.outside) {
      setMonthState(startOfMonth(day));
    }
  }

  function handleConfirm() {
    if (!draft || draft.end === undefined) return;
    onChange({ start: draft.start, end: draft.end });
    setOpen(false);
  }

  const activePreset: PresetKey =
    draft?.end !== undefined ? detectPreset({ start: draft.start, end: draft.end }, today) : "custom";

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
            {value ? formatThaiRange(value) : placeholder}
          </span>
          <span className="grid size-10 shrink-0 place-items-center rounded-full text-grey-600">
            <CalendarDays className="size-5" />
          </span>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] gap-0 p-0">
          <div className="flex max-h-[70vh] flex-col overflow-y-auto sm:max-h-none sm:flex-row sm:overflow-visible">
            <div className="flex flex-row flex-wrap gap-1 border-b border-[var(--divider)] p-3 sm:w-36 sm:flex-none sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.key}
                  type="button"
                  variant={activePreset === preset.key ? "default" : "ghost"}
                  size="sm"
                  className="justify-start sm:w-full"
                  onClick={() => handlePresetClick(preset.key)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            <div className="date-range-calendar p-3">
              <DayPicker
                mode="range"
                numberOfMonths={isMobile ? 1 : 2}
                weekStartsOn={0}
                showOutsideDays
                navLayout="around"
                captionLayout="dropdown"
                // ขอบเขต dropdown ปี: ย้อนหลัง 10 ปี ถึงปีหน้า (คำนวณจาก today ใน popover เท่านั้น — กัน hydration)
                startMonth={new Date(today.getFullYear() - 10, 0)}
                endMonth={new Date(today.getFullYear() + 1, 11)}
                month={month}
                onMonthChange={setMonthState}
                selected={draft ? { from: draft.start, to: draft.end } : undefined}
                onSelect={handleSelect}
                onDayClick={handleDayClick}
                formatters={{
                  formatCaption: thaiMonthYearCaption,
                  formatWeekdayName: thaiWeekday,
                  formatMonthDropdown: thaiMonthDropdown,
                  formatYearDropdown: thaiYearDropdown,
                }}
                components={{ Dropdown: CalendarDropdown }}
              />
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[var(--divider)] bg-popover p-3">
            <span className="truncate text-sm text-grey-700">
              {draft?.end !== undefined ? formatThaiRange({ start: draft.start, end: draft.end }) : "เลือกวันที่"}
            </span>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!draft || draft.end === undefined}
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
