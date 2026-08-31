# Bugfix: PSP RBAC Contract and Evidence

> Status: approved 2026-08-27

กำหนด contract ของสิทธิ์ PSP ให้แยก account-level no-access ออกจาก route/API denial อย่างชัดเจน
และเติมหลักฐานที่ตรวจ behavior ที่ผู้ใช้เห็นจริง โดยไม่เปลี่ยน authorization source of truth ของ
`pol-core`.

## Current Behavior (Defect)

WHEN `GET /admin/me` ตอบ `200` พร้อม `permissions: []`
THEN `getMe()` คงสถานะ `authed` และ `AuthGuard` แสดง Inline 403 ผ่าน `ErrorCard`.
พฤติกรรมนี้ตรงกับ contract ที่ยืนยันแล้ว แต่ bugfix report เดิมระบุให้ redirect ทุกกรณี จึงเกิด
contract drift ระหว่าง artifact กับ implementation.

WHEN authenticated user ไม่มี `settings.manage` แล้วเปิด `/control/psp/list`
หรือเมื่อ PSP list API ตอบ `403`
THEN source ปัจจุบันมี route/API redirect ไป `/error/403` แต่ test ปัจจุบันยังไม่รัน effect และยังไม่มี
browser evidence ที่ยืนยัน URL, rendered 403 page และการหยุด request ซ้ำ.

Reproduction seams:

- `src/lib/api/admin/auth.test.ts` fixture ที่มี `permissions: []`
- `src/components/control/psp/psp-route-gate.tsx` เมื่อไม่มี `settings.manage`
- `src/lib/api/control/psp.integration.test.ts` เมื่อ list API คืน `403`
- production browser ที่เปิด `/control/psp/list` ด้วย session และ backend denial

## Expected Behavior

- F-1 WHEN `GET /admin/me` ตอบ `200` พร้อม `permissions: []` THE SYSTEM SHALL คง URL เดิมและแสดง
  Inline 403 ของ `AuthGuard` โดยไม่ redirect ไป `/error/403`.
- F-2 WHEN authenticated user เปิด `/control/psp/list` โดยไม่มี `settings.manage`
  THE SYSTEM SHALL redirect ไป `/error/403` และ SHALL ไม่ mount `PspConnectionsView`.
- F-3 WHEN `GET /api/v1/payments/psp-connections` ตอบ HTTP `403`
  THE SYSTEM SHALL redirect ไป `/error/403`.
- F-4 AFTER PSP list denial redirect สำเร็จ THE SYSTEM SHALL ไม่ส่ง PSP list request ซ้ำจากหน้าที่ถูก
  ปฏิเสธ.
- F-5 THE SYSTEM SHALL มี regression test ที่ตรวจผลลัพธ์ observable ของทั้ง Inline 403,
  route redirect และ API redirect โดยไม่ยืนยันเพียง implementation detail.
- F-6 THE SYSTEM SHALL ปรับ bugfix artifact และ evidence ให้ระบุว่า account-level `permissions: []`
  ใช้ Inline 403 ส่วน route/API denial ของ PSP list ใช้ `/error/403`.

## Unchanged Behavior

- B-1 WHEN auth bootstrap ตอบ `401` THE SYSTEM SHALL CONTINUE TO redirect ไป `/login`.
- B-2 WHEN auth bootstrap ล้มเหลวด้วย network หรือสถานะอื่นที่ไม่ใช่ `401` THE SYSTEM SHALL CONTINUE
  TO แสดง error state และ action สำหรับ retry.
- B-3 WHEN user มี `settings.manage` และ backend อนุญาต THE SYSTEM SHALL CONTINUE TO แสดง PSP list
  พร้อม pagination และ filter เดิม.
- B-4 WHEN PSP list API ตอบสถานะอื่นที่ไม่ใช่ `403` THE SYSTEM SHALL CONTINUE TO ใช้ loading, error
  และ retry behavior เดิม.
- B-5 WHILE auth bootstrap กำลังโหลดหรือ route gate ยังไม่ผ่าน THE SYSTEM SHALL CONTINUE TO ไม่ mount
  child view และไม่ส่ง PSP API request.
- B-6 THE SYSTEM SHALL CONTINUE TO ใช้ authorization และ merchant-scope checks ของ `pol-core` เป็น
  source of truth.
- B-7 PSP detail และ edit ที่อยู่นอก list scope SHALL CONTINUE TO ใช้ Inline 403 ตาม contract เดิม.
- B-8 THE SYSTEM SHALL CONTINUE TO ใช้หน้า `/error/403` และ `ErrorCard` เดิมโดยไม่แก้ layout,
  message หรือ action ของหน้านั้น.
- B-9 THE SYSTEM SHALL CONTINUE TO ไม่ยิง real PSP mutation, ไม่อ่าน `.env.local` และไม่แก้
  Organization API dirty work.
- B-10 THE SYSTEM SHALL CONTINUE TO ไม่แก้ `pol-core`, endpoint contract, generic auth redirect
  semantics หรือเพิ่ม dependency.

## Hard Scope

แก้ได้เฉพาะ `pol-admin` route gate, PSP list forbidden handling, tests, browser verification และ
bugfix evidence ที่เกี่ยวข้อง.

ห้ามแก้ `pol-core`, `detail-view.tsx`, `edit-view.tsx`, `/error/403`, generic `AuthGuard` semantics
นอกกรณีที่จำเป็นต่อการล็อก `permissions: []` contract, `.env.local`, real PSP mutation และ dirty
Organization API files.
