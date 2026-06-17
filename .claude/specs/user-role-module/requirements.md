# Requirements: User RBAC Module

> Status: approved 2026-06-17, amended 2026-06-17

## Overview

โมดูล "บทบาทและสิทธิ์" (RBAC) เป็นหน้าจอ admin ภายในของ POL สำหรับจัดการบทบาท (role) และสิทธิ์
(permission) แบบ Dynamic — สร้าง/แก้ไข/ลบบทบาทได้ไม่จำกัดจำนวน และกำหนดสิทธิ์ให้แต่ละบทบาทแบบ
Resource x Action. สอดคล้องกับ PROJECT_CONTEXT (System Admin คุมการจัดการ user/role). โมดูลนี้เป็น
frontend-only ตาม stack ของ repo: ข้อมูลเริ่มต้น seed จาก typed mock, ไม่มี backend, ไม่มี persistence
จริง — ปุ่ม/ฟอร์ม CRUD มีครบเป็น UI-shell แต่ไม่ commit ค่าข้ามการ reload. โมดูลแยกขาดจาก User
Management เดิม (`src/app/user/*`, `src/components/user/*`) โดยสร้าง route ใหม่ `src/app/user/role/*`
และ component ชุดใหม่ ห้ามแก้/แชร์ของเดิม. แหล่งอ้างอิงภาพ: `ui-reference.md`.

## REQ-1: เข้าถึงโมดูลผ่านเมนูนำทาง

**User Story:** As a System Admin, I want เมนู "บทบาทและสิทธิ์" ถัดจาก "ผู้ใช้งาน", so that เข้าหน้า
จัดการ RBAC ได้จาก sidebar.

**Acceptance Criteria (EARS):**
- 1.1  THE SYSTEM SHALL แสดงรายการเมนู label `บทบาทและสิทธิ์` path `/user/role` ภายใต้ subheader
  `ผู้ใช้งาน & สิทธิ์` ใน sidebar nav
- 1.2  THE SYSTEM SHALL จัดลำดับเมนู `บทบาทและสิทธิ์` ให้อยู่ถัดจากรายการ `ผู้ใช้งาน` ทันที (index +1)
- 1.3  WHEN ผู้ใช้อยู่ที่ path ขึ้นต้นด้วย `/user/role` THE SYSTEM SHALL ทำให้รายการเมนู
  `บทบาทและสิทธิ์` อยู่สถานะ active
- 1.4  THE SYSTEM SHALL ไม่เปลี่ยนแปลง state/behaviour ของรายการเมนู `ผู้ใช้งาน` เดิม

## REQ-2: แยกโมดูลออกจาก User Management เดิม

**User Story:** As a maintainer, I want โมดูล RBAC แยกไฟล์ของตัวเอง, so that แก้ RBAC แล้วไม่กระทบ
หน้าผู้ใช้งานเดิม.

**Acceptance Criteria (EARS):**
- 2.1  THE SYSTEM SHALL วาง route ของโมดูลไว้ใต้ `src/app/user/role/` เท่านั้น
- 2.2  THE SYSTEM SHALL วาง presentation component ของโมดูลไว้ในไดเรกทอรีใหม่แยกจาก
  `src/components/user/` เดิม
- 2.3  THE SYSTEM SHALL ไม่แก้ไขไฟล์ใดใน `src/app/user/{list,new,edit,read}` และ
  `src/components/user/*` เดิม
- 2.4  THE SYSTEM SHALL ไม่ import presentation component ของ User Management เดิมมาใช้ในโมดูล RBAC
  (อนุญาตใช้ shared primitive กลาง: `components/ui/*`, `components/shared/*`, `components/table/*`,
  `components/form/*`, layout)

## REQ-3: แสดงรายการบทบาท (Roles list)

**User Story:** As a System Admin, I want เห็นบทบาททั้งหมดในตารางเดียว, so that ประเมินสิทธิ์และ
จำนวนผู้ใช้ของแต่ละบทบาทได้รวดเร็ว.

**Acceptance Criteria (EARS):**
- 3.1  THE SYSTEM SHALL แสดงหัวข้อหน้า `บทบาทและสิทธิ์` พร้อม breadcrumb `Console > บทบาทและสิทธิ์`
- 3.2  THE SYSTEM SHALL แสดง subtitle รูปแบบ `RBAC แบบ Dynamic · {N} บทบาท · สร้าง แก้ไข และลบ
  ได้เอง ไม่จำกัดจำนวน` โดย `{N}` เท่ากับจำนวนบทบาทที่แสดงอยู่จริง
- 3.3  THE SYSTEM SHALL แสดงตารางบทบาทที่มีคอลัมน์: บทบาท, คำอธิบาย, สิทธิ์, ผู้ใช้, และแถวปุ่มจัดการ
- 3.4  THE SYSTEM SHALL แสดงคอลัมน์ `บทบาท` เป็น badge สี (จุดสี + ชื่อไทย) เหนือรหัสบทบาทแบบ mono
- 3.5  THE SYSTEM SHALL แสดงคอลัมน์ `สิทธิ์` เป็น progress bar พร้อมข้อความ `{granted}/{total}` โดย
  `total` เท่ากับจำนวน permission ทั้งหมดใน catalog และ `granted` เท่ากับจำนวนสิทธิ์ที่บทบาทนั้นได้รับ
- 3.6  THE SYSTEM SHALL แสดงคอลัมน์ `ผู้ใช้` เป็นไอคอนคน + จำนวนผู้ใช้ที่ผูกกับบทบาทนั้น
- 3.7  THE SYSTEM SHALL แสดงปุ่มจัดการต่อแถว: แก้ไข, ทำสำเนา (duplicate), ลบ
- 3.8  THE SYSTEM SHALL แสดงข้อความท้ายตาราง: `สิทธิ์รวมของผู้ใช้ = union ของสิทธิ์จากทุกบทบาทที่
  ได้รับ · บทบาทที่มีผู้ใช้ผูกอยู่จะลบไม่ได้`
- 3.9  WHILE ไม่มีบทบาทใดในรายการ THE SYSTEM SHALL แสดงสถานะว่าง (empty state) แทนตาราง

## REQ-4: ดูรายละเอียดบทบาทใน drawer

**User Story:** As a System Admin, I want เปิดดูสิทธิ์ทั้งหมดของบทบาทแบบจัดกลุ่ม, so that ตรวจว่า
บทบาทนั้นเข้าถึงอะไรได้บ้าง.

**Acceptance Criteria (EARS):**
- 4.1  WHEN ผู้ใช้เลือกบทบาทหนึ่งจากตาราง THE SYSTEM SHALL เปิด slide-over drawer แสดงรายละเอียด
  บทบาทนั้น
- 4.2  THE SYSTEM SHALL แสดงใน drawer header: ปุ่มปิด, badge+ชื่อบทบาท, `รหัสบทบาท: {code}`, ปุ่ม
  `สำเนา` และปุ่ม `แก้ไข`
- 4.3  THE SYSTEM SHALL แสดง stat card สองใบ: `สิทธิ์ที่ได้รับ {granted}/{total}` และ
  `ผู้ใช้ที่ผูก {count}`
- 4.4  THE SYSTEM SHALL แสดงสิทธิ์แบบจัดกลุ่มตาม resource โดยหัวกลุ่มแต่ละกลุ่มแสดง
  `{grantedInGroup}/{totalInGroup}`
- 4.5  THE SYSTEM SHALL แสดงสิทธิ์ที่บทบาทได้รับแต่ละรายการเป็น เครื่องหมายถูก + label ไทย (ซ้าย) +
  permission key แบบ mono (ขวา)
- 4.6  THE SYSTEM SHALL แสดงปุ่มท้าย drawer: `ลบบทบาท` และ `ปิด`
- 4.7  WHEN ผู้ใช้กดปิด (x หรือ `ปิด` หรือคลิกนอก drawer) THE SYSTEM SHALL ปิด drawer โดยไม่
  เปลี่ยนแปลงข้อมูลบทบาท

## REQ-5: โมเดลสิทธิ์แบบ Resource x Action

**User Story:** As a System Admin, I want สิทธิ์ถูกนิยามเป็น resource.action, so that จัดกลุ่มและเลือก
สิทธิ์ได้เป็นหมวด.

**Acceptance Criteria (EARS):**
- 5.1  THE SYSTEM SHALL นิยาม permission แต่ละรายการด้วย key รูปแบบ `{resource}.{action}`, label ไทย,
  และ resource group ที่สังกัด
- 5.2  THE SYSTEM SHALL จัดหา permission catalog แบบคงที่ (typed) เป็นแหล่งอ้างอิงเดียวของ `total`
  และของรายการสิทธิ์ที่เลือกได้
- 5.3  THE SYSTEM SHALL รับประกันว่า permission key ทุกตัวใน catalog ไม่ซ้ำกัน
- 5.4  THE SYSTEM SHALL กำหนดสิทธิ์ของบทบาทเป็นเซ็ตย่อยของ permission key ใน catalog เท่านั้น
- 5.5  IF บทบาทอ้างถึง permission key ที่ไม่มีใน catalog THEN THE SYSTEM SHALL ไม่นับรวมใน `granted`
  และไม่ทำให้หน้าจอ error

## REQ-6: สร้างบทบาทใหม่

**User Story:** As a System Admin, I want สร้างบทบาทใหม่พร้อมเลือกสิทธิ์, so that รองรับโครงสร้าง
ทีมที่เปลี่ยนไปโดยไม่ต้องแก้โค้ด.

**Acceptance Criteria (EARS):**
- 6.1  WHEN ผู้ใช้กด `เพิ่มบทบาทใหม่` THE SYSTEM SHALL เปิดฟอร์มสร้างบทบาท (ชื่อไทย, รหัสบทบาท,
  คำอธิบาย, สี badge, ตัวเลือกสิทธิ์แบบ matrix ตาม resource)
- 6.2  THE SYSTEM SHALL อนุญาตให้เลือก/ยกเลิกสิทธิ์รายรายการ และเลือก/ยกเลิกทั้ง resource group ได้
- 6.3  WHEN ผู้ใช้บันทึกฟอร์มที่ผ่าน validation THE SYSTEM SHALL ปิดฟอร์มและแสดง toast สำเร็จ (UI-shell:
  ไม่เพิ่มบทบาทเข้ารายการจริง — ดู REQ-10, REQ-13)
- 6.4  IF ชื่อบทบาทหรือรหัสบทบาทว่าง THEN THE SYSTEM SHALL บล็อกการบันทึกและแสดงข้อความ validation
- 6.5  IF รหัสบทบาทซ้ำกับบทบาทที่มีอยู่ THEN THE SYSTEM SHALL บล็อกการบันทึกและแสดงข้อความ validation
- 6.6  THE SYSTEM SHALL ไม่จำกัดจำนวนบทบาทที่สร้างได้

## REQ-7: แก้ไขบทบาท

**User Story:** As a System Admin, I want แก้ชื่อ/คำอธิบาย/สิทธิ์ของบทบาท, so that ปรับสิทธิ์ตามนโยบาย
ที่เปลี่ยน.

**Acceptance Criteria (EARS):**
- 7.1  WHEN ผู้ใช้กด `แก้ไข` (จากแถวตารางหรือใน drawer) THE SYSTEM SHALL เปิดฟอร์มที่ pre-fill ค่า
  ปัจจุบันของบทบาทนั้น
- 7.2  WHEN ผู้ใช้บันทึกการแก้ไขที่ผ่าน validation THE SYSTEM SHALL ปิดฟอร์มและแสดง toast สำเร็จ
  (UI-shell: ไม่ mutate บทบาทจริง — ดู REQ-10, REQ-13)
- 7.3  THE SYSTEM SHALL ล็อกฟิลด์รหัสบทบาท (`code`) ในฟอร์มแก้ไขให้ read-only — code เป็น identity
  คงที่หลังสร้าง (ไม่มี dup-code check ตอนแก้ไข)
- 7.4  IF การแก้ไขทำให้ชื่อบทบาทว่าง THEN THE SYSTEM SHALL บล็อกการบันทึกและแสดงข้อความ validation
- 7.5  WHEN ผู้ใช้ยกเลิกการแก้ไข THE SYSTEM SHALL ปิดฟอร์มโดยไม่เปลี่ยนแปลงบทบาท

## REQ-8: ทำสำเนาบทบาท

**User Story:** As a System Admin, I want ทำสำเนาบทบาทที่มีอยู่, so that สร้างบทบาทใกล้เคียงได้เร็ว.

**Acceptance Criteria (EARS):**
- 8.1  WHEN ผู้ใช้กด `สำเนา` THE SYSTEM SHALL เปิดฟอร์มสร้างบทบาทที่ pre-fill สิทธิ์และคำอธิบายจาก
  บทบาทต้นทาง พร้อมชื่อ/รหัสใหม่ที่ยังไม่ซ้ำ (default: ต่อท้าย `_copy` แล้วเลขลำดับถ้ายังซ้ำ)
- 8.2  THE SYSTEM SHALL ตั้งจำนวนผู้ใช้ที่ผูกของบทบาทสำเนาเป็น 0 ในฟอร์ม

## REQ-9: ลบบทบาท พร้อมการป้องกัน

**User Story:** As a System Admin, I want ลบบทบาทที่ไม่ใช้, so that รายการบทบาทสะอาด — แต่กันการลบ
บทบาทที่ยังมีผู้ใช้ผูกอยู่.

**Acceptance Criteria (EARS):**
- 9.1  WHEN ผู้ใช้สั่งลบบทบาทที่มีจำนวนผู้ใช้ที่ผูก = 0 THE SYSTEM SHALL ขอ confirm ก่อน แล้วปิด
  drawer (ถ้าเปิด) + แสดง toast สำเร็จ (UI-shell: ไม่ลบออกจากรายการจริง — ดู REQ-10, REQ-13)
- 9.2  IF บทบาทมีผู้ใช้ที่ผูก > 0 THEN THE SYSTEM SHALL บล็อกการลบและแสดงเหตุผล (มีผู้ใช้ผูกอยู่)
- 9.3  WHILE บทบาทมีผู้ใช้ที่ผูก > 0 THE SYSTEM SHALL แสดงปุ่มลบในสถานะ disabled (ตารางและ drawer)

## REQ-10: ความหมายของ persistence (read-only mock)

**User Story:** As a stakeholder, I want เข้าใจว่าโมดูลเป็น demo frontend, so that ไม่คาดหวัง
backend จริง.

**Acceptance Criteria (EARS):**
- 10.1  THE SYSTEM SHALL seed รายการบทบาทเริ่มต้นและ permission catalog จาก typed mock
- 10.2  THE SYSTEM SHALL ทำให้ flow สร้าง/แก้ไข/ลบ/สำเนา เป็น UI-shell — ฟอร์ม/drawer/dialog เปิด-ปิดและ
  validate ได้ แต่ปุ่มบันทึก/ลบ ไม่ mutate รายการบทบาท, ไม่เรียก network, ไม่เขียน storage
- 10.3  THE SYSTEM SHALL ให้ subtitle `{N} บทบาท` และตารางสะท้อน mock seed คงที่เสมอ (ไม่เปลี่ยนจาก
  การกระทำ CRUD)

## REQ-11: Accessibility และ interaction states

**User Story:** As any internal user, I want องค์ประกอบ interactive ใช้คีย์บอร์ดได้และมองเห็นชัด, so that
ใช้งานได้ตามมาตรฐานโครงการ.

**Acceptance Criteria (EARS):**
- 11.1  THE SYSTEM SHALL ทำให้ปุ่ม, แถวที่กดได้, checkbox สิทธิ์, และ drawer เข้าถึงด้วยคีย์บอร์ดได้
  และมี focus ที่มองเห็น
- 11.2  THE SYSTEM SHALL ใส่ label/aria ให้ไอคอนปุ่มจัดการ (แก้ไข/สำเนา/ลบ) ที่ไม่มีข้อความกำกับ
- 11.3  THE SYSTEM SHALL ให้สี badge ของบทบาทผ่านเกณฑ์ contrast ที่อ่านออก (ไม่พึ่งสีเพียงอย่างเดียว
  ในการสื่อความหมาย — มีชื่อ/รหัสกำกับ)

## REQ-12: ค้นหา/กรองบทบาทในรายการ

**User Story:** As a System Admin, I want ค้นหาบทบาทในตาราง, so that หาบทบาทได้เร็วเมื่อมีจำนวนมาก.

**Acceptance Criteria (EARS):**
- 12.1  THE SYSTEM SHALL แสดงช่องค้นหาบทบาทเหนือ/ในแถบหัวของตาราง
- 12.2  WHEN ผู้ใช้พิมพ์คำค้น THE SYSTEM SHALL กรองตาราง (client-side) ให้เหลือเฉพาะบทบาทที่ชื่อไทย
  หรือรหัสบทบาทหรือคำอธิบาย ตรงกับคำค้น (case-insensitive)
- 12.3  WHILE คำค้นไม่ตรงกับบทบาทใด THE SYSTEM SHALL แสดงสถานะว่าง (no-result) แทนแถวตาราง
- 12.4  THE SYSTEM SHALL ให้ subtitle `{N} บทบาท` คงสะท้อนจำนวน seed ทั้งหมด ไม่ใช่จำนวนหลังกรอง

## REQ-13: Feedback หลังการกระทำ

**User Story:** As a System Admin, I want ได้รับการยืนยันหลังกด action, so that รู้ว่าระบบรับคำสั่งแล้ว.

**Acceptance Criteria (EARS):**
- 13.1  WHEN flow สร้าง/แก้ไข/สำเนา/ลบ ทำงานจนจบ THE SYSTEM SHALL แสดง toast แจ้งผลสำเร็จที่ระบุชนิด
  การกระทำและชื่อบทบาทที่เกี่ยวข้อง
- 13.2  IF การบันทึกถูกบล็อกด้วย validation THEN THE SYSTEM SHALL ไม่แสดง toast สำเร็จ และแสดง
  ข้อความ validation ที่ฟิลด์ที่เกี่ยวข้องแทน

## Edge Cases & Open Questions

- Permission catalog ครบชุด: ภาพยืนยัน 11 key (txn.view/refund/export, merchant.view/manage,
  invoice.view/manage, settlement.run, user.view/manage + user key ที่ 3 ที่ภาพตัด) แต่ denominator
  = 14 → ต้องล็อกอีก 3 key ใน design.md (candidate: `role.view`/`role.manage`, `report.view`,
  `audit.view`, `settings.manage`). REQ-3.5/4.3 ผูกกับ `total` = ขนาด catalog จริง ไม่ใช่เลข 14 ตายตัว
- จำนวนผู้ใช้ที่ผูก (`users`) ในโหมด read-only mock เป็นค่า seed คงที่ — การสร้าง/ลบบทบาทไม่ผูกกับ
  user list จริง (ไม่มีหน้าจอ assign role ในสโคปนี้). ต้องยืนยันว่าไม่มี requirement ให้แก้จำนวนนี้จาก UI
- "merchant" ใน catalog เป็น demo — POL เป็น admin portal (ดู PROJECT_CONTEXT). ใช้ตามภาพได้ในฐานะ
  demo catalog; ถ้าต้อง align domain เป๊ะค่อยปรับ label ตอน design
- รูปแบบฟอร์ม create/edit (เต็มหน้า route `/user/role/new`,`/user/role/edit` ตามแบบ user module เดิม
  vs drawer/dialog) ยังไม่ล็อก — ตัดสินใน design.md

### Analyze findings log (anchor: uncommitted; baseline HEAD caaa8d3 · /spec-analyze 2026-06-17)

- F1 (inconsistency, REQ-10 vs REQ-6/9) — CRUD mutate session vs UI-shell.
  Decision: **Pure UI-shell**. แก้ REQ-6.3, 7.2, 9.1, 9.4(ลบ), 10.2, 10.3 → ไม่ mutate รายการ;
  subtitle/ตาราง = seed คงที่. (สอดคล้องคำตอบ /spec-new เดิม)
- F2 (gap) — ไม่มีค้นหา/กรอง. Decision: **เพิ่ม REQ-12** (client-side filter ชื่อ/รหัส/คำอธิบาย).
- F3 (gap) — ไม่มี feedback. Decision: **เพิ่ม REQ-13** (toast หลัง action; validation block ไม่ toast).
- F4 (ambiguity, REQ-7) — code แก้ได้ไหมหลังสร้าง. Decision: **immutable**. REQ-7.3 → code read-only
  ในฟอร์มแก้ไข, ตัด dup-code check ตอนแก้ (เหลือ check เฉพาะ create REQ-6.5 / copy REQ-8.1).
- F5 (ambiguity minor, REQ-8.1) — scheme ตั้งชื่อสำเนา. Decision: **default `_copy` + เลขลำดับ**;
  รายละเอียดอยู่ใน design ได้.
- F6 (defer) — catalog ขาด 3 key + form route-vs-drawer. Decision: **defer → design.md** (log เดิมด้านบน).
