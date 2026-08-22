# Implementation Tasks: Admin Logout and Microsoft SSO State

> Status: approved 2026-08-22

> Each task is a cohesive, independently verifiable slice. Implement the whole task in one pass.

- [x] 1. Harden Admin logout result handling and Microsoft account selection — treat only `204` as local logout success, expose retryable failure state, and send fixed `prompt=select_account` for Admin Microsoft OIDC.
     Satisfies: F-1, F-2, F-3, F-4, B-1, B-2, B-3, B-4, B-5, B-6, B-7, B-8, B-9, B-10. Verify: frontend auth tests + typecheck/lint; focused `pol-core` Microsoft redirect and logout tests; `scripts/spec-trace.sh bugfix-admin-logout-sso`.
     Evidence: regression tests, gate and browser checks recorded below.
       - test: `npx vitest run src/lib/api/admin/auth.test.ts` -> 27 passed; `npm test` -> 22 Node tests, 262 root Vitest tests, 26 shared tests passed; `npm run typecheck` and `npm run lint` -> passed.
       - test: `dotnet test tests/Hosts.Tests/Hosts.Tests.csproj --filter FullyQualifiedName~MicrosoftAuthLoginRedirectTests` -> 5 passed; full Hosts suite -> 634 passed, 0 failed.
       - browser: production `http://localhost:3101/logout` with proxy TLS failure (`500`) stayed on `/logout` and rendered `role=alert` failure plus retry; live Microsoft authorize request contained `prompt=select_account`, `response_type=code`, `scope=openid email profile`, PKCE, state and nonce.
       - viewports: 375/768/1440 not available in connected in-app browser; production check observed `clientWidth=1068`, `innerWidth=1068`.
       - deviations: external Chrome viewport emulation unavailable; no federated logout added per approved scope.

## Suggested execution batches

Run task 1 in one session because frontend callers, backend challenge properties, and regression tests share one auth contract.
