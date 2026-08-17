# Requirements: Split Admin and Merchant Apps

> Status: approved 2026-08-17, amended 2026-08-17

## Overview

แยก Next.js แอปเดิมเป็น npm-workspaces monorepo สำหรับ Admin และ Merchant โดยรอบนี้
Merchant clone route, UI, navigation และ Admin auth/API จาก Admin ก่อน เพื่อเปิดทางให้คัด surface
ที่ไม่ต้องการออกภายหลังโดยไม่ทำให้การย้ายโครงสร้างครั้งนี้ปนกับการออกแบบผลิตภัณฑ์รอบถัดไป

## REQ-1: Workspace Topology

**User Story:** As a POL developer, I want Admin, Merchant และ shared code อยู่ใน workspace
ที่ระบุเจ้าของชัดเจน, so that แต่ละแอป build และพัฒนาต่อได้อิสระจากกัน.

| Workspace | Package name | หน้าที่ |
|---|---|---|
| `apps/admin` | `@pol/admin` | Admin application |
| `apps/merchant` | `@pol/merchant` | Merchant application |
| `packages/ui` | `@pol/ui` | Shared presentation |
| `packages/shared` | `@pol/shared` | Shared pure code |

**Acceptance Criteria (EARS):**

- 1.1 THE SYSTEM SHALL ประกาศ root npm workspaces เป็น `apps/*` และ `packages/*`
- 1.2 THE SYSTEM SHALL มี workspace package set ตรงตามตาราง Workspace
- 1.3 WHEN รัน `npm ci` ที่ repository root THE SYSTEM SHALL ติดตั้งทุก workspace จาก `package-lock.json` เดียว
- 1.4 THE SYSTEM SHALL จำกัด dependency version changes ไว้ตาม REQ-1.7 และ REQ-1.8
- 1.5 THE SYSTEM SHALL NOT เพิ่ม third-party dependency ใหม่
- 1.6 THE SYSTEM SHALL NOT ให้ workspace ใต้ `apps/` import source จาก app อีกตัวโดยตรง
- 1.7 THE SYSTEM SHALL upgrade `next` จาก `16.2.6` เป็น `16.3.1`
- 1.8 THE SYSTEM SHALL upgrade `sharp` จาก `0.34.5` เป็น `0.35.3`
- 1.9 THE SYSTEM SHALL คง `shadcn` ที่เวอร์ชัน `4.8.0` และจัดเป็น dev dependency
- 1.10 THE SYSTEM SHALL กำหนด Node.js minimum version เป็น `20.9.0`

## REQ-2: Root Commands and Runtime Ports

**User Story:** As a POL developer, I want คำสั่งมาตรฐานจาก repository root, so that รัน ตรวจ
และ build แต่ละแอปได้โดยไม่ต้องจำ working directory ภายใน.

| กลุ่ม | Root scripts |
|---|---|
| Admin | `dev:admin build:admin start:admin test:admin` |
| Merchant | `dev:merchant build:merchant start:merchant test:merchant` |
| Repository | `dev dev:clean build start test lint typecheck` |

**Acceptance Criteria (EARS):**

- 2.1 THE SYSTEM SHALL มี root Admin command set ตรงตามตาราง Root scripts
- 2.2 THE SYSTEM SHALL มี root Merchant command set ตรงตามตาราง Root scripts
- 2.3 THE SYSTEM SHALL มี root script `lint` ที่ตรวจทั้งสี่ workspace ตามตาราง Workspace
- 2.4 WHEN รัน root script `dev` THE SYSTEM SHALL เริ่ม Admin dev server
- 2.5 WHEN รัน root script `build` THE SYSTEM SHALL build Admin app
- 2.6 WHEN รัน root script `start` THE SYSTEM SHALL เริ่ม Admin production server
- 2.7 WHEN รัน root script `test` THE SYSTEM SHALL รัน test suite ของทุก workspace ที่มี test
- 2.8 WHEN รัน root script `dev:clean` THE SYSTEM SHALL ล้างเฉพาะ Admin build cache ก่อนเริ่ม Admin dev server
- 2.9 WHEN รัน `npm run dev:admin` THE SYSTEM SHALL ให้บริการ Admin ผ่าน `https://localhost:3001`
- 2.10 WHEN รัน `npm run dev:merchant` THE SYSTEM SHALL ให้บริการ Merchant ผ่าน `https://localhost:3002`
- 2.11 WHEN รัน `npm run start:admin` THE SYSTEM SHALL ให้บริการ Admin ผ่าน HTTP port `3001`
- 2.12 WHEN รัน `npm run start:merchant` THE SYSTEM SHALL ให้บริการ Merchant ผ่าน HTTP port `3002`
- 2.13 WHILE Admin และ Merchant dev servers ทำงานพร้อมกัน THE SYSTEM SHALL ใช้ build cache คนละ directory
- 2.14 THE SYSTEM SHALL มี root script `typecheck` ที่ตรวจทั้งสี่ workspace ตามตาราง Workspace

## REQ-3: Route Parity

**User Story:** As a POL developer, I want Merchant มี route implementation เท่า Admin ในรอบแรก,
so that การคัด Merchant surface ออกภายหลังทำได้จาก baseline ที่ครบและตรวจเทียบได้.

### Route Parity Matrix

`/*` ในตารางหมายถึงทุก page route ที่มีอยู่ใต้ prefix นั้น ณ baseline ก่อนย้าย workspace.

| Route surface | Admin | Merchant | หมายเหตุ |
|---|---:|---:|---|
| `/`, `/dashboard` | มี | มี | `/` redirect ไป `/dashboard` |
| `/login`, `/logout`, `/login-error` | มี | มี | clone implementation เดิม |
| `/admin/*` | มี | มี | รวม user และ role routes |
| `/merchant/*` | มี | มี | รวม user และ role routes |
| `/organization/*` | มี | มี | รวม office, division, position และ level |
| `/control/*` | มี | มี | clone ทุก current descendant route |
| `/order/*`, `/transaction/*`, `/policy/*` | มี | มี | clone ทุก current descendant route |
| `/checkout/[sessionId]` | มี | มี | คง dynamic segment |
| `/minimals/*` | มี | มี | คง static และ catch-all routes |
| `/error/403`, `/maintenance` | มี | มี | คง error/maintenance pages |
| `/register` | ไม่มี | มี | ความต่างที่อนุญาตเพียง route เดียว |

**Acceptance Criteria (EARS):**

- 3.1 THE SYSTEM SHALL ย้ายทุก user-facing page route เดิมยกเว้น `/register` เข้า Admin app
- 3.2 THE SYSTEM SHALL clone ทุก Admin user-facing page route เข้า Merchant app
- 3.3 THE SYSTEM SHALL ให้บริการ Merchant registration ที่ `/register`
- 3.4 IF ผู้ใช้เปิด `/register` บน Admin app THEN THE SYSTEM SHALL ตอบ HTTP `404`
- 3.5 WHEN build ทั้งสอง app เสร็จ THE SYSTEM SHALL ทำให้ Merchant page-route set เท่ากับ Admin page-route set รวม `/register`
- 3.6 THE SYSTEM SHALL ใช้ route implementations จริงใน Merchant แทน placeholder pages
- 3.7 WHEN ผู้ใช้เปิด `/` บน app ใด app หนึ่ง THE SYSTEM SHALL redirect ไป `/dashboard` ของ app เดิม
- 3.8 THE SYSTEM SHALL คง dynamic route `/checkout/[sessionId]` ในทั้งสอง app
- 3.9 THE SYSTEM SHALL คง catch-all route `/minimals/subpaths/[...segments]` ในทั้งสอง app
- 3.10 IF ผู้ใช้เปิด `/admin/user/list` บน Merchant app THEN THE SYSTEM SHALL NOT ตอบ HTTP `404`
- 3.11 WHEN route-parity check อ่าน build manifest THE SYSTEM SHALL เลือกเฉพาะ manifest keys ที่ลงท้ายด้วย `/page`
- 3.12 WHEN normalize manifest page key THE SYSTEM SHALL map `/page` เป็น `/` และตัด suffix `/page` จาก key อื่น
- 3.13 WHEN normalized route เริ่มด้วย `/_` THE SYSTEM SHALL ตัด route นั้นออกจาก user-facing page-route set
- 3.14 THE SYSTEM SHALL คง notation ของ dynamic segments และ catch-all segments ใน normalized route

## REQ-4: Auth, Navigation and API Parity

**User Story:** As a POL developer, I want Merchant clone runtime behavior ของ Admin ในรอบนี้,
so that workspace split ไม่เปลี่ยน auth, navigation หรือ Admin operation behavior เดิม.

**Acceptance Criteria (EARS):**

- 4.1 THE SYSTEM SHALL ให้ Merchant app ใช้ Admin auth provider เดิม
- 4.2 THE SYSTEM SHALL ให้ Merchant app ใช้ `AdminMe` และ `getMe` เดิม
- 4.3 THE SYSTEM SHALL ให้ Merchant app ใช้ Admin navigation เดิม
- 4.4 THE SYSTEM SHALL ให้ Merchant app ใช้ Admin API adapters เดิมสำหรับ cloned Admin pages
- 4.5 THE SYSTEM SHALL NOT เพิ่ม Merchant-only dashboard ใน feature นี้
- 4.6 THE SYSTEM SHALL NOT เพิ่ม Merchant-only auth provider ใน feature นี้
- 4.7 THE SYSTEM SHALL NOT เพิ่ม Merchant-only navigation ใน feature นี้
- 4.8 WHERE `ADMIN_API_ORIGIN` ถูกกำหนด THE SYSTEM SHALL rewrite `/admin/:path*` ไป `/api/v1/admins/:path*`
- 4.9 WHERE `ADMIN_API_ORIGIN` ถูกกำหนด THE SYSTEM SHALL rewrite `/producer/:path*` ไป `/api/v1/merchants/:path*`
- 4.10 WHERE `ADMIN_API_ORIGIN` ถูกกำหนด THE SYSTEM SHALL rewrite `/api/:path*` ไป backend `/api/:path*`
- 4.11 IF `ADMIN_API_ORIGIN` ไม่ถูกกำหนด THEN THE SYSTEM SHALL ปิด development rewrites ทั้งหมด
- 4.12 WHEN Merchant registration submit ข้อมูล THE SYSTEM SHALL ส่ง `POST /producer/users/register`
- 4.13 THE SYSTEM SHALL คง `/register` เป็น public route ที่ไม่ผ่าน protected application layout
- 4.14 WHEN root test suite รัน THE SYSTEM SHALL execute existing Admin auth/API test cases กับ source copy ของทั้งสอง app

## REQ-5: Application and Build Isolation

**User Story:** As a release engineer, I want source, assets และ build output แยกตาม app, so that
การ build หรือ start app หนึ่งไม่อ่านหรือเขียน artifact ของอีก app.

**Acceptance Criteria (EARS):**

- 5.1 THE SYSTEM SHALL เก็บ Admin application source ใต้ `apps/admin/src`
- 5.2 THE SYSTEM SHALL เก็บ Merchant application source ใต้ `apps/merchant/src`
- 5.3 THE SYSTEM SHALL เก็บ static assets ที่แต่ละ app ใช้ใน `public` ของ app นั้น
- 5.4 THE SYSTEM SHALL มี Next.js, TypeScript, ESLint, PostCSS และ Vitest configuration ต่อ app ตามที่เครื่องมือต้องใช้
- 5.5 WHEN build Admin app THE SYSTEM SHALL เขียน output ใต้ `apps/admin/.next`
- 5.6 WHEN build Merchant app THE SYSTEM SHALL เขียน output ใต้ `apps/merchant/.next`
- 5.7 WHILE build app หนึ่ง THE SYSTEM SHALL NOT แก้ build output ของอีก app
- 5.8 WHEN build app ใด app หนึ่ง THE SYSTEM SHALL สร้าง Next.js standalone output สำหรับ app นั้น
- 5.9 WHEN app resolve `@/*` THE SYSTEM SHALL resolve alias ไปยัง `src/*` ของ app ตัวเอง
- 5.10 IF app อ้าง static asset ที่ย้ายมาจาก baseline THEN THE SYSTEM SHALL ให้บริการ asset นั้นจาก app เดิมโดยไม่อ่าน `public` ของอีก app

## REQ-6: Shared Package Boundaries

**User Story:** As a POL developer, I want แชร์เฉพาะ code ที่เป็น shared จริง, so that route และ auth
ของสอง app ยังลบหรือเปลี่ยนแยกกันได้ภายหลัง.

**Acceptance Criteria (EARS):**

- 6.1 THE SYSTEM SHALL ให้ `@pol/shared` export เฉพาะ pure types, validation และ utilities ที่ทั้งสอง app ใช้
- 6.2 THE SYSTEM SHALL ให้ `@pol/ui` export เฉพาะ presentational components และ styles ที่ทั้งสอง app ใช้
- 6.3 THE SYSTEM SHALL อนุญาต dependency direction จาก apps ไป `@pol/ui` และ `@pol/shared`
- 6.4 THE SYSTEM SHALL อนุญาต `@pol/ui` depend on `@pol/shared`
- 6.5 THE SYSTEM SHALL NOT ให้ `@pol/shared` depend on React, Next.js หรือ app workspace
- 6.6 THE SYSTEM SHALL NOT ให้ package ใต้ `packages/` import source จาก app workspace
- 6.7 THE SYSTEM SHALL เก็บ route, auth provider, API adapter และ navigation ไว้ใน app เจ้าของ
- 6.8 THE SYSTEM SHALL NOT สร้าง shared route หรือ shared auth abstraction ใน feature นี้
- 6.9 WHERE module ถูกใช้โดย app เดียว THE SYSTEM SHALL เก็บ module นั้นใน app workspace

## REQ-7: Environment and Local HTTPS

**User Story:** As a POL developer, I want environment setup แยกตาม app โดยไม่คัดลอก secret
อัตโนมัติ, so that local setup ชัดเจนและ credential ไม่รั่วระหว่าง workspace.

**Acceptance Criteria (EARS):**

- 7.1 THE SYSTEM SHALL มี `apps/admin/.env.example` ที่ใช้เฉพาะค่าปลอมหรือค่า development ที่ไม่ใช่ secret
- 7.2 THE SYSTEM SHALL มี `apps/merchant/.env.example` ที่ใช้เฉพาะค่าปลอมหรือค่า development ที่ไม่ใช่ secret
- 7.3 THE SYSTEM SHALL NOT ย้าย root `.env.local` เข้า app workspace อัตโนมัติ
- 7.4 THE SYSTEM SHALL NOT commit dotenv files นอกเหนือจาก `.env.example`
- 7.5 THE SYSTEM SHALL อนุญาต commit เฉพาะ `.env.example` สำหรับ environment template
- 7.6 WHEN Next.js สร้าง local HTTPS certificate THE SYSTEM SHALL เก็บ certificate ไว้ใน ignored path
- 7.7 WHEN Admin app เริ่มทำงาน THE SYSTEM SHALL โหลด environment overrides จาก `apps/admin/.env.local`
- 7.8 WHEN Merchant app เริ่มทำงาน THE SYSTEM SHALL โหลด environment overrides จาก `apps/merchant/.env.local`
- 7.9 THE SYSTEM SHALL NOT commit certificate private key หรือ credential file

## REQ-8: Admin Production Image

**User Story:** As a release engineer, I want production image เดิมยัง build Admin ได้หลังย้าย workspace,
so that monorepo migration ไม่ตัด deployment path ที่มีอยู่.

**Acceptance Criteria (EARS):**

- 8.1 WHEN build root `Dockerfile` THE SYSTEM SHALL install workspace dependencies ด้วย `npm ci`
- 8.2 WHEN build root `Dockerfile` THE SYSTEM SHALL build `@pol/admin`
- 8.3 WHEN start Admin container THE SYSTEM SHALL รัน Admin standalone server ผ่าน HTTP port `3001`
- 8.4 THE SYSTEM SHALL expose container port `3001`
- 8.5 THE SYSTEM SHALL health-check Admin container ผ่าน HTTP port `3001`
- 8.6 THE SYSTEM SHALL NOT เพิ่ม Merchant production image ใน feature นี้
- 8.7 THE SYSTEM SHALL NOT embed `.env.local` หรือ secret ใน production image

## REQ-9: Verification, CI and Documentation

**User Story:** As a POL maintainer, I want automated checks และ setup documentation ครอบ workspace
split, so that route drift และ build regression ถูกจับก่อน merge.

**Acceptance Criteria (EARS):**

- 9.1 THE SYSTEM SHALL คง existing guard regression tests, secret scan และ spec-trace checks ใน CI
- 9.2 WHEN CI รัน THE SYSTEM SHALL execute `npm ci` จาก repository root
- 9.3 WHEN CI รัน THE SYSTEM SHALL execute root `lint`
- 9.4 WHEN CI รัน THE SYSTEM SHALL execute root `typecheck`
- 9.5 WHEN CI รัน THE SYSTEM SHALL execute root `test`
- 9.6 WHEN CI รัน THE SYSTEM SHALL build Admin app
- 9.7 WHEN CI รัน THE SYSTEM SHALL build Merchant app
- 9.8 WHEN CI รัน THE SYSTEM SHALL fail หาก production dependency audit พบ vulnerability ระดับ high ขึ้นไป
- 9.9 WHEN ทั้งสอง builds เสร็จ THE SYSTEM SHALL ตรวจ route parity จาก route sets ที่ normalize ตาม REQ-3.11 ถึง REQ-3.14
- 9.10 IF normalized Merchant routes มีความต่างจาก Admin routes นอกเหนือ `/register` THEN THE SYSTEM SHALL fail route-parity check
- 9.11 WHEN route smoke tests รัน THE SYSTEM SHALL ยืนยันว่า Merchant `/admin/user/list` ไม่ตอบ HTTP `404`
- 9.12 WHEN route smoke tests รัน THE SYSTEM SHALL ยืนยันว่า Admin `/register` ตอบ HTTP `404`
- 9.13 WHEN route smoke tests รัน THE SYSTEM SHALL ยืนยันว่า Merchant `/register` ไม่ตอบ HTTP `404`
- 9.14 WHEN dependency-boundary check รัน THE SYSTEM SHALL fail หาก app import source จากอีก app
- 9.15 THE SYSTEM SHALL NOT มี committed test ที่ใช้ `.only` หรือ `.skip`
- 9.16 THE SYSTEM SHALL document root commands, การคัดลอก app-local `.env.example` ด้วยมือ และสอง-terminal development workflow
- 9.17 THE SYSTEM SHALL document Admin dev URL เป็น `https://localhost:3001`
- 9.18 THE SYSTEM SHALL document Merchant dev URL เป็น `https://localhost:3002`
- 9.19 THE SYSTEM SHALL document production local servers ว่าใช้ HTTP
- 9.20 THE SYSTEM SHALL document local certificate trust behavior
- 9.21 THE SYSTEM SHALL document backend origin coordination สำหรับ staging และ production

## Edge Cases & Open Questions

### Locked Decisions

- Merchant route parity ใช้ implementation จริง ไม่ใช้ placeholder
- Merchant clone `AdminMe`, `getMe`, Admin auth/API และ Admin navigation ในรอบนี้
- Merchant มี `/register` เพิ่มจาก Admin หนึ่ง route
- Admin ต้องไม่มี `/register`
- การคัด Merchant routes, auth และ navigation เป็น feature แยกภายหลัง

### Accepted Limitations

- Admin OAuth callback ยังอ้าง Admin SPA origin `https://localhost:3001`; feature นี้ไม่เปลี่ยน backend auth contract เพื่อให้ callback กลับ port `3002`
- Merchant cloned Admin pages ต้องใช้ Admin session และ Admin permissions เหมือน source app ในรอบนี้
- Route parity check ไม่นับ Next.js internal/generated metadata routes เป็น user-facing page routes
- Root `Dockerfile` รองรับ Admin เท่านั้น; Merchant deployment path อยู่นอก scope
- ไม่มี combined `dev:all` script; รันสอง dev commands คนละ terminal โดยไม่เพิ่ม process-runner dependency

### Backend Coordination

- `pol-core` development config มี Admin `SpaBaseUrl=https://localhost:3001` แล้ว
- `pol-core` development config มี Merchant `SpaBaseUrl=https://localhost:3002` แล้ว
- staging และ production ต้องกำหนด Admin/Merchant frontend origins ก่อน deploy แต่ไม่แก้ sibling repository ใน feature นี้

### Migration Safety

- Implementation ต้องรักษา uncommitted changes ที่มีอยู่ก่อนสร้าง spec นี้
- ห้าม commit, push หรือเปิด pull request ระหว่างงานนี้ เว้นแต่ผู้ใช้สั่งเพิ่มภายหลัง
- รอบ requirements นี้สร้างเฉพาะ spec folder และ `requirements.md`; source/config ยังไม่ถูกแก้

| Baseline modified file | สถานะก่อนสร้าง spec |
|---|---|
| `.ai/shared/TASK_PROTOCOL.md` | user-owned modification |
| `.ai/shared/stack/nextjs.md` | user-owned modification |
| `.env.example` | user-owned modification |
| `.gitignore` | user-owned modification |
| `README.md` | user-owned modification |
| `docs/dev-setup.md` | user-owned modification |
| `package.json` | user-owned modification |

### /spec-analyze Findings Log (2026-08-17)

Commit anchor: `requirements.md` ยัง untracked; repository HEAD ตอน audit คือ `a59f44b`.

- **A1 — logical inconsistency, REQ-7.4/7.5:** แก้ REQ-7.4 ให้ยกเว้น `.env.example` ชัดเจน และย้ายข้อห้าม credential material ไป REQ-7.9
- **A2 — ambiguity, REQ-2.3:** ล็อก `lint` ให้ตรวจทั้งสี่ workspaces และเพิ่ม REQ-2.14 สำหรับ `typecheck` เพื่อคงแต่ละ criterion เป็น atomic
- **A3 — gap, REQ-7.1 ถึง REQ-7.3:** เพิ่ม REQ-7.7/7.8 ให้แต่ละ app โหลด workspace-local `.env.local`; REQ-7.3 คง root file ไว้ และ REQ-9.16 ระบุ manual setup
- **A4 — ambiguity, REQ-3.5/9.9:** เพิ่ม REQ-3.11 ถึง REQ-3.14 เพื่อกำหนด manifest source, page-key normalization, internal-route exclusion และ dynamic notation
- **A5 — conflicting constraints, REQ-1.4/9.8:** `npm audit --omit=dev --audit-level=high` บน baseline คืน exit 1 พร้อม 9 high vulnerabilities; อนุมัติให้ upgrade `next` เป็น `16.3.1`, upgrade `sharp` เป็น `0.35.3`, ย้าย `shadcn@4.8.0` ไป dev dependency และกำหนด Node.js ขั้นต่ำ `20.9.0` โดยไม่เพิ่ม package ใหม่
- **Downstream sync:** ยังไม่มี `design.md` หรือ `tasks.md`; ไม่มี downstream artifact ต้องแก้

ไม่มี open question ค้างก่อน requirements review.
