# Bugfix: Admin Proxy TLS Evidence

> Status: approved 2026-08-27

เติม integration evidence และล็อก certificate boundary ของ Admin Next proxy หลัง root cause TLS เดิม
ถูกแก้แล้ว โดยไม่เปลี่ยน API client, auth architecture หรือ production topology.

## Current Behavior (Defect)

WHEN Node เริ่มโดยไม่ preload local CA แล้วต่อ `https://localhost:5001`
THEN TLS probe ล้มด้วย `DEPTH_ZERO_SELF_SIGNED_CERT` ก่อน request ถึง backend.

WHEN Node เริ่มพร้อม `scripts/dev-tls-ca.cjs`
THEN local proxy path ปัจจุบันส่ง request ถึง backend และส่งต่อ status, `content-type`, body และ
`X-Correlation-ID` ได้ แต่ repository ยังไม่มี automated test ที่สร้าง Next proxy จริงและตรวจ
response forwarding แบบครบ field.

ยังไม่มีหลักฐานสดที่ล็อกครบทุกข้อดังนี้:

- process restart โหลด proxy configuration ล่าสุด
- authenticated `/control/psp/list` แสดง valid empty state หรือ rows โดยไม่มี error banner
- certificate trust ถูกจำกัดเฉพาะ local `pol-core` target ที่อนุมัติ

Reproduction ที่รันจริง:

```text
ก่อน preload: node-tls-error=DEPTH_ZERO_SELF_SIGNED_CERT
หลัง preload: preloaded-node-tls-status=200
```

## Expected Behavior

- F-1 WHEN Admin proxy ส่ง request ไปยัง project-approved local `pol-core` HTTPS origin
  THE SYSTEM SHALL ต่อ TLS ได้โดยไม่สร้าง proxy-generated `500`.
- F-2 WHEN backend ตอบผ่าน Admin proxy THE SYSTEM SHALL ส่งต่อ HTTP status, `content-type`, body
  และ `X-Correlation-ID` โดยไม่แก้ response contract.
- F-3 WHEN Next process restart หลัง `ADMIN_API_ORIGIN` หรือ CA configuration เปลี่ยน
  THE SYSTEM SHALL โหลดค่าใหม่ตอน process start และใช้กับ request ถัดไป.
- F-4 WHEN authenticated Admin เปิด `/control/psp/list` และ list endpoints ตอบตาม contract
  THE SYSTEM SHALL แสดง valid rows หรือ empty state โดยไม่มี error banner จาก proxy TLS.
- F-5 WHERE local HTTPS trust จำเป็น THE SYSTEM SHALL trust เฉพาะ development certificate material
  ที่ project อนุมัติสำหรับ local `pol-core` target และ SHALL ไม่ปิด TLS verification แบบ global.
- F-6 THE SYSTEM SHALL มี integration test หรือ runnable probe ที่ตรวจ response forwarding จาก
  Next proxy จริงอย่างน้อย `/api/v1/merchants`, `/api/v1/approvals` และ
  `/api/v1/payments/psp-connections`.

## Unchanged Behavior

- B-1 WHEN browser เรียก Admin API THE SYSTEM SHALL CONTINUE TO ใช้ relative same-origin API path.
- B-2 WHEN browser ส่ง Admin API request THE SYSTEM SHALL CONTINUE TO ส่ง session cookie ด้วย
  `credentials: "include"`.
- B-3 WHEN Admin session ใช้งานอยู่ THE SYSTEM SHALL CONTINUE TO ไม่อ่าน session token ด้วย
  JavaScript.
- B-4 WHEN mutation ถูกส่ง THE SYSTEM SHALL CONTINUE TO แนบ `X-CSRF-Token`, `Idempotency-Key` และ
  `If-Match` ตาม endpoint contract.
- B-5 WHEN backend คืน `401`, `403`, `404`, `409`, network failure หรือ `500` THE SYSTEM SHALL
  CONTINUE TO แสดงสถานะตาม contract พร้อม retry เมื่อปลอดภัย.
- B-6 WHEN upstream หรือ backend ล้มเหลว THE SYSTEM SHALL CONTINUE TO ไม่สร้าง mock data,
  fallback success หรือ persisted row ปลอม.
- B-7 WHEN production start ไม่มี `ADMIN_API_ORIGIN` THE SYSTEM SHALL CONTINUE TO ใช้ production
  reverse-proxy same-origin topology.
- B-8 THE SYSTEM SHALL CONTINUE TO รองรับ rewrites `/admin/*`, `/producer/*` และ `/api/*` ตาม
  destination contract เดิม.
- B-9 THE SYSTEM SHALL CONTINUE TO ไม่ใช้ `NODE_TLS_REJECT_UNAUTHORIZED=0`, ไม่เพิ่ม endpoint alias
  และไม่เพิ่ม dependency.
- B-10 THE SYSTEM SHALL CONTINUE TO ไม่แก้ `pol-core`, PSP adapter, vault, database schema,
  routing rules หรือ PSP UI behavior.
- B-11 THE SYSTEM SHALL CONTINUE TO ไม่เปิดเผย secret, cookie, token หรือ sensitive PSP value ใน
  DOM, URL, browser storage, test output หรือ log.
- B-12 THE SYSTEM SHALL CONTINUE TO ไม่แตะ `.env.local`, production data, real PSP mutation และ
  dirty Organization API work.

## Hard Scope

แก้ได้เฉพาะ proxy startup/configuration, local TLS helper, integration evidence, tests และเอกสาร
bugfix ใน `pol-admin`.

ห้ามแก้ `pol-core`, API contract, auth architecture, production reverse proxy, PSP implementation,
`.env.local` และ dirty files ที่ไม่เกี่ยวกับ proxy evidence.
