"use client";

import { useId, useState, type ChangeEvent } from "react";
import SimpleBar from "simplebar-react";
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
  sameDay,
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
        aria-label={ariaLabel}
        className="h-10 gap-1 rounded-control border-transparent px-2.5 font-semibold hover:bg-[var(--action-hover)] data-[size=default]:h-10"
      >
        <SelectValue>{selected?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SimpleBar autoHide={false} style={{ maxHeight: 288 }}>
          {options.map((o) => (
            <SelectItem
              key={o.value}
              value={String(o.value)}
              disabled={o.disabled}
              className="py-2.5"
            >
              {o.label}
            </SelectItem>
          ))}
        </SimpleBar>
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
  // วันที่ hover/focus อยู่ ใช้ทำ preview range ระหว่างเลือกครึ่งเดียว
  const [hovered, setHovered] = useState<Date | null>(null);

  useScrollLock(open);

  function handleOpenChange(next: boolean) {
    if (next) {
      const now = new Date();
      setToday(now);
      setDraft(value);
      setMonthState(startOfMonth(value ? value.start : now));
    }
    setHovered(null);
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

  // preview range: มี start แล้วแต่ยังไม่มี end และกำลัง hover/focus วันอื่นอยู่
  const preview =
    draft && draft.end === undefined && hovered && !sameDay(hovered, draft.start)
      ? hovered < draft.start
        ? { from: hovered, to: draft.start }
        : { from: draft.start, to: hovered }
      : null;

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
                  size="lg"
                  className="justify-start rounded-control px-3 text-sm font-medium sm:w-full"
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
                onDayMouseEnter={(day) => setHovered(day)}
                onDayMouseLeave={() => setHovered(null)}
                // keyboard parity: เลื่อน focus ด้วยลูกศรก็เห็น preview เหมือนเมาส์
                onDayFocus={(day) => setHovered(day)}
                onDayBlur={() => setHovered(null)}
                modifiers={{
                  preview_middle: preview ? { after: preview.from, before: preview.to } : [],
                  preview_end: preview ? [preview.from, preview.to] : [],
                }}
                modifiersClassNames={{
                  preview_middle: "rdp-preview_middle",
                  preview_end: "rdp-preview_end",
                }}
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
              {/* ขนาดตามธีมของ footer ปุ่มในฟอร์ม (role-edit-view): h-9 min-w-[100px] text-sm font-bold */}
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
