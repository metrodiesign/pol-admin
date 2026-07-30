# Handoff — date-range-picker

## Task 1 — react-day-picker dependency
- สถานะ: DONE
- version ที่ติดตั้ง: `react-day-picker@^9.14.0` (resolved 9.14.0)
- ไฟล์ที่แก้: `package.json`, `package-lock.json`
- Evidence:
  - `node -e "console.log(require.resolve('react-day-picker'))"` → `/Users/king_developer/Desktop/Project/pol-admin/node_modules/react-day-picker/dist/cjs/index.js`
  - `npm run build` → ผ่านทั้งหมด (ทุกหน้ารวม `/order/list` build สำเร็จ, ไม่มี error ที่เกี่ยวกับ react-day-picker)
  - `package.json` line 21: `"react-day-picker": "^9.14.0"` — caret ตาม dependency rules (ไม่ใช่ `*`/`latest`)
- หมายเหตุถึง Task 3 (คนที่จะ import DayPicker): เวอร์ชันที่ล็อกคือ 9.14.0 (RDP v9 API — `mode="range"`, `selected`/`onSelect` ใช้ shape `{from, to}` ไม่ใช่ `{start, end}` แบบ lib logic ของ task 2 ต้อง map ที่ขอบ component ตามที่ design.md ระบุไว้ที่บรรทัด ~100). style import คือ `react-day-picker/style.css`. ยังไม่ได้แตะไฟล์ component ใดๆ — task 1 ทำแค่ install dependency เท่านั้น.

## Task 2 — date-range.ts pure logic
- สถานะ: DONE
- ไฟล์ที่สร้าง: `src/lib/date-range.ts`, `src/lib/date-range.test.ts`
- Evidence: `npm test` → `Test Files 12 passed (12)`, `Tests 156 passed (156)` (รวม 21 tests ใน `date-range.test.ts`, ไม่มี failed)
- หมายเหตุถึง Task 3 (signature จริงที่ component จะ import):
  - `type DateRange = { start: Date; end: Date }`, `type PresetKey = "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth" | "custom"`
  - `PRESETS: { key: PresetKey; label: string }[]` — เรียงตาม REQ-2.1 (รวม `"custom"` label `"กำหนดเอง"` เป็นตัวสุดท้ายในลิสต์ด้วย เผื่อ component ใช้ map render ปุ่ม preset ทั้งหมดรวม custom ได้จาก const เดียว — ถ้าไม่ต้องการปุ่ม custom แยกเอง กรอง key !== "custom" เอาเอง)
  - `computePreset(key: PresetKey, today: Date): DateRange | null` — คืน `Date` ทุกตัวเป็น midnight local (00:00:00.000) เสมอ, `custom`/key ไม่รู้จัก → `null`
  - `detectPreset(range: DateRange, today: Date): PresetKey` — เทียบ date-only ภายใน (ตัด time component ของทั้ง range และ today เอง) ไม่ต้อง normalize ก่อนเรียก
  - `sameDay(a: Date, b: Date): boolean`, `formatThaiDate(d: Date): string`, `formatThaiRange(r: DateRange): string`, `thaiMonthYearCaption(d: Date): string`, `thaiWeekday(d: Date): string`
  - const เสริมที่ export ด้วย (เผื่อใช้ตรงใน component/formatter อื่น): `BE_OFFSET`, `THAI_MONTHS_FULL`, `THAI_MONTHS_ABBR`, `THAI_WEEKDAYS_ABBR`
  - **map {start,end} <-> {from,to} ที่ Task 3 ต้องทำเอง** (lib นี้ไม่รู้จัก RDP shape เลย): ขาเข้า DayPicker `selected` = draft ? `{ from: draft.start, to: draft.end }` : `undefined`; ขาออก `onSelect(rdpRange)` → เก็บ draft เป็น `{ start: rdpRange.from, end: rdpRange.to }` (ระวัง `to` อาจ `undefined` ระหว่างเลือกครึ่งเดียว — draft type ฝั่ง component ต้องยอม `end` เป็น `Date | undefined` ก่อน commit จริง ผิดกับ `DateRange` ของ lib ที่ fields บังคับทั้งคู่)
  - ทุกฟังก์ชัน pure, ไม่ import React/network/react-day-picker ตามข้อกำหนด

## Task 3 — DateRangeField component
- สถานะ: DONE
- ไฟล์ที่สร้าง: `src/components/form/date-range-field.tsx` (named export `DateRangeField`, `"use client"`)
- ไฟล์ที่แก้เพิ่ม (นอกเหนือ scope Task 3 เดิมนิดหน่อย แต่จำเป็นสำหรับ M2 styling): `src/app/globals.css` — เพิ่ม block ท้ายไฟล์ override RDP CSS vars ผ่าน scope class `.date-range-calendar .rdp-root` (`--rdp-accent-color: var(--primary)`, `--rdp-accent-background-color: var(--primary-soft)`, `--rdp-today-color: var(--primary)`) ไม่แตะ token อื่น
- Evidence:
  - `npx tsc --noEmit -p .` → `TypeScript: No errors found`
  - `npm run build` → ผ่านทั้งหมดทุกหน้า (รวม `/order/list`), ไม่มี error
  - `npm test` → `Test Files 12 passed (12)`, `Tests 156 passed (156)` (ไม่มี regression, ยังไม่มี component test ตาม gate note m5 ใน design)
  - `npx eslint src/components/form/date-range-field.tsx` → ไม่มี error
- Decision: CSS override วิธี — import `react-day-picker/style.css` ตรงในไฟล์ component (layout/grid เต็มจาก lib) แล้ว override เฉพาะ CSS custom properties สี 3 ตัวใน `globals.css` ผ่าน scope selector `.date-range-calendar .rdp-root` (wrapper div รอบ `<DayPicker>` มี class `date-range-calendar`) → ไม่ reconstruct classNames structural เอง ตรง M2/spec
- Logic decision (`onSelect`): คุมเองทั้งหมดจาก `draft` state + `triggerDate` (ไม่อ่าน RDP-computed `range` param ยกเว้นกรณี `undefined` = deselect → เคลียร์ draft) — ครอบ REQ-3.5/3.6/3.7/3.8 แบบ deterministic: ไม่มี draft หรือ draft ครบแล้ว → เริ่ม range ใหม่จาก `triggerDate`; มี start รอ end → `triggerDate < start` สลับเป็น start ใหม่ ไม่งั้น commit เป็น end (คลิกวันเดิมซ้ำ = end=start ผ่าน `!(triggerDate < start)`)
- `onDayClick`: เช็ค `modifiers.outside` แล้ว `setMonth(startOfMonth(day))` เท่านั้น (คนละหน้าที่กับ `onSelect` ที่ยิงคู่กันทุกคลิก)
- `today`/`month`/`draft` state reset ใน `handleOpenChange(true)` เท่านั้น — recompute `today` ทุกครั้งที่เปิดจริงตามที่ M4 กำหนด
- ปุ่ม preset ใช้ `<Button variant="secondary">` สำหรับ active / `variant="ghost"` สำหรับ inactive (ใช้ component ที่มีอยู่แล้ว ไม่สร้าง custom pill ใหม่)
- หมายเหตุถึง Task 4 (wiring ใน `order-list-toolbar.tsx`):
  - import: `import { DateRangeField } from "@/components/form/date-range-field";` และ type `DateRange` จาก `@/lib/date-range` ถ้าต้องประกาศ local state
  - prop signature ที่จะแทน `<DateInput label="วันที่" value="24 พ.ค. 2569" onChange={() => {}} />`: `<DateRangeField label="วันที่" value={dateRange} onChange={setDateRange} />` โดย `dateRange: DateRange | null` (ยัง local state ใน toolbar เอง ตาม REQ-6.4 ไม่ต้อง wire เข้า `order-list-view.tsx`/`PaymentSession`)
  - `DateInput` helper component เดิมใน `order-list-toolbar.tsx` (บรรทัด ~15-59) จะกลายเป็น orphan หลัง Task 4 แทนที่ — ต้องลบทิ้งตาม tasks.md Task 4 spec
  - placeholder default ของ `DateRangeField` คือ `"กำหนดเอง"` แล้ว (REQ-4.6) ไม่ต้องส่ง prop เพิ่มถ้าใช้ค่า default

## Task 4 — wire แทน DateInput ใน order-list-toolbar
- สถานะ: DONE
- ไฟล์ที่แก้: `src/components/order/order-list-toolbar.tsx`
  - แทน `<DateInput label="วันที่" value="24 พ.ค. 2569" onChange={() => {}} />` ด้วย `<DateRangeField label="วันที่" value={dateRange} onChange={setDateRange} />` โดยเพิ่ม local state `const [dateRange, setDateRange] = useState<DateRange | null>(null);` ใน `OrderListToolbar` (UI-only, ยังไม่ wire เข้า `order-list-view.tsx`/`PaymentSession` ตาม REQ-6.4) — grid layout เดิม (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) และตำแหน่ง field อื่นไม่ถูกแตะ
  - เพิ่ม import: `DateRangeField` จาก `@/components/form/date-range-field`, type `DateRange` จาก `@/lib/date-range`
- Orphan ที่ลบออกจากไฟล์นี้: local function `DateInput` (เดิมบรรทัด ~15-59) พร้อม import ที่ไม่เหลือใครใช้แล้ว — `CalendarDays` (lucide-react), `cn` (`@/lib/utils`), `useId` (react) — เช็คแล้วว่า `DateInput` ใน repo เป็น local function แยกไฟล์ (ไม่ shared export) มีอีก 4 ไฟล์ (`transaction-list-toolbar.tsx`, `dashboard/order/order-list-toolbar.tsx`, `dashboard/invoice/invoice-list-view.tsx`, `policy-list-toolbar.tsx`) ที่มี `DateInput` ของตัวเอง — อยู่นอก scope Task 4 ไม่แตะ
- ไม่ได้แตะ: `order-list-view.tsx`, `PaymentSession` type (ตาม scope)
- Evidence:
  - `npx tsc --noEmit -p .` → `TypeScript: No errors found`
  - `npx eslint src/components/order/order-list-toolbar.tsx` → `ESLint: No issues found`
  - `npm run build` → ผ่านทั้งหมดทุกหน้า รวม `/order/list`
  - `npm test -- --run` → `Test Files 12 passed (12)`, `Tests 156 passed (156)` (ไม่มี regression)
- สรุป: spec `date-range-picker` ครบทุก task แล้ว (Task 1-4 DONE) พร้อม `/run` เช็คด้วยตาจริง แล้วเปิด PR
