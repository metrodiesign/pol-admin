# Requirements: PSP UI Parity (control/psp ให้เหมือน merchant/user และ merchant/role)

> Status: approved 2026-08-30 (quick, no gates)

## บริบท

หน้า `/control/psp/*` ถูกสร้างด้วยภาษาภาพแบบ "control room" (ConnectionHeader, StatusSpine, mobile cards,
aside action panel) ซึ่งต่างจากโมดูล `/merchant/user/*` และ `/merchant/role/*` ที่ user อนุมัติแล้ว
งานนี้ปรับเฉพาะ presentation layer ให้ PSP ใช้ header, toolbar, card และ action pattern เดียวกัน
โดยไม่เปลี่ยน API contract, RBAC gate, pagination contract, idempotency หรือ credential flow

การตัดสินใจที่ล็อกตอน /spec-quick:

| ประเด็น | ตัดสินใจ |
|---|---|
| List ที่ 375/768 px | ตัด mobile cards ใช้ `DataTable` ทุก viewport (superseded ข้อ Layout ของ `psp-connections/design.md`) |
| ConnectionHeader ใน read/create/edit | ถอดออก ย้าย identity + สถานะเข้า card เดียว |
| ปุ่ม action ของหน้า read | "ยกเลิก" + "แก้ไข" ใน `EditPageHeader`; ทดสอบ/ขอเปลี่ยน Credential อยู่ท้าย card |

## REQ-1: หน้า List ใช้โครงเดียวกับ merchant user list

- 1.1 WHEN เปิด `/control/psp/list` THE SYSTEM SHALL แสดง `PageHeader` (title, breadcrumbs, ปุ่มหลัก "เพิ่มการเชื่อมต่อ") ตามด้วย card เดียว `rounded-2xl bg-card` ที่มี toolbar และ `DataTable`
- 1.2 THE SYSTEM SHALL แสดง toolbar เป็น grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` ประกอบด้วย `TextField` ค้นหา และ `SelectField` แบบ `clearable` สำหรับ Merchant, PSP, Health และ "จำนวนต่อหน้า" (25/50/100)
- 1.3 WHEN ผู้ใช้เปลี่ยน "จำนวนต่อหน้า" THE SYSTEM SHALL ส่ง `limit` ใหม่ไป backend และรีเซ็ตหน้าเป็นหน้าแรก
- 1.4 THE SYSTEM SHALL แสดงรายการเป็น `DataTable` ทุก viewport (ไม่มี mobile cards และไม่มี StatusSpine)
- 1.5 THE SYSTEM SHALL แสดงคอลัมน์ Connection, PSP, ช่องทาง, Enabled, Health, ทดสอบล่าสุด, Approval และปุ่ม action ไอคอน "ดูรายละเอียด" แบบเดียวกับ merchant user columns
- 1.6 THE SYSTEM SHALL คง RBAC (`PspRouteGate`, `settings.manage`/`merchant.manage`/`merchant.view`), backend pagination และ notice ของ catalog/approval ไว้ตามเดิม

## REQ-2: หน้า Read ใช้โครงเดียวกับ merchant user/role read

- 2.1 WHEN เปิด `/control/psp/read?id=<id>` THE SYSTEM SHALL แสดง `EditPageHeader` ที่มี actions "ยกเลิก" (กลับ list) และ "แก้ไข" ด้วย class เดียวกับ `src/app/merchant/user/read/page.tsx`
- 2.2 IF ผู้ใช้ไม่มี `merchant.manage` THEN THE SYSTEM SHALL ไม่แสดงปุ่ม "แก้ไข"; IF มีสิทธิ์แต่ gate ไม่ผ่าน THEN แสดงปุ่ม disabled
- 2.3 THE SYSTEM SHALL แสดงเนื้อหาใน card เดียว `rounded-card bg-card` ที่มี header band (provider, merchant, connection id, badge Enabled/Health/Approval) และ section ข้อมูลการเชื่อมต่อ, Config, Credential
- 2.4 THE SYSTEM SHALL วางปุ่ม "ทดสอบ Credential ที่ใช้งานอยู่" และ "ขอเปลี่ยน Credential" ไว้ท้าย card พร้อมเหตุผลที่ปิดปุ่ม โดยคง `connectionActionGate` เดิม
- 2.5 THE SYSTEM SHALL ไม่แสดง `ConnectionHeader` หรือข้อความ "Payment operator control room"

## REQ-3: หน้า Create และ Edit ใช้โครงเดียวกับ merchant role create/edit

- 3.1 WHEN เปิด `/control/psp/create` THE SYSTEM SHALL แสดง `PageHeader` ที่มี actions "ยกเลิก" และปุ่ม submit ด้วย class เดียวกับ `src/components/merchant/role/create-view.tsx` ตามด้วย form card เดียว `rounded-card bg-card p-6`
- 3.2 WHEN เปิด `/control/psp/edit?id=<id>` THE SYSTEM SHALL แสดง `EditPageHeader` ที่มี actions "ยกเลิก" และ "บันทึก" ด้วย class เดียวกับ role edit ตามด้วย form card เดียว
- 3.3 THE SYSTEM SHALL แสดง identity (provider, merchant, connection id) และ badge สถานะภายใน form card แทน `ConnectionHeader`
- 3.4 THE SYSTEM SHALL คง dirty guard, ConfirmDialog, idempotency intent, validation และ credential dialog ตามเดิม

## REQ-4: ขอบเขตและคุณภาพ

- 4.1 THE SYSTEM SHALL ไม่ import component จาก `src/components/merchant/**` เข้า `src/components/control/**`
- 4.2 THE SYSTEM SHALL ไม่แก้ `src/components/merchant/**`, `src/components/shared/**`, `src/components/table/**`, `src/lib/api/**`, `src/lib/control/psp*`
- 4.3 THE SYSTEM SHALL ผ่าน `npm run typecheck`, `npm run lint`, `npm test` โดย test เดิมของ PSP ไม่ลด assertion
- 4.4 THE SYSTEM SHALL ลบ `connection-header.tsx` เมื่อไม่มีผู้ใช้เหลือ

## Self-check (5 หมวดของ /spec-analyze)

| หมวด | ผลตรวจ |
|---|---|
| Logical inconsistency | REQ-1.4 ขัดกับ Layout ใน `psp-connections/design.md` — แก้โดยบันทึก superseded ในไฟล์นั้น |
| Ambiguity | "class เดียวกับ" ระบุไฟล์ต้นแบบชัดเจนทุกข้อ |
| Conflicting constraints | REQ-4.2 ห้ามแก้ shared แต่ `ControlListToolbar` มี diff ค้าง (prop `className`) — PSP เลิกใช้ component นี้ ปล่อย diff เดิมไว้ไม่แตะ |
| Gaps | ปุ่ม "แก้ไข" ในตารางไม่ใส่ เพราะ gate ต่อแถวต้องใช้ approval state; เข้าจากหน้า read แทน |
| Unstated assumptions | badge สถานะยังใช้ `ControlStatusBadge` (tone ร่วมของ control plane) ไม่เปลี่ยนเป็น pill ของ merchant |
