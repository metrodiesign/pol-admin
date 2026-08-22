# Implementation Tasks: PSP route RBAC 403 redirect

> Status: approved 2026-08-22

> Each task is a cohesive, independently verifiable slice.

- [x] 1. Redirect PSP RBAC denial to existing 403 route — change the route gate and PSP list API 403 handling to navigate to `/error/403`, preserve non-403/auth behavior, and add observable regression coverage.
     Satisfies: F-1, F-2, F-3, B-1, B-2, B-3, B-4, B-5, B-6, B-7. Verify: `npx vitest run` plus `npm run typecheck`, `npm run lint`, and production browser verification of `/control/psp/list` → `/error/403`.
  Evidence:
    - test: `npx vitest run src/components/control/psp/psp-route-gate.test.ts src/lib/api/control/psp.integration.test.ts` -> 2 files, 23 tests passed
    - test: `npm test` -> workspace verification 22 passed, root 23 files/269 tests passed, shared 26 tests passed
    - test: `npm run typecheck` -> passed; `npm run lint` -> passed; `npm run build` -> production build passed
    - viewports: n/a — redirect-only behavior; production browser observed `clientWidth=1068`
    - deviations: none

## Suggested execution batches

Run task 1 in one session. It shares route-gate and list-view behavior, so splitting would add coordination without improving verification.
