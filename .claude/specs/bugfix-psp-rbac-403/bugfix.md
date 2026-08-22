# Bugfix: PSP route RBAC 403 redirect

กำหนดพฤติกรรมของ `/control/psp/list` เมื่อ `pol-core` ปฏิเสธสิทธิ์ RBAC ให้เปิดหน้า 403 เดิม
โดยไม่สร้าง permission state เฉพาะหน้าใหม่ และไม่เปลี่ยน authorization ของ backend.

> Status: approved 2026-08-22

## Current Behavior (Defect)

เมื่อผู้ใช้เปิด `/control/psp/list` ด้วยบัญชีที่ไม่มี `settings.manage` หรือเมื่อ PSP list API จาก `pol-core` คืน `403`:

- client gate คง URL เดิมและ render `ErrorCard` ภายในหน้า PSP
- API `403` คง URL เดิมและ renderข้อความ `ไม่มีสิทธิ์ดู PSP Connections` แบบ inline
- ระบบไม่ redirect ไป `/error/403` ซึ่งเป็นหน้า 403 ที่มีอยู่แล้ว

Repro: เปิดหน้าด้วย authenticated session ที่ backend คืน `403` สำหรับ `GET /api/v1/payments/psp-connections`; ตรวจ URL และข้อความที่มองเห็นได้.

Root cause: `src/components/control/psp/psp-route-gate.tsx` และ `src/components/control/psp/connections-view.tsx` จัดการ permission เป็น local state แทนการนำผู้ใช้ไปยัง existing `/error/403` route.

## Expected Behavior

- F-1 WHEN authenticated user เปิด `/control/psp/list` และไม่มี `settings.manage` จาก `pol-core` THE SYSTEM SHALL redirect ไป `/error/403`.
- F-2 WHEN `GET /api/v1/payments/psp-connections` คืน HTTP `403` จาก `pol-core` THE SYSTEM SHALL redirect ไป `/error/403`.
- F-3 AFTER redirect สำเร็จ THE SYSTEM SHALL แสดง existing 403 page พร้อมรหัส `403` และไม่ส่ง PSP list request ซ้ำ.

## Unchanged Behavior

- B-1 WHEN auth bootstrap คืน `401` THE SYSTEM SHALL CONTINUE TO redirect ไป `/login` ไม่ใช่ `/error/403`.
- B-2 WHEN auth bootstrap ล้มเหลวด้วย network หรือสถานะอื่นที่ไม่ใช่ `401`/`403` THE SYSTEM SHALL CONTINUE TO แสดง error state และปุ่มโหลดใหม่.
- B-3 WHEN user มี `settings.manage` และ backend อนุญาต THE SYSTEM SHALL CONTINUE TO render PSP list และใช้ pagination/filter เดิม.
- B-4 WHEN PSP list API คืนสถานะอื่นที่ไม่ใช่ `403` THE SYSTEM SHALL CONTINUE TO ใช้ loading, error และ retry behavior เดิม.
- B-5 WHILE auth bootstrap กำลังโหลด หรือ permission gate ยังไม่ผ่าน THE SYSTEM SHALL CONTINUE TO ไม่ mount `PspConnectionsView` และไม่ส่ง PSP API request.
- B-6 THE SYSTEM SHALL CONTINUE TO ใช้ authorization และ merchant-scope checks ของ `pol-core` เป็น source of truth.
- B-7 THE SYSTEM SHALL CONTINUE TO ใช้หน้า `/error/403` และ `ErrorCard` เดิมโดยไม่แก้ layout, message หรือ action ของหน้านั้น.

## Scope Constraints

- แก้เฉพาะ pol-admin route gate, PSP list forbidden handling และ tests ที่จำเป็น.
- ห้ามแก้ `pol-core`, endpoint contract, generic auth redirect semantics หรือเพิ่ม dependency.
