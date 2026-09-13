# Handoff Note: PSP route RBAC 403 redirect

> **หมายเหตุ (2026-09-13):** endpoint auth ในเอกสารนี้เป็นของ stack เดิม (`/admin/me`, `/admin/auth/logout`,
> `/api/v1/admins/auth/microsoft/login`, cookie `adm_*`) ตั้งแต่ PR #144 SPA ใช้ employee identity stack แทน:
> login `GET /api/v1/auth/employees/login?returnTo=`, bootstrap `GET /api/v1/me` + `GET /api/v1/me/access`
> (`hasPlatformAccess`, `permissions[]`), logout `POST /api/v1/auth/logout` (204), CSRF cookie `pol_csrf` ส่งเป็น header
> `X-CSRF-Token` ดู `src/lib/api/admin/auth.ts` เป็น contract ปัจจุบัน ข้อความด้านล่างคงไว้เป็นประวัติ

แก้ bugfix task 1 ตาม [bugfix.md](bugfix.md): PSP route ที่ถูก `pol-core` ปฏิเสธสิทธิ์ต้องเปิด `/error/403` เดิม.

## Current Status

done — task 1 ถูก mark `[x]` พร้อม Evidence.

## Files Changed

- `src/components/control/psp/psp-route-gate.tsx` — redirect เมื่อ authenticated permission ไม่มี `settings.manage`.
- `src/components/control/psp/connections-view.tsx` — redirect เมื่อ PSP List API คืน `403`.
- `src/components/control/psp/psp-route-gate.test.ts` — regression tests ของ permission predicate.
- `src/lib/api/control/psp.integration.test.ts` — regression test ของ PSP List `403` signal.
- `.claude/specs/bugfix-psp-rbac-403/bugfix.md` — approved requirements and scope.
- `.claude/specs/bugfix-psp-rbac-403/tasks.md` — task 1 completed with Evidence.

## Important Decisions

- ใช้ `router.replace("/error/403")` ด้วย path คงที่ ไม่มี user-controlled redirect.
- ไม่แก้ `pol-core`, endpoint authorization หรือ existing 403 page.
- `GET /admin/me` account-level `403` ยังใช้ `AuthGuard` 403 inline เพื่อป้องกัน redirect loop เพราะ `/error/403` อยู่ใต้ `MinimalsLayout` เดียวกัน; ไม่อยู่ใน PSP route scope นี้.

## Constraints

- รักษา dirty changes เดิมของ auth/logout และ TLS/PSP worktree.
- ห้ามเพิ่ม dependency หรือ push/commit โดยไม่มี review.

## Tests Run

- `npx vitest run src/components/control/psp/psp-route-gate.test.ts src/lib/api/control/psp.integration.test.ts` -> 2 files, 23 passed.
- `npm test` -> workspace verification 22 passed, root 23 files/269 passed, shared 26 passed.
- `npm run typecheck` -> passed.
- `npm run lint` -> passed.
- `npm run build` -> production build passed.
- `.ai/bin/gate-task.sh bugfix-psp-rbac-403` -> passed.
- Production browser -> `/control/psp/list` redirected to `/error/403`, existing `403` content visible.
- Security review -> approve for PSP diff; no access-control bypass or open redirect found.

## Known Issues

- Account-level auth bootstrap `403` URL redirect remains a separate loop-sensitive concern; current inline 403 is safe and unchanged.

## Next Recommended Agent

human review

## Next Steps

1. Review PSP route diff and handoff.
2. If account-level `/admin/me` `403` must also change URL, create a separate scoped bugfix for the AuthGuard/error-layout loop.
