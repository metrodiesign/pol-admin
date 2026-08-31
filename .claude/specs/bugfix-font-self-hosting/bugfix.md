# Bugfix: Self-hosted Admin Fonts

> Status: approved 2026-08-27

เปลี่ยน Admin font pipeline จาก build-time Google Fonts fetch เป็น local font assets ที่มี license
ตรวจสอบแล้ว เพื่อให้ build deterministic และไม่ขึ้นกับ outbound network โดยคง family, weight,
Thai fallback และ CSS variable contract เดิม.

## Current Behavior (Defect)

WHEN production build ใช้ source ที่ import `next/font/google` ใน `src/app/layout.tsx:3-11`
THEN Next loader ยัง fetch Google CSS และ font files ระหว่าง build.

WHEN `.next/cache/turbopack` มี generated state ที่อ้าง virtual font module ซึ่งใช้ไม่ได้
THEN build ล้มด้วย:

```text
Error: Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
```

นอกจากนี้ source-level contract ยังไม่ตรงกับ requirement ใหม่ เพราะ build ยังต้องพึ่ง Google Fonts
network แม้ runtime หลัง build จะเสิร์ฟ `.woff2` แบบ local ได้.

Reproduction และ evidence ปัจจุบัน:

- `src/app/layout.tsx` ยังเรียก `next/font/google`
- installed Next ปัจจุบันคือ `16.3.1`
- generated cache มี Google Fonts URL
- ยังไม่มี test ที่บังคับ offline build หรือดัก outbound Google Fonts request

## Expected Behavior

- F-1 THE SYSTEM SHALL เก็บ local font assets ของทุก family และ weight ที่ Admin ใช้อยู่ใน
  repository พร้อมหลักฐาน license ที่ตรวจสอบได้.
- F-2 WHEN production build ทำงานโดยไม่มี outbound access ไป Google Fonts
  THE SYSTEM SHALL complete โดยไม่ส่ง request ไป `fonts.googleapis.com`, `fonts.gstatic.com` หรือ
  Google Fonts endpoint อื่น.
- F-3 WHEN build ใช้ clean cache หรือ stale `.next/cache/turbopack`
  THE SYSTEM SHALL สร้าง font output จาก local assets โดยไม่อ้าง
  `@vercel/turbopack-next/internal/font/google/font`.
- F-4 WHEN Admin ใช้ `Public Sans`, `Inter`, `DM Sans` หรือ `Nunito Sans`
  THE SYSTEM SHALL คง CSS variable และ computed font family semantics เดิม.
- F-5 WHEN แสดงข้อความภาษาไทย THE SYSTEM SHALL คง `Noto Sans Thai` fallback และ weight ที่กำหนด
  โดยตรวจจาก computed style ใน browser runtime.
- F-6 THE SYSTEM SHALL สร้าง regression test ที่ตรวจทั้ง absence ของ remote font request ตอน build
  และ local generated font asset ตอน runtime.
- F-7 WHEN production build และ server เริ่มด้วย dependency ตาม repository lockfile
  THE SYSTEM SHALL คง route, auth และ protected-page behavior เดิม.

## Unchanged Behavior

- B-1 WHEN client เปิด `/` THE SYSTEM SHALL CONTINUE TO redirect ไป `/dashboard`.
- B-2 WHEN session ยังไม่ authenticated THE SYSTEM SHALL CONTINUE TO redirect ไป `/login`.
- B-3 WHEN session authenticated THE SYSTEM SHALL CONTINUE TO render protected application.
- B-4 THE SYSTEM SHALL CONTINUE TO ใช้ font family และ CSS variable ที่ component ปัจจุบันเรียก
  โดยไม่เปลี่ยน typography contract ของ page อื่น.
- B-5 THE SYSTEM SHALL CONTINUE TO ใช้ dependency version ที่ตรงกับ `package-lock.json`.
- B-6 THE SYSTEM SHALL CONTINUE TO ไม่เปลี่ยน route, auth, API, RBAC, PSP behavior หรือ backend.
- B-7 THE SYSTEM SHALL CONTINUE TO ไม่เพิ่ม dependency ใหม่ถ้า local font loader ที่มีอยู่รองรับได้.
- B-8 THE SYSTEM SHALL CONTINUE TO ไม่อ่านหรือแก้ `.env.local`, production data, real PSP mutation
  หรือ dirty Organization API work.
- B-9 THE SYSTEM SHALL CONTINUE TO ไม่แก้ `pol-core`, database schema, API contract หรือ routing
  rules.

## Hard Scope

แก้ได้เฉพาะ `src/app/layout.tsx`, local font assets และ regression/build/runtime evidence ที่จำเป็น
ต่อ font pipeline ใน `pol-admin`.

ห้ามแก้ auth, route, API, PSP, backend, dependency versions, `.env.local`, production data หรือ
Organization API dirty work.
