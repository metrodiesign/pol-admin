# Requirements: Docker Prod Deploy

> Status: approved 2026-07-13

## Overview

pol-admin (Payment Orchestration Layer admin portal, ดู [PROJECT_CONTEXT.md](../../../.ai/shared/PROJECT_CONTEXT.md))
ยังไม่เคยมี container image มาก่อน — spec นี้ derive จาก `design.md` (approved 2026-07-13)
ทั้งฉบับ เพื่อผลิต production-shaped Docker image ของ **frontend เท่านั้น** สำหรับ deploy ขึ้น
self-hosted/Kubernetes ใน environment staging/UAT (ยังไม่ใช่ prod traffic จริง). reverse proxy
และ backend (`pol-core`, OIDC BFF) เป็นของ repo/ทีมอื่น — นอกสโคปของ requirements ชุดนี้โดยตั้งใจ
(ดู REQ-6).

## REQ-1: Multi-Stage Production Image Build

**User Story:** As an operations engineer, I want a reproducible multi-stage Docker build for the
pol-admin frontend, so that I can produce a minimal, production-ready image without manually
curating files.

**Acceptance Criteria (EARS):**
- 1.1  THE SYSTEM SHALL provide a `Dockerfile` at the repository root.                          (ubiquitous)
- 1.2  THE SYSTEM SHALL implement the `Dockerfile` as three named build stages: `deps`, `builder`, `runner`. (ubiquitous)
- 1.3  THE SYSTEM SHALL install dependencies in the `deps` stage via `npm ci` against the committed `package-lock.json`. (ubiquitous)
- 1.4  THE SYSTEM SHALL build the application in the `builder` stage by running `next build`.    (ubiquitous)
- 1.5  THE SYSTEM SHALL enable `output: "standalone"` in `next.config.ts`.                       (ubiquitous)
- 1.6  THE SYSTEM SHALL copy only `.next/standalone`, `.next/static`, and `public/` into the `runner` stage. (ubiquitous)
- 1.7  THE SYSTEM SHALL NOT copy the full `node_modules` directory or application source tree into the `runner` stage. (ubiquitous)
- 1.8  THE SYSTEM SHALL base every build stage on a Node.js version satisfying >=20.9.0.         (ubiquitous)
- 1.9  THE SYSTEM SHALL base every build stage on a Node.js LTS release line, not a "Current"/non-LTS release. (ubiquitous)
- 1.10 WHEN `docker build .` is run at the repository root THE SYSTEM SHALL produce a runnable image without error. (event-driven)
- 1.11 THE SYSTEM SHALL commit an updated `package-lock.json` reflecting the `sharp` dependency before the `Dockerfile` is expected to build. (ubiquitous)

## REQ-2: Build-Time Environment Variable Safety

**User Story:** As a developer producing a production image, I want build-time environment
variables handled explicitly, so that the resulting image never ships a dev-flavored or broken
bundle.

**Acceptance Criteria (EARS):**
- 2.1  THE SYSTEM SHALL set `NODE_ENV=production` in the `builder` stage before running `next build`. (ubiquitous)
- 2.2  THE SYSTEM SHALL NOT set `NEXT_PUBLIC_SKIP_AUTH` during a production image build.         (ubiquitous)
- 2.3  WHERE a `NEXT_PUBLIC_*` variable is required by a production feature THE SYSTEM SHALL accept it as a build-time `ARG`/`ENV` inside the `builder` stage. (optional)
- 2.4  THE SYSTEM SHALL NOT require `NEXT_PUBLIC_GOOGLE_CLIENT_ID_ADMIN` or `NEXT_PUBLIC_GOOGLE_CLIENT_ID_PRODUCER` to build the image. (ubiquitous)

## REQ-3: Runtime Image Optimization

**User Story:** As an end user viewing pages with remote images, I want the self-hosted container
to optimize `next/image` remote sources, so that pages stay performant without a separate
image-optimization service.

**Acceptance Criteria (EARS):**
- 3.1  THE SYSTEM SHALL include `sharp` as a `dependencies` entry in `package.json`.             (ubiquitous)
- 3.2  THE SYSTEM SHALL leave `next.config.ts` `images.remotePatterns` unchanged by this feature. (ubiquitous)

## REQ-4: Non-Root Runtime & Health Reporting

**User Story:** As a security-conscious operator, I want the container to run as a non-root user
and report its own health, so that it meets baseline container-security expectations and
integrates with orchestrator health checks.

**Acceptance Criteria (EARS):**
- 4.1  THE SYSTEM SHALL create a non-root user in the `runner` stage.                            (ubiquitous)
- 4.2  THE SYSTEM SHALL run the container process as the non-root user, not `root`.              (ubiquitous)
- 4.3  THE SYSTEM SHALL create the `.next` directory and change its ownership to the non-root user BEFORE copying the standalone build output. (ubiquitous)
- 4.4  THE SYSTEM SHALL listen on port `5200`.                                                   (ubiquitous)
- 4.5  THE SYSTEM SHALL bind to host `0.0.0.0`.                                                  (ubiquitous)
- 4.6  THE SYSTEM SHALL define a Docker `HEALTHCHECK` instruction.                               (ubiquitous)
- 4.7  THE SYSTEM SHALL implement the `HEALTHCHECK` using a tool already present in the image, without adding `curl`/`wget`. (ubiquitous)
- 4.8  WHEN the container has been running past its health-check start period AND the HTTP server responds THE SYSTEM SHALL report health status `healthy`. (event-driven)

## REQ-5: Secret & Sensitive-Config Exclusion

**User Story:** As a security reviewer, I want the image build to structurally exclude local
secrets and dev-only config, so that a leaked image can never expose them.

**Acceptance Criteria (EARS):**
- 5.1  THE SYSTEM SHALL provide a `.dockerignore` at the repository root.                        (ubiquitous)
- 5.2  THE SYSTEM SHALL exclude `.env` and all `.env.*` files from the Docker build context via `.dockerignore`. (ubiquitous)
- 5.3  THE SYSTEM SHALL exempt `.env.example` from the `.env.*` exclusion.                        (ubiquitous)
- 5.4  THE SYSTEM SHALL NOT set `ADMIN_API_ORIGIN` at any stage of a production image build.      (ubiquitous)
- 5.5  THE SYSTEM SHALL NOT include `.env`/`.env.local` file contents in the built image.         (ubiquitous)
- 5.6  THE SYSTEM SHALL exclude spec and tooling directories not needed at runtime (`.claude`, `.ai`, `.agents`, `.codex`, `.opencode`, `.git`, `.github`, `.githooks`, `docs`, `retrospectives`, `scripts`) from the Docker build context via `.dockerignore`. (ubiquitous)

## REQ-6: Deployment Scope Boundary

**User Story:** As the team maintaining this repo, I want this Docker feature strictly scoped to
the frontend image, so that it doesn't silently grow into infrastructure this repo doesn't own.

**Acceptance Criteria (EARS):**
- 6.1  THE SYSTEM SHALL NOT include a `docker-compose.yml` as part of this feature.               (ubiquitous)
- 6.2  THE SYSTEM SHALL NOT include a reverse-proxy or backend service definition as part of this feature. (ubiquitous)
- 6.3  THE SYSTEM SHALL NOT modify `.github/workflows/ci.yml` as part of this feature.            (ubiquitous)
- 6.4  THE SYSTEM SHALL NOT reference a push-destination or private container registry host in the `Dockerfile`. (ubiquitous)

## Edge Cases & Open Questions

- Build environment ต้องมี outbound HTTPS ตอน `next build` (`next/font/google` ดาวน์โหลดฟอนต์ที่
  build time) — ถ้า build runner ไม่มีเน็ต build จะ fail เป็นธรรมชาติของ Next.js เอง ไม่ใช่สิ่งที่
  Dockerfile ควบคุมได้ จึงไม่ตั้งเป็น REQ แต่เป็น environment precondition ที่ต้องสื่อสารกับใครก็ตาม
  ที่รัน build
- Deployment network (K8s NetworkPolicy ฯลฯ) ต้อง allowlist egress ไปสามโฮสต์รูป remote (r2.dev,
  api.dicebear.com, api-prod-minimal-v700.pages.dev) เพื่อให้ REQ-3 optimize รูปได้จริงตอน runtime
  — นอกสโคปของ repo นี้ (ไม่มี K8s manifest ในสโคปตาม REQ-6) เป็น coordination item กับทีม infra
  ไม่ใช่ REQ ของ spec นี้
- Exact patch tag ของ `node:22-alpine` และเวอร์ชันจริงของ `sharp` ยังไม่ lock — resolve ตอน
  /spec-implement (REQ-1.8/1.9 กำหนดแค่ constraint ไม่กำหนดเลขเป๊ะ)
- Registry ปลายทาง (ghcr.io / private / ยังไม่ตัดสินใจ) กระทบแค่ `docker tag`/`push` ภายนอก
  Dockerfile — ไม่กระทบ REQ ใดข้างบน (REQ-6.4 กำหนดแค่ห้าม hardcode)
- `.env.local` มี `NEXT_PUBLIC_GOOGLE_CLIENT_ID_ADMIN`/`_PRODUCER` ค้างจาก `login-google-sso`
  design เดิมที่ superseded 2026-06-24 (REQ-2.4 ยืนยันว่าไม่ต้องใช้) — cleanup ไฟล์ local นั้นเป็นเรื่อง
  แยก ไม่ใช่ REQ ของ spec นี้
- (informational, ไม่ผูก REQ — เดิมเคยเป็น REQ-3.3 ถูกตัดออก ดู A7 ด้านล่าง) `sharp` ship native
  binding แยกตาม CPU arch — ถ้า deploy target ต่าง arch จาก build host (เช่น arm64 node) ต้อง build
  image ให้ตรง target arch เอง (`docker build --platform`) ยังไม่มีหลักฐานว่า target ของโปรเจกต์นี้
  ต่างจาก amd64 ปกติ

### /spec-analyze findings log (2026-07-13)

commit anchor: ยังไม่เคย commit ไฟล์นี้ (`.claude/specs/docker-prod-deploy/` untracked ทั้งโฟลเดอร์
ตอนรัน analyze) — เติม hash จริงตอน commit ครั้งแรก, ยึด git status ตอนนั้นเป็นหลักถ้าเลขนี้ไม่อัพเดท

- **A1** [logical inconsistency] REQ-2.2 ("SHALL NOT set `NEXT_PUBLIC_SKIP_AUTH`") ชน REQ-2.3 เดิม
  (general rule ครอบ "code ต้องการ" ซึ่ง `auth-provider.tsx` อ่านจริง) → **แก้**: reword 2.3 เป็น
  "required by a production feature" กัน bypass flag โดยนิยาม ไม่พึ่ง specific-beats-general
- **A2** [conflicting constraint] REQ-5.4 เดิมคุมแค่ `runner` stage ไม่คุม `builder` (ที่ rewrites()
  อาจถูก bake ตอน build) → **แก้**: ขยาย 5.4 เป็น "at any stage of a production image build"
- **A3** [ambiguity] REQ-6.4 ไม่ชัดว่าห้าม base-image pull (Docker Hub, เลี่ยงไม่ได้) หรือห้ามแค่
  push-destination → **แก้**: reword เป็น "push-destination or private container registry host"
- **A4** [ambiguity] REQ-5.5 ใช้ EARS pattern IF-inspected-THEN ผิด (trigger ควรเป็นสภาวะไม่พึง
  ประสงค์เอง ไม่ใช่การกระทำตรวจสอบ) → **แก้**: reword เป็น ubiquitous "SHALL NOT include .env/
  .env.local file contents in the built image"
- **A5** [gap] EARS completeness — ทั้งชุดมี IF/THEN แค่ตัวเดียว (5.5 ที่เพิ่ง fix) ทั้งที่ design.md
  Error Handling Strategy มี 7 เคส → **ไม่แก้ (dismissed)**: เคสที่เหลือ prevent-by-construction
  อยู่แล้ว (2.2/5.4) หรือเป็น environment precondition ที่ไม่ testable จากใน repo นี้ (network ตอน
  build) — ฝืนใส่ REQ จะขัด EARS "testable" เอง
- **A6** [gap] `npm ci` (REQ-1.3) fail แข็งถ้า `package-lock.json` ไม่ sync กับการเพิ่ม `sharp`
  (REQ-3.1) แต่ไม่มี REQ ไหนพูดถึง lock file → **แก้**: เพิ่ม REQ-1.11 (commit lock file ที่มี sharp
  ก่อน Dockerfile คาดว่า build ผ่าน) — ใส่ใต้ REQ-1 (deps stage) ไม่ใช่ REQ-3 กัน renumber ชนกับ A7
- **A7** [unstated assumption] REQ-3.3 อ้าง "deployment target's CPU architecture" ที่ไม่เคยถูก
  กำหนด และ Dockerfile จริงใน design.md ก็ไม่มีกลไก `--platform` รองรับ → **แก้ (ตัดออก)**: ลบ
  REQ-3.3 ทั้งเส้น (YAGNI, ไม่มีหลักฐาน non-amd64 target) ความรู้เรื่อง arch-match ย้ายไปโน้ต
  informational ด้านบนแทน ไม่ผูก REQ
