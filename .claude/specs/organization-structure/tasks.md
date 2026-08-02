# Implementation Tasks: โมดูลโครงสร้างองค์กร (organization-structure)

> Status: approved 2026-08-02

> Each task is a cohesive, independently verifiable slice. Implement a whole task
> in one pass (it may touch many files). Decompose into sub-steps yourself at
> execution time — do NOT pre-split tasks here.

- [x] 1. โครงล่าง pure logic + API — types (`src/types/organization/org-unit.ts`), config
     (`src/lib/organization/org-unit/config.ts`), validation (`form.ts` + `form.test.ts`),
     generic API client (`src/lib/api/admin/org-unit.ts` + `org-unit.test.ts`), rewrite
     `/api/:path*` ใน `next.config.ts` — done = test เขียว + rewrite ถึง backend จริง
     Satisfies: REQ-7 (7.1-7.5). Verify: vitest ผ่านทั้ง 2 ไฟล์; dev แล้ว
     `curl localhost:3000/api/v1/offices` ได้คำตอบ backend (401/200) ไม่ใช่ 404 ของ Next.
     Evidence: test 20 passed / 0 failed; typecheck no errors; rewrite proxy 401 จาก backend
       - test: `npx vitest run src/lib/organization/org-unit/form.test.ts src/lib/api/admin/org-unit.test.ts` -> PASS (20) FAIL (0)
       - typecheck: `npx tsc --noEmit` -> No errors found
       - rewrite: dev server จริงอยู่ port 5200 (ไม่ใช่ 3000 ตามที่เดาไว้ใน Verify) — `curl localhost:5200/api/v1/offices` -> 401 จาก backend (:5100 ตอบ 401 ตรงกัน) ไม่ใช่ 404 ของ Next
       - viewports: n/a — logic-only
       - deviations: dev script ใช้ port 5200 (`next dev -p 5200`) ไม่ใช่ 3000

- [x] 2. หน้า list ครบวงจร (office นำร่อง) — toast กลาง (`src/hooks/use-toast.ts` +
     `src/components/shared/toaster.tsx`), shared list components ทั้งชุด
     (`status-badge`, `toolbar`, `columns`, `detail-sheet`, `confirm-dialog`, `view.tsx`),
     `src/app/organization/layout.tsx` + `office/list/page.tsx` — done = list office
     ใช้งานจริงกับ backend: ค้นหา/กรองสถานะ/เรียงไทย/detail sheet/ปิดใช้งานผ่าน dialog
     Satisfies: REQ-2, REQ-6. Depends on: 1. Verify: เปิด `/organization/office/list`
     ต่อ backend จริง — deactivate เห็น dialog คำว่า "ปิดใช้งาน" + pending + toast + reload;
     แถว inactive ไม่มีปุ่มปิดใช้งาน (ทั้งแถวและ sheet)
     Evidence: typecheck + eslint no issues; page compile + HTTP 200 บน dev server
       - test: `npx tsc --noEmit` -> No errors found; `npx eslint <ไฟล์ใหม่ทั้งหมด>` -> No issues found
       - page: `curl localhost:5200/organization/office/list` -> 200 (Next dev คืน 500 ถ้า compile พัง)
       - viewports: ยังไม่ตรวจ — รวมไว้ตรวจพร้อม browser E2E ของ task 6 (ต้อง login SSO ด้วยมือ)
       - deviations: interactive flow (dialog/toast/deactivate จริง) ยัง verify ใน browser ไม่ได้เพราะติด Google SSO login — เลื่อนไป manual E2E task 6

- [x] 3. หน้า read/create/edit ครบวงจร (office นำร่อง) — `form-status`, `read-view`,
     `create-view` (dirty-check ยกเลิก + 409 ที่ field code), `edit-view` (code disabled,
     PUT ส่ง `{name, isActive}` ครบ, เปิดใช้งานกลับผ่าน status select) + route office
     `read|create|edit/{page,layout}.tsx` (`?id=` หาย → redirect list) — done = flow
     create→edit→read จริงกับ backend ครบทุก error path
     Satisfies: REQ-3, REQ-4, REQ-5. Depends on: 2. Verify: create สำเร็จ + create ซ้ำเห็น
     409 ไม่ล้างฟอร์ม + ยกเลิกฟอร์ม dirty เห็น dialog; edit rename + toggle สถานะ; read + id มั่ว
     = notfound; `?id=` หาย redirect ไป list
     Evidence: typecheck + eslint no issues; ทั้ง 4 route ตอบถูกต้อง (200/307)
       - test: `npx tsc --noEmit` -> No errors found; `npx eslint src/components/organization src/app/organization` -> No issues found
       - routes: list 200, create 200, read/edit ไม่มี ?id= -> 307 ไป /organization/office/list (redirect_url ยืนยัน), read?id=<guid> -> 200
       - viewports: ยังไม่ตรวจ — รวมไว้ตรวจพร้อม browser E2E ของ task 6 (ต้อง login SSO ด้วยมือ)
       - deviations: interactive flow (409/dirty dialog/toggle สถานะจริง) ติด Google SSO — เลื่อนไป manual E2E task 6

- [x] 4. Route อีก 3 module (division / position / level) — clone route ชุด office
     เปลี่ยน config + metadata (7 ไฟล์ × 3, mechanical) — done = ทุก module เดินครบ 4 หน้า
     Satisfies: REQ-2, REQ-3, REQ-4, REQ-5, REQ-6 (บังคับใช้กับทุก module). Depends on: 3.
     Verify: เดินครบ 12 หน้าที่เหลือ + smoke create 1 รายการต่อ module
     Evidence: 12 route ตอบถูกครบ (list/create 200, read/edit ไม่มี id 307 ไป list ของ module ตน)
       - test: `npx tsc --noEmit` -> No errors found; `npx eslint src/app/organization` -> No issues found
       - routes: division/position/level × {list,create}=200, {read,edit}=307 ครบ 12 หน้า
       - viewports: ยังไม่ตรวจ — รวมไว้ตรวจพร้อม browser E2E ของ task 6
       - deviations: smoke create จริงต่อ module ติด SSO — เลื่อนไป manual E2E task 6

- [x] 5. Menu group + icons — เพิ่ม group "โครงสร้างองค์กร" (flat 4 items) ต่อจาก
     "ผู้ใช้งาน & สิทธิ์" ใน `nav-config.ts` + `minimals-nav-config.ts` (ตำแหน่งเดียวกันทั้งคู่),
     SVG solid-fill 4 ไฟล์ `public/assets/icons/navbar/ic-{building,sitemap,badge,ranking}.svg` —
     done = sidebar แสดง group ถูกตำแหน่ง icon ขึ้น active ถูก item
     Satisfies: REQ-1 (1.1-1.6). Depends on: 2 (ต้องมีหน้า list ให้ลิงก์/active). Verify:
     sidebar ทั้ง desktop + mini + mobile drawer แสดงครบ, เดินแต่ละ module แล้ว item active ถูกตัว,
     breadcrumb ทุกหน้าเป็น trail จาก config ไม่ใช่ path ดิบ
     Evidence: group "โครงสร้างองค์กร" โผล่ใน SSR HTML ของหน้า list; SVG 4 ไฟล์เสิร์ฟ 200 ครบ
       - test: `npx tsc --noEmit` -> No errors found; `npx eslint <nav config 2 ไฟล์>` -> No issues found
       - icons: `curl /assets/icons/navbar/ic-{building,sitemap,badge,ranking}.svg` -> 200 ทั้ง 4
       - nav: `curl /organization/office/list` HTML มี "โครงสร้างองค์กร" (แทรกทั้ง 2 config ตำแหน่งเดียวกัน — ถัดจาก "ผู้ใช้งาน & สิทธิ์")
       - viewports: ยังไม่ตรวจ — active state/mini rail/mobile drawer รวมตรวจใน browser E2E task 6
       - deviations: ic-ranking ใช้ลาย layers (สื่อ "ระดับ" ชัดกว่าแท่ง bar ที่ซ้ำกับ ic-analytics) — ชื่อไฟล์/icon key ยังเป็น ranking ตาม design

- [x] 6. Verification รวม + gate — done = พร้อมเปิด PR
     Satisfies: REQ-1..7 (ยืนยันรวม). Depends on: 4, 5. Verify: typecheck + lint + vitest
     เขียวทั้ง repo; manual E2E office เต็ม flow ตาม Testing Strategy ใน design.md;
     Network tab จากหน้า `/organization/*` เห็น `X-CSRF-Token` บน mutation; เรียงชื่อ
     ขึ้นต้นสระหน้า (เช่น "แผนก...") ถูกตามพจนานุกรมไทย
     Evidence: gate เขียวครบ + browser E2E ต่อ backend จริงผ่านทุก flow (production build, port 5300)
       - test: `npx vitest run` -> PASS (178) FAIL (0); `npx tsc --noEmit` -> no errors; `eslint src` -> exit 0; `npm run build` -> สำเร็จ ครบ 16 route; `scripts/spec-trace.sh` -> OK 46 เกณฑ์
       - E2E office เต็ม flow (Chrome DevTools MCP + admin session จริง): create 201 (POST body {code,name} + X-CSRF-Token ยืนยันจาก request จริง) -> create ซ้ำ 409 error ที่ field code ฟอร์มคงค่า -> ยกเลิก dirty เห็น dialog "ออกจากหน้านี้?" -> edit prefill + code disabled + PUT body {name,isActive} ครบ (ยืนยันจาก request: {"name":"…(แก้)","isActive":false}) -> toast "แก้ไข…สำเร็จ" -> reactivate ผ่าน status select -> deactivate ผ่าน dialog wording "ปิดใช้งาน" DELETE 204 + toast + reload -> แถว/sheet inactive ไม่มีปุ่มปิดใช้งาน -> read แสดงครบ + id มั่ว = "ไม่พบสำนักงานที่ระบุ" + ลิงก์กลับ -> search ไทย/code + filter สถานะถูกต้อง
       - เรียงไทย: office "ภาคใต้"(ใ->ต) มาก่อน "ภาคเหนือ"(เ->ห); division "แผนกทดสอบ"(แ->ผ) มาก่อน "ฝ่าย…" = localeCompare "th" ทำงาน (code-point sort จะกลับกัน)
       - smoke 3 module: division/position/level create ผ่านฟอร์มจริง toast สำเร็จครบ แล้ว deactivate test row ทั้งหมด (204)
       - sidebar: group "โครงสร้างองค์กร" ต่อจาก "ผู้ใช้งาน & สิทธิ์", icon 4 ตัว render, active state ถูก item (screenshot 1440), breadcrumb "Console · สำนักงาน" ไม่ใช่ path ดิบ
       - viewports: 375 OK (emulate, clientWidth=375 เป๊ะ, ไม่มี doc overflow) | 768 OK (clientWidth=768, ไม่ overflow) | 1440 OK (clientWidth=1440, ไม่ overflow)
       - deviations: test data test_e2e คงอยู่ในสถานะปิดใช้งานทั้ง 4 resource (backend ไม่มี hard delete); ทดสอบบน port 5300 (production build แยกจาก dev 5200)

## Suggested execution batches

Feature นี้ coupled สูง (ทุก task ใช้ types/config/client/components ร่วมกัน) —
default: รันทั้งหมดใน session เดียว `/spec-implement all` (หรือ
`scripts/pane-loop.sh organization-structure all-in-one`)
ไม่แนะนำแยก pane ต่อ task — ไม่มี task ไหน independent จริง
