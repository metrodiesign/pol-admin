export type DateRange = { start: Date; end: Date };

export type PresetKey =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "วันนี้" },
  { key: "yesterday", label: "เมื่อวาน" },
  { key: "last7", label: "7 วันล่าสุด" },
  { key: "last30", label: "30 วันล่าสุด" },
  { key: "thisMonth", label: "เดือนนี้" },
  { key: "lastMonth", label: "เดือนที่แล้ว" },
  { key: "custom", label: "กำหนดเอง" },
];

export const BE_OFFSET = 543;

export const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export const THAI_MONTHS_ABBR = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export const THAI_WEEKDAYS_ABBR = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function midnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function computePreset(key: PresetKey, today: Date): DateRange | null {
  const base = midnight(today);

  switch (key) {
    case "today":
      return { start: base, end: base };
    case "yesterday": {
      const d = addDays(base, -1);
      return { start: d, end: d };
    }
    case "last7":
      return { start: addDays(base, -6), end: base };
    case "last30":
      return { start: addDays(base, -29), end: base };
    case "thisMonth":
      return {
        start: new Date(base.getFullYear(), base.getMonth(), 1),
        end: new Date(base.getFullYear(), base.getMonth() + 1, 0),
      };
    case "lastMonth":
      return {
        start: new Date(base.getFullYear(), base.getMonth() - 1, 1),
        end: new Date(base.getFullYear(), base.getMonth(), 0),
      };
    case "custom":
      return null;
    default:
      return null;
  }
}

export function detectPreset(range: DateRange, today: Date): PresetKey {
  const start = midnight(range.start);
  const end = midnight(range.end);

  for (const { key } of PRESETS) {
    if (key === "custom") continue;
    const preset = computePreset(key, today);
    if (preset && sameDay(preset.start, start) && sameDay(preset.end, end)) {
      return key;
    }
  }

  return "custom";
}

export function formatThaiDate(d: Date): string {
  const day = d.getDate();
  const month = THAI_MONTHS_ABBR[d.getMonth()]!;
  const year = d.getFullYear() + BE_OFFSET;
  return `${day} ${month} ${year}`;
}

export function formatThaiRange(r: DateRange): string {
  return `${formatThaiDate(r.start)} - ${formatThaiDate(r.end)}`;
}

export function thaiMonthYearCaption(d: Date): string {
  const month = THAI_MONTHS_FULL[d.getMonth()]!;
  const year = d.getFullYear() + BE_OFFSET;
  return `${month} ${year}`;
}

export function thaiWeekday(d: Date): string {
  return THAI_WEEKDAYS_ABBR[d.getDay()]!;
}
