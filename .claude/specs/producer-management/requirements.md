# Requirements: Producer Module (ตัวแทน/นายหน้าประกันภัย)

> Status: approved 2026-06-23 (quick, no gates), amended 2026-06-24

## Overview

POL ต้องมีโมดูล "ตัวแทน/นายหน้า" (producer) = บัญชีผู้ใช้งานสำหรับตัวแทนประกันภัย /
นายหน้าประกันภัย สร้างโดย clone โครงสร้างจากโมดูล `user` (`src/app/user` +
`src/components/user`) ไปยัง namespace แยกขาด `src/app/producer` + `src/components/producer`.
คอนเซปต์ producer มีอยู่แล้วบางส่วน (`Audience = "admin" | "producer"` ใน `src/types/auth.ts`,
ปุ่ม login "เข้าสู่ระบบสำหรับตัวแทน") — โมดูลนี้คือ surface ที่ producer audience จะใช้.

ต่างจาก user module ตรง **data model + form**: producer ใช้ field spec เฉพาะจากแบบฟอร์ม
"การลงทะเบียนตัวแทน" (9 ฟิลด์ + validation) ไม่ใช่ฟิลด์ address ของ user. ส่วนโครง list/CRUD +
role submodule clone โครงเดิม.

ขอบเขต (จาก plan ที่อนุมัติ):
- ตำแหน่ง: sibling `src/app/producer/*` (route `/producer/*`)
- Slice A: producer account CRUD (list/new/edit/read) + entity + validation + nav
- Slice B: clone role/permission submodule เป็น producer-role
- Frontend-only mock (ไม่มี backend) — CRUD เป็น UI shell เหมือน user module

## REQ-1: โมดูล route ใหม่ `src/app/producer`

**User Story:** As a POL developer, I want หน้า producer อยู่ที่ `/producer/*` แยกจาก `/user/*`,
so that จัดการบัญชีตัวแทนได้อิสระโดยไม่กระทบ user module.

**Acceptance Criteria (EARS):**
- 1.1 THE SYSTEM SHALL ให้บริการหน้า list ที่ `/producer/list`
- 1.2 THE SYSTEM SHALL ให้บริการหน้า create ที่ `/producer/new`
- 1.3 THE SYSTEM SHALL ให้บริการหน้า edit ที่ `/producer/edit`
- 1.4 THE SYSTEM SHALL ให้บริการหน้า read (view-only) ที่ `/producer/read`
- 1.5 THE SYSTEM SHALL มี `layout.tsx` group shell ที่ wrap `MinimalsLayout` (เพราะไม่มี parent shell — บทเรียนจาก user module)
- 1.6 THE SYSTEM SHALL คงรูปแบบ App Router เดิม (page.tsx + layout.tsx metadata ต่อหน้าตามที่ user module มี)

## REQ-2: View components ชุดใหม่ namespace `@/components/producer`

**User Story:** As a POL developer, I want view components ของ producer เป็นชุดของตัวเอง,
so that แก้ได้โดยไม่กระทบ user module.

**Acceptance Criteria (EARS):**
- 2.1 THE SYSTEM SHALL วาง view components ไว้ใต้ `@/components/producer/*`
- 2.2 THE SYSTEM SHALL มี components: `producer-list-view`, `producer-list-toolbar`, `producer-table-columns`, `producer-edit-form-card`, `producer-edit-profile-card`
- 2.3 THE SYSTEM SHALL ให้หน้าใน `src/app/producer` import view components จาก `@/components/producer/*` เท่านั้น (ไม่ import จาก `@/components/user/*`)
- 2.4 WHERE component ใช้ shared primitive (`@/components/{form,ui,table,shared}`, `@/lib/*`, `@/hooks/*`) THE SYSTEM SHALL ใช้ของเดิมร่วมกัน (ไม่ copy)

## REQ-3: Producer data model + mock

**User Story:** As a POL developer, I want type `Producer` + mock data, so that list/form มีข้อมูลจริงให้แสดง.

**Acceptance Criteria (EARS):**
- 3.1 THE SYSTEM SHALL นิยาม `Producer`, `ProducerStatus`, `ProducerPersonType`, `ProducerFormData` ใน `src/types/producer.ts`
- 3.2 THE SYSTEM SHALL ให้ `Producer` มีฟิลด์: `id`, `firstName`, `lastName`, `personType`, `idNumber`, `producerCode`, `licenseNumber`, `avatarUrl`, `phoneNumber`, `email`, `status`
- 3.3 THE SYSTEM SHALL ให้ `ProducerPersonType = "individual" | "juristic"`
- 3.4 THE SYSTEM SHALL export `PRODUCERS: Producer[]` (mock) ใน `src/lib/mock/producers.ts` พร้อมตัวอย่างถูกต้องตาม validation (idNumber 13 หลัก, license บุคคลธรรมดา 10 หลัก, phone 10 หลัก)
- 3.5 THE SYSTEM SHALL ครอบคลุมทั้ง individual และ juristic ใน mock อย่างน้อยอย่างละ 1 ราย

## REQ-4: ฟอร์มลงทะเบียน/แก้ไขตัวแทน (9 ฟิลด์)

**User Story:** As a POL admin, I want ฟอร์มสร้าง/แก้ไขตัวแทนตามแบบ "การลงทะเบียนตัวแทน",
so that บันทึกข้อมูลตัวแทนได้ครบตาม field spec.

**Acceptance Criteria (EARS):** ฟอร์ม (`producer-edit-form-card`) SHALL มี field ตามนี้
- 4.1 `firstName` (ชื่อ), `lastName` (นามสกุล) — text, required
- 4.2 `personType` (ประเภทบุคคล) — radio: บุคคลธรรมดา (`individual`) / นิติบุคคล (`juristic`), required
- 4.3 `idNumber` (เลขบัตรประชาชน/เลขผู้เสียภาษี) — text, required, รับเฉพาะตัวเลข 13 หลัก
- 4.4 `producerCode` (รหัสตัวแทน) — text, required
- 4.5 `licenseNumber` (เลขที่ใบอนุญาตตัวแทน) — text, optional (เงื่อนไขใน REQ-5)
- 4.6 `photoUrl` (แนบรูปถ่ายตัวแทน+บัตรประชาชน) — upload ผ่าน `AvatarUpload`. WHERE หน้า admin (`/producer/new`, edit) THE SYSTEM SHALL ถือว่า optional (ไม่ enforce); required เฉพาะหน้า public `/register` (ดู REQ-11.6)
- 4.7 `phoneNumber` (โทรศัพท์ยืนยัน OTP) — text, required, ตัวเลข 10 หลัก
- 4.8 `email` (อีเมล) — text, required, email format
- 4.9 WHERE หน้า create THE SYSTEM SHALL มี checkbox `acceptTerms` (ยอมรับเงื่อนไขการใช้บริการ) ที่ต้องติ๊กก่อน submit
- 4.10 WHERE `readOnly` THE SYSTEM SHALL แสดงค่าเป็น text (ไม่มี input, ไม่มีปุ่ม submit) เหมือน user form

## REQ-5: Validation rules (pure + testable)

**User Story:** As a POL admin, I want ระบบตรวจรูปแบบข้อมูลตัวแทน, so that ข้อมูลถูกต้องตามเงื่อนไข.

**Acceptance Criteria (EARS):**
- 5.1 IF `idNumber` ไม่ตรง `/^\d{13}$/` THEN THE SYSTEM SHALL ถือว่า invalid
- 5.2 IF `phoneNumber` ไม่ตรง `/^\d{10}$/` THEN invalid
- 5.3 WHERE `personType = "individual"` IF `licenseNumber` ไม่ว่าง และไม่ตรง `/^\d{10}$/` THEN invalid
- 5.4 WHERE `personType = "juristic"` THE SYSTEM SHALL ยอมรับ `licenseNumber` เป็น free text
- 5.5 THE SYSTEM SHALL ถือว่า `licenseNumber` ว่างได้ (optional) ทั้งสอง personType
- 5.6 IF `email` ผิด email format THEN invalid
- 5.7 IF required field (`firstName`, `lastName`, `personType`, `idNumber`, `producerCode`, `phoneNumber`, `email`) ว่าง THEN invalid
- 5.8 THE SYSTEM SHALL วาง validation เป็น pure functions ใน `src/lib/producer/producer-validation.ts` แยกจาก UI และมี unit test ครอบคลุม 5.1–5.7

## REQ-6: Producer list view

**User Story:** As a POL admin, I want ตารางรายชื่อตัวแทนค้นหา/กรองได้, so that ดูและจัดการตัวแทนได้.

**Acceptance Criteria (EARS):**
- 6.1 THE SYSTEM SHALL แสดงตารางจาก `PRODUCERS` ผ่าน `useDataTable` + `DataTable` (เหมือน user list)
- 6.2 THE SYSTEM SHALL มี column: select, name (avatar + email), producerCode, personType, phone, licenseNumber, status, actions (view/edit/delete)
- 6.3 THE SYSTEM SHALL ค้นหาด้วยชื่อ (firstName+lastName) หรือ email
- 6.4 THE SYSTEM SHALL กรองด้วย personType (บุคคลธรรมดา/นิติบุคคล)
- 6.5 WHEN คลิก view/edit ในแถว THE SYSTEM SHALL นำทางไป `/producer/read` / `/producer/edit` (static route, mirror user module)

## REQ-7: Navigation

**User Story:** As a POL user, I want เห็นเมนู "ตัวแทน/นายหน้า" ใน sidebar, so that เข้าถึงโมดูลได้.

**Acceptance Criteria (EARS):**
- 7.1 THE SYSTEM SHALL เพิ่ม NavGroup subheader `"ตัวแทน/นายหน้า"` ใน `src/components/layout/minimals-nav-config.ts` (live config ที่ sidebar render จริง)
- 7.2 THE SYSTEM SHALL เพิ่ม NavGroup เดียวกันใน `src/components/layout/nav-config.ts` (feed breadcrumb + search-dialog ให้สอดคล้อง)
- 7.3 THE SYSTEM SHALL วาง NavGroup ใหม่ต่อจากกลุ่ม `"ผู้ใช้งาน & สิทธิ์"` (ก่อนกลุ่ม Demo/Overview)
- 7.4 THE SYSTEM SHALL ให้ item "ตัวแทน/นายหน้า" path `/producer/list`, icon `"user"`, `match: "/producer"`, `exclude: ["/producer/role"]`
- 7.5 WHERE clone role (slice B) THE SYSTEM SHALL เพิ่ม item "บทบาทและสิทธิ์" path `/producer/role/list`, `match: "/producer/role"`
- 7.6 WHILE pathname อยู่ใต้ `/producer` (ไม่รวม `/producer/role`) THE SYSTEM SHALL แสดง item แรกเป็น active

## REQ-8: Producer-role submodule (clone — slice B)

**User Story:** As a POL admin, I want ระบบ role/permission สำหรับตัวแทน, so that กำหนดสิทธิ์ตัวแทนได้.

**Acceptance Criteria (EARS):**
- 8.1 THE SYSTEM SHALL clone `src/app/user/role/*` → `src/app/producer/role/*` (list/create/edit/read)
- 8.2 THE SYSTEM SHALL clone `src/components/role/*` → `src/components/producer-role/*`
- 8.3 THE SYSTEM SHALL clone types/mock/lib ที่เกี่ยวข้อง → `src/types/producer-role.ts`, `src/lib/mock/producer-role.ts`, `src/lib/producer-role/producer-role-permissions.ts`
- 8.4 THE SYSTEM SHALL rewrite ทุก path `/user/role` → `/producer/role` ในไฟล์ที่ clone มา
- 8.5 THE SYSTEM SHALL ให้ producer-role import จาก namespace ของตัวเองเท่านั้น (ไม่ผูกกับ `@/components/role/*` หรือ `@/lib/role/*` หรือ `@/types/role`)
- 8.6 IF หลัง clone ยังเหลือ path `/user/role` หรือ import role namespace เดิมในไฟล์ producer-role THEN ถือว่าไม่ผ่าน (ต้องเป็น 0)
- (NOTE: resource keys ของ RBAC เดิม = txn/merchant/finance/user/system เป็น admin domain — slice นี้ copy โครง+mock เดิมก่อน, ปรับ resource ให้ตรง producer domain เป็นงานแยก)

## REQ-9: Coexist + build

**Acceptance Criteria (EARS):**
- 9.1 THE SYSTEM SHALL ไม่แก้ไฟล์ใต้ `src/app/user` หรือ `src/components/user` (ยกเว้น nav configs ที่เพิ่มกลุ่มใหม่)
- 9.2 THE SYSTEM SHALL ทำให้ `/user/*` และ `/producer/*` เข้าถึงได้พร้อมกัน
- 9.3 THE SYSTEM SHALL ผ่าน `npm run build` + lint + test โดยไม่มี error

## REQ-10: Admin อนุมัติตัวแทน (review)

**User Story:** As a POL admin, I want ปุ่มอนุมัติบนหน้าแก้ไขตัวแทน, so that ตรวจสอบและอนุมัติตัวแทนที่รอตรวจสอบได้.

**Acceptance Criteria (EARS):**
- 10.1 WHERE producer status = "pending" (รอตรวจสอบ) THE SYSTEM SHALL แสดงปุ่ม "อนุมัติ" บนหน้า edit (profile card)
- 10.2 WHEN admin คลิก "อนุมัติ" THE SYSTEM SHALL เปลี่ยน status เป็น "active" (ใช้งาน) และซ่อนปุ่มอนุมัติ
- 10.3 WHERE producer status != "pending" THE SYSTEM SHALL ไม่แสดงปุ่ม "อนุมัติ"
- 10.4 WHERE readOnly (หน้า read) THE SYSTEM SHALL ไม่แสดงปุ่ม action ใด ๆ รวมถึงอนุมัติ
- (UI shell: status flip เป็น local state ไม่ persist — mirror CRUD อื่นในโมดูล. reject = งานแยก ยังไม่ทำ)

## REQ-11: หน้าลงทะเบียนตัวแทนแบบ public (self-registration)

> เพิ่ม 2026-06-24 — public self-registration surface (นอก admin shell)

**User Story:** As a prospective ตัวแทน/นายหน้า, I want หน้าลงทะเบียนตนเองแบบสาธารณะ,
so that สมัครเป็นตัวแทนได้โดยไม่ต้องเข้าระบบ admin.

**Acceptance Criteria (EARS):**
- 11.1 THE SYSTEM SHALL ให้บริการหน้า public registration ที่ `/register`
- 11.2 THE SYSTEM SHALL ทำให้ `/register` เป็น shell-free (ไม่มี `MinimalsLayout` sidebar/topbar) โดยไม่มี `layout.tsx` ใน route folder (inherit เฉพาะ root layout — mirror `/login`)
- 11.3 THE SYSTEM SHALL ใช้ธีม/เลย์เอาต์เดียวกับ `/producer/new` (light card, 2-col grid, `AvatarUpload`, `ProducerEditFormCard`) — ไม่ออกแบบใหม่
- 11.4 THE SYSTEM SHALL ใช้ field spec เดียวกับ REQ-4 (9 ฟิลด์ + `acceptTerms`) และ validation เดียวกับ REQ-5
- 11.5 THE SYSTEM SHALL แทน `PageHeader` breadcrumb ของ admin ด้วยหัวข้อ "การลงทะเบียนตัวแทน" และไม่แสดง Switch "ยืนยันอีเมลแล้ว" (admin-only)
- 11.6 THE SYSTEM SHALL บังคับ field รูปถ่าย (REQ-4.6, photo) เป็น required ใน form validation: IF ไม่มีไฟล์รูปถ่าย THEN invalid. error แสดงโดย page render เองใต้ `AvatarUpload` — ไม่แก้ component `AvatarUpload` (คง uncontrolled, ไม่เพิ่ม `error` prop)
- 11.7 WHEN submit สำเร็จ (ผ่าน validation ครบ) THE SYSTEM SHALL แสดง success panel ("ลงทะเบียนสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ") พร้อมปุ่ม "ไปหน้าเข้าสู่ระบบ" ลิงก์ `/login` — frontend-only, ไม่มี backend call
- 11.8 THE SYSTEM SHALL ไม่เปลี่ยนพฤติกรรมของ `/producer/new`, `/producer/edit`, `/producer/read` (photo-required path เปิดเฉพาะเมื่อส่ง prop ควบคุม photo)
- 11.9 THE SYSTEM SHALL เพิ่มลิงก์ "สมัครเป็นตัวแทน" ที่หน้า `/login` ชี้ไป `/register` (entry point ของ public registration; producer audience มีปุ่ม login อยู่แล้ว)

## Edge Cases & Notes

- CRUD เป็น UI shell: edit/read ใช้ static route + mock entry เดียว (mirror user module — table links ไป `/producer/edit` ไม่มี id param). ไม่ทำ per-row data fetch.
- personType radio: ใช้ native `<input type="radio">` (ไม่มี radio component สำเร็จในระบบ) — accessible ด้วย label.
- phone ตัวแทนเป็นเบอร์ไทย 10 หลัก → ไม่ใช้ `PhoneCountrySelect` (ต่างจาก user form), ใช้ TextField numeric ธรรมดา.
- `acceptTerms` อยู่เฉพาะหน้า create (registration) ไม่อยู่ใน edit.
- public `/register` (REQ-11): duplicate registration (idNumber/email ซ้ำ) = out of scope — ไม่มี uniqueness check จนกว่าจะมี backend (decision E1). photo File ที่ submit ไม่ถูก persist (frontend-only).

## Edge Cases & Open Questions

> Findings log — /spec-analyze run anchored at requirements.md commit `d21739f` (REQ-11 amend, 2026-06-24). Re-runs may skip decided findings below.

- **A (4.6 vs 11.8 inconsistency)** — DECIDED A2: photo-required เป็น public-only โดยตั้งใจ. แก้ถ้อยคำ REQ-4.6 = optional บน admin, required บน `/register` (REQ-11.6).
- **B (entry point ไป /register)** — DECIDED B1: เพิ่มลิงก์ "สมัครเป็นตัวแทน" ที่ `/login` → REQ-11.9.
- **C (post-success action)** — DECIDED C1: success panel + ปุ่ม "ไปหน้าเข้าสู่ระบบ" → `/login` → REQ-11.7.
- **D (AvatarUpload uncontrolled, ไม่มี error prop)** — DECIDED D2: page render error เองใต้ AvatarUpload, ไม่แตะ component shared → REQ-11.6.
- **E (duplicate registration)** — DECIDED E1: out of scope (no uniqueness check จนกว่ามี backend) → note ด้านบน.
