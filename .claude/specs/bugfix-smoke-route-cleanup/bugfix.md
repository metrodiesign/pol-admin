# Bugfix: Bound Smoke Route Cleanup

> Status: approved 2026-08-17

> Scope reconciliation: current smoke contract is superseded by `.claude/specs/bugfix-smoke-cleanup-hardening/bugfix.md` and is Admin-only on port `3001`.

แก้ CI smoke command ที่ตรวจ route ครบแล้วแต่ค้างระหว่างปิด child processes. ขอบเขตครอบ
process lifecycle, regression tests และ CI timeout โดยไม่เปลี่ยน application behavior.

## Current Behavior (Defect)

WHEN `npm run smoke:routes` ตรวจ route ทั้งห้ารายการสำเร็จและเข้าสู่ cleanup THEN
`stopServer()` สามารถพลาด child `exit` event หลังส่ง `SIGKILL` ทำให้ cleanup promise ไม่ settle
และ GitHub Actions step คงสถานะ `in_progress` โดยไม่มี hard deadline.

### Reproduction

1. เปิด GitHub Actions run `32021752530`, job `95362707377` ของ PR `#120`.
2. ตรวจ log ว่ามีผล `307`, `307`, `200`, `404`, `200` ครบก่อน step ค้าง.
3. รันคำสั่งต่อไปนี้เพื่ออ่านสถานะ job จริง.

```bash
unset GH_TOKEN
gh api repos/metrodiesign/pol-admin/actions/jobs/95362707377 \
  --jq '{status,conclusion,started_at,completed_at,active_step:(.steps[]|select(.status=="in_progress")|.name)}'
```

ผลที่วัดเมื่อ `2026-08-17T11:34:32Z`: step `Smoke production routes` ยัง `in_progress`
หลังเริ่มเมื่อ `2026-08-17T10:48:51Z`, รวมอย่างน้อย 45 นาที 41 วินาที.

### Root Cause Evidence

- **Confirmed**: `scripts/smoke-workspace-routes.mjs:57` สร้าง `exited` promise ก่อน `SIGTERM`
  ถูกต้อง.
- **Confirmed**: `scripts/smoke-workspace-routes.mjs:61-62` ส่ง `SIGKILL` แล้วจึงสร้าง
  `once(child, "exit")`
  ตัวใหม่; child อาจ emit ก่อน listener ถูกติด ทำให้ promise รอ event ที่ผ่านไปแล้ว.
- **Confirmed**: force-stop path ไม่มี deadline หลัง `SIGKILL`; `stopServers()` จึงรอได้ไม่จำกัด.
- **Inference**: GitHub hosted runner มี owned descendant หรือ pipe ค้างหลัง race เพราะ job ยัง
  `in_progress`; hosted runner ไม่เปิด process table ให้ตรวจหลังเกิดเหตุ.
- **Confirmed**: CI step ไม่มี `timeout-minutes`, จึงไม่มี step-level backstop เมื่อ script ไม่ exit.

Linux minimal reproduction ด้วย Node `22.19.0` และ npm `11.12.1` เกิด
`Warning: Detected unsettled top-level await` ตรง force-stop `once()`. Full smoke บน generic Linux
ผ่านหนึ่งรอบ จึงยืนยันว่าปัญหาเป็น timing-dependent race ไม่ใช่ build workload ช้า.

## Scope Reconciliation

- Current smoke command เริ่มและตรวจเฉพาะ Admin server ที่ port `3001`.
- รายการ Merchant routes และ port `3002` ในเอกสารฉบับนี้เป็น historical evidence จาก architecture ก่อน
  split และไม่ใช่ current acceptance.
- งาน hardening ปัจจุบันของ IPv6 preflight และ detached descendant อยู่ใน
  `.claude/specs/bugfix-smoke-cleanup-hardening/`.

## Expected Behavior

- F-1  WHEN route probes ทั้งหมดสำเร็จ THE SYSTEM SHALL ปิด owned Admin/Merchant servers และให้
  `npm run smoke:routes` exit code `0` ภายใน 10 วินาทีหลัง probe สุดท้าย.
- F-2  IF owned server process tree ไม่ปิดภายใน 5 วินาทีหลัง `SIGTERM` THEN THE SYSTEM SHALL ส่ง
  force-stop ไปยัง owned process tree และ settle cleanup ภายในอีก 2 วินาที.
- F-3  IF cleanup ยืนยันการปิด owned process tree ไม่ได้ภายใน deadline THEN THE SYSTEM SHALL exit
  non-zero พร้อม diagnostic ที่ระบุ server, PID และ shutdown phase แทนการรอไม่จำกัด.
- F-4  WHEN smoke command สิ้นสุดทั้ง success หรือ failure THE SYSTEM SHALL ปล่อย ports `3001` และ
  `3002` ให้ process ถัดไป bind ได้.
- F-5  WHEN smoke command สิ้นสุด THE SYSTEM SHALL ไม่เหลือ descendant process ที่ command สร้าง.
- F-6  WHEN GitHub Actions รัน `Smoke production routes` THE SYSTEM SHALL จำกัด step execution
  ไม่เกิน 2 นาที.

## Unchanged Behavior

- B-1  WHEN Admin `/` ถูก probe THE SYSTEM SHALL CONTINUE TO ตอบ `307` หรือ `308` และ redirect ไป
  `/dashboard`.
- B-2  WHEN Merchant `/` ถูก probe THE SYSTEM SHALL CONTINUE TO ตอบ `307` หรือ `308` และ redirect
  ไป `/dashboard`.
- B-3  WHEN Merchant `/admin/user/list` ถูก probe THE SYSTEM SHALL CONTINUE TO ตอบสถานะที่ไม่ใช่
  `404`.
- B-4  WHEN Admin `/register` ถูก probe THE SYSTEM SHALL CONTINUE TO ตอบ `404`.
- B-5  WHEN Merchant `/register` ถูก probe THE SYSTEM SHALL CONTINUE TO ตอบสถานะที่ไม่ใช่ `404`.
- B-6  WHEN port เป้าหมายมี unrelated owner THE SYSTEM SHALL CONTINUE TO fail ก่อน start และไม่ส่ง
  signal ไปยัง unrelated owner.
- B-7  IF Admin หรือ Merchant start/probe ไม่สำเร็จภายใน timeout THEN THE SYSTEM SHALL CONTINUE TO
  exit non-zero พร้อม recent child output.
- B-8  WHEN smoke command รับ `SIGINT` หรือ `SIGTERM` THE SYSTEM SHALL CONTINUE TO cleanup owned
  processes และ exit ด้วย code `130` หรือ `143` ตาม signal.

## Hard Scope

แก้ได้เฉพาะ process lifecycle ภายใต้ `scripts/`, regression tests, CI smoke timeout และ artifact
ของ bugfix นี้.

ห้ามแก้:

- `apps/**` และ `packages/**`
- Route, auth, API, navigation, rewrites และ port contract
- `package.json`, `package-lock.json` และ dependency versions
- `Dockerfile` และ production image behavior
- PR `#121` และ `.ai/shared/TASK_PROTOCOL.md`
