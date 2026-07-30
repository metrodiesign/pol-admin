# Implementation Tasks: Date Range Picker (order list toolbar)

> Status: approved 2026-07-30

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass (it may touch many files). Decompose into sub-steps yourself at
> execution time — do NOT pre-split tasks here.

- [ ] 1. เพิ่ม dependency react-day-picker — ติดตั้ง `react-day-picker` (caret `^9.x`, ไม่ใช่ `*`/`latest`) ผ่าน npm, commit `package-lock.json`. Done = `import { DayPicker } from "react-day-picker"` resolve ได้ + build ไม่พัง.
     Satisfies: REQ-6 (6.2 no-network dep-only). Verify: `npm run build` ผ่าน (import resolve).

- [ ] 2. Pure logic `src/lib/date-range.ts` + unit test — type `DateRange`/`PresetKey`, `PRESETS` const, `computePreset` (normalize today→midnight), `detectPreset` (date-only, precedence ตาม PRESETS), `sameDay`, `formatThaiDate`/`formatThaiRange`/`thaiMonthYearCaption`/`thaiWeekday` + const arrays ไทย/พ.ศ. co-located test `date-range.test.ts` คลุม preset math (inclusive last7/30, เต็มเดือน), edge (สิ้นเดือน/อธิกสุรทิน/ข้ามปี), date-only detect (B1), พ.ศ. formatting. Done = test เขียวครบ.
     Satisfies: REQ-2 (2.2/2.5 logic), REQ-3 (3.2/3.3 formatters), REQ-4 (4.1 format). Verify: `npm test` (date-range.test.ts เขียว).

- [ ] 3. Component `src/components/form/date-range-field.tsx` — `DateRangeField` controlled (Popover base-ui + `PopoverTrigger` button + PresetList + `<DayPicker mode=range>` + Footer). draft state + commit เฉพาะกด ตกลง, cancel คืนค่าเดิม, init month ตาม value/today, preset click sync + highlight, onSelect custom (2-click + swap end<start), onDayClick nav outside day, ปุ่มตกลง disabled ตอน range ไม่ครบ, responsive `useIsMobile(640)` (1 vs 2 เดือน + preset ซ้อน), `useScrollLock` เมื่อเปิด, import `react-day-picker/style.css` + override RDP CSS vars → semantic token (Viriyah palette), recompute today ทุกครั้งที่เปิด. Done = ครบทุก behavior REQ-1/3/4/5 + contract REQ-6.1/6.2, typecheck เขียว.
     Satisfies: REQ-1, REQ-2 (2.1/2.3/2.4 UI), REQ-3, REQ-4, REQ-5, REQ-6 (6.1/6.2). Depends on: 1, 2. Verify: `npm run build` + `/run` (เปิด popover, 2-click range, preset highlight, ปุ่ม disabled, responsive).

- [ ] 4. Wire แทน DateInput ใน order-list-toolbar — แทน `DateInput` เดิมด้วย `<DateRangeField>` (คง grid/layout เดิมของ `OrderListToolbar`), ลบ `DateInput` ที่กลายเป็น orphan, value/onChange ยัง local/no-op (UI-only). Done = toolbar render picker ใหม่ในตำแหน่งเดิม, ไม่แตะ `order-list-view.tsx`/`PaymentSession`, build เขียว.
     Satisfies: REQ-6 (6.3 drop-in, 6.4 no data wiring). Depends on: 3. Verify: `npm run build` + `/run` (/order/list เห็น field วันที่ใหม่).

## Suggested execution batches

> Feature นี้ COUPLED (task 2 → 3 → 4 แชร์ lib/component/type เดียวกัน) → รันทั้งหมดใน session เดียว:
> `scripts/pane-loop.sh date-range-picker all-in-one` หรือ `/spec-implement all`.
> แยก session เฉพาะถ้าจะ isolate task 2 (pure logic) กัน long-context drift — เป็น accuracy trade ไม่ใช่ cost win.
