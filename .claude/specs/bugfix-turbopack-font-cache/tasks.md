# Tasks: Turbopack Google Fonts Cache

> Status: approved 2026-08-13

กู้ production build ด้วยการแก้ runtime state ต้นเหตุ แล้วพิสูจน์ build, route, auth และ font behavior โดยไม่เปลี่ยน source application

## Implementation

- [x] Task 1: Recover production build and verify runtime
  - Satisfies: F1, F2, B1, B2, B3, B4, B5, B6
  - Scope: backup stale Turbopack cache, install dependency ตาม lockfile, rebuild production, run automated checks, probe production HTTP/runtime
  - Verify: default production build ผ่าน, test/lint/typecheck ผ่าน, `/` redirect ถูกต้อง, protected route และ auth flow ตอบสนองตาม spec

  Evidence: production build และ runtime recovery ผ่าน
    - test: `node ./node_modules/next/dist/bin/next build` -> ผ่าน 2 รอบ, TypeScript ผ่าน, generate 114 routes
    - test: `node ./node_modules/vitest/vitest.mjs run` -> 21 files passed, 234 tests passed
    - test: `node ./node_modules/eslint/bin/eslint.js .` -> exit 0
    - test: `node ./node_modules/typescript/bin/tsc --noEmit` -> exit 0
    - test: production HTTP probe บน `127.0.0.1:5201` -> `/` 307 ไป `/dashboard`, dashboard/login 200, Next assets 30/30, font assets 44/44
    - test: installed dependency check -> manifest, lock และ installed Next ตรงกันที่ `16.2.6`; package files ไม่เปลี่ยน
    - test: `scripts/spec-trace.sh bugfix-turbopack-font-cache` -> ข้าม bugfix spec; manual F/B trace check ผ่าน F1, F2, B1-B6
    - viewports: n/a — browser runtime เริ่มไม่ได้เพราะ OpenSSL config ถูก sandbox ปฏิเสธก่อนเชื่อมต่อ
    - deviations: authenticated browser flow ไม่ได้รัน; source auth ไม่เปลี่ยนและ automated suite ผ่าน
    - deviations: `npm audit --omit=dev --audit-level=high` พบ pre-existing 9 high; ไม่ auto-fix หรือขยาย scope
    - deviations: Next เตือน `.env.local` EPERM จาก sandbox แต่ build และ runtime exit 0
