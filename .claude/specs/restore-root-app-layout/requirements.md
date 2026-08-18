# Requirements: Restore Root App Layout

> Status: approved 2026-08-17, amended 2026-08-17

## Overview

ปรับ `pol-admin` ซึ่งเป็น canonical repository ของ POL Admin frontend ให้ Next.js application
กลับมาอยู่ repository root หลัง Merchant frontend แยกไป `pol-merchant` แล้ว โดยลด outer workspace
ที่ไม่จำเป็น แต่คง Admin behavior, shared packages, security floor และ recovery evidence เดิม

## Pinned Inputs

| Input | Value |
|---|---|
| Baseline commit | `79644df1bfa4b9ad9149fdeecedc63cbafda76d6` |
| Current app root | `apps/admin` |
| Target app root | repository root |
| Tracked Admin paths | `748` |
| Tracked source paths | `660` |
| Tracked public paths | `81` |
| Normalized Admin routes | `112` |
| Route SHA-256 | `6011454515d15a40e39e171ef87e748f92a63a0f0a995ff43c3c16455d387216` |
| Node.js | `22.19.0` |
| Node.js engine | `>=20.9.0` |
| npm | `11.12.1` |
| Admin port | `3001` |
| Previous cleanup handoff | `.claude/specs/remove-merchant-workspace/handoff.md` |
| Active spec | `.claude/specs/restore-root-app-layout` (excluded from preservation fingerprint) |
| Composite migration baseline | Pinned commit plus accepted `remove-merchant-workspace` candidate |
| Recoverable Trash root | `/Users/king_developer/.Trash` |
| Move journal | `.claude/specs/restore-root-app-layout/migration-journal.json` |

## Scope

| Action | Paths or responsibility |
|---|---|
| Move | Admin source, public assets, app config และ opaque certificates จาก `apps/admin` ไป root |
| Adapt | root manifest/lockfile, scripts, verifier, CI, Docker และ current documentation |
| Preserve | Admin routes/behavior, internal domain namespaces, `packages/ui`, `packages/shared` |
| Remove | outer `apps/admin`, `apps` directory, package `@pol/admin` และ Admin script aliases |
| Exclude | sibling `pol-merchant`, backend, database, external deployment, historical specs และ retrospectives |

## REQ-1: Root Application Layout

**User Story:** ในฐานะ POL Admin developer ฉันต้องการให้ application อยู่ repository root
เพื่อให้โครงสร้างสะท้อนว่ามี deployable application เดียวโดยไม่เสีย shared package boundaries

**Design Source:** Architecture Overview > Context and Boundary, Target Layout, Components and
Responsibilities; Technology Decisions > Root Application with Package Workspaces

**Acceptance Criteria (EARS):**

- 1.1 THE SYSTEM SHALL make root package `pol-admin` the direct Next.js application (ubiquitous)
- 1.2 THE SYSTEM SHALL locate Admin application source at root `src` (ubiquitous)
- 1.3 THE SYSTEM SHALL locate Admin public assets at root `public` (ubiquitous)
- 1.4 THE SYSTEM SHALL locate the exact app-owned configuration set at root: `.env.example`,
  `components.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `vitest.config.ts` (ubiquitous)
- 1.5 THE SYSTEM SHALL retain `packages/ui` as workspace package `@pol/ui` (ubiquitous)
- 1.6 THE SYSTEM SHALL retain `packages/shared` as workspace package `@pol/shared` (ubiquitous)
- 1.7 THE SYSTEM SHALL NOT retain a filesystem entry at `apps/admin` (ubiquitous)
- 1.8 THE SYSTEM SHALL NOT retain an `apps` directory after migration (ubiquitous)
- 1.9 THE SYSTEM SHALL NOT retain package identity `@pol/admin` (ubiquitous)
- 1.10 THE SYSTEM SHALL preserve the exact Admin namespace set `src/app/admin`,
  `src/components/admin`, `src/lib/api/admin`, `src/lib/mock/admin`, `src/types/admin` (ubiquitous)
- 1.11 IF any unapproved filesystem entry exists at a root filesystem-rename destination THEN THE
  SYSTEM SHALL stop before moving its source path (error handling)

## REQ-2: Source and Behavior Preservation

**User Story:** ในฐานะพนักงานภายในที่ใช้ POL Admin ฉันต้องการให้ repository relocation
ไม่เปลี่ยนฟังก์ชันหรือหน้าจอ เพื่อให้งาน payment operations ดำเนินต่อเหมือนเดิม

**Design Source:** Architecture Overview > Migration Mapping, Source preservation allowlist;
Technology Decisions > Reverse the Proven Split Boundary, Preserve Domain Namespaces;
Non-Functional Considerations > Correctness, Compatibility, Accessibility and Visual Stability

### Rewrite Contract

| State | Source | Destination |
|---|---|---|
| `ADMIN_API_ORIGIN` has a non-empty value | `/admin/:path*` | `${ADMIN_API_ORIGIN}/api/v1/admins/:path*` |
| `ADMIN_API_ORIGIN` has a non-empty value | `/producer/:path*` | `${ADMIN_API_ORIGIN}/api/v1/merchants/:path*` |
| `ADMIN_API_ORIGIN` has a non-empty value | `/api/:path*` | `${ADMIN_API_ORIGIN}/api/:path*` |
| `ADMIN_API_ORIGIN` is absent or empty | none | none |

**Acceptance Criteria (EARS):**

- 2.1 WHEN tracked application source moves THE SYSTEM SHALL relocate all `660` source paths from
  `apps/admin/src` to root `src` (event-driven)
- 2.2 THE SYSTEM SHALL limit tracked source-content changes to the shared-style path in
  `src/app/globals.css` (ubiquitous)
- 2.3 THE SYSTEM SHALL preserve Git blobs for the other `659` tracked source paths (ubiquitous)
- 2.4 THE SYSTEM SHALL set the Tailwind shared-source path in `src/app/globals.css` to
  `../../packages/ui/src` (ubiquitous)
- 2.5 WHEN public assets move THE SYSTEM SHALL relocate all `81` tracked paths to root `public`
  (event-driven)
- 2.6 THE SYSTEM SHALL preserve Git blobs for all `81` tracked public paths (ubiquitous)
- 2.7 THE SYSTEM SHALL preserve Git blobs for the exact file set `.env.example`, `components.json`,
  `postcss.config.mjs`, `vitest.config.ts` (ubiquitous)
- 2.8 THE SYSTEM SHALL limit `next.config.ts` changes to root-path-dependent configuration
  (ubiquitous)
- 2.9 THE SYSTEM SHALL make `tsconfig.json` match the approved root TypeScript boundary contract
  (ubiquitous)
- 2.10 THE SYSTEM SHALL preserve Git-tracked content below `packages/ui` (ubiquitous)
- 2.11 THE SYSTEM SHALL preserve Git-tracked content below `packages/shared` (ubiquitous)
- 2.12 THE SYSTEM SHALL preserve the exact normalized Admin route set of `112` routes with Pinned
  Inputs SHA-256 (ubiquitous)
- 2.13 WHEN `ADMIN_API_ORIGIN` has a non-empty value THE SYSTEM SHALL return the exact three-rule
  mapping in the Rewrite Contract (event-driven)
- 2.14 THE SYSTEM SHALL preserve the `/admin/*` URL contract (ubiquitous)
- 2.15 THE SYSTEM SHALL preserve internal Admin domain namespaces (ubiquitous)
- 2.16 THE SYSTEM SHALL preserve the exact Merchant-management namespace set `src/app/merchant`,
  `src/components/merchant`, `src/lib/api/merchant`, `src/lib/merchant`, `src/lib/mock/merchant`, `src/types/merchant` (ubiquitous)
- 2.17 THE SYSTEM SHALL preserve the Admin authentication/session/navigation contract
  (ubiquitous)
- 2.18 THE SYSTEM SHALL preserve the backend API contract (ubiquitous)
- 2.19 THE SYSTEM SHALL NOT create a database migration (ubiquitous)
- 2.20 THE SYSTEM SHALL NOT introduce an intentional visual change (ubiquitous)
- 2.21 IF a preserved Git blob differs outside the allowlist THEN THE SYSTEM SHALL fail acceptance
  with the changed path (error handling)
- 2.22 IF normalized routes differ from Pinned Inputs THEN THE SYSTEM SHALL fail acceptance with
  a route-delta report containing separate `missing`/`extra` collections (error handling)
- 2.23 WHEN `ADMIN_API_ORIGIN` is absent or empty THE SYSTEM SHALL return an empty rewrite set
  (event-driven)
- 2.24 THE SYSTEM SHALL calculate Route SHA-256 from UTF-8 bytes of
  `JSON.stringify(normalizePageRoutes(manifest))` (ubiquitous)

## REQ-3: Root Package and Tooling Contract

**User Story:** ในฐานะ POL Admin developer ฉันต้องการใช้ root commands โดยตรง
เพื่อไม่ต้องผ่าน script หรือ package identity ของ application workspace ที่ไม่มีแล้ว

**Design Source:** Data Models & Interfaces > Root Package Contract, Root Script Contract,
TypeScript and Test Boundaries; Architecture Overview > Dependency Direction;
Technology Decisions > Native Moves and npm Lock Regeneration, No Compatibility Aliases

### Lockfile Delta Contract

| `packages` record | Approved change |
|---|---|
| `packages[""]` | Update dependency/workspace metadata required by the merged root app |
| `packages["apps/admin"]` | Remove record |
| `packages["node_modules/@pol/admin"]` | Remove record |
| Every other retained record | Deep-equal to baseline at every key |

**Acceptance Criteria (EARS):**

- 3.1 THE SYSTEM SHALL set the root package name to `pol-admin` (ubiquitous)
- 3.2 THE SYSTEM SHALL keep the root package private (ubiquitous)
- 3.3 THE SYSTEM SHALL declare the exact workspace set `packages/ui`, `packages/shared`
  (ubiquitous)
- 3.4 THE SYSTEM SHALL declare package manager `npm@11.12.1` (ubiquitous)
- 3.5 THE SYSTEM SHALL preserve Node.js engine constraint `>=20.9.0` (ubiquitous)
- 3.6 THE SYSTEM SHALL merge existing Admin runtime dependencies into the root manifest with
  retained versions (ubiquitous)
- 3.7 THE SYSTEM SHALL NOT add a dependency or bump a retained dependency version (ubiquitous)
- 3.8 WHEN the workspace graph changes THE SYSTEM SHALL regenerate `package-lock.json` with npm
  `11.12.1` (event-driven)
- 3.9 WHILE comparing the regenerated lockfile THE SYSTEM SHALL allow only the three-record change
  set in the Lockfile Delta Contract (state-driven)
- 3.10 IF any other retained `packages` record differs at any key THEN THE SYSTEM SHALL fail
  lockfile acceptance with the record path plus changed key (error handling)
- 3.11 WHEN `npm ci` runs THE SYSTEM SHALL resolve the exact local-link set `@pol/ui`, `@pol/shared`
  (event-driven)
- 3.12 WHEN root `dev` runs THE SYSTEM SHALL invoke Next.js development directly with HTTPS port
  `3001` (event-driven)
- 3.13 WHEN root `dev:clean` runs THE SYSTEM SHALL clean only exact root Next.js cache targets before
  invoking root `dev` (event-driven)
- 3.14 WHEN root `build` runs THE SYSTEM SHALL invoke `next build` directly (event-driven)
- 3.15 WHEN root `start` runs THE SYSTEM SHALL invoke `next start` directly with HTTP port `3001`
  (event-driven)
- 3.16 WHEN root `test` runs THE SYSTEM SHALL execute the exact target set repository verifier,
  root application, `packages/shared` (event-driven)
- 3.17 WHEN root `lint` runs THE SYSTEM SHALL execute the exact target set root application,
  `packages/ui`, `packages/shared` where a lint script exists (event-driven)
- 3.18 WHEN root `typecheck` runs THE SYSTEM SHALL execute the exact target set root application,
  `packages/ui`, `packages/shared` (event-driven)
- 3.19 WHEN root `verify:workspaces` runs THE SYSTEM SHALL invoke repository verification directly
  (event-driven)
- 3.20 WHEN root `smoke:routes` runs THE SYSTEM SHALL invoke root production route smoke directly
  (event-driven)
- 3.21 THE SYSTEM SHALL remove the exact script set `dev:admin`, `build:admin`, `start:admin`,
  `test:admin` (ubiquitous)
- 3.22 THE SYSTEM SHALL make root `tsconfig.json` extend `./tsconfig.base.json` (ubiquitous)
- 3.23 THE SYSTEM SHALL use the exact root TypeScript include set defined by the approved design
  (ubiquitous)
- 3.24 THE SYSTEM SHALL NOT compile retained package source through root app compiler options
  (ubiquitous)
- 3.25 THE SYSTEM SHALL preserve root Vitest alias `@` to `./src` (ubiquitous)
- 3.26 THE SYSTEM SHALL preserve root Vitest environment `node` (ubiquitous)
- 3.27 THE SYSTEM SHALL preserve root Vitest include `src/**/*.test.ts` (ubiquitous)

## REQ-4: Next.js, Environment and Sensitive Files

**User Story:** ในฐานะ POL Admin maintainer ฉันต้องการให้ config และ sensitive local files
ย้ายตาม boundary ใหม่โดยไม่เปิดเผยหรือ overwrite ข้อมูล เพื่อรักษา build และ security contracts

**Design Source:** Data Models & Interfaces > Next.js and Styling Contract, Local Environment
Contract; Technology Decisions > Default Next.js Output Tracing; Error Handling Strategy;
Non-Functional Considerations > Security, Build and Cache Behavior

**Acceptance Criteria (EARS):**

- 4.1 THE SYSTEM SHALL resolve source alias `@/*` to root `./src/*` (ubiquitous)
- 4.2 THE SYSTEM SHALL emit root standalone output at `.next/standalone/server.js` (ubiquitous)
- 4.3 THE SYSTEM SHALL transpile the exact retained package set `@pol/ui`, `@pol/shared`
  (ubiquitous)
- 4.4 THE SYSTEM SHALL use Next.js default output tracing from repository root (ubiquitous)
- 4.5 THE SYSTEM SHALL NOT retain the nested `../..` output-tracing override (ubiquitous)
- 4.6 THE SYSTEM SHALL serve static assets from root `public` (ubiquitous)
- 4.7 WHILE migration runs THE SYSTEM SHALL keep root `.env.local` at its existing path
  (state-driven)
- 4.8 THE SYSTEM SHALL NOT allow migration tooling to read any `.env.local` content (ubiquitous)
- 4.9 THE SYSTEM SHALL NOT allow migration tooling to log any `.env.local` content (ubiquitous)
- 4.10 THE SYSTEM SHALL NOT allow migration tooling to copy any `.env.local` content (ubiquitous)
- 4.11 THE SYSTEM SHALL NOT allow migration tooling to overwrite any `.env.local` content
  (ubiquitous)
- 4.12 WHEN the app moves to root THE SYSTEM SHALL treat root `.env.local` as the active local
  Next.js environment file (event-driven)
- 4.13 THE SYSTEM SHALL exclude the exact pattern set `.env`, `.env.*` from Docker context at every
  depth (ubiquitous)
- 4.14 IF `apps/admin/.env.local` exists before migration THEN THE SYSTEM SHALL stop for human
  reconciliation (error handling)
- 4.15 WHEN `apps/admin/certificates` exists THE SYSTEM SHALL move the directory opaquely to root
  `certificates` on the same filesystem device (event-driven)
- 4.16 THE SYSTEM SHALL NOT read certificate content during migration (ubiquitous)
- 4.17 THE SYSTEM SHALL NOT log certificate content during migration (ubiquitous)
- 4.18 IF root `certificates` already exists THEN THE SYSTEM SHALL stop before changing either
  certificate directory (error handling)

## REQ-5: Repository Verification and Runtime Smoke

**User Story:** ในฐานะ reviewer ฉันต้องการให้ verifier เข้าใจ root layout ใหม่
เพื่อให้ stale workspace, route, dependency และ process-cleanup regressions ล้มแบบ deterministic

**Design Source:** Data Models & Interfaces > Verification Roots, Runtime and Container Contract;
Error Handling Strategy; Testing Strategy > Root topology, Import boundaries, Test policy,
Route preservation, Production runtime

### Active Reference Scan Contract

| Scope | Exact contract |
|---|---|
| Root manifests | `package.json`, `package-lock.json` |
| Root config | `.dockerignore`, `.gitignore`, `.env.example`, `components.json`, `eslint.config.mjs`, `next.config.ts`, `opencode.json`, `postcss.config.mjs`, `tsconfig.base.json`, `tsconfig.json`, `vitest.config.ts` |
| Root guidance/runtime | `AGENTS.md`, `CLAUDE.md`, `claude-code-spec-driven-workflow.md`, `README*`, `Dockerfile` |
| Operational trees | `.github/**`, `scripts/**`, `docs/**`, `.ai/shared/**` |
| Import/topology scan | `src/**`, `packages/**` |
| Historical exclusions | `.claude/specs/**`, `retrospectives/**` |
| Negative-fixture exception | Verified fixture/assertion content in `scripts/lib/workspace-verification.test.mjs` only |
| Forbidden active references | `@pol/admin`, `apps/admin`, `@pol/merchant`, `apps/merchant`, `dev:admin`, `build:admin`, `start:admin`, `test:admin` |

**Acceptance Criteria (EARS):**

- 5.1 THE SYSTEM SHALL verify application source from `<repo>/src` (ubiquitous)
- 5.2 THE SYSTEM SHALL verify retained packages from `<repo>/packages` (ubiquitous)
- 5.3 THE SYSTEM SHALL read routes from `<repo>/.next/server/app-paths-manifest.json`
  (ubiquitous)
- 5.4 THE SYSTEM SHALL treat the exact path set `<repo>/apps/admin`, `<repo>/apps/merchant` as
  removed (ubiquitous)
- 5.5 THE SYSTEM SHALL accept the exact local-workspace-link set `@pol/ui`, `@pol/shared`
  (ubiquitous)
- 5.6 THE SYSTEM SHALL reject forbidden active references within the exact included scopes of the
  Active Reference Scan Contract (ubiquitous)
- 5.7 THE SYSTEM SHALL preserve rejection of package-to-application imports (ubiquitous)
- 5.8 WHERE verifier negative fixtures are included THE SYSTEM SHALL allow forbidden strings only
  in verified fixture/assertion content of `scripts/lib/workspace-verification.test.mjs` (optional)
- 5.9 THE SYSTEM SHALL reject committed focused tests (ubiquitous)
- 5.10 THE SYSTEM SHALL reject committed skipped tests (ubiquitous)
- 5.11 IF the root route manifest is missing or invalid THEN THE SYSTEM SHALL fail with its path
  (error handling)
- 5.12 IF a required route is absent THEN THE SYSTEM SHALL fail with the missing route
  (error handling)
- 5.13 WHEN production route smoke starts THE SYSTEM SHALL launch only the managed root server on
  port `3001` (event-driven)
- 5.14 WHEN production route smoke requests `/` THE SYSTEM SHALL observe status `307` or `308` to
  `/dashboard` (event-driven)
- 5.15 WHEN production route smoke requests `/admin/user/list` THE SYSTEM SHALL observe a status
  other than `404` (event-driven)
- 5.16 WHEN production route smoke requests `/register` THE SYSTEM SHALL observe status `404`
  (event-driven)
- 5.17 IF port `3001` has an existing owner before smoke THEN THE SYSTEM SHALL fail without stopping
  that owner (error handling)
- 5.18 WHEN production route smoke finishes THE SYSTEM SHALL stop only its managed child process
  (event-driven)
- 5.19 WHEN production route smoke finishes THE SYSTEM SHALL verify that port `3001` is available
  (event-driven)

## REQ-6: CI and Container Compatibility

**User Story:** ในฐานะ POL operator ฉันต้องการให้ CI และ container ใช้ root application
เพื่อให้ automation และ runtime ไม่อ้าง nested workspace ที่ถูกลบ

**Design Source:** Architecture Overview > Components and Responsibilities; Data Models &
Interfaces > Runtime and Container Contract; Sequence Diagrams > Root Build and Runtime Flow;
Testing Strategy > Docker, Security floor

**Acceptance Criteria (EARS):**

- 6.1 WHEN CI installs dependencies THE SYSTEM SHALL run root `npm ci` (event-driven)
- 6.2 WHEN CI audits production dependencies THE SYSTEM SHALL run
  `npm audit --omit=dev --audit-level=high` (event-driven)
- 6.3 WHEN CI tests THE SYSTEM SHALL run root `npm test` (event-driven)
- 6.4 WHEN CI lints THE SYSTEM SHALL run root `npm run lint` (event-driven)
- 6.5 WHEN CI typechecks THE SYSTEM SHALL run root `npm run typecheck` (event-driven)
- 6.6 WHEN CI builds THE SYSTEM SHALL run root `npm run build` (event-driven)
- 6.7 WHEN CI verifies topology THE SYSTEM SHALL run root `npm run verify:workspaces`
  (event-driven)
- 6.8 WHEN CI verifies process safety THE SYSTEM SHALL run
  `node scripts/verify-smoke-signals.mjs` (event-driven)
- 6.9 WHEN CI runs route smoke THE SYSTEM SHALL run root `npm run smoke:routes` (event-driven)
- 6.10 THE SYSTEM SHALL preserve the exact enforcement-job set: guard regression, full-tree secret
  scan, all-spec trace (ubiquitous)
- 6.11 THE SYSTEM SHALL preserve the exact CI toolchain set Node.js `22.19.0`, npm `11.12.1`
  (ubiquitous)
- 6.12 WHEN Docker dependency stage builds THE SYSTEM SHALL copy the exact manifest set
  `package.json`, `package-lock.json`, `packages/ui/package.json`, `packages/shared/package.json` before `npm ci` (event-driven)
- 6.13 WHEN Docker builder stage builds THE SYSTEM SHALL run root `npm run build` (event-driven)
- 6.14 WHEN Docker runner assembles THE SYSTEM SHALL copy the exact runtime artifact set root
  `public`, `.next/standalone`, `.next/static` (event-driven)
- 6.15 WHEN Docker runner assembles THE SYSTEM SHALL assign runtime artifacts to user `nextjs`
  (event-driven)
- 6.16 WHEN the Admin container starts THE SYSTEM SHALL run `node server.js` (event-driven)
- 6.17 WHEN the Admin container starts THE SYSTEM SHALL run as user `nextjs` (event-driven)
- 6.18 WHEN the Admin container starts THE SYSTEM SHALL use UID `1001` (event-driven)
- 6.19 WHEN the Admin container starts THE SYSTEM SHALL listen on port `3001` (event-driven)
- 6.20 WHEN container healthcheck probes `/` THE SYSTEM SHALL pass only for an HTTP status below
  `500` (event-driven)
- 6.21 THE SYSTEM SHALL leave production TLS termination to the reverse proxy (ubiquitous)

## REQ-7: Current Documentation and Scope Boundaries

**User Story:** ในฐานะ POL developer ฉันต้องการให้ current documentation สะท้อน ownership จริง
เพื่อไม่ให้ทีมสร้าง nested Admin workspace หรือ duplicate Merchant source กลับมา

**Design Source:** Architecture Overview > Context and Boundary, Components and Responsibilities;
Technology Decisions > Preserve Domain Namespaces, No Compatibility Aliases;
Non-Functional Considerations > Maintainability, Scope Exclusions

**Acceptance Criteria (EARS):**

- 7.1 THE SYSTEM SHALL describe `pol-admin` as canonical repository for Admin frontend
  application code (ubiquitous)
- 7.2 THE SYSTEM SHALL describe `pol-merchant` as canonical repository for Merchant frontend
  application code (ubiquitous)
- 7.3 THE SYSTEM SHALL link current documentation to
  `https://github.com/metrodiesign/pol-merchant.git` (ubiquitous)
- 7.4 THE SYSTEM SHALL document root application layout with retained package workspaces
  (ubiquitous)
- 7.5 THE SYSTEM SHALL document the direct root command contract (ubiquitous)
- 7.6 THE SYSTEM SHALL document the Admin port `3001` contract (ubiquitous)
- 7.7 THE SYSTEM SHALL remove the exact active-reference set `apps/admin`, `@pol/admin`, Admin
  script aliases from current documentation (ubiquitous)
- 7.8 THE SYSTEM SHALL preserve documentation that distinguishes Merchant-management capability
  inside Admin from Merchant frontend ownership (ubiquitous)
- 7.9 THE SYSTEM SHALL preserve approved historical specs without rewriting their content
  (ubiquitous)
- 7.10 THE SYSTEM SHALL preserve retrospectives as historical records (ubiquitous)
- 7.11 WHILE scanning for stale active references THE SYSTEM SHALL exclude only
  `.claude/specs/**` plus `retrospectives/**` (state-driven)
- 7.12 THE SYSTEM SHALL NOT modify sibling `pol-merchant` (ubiquitous)
- 7.13 THE SYSTEM SHALL NOT modify backend, database, API contract or external deployment
  (ubiquitous)
- 7.14 THE SYSTEM SHALL NOT create source synchronization for repository pair
  `pol-admin`/`pol-merchant` (ubiquitous)

## REQ-8: Safe Migration and Recoverability

**User Story:** ในฐานะ repository maintainer ฉันต้องการให้ relocation กู้คืนได้
เพื่อป้องกันข้อมูลสูญหายหรือ path อื่นถูกลบระหว่างปรับโครงสร้าง

**Design Source:** Sequence Diagrams > Repository Migration and Acceptance; Data Models &
Interfaces > Move Journal Contract; Error Handling Strategy;
Non-Functional Considerations > Recoverability, Build and Cache Behavior

**Acceptance Criteria (EARS):**

- 8.1 THE SYSTEM SHALL use the Composite migration baseline in Pinned Inputs for migration
  preservation checks (ubiquitous)
- 8.2 WHEN migration preflight runs THE SYSTEM SHALL verify the accepted state recorded in
  `.claude/specs/remove-merchant-workspace/handoff.md` before changing Admin paths (event-driven)
- 8.3 WHEN migration preflight runs THE SYSTEM SHALL verify zero tracked drift below the exact tree
  set `apps/admin/src`, `apps/admin/public` (event-driven)
- 8.4 WHEN migration preflight runs THE SYSTEM SHALL verify an empty Git index (event-driven)
- 8.5 WHEN migration preflight runs THE SYSTEM SHALL validate each exact source-to-destination pair
  (event-driven)
- 8.6 WHEN migration preflight runs THE SYSTEM SHALL validate the type of each migration endpoint
  (event-driven)
- 8.7 WHEN migration preflight runs THE SYSTEM SHALL verify each recoverable source-to-destination
  pair uses one filesystem device (event-driven)
- 8.8 WHEN stale root `.next` or `tsconfig.tsbuildinfo` exists THE SYSTEM SHALL move each exact path
  to a unique recoverable Trash destination before building (event-driven)
- 8.9 WHEN ignored generated data remains below `apps/admin` after tracked moves THE SYSTEM SHALL
  move the complete residual directory to a unique recoverable Trash destination (event-driven)
- 8.10 IF a Trash destination already exists THEN THE SYSTEM SHALL select another unique destination
  without overwriting data (error handling)
- 8.11 IF a tracked file remains below `apps/admin` after mapped moves THEN THE SYSTEM SHALL stop
  without moving the residual directory to Trash (error handling)
- 8.12 WHEN Admin residual removal completes THE SYSTEM SHALL enumerate exact direct children of
  `apps` (event-driven)
- 8.13 IF `apps` contains any entry THEN THE SYSTEM SHALL stop without removing `apps`
  (error handling)
- 8.14 WHERE `apps` is empty THE SYSTEM SHALL remove it using empty-directory removal only
  (optional)
- 8.15 THE SYSTEM SHALL NOT allow migration tooling to issue `rm -rf`, `git reset --hard` or
  destination overwrite against migration source, destination or recovery paths (ubiquitous)
- 8.16 IF an individual filesystem rename fails to complete atomically THEN THE SYSTEM SHALL stop
  before starting another migration move (error handling)
- 8.17 THE SYSTEM SHALL preserve rollback to the exact Composite migration baseline through the
  recorded reverse-move journal before commit (ubiquitous)
- 8.18 WHEN migration completes THE SYSTEM SHALL record the exact recovery evidence set source,
  destination, device, inventory, journal (event-driven)
- 8.19 WHEN `npm ci` runs THE SYSTEM SHALL permit npm `11.12.1` to replace generated root
  `node_modules` according to native package-manager behavior (event-driven)
- 8.20 WHEN root `dev:clean` runs THE SYSTEM SHALL permit recursive removal of only root `.next`
  plus root `tsconfig.tsbuildinfo` outside migration-recovery operations (event-driven)
- 8.21 WHEN migration preflight runs THE SYSTEM SHALL record a Composite migration baseline
  fingerprint containing Git status, diff hash, tracked blob hashes plus prior-spec content hashes (event-driven)
- 8.22 WHILE calculating the Composite migration baseline fingerprint THE SYSTEM SHALL include all
  prior-cleanup-owned changes but exclude the Active spec path in Pinned Inputs (state-driven)
- 8.23 WHEN rollback verification runs THE SYSTEM SHALL reproduce the pre-migration Composite
  migration baseline fingerprint exactly (event-driven)
- 8.24 WHEN migration preflight validates the Recoverable Trash root THE SYSTEM SHALL require a
  real directory that is not a symlink/reparse point on the device of every recoverable source (event-driven)
- 8.25 WHEN migration preflight examines root rename destinations plus activation/cache paths THE
  SYSTEM SHALL allow only opaque `.env.local` plus cache paths governed by REQ-8.8 to exist (event-driven)
- 8.26 WHEN an individual rename is prepared THE SYSTEM SHALL record its source-to-destination
  entry durably in the Pinned Inputs Move journal before invoking the rename (event-driven)
- 8.27 IF the first rename failure occurs THEN THE SYSTEM SHALL stop migration before another move
  (error handling)
- 8.28 IF the first rename failure occurs THEN THE SYSTEM SHALL reverse every completed move
  introduced by this spec using the move journal (error handling)
- 8.29 WHEN an individual rename succeeds THE SYSTEM SHALL mark its journal entry completed before
  starting another migration move (event-driven)

## REQ-9: Integrated Acceptance and Handoff

**User Story:** ในฐานะ reviewer ฉันต้องการ reproducible acceptance evidence
เพื่อพิสูจน์ว่า relocation รักษาพฤติกรรมและยังไม่เปลี่ยน Git หรือ external state เกิน scope

**Design Source:** Testing Strategy; Non-Functional Considerations > Correctness, Security,
Accessibility and Visual Stability; Architecture Overview > Context and Boundary

**Acceptance Criteria (EARS):**

- 9.1 WHEN integrated acceptance runs THE SYSTEM SHALL use the exact toolchain set Node.js
  `22.19.0`, npm `11.12.1` (event-driven)
- 9.2 WHEN integrated acceptance runs THE SYSTEM SHALL complete `npm ci` successfully
  (event-driven)
- 9.3 WHEN integrated acceptance runs THE SYSTEM SHALL report zero high-or-higher production
  dependency vulnerabilities (event-driven)
- 9.4 WHEN integrated acceptance runs THE SYSTEM SHALL complete root tests successfully
  (event-driven)
- 9.5 WHEN integrated acceptance runs THE SYSTEM SHALL complete root lint with zero errors
  (event-driven)
- 9.6 WHEN integrated acceptance runs THE SYSTEM SHALL complete root typecheck successfully
  (event-driven)
- 9.7 WHEN integrated acceptance runs THE SYSTEM SHALL complete root build successfully
  (event-driven)
- 9.8 WHEN integrated acceptance runs THE SYSTEM SHALL complete workspace verification successfully
  (event-driven)
- 9.9 WHEN integrated acceptance runs THE SYSTEM SHALL complete signal-safety verification
  successfully (event-driven)
- 9.10 WHEN integrated acceptance runs THE SYSTEM SHALL complete production route smoke successfully
  (event-driven)
- 9.11 WHEN integrated acceptance runs THE SYSTEM SHALL complete Admin container build successfully
  (event-driven)
- 9.12 WHEN integrated acceptance runs THE SYSTEM SHALL complete Admin container runtime
  verification successfully (event-driven)
- 9.13 WHEN browser acceptance runs THE SYSTEM SHALL compare nested baseline with root candidate
  using one browser/tool across routes `/dashboard`, `/admin/user/list` at widths `375`, `768`, `1440` (event-driven)
- 9.14 WHEN browser acceptance compares root candidate with nested baseline THE SYSTEM SHALL report
  zero additional missing static asset requests (event-driven)
- 9.15 WHEN browser acceptance compares root candidate with nested baseline THE SYSTEM SHALL report
  zero additional error-level console messages (event-driven)
- 9.16 WHEN browser acceptance compares root candidate with nested baseline THE SYSTEM SHALL report
  no increase in horizontal overflow (event-driven)
- 9.17 WHEN integrated acceptance runs THE SYSTEM SHALL complete full-tree secret scan successfully
  (event-driven)
- 9.18 WHEN integrated acceptance runs THE SYSTEM SHALL complete guard regression suites
  successfully (event-driven)
- 9.19 WHEN integrated acceptance runs THE SYSTEM SHALL complete all-spec trace successfully
  (event-driven)
- 9.20 WHEN integrated acceptance scans active references THE SYSTEM SHALL apply the exact scopes,
  exclusions, exception plus forbidden set in the Active Reference Scan Contract (event-driven)
- 9.21 IF any install, audit, test, lint, typecheck, build, verification, smoke, container, browser,
  secret or trace gate fails THEN THE SYSTEM SHALL block completion (error handling)
- 9.22 WHEN integrated acceptance passes THE SYSTEM SHALL leave the Git index empty (event-driven)
- 9.23 WHEN integrated acceptance passes THE SYSTEM SHALL leave HEAD at the Pinned Inputs baseline
  commit (event-driven)
- 9.24 THE SYSTEM SHALL NOT perform any external Git action in the exact set commit, push, pull
  request creation during this spec (ubiquitous)
- 9.25 WHEN a task completes THE SYSTEM SHALL record exact command-result pairs in task Evidence
  (event-driven)
- 9.26 WHEN implementation handoff is written THE SYSTEM SHALL record the exact handoff evidence set
  changed files, recovery references, constraints, deviations (event-driven)
- 9.27 WHEN route or browser parity evidence is captured THE SYSTEM SHALL execute nested baseline
  plus root candidate from tracked-only snapshots that exclude every `.env.local` file (event-driven)
- 9.28 WHEN working-tree build or smoke runs THE SYSTEM SHALL allow Next.js to activate root
  `.env.local` according to platform behavior (event-driven)
- 9.29 WHEN evidence records root `.env.local` activation THE SYSTEM SHALL report only its path
  without file content (event-driven)

## Edge Cases & Open Questions

### Analysis Anchor

| Anchor | Value |
|---|---|
| Repository HEAD | `79644df1bfa4b9ad9149fdeecedc63cbafda76d6` |
| Requirements commit | untracked; no file-specific commit exists |
| Audit date | `2026-08-17` |

### Analysis Findings

| ID | Type | Requirements | Approved resolution |
|---|---|---|---|
| A1 | Logical inconsistency | REQ-2.10, REQ-3.16 | Remove `packages/ui` from test targets; keep its lint/typecheck gates |
| A2 | Logical inconsistency | REQ-4.8, REQ-4.12, REQ-9.7–9.10 | Limit no-read rule to tooling; use env-free parity plus active-env working-tree gates |
| A3 | Conflicting constraints | REQ-3.13, REQ-8.15, REQ-9.2 | Narrow destructive ban; permit native `npm ci` plus exact generated-cache cleanup |
| A4 | Unstated assumption | REQ-8.1, REQ-8.2, REQ-8.17, REQ-9.23 | Pin composite baseline from HEAD plus accepted prior cleanup; fingerprint it |
| A5 | Gap | REQ-1.11, REQ-8.5–8.18 | Pin Trash root; validate type/device; journal every per-path atomic rename |
| A6 | Ambiguity | REQ-2.13 | Specify conditional three-rule rewrite map plus empty-state result |
| A7 | Ambiguity | REQ-3.9, REQ-3.10 | Define exact three-record lockfile delta; deep-compare every retained record |
| A8 | Ambiguity | REQ-5.6, REQ-5.8, REQ-7.11, REQ-9.20 | Define exact operational/import scan scopes, exclusions plus fixture exception |
| A9 | Gap | REQ-2.20, REQ-9.13–9.16 | Compare identical routes/viewports/tool; require zero candidate regressions |
| A10 | Unstated assumption | REQ-2.12, REQ-9.7 | Pin route-hash serialization; remove unstable build page-entry count |

### Confirmed Edge Cases

| Case | Resolution | Design Source |
|---|---|---|
| Root `.env.local` already exists | Keep opaque; env-free snapshots provide parity; working tree activates it | Local Environment Contract |
| `apps/admin/.env.local` appears | Stop for human reconciliation; never inspect either secret-bearing file | Local Environment Contract |
| Root cache predates migration | Move exact cache paths to unique same-device Trash locations before build | Error Handling Strategy |
| Certificate destination collides | Stop; never merge private-key directories | Error Handling Strategy |
| `apps` has an unexpected child | Stop and report entry; remove directory only when empty | Error Handling Strategy |
| Baseline source or route hash drifts | Stop and amend upstream design/requirements before implementation | Testing Strategy |
| Historical stale paths remain | Accept only inside exact exclusions or verified negative fixtures | Scope Exclusions |
| Individual rename fails | Stop at first failure; reverse completed new-spec moves from journal | Error Handling Strategy |

ไม่มี open question ค้าง. ทุก finding ใช้คำแนะนำที่ผู้ใช้อนุมัติแล้ว
