# Requirements: Login + Dual Google SSO

> Status: approved 2026-06-23, amended 2026-06-23

## Overview

หน้า Login ของ POL Admin ที่ให้ผู้ใช้เข้าสู่ระบบด้วย Google (Sign in with Google) โดยแยกเป็น 2 OAuth
client บนหน้าเดียว: ปุ่ม Admin (audience `admin`) และปุ่ม Producer (audience `producer`) แต่ละปุ่มผูก
client id ของตัวเองและคืน ID token ที่ `aud` ต่างกัน. โมดูลนี้เป็น **frontend-only** ตาม stack ของ repo
(Next 16 App Router, mock data, ไม่มี backend) — สอดคล้องกับ PROJECT_CONTEXT (POL Admin = portal ภายใน,
IDP = Google/Azure AD/LINE). ขอบเขตงานนี้คือ **UI + กลไกฝั่ง client เท่านั้น**: ใช้ Google Identity
Services (GIS) ได้ ID token แล้ว decode payload ฝั่ง client เพื่อสร้าง **mock session** (DEV-only,
ไม่ verify ลายเซ็น) แล้ว redirect ตาม audience. การ verify ID token จริง, RBAC, และ schema ฝั่ง storage
อยู่ใน backend repo อื่น (`pol-core`, `sdd-auth`) — **อยู่นอกสโคป spec นี้**. RBAC role/permission mock
ที่มีอยู่ (`src/lib/mock/role.ts`, `src/lib/role/role-permissions.ts`) ใช้อ้างอิงตอน map สิทธิ์/ปลายทาง
หลัง login ได้ แต่ spec นี้ไม่แก้ของเดิม.

## REQ-1: หน้า Login และการแสดงผล

**User Story:** As an unauthenticated user (admin หรือ producer), I want หน้า Login เฉพาะที่มีทางเข้า
สู่ระบบชัดเจน, so that ฉันเลือกวิธีเข้าสู่ระบบของฝั่งตัวเองได้.

**Acceptance Criteria (EARS):**
- 1.1  THE SYSTEM SHALL ให้บริการหน้า Login ที่ route `/login`
- 1.2  THE SYSTEM SHALL render หน้า Login แบบ standalone layout — ไม่มี sidebar/topbar ของ dashboard shell
- 1.3  THE SYSTEM SHALL แสดงทางเข้าสู่ระบบ 2 ปุ่มบนหน้าเดียว: ปุ่มหนึ่งสำหรับ Admin และอีกปุ่มสำหรับ Producer
- 1.4  THE SYSTEM SHALL แสดงป้ายกำกับ (label/accessible name) ของแต่ละปุ่มที่ระบุชัดว่าเป็นการเข้าสู่ระบบฝั่ง
  Admin หรือ Producer
- 1.5  WHILE สคริปต์ Google Identity Services ยังโหลดไม่เสร็จ THE SYSTEM SHALL แสดงปุ่มเข้าสู่ระบบในสถานะ
  disabled หรือ loading
- 1.6  IF สคริปต์ Google Identity Services โหลดไม่สำเร็จ THEN THE SYSTEM SHALL แสดงข้อความ error และ
  ช่องทางให้ลองใหม่ (retry)

## REQ-2: Sign-in แยกตาม audience (2 OAuth client)

**User Story:** As the system owner, I want แต่ละปุ่มใช้ OAuth client คนละตัว, so that identity ของ Admin
กับ Producer แยกกันด้วย audience ตั้งแต่ต้นทาง.

**Acceptance Criteria (EARS):**
- 2.1  THE SYSTEM SHALL ตั้งค่าปุ่ม Admin ด้วย Admin OAuth client id ที่อ่านจาก configuration
- 2.2  THE SYSTEM SHALL ตั้งค่าปุ่ม Producer ด้วย Producer OAuth client id ที่อ่านจาก configuration
- 2.3  WHEN ผู้ใช้กดปุ่ม Admin THE SYSTEM SHALL เริ่มกระบวนการ GIS ด้วย Admin client id เพื่อขอ Google ID
  token และ tag ผลลัพธ์เป็น audience `admin`
- 2.4  WHEN ผู้ใช้กดปุ่ม Producer THE SYSTEM SHALL เริ่มกระบวนการ GIS ด้วย Producer client id เพื่อขอ
  Google ID token และ tag ผลลัพธ์เป็น audience `producer`
- 2.5  IF client id ของ audience ใดหายไปจาก configuration THEN THE SYSTEM SHALL disable ปุ่มของ audience
  นั้นและแสดงข้อความ configuration error
- 2.6  THE SYSTEM SHALL ใช้ GIS flow ที่คืน Google **ID token (credential)** เท่านั้น — กลยุทธ์รองรับ 2
  client_id ต้องไม่เปลี่ยนไปใช้ flow ที่คืน access token (เช่น `google.accounts.oauth2` token client)

## REQ-3: รับ ID token, decode และสร้าง mock session (DEV-only)

**User Story:** As a developer, I want login สร้าง mock session จาก Google ID token ได้โดยไม่มี backend,
so that ฉันพัฒนาและ demo หน้าจอหลัง login ได้.

**Acceptance Criteria (EARS):**
- 3.1  WHEN ได้รับ Google ID token THE SYSTEM SHALL decode ส่วน payload ของ JWT (แยก 3 ส่วนคั่นด้วย `.`
  แล้ว base64url-decode ส่วนกลาง) โดย **ไม่** verify ลายเซ็น (DEV-only)
- 3.2  WHEN decode สำเร็จ THE SYSTEM SHALL อ่าน claim: `sub`, `email`, `email_verified`, `name`, `picture`,
  `aud`, `exp`
- 3.3  IF token ไม่ใช่ JWT ที่ well-formed (ไม่ใช่ 3 ส่วน base64url) THEN THE SYSTEM SHALL ปฏิเสธการเข้าสู่
  ระบบและแสดง error
- 3.4  IF ค่า `aud` ใน token ไม่ตรงกับ client id ที่ตั้งไว้ของ audience ใดเลย THEN THE SYSTEM SHALL ปฏิเสธการเข้าสู่ระบบ
  (audience ถูกกำหนดจาก `aud`; โหมด 2-card ใช้ callback ร่วม — ดู Addendum 2026-06-23 ใน design.md)
- 3.5  IF ค่า `exp` เป็นเวลาในอดีต (token หมดอายุ) THEN THE SYSTEM SHALL ปฏิเสธการเข้าสู่ระบบ
- 3.6  WHEN claim ครบและผ่านการตรวจ THE SYSTEM SHALL สร้าง mock session record ที่มีเฉพาะ field ที่ UI ใช้:
  audience, `name`, `picture`, `exp` (อ่าน `sub`/`email`/`email_verified` เพื่อ check เท่านั้น ไม่เก็บลง session)
- 3.7  THE SYSTEM SHALL ไม่ log หรือเก็บ raw ID token และไม่ log ค่า claim ที่เป็น PII (email, name, sub)
- 3.8  WHERE มีการกำหนด allowed hosted-domain (`hd`) ของ audience ใน configuration THE SYSTEM SHALL ปฏิเสธ
  การเข้าสู่ระบบที่ claim `hd` ไม่อยู่ใน allowed list ของ audience นั้น
- 3.9  IF claim `email_verified` ไม่เป็น true THEN THE SYSTEM SHALL ปฏิเสธการเข้าสู่ระบบ

> **Note (trust boundary, DEV-only):** การ decode และการตรวจ `aud`/`exp`/`hd`/`email_verified` ฝั่ง client
> เป็น DEV-only hint **ไม่ใช่ security control** — ปลอม ID token ได้เพราะไม่ verify ลายเซ็น. prod ต้อง verify
> ลายเซ็น ID token ที่ backend (`pol-core`/`sdd-auth`) ก่อนไว้ใจ identity. (ponytail ceiling)

## REQ-4: Redirect ตาม audience หลังเข้าสู่ระบบ

**User Story:** As a signed-in user, I want ถูกพาไปหน้าหลังบ้านที่ตรงกับฝั่งของฉัน, so that ฉันเข้าถึง
งานของ audience ตัวเองได้ทันที.

**Acceptance Criteria (EARS):**
- 4.1  THE SYSTEM SHALL หา landing route จาก audience ของ session ผ่าน pure function ตัวเดียว
  (choose-landing-by-aud)
- 4.2  WHEN สร้าง mock session ของ audience `admin` THE SYSTEM SHALL redirect ไปยัง admin landing route
- 4.3  WHEN สร้าง mock session ของ audience `producer` THE SYSTEM SHALL redirect ไปยัง producer landing route
- 4.4  WHILE มี mock session ที่ยังไม่หมดอายุอยู่ THE SYSTEM SHALL redirect การเข้าหน้า `/login` ไปยัง landing
  route ของ session นั้น (ไม่แสดงหน้า login ซ้ำ)
- 4.5  IF mock session หมดอายุ (`exp` เป็นอดีต) THEN THE SYSTEM SHALL ถือว่าไม่มี session — ล้าง session
  เก่าและแสดงหน้า Login ตามปกติ

## REQ-5: จัดการ error และการยกเลิก

**User Story:** As a user, I want เห็นผลที่ชัดเจนเมื่อเข้าสู่ระบบไม่สำเร็จหรือยกเลิก, so that ฉันรู้ว่า
เกิดอะไรขึ้นและลองใหม่ได้.

**Acceptance Criteria (EARS):**
- 5.1  WHEN ผู้ใช้ปิดหรือยกเลิก prompt ของ Google THE SYSTEM SHALL คืนหน้า Login สู่สถานะ idle โดยไม่สร้าง
  session
- 5.2  IF Google คืน error หรือไม่มี credential THEN THE SYSTEM SHALL แสดงข้อความ error ที่ผู้ใช้เข้าใจได้และ
  ให้ลองใหม่
- 5.3  IF การสร้าง session ล้มเหลว (รวมถึงถูกปฏิเสธตาม REQ-3.3/3.4/3.5/3.8/3.9) THEN THE SYSTEM SHALL ไม่
  redirect, คงผู้ใช้ไว้ที่หน้า Login และแสดงข้อความรวม `เข้าสู่ระบบไม่สำเร็จ`
- 5.4  THE SYSTEM SHALL แสดง error/feedback ผ่าน toast pattern เดิมของแอป (ใช้ซ้ำ ไม่สร้างกลไกใหม่)

## REQ-6: Configuration และ Security

**User Story:** As a maintainer, I want credential ทั้งหมดมาจาก env และไม่มีอะไรหลุดในซอร์ส, so that
ทำตามกฎความปลอดภัยของโปรเจกต์.

**Acceptance Criteria (EARS):**
- 6.1  THE SYSTEM SHALL อ่าน Admin และ Producer OAuth client id จาก environment variable เท่านั้น
  (`NEXT_PUBLIC_GOOGLE_CLIENT_ID_ADMIN`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID_PRODUCER`)
- 6.2  THE SYSTEM SHALL ไม่มี OAuth client id หรือ secret แบบ hardcode ในซอร์สโค้ด
- 6.3  THE SYSTEM SHALL จัดเตรียม `.env.example` ที่บันทึกตัวแปรทั้งสองพร้อมค่า placeholder
- 6.4  THE SYSTEM SHALL ไม่ใช้ client secret ฝั่ง frontend (GIS ID-token flow ไม่ต้องใช้ secret)
- 6.5  THE SYSTEM SHALL คง `.env*.local` ไว้ใน `.gitignore`

## REQ-7: Accessibility และ Responsive

**User Story:** As any user, I want หน้า Login ใช้คีย์บอร์ดได้และอ่านออกทุกขนาดจอ, so that ใช้งานได้ตาม
มาตรฐานโครงการ.

**Acceptance Criteria (EARS):**
- 7.1  THE SYSTEM SHALL ทำให้ปุ่มเข้าสู่ระบบทั้งสองเข้าถึงและกดได้ด้วยคีย์บอร์ด พร้อม focus ที่มองเห็น
- 7.2  THE SYSTEM SHALL ให้ข้อความบนหน้า Login ผ่านเกณฑ์ contrast WCAG AA (อัตราส่วน >= 4.5:1)
- 7.3  THE SYSTEM SHALL render หน้า Login ใช้งานได้ทั้งจอ mobile และ desktop โดยไม่มี horizontal scroll
  ที่ความกว้าง >= 320px

## REQ-8: ออกจากระบบ (sign-out, ล้าง mock session)

**User Story:** As a signed-in user (mock), I want ออกจากระบบเพื่อกลับไปหน้า Login, so that ฉันสลับ
audience หรือทดสอบการเข้าสู่ระบบซ้ำได้.

**Acceptance Criteria (EARS):**
- 8.1  THE SYSTEM SHALL จัดให้มี control สำหรับ sign-out ที่ล้าง mock session ทั้งหมด
- 8.2  WHEN ผู้ใช้สั่ง sign-out THE SYSTEM SHALL ล้าง session แล้ว redirect ไปยัง `/login`
- 8.3  WHEN sign-out เสร็จ THE SYSTEM SHALL ทำให้ไม่มี mock session เหลืออยู่ (REQ-4.4 จะไม่เด้งออกจาก
  `/login` อีก จนกว่าจะ login ใหม่)

## Edge Cases & Open Questions

- **Landing route ต่อ audience (REQ-4):** repo มี `/main`, `/user`, `/policy` แต่ไม่มี surface ฝั่ง
  producer โดยเฉพาะ. ต้องล็อกใน design.md ว่า admin -> ? และ producer -> ? (candidate: admin -> `/main`;
  producer -> `/main` ชั่วคราว หรือ redirect ออกนอก repo). REQ-4.1 ผูกกับ mapping function ไม่ใช่ค่าตายตัว
  **(F8=a: defer to design — ยืนยันแล้ว.)**
- **Session storage (REQ-3.6):** เก็บ mock session ที่ไหน — `localStorage`/`sessionStorage` (mock ง่าย,
  ฝั่ง client ล้วน) vs httpOnly cookie (ต้องมี route handler, กันด้วย middleware ได้). ตัดสินใน design
- **Logout / ล้าง mock session:** **(F1=a: in scope — เพิ่ม REQ-8.)** placement ของ control sign-out
  (เช่น topbar ของ landing) = รายละเอียด design
- **Route guard ทั่วทั้งแอป:** การ redirect route อื่นไป `/login` เมื่อไม่มี session ถือว่า **อยู่นอกสโคป**
  spec นี้ (login page เท่านั้น) — เป็น follow-up. ยืนยัน?
- **GIS กับ 2 client_id ในหน้าเดียว:** **(F2=a: ต้องใช้ ID-token credential flow เท่านั้น — ดู REQ-2.6;
  ตัด `google.accounts.oauth2` token client ออกเพราะคืน access token ไม่ใช่ ID token.)** `google.accounts.id.initialize`
  เป็น singleton ต่อ client_id — กลยุทธ์ที่เหลือ (re-init ต่อการกด vs render 2 ปุ่มแยก context ต่อ client_id)
  = ตัดสินใน design (มีผลต่อ UX: rendered button vs custom)
- **hosted-domain (hd) (REQ-3.8):** จะเปิดใช้จริงไหม และ allowed domain ของแต่ละ audience คืออะไร
- **Reuse:** ตรวจ Minimals auth scaffolding ใน `src/app/dashboard/*` ว่ามี sign-in view ที่ใช้ซ้ำได้หรือไม่
  ก่อนสร้างใหม่ (ทำตอน design)

### Analyze findings log (anchor: uncommitted; baseline HEAD 55a0cfc · /spec-analyze 2026-06-23)

- F1 (gap, REQ-4.4/open) — logout/สลับ audience ไม่ได้. Decision: **a** -> เพิ่ม **REQ-8** sign-out (in scope); placement = design.
- F2 (latent conflict, REQ-2/3 vs open Q) — `oauth2` token client คืน access token ทำ REQ-3 พัง. Decision: **a** -> **REQ-2.6** ล็อก ID-token credential flow; reframe open Q.
- F3 (trust boundary, REQ-3.1/3.4/3.5) [security] — decode-no-verify != security. Decision: **a** -> เพิ่ม **Note** ใต้ REQ-3 (DEV-only hint; prod verify ที่ backend).
- F4 (gap, REQ-3.2) — ไม่ตรวจ `email_verified`. Decision: **a** -> REQ-3.2 อ่าน `email_verified` + **REQ-3.9** ปฏิเสธถ้า false.
- F5 (gap, REQ-4.4) — session หมดอายุตอนเข้า `/login` ไม่นิยาม. Decision: **a** -> **REQ-4.5** (หมดอายุ = ถือว่าไม่มี session + ล้าง).
- F6 (ambiguity, REQ-3.6/3.7) — PII ใน storage. Decision: **a** -> REQ-3.6 เก็บเฉพาะ audience/name/picture/exp; อ่าน `sub`/`email`/`email_verified` เพื่อ check เท่านั้น.
- F7 (minor, REQ-5.3) — รวม reject/storage-fail. Decision: **a** -> REQ-5.3 ข้อความรวม `เข้าสู่ระบบไม่สำเร็จ`.
- F8 (defer, REQ-4.2/4.3) — producer landing. Decision: **a** -> defer -> design.md (REQ-4.1 mapping fn คงโครง).
- Amend 2026-06-23 (2-card, ตาม user request) — REQ-3.4 reinterpret: aud determines audience (ไม่ใช่ "ปุ่มที่กด"); aud ไม่ตรง client ใด -> reject. propagate -> design.md Addendum 2026-06-23 (`audienceForClientId`/`resolveCredential`, render-both supersedes B3). สาระความปลอดภัยเท่าเดิม.
