# Bugfix: Turbopack Google Fonts Cache

> Status: approved 2026-08-13

กู้ production build ที่ล้มจาก Turbopack cache ซึ่งอ้าง Google Fonts URL หมดอายุ โดยไม่เปลี่ยนพฤติกรรมของหน้าเว็บหรือระบบ auth

## Current Behavior (Defect)

WHEN production build ใช้ `.next/cache/turbopack` ปัจจุบัน THEN build ล้มซ้ำด้วย Google Fonts URL ที่ตอบ `404` และ error ต่อไปนี้:

```text
Error: Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
```

คำสั่ง reproduce ซึ่งล้มเหมือนกัน 2 ครั้ง:

```bash
OPENSSL_CONF=/dev/null /Users/king_developer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/next/dist/bin/next build
```

Control build จาก cache สะอาดผ่านครบ 114 routes ส่วน `next build --webpack` ผ่านโดยไม่แก้ source

## Expected Behavior

- F1 WHEN production build รันด้วย dependency ที่ติดตั้งตาม repository lockfile THE SYSTEM SHALL complete โดยไม่มี Google Fonts download error หรือ Turbopack module-resolution error
- F2 IF Turbopack cache อ้าง remote font response ที่ใช้ไม่ได้แล้ว THEN THE SYSTEM SHALL regenerate build cache จาก font metadata ปัจจุบัน

## Unchanged Behavior

- B1 WHEN client เปิด `/` THE SYSTEM SHALL CONTINUE TO redirect ไป `/dashboard`
- B2 WHEN session ยังไม่ authenticated THE SYSTEM SHALL CONTINUE TO redirect ผู้ใช้ไป `/login`
- B3 WHEN session authenticated THE SYSTEM SHALL CONTINUE TO render protected application
- B4 WHENผู้ใช้เลือก `Public Sans`, `Inter`, `DM Sans` หรือ `Nunito Sans` THE SYSTEM SHALL CONTINUE TO apply font family ผ่าน CSS variables
- B5 WHENแสดงข้อความภาษาไทย THE SYSTEM SHALL CONTINUE TO use `Noto Sans Thai` fallback ตาม weight ที่กำหนด
- B6 WHEN production build ใช้ repository lockfile THE SYSTEM SHALL CONTINUE TO run dependency version ที่ตรงกับ `package-lock.json`

## Scope

- In: invalidate Turbopack cache แบบกู้คืนได้, sync installed dependency ตาม lockfile, rebuild, start production server, verify HTTP/runtime
- Out: เปลี่ยน font implementation, เพิ่ม dependency, เปลี่ยน route, เปลี่ยน auth behavior, deploy production
