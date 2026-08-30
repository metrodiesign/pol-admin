# Tasks: PSP UI Parity

> Status: approved 2026-08-30 (quick, no gates)

- [x] 1. List parity — toolbar inline, จำนวนต่อหน้า, DataTable ทุก viewport, คอลัมน์ action ไอคอน, ลบ spine/cards (REQ-1.1–1.6, 4.1–4.3)
  - Satisfies: REQ-1.1-1.6, REQ-4.1-4.3
  Evidence: `npx vitest run src/app/control/psp src/components/control/psp` = PASS (12) FAIL (0); test ใหม่ `PSP list mirrors merchant user list toolbar and drops mobile cards` ยืนยันมี `จำนวนต่อหน้า`, `lg:grid-cols-3`, ไม่มี `mmd:hidden`/`status-spine`; `npx eslint src/components/control/psp src/app/control/psp` = No issues; viewports: n/a — browser evidence ติด Microsoft SSO (ดู Known failures)
- [x] 2. Read parity — EditPageHeader actions, card เดียวแบบ role read, footer actions, ลบ ConnectionHeader (REQ-2.1–2.5, 4.4)
  - Satisfies: REQ-2.1-2.5, REQ-4.4
  Evidence: `src/components/control/psp/detail-view.test.ts` 2 tests ผ่าน (ยกเลิก/แก้ไข อยู่ก่อน `rounded-card`, ปุ่มทดสอบอยู่ใน card, ไม่มี `<aside`/"Payment operator control room", ซ่อนแก้ไขเมื่อไม่มี merchant.manage); `connection-header.tsx` ถูกลบ; `npm run typecheck` exit 0; viewports: n/a — browser evidence ติด SSO
- [x] 3. Create/Edit parity — header actions class ต้นแบบ, form card, identity band แทน ConnectionHeader (REQ-3.1–3.4)
  - Satisfies: REQ-3.1-3.4
  Evidence: `npm run typecheck` exit 0; `npx eslint src/components/control/psp` = No issues; `grep -rn "ConnectionHeader" src` ว่าง; dirty guard/ConfirmDialog/intent/CredentialChangeDialog ไม่ถูกแตะ (diff เฉพาะ header/card JSX); viewports: n/a — browser evidence ติด SSO
- [x] 4. Verify — test เพิ่ม, typecheck, lint, test, บันทึก superseded ใน psp-connections/design.md (REQ-4.3)
  - Satisfies: REQ-4.3
  Evidence: `npx vitest run` = PASS (334) FAIL (0); `npm run typecheck` exit 0; `npm run lint` = 1 error pre-existing ใน `src/components/auth/auth-guard.test.ts` (react/no-children-prop, ไฟล์ untracked ของงานอื่น ไม่แตะ); `node --test scripts/lib/workspace-verification.test.mjs` fail 2 เคส pre-existing (ดู Known failures); `psp-connections/design.md` บรรทัด Layout มี note superseded

## Environment constraints

- หน้า `/control/psp/*` ต้อง auth ผ่าน Microsoft SSO จริง ไม่มี mock bypass — chrome-devtools MCP เปิด `https://localhost:3001/control/psp/list` แล้ว redirect ไป `login.microsoftonline.com` จึงถ่าย screenshot 375/768/1440 ไม่ได้ใน session นี้
- dev server ค้างบน port 3001 ทำให้ proxy probe ใน `workspace-verification.test.mjs` fail; หยุด server แล้ว `npm test` เขียว (2026-08-31)
- test `cleanup closes detached descendant after leader exits` fail เฉพาะใน Bash sandbox ของ Claude (signal ถูกจำกัด) ผ่านเมื่อรันนอก sandbox/CI

## Known failures (ไม่เกี่ยวกับงานนี้)

- `npm test` เต็มชุดนอก sandbox หลังหยุด dev server: node --test 31/31, vitest 334/334, workspaces 26/26 (exit 0)
- `npm run lint`: `src/components/auth/auth-guard.test.ts` react/no-children-prop — ไฟล์ untracked จากงาน bugfix-psp-rbac-contract

## Gap ที่ตั้งใจไม่ปิด

| Gap | เหตุผล |
|---|---|
| checkbox เลือกแถวในตาราง | ไม่มี bulk action ใน PSP; merchant ก็ปิด `showSelectionAction` |
| ปุ่มแก้ไขในแถวตาราง | gate ต่อแถวต้องใช้ approval state + ETag; เข้าจากหน้า read |
| badge สถานะยังเป็น `ControlStatusBadge` | tone ร่วมของ control plane ทุก screen; ไม่เปลี่ยนเป็น pill ของ merchant |
| `ControlListToolbar` prop `className` (diff ค้างก่อนงานนี้) | PSP เลิกใช้ component นี้แล้ว; ปล่อย diff เดิมของ user ไว้ไม่ revert |
