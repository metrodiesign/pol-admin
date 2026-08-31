# Bugfix: Admin Auth Evidence and Documentation

> Status: approved 2026-08-27

เติมหลักฐานของ Admin logout failure path และทำเอกสาร auth ให้ตรงกับ implementation ปัจจุบัน
โดยคง BFF session, logout security, Microsoft OIDC contract และ merchant behavior เดิม.

## Current Behavior (Defect)

WHEN `POST /api/v1/admins/auth/logout` คืน non-2xx หรือ network error
THEN implementation ปัจจุบันไม่ควร redirect เหมือนสำเร็จแล้ว แต่ repository ยังไม่มี component หรือ
browser regression test ที่ยืนยัน rendered failure state, retry action และการไม่ navigate ของทั้ง
`/logout` page และ Account drawer.

WHEN Admin Microsoft login ทำงาน
THEN backend ปัจจุบันส่ง `prompt=select_account` และใช้ Authorization Code กับ PKCE แต่ evidence
และเอกสารบางส่วนยังไม่ตรงกัน:

- `docs/dev-setup.md` ยังระบุ Admin Google login ทั้งที่ Admin route ปัจจุบันใช้ Microsoft
- `.claude/specs/login-google-sso/design.md` ยังอ้าง caller ที่ใช้ `.finally` redirect
- tasks/evidence เดิมใช้จำนวน test และ dependency version จาก environment เก่า

Reproduction seams:

- ทำให้ logout response เป็น `401`, `403`, `500` หรือ network rejection ใน component test harness
- ตรวจ `router.replace` หรือ `window.location.href` หลัง failure
- ตรวจ auth documentation และ bugfix evidence เทียบกับ source ปัจจุบัน
- ตรวจ Admin Microsoft authorize request ที่มี `prompt=select_account`, PKCE, state และ nonce

## Expected Behavior

- F-1 WHEN logout สำเร็จด้วย HTTP `204` THE SYSTEM SHALL navigate ไป `/login` และแสดงผลสำเร็จตาม
  contract เดิม.
- F-2 WHEN logout คืน non-2xx หรือ network error THE SYSTEM SHALL ไม่ navigate เหมือนสำเร็จ
  SHALL แสดง failure state ที่มองเห็นได้ และ SHALL มี action สำหรับ retry.
- F-3 THE SYSTEM SHALL มี component regression tests ที่รัน caller จริงของ `/logout` page และ
  Account drawer และตรวจ observable navigation/failure behavior.
- F-4 THE SYSTEM SHALL มี evidence ของ authenticated success contract โดยใช้ test harness หรือ
  isolated backend test ที่ไม่ทำ real logout mutation และตรวจ `204`, session revoke, audit และ
  cookie cleanup ตามขอบเขตที่ทดสอบได้.
- F-5 WHEN Admin เริ่ม Microsoft login THE SYSTEM SHALL คง authorization request ที่มี
  `prompt=select_account`, Authorization Code, PKCE S256, state และ nonce.
- F-6 THE SYSTEM SHALL แก้เอกสารและ spec evidence ให้ระบุ provider, route, status, test count และ
  dependency version ที่ตรงกับ source ปัจจุบัน โดยไม่ใส่ secret.

## Unchanged Behavior

- B-1 WHEN local logout สำเร็จ THE SYSTEM SHALL CONTINUE TO revoke current POL session family,
  append logout audit, clear session/CSRF cookies และคืน `204`.
- B-2 WHEN logout-all สำเร็จ THE SYSTEM SHALL CONTINUE TO revoke ทุก POL session ของ Admin ทุกอุปกรณ์.
- B-3 WHEN logout mutation ไม่มี valid CSRF THE SYSTEM SHALL CONTINUE TO คืน `403`.
- B-4 WHEN Microsoft login ทำงาน THE SYSTEM SHALL CONTINUE TO ใช้ minimal scopes, tenant pinning,
  Authorization Code และ PKCE S256.
- B-5 WHEN auth ทำงาน THE SYSTEM SHALL CONTINUE TO ไม่เปิดเผย token หรือ session credential แก่
  frontend JavaScript, URL, browser storage, test artifact หรือ log.
- B-6 WHEN local logout ถูกเลือก THE SYSTEM SHALL CONTINUE TO ไม่ sign out Microsoft session ของ app
  อื่นโดยอัตโนมัติ และไม่เรียก RP-Initiated Logout.
- B-7 WHEN merchant authentication หรือ merchant logout ทำงาน THE SYSTEM SHALL CONTINUE TO ไม่เปลี่ยน
  behavior.
- B-8 THE SYSTEM SHALL CONTINUE TO ไม่เปลี่ยน database schema, session-store contract, cookie names,
  RBAC policy หรือ API route contract.
- B-9 THE SYSTEM SHALL CONTINUE TO ไม่แก้ `pol-core` implementation เมื่อ evidence และ tests ที่มีอยู่
  พิสูจน์ contract ได้แล้ว.
- B-10 THE SYSTEM SHALL CONTINUE TO ไม่อ่านหรือแก้ `.env.local`, production data, real PSP mutation
  หรือ dirty Organization API work.

## Hard Scope

แก้ได้เฉพาะ Admin auth callers/tests, safe contract evidence และเอกสารที่กล่าวถึง Admin auth ใน
`pol-admin`.

ห้ามแก้ merchant auth, Google app registration, federated logout, session schema, PSP/TLS
implementation, `pol-core` source, `.env.local`, production data หรือ dirty Organization API files.
