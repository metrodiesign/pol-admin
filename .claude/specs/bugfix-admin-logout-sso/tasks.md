# Implementation Tasks: Admin Logout and Microsoft SSO State

> Status: approved 2026-08-22

> Each task is a cohesive, independently verifiable slice. Implement the whole task in one pass.

- [x] 1. Harden Admin logout result handling and Microsoft account selection — treat only `204` as local logout success, expose retryable failure state, and send fixed `prompt=select_account` for Admin Microsoft OIDC.
     Satisfies: F-1, F-2, F-3, F-4, B-1, B-2, B-3, B-4, B-5, B-6, B-7, B-8, B-9, B-10. Verify: frontend auth tests + typecheck/lint; focused `pol-core` Microsoft redirect and logout tests; `scripts/spec-trace.sh bugfix-admin-logout-sso`.
     Evidence: regression tests, gate and browser checks recorded below.
       - test: `rtk proxy npx vitest run src/lib/api/admin/auth.test.ts` -> 29 tests passed; `rtk proxy npm test` -> Node 31 tests, root Vitest 330 tests, shared 26 tests passed; `rtk proxy npm run typecheck` and `rtk proxy npm run lint` -> passed.
       - evidence: existing `pol-core` source/test review confirms Admin Microsoft `prompt=select_account` and logout status/cookie contract; no `pol-core` source or test suite was changed or rerun in this `pol-admin` evidence task.
       - browser: safe `logout-failure` fixture kept `/logout`, rendered `role=alert` failure and retry; Account drawer stayed open with alert and retry action. Safe `logout-success` fixture returned `204` and `/logout` navigated to `/login`.
       - browser: Admin Microsoft authorize request evidence retained `prompt=select_account`, `response_type=code`, `scope=openid email profile`, PKCE, state and nonce.
       - viewports: n/a — interaction-only; no real auth mutation.
       - deviations: browser checks used HTTPS dev runtime and isolated fixture; production browser login round-trip and `pol-core` test suite were not rerun.

## Suggested execution batches

Run task 1 in one session because frontend callers, backend challenge properties, and regression tests share one auth contract.
