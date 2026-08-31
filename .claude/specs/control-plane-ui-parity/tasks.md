# Tasks: Control Plane UI Parity

> Status: approved 2026-08-31 (quick, no gates); badge parity amendment approved 2026-08-31

- [x] 1. Shared kit — styles/toolbar/detail-shell/stat-card/row-action ใต้ `control/shared`, psp re-export (REQ-3.1–3.5)
  Evidence: `src/components/control/shared/{styles,toolbar,detail-shell,stat-card,row-action}.tsx` ใหม่, `psp/styles.ts` re-export; `npx tsc --noEmit` exit 0; `npx eslint src/components/control/shared` No issues; commit `8401672`; viewports: n/a — shared kit
  - Satisfies: REQ-3.1-3.5
- [x] 2. Group การเชื่อมต่อ — routing, api-client, webhook: list/columns/detail/pages (REQ-1.1–1.6, 2.1–2.6)
  Evidence: routing/api-client/webhook list+columns+detail+pages ใช้ ControlToolbar/RowActions/DetailIdentity; `control-parity.test.ts` ผ่าน (list 3 + detail 3 + not-found 3); commit `8401672`; viewports: n/a — SSR markup test แทน (หน้า /control/* ติด Microsoft SSO)
  - Satisfies: REQ-1.1-1.6, REQ-2.1-2.6
- [x] 3. Group การกำกับดูแล — approval, audit, notification (tabs strip) (REQ-1.1–1.7, 2.1–2.6)
  Evidence: approval/audit/notification ปรับ + `notification/tabs.tsx` strip; approve/reject อยู่ใน header (`webhook and approval expose primary actions in the header` ผ่าน); commit `c9db4a4`; viewports: n/a — SSR markup test
  - Satisfies: REQ-1.7, REQ-2.2
- [x] 4. Group การเงิน — reconciliation, reports (StatCard/KPI/chart shell) (REQ-1.1–1.3, 1.6)
  Evidence: reconciliation/reports ใช้ StatCard/`rounded-card` shell; `grep -rn "rounded-2xl bg-card p-6" src/components/control` ว่าง; commit `e43eca2`; viewports: n/a — SSR markup test (reports มี chart ไม่ render ใน SSR test)
  - Satisfies: REQ-1.6
- [x] 5. Group องค์กร + cleanup — tenant, originator, ลบ list-toolbar/status-spine, note ใน control-plane/design.md (REQ-3.6, 4.5)
  Evidence: tenant/originator ปรับ; ลบ `shared/list-toolbar.tsx`, `shared/status-spine.tsx` (`grep -rln "ControlListToolbar\|StatusSpine" src` ว่าง); note superseded ใน `.claude/specs/control-plane/design.md`; commit `3121e47`; viewports: n/a
  - Satisfies: REQ-3.6, REQ-4.5
- [x] 6. Verify — SSR tests ทุก view, typecheck, eslint, npm test, spec-trace (REQ-4.1–4.4)
  Evidence: `npm test` (นอก sandbox, port 3001 ว่าง) exit 0 — node --test 31/31, vitest 360/360 (29 files), workspaces 26/26; `npm run typecheck` exit 0; `npx eslint src/components/control src/app/control` No issues; `scripts/spec-trace.sh control-plane-ui-parity` OK 24/24; `grep -rn "components/merchant" src/components/control` ว่าง; viewports: n/a — Microsoft SSO บล็อก browser evidence (ดู Environment constraints)
  - Satisfies: REQ-4.1-4.4
- [x] 7. Badge parity amendment — ปรับ status และ domain chips เป็น merchant pill geometry โดยคง tone/icon/count semantics (REQ-5.1–5.5)
  Evidence: `controlBadgeClass` ใช้ใน shared status, UI Badge consumers และ raw semantic markers; focused parity 39/39; `npm test` ผ่าน node 31/31, vitest 373/373, shared 26/26; typecheck ผ่าน; eslint No issues; spec-trace 29/29; browser 20 Control routes ที่ 375/768/1440 + notification log tab ไม่มี badge mismatch, legacy marker, default dot, body overflow หรือ console error; PSP icon pills และ compact tab count ยังอยู่
  - Satisfies: REQ-5.1-5.5

## Environment constraints

- หน้า `/control/*` ต้อง auth ผ่าน Microsoft SSO จริง ไม่มี mock bypass — screenshot 375/768/1440 ต้องเปิดใน browser ที่ login แล้ว; ใช้ SSR markup test (`control-parity.test.ts`) แทน
- `npm test` เขียวได้เฉพาะเมื่อ port 3001 ว่าง (proxy probe spawn `next dev` เอง) และรันนอก Bash sandbox (test detached-descendant ต้องส่ง signal ข้าม process group)

## Gap ที่ตั้งใจไม่ปิด

| Gap | เหตุผล |
|---|---|
| pageSize เริ่มต้น 10 (merchant ใช้ 25) | ห้ามเปลี่ยน default ตาม REQ-1.3 |
| revoke ของ api-client อยู่ท้าย card ไม่ใช่ header | destructive action ใช้ variant destructive ไม่ใช่ปุ่มหลัก |
| chart internals ของ reports | อยู่นอก scope (`src/components/charts/**`) |
| utility `status-spine` ใน `globals.css` | ปล่อยไว้ตาม prompt; ไม่มีผู้ใช้ใน src แล้ว |
