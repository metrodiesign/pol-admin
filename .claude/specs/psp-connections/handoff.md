# Handoff Note: PSP Connections

## Task Summary

ดำเนิน `spec-implement all` สำหรับ spec `psp-connections`; Task 1-8 เสร็จแล้ว.

## Current Status

Task 1-8 complete. Userอนุมัติขยาย scopeให้แก้ Microsoft identity failures; full backend gateผ่านแล้ว.
เพิ่ม route identity baseline ของ Admin เป็น 114 routes หลัง PSP Create/Edit เพิ่มสอง routeใหม่.
Post-implementation correctness/security reviewไม่เหลือ actionable finding.

## Files Changed

- `../pol-core/src/Modules/Payments/Payments.Application/AdminControlPlane/AdminPaymentsControl.cs` — เพิ่ม synchronous pending field
- `../pol-core/src/Persistence/Persistence.MerchantRuntime/Payments/AdminPaymentsControlStore.cs` — project pending field และ replay credential intent ก่อน stale-version check
- `../pol-core/tests/Hosts.Tests/AdminTask4ContractTests.cs` — assert additive response contract
- `../pol-core/tests/Hosts.Tests/AdminPspCredentialChangeTests.cs` — เพิ่ม projection, replay และ validation regression tests
- `.claude/specs/psp-connections/tasks.md` — บันทึกสถานะ approved ตาม user approval
- `src/types/auth.ts`, `src/lib/api/admin/auth.ts`, auth provider/guard — five-state bootstrapและ backend permission contract
- `src/components/layout/*nav*`, `search-dialog.tsx`, `minimals-layout.tsx` — immutable permission filteringทั้ง sidebar/horizontal/search
- `src/types/control/psp-connection.ts`, `src/lib/control/psp.ts` — approved wire types, validation, status/error/UUID/idempotency helpers
- `src/lib/api/control/psp.ts` — PSP, merchant และ approval HTTP clientพร้อม raw ETag/safe errors
- `src/components/control/psp/psp-route-gate.tsx`, PSP route pages — permission gateและ invalid UUID fail-before-mount
- `scripts/psp-contract-server.mjs` — deterministic browser contract server
- `scripts/lib/workspace-verification.mjs` — อัปเดต exact Admin route identity เป็น 114 routes
- `scripts/lib/workspace-verification.test.mjs` — อัปเดต regression assertion ของ route identity
- targeted tests — domain, auth, navigation และ real loopback HTTP contract
- `src/components/control/psp/resource-hooks.ts` — all-page merchant/approval loadersพร้อม incomplete snapshot detection
- `src/components/control/psp/connections-view.tsx`, `table-columns.tsx` — backend List, race guard, permission/catalog gates, mobile cards/desktop table
- `src/components/form/select-field.tsx`, shared toolbar/status badge — disabled/error/a11y propsและ status icon support
- `src/components/control/psp/detail-view.tsx`, `connection-header.tsx` — real Info resource, status spine, allowlisted config/masked secret และ authoritative actions
- `src/components/control/psp/credential-change-dialog.tsx` — provider-specific write-only dialog shellสำหรับ Task 7
- `src/components/control/psp/resource-hooks.ts`, `src/lib/control/psp.ts` — single-resource loaderและ shared action gate
- `src/components/control/psp/create-view.tsx`, `form-fields.tsx` — complete Create form, shared methods/credential fields, provider reset, dirty guardและ safe idempotency flow
- `src/components/shared/edit-page-header.tsx` — optional page-owned back callbackสำหรับ dirty guard
- `src/components/control/psp/edit-view.tsx` — fail-closed latest-resource Edit, immutable config/no-credential Update, confirmationsและ conflict recovery
- `src/components/control/psp/credential-change-dialog.tsx` — provider-specific write-only dialog, lifecycle resetและ D8-safe unknown-outcome reconciliation
- `src/app/control/psp/read/page.tsx`, `detail-view.tsx` — optimistic pending markerจาก pristine Editและ authoritative marker cleanup
- `src/lib/mock/mock-contract.test.ts` — ลบ PSP mock references
- `src/lib/mock/control/psp-connections.ts`, `src/components/control/psp/stat-cards.tsx` — ลบ mock-era paths

## Important Decisions

- Replay ยังเกิดหลัง access, resource และ intent validation; key เดิมกับ payload ต่างกันคืน `idempotency_key_reused`.
- `HasPendingCredentialChange` คำนวณจาก `PendingApprovalId is not null`; ไม่เปิดเผย approval ID.
- Microsoft identity root causesแก้ที่ shared ProblemDetails trace normalizationและ test-only static OIDC metadata fixture.
- PSP API clientไม่สร้าง service abstraction; functionต่อ operationตาม approved design.
- Error parserไม่รับ `detail`; idempotency helperไม่ hashหรือ persist sensitive payload.
- Async resource hooksไม่ยอมให้ aborted requestเขียนทับ retryใหม่; resource routeใช้ keyแยก intentต่อ connection.
- `operation_in_progress` ของ Testคง idempotency keyและ disable repeatจนเริ่ม page lifecycleใหม่.

## Constraints

- รักษา concurrent dirty work ใน `../pol-core`; ห้าม revert.
- Browser verificationใช้ deterministic contract backend; ยังไม่ได้ยิง live PSP credentialหรือ human OIDC session.

## Tests Run

- `dotnet test tests/Hosts.Tests/Hosts.Tests.csproj --filter "FullyQualifiedName~AdminPspCredentialChangeTests|FullyQualifiedName~AdminTask4ContractTests.Psp_response_contract" --no-restore` -> ผ่าน 4/4
- `dotnet test tests/Hosts.Tests/Hosts.Tests.csproj --no-build --no-restore --filter "FullyQualifiedName~Hosts.Tests.AdminMicrosoftIdentityEndpointTests"` -> ผ่าน 20/20
- `dotnet test ../pol-core/tests/Hosts.Tests/Hosts.Tests.csproj` -> ผ่าน 637/637
- `npm run typecheck` -> ผ่าน root และ workspaces
- Task 2 targeted Vitest -> ผ่าน 63/63
- `node --check scripts/psp-contract-server.mjs` -> exit 0
- Task 3 production build -> exit 0
- Task 3 browser `happy`, `catalog-partial`, `approval-unavailable` ที่ 375/768/1440 -> ผ่าน; consoleสะอาด
- PSP domain + HTTP integration Vitestหลัง Task 4 -> ผ่าน 45/45
- Task 4 production build -> exit 0
- Task 4 browser `happy`, `approval-lag`, `missing-etag`, `test-failed` ที่ 375/768/1440 -> ผ่าน; consoleสะอาด
- Task 5 `npm run typecheck`, `npm run lint`, production build -> ผ่าน
- Task 5 browser `happy`, `validation-failed`, `duplicate` ที่ 375/768/1440 -> ผ่าน; consoleสะอาด
- Task 6 production build -> exit 0
- Task 6 browser `happy`, `approval-lag`, `missing-etag`, `conflict` ที่ 375/768/1440 -> ผ่าน; consoleสะอาด
- PSP domain + HTTP integration Vitestหลัง Task 7 -> ผ่าน 47/47
- Task 7 production build -> exit 0
- Task 7 browser `happy`, `approval-lag`, `credential-conflict`, `unknown-outcome` ที่ 375/768/1440 -> ผ่าน; consoleสะอาด
- Task 8 `npm run typecheck`, `npm run lint`, `npm test` -> ผ่าน; frontend testsรวม 303/303
- Task 8 focused PSP integration -> ผ่าน 16/16; production build -> ผ่าน 115 routes
- Task 8 backend full suite -> ผ่าน 637/637 รวม Microsoft identity regressions
- Task 8 spec trace -> ผ่าน 209/209; full-tree secret scanและ diff checks -> ผ่าน
- `npm run verify:workspaces` จาก clean production build -> ผ่าน Admin 114 routes, 676 code files, 741 active-reference files
- `node --test scripts/lib/workspace-verification.test.mjs` -> ผ่าน 20/20
- `node scripts/verify-smoke-signals.mjs` บน clean build port 3301 -> ผ่าน SIGINT 130 และ SIGTERM 143 พร้อมปล่อย port
- `npm run smoke:routes` บน clean build port 3301 -> ผ่าน 307/200/404
- Task 8 final production browser smoke List/Create/Info/Edit ที่ 375/768/1440 -> ผ่าน 12/12; ไม่มี overflow, console/hydration error หรือ sensitive echo
- Post-review `npm run typecheck`, `npm run lint`, `npm test`, focused PSP 47/47 และ production build 115 routes -> ผ่าน
- Post-review browser `operation-in-progress` ที่ 375/768/1440 และ final 4-page matrix 12/12 -> ผ่าน; consoleสะอาด

## Known Issues

none

## Next Recommended Agent

`ship-pr` เมื่อ userสั่งให้ commit/push/open PR.

## Next Steps

1. แยก commit scopeระหว่าง `pol-admin` กับ PSP/Microsoft identity changesใน `pol-core` โดยรักษา concurrent user work.
2. เปิด PRหลัง userอนุมัติการ ship.
