# Requirements: Remove Merchant Workspace

> Status: approved 2026-08-17, amended 2026-08-17

## Overview

เปลี่ยน `pol-admin` ให้เป็น repository ของ Admin frontend เพียง application เดียว หลังย้าย
Merchant ownership ไป `pol-merchant` แล้ว งานนี้ลบ duplicate workspace `apps/merchant`, ปรับ
root orchestration และ operating documentation โดยคง Admin behavior, shared packages,
enforcement floor และ historical audit trail เดิม

## Pinned Inputs

| Input | Value |
|---|---|
| Repository | `https://github.com/metrodiesign/pol-admin.git` |
| Baseline commit | `79644df1bfa4b9ad9149fdeecedc63cbafda76d6` |
| Removal target | `apps/merchant` |
| Expected tracked files | `749` |
| Recoverable Trash root | `/Users/king_developer/.Trash` |
| Canonical Merchant repository | `https://github.com/metrodiesign/pol-merchant.git` |
| Canonical Merchant local path | `/Users/king_developer/Desktop/Project/pol-merchant` |
| Merchant reset evidence | `.claude/specs/merchant-workspace-reset/handoff.md` ใน canonical Merchant repository |

## Scope

| Action | Paths or responsibility |
|---|---|
| Remove | `apps/merchant/**` รวม tracked files และ ignored generated artifacts |
| Adapt | root manifest/lockfile, CI, Docker, workspace verification, route smoke และ current docs |
| Preserve | `apps/admin/**`, `packages/ui/**`, `packages/shared/**` |
| Preserve | historical specs, retrospectives, Git history, remote และ enforcement implementation |
| Exclude | sibling `pol-merchant`, backend, database, external deployment และ production traffic |

## REQ-1: Controlled and Recoverable Workspace Removal

**User Story:** As a repository maintainer, I want remove duplicate Merchant workspace safely,
so that ownership moves out of `pol-admin` without deleting the wrong path or losing recovery data.

**Acceptance Criteria (EARS):**

- 1.1 THE SYSTEM SHALL use the repository and baseline commit in Pinned Inputs as the removal baseline (ubiquitous)
- 1.2 THE SYSTEM SHALL resolve the removal target to the exact repository path `apps/merchant` (ubiquitous)
- 1.3 THE SYSTEM SHALL verify that the removal target contains exactly `749` Git-tracked files before removal (ubiquitous)
- 1.4 THE SYSTEM SHALL verify that the removal target is a directory and not a symbolic link or reparse point before removal (ubiquitous)
- 1.5 WHEN removal begins THE SYSTEM SHALL move the complete target directory to a unique path below the resolved Recoverable Trash root (event-driven)
- 1.6 WHILE moving the target directory THE SYSTEM SHALL include ignored generated artifacts without reading their content (state-driven)
- 1.7 THE SYSTEM SHALL NOT use irreversible recursive deletion for the removal target (ubiquitous)
- 1.8 WHEN removal completes THE SYSTEM SHALL leave no filesystem entry at `apps/merchant` (event-driven)
- 1.9 WHEN removal completes THE SYSTEM SHALL report all `749` baseline tracked paths below `apps/merchant` as deleted in the unstaged working-tree candidate diff (event-driven)
- 1.10 WHEN removal completes THE SYSTEM SHALL record the baseline commit and recovery location in handoff evidence (event-driven)
- 1.11 IF the repository, baseline, resolved path, directory type or tracked-file count differs from Pinned Inputs THEN THE SYSTEM SHALL stop before moving the target (error handling)
- 1.12 IF the target working tree contains an uncommitted tracked change before removal THEN THE SYSTEM SHALL stop and report its path (error handling)
- 1.13 IF the repository has an uncommitted change outside the active spec before removal THEN THE SYSTEM SHALL stop and report its path (error handling)
- 1.14 IF a Trash destination already exists THEN THE SYSTEM SHALL choose a different unique destination without overwriting existing data (error handling)
- 1.15 THE SYSTEM SHALL verify that the removal target and Recoverable Trash root are on the same filesystem device before moving the target (ubiquitous)
- 1.16 WHEN removal completes THE SYSTEM SHALL verify every baseline tracked path and Git blob at the Trash destination without reading ignored-file content (event-driven)
- 1.17 IF the move does not complete atomically THEN THE SYSTEM SHALL stop before editing another repository file and report source and destination state (error handling)
- 1.18 THE SYSTEM SHALL NOT stage cleanup changes (ubiquitous)

## REQ-2: Admin-Only Workspace Topology

**User Story:** As a POL Admin developer, I want root workspace ownership to list only retained code,
so that install and tooling cannot discover a removed Merchant application accidentally.

**Acceptance Criteria (EARS):**

- 2.1 THE SYSTEM SHALL declare `apps/admin` as the only application workspace (ubiquitous)
- 2.2 THE SYSTEM SHALL declare `packages/ui` as a retained package workspace (ubiquitous)
- 2.3 THE SYSTEM SHALL declare `packages/shared` as a retained package workspace (ubiquitous)
- 2.4 THE SYSTEM SHALL use explicit workspace paths instead of `apps/*` or `packages/*` wildcards (ubiquitous)
- 2.5 THE SYSTEM SHALL NOT declare package `@pol/merchant` in the root workspace graph (ubiquitous)
- 2.6 THE SYSTEM SHALL remove `apps/merchant` from `package-lock.json` (ubiquitous)
- 2.7 THE SYSTEM SHALL remove `node_modules/@pol/merchant` from `package-lock.json` (ubiquitous)
- 2.8 WHEN `npm ci` runs at repository root THE SYSTEM SHALL install exactly `@pol/admin`, `@pol/ui` and `@pol/shared` as local workspaces (event-driven)
- 2.9 THE SYSTEM SHALL preserve the existing dependency direction from `@pol/admin` to local shared packages (ubiquitous)
- 2.10 THE SYSTEM SHALL preserve the prohibition on package-to-application imports (ubiquitous)
- 2.11 THE SYSTEM SHALL NOT add a dependency while removing the Merchant workspace (ubiquitous)
- 2.12 IF the lockfile still resolves a Merchant workspace after regeneration THEN THE SYSTEM SHALL fail workspace verification (error handling)
- 2.13 WHEN the workspace graph changes THE SYSTEM SHALL regenerate `package-lock.json` with npm `11.12.1` (event-driven)
- 2.14 WHILE comparing the regenerated lockfile to the baseline THE SYSTEM SHALL allow only workspace-topology changes and removal of dependency entries unreachable from retained workspaces (state-driven)
- 2.15 IF a retained dependency version, resolved source or integrity value changes THEN THE SYSTEM SHALL fail lockfile acceptance with the changed key (error handling)

## REQ-3: Admin-Only Command and Runtime Contract

**User Story:** As a POL Admin developer, I want root commands to represent the remaining application,
so that no documented or executable command targets deleted Merchant code.

**Acceptance Criteria (EARS):**

- 3.1 THE SYSTEM SHALL remove root script `dev:merchant` (ubiquitous)
- 3.2 THE SYSTEM SHALL remove root script `build:merchant` (ubiquitous)
- 3.3 THE SYSTEM SHALL remove root script `start:merchant` (ubiquitous)
- 3.4 THE SYSTEM SHALL remove root script `test:merchant` (ubiquitous)
- 3.5 THE SYSTEM SHALL preserve root script `dev` as a delegation to Admin development (ubiquitous)
- 3.6 THE SYSTEM SHALL preserve root script `build` as a delegation to Admin build (ubiquitous)
- 3.7 THE SYSTEM SHALL preserve root script `start` as a delegation to Admin production start (ubiquitous)
- 3.8 THE SYSTEM SHALL preserve explicit Admin scripts for development, build, start and test (ubiquitous)
- 3.9 WHEN the root test command runs THE SYSTEM SHALL execute verifier tests and tests from all retained workspaces (event-driven)
- 3.10 WHEN the root lint command runs THE SYSTEM SHALL inspect all retained workspaces with a lint script (event-driven)
- 3.11 WHEN the root typecheck command runs THE SYSTEM SHALL inspect all retained workspaces with a typecheck script (event-driven)
- 3.12 WHEN Admin development starts THE SYSTEM SHALL preserve HTTPS port `3001` behavior (event-driven)
- 3.13 WHEN Admin production starts THE SYSTEM SHALL preserve HTTP port `3001` behavior (event-driven)
- 3.14 THE SYSTEM SHALL NOT reserve or probe port `3002` for a local Merchant runtime (ubiquitous)

## REQ-4: Admin-Only Verification and Route Smoke

**User Story:** As a maintainer, I want existing verification value retained after removing parity logic,
so that Admin route, dependency, test-policy and process-cleanup regressions still fail deterministically.

**Acceptance Criteria (EARS):**

- 4.1 WHEN workspace verification runs THE SYSTEM SHALL read the built Admin route manifest (event-driven)
- 4.2 THE SYSTEM SHALL verify that Admin retains `/`, `/admin/user/list`, `/checkout/[sessionId]`, `/dashboard` and `/minimals/subpaths/[...segments]` (ubiquitous)
- 4.3 THE SYSTEM SHALL verify that Admin does not expose `/register` (ubiquitous)
- 4.4 THE SYSTEM SHALL remove Admin-to-Merchant route-parity verification (ubiquitous)
- 4.5 THE SYSTEM SHALL scan code from Admin and retained package workspaces for dependency-boundary violations (ubiquitous)
- 4.6 THE SYSTEM SHALL reject an import of `@pol/merchant` or its subpaths from retained workspace code (ubiquitous)
- 4.7 THE SYSTEM SHALL reject a relative or absolute import targeting removed `apps/merchant` source (ubiquitous)
- 4.8 THE SYSTEM SHALL preserve rejection of package-to-Admin imports (ubiquitous)
- 4.9 THE SYSTEM SHALL preserve detection of committed focused or skipped tests (ubiquitous)
- 4.10 WHEN production route smoke runs THE SYSTEM SHALL start only the managed Admin server at port `3001` (event-driven)
- 4.11 WHEN production route smoke requests Admin `/` THE SYSTEM SHALL observe redirect status `307` or `308` to `/dashboard` (event-driven)
- 4.12 WHEN production route smoke requests Admin `/admin/user/list` THE SYSTEM SHALL observe a status other than `404` (event-driven)
- 4.13 WHEN production route smoke requests Admin `/register` THE SYSTEM SHALL observe status `404` (event-driven)
- 4.14 WHEN production route smoke finishes THE SYSTEM SHALL stop only the managed child process it created (event-driven)
- 4.15 WHEN production route smoke finishes THE SYSTEM SHALL verify that port `3001` is available (event-driven)
- 4.16 IF port `3001` has an existing owner before smoke THEN THE SYSTEM SHALL fail without stopping that owner (error handling)
- 4.17 IF the Admin route manifest is missing or invalid THEN THE SYSTEM SHALL fail with the manifest path (error handling)
- 4.18 IF a required Admin route is missing THEN THE SYSTEM SHALL fail with the missing route (error handling)

## REQ-5: CI and Container Compatibility

**User Story:** As a POL operator, I want CI and container builds to use the Admin-only graph,
so that automation does not fail on a removed package and deployed Admin behavior remains stable.

**Acceptance Criteria (EARS):**

- 5.1 WHEN CI installs dependencies THE SYSTEM SHALL use the Admin-only root lockfile (event-driven)
- 5.2 WHEN CI audits production dependencies THE SYSTEM SHALL run `npm audit --omit=dev --audit-level=high` (event-driven)
- 5.3 WHEN CI tests the repository THE SYSTEM SHALL run the root test command (event-driven)
- 5.4 WHEN CI lints the repository THE SYSTEM SHALL run the root lint command (event-driven)
- 5.5 WHEN CI typechecks the repository THE SYSTEM SHALL run the root typecheck command (event-driven)
- 5.6 WHEN CI builds application code THE SYSTEM SHALL build Admin only (event-driven)
- 5.7 WHEN CI verifies workspaces THE SYSTEM SHALL run Admin-only workspace verification (event-driven)
- 5.8 WHEN CI runs production route smoke THE SYSTEM SHALL run Admin-only smoke (event-driven)
- 5.9 THE SYSTEM SHALL remove the Merchant build step from CI (ubiquitous)
- 5.10 THE SYSTEM SHALL preserve guard regression, secret scan and spec-trace jobs (ubiquitous)
- 5.11 THE SYSTEM SHALL preserve Node.js `22.19.0` and npm `11.12.1` CI pins (ubiquitous)
- 5.12 THE SYSTEM SHALL remove the Merchant package manifest copy from `Dockerfile` (ubiquitous)
- 5.13 WHEN a container image builds THE SYSTEM SHALL install only retained workspaces (event-driven)
- 5.14 WHEN a container image builds THE SYSTEM SHALL build Admin standalone output (event-driven)
- 5.15 WHEN the Admin container runs THE SYSTEM SHALL use the existing non-root user (event-driven)
- 5.16 WHEN the Admin container runs THE SYSTEM SHALL preserve port `3001` (event-driven)
- 5.17 WHEN the Admin container healthcheck runs THE SYSTEM SHALL probe Admin `/` and pass only for an HTTP status below `500` (event-driven)
- 5.18 THE SYSTEM SHALL NOT add a Merchant image, service or deployment definition to `pol-admin` (ubiquitous)

## REQ-6: Canonical Ownership and Current Documentation

**User Story:** As a POL developer, I want current documentation to state repository ownership clearly,
so that future Merchant changes happen in `pol-merchant` and duplicate ownership does not return.

**Acceptance Criteria (EARS):**

- 6.1 THE SYSTEM SHALL describe `pol-admin` as the canonical repository for Admin frontend application code (ubiquitous)
- 6.2 THE SYSTEM SHALL describe `pol-merchant` as the canonical repository for Merchant frontend application code (ubiquitous)
- 6.3 THE SYSTEM SHALL link current documentation to `https://github.com/metrodiesign/pol-merchant.git` (ubiquitous)
- 6.4 THE SYSTEM SHALL document the exact retained workspace topology (ubiquitous)
- 6.5 THE SYSTEM SHALL remove current setup instructions for local Merchant port `3002` (ubiquitous)
- 6.6 THE SYSTEM SHALL remove current setup instructions for Merchant root scripts (ubiquitous)
- 6.7 THE SYSTEM SHALL remove current setup instructions for `apps/merchant/.env.local` (ubiquitous)
- 6.8 THE SYSTEM SHALL remove current deployment guidance for Merchant artifacts in `pol-admin` (ubiquitous)
- 6.9 THE SYSTEM SHALL update `README.md` to describe Admin-only runtime ownership (ubiquitous)
- 6.10 THE SYSTEM SHALL update `docs/dev-setup.md` to describe Admin-only local operation (ubiquitous)
- 6.11 THE SYSTEM SHALL update canonical project context, architecture and Next.js stack guidance (ubiquitous)
- 6.12 THE SYSTEM SHALL preserve historical specs without rewriting their approved requirements, design, tasks or evidence (ubiquitous)
- 6.13 THE SYSTEM SHALL preserve retrospectives as historical records (ubiquitous)
- 6.14 WHILE scanning for stale active references THE SYSTEM SHALL exclude historical specs and retrospectives (state-driven)
- 6.15 THE SYSTEM SHALL NOT create ongoing source synchronization between `pol-admin` and `pol-merchant` (ubiquitous)
- 6.16 THE SYSTEM SHALL preserve current documentation for Merchant-management and producer-domain capabilities inside Admin (ubiquitous)
- 6.17 THE SYSTEM SHALL replace removed local Merchant workspace instructions with a concise pointer to the canonical Merchant repository (ubiquitous)
- 6.18 WHEN cleanup preflight runs THE SYSTEM SHALL read the canonical Merchant reset handoff without modifying the sibling repository (event-driven)
- 6.19 WHEN cleanup preflight runs THE SYSTEM SHALL verify that the local canonical Merchant candidate records exact-mirror and successful local-acceptance evidence for source commit `79644df1bfa4b9ad9149fdeecedc63cbafda76d6` (event-driven)
- 6.20 WHEN cleanup acceptance passes THE SYSTEM SHALL record that the canonical Merchant remote branch and pull request remain pending (event-driven)

## REQ-7: Admin Behavior and Domain Preservation

**User Story:** As an internal POL user, I want Admin behavior unchanged by repository cleanup,
so that removing a duplicate application does not remove Merchant-management capabilities from Admin.

**Acceptance Criteria (EARS):**

- 7.1 THE SYSTEM SHALL preserve Git-tracked content below `apps/admin` byte-for-byte (ubiquitous)
- 7.2 THE SYSTEM SHALL preserve Git-tracked content below `packages/ui` byte-for-byte (ubiquitous)
- 7.3 THE SYSTEM SHALL preserve Git-tracked content below `packages/shared` byte-for-byte (ubiquitous)
- 7.4 THE SYSTEM SHALL preserve Admin route group `/merchant/*` (ubiquitous)
- 7.5 THE SYSTEM SHALL preserve Admin Merchant-management components, APIs, mocks and types (ubiquitous)
- 7.6 THE SYSTEM SHALL preserve Admin auth, session, navigation and API behavior (ubiquitous)
- 7.7 THE SYSTEM SHALL preserve normalized Admin route output across the cleanup (ubiquitous)
- 7.8 THE SYSTEM SHALL preserve the Admin standalone server entry point (ubiquitous)
- 7.9 THE SYSTEM SHALL NOT change backend API schemas or endpoint contracts (ubiquitous)
- 7.10 THE SYSTEM SHALL NOT create a database migration (ubiquitous)
- 7.11 THE SYSTEM SHALL NOT modify the sibling `pol-merchant` repository (ubiquitous)
- 7.12 THE SYSTEM SHALL NOT deploy or modify external runtime infrastructure (ubiquitous)
- 7.13 IF tracked content in a preserved application or package tree differs from the baseline THEN THE SYSTEM SHALL fail cleanup acceptance with the changed path (error handling)
- 7.14 IF normalized Admin routes differ from the baseline THEN THE SYSTEM SHALL fail cleanup acceptance with missing and extra routes reported separately (error handling)
- 7.15 WHEN generating the Admin route baseline THE SYSTEM SHALL build the pinned baseline from a temporary tracked-only Git archive (event-driven)
- 7.16 WHEN generating the Admin route candidate THE SYSTEM SHALL build the cleanup working tree independently from the baseline archive (event-driven)
- 7.17 WHEN both Admin builds complete THE SYSTEM SHALL compare normalized route manifests for exact equality (event-driven)

## REQ-8: Integrated Acceptance and Handoff

**User Story:** As a reviewer, I want reproducible evidence for the destructive cleanup,
so that repository state, preserved behavior and recovery path can be verified before commit.

**Acceptance Criteria (EARS):**

- 8.1 WHEN cleanup acceptance runs THE SYSTEM SHALL complete `npm ci` successfully (event-driven)
- 8.2 WHEN cleanup acceptance runs THE SYSTEM SHALL complete the production dependency audit successfully (event-driven)
- 8.3 WHEN cleanup acceptance runs THE SYSTEM SHALL complete root tests successfully (event-driven)
- 8.4 WHEN cleanup acceptance runs THE SYSTEM SHALL complete root lint successfully with zero errors (event-driven)
- 8.5 WHEN cleanup acceptance runs THE SYSTEM SHALL complete root typecheck successfully (event-driven)
- 8.6 WHEN cleanup acceptance runs THE SYSTEM SHALL complete Admin build successfully (event-driven)
- 8.7 WHEN cleanup acceptance runs THE SYSTEM SHALL complete Admin-only workspace verification successfully (event-driven)
- 8.8 WHEN cleanup acceptance runs THE SYSTEM SHALL complete Admin-only production route smoke successfully (event-driven)
- 8.9 WHEN cleanup acceptance runs THE SYSTEM SHALL complete Admin container build and runtime verification successfully (event-driven)
- 8.10 WHEN cleanup acceptance runs THE SYSTEM SHALL complete the full-tree secret scan successfully (event-driven)
- 8.11 WHEN cleanup acceptance runs THE SYSTEM SHALL complete all guard regression suites successfully (event-driven)
- 8.12 WHEN cleanup acceptance runs THE SYSTEM SHALL find no committed focused or skipped test (event-driven)
- 8.13 WHEN cleanup acceptance runs THE SYSTEM SHALL complete spec trace with every requirement covered (event-driven)
- 8.14 WHEN cleanup acceptance scans operational paths THE SYSTEM SHALL find no active `@pol/merchant`, `apps/merchant` or removed Merchant-script reference in root manifests, root config, CI, Docker, scripts, current docs or canonical shared guidance (event-driven)
- 8.15 WHEN cleanup acceptance passes THE SYSTEM SHALL record exact commands and observed results in task Evidence (event-driven)
- 8.16 WHEN cleanup acceptance passes THE SYSTEM SHALL record files changed, recovery reference, constraints and deviations in a handoff note (event-driven)
- 8.17 IF any install, audit, test, lint, typecheck, build, verification, smoke, container, secret or trace gate fails THEN THE SYSTEM SHALL block completion (error handling)

## Constraints and Non-Goals

- ไม่มี commit, push หรือ pull request ใน scope นี้
- ไม่ stage cleanup changes
- ไม่แก้ backend, database, external deployment หรือ production traffic
- ไม่แก้ source code ของ Admin application หรือ retained packages
- ไม่ลบ Merchant-management domain ภายใน Admin app
- ไม่แก้ historical specs หรือ retrospectives เพื่อทำให้ stale-reference scan ผ่าน

## Edge Cases & Open Questions

### Analysis Anchor

- Repository HEAD: `79644df1bfa4b9ad9149fdeecedc63cbafda76d6`
- Requirements state at audit: untracked, จึงไม่มี file-specific commit จาก `git log`
- Audit date: `2026-08-17`

### Analysis Findings

| Finding | Category | REQ IDs | Approved decision |
|---|---|---|---|
| A1 | Logical inconsistency | REQ-1.8, REQ-1.9 | ไม่ stage; ตรวจ target หายและ baseline paths ทั้ง `749` รายการเป็น working-tree deletions |
| A2 | Logical inconsistency | REQ-6.14, REQ-8.14 | scan เฉพาะ operational paths; exclude active/historical specs และ retrospectives |
| A3 | Ambiguity | REQ-1.5, REQ-1.10, REQ-1.14 | ใช้ unique macOS Trash path บน device เดียว, verify tracked inventory และหยุดทันทีเมื่อ move fail |
| A4 | Ambiguity | REQ-6.5 ถึง REQ-6.11 | ลบเฉพาะ local workspace/runtime guidance; คง Admin Merchant-domain docs และเพิ่ม canonical pointer |
| A5 | Ambiguity | REQ-5.2, REQ-5.17 | pin audit command เดิมและ health contract ที่ status ต่ำกว่า `500` |
| A6 | Gap | REQ-7.7, REQ-7.14 | build pinned baseline จาก temporary Git archive แล้ว compare normalized candidate routes |
| A7 | Gap | REQ-2.6 ถึง REQ-2.12 | regenerate ด้วย npm `11.12.1`; ยอมเฉพาะ topology/unreachable removals และห้าม retained dependency drift |
| A8 | Unstated assumption | REQ-6.2, REQ-7.11 | ใช้ read-only local canonical-candidate gate; บันทึก remote branch/PR pending เป็น risk |

ไม่พบ conflicting constraint เพิ่มเติมหลังใช้ decisions A1–A8

### Confirmed Edge Cases

| Topic | Decision |
|---|---|
| Ignored generated data | ย้ายไป resolved Trash path พร้อม directory ทั้งก้อนโดยไม่อ่าน content |
| Unknown ignored file under target | ย้ายไป Trash แบบ recoverable; ห้าม copy เข้า repository path อื่น |
| Merchant-domain code inside Admin | คงไว้ทั้งหมด เพราะเป็น internal Admin capability ไม่ใช่ Merchant workspace |
| Shared packages | คงเป็น local workspaces ของ Admin |
| Historical references | คงไว้เป็น audit trail และ exclude จาก active-reference scan |
| Canonical Merchant owner | `pol-merchant`; ไม่มี ongoing synchronization |
| Canonical readiness | local candidate evidence เพียงพอสำหรับ cleanup; remote/PR pending ต้องอยู่ใน handoff risk |
| Open questions | ไม่มีหลังผู้ใช้ยืนยัน scope ทั้งหมด |
