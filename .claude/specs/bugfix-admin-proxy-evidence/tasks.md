# Tasks: Admin Proxy TLS Evidence

> Status: approved 2026-08-27

งานนี้เติมหลักฐานที่ขาดของ Next proxy และตรวจ certificate boundary โดยคง relative API path,
auth contract และ production topology.

## Tasks

- [x] 1. สร้าง proxy integration seam ที่ตรวจ status, header, body และ correlation ID
  - **Satisfies:** F-1, F-2, F-6, B-1, B-2, B-3, B-4, B-5, B-6, B-8, B-9, B-10, B-11, B-12
  - **Files:** `next.config.ts`, `scripts/dev-tls-ca.cjs`, proxy integration test/helper และ test backend fixture ที่จำเป็น
  - **Verify:** สร้าง local HTTPS upstream ที่คืน response deterministic; รัน RED เมื่อไม่ preload CA หรือ proxy forwarding ไม่ครบ; หลังแก้ต้อง GREEN สำหรับ `/api/v1/merchants`, `/api/v1/approvals` และ `/api/v1/payments/psp-connections`; assert status, `content-type`, body และ `X-Correlation-ID` โดยไม่เปิดเผย secret
  Evidence: proxy integration RED เมื่อไม่ preload และ GREEN เมื่อ preload; logic-only, deviations none
    - test: `rtk proxy node --test scripts/lib/workspace-verification.test.mjs` -> 28 tests ผ่าน; control ไม่ preload ได้ 500 และ preload ได้ 207 พร้อม status, content type, body, correlation ID ครบ 3 endpoint
    - test: `rtk proxy npm test` -> Node 28 ผ่าน, root Vitest 330 ผ่าน, shared 26 ผ่าน
    - test: `rtk proxy npm run typecheck` -> root, `@pol/ui` และ `@pol/shared` ผ่าน
    - viewports: n/a — logic-only
    - deviations: none

- [x] 2. พิสูจน์ process restart และจำกัด local certificate trust
  - **Satisfies:** F-3, F-5, B-7, B-9, B-10, B-11, B-12
  - **Files:** `scripts/dev-tls-ca.cjs`, startup scripts/config tests และ proxy evidence
  - **Verify:** เริ่ม process สองรอบด้วย configuration คนละชุดและตรวจว่าใช้ค่ารอบล่าสุด; ทดสอบ project-approved local certificate กับ upstream ที่ไม่ approved; ยืนยันว่า TLS verification ไม่ถูกปิดแบบ global และ production ที่ไม่มี `ADMIN_API_ORIGIN` ยังคง same-origin topology
  Evidence: restart โหลด CA ล่าสุดและ non-local origin ไม่ได้รับ CA; logic-only, deviations none
    - test: `rtk proxy node --test scripts/lib/workspace-verification.test.mjs` -> 29 tests ผ่าน รวม F-3 และ F-5
    - test: `rtk proxy npm test` -> Node 29 ผ่าน, root Vitest 330 ผ่าน, shared 26 ผ่าน
    - test: `rtk proxy npm run typecheck` -> root, `@pol/ui` และ `@pol/shared` ผ่าน
    - viewports: n/a — logic-only
    - deviations: none

- [x] 3. เติม authenticated Admin browser evidence โดยไม่ทำ mutation จริง
  - **Satisfies:** F-4, B-1, B-2, B-3, B-5, B-6, B-11, B-12
  - **Files:** browser verification script/artifact และเอกสาร evidence ของ bugfix
  - **Verify:** ใช้ safe authenticated test session หรือ isolated fixture เปิด `/control/psp/list`; ตรวจ valid rows หรือ empty state, ไม่มีสาม proxy error banner, session token ไม่อยู่ใน DOM/URL/storage/log และไม่กด create/edit/test credential/logout จริง
  Evidence: safe fixture แสดง PSP rows ผ่าน proxy โดยไม่มี error banner หรือ sensitive value; browser, deviations: ใช้ HTTPS dev runtime ตามคำสั่งผู้ใช้
    - test: `rtk proxy npm test` -> Node 29 ผ่าน, root Vitest 330 ผ่าน, shared 26 ผ่าน
    - test: `rtk proxy npm run typecheck` -> root, `@pol/ui` และ `@pol/shared` ผ่าน
    - browser: `https://localhost:3001/control/psp/list` แสดง 2 PSP rows, `/api/v1/merchants`, `/api/v1/approvals` และ `/api/v1/payments/psp-connections` ได้ 200; ไม่พบ proxy error banner
    - browser: DOM ไม่มี `secretKey`, `pspMerchantId` หรือ `Authorization`; localStorage มีเฉพาะ `minimals-settings`, sessionStorage ว่าง; ไม่กด mutation
    - browser: network มีเพียง GET ของ auth/catalog/approval/PSP list และไม่มี mutation request; current page console errors 0 และ warnings 0
    - test: `scripts/spec-trace.sh bugfix-admin-proxy-evidence` -> ข้ามตามกติกา bugfix spec ที่ไม่มี `requirements.md`
    - viewports: n/a — evidence-only page; measured `clientWidth=1200`, `innerWidth=1200`
    - deviations: user selected HTTPS dev server; production runtime browser evidence ยังไม่ได้รัน

## Execution

ทำ task 1 ก่อน task 2 เพราะ integration seam ต้องแยก proxy failure จาก certificate policy; ทำ task 3 เมื่อ
local proxy evidence ผ่านแล้ว.
