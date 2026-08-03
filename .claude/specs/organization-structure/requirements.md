# Requirements: โมดูลโครงสร้างองค์กร (organization-structure)

> Status: approved 2026-08-02; REQ-7 revised 2026-08-03 (แยกสถาปัตยกรรมเป็นอิสระต่อ module)

## Overview

POL Admin เป็น portal ภายในสำหรับพนักงาน โดย admin user profile ผูกกับ master data องค์กร 4 มิติ
(สำนักงาน / แผนก / ตำแหน่ง / ระดับ) ซึ่ง pol-core มี API ครบแล้ว (`/api/v1/{offices,divisions,positions,levels}`)
แต่ยังไม่มีหน้าจอจัดการ ฟีเจอร์นี้เพิ่ม 4 module CRUD ใต้ `src/app/organization/` (หน้า list / read / create / edit
ต่อ module) พร้อม menu group ใหม่ "โครงสร้างองค์กร" ต่อ API จริงผ่าน `adminFetch` — ทั้ง 4 resource มี
schema และ behavior เหมือนกัน 100% (`{id, code, name, isActive}`) ต่างเฉพาะ label ไทย / path / icon
requirements ทุกข้อจึงนิยามครั้งเดียวและบังคับใช้กับทั้ง 4 module เว้นแต่ระบุเป็นอย่างอื่น

คำจำกัดความ: "org unit" = รายการหนึ่งใน resource ใดก็ได้จาก 4 ตัวนี้; "module" = ชุดหน้า 4 หน้า
(list/read/create/edit) ของ resource หนึ่ง

| Module | Route base | API segment | Label |
|---|---|---|---|
| office | `/organization/office` | `offices` | สำนักงาน |
| division | `/organization/division` | `divisions` | แผนก |
| position | `/organization/position` | `positions` | ตำแหน่ง |
| level | `/organization/level` | `levels` | ระดับ |

## REQ-1: เมนูและการเข้าถึง

**User Story:** ในฐานะพนักงานฝ่ายบริหารระบบ ฉันต้องการเข้าถึงหน้าจัดการโครงสร้างองค์กรจาก sidebar
เพื่อดูแล master data ที่ใช้ใน admin user profile

**Acceptance Criteria (EARS):**

- 1.1 THE SYSTEM SHALL แสดง menu group "โครงสร้างองค์กร" ใน sidebar ต่อจาก group "ผู้ใช้งาน & สิทธิ์"
- 1.2 THE SYSTEM SHALL แสดง menu item 4 รายการใน group ตามลำดับ: สำนักงาน, แผนก, ตำแหน่ง, ระดับ — แต่ละรายการลิงก์ไปหน้า list ของ module ตน
- 1.3 THE SYSTEM SHALL แสดง icon เฉพาะของแต่ละ menu item (SVG ใหม่ 4 ไฟล์ใน `public/assets/icons/navbar/`)
- 1.4 WHILE ผู้ใช้อยู่ที่หน้าใดหน้าหนึ่งของ module (list/read/create/edit) THE SYSTEM SHALL แสดง menu item ของ module นั้นเป็น active
- 1.5 THE SYSTEM SHALL แสดง breadcrumb ของทุกหน้าใน module โดยไม่ fallback เป็น path ดิบ
- 1.6 WHEN session หมดอายุ (API ตอบ 401) THE SYSTEM SHALL redirect ไปหน้า `/login` (พฤติกรรมเดิมของ `adminFetch`)

## REQ-2: หน้ารายการ (list)

**User Story:** ในฐานะพนักงานฝ่ายบริหารระบบ ฉันต้องการเห็นรายการ org unit ทั้งหมดพร้อมค้นหาและกรอง
เพื่อหารายการที่ต้องการได้เร็ว

**Acceptance Criteria (EARS):**

- 2.1 WHEN เปิดหน้า list THE SYSTEM SHALL ดึงข้อมูลทั้งหมดของ resource นั้นจาก API (ไล่ครบทุกหน้า `PagedResult`, limit สูงสุด 25/ครั้ง) แล้วแสดงในตาราง
- 2.2 THE SYSTEM SHALL แสดงคอลัมน์: checkbox เลือกแถว, code (monospace), name, สถานะ (badge ใช้งาน/ปิดใช้งาน), actions (ดู / แก้ไข / ปิดใช้งาน)
- 2.3 THE SYSTEM SHALL เรียงรายการตาม name (ก-ฮ / A-Z) เป็นค่าเริ่มต้น
- 2.4 WHEN ผู้ใช้พิมพ์คำค้น THE SYSTEM SHALL กรองรายการแบบ client-side จาก code หรือ name (case-insensitive)
- 2.5 WHEN ผู้ใช้เลือกตัวกรองสถานะ THE SYSTEM SHALL กรองรายการแบบ client-side ตาม `isActive`
- 2.6 THE SYSTEM SHALL แบ่งหน้าแบบ client-side ด้วย `DataTable` เดิมของ repo
- 2.7 WHEN ผู้ใช้คลิกแถว THE SYSTEM SHALL เปิด detail sheet แสดง code, name, สถานะ พร้อมปุ่มไปหน้า read/edit
- 2.8 WHEN คลิก checkbox หรือปุ่มใน actions THE SYSTEM SHALL ไม่เปิด detail sheet (stop propagation)
- 2.9 IF การดึงข้อมูลล้มเหลว (network/5xx) THEN THE SYSTEM SHALL แสดงสถานะ error พร้อมทางลองใหม่ แทนตารางว่างเงียบ
- 2.10 IF ไม่มีรายการตรงเงื่อนไข THEN THE SYSTEM SHALL แสดง empty state
- 2.11 WHILE แถวมีสถานะปิดใช้งาน THE SYSTEM SHALL ซ่อนปุ่ม "ปิดใช้งาน" ของแถวนั้น

## REQ-3: หน้าดูรายละเอียด (read)

**User Story:** ในฐานะพนักงานฝ่ายบริหารระบบ ฉันต้องการดูรายละเอียด org unit รายตัว
เพื่อตรวจสอบข้อมูลก่อนแก้ไข

**Acceptance Criteria (EARS):**

- 3.1 WHEN เปิดหน้า read ด้วย `?id=<guid>` THE SYSTEM SHALL ดึงรายการนั้นจาก API แล้วแสดง code, name, สถานะ แบบอ่านอย่างเดียว พร้อมปุ่มไปหน้า edit
- 3.2 IF ไม่มี query `id` THEN THE SYSTEM SHALL redirect ไปหน้า list ของ module นั้น
- 3.3 IF API ตอบ 404 THEN THE SYSTEM SHALL แสดงสถานะ not found พร้อมลิงก์กลับหน้า list
- 3.4 WHILE กำลังดึงข้อมูล THE SYSTEM SHALL แสดงสถานะ loading

## REQ-4: สร้างรายการ (create)

**User Story:** ในฐานะพนักงานฝ่ายบริหารระบบ ฉันต้องการเพิ่ม org unit ใหม่
เพื่อให้เลือกใช้ใน admin user profile ได้

**Acceptance Criteria (EARS):**

- 4.1 THE SYSTEM SHALL แสดงฟอร์มมี field: code และ name (รายการใหม่เกิดเป็นสถานะใช้งานเสมอ — ไม่มี field สถานะ)
- 4.2 WHEN ผู้ใช้กดบันทึก THE SYSTEM SHALL validate ฝั่ง client ก่อนส่ง: code ต้องตรง `^[a-z0-9_]+$` ยาวไม่เกิน 64; name ห้ามว่างและยาวไม่เกิน 200
- 4.3 IF validation ไม่ผ่าน THEN THE SYSTEM SHALL แสดงข้อความ error ใต้ field นั้นและไม่ยิง API
- 4.4 WHEN validation ผ่าน THE SYSTEM SHALL ยิง `POST /api/v1/{segment}` ด้วย `{code, name}`
- 4.5 WHEN API ตอบสำเร็จ (201) THE SYSTEM SHALL นำทางกลับหน้า list พร้อม toast ยืนยัน
- 4.6 IF API ตอบ 409 THEN THE SYSTEM SHALL แสดง error ที่ field code ว่ารหัสนี้ถูกใช้แล้ว โดยไม่ล้างค่าในฟอร์ม
- 4.7 IF API ตอบ error อื่น (400/5xx) THEN THE SYSTEM SHALL แสดงข้อความผิดพลาดโดยคงค่าในฟอร์มไว้
- 4.8 WHEN ผู้ใช้กดยกเลิกโดยมีข้อมูลค้างในฟอร์ม THE SYSTEM SHALL ถามยืนยันก่อนออก

## REQ-5: แก้ไขรายการ (edit)

**User Story:** ในฐานะพนักงานฝ่ายบริหารระบบ ฉันต้องการแก้ชื่อและสถานะของ org unit
โดยที่รหัสไม่เปลี่ยน เพื่อรักษา identity ของข้อมูลที่ถูกอ้างอิงอยู่

**Acceptance Criteria (EARS):**

- 5.1 WHEN เปิดหน้า edit ด้วย `?id=<guid>` THE SYSTEM SHALL ดึงรายการนั้นแล้ว prefill ฟอร์ม: code (อ่านอย่างเดียว/disabled), name, สถานะ (select ใช้งาน/ปิดใช้งาน)
- 5.2 IF ไม่มี query `id` THEN THE SYSTEM SHALL redirect ไปหน้า list; IF API ตอบ 404 THEN แสดงสถานะ not found
- 5.3 WHEN ผู้ใช้กดบันทึก THE SYSTEM SHALL validate name ตามเกณฑ์เดียวกับ 4.2
- 5.4 WHEN validation ผ่าน THE SYSTEM SHALL ยิง `PUT /api/v1/{segment}/{id}` โดย body มีทั้ง `name` และ `isActive` ครบทุกครั้ง (backend เป็น full-replace — ขาด `isActive` = รายการโดนปิดใช้งานเงียบ)
- 5.5 WHEN API ตอบสำเร็จ THE SYSTEM SHALL นำทางกลับหน้า list พร้อม toast ยืนยัน
- 5.6 IF API ตอบ error (400/404/5xx) THEN THE SYSTEM SHALL แสดงข้อความผิดพลาดโดยคงค่าในฟอร์มไว้
- 5.7 WHERE ผู้ใช้เปลี่ยนสถานะเป็น "ใช้งาน" ในหน้า edit THE SYSTEM SHALL ใช้ช่องทางนี้เป็นวิธีเดียวในการเปิดใช้งานรายการกลับ (ไม่มีปุ่ม reactivate ในหน้า list)

## REQ-6: ปิดใช้งานรายการ (deactivate)

**User Story:** ในฐานะพนักงานฝ่ายบริหารระบบ ฉันต้องการปิดใช้งาน org unit ที่เลิกใช้
โดยข้อมูลเดิมที่อ้างอิงอยู่ไม่พัง

**Acceptance Criteria (EARS):**

- 6.1 WHEN ผู้ใช้กดปุ่มปิดใช้งานจากหน้า list หรือ detail sheet THE SYSTEM SHALL เปิด dialog ยืนยันที่ใช้คำว่า "ปิดใช้งาน" และอธิบายว่ารายการจะยังถูกอ้างอิงต่อได้แต่เลือกใหม่ไม่ได้
- 6.2 WHEN ผู้ใช้ยืนยัน THE SYSTEM SHALL ยิง `DELETE /api/v1/{segment}/{id}` (backend ทำ soft-deactivate)
- 6.3 WHEN API ตอบสำเร็จ (204) THE SYSTEM SHALL refresh รายการและแสดง toast ยืนยัน
- 6.4 IF API ตอบ error THEN THE SYSTEM SHALL แสดงข้อความผิดพลาดและคงสถานะรายการเดิม
- 6.5 THE SYSTEM SHALL ไม่ใช้คำว่า "ลบ" ในทุกจุดของ UI ที่หมายถึงการปิดใช้งาน (ปุ่ม/tooltip/dialog/toast)

## REQ-7: สถาปัตยกรรมอิสระต่อ module

**User Story:** ในฐานะทีมพัฒนา เราต้องการให้แต่ละ module โครงสร้างองค์กร (office/division/level/position)
เป็นอิสระต่อกัน เพื่อรองรับการเพิ่ม field/logic เฉพาะตัวต่อ module ในอนาคตโดยไม่กระทบ module อื่น

**Acceptance Criteria (EARS):**

- 7.1 THE SYSTEM SHALL เรียก API ผ่าน `adminFetch` (ได้ CSRF header, `credentials:'include'`, 401 redirect ตามเดิม)
- 7.2 THE SYSTEM SHALL มี type, config, validation, API client, view component (list/detail-sheet/read/create/edit) แยกไฟล์อิสระต่อ module ละชุด — ไม่ parametrize ด้วย config กลางอีกต่อไป
- 7.3 THE SYSTEM SHALL คง UI component ที่เป็น generic ล้วน (ไม่ผูก type เฉพาะ entity — รับแค่ primitive/callback prop หรือใช้ structural typing) เป็น shared ต่อไปภายใต้ `components/organization/org-unit/`: `columns.tsx` (structural-typed ผ่าน generic `<T extends OrgUnitLike>`), `confirm-dialog.tsx`, `form-status.tsx`, `status-badge.tsx` (ย้าย `OrgUnitStatus` type เข้ามา define ในไฟล์เอง เลิก import จาก type module), `toolbar.tsx`
- 7.4 THE SYSTEM SHALL เพิ่ม rewrite `/api/:path*` → `${adminApiOrigin}/api/:path*` ใน `next.config.ts` (endpoint อยู่ top-level ไม่เข้า rewrite `/admin/*` เดิม; prod reverse proxy ส่ง `/api/v1/*` ผ่านอยู่แล้ว — ยืนยันจาก user)
- 7.5 THE SYSTEM SHALL มี unit test (vitest, co-located) ครอบ API client (path ต่อ segment, fetch-all, 404→null, PUT body ครบ `name`+`isActive`) และ validation ทุก branch แยกไฟล์ตาม module
- 7.6 THE SYSTEM SHALL ไม่มี dependency ใหม่

**Migration note:** REQ-7 นี้ replace REQ-7 เดิม (approved 2026-08-02: "implementation ชุดเดียวที่ 4 module ใช้ร่วมกัน parametrize ด้วย config") — เหตุผล: แต่ละ module จะมี field/logic เฉพาะตัวเพิ่มเร็ว ๆ นี้ ทำให้ config-driven pattern กลายเป็นอุปสรรคมากกว่าประโยชน์ของการแก้บั๊กจุดเดียว

## Edge Cases & Open Questions

- ข้อมูลจริงต่อ resource ~8-12 แถว — fetch-all + client-side filter/paginate เพียงพอ; ถ้าโตเกินหลักร้อยค่อยย้าย server pagination (จะติด `ponytail:` comment ระบุเพดานใน code)
- Server ไม่รองรับ filter `isActive` และ sort ใด ๆ (hardcode OrderBy Name) — การกรอง/เรียงทั้งหมดเป็น client-side โดยเจตนา
- ไม่มี FK ระหว่าง 4 resource — ฟอร์มอิสระ ไม่มี cascading dropdown
- ไม่มี duplicate mode (`?from=`) ต่างจาก role — ตัดออกโดยเจตนา (ฟอร์มมีแค่ 2 field ไม่คุ้ม)
- Permission `user.manage` บังคับที่ backend (403) — FE ไม่มี route guard ตาม convention ปัจจุบันของ repo; ผู้ใช้ไม่มีสิทธิ์จะเห็นเมนูแต่เจอ error state
- Bulk actions: ตารางมี checkbox ตาม pattern `DataTable` เดิม แต่ API ไม่มี bulk endpoint — selection ไม่ผูก action ใด (เหมือน role)
