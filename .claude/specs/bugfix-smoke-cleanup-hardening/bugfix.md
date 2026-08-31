# Bugfix: Smoke Cleanup Hardening

> Status: approved 2026-08-27

กำหนดขอบเขตแก้ปัญหา smoke ของ Admin ที่ตรวจพอร์ตไม่ครบ address family และ cleanup ไม่ครอบคลุม
process descendant ที่แยก process group โดยคง topology แบบ Admin-only และไม่แตะ application behavior.

## Current Behavior (Defect)

WHEN `npm run smoke:routes` ตรวจพอร์ต `3001` ก่อน start โดยมี process ฟังที่ IPv6 wildcard `:::3001`
THEN `assertPortAvailable()` ตรวจเฉพาะ `127.0.0.1:3001`, รายงานว่าพอร์ตว่าง และให้ Next start ต่อจนล้มด้วย
`EADDRINUSE` ที่ `scripts/lib/workspace-verification.mjs:94-108`.

Reproduction ที่รันจริง:

```bash
npm run smoke:routes
```

ผลที่สังเกตได้:

```text
Error: listen EADDRINUSE: address already in use :::3001
```

WHEN managed leader ปิดแล้ว descendant ใช้ `detached: true` และสร้าง process group ใหม่
THEN `stopManagedServer()` ส่ง signal ไปเฉพาะ process group เดิมและรายงาน cleanup เสร็จ ทั้งที่ descendant
ยังทำงานอยู่.

Reproduction fixture ให้ผล:

```text
leaderClosed=true descendantPid=46991 aliveBeforeCleanup=true
aliveAfterCleanup=true
```

กรณี descendant อยู่ process group เดียวกันให้ `aliveAfterCleanup=false` จึงแยกได้ว่า defect อยู่ที่
การติดตาม process group เดียว ไม่ใช่ timing ของ `SIGTERM` หรือ `SIGKILL`.

## Expected Behavior

- F-1 WHEN smoke ตรวจ target port ที่มี owner อยู่บน IPv4 หรือ IPv6 THE SYSTEM SHALL รายงาน port conflict
  ก่อน spawn server และ SHALL ไม่ส่ง signal ไปยัง unrelated owner.
- F-2 WHEN smoke cleanup ทำงาน THE SYSTEM SHALL ปิด process tree ที่ smoke สร้าง รวม descendant ที่
  แยก process group ภายใน shutdown deadline ที่กำหนด.
- F-3 IF process tree ยังไม่ปิดภายใน deadline THEN THE SYSTEM SHALL exit non-zero พร้อม server identity,
  PID และ shutdown phase โดยไม่รอไม่จำกัด.
- F-4 WHEN smoke จบทั้ง success และ failure THE SYSTEM SHALL ไม่เหลือ process หรือ listener ที่ smoke
  สร้างไว้บน Admin port `3001`.
- F-5 WHEN smoke ตรวจ route THE SYSTEM SHALL ตรวจเฉพาะ Admin root และ Admin route contract ตามรายการ
  ปัจจุบัน และ SHALL ไม่ start หรือ probe Merchant app หรือ port `3002`.
- F-6 WHEN regression test สร้าง detached descendant จริง THE SYSTEM SHALL ยืนยัน descendant ไม่รอดหลัง
  cleanup และผลทดสอบต้องแยกจากกรณี descendant ที่อยู่ process group เดียวกันได้.

## Unchanged Behavior

- B-1 WHEN Admin `/` ถูก probe THE SYSTEM SHALL CONTINUE TO ตรวจ redirect status และปลายทาง
  `/dashboard` ตาม contract เดิม.
- B-2 WHEN Admin `/register` ถูก probe THE SYSTEM SHALL CONTINUE TO คาดหวัง `404`.
- B-3 WHEN smoke รับ `SIGINT` หรือ `SIGTERM` THE SYSTEM SHALL CONTINUE TO cleanup owned processes และ
  exit ด้วย code `130` หรือ `143` ตาม signal.
- B-4 WHEN Admin start หรือ probe ไม่สำเร็จ THE SYSTEM SHALL CONTINUE TO exit non-zero พร้อม recent
  child output และ phase ที่ตรวจพบ.
- B-5 WHEN target port มี unrelated owner THE SYSTEM SHALL CONTINUE TO ปล่อย owner เดิมทำงาน.
- B-6 WHEN smoke cleanup สำเร็จ THE SYSTEM SHALL CONTINUE TO ปิด stdio และ process handle ที่ smoke
  เป็นเจ้าของ.
- B-7 THE SYSTEM SHALL CONTINUE TO ใช้ Node/npm และ process APIs ที่มีอยู่ โดยไม่เพิ่ม dependency.
- B-8 THE SYSTEM SHALL CONTINUE TO ไม่แก้ route, auth, API, navigation, rewrite, package workspace,
  `package.json`, `package-lock.json`, `Dockerfile` หรือ production image behavior.
- B-9 THE SYSTEM SHALL CONTINUE TO ไม่แก้ `.env.local`, production data, real PSP mutation หรือ
  dirty Organization API work.

## Hard Scope

แก้ได้เฉพาะ process lifecycle ภายใต้ `scripts/`, regression tests, smoke verification และ CI timeout
ที่เกี่ยวกับ Admin-only smoke.

ห้ามแก้ application source, Merchant repository, `pol-core`, route contract, auth contract,
API contract, dependency versions หรือไฟล์ Organization API ที่ dirty อยู่เดิม.
