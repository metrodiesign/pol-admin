# Requirements: User Management Module (isolated /user)

> Status: approved 2026-06-17

## Overview

POL ต้องมีโมดูล "ผู้ใช้งาน & สิทธิ์" ของตัวเองที่แยกขาดจากหน้า Demo ของ Minimals
template โดยสิ้นเชิง โมดูลนี้สร้างขึ้นโดยคัดลอกหน้า `src/app/dashboard/user`
(เฉพาะ list / new / edit) มาไว้ที่เส้นทางใหม่ `src/app/user` พร้อม view components
ชุดใหม่ภายใต้ namespace ของตัวเอง เพื่อให้ POL ปรับแต่งได้อิสระโดยไม่กระทบ และไม่ถูก
กระทบจาก หน้า Demo เดิม สอดคล้องกับทิศทางผลิตภัณฑ์ที่ค่อย ๆ ถอด Demo ของ Minimals
ออกและแทนด้วยหน้าจริงของ POL เมนูใหม่ปรากฏใต้ subheader `UserManagement` ต่อจากกลุ่ม
`Main`.

ขอบเขตที่ตกลงแล้ว (จาก /spec-new):
- Isolation: แยกเต็ม — คัดลอกทั้ง pages และ view components ไป namespace ใหม่
- Pages: `list`, `new`, `edit` เท่านั้น (ตัด profile / cards / account)
- Nav: single item, title `ผู้ใช้งาน & สิทธิ์`, path `/user/list`, icon `user`

## REQ-1: โมดูล route ใหม่ที่แยกขาด (`src/app/user`)

**User Story:** As a POL developer, I want หน้า user อยู่ที่ `/user/*` แยกจาก
`/dashboard/user/*`, so that ปรับแต่งโมดูลจริงของ POL ได้โดยไม่ชนกับหน้า Demo.

**Acceptance Criteria (EARS):**
- 1.1 THE SYSTEM SHALL ให้บริการหน้า list ที่เส้นทาง `/user/list`
- 1.2 THE SYSTEM SHALL ให้บริการหน้า create ที่เส้นทาง `/user/new`
- 1.3 THE SYSTEM SHALL ให้บริการหน้า edit ที่เส้นทาง `/user/edit`
- 1.4 THE SYSTEM SHALL ไม่สร้างหน้า profile, cards, account ภายใต้ `/user`
- 1.5 THE SYSTEM SHALL คงโครงสร้างไฟล์ของแต่ละหน้า (page.tsx + layout.tsx ตาม
  ที่หน้าต้นฉบับมี) ให้ตรงกับรูปแบบ App Router เดิม

## REQ-2: View components ชุดใหม่ (namespace แยก)

**User Story:** As a POL developer, I want view components ของโมดูล user เป็นชุด
ของตัวเอง, so that แก้ component ได้โดยไม่กระทบหน้า Demo ที่ยังใช้ของเดิม.

**Acceptance Criteria (EARS):**
- 2.1 THE SYSTEM SHALL วาง view components ของโมดูลใหม่ไว้ภายใต้ namespace
  `@/components/user/*` แยกจาก `@/components/dashboard/user/*`
- 2.2 THE SYSTEM SHALL คัดลอก components ที่หน้า list/new/edit ต้องใช้ครบ:
  `user-list-view`, `user-list-tabs`, `user-list-toolbar`, `user-table-columns`,
  `user-edit-form-card`, `user-edit-profile-card`
- 2.3 THE SYSTEM SHALL ให้หน้าใน `src/app/user` import view components จาก
  `@/components/user/*` เท่านั้น
- 2.4 THE SYSTEM SHALL ไม่ทำให้หน้าใน `src/app/user` import สิ่งใดจาก
  `@/components/dashboard/user/*`
- 2.5 WHERE component ใช้ shared component ที่อยู่นอก namespace user (เช่น
  `@/components/shared/*`, `@/components/ui/*`) THE SYSTEM SHALL ใช้ shared
  component เดิมร่วมกันได้ (ไม่ต้องคัดลอก shared/ui)

## REQ-3: เขียน path ภายในใหม่ให้ชี้ `/user`

**User Story:** As a user, I want ลิงก์/breadcrumb/action ในโมดูลใหม่ชี้ไปหน้า
`/user`, so that นำทางอยู่ในโมดูลใหม่ ไม่หลุดกลับไปหน้า Demo.

**Acceptance Criteria (EARS):**
- 3.1 THE SYSTEM SHALL แทนทุก path ที่ขึ้นต้นด้วย `/dashboard/user` ในไฟล์ที่
  คัดลอกมา ด้วย `/user`
- 3.2 WHERE breadcrumb เดิมมี label `"User"` href `/dashboard/user/list` THE
  SYSTEM SHALL เปลี่ยน href เป็น `/user/list` (label จะปรับใน 3.4)
- 3.3 THE SYSTEM SHALL ปรับลิงก์ edit ใน `user-table-columns` จาก
  `/dashboard/user/${u.id}/edit` เป็น `/user/${u.id}/edit`
- 3.4 THE SYSTEM SHALL ตั้ง breadcrumb หลักของโมดูลให้สื่อถึง POL: root label
  `"ผู้ใช้งาน & สิทธิ์"` href `/user/list` (แทน `"Dashboard" -> /dashboard`)
- 3.5 IF หน้าที่คัดลอกมายังหลงเหลือ path `/dashboard/user` หรือ import จาก
  `@/components/dashboard/user` THEN THE SYSTEM SHALL ถือว่าไม่ผ่าน (ต้องเป็น 0)

## REQ-4: เมนูนำทางใหม่ใต้ `UserManagement`

**User Story:** As a POL user, I want เห็นเมนู "ผู้ใช้งาน & สิทธิ์" ใน sidebar,
so that เข้าถึงหน้าจัดการผู้ใช้ได้.

**Acceptance Criteria (EARS):**
- 4.1 THE SYSTEM SHALL เพิ่ม NavGroup ใหม่ subheader `"UserManagement"` ใน
  `src/components/layout/nav-config.ts`
- 4.2 THE SYSTEM SHALL วาง NavGroup `UserManagement` ต่อจากกลุ่ม `Main` ทันที
  (ก่อนกลุ่ม `Demo`)
- 4.3 THE SYSTEM SHALL ให้ NavGroup นี้มี item เดียว: title `"ผู้ใช้งาน & สิทธิ์"`,
  path `/user/list`, icon `"user"`
- 4.4 THE SYSTEM SHALL ไม่ให้ item นี้มี children
- 4.5 WHEN ผู้ใช้คลิกเมนูนี้ THE SYSTEM SHALL นำทางไป `/user/list`
- 4.6 WHILE pathname อยู่ภายใต้ `/user` THE SYSTEM SHALL แสดงเมนูนี้เป็น active

## REQ-5: อยู่ร่วมกับโมดูล Demo เดิมโดยไม่กระทบกัน

**User Story:** As a POL developer, I want โมดูลเดิมยังทำงานเหมือนเดิม, so that
ไม่เกิด regression จากการเพิ่มโมดูลใหม่.

**Acceptance Criteria (EARS):**
- 5.1 THE SYSTEM SHALL ไม่แก้ไขไฟล์ใด ๆ ภายใต้ `src/app/dashboard/user`
- 5.2 THE SYSTEM SHALL ไม่แก้ไขไฟล์ใด ๆ ภายใต้ `src/components/dashboard/user`
- 5.3 THE SYSTEM SHALL คงรายการ Demo > User เดิมใน nav-config ไว้ไม่เปลี่ยนแปลง
- 5.4 THE SYSTEM SHALL ทำให้ทั้ง `/dashboard/user/list` และ `/user/list`
  เข้าถึงได้พร้อมกัน
- 5.5 THE SYSTEM SHALL ผ่าน build/type-check โดยไม่มี error หลังเพิ่มโมดูล

## Edge Cases & Open Questions

- Route edit ต้นฉบับเป็น `/dashboard/user/edit` (ไม่มี id param) แต่
  `user-table-columns` ลิงก์ไป `/dashboard/user/${u.id}/edit` (มี id) — เป็น
  ความไม่ตรงกันที่มีอยู่เดิม โมดูลใหม่จะ mirror พฤติกรรมเดิม (สร้างแค่ `/user/edit`
  และลิงก์ `/user/${u.id}/edit` ชี้ route ที่ยังไม่มี id) — NOT แก้ scope นี้.
  เปิดประเด็นไว้: จะ normalize เป็น route เดียวหรือไม่ ตัดสินตอน design.
- Metadata title ของแต่ละหน้า (`"User list | Dashboard - Minimal UI"`) ควรเปลี่ยน
  เป็นชื่อ POL หรือไม่ — เสนอเปลี่ยนเป็นรูปแบบ POL ใน design (เช่น
  `"ผู้ใช้งาน & สิทธิ์ | POL"`).
- ภายใน list/new/edit ยังมี label ภาษาอังกฤษ ("List", "Create a new user", "Add
  user" ฯลฯ) — scope นี้คัดลอกพฤติกรรม UI เดิม ไม่แปลภาษา ยกเว้น breadcrumb root
  (3.4). การแปล UI ทั้งหมดเป็นงานแยก.
- ยังไม่มีข้อมูลจริง/บริการ backend — โมดูลใช้ mock data เดิมที่ฝังใน components
  เหมือนต้นฉบับ.
