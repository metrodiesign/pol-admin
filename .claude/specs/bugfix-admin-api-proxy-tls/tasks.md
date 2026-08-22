# Implementation Tasks: Admin API Proxy Local TLS

> Status: approved 2026-08-22

แก้ trust ที่ process boundary ของ Next development proxy แล้วพิสูจน์ response forwarding และหน้า PSP
โดยไม่เปลี่ยน API client, auth, backend หรือ production topology.

## Tasks

- [x] 1. ทำให้ Next development process trust ASP.NET Core public certificate พร้อม regression
  coverage — เพิ่ม observable check ที่ RED เมื่อ dev command ไม่โหลด local CA, แก้ startup command ด้วย
  Node native TLS CA API, restart process แล้วตรวจสาม endpoint และ PSP page บน backend จริง
  - **Satisfies:** F-1, F-2, F-3, F-4, F-5, B-1, B-2, B-3, B-4, B-5, B-6, B-7,
    B-8, B-9, B-10, B-11, B-12, B-13, B-14
  - **Verify:** regression check ต้อง RED ก่อนแก้และ GREEN หลังแก้; สาม endpoint ผ่าน SPA origin ต้อง
    ส่งต่อ backend status, content type, body และ `X-Correlation-ID`; authenticated Admin ต้องได้ `200`
    และหน้า `/control/psp/list` ไม่มีสาม error banner; `npm run typecheck`, `npm run lint`, `npm test`,
    `npm run build`, focused Vitest command, bugfix trace และ viewport 375/768/1440 ต้องผ่าน
  Evidence: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` ผ่าน; viewports 375/768/1440 ผ่าน; deviations: authenticated Admin gate ผ่านหลัง session มี `settings.manage`.
  - **Evidence details:**
    - regression: `node --test scripts/lib/workspace-verification.test.mjs` RED 1 test ก่อนแก้ และ GREEN 23/23 หลังแก้
    - network: production-local start ก่อน preload คืน proxy `500` จาก self-signed certificate; หลัง preload ส่งต่อ `401 application/problem+json` จาก `pol-core` พร้อม `X-Correlation-ID`
    - browser: authenticated Admin เปิด `/control/psp/list` ได้จริง มี connection row, URL คงเดิม และ console `warn/error` ว่าง
    - gates: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` และ secret scan ผ่าน

## Execution

ใช้ task เดียวเพราะ defect และ fix อยู่ที่ Next process startup boundary จุดเดียว.
