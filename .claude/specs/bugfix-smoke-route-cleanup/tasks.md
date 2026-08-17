# Implementation Tasks: Bound Smoke Route Cleanup

> Status: approved 2026-08-17

Task เดียวครอบ regression seam, process lifecycle, CI backstop และ acceptance เพื่อให้ observable
shutdown behavior ถูกแก้และพิสูจน์พร้อมกัน.

## Tasks

- [x] 1. ทำ smoke cleanup ให้ bounded และ process-tree-safe พร้อม regression coverage — สร้าง test
  seam ที่พิสูจน์ missed-event hang แบบ RED ก่อนแก้, ปิด owned process tree/stdio ด้วย deadline,
  คง route/port/signal behaviors, เพิ่ม CI step timeout และรัน full acceptance บน Node/npm ที่ CI pin
  - **Satisfies:** F-1, F-2, F-3, F-4, F-5, F-6, B-1, B-2, B-3, B-4, B-5, B-6, B-7, B-8
  - **Verify:** regression test ต้อง RED บน cleanup implementation เดิมและ GREEN หลังแก้;
    `npm run lint`, `npm run typecheck`, `npm test`, builds, workspace verification, route smoke,
    task gate, bugfix trace และ Linux process-cleanup stress ต้องผ่าน
  Evidence: RED เดิม fail `cleanup did not settle` (9/10 pass) และ closed-leader fixture fail
  `Missing expected exception` (14/15 pass); GREEN `npm test` ผ่าน Node 15/15, Admin 209/209,
  Merchant 209/209, Shared 26/26; `npm audit --omit=dev`, lint, typecheck, Admin/Merchant builds,
  workspace parity 112/113 routes, signal exits 130/143, route statuses 307/307/200/404/200 และ
  Linux Node 22.19.0/npm 11.12.1 fresh-build stress 3 รอบผ่าน; viewports: n/a (process lifecycle).

## Execution

ใช้ session เดียวเพราะ test seam และ production cleanup logic แชร์ process lifecycle contract.
