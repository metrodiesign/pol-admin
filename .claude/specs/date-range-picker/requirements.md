# Requirements: Date Range Picker (order list toolbar)

> Status: approved 2026-07-30, amended 2026-07-30

## Overview

order-list-toolbar.tsx มีช่อง "วันที่" ที่ยังเป็น text input static ที่ไม่ผูก interaction ใดๆ
(`ponytail: visual only, ยังไม่ wire`). ฟีเจอร์นี้แทนที่ input นั้นด้วย date-range picker เต็มรูปแบบ —
preset ลัด + calendar คู่ (พ.ศ.) — ให้ operator/finance admin เลือกช่วงวันที่กรองรายการคำสั่งซื้อได้เร็วขึ้น
ตรงกับ Transactions feature ใน [PROJECT_CONTEXT.md](../../../.ai/shared/PROJECT_CONTEXT.md) ("list + filter").
สโคปรอบนี้คือ **UI component เท่านั้น** — ยังไม่ต่อ filter จริงเข้าข้อมูล (การเพิ่ม field date ใน
`PaymentSession` และ wire เข้า `order-list-view.tsx` เป็นงานถัดไป นอก scope).

## REQ-1: เปิด/ปิด picker

**User Story:** As an operator, I want to open a date-range picker from the toolbar's date field, so that I can pick a range without typing.

**Acceptance Criteria (EARS):**
- 1.1  THE SYSTEM SHALL แสดง picker เป็น popover/dialog ที่ผูกกับ trigger field "วันที่" ในตำแหน่งเดิมของ `order-list-toolbar.tsx`
- 1.2  WHEN ผู้ใช้คลิก trigger field (ทั้ง input หรือปุ่ม calendar icon) THE SYSTEM SHALL เปิด popover
- 1.6  WHEN เปิด popover ขณะ trigger ยังไม่มีค่า commit (value = null) THE SYSTEM SHALL แสดง calendar โดยเดือนซ้าย = เดือนปัจจุบัน และเดือนขวา = เดือนถัดไป
- 1.7  WHEN เปิด popover ขณะ trigger มีค่า commit อยู่แล้ว (value != null) THE SYSTEM SHALL เลื่อน calendar ให้เดือนซ้าย = เดือนของ `value.start` (เดือนขวา = เดือนถัดไปตามปกติ) เพื่อให้เห็น selection เดิมทันที
- 1.3  WHEN ผู้ใช้คลิกนอก popover THE SYSTEM SHALL ปิด popover โดยไม่ commit การเลือกที่ยังไม่กด "ตกลง"
- 1.4  WHEN ผู้ใช้กด Escape ขณะ popover เปิดอยู่ THE SYSTEM SHALL ปิด popover โดยไม่ commit การเลือก
- 1.5  WHILE popover เปิดอยู่ THE SYSTEM SHALL ล็อก scroll ของหน้าหลังไม่ให้เลื่อนตาม (ถ้าใช้ portal/dialog overlay)

## REQ-2: Preset ลัด

**User Story:** As an operator, I want quick preset ranges, so that I don't have to click through the calendar for common ranges.

**Acceptance Criteria (EARS):**
- 2.1  THE SYSTEM SHALL แสดง preset list ทางซ้ายของ popover ตามลำดับ: วันนี้, เมื่อวาน, 7 วันล่าสุด, 30 วันล่าสุด, เดือนนี้, เดือนที่แล้ว, กำหนดเอง
- 2.2  WHEN ผู้ใช้คลิก preset ที่ไม่ใช่ "กำหนดเอง" THE SYSTEM SHALL คำนวณช่วงวันที่ตาม preset นั้นทันที (relative ต่อวันที่ปัจจุบันของ client) และ highlight preset ที่เลือกอยู่ ตามนิยาม:
  - วันนี้: start = end = today
  - เมื่อวาน: start = end = today - 1
  - 7 วันล่าสุด: start = today - 6, end = today (inclusive รวมวันนี้ = 7 วันพอดี)
  - 30 วันล่าสุด: start = today - 29, end = today (inclusive รวมวันนี้ = 30 วันพอดี)
  - เดือนนี้: start = วันที่ 1 ของเดือนปัจจุบัน, end = วันสุดท้ายของเดือนปัจจุบัน (เต็มเดือนปฏิทิน)
  - เดือนที่แล้ว: start = วันที่ 1 ของเดือนก่อนหน้า, end = วันสุดท้ายของเดือนก่อนหน้า (เต็มเดือนปฏิทิน)
- 2.3  WHEN ผู้ใช้คลิก preset (2.2) THE SYSTEM SHALL sync ค่าที่คำนวณได้ไปแสดงบน calendar (เดือน/วันที่ highlight ตรงกัน) โดยยังไม่ commit จนกว่าจะกด "ตกลง"
- 2.4  WHEN ผู้ใช้คลิก "กำหนดเอง" THE SYSTEM SHALL ให้ผู้ใช้เลือกวันที่เองบน calendar โดยไม่ auto-fill ช่วงใดๆ
- 2.5  WHILE ช่วงวันที่ที่เลือกอยู่ตรงกับ preset ใด THE SYSTEM SHALL highlight preset นั้นเป็น active state; ถ้าไม่ตรง preset ใดเลย THE SYSTEM SHALL highlight "กำหนดเอง"

## REQ-3: Calendar คู่ (dual month) แบบ พ.ศ.

**User Story:** As a Thai-speaking staff user, I want a two-month calendar in Buddhist Era, so that ranges spanning months are easy to see and match local convention.

**Acceptance Criteria (EARS):**
- 3.1  THE SYSTEM SHALL แสดง calendar 2 เดือนติดกัน (เดือนซ้าย และเดือนถัดไปทางขวา) พร้อมกันบน desktop viewport
- 3.2  THE SYSTEM SHALL แสดงหัวเดือนเป็นภาษาไทยรูปแบบ "<ชื่อเดือนเต็มภาษาไทย> <ปี พ.ศ.>" (เช่น "กรกฎาคม 2569")
- 3.3  THE SYSTEM SHALL แสดงหัววันเป็นอักษรย่อวันภาษาไทย (อา จ อ พ พฤ ศ ส) โดยสัปดาห์เริ่มวันอาทิตย์
- 3.4  WHEN ผู้ใช้คลิกลูกศร "ก่อนหน้า"/"ถัดไป" THE SYSTEM SHALL เลื่อน calendar ทั้งคู่ไปทีละ 1 เดือน โดยยังคงล็อกเดือนขวา = เดือนซ้าย + 1 เสมอ
- 3.5  WHEN ผู้ใช้คลิกวันแรก (start) THE SYSTEM SHALL ตั้งวันนั้นเป็นจุดเริ่มต้นของช่วง และรอวันที่สองเพื่อกำหนดจุดสิ้นสุด
- 3.6  WHEN ผู้ใช้คลิกวันที่สอง (end) ที่มาหลังวันเริ่มต้น THE SYSTEM SHALL ปิดช่วงและ highlight ทุกวันระหว่างจุดเริ่มต้นและจุดสิ้นสุด (รวมทั้งสองปลาย) ทั้งสอง calendar
- 3.7  IF ผู้ใช้คลิกวันที่สองที่มาก่อนวันเริ่มต้น THEN THE SYSTEM SHALL สลับให้วันที่คลิกล่าสุดกลายเป็นจุดเริ่มต้นใหม่ และรอจุดสิ้นสุดถัดไป
- 3.8  WHEN ผู้ใช้คลิกวันเดิมซ้ำเป็นทั้งจุดเริ่มต้นและจุดสิ้นสุด THE SYSTEM SHALL ยอมรับช่วง 1 วัน (start = end)
- 3.9  THE SYSTEM SHALL ไม่แสดงวันของเดือนก่อนหน้า/ถัดไปที่ล้นเข้ามาในตาราง (ช่องว่างเปล่า) — เลื่อนเดือนผ่าน nav/dropdown เท่านั้น

## REQ-4: แถบสรุปและปุ่มยืนยัน

**User Story:** As an operator, I want to see the selected range as text and confirm or cancel explicitly, so that I don't apply an unintended filter accidentally.

**Acceptance Criteria (EARS):**
- 4.1  THE SYSTEM SHALL แสดงแถบล่างของ popover เป็นข้อความสรุปช่วงที่เลือกรูปแบบ "<D> <เดือนย่อ>. <ปี พ.ศ.> - <D> <เดือนย่อ>. <ปี พ.ศ.>" (เช่น "30 ก.ค. 2569 - 30 ก.ค. 2569")
- 4.2  THE SYSTEM SHALL แสดงปุ่ม "ยกเลิก" และ "ตกลง" ที่แถบล่างของ popover
- 4.3  WHEN ผู้ใช้กด "ตกลง" THE SYSTEM SHALL commit ช่วงวันที่ที่เลือกเป็นค่าใหม่ของ trigger field, ปิด popover, และเรียก `onChange` callback ที่รับ `{ start, end }`
- 4.4  WHEN ผู้ใช้กด "ยกเลิก" THE SYSTEM SHALL ปิด popover โดยคืนค่ากลับเป็นค่าที่ commit ไว้ล่าสุด (ทิ้งการเลือกที่ยังไม่ยืนยัน)
- 4.5  IF ช่วงที่เลือกยังไม่ครบ (ยังไม่มีจุดเริ่มต้น หรือมีจุดเริ่มต้นแต่ยังไม่มีจุดสิ้นสุด) THEN THE SYSTEM SHALL disable ปุ่ม "ตกลง" — ครอบทั้งกรณี fresh ที่ยังไม่คลิกอะไร และกรณีเลือกครึ่งเดียว
- 4.6  WHEN trigger field ยังไม่เคยถูก commit ค่าใด THE SYSTEM SHALL แสดง placeholder "กำหนดเอง" ใน trigger field ตามรูปอ้างอิง

## REQ-5: Responsive

**User Story:** As a staff user on a small screen, I want the picker to remain usable, so that filtering works on mobile/tablet too.

**Acceptance Criteria (EARS):**
- 5.1  WHILE viewport กว้างน้อยกว่า breakpoint `sm` (ตาม Tailwind config ของโปรเจกต์) THE SYSTEM SHALL แสดง calendar เพียง 1 เดือนแทนคู่ 2 เดือน
- 5.2  WHILE viewport กว้างน้อยกว่า breakpoint `sm` THE SYSTEM SHALL ซ้อน preset list ไว้เหนือ calendar (แนวตั้ง) แทนวางข้างกัน (แนวนอน)
- 5.3  THE SYSTEM SHALL คงปุ่ม "ยกเลิก"/"ตกลง" ให้กดถึงได้เสมอโดยไม่โดนบัง (เช่น sticky footer) แม้เนื้อหาปฏิทิน scroll

## REQ-6: Component contract

**User Story:** As a developer wiring this into the toolbar later, I want a self-contained component with a clean prop API, so that connecting real data is a small follow-up task.

**Acceptance Criteria (EARS):**
- 6.1  THE SYSTEM SHALL export a component รับ props อย่างน้อย `value: { start: Date; end: Date } | null`, `onChange: (range: { start: Date; end: Date }) => void`, `label: string`
- 6.2  THE SYSTEM SHALL ไม่เรียก network หรือ mock data ใดๆ ภายใน component นี้ (pure UI, controlled)
- 6.3  WHERE component ถูกวางแทนที่ `DateInput` เดิมใน `order-list-toolbar.tsx` THE SYSTEM SHALL คงตำแหน่ง/grid layout เดิมของ toolbar โดยไม่ต้องแก้ grid ของ `OrderListToolbar`
- 6.4  THE SYSTEM SHALL ไม่แก้ `order-list-view.tsx` หรือ `PaymentSession` type ใน scope นี้ (ตาม REQ นอกขอบเขต ข้อ Data wiring)

## Edge Cases & Open Questions

- Locale/timezone ของ "วันนี้" อ้างอิง client local time — ไม่มี server time sync ในสโคปนี้ (ระบบยังไม่มี backend จริงตาม Non-Goals)
- Dependency ที่จะเลือกใช้ (เช่น react-day-picker) ต้อง review license/maintenance ตาม Dependency rules — ตัดสินใจใน design phase ไม่ใช่ requirements
- ปีสูงสุด/ต่ำสุดที่ calendar navigate ได้ (min/max date) — ยังไม่ระบุ ถ้าไม่ล็อกจะถือว่า navigate ได้ไม่จำกัด (default ของ lib ที่เลือก)
- Keyboard navigation เต็มรูปแบบ (arrow keys เลื่อนวัน, focus trap) — ไม่ระบุใน acceptance criteria ชัดเจน แต่ควรได้ default จาก lib ที่มี a11y ในตัว ถ้าเลือก lib ที่ไม่มีต้อง flag ใน design

### /spec-analyze findings (anchor: uncommitted — requirements.md ยังไม่ commit ตอน analyze)

- A1 (ambiguity, REQ-2.2) — นิยาม "เดือนนี้"/"เดือนที่แล้ว": **เลือก a** เต็มเดือนปฏิทิน (วันที่ 1 ถึงสิ้นเดือน) → แก้ REQ-2.2 เพิ่มนิยาม preset ครบทุกตัว. เหตุผล: ตรง convention date-range picker มาตรฐาน; "month to date" เป็น preset คนละตัว ไม่ยัดรวม
- A2 (ambiguity, REQ-2.2) — "7/30 วันล่าสุด" นับ today ไหม: **เลือก a** inclusive (today-6/today-29 ถึง today) → แก้ REQ-2.2. เหตุผล: ตรง intuition ภาษาไทย + lib default
- A3 (gap, REQ-1.2) — เดือน default ตอนเปิดครั้งแรก (ไม่มีค่า): **เลือก a** เดือนปัจจุบัน left + เดือนถัดไป right → เพิ่ม REQ-1.6. เหตุผล: ตรงรูปอ้างอิง
- A4 (gap, REQ-1.2/REQ-6.1) — เดือน default ตอนเปิดขณะมี value: **เลือก a** เลื่อนไปเดือนของ start เดิม → เพิ่ม REQ-1.7. เหตุผล: เห็น selection ทันที ไม่ต้องกดย้อนเอง
- A5 (ambiguity, REQ-4.5) — เงื่อนไข disable "ตกลง": **เลือก a** disable เมื่อ start หรือ end ยังไม่ครบ → แก้ REQ-4.5. เหตุผล: ครอบทั้ง fresh + half-selected, กัน commit ช่วงพัง
