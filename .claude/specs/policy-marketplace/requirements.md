# Requirements: Policy Marketplace (รับชำระเบี้ย)

> Status: approved 2026-06-17, amended 2026-06-17

> Scope change (2026-06-17, ตามคำสั่ง user): ลบ status tabs (REQ-2 ทั้งหมด) และปุ่ม
> "ส่งออก CSV" ออกจาก UI. status filter ไม่มีแล้ว (แสดงทุกสถานะ); search + filter
> ประเภท/ที่มา + stub (date, ตัวกรองเพิ่มเติม) ยังอยู่ (REQ-3 ลบเฉพาะ CSV ใน 3.5).
> REQ-2.* ถือว่า out of scope; logic `countByStatus`/`STATUS_ORDER` คงไว้ใน lib เผื่อใช้ภายหลัง.

## Overview

หน้าจอ "กรมธรรม์" ของ POL admin ที่แสดงกรมธรรม์เป็นรายการแบบ marketplace ให้เจ้าหน้าที่
รับชำระเบี้ยเลือกใบที่ถึงรอบชำระ "เพิ่มลงตะกร้า" (ตะกร้ารับชำระเบี้ย) แล้วดำเนินการชำระเบี้ย
รวมทีเดียว เพื่อลดการเปิดทำงานทีละใบ. ฟีเจอร์นี้ต่อยอดจาก PROJECT_CONTEXT (งาน payment
operations) และยังเป็น mock (ไม่มี backend จริง) ใช้ข้อมูลใน `src/lib/mock/` ตาม pattern เดิม.
ขอบเขต phase นี้ครอบคลุมเฉพาะหน้า list + ตะกร้า + confirm modal — ไม่รวม payment link/PSP,
backend, หรือหน้า detail กรมธรรม์.

## REQ-1: แสดงรายการกรมธรรม์ (Policy list)

**User Story:** As a เจ้าหน้าที่รับชำระเบี้ย, I want เห็นรายการกรมธรรม์พร้อมข้อมูลสำคัญในตาราง,
so that ฉันประเมินและเลือกใบที่ต้องรับชำระได้.

**Acceptance Criteria (EARS):**
- 1.1 THE SYSTEM SHALL แสดงตารางกรมธรรม์ โดยแต่ละแถวมีคอลัมน์: เลขกรมธรรม์ (พร้อมวันเริ่มคุ้มครอง), ลูกค้า (พร้อมเบอร์โทร), ประเภท/แผน, ที่มา (รหัส + ช่องทาง), ทุนประกัน, เบี้ย/งวด (พร้อมความถี่), งวดถัดไป (วันที่ + งวดที่ n), และสถานะ
- 1.2 THE SYSTEM SHALL จัดรูปจำนวนเงินเป็นสกุลบาทมี thousands separator โดยทุนประกันไม่มีทศนิยม และเบี้ยมีทศนิยม 2 ตำแหน่ง
- 1.3 THE SYSTEM SHALL แสดงสถานะกรมธรรม์เป็น badge ที่มีทั้งจุดสี (dot) และข้อความ ครอบคลุม 5 สถานะ: มีผลบังคับ (active), ใกล้ครบกำหนด (due_soon), รอชำระเบี้ย (awaiting), ขาดอายุ (lapsed), ยกเลิก (cancelled)
- 1.4 THE SYSTEM SHALL รองรับการเรียงลำดับ (sort) ได้บนคอลัมน์ เลขกรมธรรม์, ทุนประกัน, เบี้ย/งวด และงวดถัดไป โดย default ตอนโหลดเรียงตามเลขกรมธรรม์จากน้อยไปมาก (ascending)
- 1.6 THE SYSTEM SHALL แบ่งหน้า (pagination) ด้วยตัวเลือกจำนวนแถวต่อหน้า
- 1.5 IF ไม่มีแถวที่ตรงกับ filter/search ปัจจุบัน THEN THE SYSTEM SHALL แสดง empty state พร้อม context ของคำค้น

## REQ-2: กรองตามสถานะด้วย tabs + จำนวนนับ

**User Story:** As a เจ้าหน้าที่, I want กรองกรมธรรม์ตามสถานะจาก tabs ที่บอกจำนวน,
so that ฉันโฟกัสกลุ่มที่ต้องรับชำระได้เร็ว.

**Acceptance Criteria (EARS):**
- 2.1 THE SYSTEM SHALL แสดง tabs สถานะ: ทั้งหมด, มีผลบังคับ, ใกล้ครบกำหนด, รอชำระเบี้ย, ขาดอายุ, ยกเลิก พร้อม badge จำนวนนับต่อ tab
- 2.2 THE SYSTEM SHALL คำนวณจำนวนนับของแต่ละ tab จากชุดข้อมูลทั้งหมด (ไม่ขึ้นกับ pagination)
- 2.3 WHEN ผู้ใช้เลือก tab สถานะ THE SYSTEM SHALL กรองตารางให้เหลือเฉพาะกรมธรรม์สถานะนั้น และรีเซ็ตหน้าเป็นหน้าแรก
- 2.4 WHEN ผู้ใช้เลือก tab "ทั้งหมด" THE SYSTEM SHALL แสดงกรมธรรม์ทุกสถานะ

## REQ-3: ค้นหาและตัวกรอง

**User Story:** As a เจ้าหน้าที่, I want ค้นหาด้วยเลขกรมธรรม์/ลูกค้า และกรองด้วยประเภท/ช่วงวันที่เริ่มคุ้มครอง,
so that ฉันหาใบที่ต้องการได้ตรง.

**Acceptance Criteria (EARS):**
- 3.1 WHEN ผู้ใช้พิมพ์คำค้น THE SYSTEM SHALL กรองตารางให้เหลือเฉพาะแถวที่เลขกรมธรรม์หรือชื่อลูกค้าตรงกับคำค้น (case-insensitive) และรีเซ็ตหน้าเป็นหน้าแรก
- 3.2 WHEN ผู้ใช้เลือกตัวกรองประเภท THE SYSTEM SHALL กรองตารางให้เหลือเฉพาะกรมธรรม์ประเภทนั้น และรีเซ็ตหน้าเป็นหน้าแรก
- 3.3 WHEN ผู้ใช้กรอกวันที่เริ่มต้น และ/หรือ วันที่สิ้นสุด (รูปแบบ YYYY-MM-DD) THE SYSTEM SHALL กรองตารางให้เหลือเฉพาะกรมธรรม์ที่ effectiveDate อยู่ในช่วง และรีเซ็ตหน้าเป็นหน้าแรก (amended 2026-06-17: เดิม "ตัวกรองที่มา")
- 3.4 THE SYSTEM SHALL นำ search, ตัวกรองประเภท และช่วงวันที่ มา apply ร่วมกันแบบ AND
- 3.5 WHERE date input ไม่ใช่ YYYY-MM-DD เต็ม THE SYSTEM SHALL ไม่ใช้ค่านั้นกรอง (free-text แบบ /dashboard/invoice/list); ปุ่ม "ตัวกรองเพิ่มเติม" ยังเป็น UI stub

## REQ-4: เพิ่มกรมธรรม์ลงตะกร้ารับชำระเบี้ย

**User Story:** As a เจ้าหน้าที่, I want เพิ่มกรมธรรม์ที่ถึงรอบชำระลงตะกร้า,
so that ฉันรวมหลายใบเพื่อรับชำระทีเดียว.

**Acceptance Criteria (EARS):**
- 4.1 THE SYSTEM SHALL อนุญาตให้เพิ่มกรมธรรม์ใบใดก็ได้ลงตะกร้า โดยไม่จำกัดสถานะ (amended 2026-06-17, user: ครบทุกรายการ)
- 4.2 THE SYSTEM SHALL แสดงปุ่ม "เพิ่มลงตะกร้า" บนทุกแถว (amended 2026-06-17)
- 4.3 WHERE แถวเป็นกรมธรรม์สถานะใดก็ได้ THE SYSTEM SHALL แสดงปุ่มเพิ่มลงตะกร้าและซื้อเลย (amended 2026-06-17: เดิมซ่อนปุ่มบนแถวที่ไม่ eligible — ยกเลิก)
- 4.4 WHEN ผู้ใช้กดเพิ่มลงตะกร้าบนกรมธรรม์ที่ยังไม่อยู่ในตะกร้า THE SYSTEM SHALL เพิ่มกรมธรรม์นั้นเข้าตะกร้า
- 4.5 WHILE กรมธรรม์อยู่ในตะกร้าแล้ว THE SYSTEM SHALL แสดงปุ่มบนแถวนั้นเป็นสถานะ "อยู่ในตะกร้า" และกดซ้ำเพื่อนำออกจากตะกร้าได้
- 4.6 THE SYSTEM SHALL ไม่จำกัดสถานะกรมธรรม์ในการเพิ่มลงตะกร้า (amended 2026-06-17: ยกเลิก eligibility gate เดิมที่ reject แถวไม่ eligible)
- 4.7 THE SYSTEM SHALL ไม่เพิ่มกรมธรรม์ซ้ำในตะกร้า (กรมธรรม์เดียวกันมีได้ไม่เกิน 1 รายการ)

## REQ-5: Panel ตะกร้ารับชำระเบี้ย

**User Story:** As a เจ้าหน้าที่, I want เห็นตะกร้าค้างอยู่ข้างขวาตลอด,
so that ฉันติดตามใบที่เลือกและยอดรวมได้ตลอดเวลา.

**Acceptance Criteria (EARS):**
- 5.1 WHILE ความกว้างจอ ≥ breakpoint mlg THE SYSTEM SHALL แสดง panel ตะกร้าค้างไว้ทางขวาของหน้าจอ พร้อมหัวข้อ "ตะกร้ารับชำระเบี้ย" และจำนวนกรมธรรม์ในตะกร้า (รูปแบบ panel ในจอเล็กดู REQ-8.4)
- 5.2 WHILE ตะกร้าว่าง THE SYSTEM SHALL แสดง empty state พร้อมคำแนะนำว่าเพิ่มกรมธรรม์ใบใดก็ได้ลงตะกร้า (amended 2026-06-17)
- 5.3 WHILE ตะกร้ามีรายการ THE SYSTEM SHALL แสดงแต่ละรายการพร้อมเลขกรมธรรม์ ชื่อลูกค้า เบี้ย และปุ่มนำออก
- 5.4 THE SYSTEM SHALL แสดงเบี้ยรวม (sum ของเบี้ยทุกรายการในตะกร้า) และจำนวนรายการ และอัปเดตทันทีเมื่อเพิ่มหรือนำรายการออก
- 5.5 WHEN ผู้ใช้กดนำรายการออกจาก panel THE SYSTEM SHALL นำกรมธรรม์นั้นออกจากตะกร้าและปรับยอดรวม/จำนวน
- 5.6 THE SYSTEM SHALL เก็บสถานะตะกร้าแบบ in-memory เท่านั้น (ไม่ persist ข้าม reload)

## REQ-6: ดำเนินการชำระเบี้ยจากตะกร้า (confirm modal)

**User Story:** As a เจ้าหน้าที่, I want กดดำเนินการแล้วเห็นสรุปก่อนยืนยัน,
so that ฉันตรวจรายการและยอดก่อนรับชำระ.

**Acceptance Criteria (EARS):**
- 6.1 WHILE ตะกร้ามีอย่างน้อย 1 รายการ THE SYSTEM SHALL เปิดใช้งานปุ่ม "ดำเนินการชำระเบี้ย"
- 6.2 WHILE ตะกร้าว่าง THE SYSTEM SHALL แสดงปุ่มดำเนินการชำระเบี้ยในสถานะ disabled (กดไม่ได้)
- 6.3 WHEN ผู้ใช้กดดำเนินการชำระเบี้ย THE SYSTEM SHALL เปิด confirm modal ที่แสดงรายการกรมธรรม์ทั้งหมดในตะกร้าและยอดเบี้ยรวม
- 6.4 WHEN ผู้ใช้ยืนยันใน modal THE SYSTEM SHALL ทำงานแบบ mock (ไม่เรียก backend), แสดง success toast, และเคลียร์ตะกร้า
- 6.5 WHEN ผู้ใช้ยกเลิก modal THE SYSTEM SHALL ปิด modal โดยไม่เปลี่ยนแปลงตะกร้า

## REQ-7: ซื้อเลย (checkout ใบเดียว)

**User Story:** As a เจ้าหน้าที่, I want กด "ซื้อเลย" บนกรมธรรม์ใบเดียวเพื่อรับชำระทันที,
so that ฉันจัดการใบเร่งด่วนได้โดยไม่ต้องผ่านตะกร้า.

**Acceptance Criteria (EARS):**
- 7.1 THE SYSTEM SHALL แสดงปุ่ม "ซื้อเลย" บนทุกแถว (amended 2026-06-17, user: ครบทุกรายการ)
- 7.2 WHEN ผู้ใช้กด "ซื้อเลย" THE SYSTEM SHALL เปิด confirm modal สรุปเฉพาะกรมธรรม์ใบนั้นและยอดเบี้ยของใบนั้น
- 7.3 WHEN ผู้ใช้ยืนยัน confirm modal ของซื้อเลย THE SYSTEM SHALL ทำงานแบบ mock และแสดง success toast
- 7.4 THE SYSTEM SHALL ทำให้ "ซื้อเลย" ไม่กระทบสถานะตะกร้า (ไม่เพิ่ม/ลบรายการในตะกร้า)

## REQ-8: Layout, responsive, navigation

**User Story:** As a เจ้าหน้าที่, I want เข้าถึงหน้านี้จากเมนูและใช้งานได้ทุกขนาดจอ,
so that ฉันทำงานได้สะดวกบนอุปกรณ์ต่าง ๆ.

**Acceptance Criteria (EARS):**
- 8.1 THE SYSTEM SHALL ให้เข้าถึงหน้าได้ที่ route `/policy/list` ภายใต้ shell เดียวกับหน้า user/role (MinimalsLayout) พร้อม PageHeader + breadcrumbs
- 8.2 THE SYSTEM SHALL เพิ่มเมนู "กรมธรรม์" ใน sidebar nav ที่ active บน path `/policy` และ sub-paths
- 8.3 WHILE ความกว้างจอ ≥ breakpoint mlg THE SYSTEM SHALL แสดง panel ตะกร้าเป็นคอลัมน์ inline ค้างขวา
- 8.4 WHILE ความกว้างจอ < breakpoint mlg THE SYSTEM SHALL ยุบ panel ตะกร้าเป็น sheet/drawer ที่เปิดด้วยปุ่ม โดยใช้เนื้อหาเดียวกับ panel
- 8.5 THE SYSTEM SHALL ไม่ทำให้เกิด horizontal overflow ของหน้า (ตารางเลื่อนแนวนอนภายใน card เท่านั้น)

## REQ-9: Accessibility และมาตรฐานโค้ด

**User Story:** As a ผู้ใช้ที่พึ่ง keyboard/screen reader, I want ใช้งานทุกการกระทำได้,
so that ฉันรับชำระได้โดยไม่ต้องใช้เมาส์.

**Acceptance Criteria (EARS):**
- 9.1 THE SYSTEM SHALL ให้ปุ่มเพิ่มลงตะกร้า, นำออก, ซื้อเลย และดำเนินการชำระเบี้ย มี aria-label ที่สื่อความหมายและกระทำได้ด้วย keyboard
- 9.2 THE SYSTEM SHALL ให้สถานะกรมธรรม์สื่อด้วยทั้งสีและข้อความ (ไม่พึ่งสีอย่างเดียว)
- 9.3 THE SYSTEM SHALL ให้ทุก control ที่ interactive มี focus state ที่มองเห็นได้
- 9.4 THE SYSTEM SHALL แยก business logic (eligibility, การรวมเบี้ย, การจัดรูปเงิน) ออกจาก presentation และไม่ใช้ `any`

## Edge Cases & Open Questions

- การเปลี่ยน tab/filter ขณะมีรายการในตะกร้า: ตะกร้าต้องคงรายการเดิมไว้ (ตะกร้าอ้างอิงข้อมูลทั้งหมด ไม่ใช่เฉพาะที่ filter เห็น) — ดู REQ-5.6
- กรมธรรม์ที่อยู่ในตะกร้าแล้วถูก filter ออกจากมุมมอง: ยังคงอยู่ในตะกร้าและนับในยอดรวม
- คลิกแถว (row click): phase นี้ไม่มีหน้า detail → ไม่ทำงาน (no-op)
- จำนวน mock: เป้าหมาย ~48 records กระจาย active 34 / due_soon 6 / awaiting 4 / lapsed 2 / cancelled 2 ให้ตรง count ใน tab
- ความถี่เบี้ย (frequency) แสดงเป็นข้อความไทย: monthly = รายเดือน, quarterly = ราย 3 เดือน, yearly = รายปี

### Findings log — /spec-analyze (anchor: untracked at audit; repo HEAD 2ab1cd4)

- F1 (REQ-5.1 vs 8.4, conflict) — แก้: qualify 5.1 เป็น WHILE ≥ mlg (desktop-only) ให้สอดคล้อง 8.4
- F2 (REQ-1.4, gap sort) — แก้: sortable = เลขกรมธรรม์/ทุนประกัน/เบี้ย/งวดถัดไป, default = เลขกรมธรรม์ asc (ย้าย pagination เป็น 1.6)
- F3 (REQ-3 date filter, gap) — แก้: date = stub รวมกับ CSV/ตัวกรองเพิ่มเติม ใน 3.5
- F4 (REQ-6.2, ambiguity) — แก้: ปุ่มดำเนินการตอนตะกร้าว่าง = disabled (ไม่ซ่อน)
- F5 (REQ-1.2, ambiguity ทศนิยม) — แก้ (default): ทุนประกัน 0 ทศนิยม, เบี้ย 2 ทศนิยม
- F6 (REQ-3.2/3.3 reset page, gap) — แก้ (default): filter ประเภท/ที่มา reset หน้าเป็นหน้าแรกเหมือน search/tab
- F7 (REQ-6/7 confirm modal shared?, defer) — ไม่แก้ requirements: เป็น design concern — resolve ใน /spec-design (component เดียว parameterized หรือแยก)
- F8 (toast dismiss/duration, dismissed) — ไม่แก้: รายละเอียด UX ระดับ implementation ไม่ต้องยกเป็น REQ
