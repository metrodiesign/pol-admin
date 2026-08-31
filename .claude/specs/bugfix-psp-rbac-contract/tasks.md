# Tasks: PSP RBAC Contract and Evidence

> Status: approved 2026-08-27

งานนี้ล็อกความแตกต่างระหว่าง account-level no-access กับ PSP list route/API denial และเพิ่ม
observable evidence โดยไม่แก้ `pol-core` หรือ PSP detail/edit scope.

## Tasks

- [x] 1. ล็อก `permissions: []` เป็น Inline 403 และอัปเดต contract evidence
  - **Satisfies:** F-1, F-5, F-6, B-1, B-2, B-5, B-6, B-8, B-9, B-10
  - **Files:** `src/lib/api/admin/auth.test.ts`, `src/components/auth/auth-guard.test.ts` หรือ seam ที่รัน `AuthGuard` จริง และ bugfix/spec evidence ที่ขัดกัน
  - **Verify:** fixture `GET /admin/me` status `200` พร้อม `permissions: []` ต้อง RED หากถูก redirect; หลังแก้ต้อง GREEN โดย URL คงเดิม, Inline 403 มองเห็นได้, ไม่มี `/error/403` navigation และไม่มี PSP child request; ตรวจ behavior `401`, loading, retry และ existing 403 page ไม่เปลี่ยน
  Evidence: Inline 403 contract ผ่าน; logic-only, deviations none
    - test: `rtk proxy npx vitest run src/components/auth/auth-guard.test.ts src/lib/api/admin/auth.test.ts` -> 2 files, 30 tests ผ่าน
    - test: `rtk proxy npm test` -> Node 26 ผ่าน, root Vitest 330 ผ่าน, shared 26 ผ่าน
    - test: `rtk proxy npm run typecheck` -> root, `@pol/ui` และ `@pol/shared` ผ่าน
    - viewports: n/a — logic-only
    - deviations: none

- [x] 2. พิสูจน์ route gate ของ PSP list ด้วย rendered redirect behavior
  - **Satisfies:** F-2, F-5, B-1, B-2, B-5, B-6, B-8, B-10
  - **Files:** `src/components/control/psp/psp-route-gate.tsx`, `src/app/control/psp/list/page.tsx`, route-gate test และ browser verification ที่เกี่ยวข้อง
  - **Verify:** ใช้ authenticated fixture ที่ไม่มี `settings.manage`; test ต้องตรวจว่า `/control/psp/list` เปลี่ยนเป็น `/error/403`, existing 403 page แสดงผล และ `PspConnectionsView` ไม่ถูก mount; ทำ RED ก่อนแก้ที่ seam จริง ไม่ตรวจเพียงค่าของ predicate
  Evidence: route denial แสดง existing 403 page และไม่ส่ง PSP list request; browser, deviations: ใช้ HTTPS dev runtime ตามคำสั่งผู้ใช้
    - test: `rtk proxy npm test` -> Node 26 ผ่าน, root Vitest 330 ผ่าน, shared 26 ผ่าน
    - test: `rtk proxy npm run typecheck` -> root, `@pol/ui` และ `@pol/shared` ผ่าน
    - browser: `https://localhost:3001/control/psp/list` เปลี่ยนเป็น `https://localhost:3001/error/403`; snapshot พบ code `403`, heading `ไม่มีสิทธิ์เข้าถึง` และ link `กลับหน้าหลัก`; ไม่พบ `GET /api/v1/payments/psp-connections`
    - browser: current page console errors 0 และ warnings 0
    - viewports: n/a — redirect-only
    - deviations: user selected HTTPS dev server; production runtime browser evidence ยังไม่ได้รัน

- [x] 3. พิสูจน์ PSP list API 403, redirect ครั้งเดียว และคง non-403 behavior
  - **Satisfies:** F-3, F-4, F-5, B-3, B-4, B-7, B-8, B-9, B-10
  - **Files:** `src/lib/api/control/psp.ts`, `src/components/control/psp/connections-view.tsx`, `src/lib/api/control/psp.integration.test.ts`, contract server fixture และ browser test
  - **Verify:** ให้ `GET /api/v1/payments/psp-connections` คืน `403`; test ต้องตรวจ `/error/403`, rendered 403 page และจำนวน request เป็นหนึ่งครั้ง; ตรวจ `401`, `404`, `500`, network error, allowed list, detail และ edit ว่ายังคง behavior เดิม; ห้ามยิง real PSP mutation
  Evidence: PSP list 403 ส่งไป existing 403 page และไม่มี request ใหม่หลัง redirect; browser, deviations: HTTPS dev runtime และ dev StrictMode มี initial aborted request หนึ่งรายการ
    - test: `rtk proxy npx vitest run src/lib/api/control/psp.integration.test.ts src/components/control/psp/psp-route-gate.test.ts` -> 2 files, 23 tests ผ่าน
    - test: `curl --max-time 5 -sS -o /dev/null -w 'status=%{http_code} content_type=%{content_type}\\n' 'http://127.0.0.1:5100/api/v1/payments/psp-connections?page=1&limit=25'` -> status 403, content type `application/json; charset=utf-8`
    - test: `rtk proxy npm test` -> Node 26 ผ่าน, root Vitest 330 ผ่าน, shared 26 ผ่าน
    - browser: `https://localhost:3001/control/psp/list` เปลี่ยนเป็น `https://localhost:3001/error/403`; snapshot พบ code `403` และ heading `ไม่มีสิทธิ์เข้าถึง`
    - browser: network พบ PSP list request สำเร็จ 403 หนึ่งรายการ และไม่มี request เพิ่มหลังรอ 2 วินาที; initial request ที่ถูก abort เป็น dev StrictMode behavior
    - viewports: n/a — redirect-only
    - deviations: user selected HTTPS dev server; console error หนึ่งรายการตรงกับ expected API 403 และ production runtime browser evidence ยังไม่ได้รัน

## Execution

ทำ task 1 ก่อน task 2 และ task 3 เพราะ `permissions: []` เป็น account-level contract แยกจาก route/API
permission denial. Browser verification ใช้ production target runtime และไม่ใช้ snapshot เก่าก่อน bugfix.
