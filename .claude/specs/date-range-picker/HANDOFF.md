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
