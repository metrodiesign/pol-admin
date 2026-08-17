> Canonical source for ALL agents (Claude loads via .claude/rules stub; Codex/OpenCode/Pi read directly).
> แก้ที่นี่ที่เดียว — single source of truth.

# Project Structure

## Folder Layout

โครงสร้างจริงของ repo นี้ (ตัว framework เอง) เป็นตัวอย่าง concrete ของการแยก
operating layer ที่ vendor-neutral ออกจาก per-agent adapter:

```
.ai/                  # operating layer ที่ใช้ร่วมทุก agent (durable source of truth)
  shared/             # มาตรฐาน + protocol ที่อ่านได้ทุก agent (PROJECT_CONTEXT, CODING_STANDARDS,
                      #   ARCHITECTURE, LESSONS, TASK_PROTOCOL, EARS, REVIEW/TESTING/SECURITY/...)
  bin/                # check engine จริง (gate-task.sh, check-secrets.sh, check-destructive.sh, ...)
  roles/              # นิยาม role กลาง (spec-architect, bug-investigator, pbt-runner)
  workflows/          # คู่มือ flow ต่อชนิดงาน (feature, bug-fix, code-review, ...)
  templates/          # template ของ artifact (handoff note, review report, task brief, ...)
  agents/             # per-agent adapter map (claude/, codex/, opencode/, pi/)
.claude/              # Claude Code adapter — agents/, commands/, hooks/, rules/ (stub), skills/,
                      #   specs/, settings.json
.codex/               # Codex adapter — agents/, hooks/, config.toml
.opencode/            # OpenCode adapter — agents/, commands/, plugins/
.agents/              # adapter ร่วม (skills/)
.githooks/            # enforcement floor (Tier 1): pre-commit, pre-push
.github/              # CI workflows + pull_request_template.md
apps/                 # deployable Next.js workspaces: admin, merchant
packages/             # shared workspaces: ui, shared
scripts/              # framework automation + workspace parity/runtime verification
docs/                 # คู่มือผู้ใช้ของ framework
retrospectives/       # บันทึก retro รายเดือน
.claude/specs/<feature-name>/   # spec artifact ต่อ feature: requirements.md, design.md, tasks.md
                                #   (+ .github-sync.json sidecar เมื่อ sync แล้ว)
```

> layout นี้เป็นตัวแทนหลัก ไม่ exhaustive — ground truth คือ `ls` จริง;
> /spec-retro มีขั้น steering sync คอยเทียบให้ตรง

## Application structure (per project)

`.ai/` คือ operating layer ของ framework ไม่ใช่ของแอป — แต่ละ project ที่ใช้ framework นี้
จัดวาง source ของตัวเองอย่างไรก็ได้ตาม stack ที่เลือก โดยยึด PRINCIPLE ต่อไปนี้
(ไม่ผูกกับ framework/ภาษาใดภาษาหนึ่ง):

- แยก pure logic ออกจาก presentation — logic คำนวณ/validate/transform อยู่คนละชั้นกับ
  ส่วน UI; ส่วน UI เรียกใช้ ไม่ฝังสูตรไว้ในตัว view
- co-locate unit test ไว้ข้าง logic ที่มันทดสอบ (test อยู่ติดกับโค้ดที่รับผิดชอบ)
- config/design token มี single source ที่เดียว — เรียกผ่าน semantic reference ไม่ทำซ้ำค่าดิบ
- จัด import เป็นชั้น: external ก่อน → internal absolute → relative
- naming convention ชัดและคงเส้นคงวาทั้ง project (ดู Naming Conventions ด้านล่าง)

### โครงสร้าง application จริงของ POL frontend

Repo ใช้ npm workspaces และ Next.js 16 App Router. Stack/idiom: [stack/nextjs.md](stack/nextjs.md).

```
apps/
  admin/                       # package @pol/admin
    src/                       # route tree, components, auth/API, mocks, types
    public/                    # Admin-owned static assets
    next.config.ts             # Admin rewrites/images/standalone config
    .env.example               # Admin environment contract
    .next/                     # Admin-only build output
  merchant/                    # package @pol/merchant
    src/                       # cloned Admin implementation + /register
    public/                    # Merchant-owned static assets
    next.config.ts             # independent cloned config
    .env.example               # Merchant environment contract
    .next/                     # Merchant-only build output
packages/
  ui/                          # package @pol/ui; shared presentation exports only
  shared/                      # package @pol/shared; pure types/validation/utilities
scripts/
  verify-workspaces.mjs        # route equation, import boundaries, test policy
  smoke-workspace-routes.mjs   # child-process-safe HTTP production smoke
```

Boundary contract:

- App import `@pol/ui` และ `@pol/shared` ได้; ห้าม import source จากอีก app.
- Package ห้าม import app และ `@pol/shared` ห้ามพึ่ง framework/browser side effect.
- Route, auth/API, navigation, config และ public assets เป็น app-local โดยเจตนา.
- ไม่สร้าง shared route/auth abstraction เพราะ Merchant pruning ต้องลบได้โดยไม่กระทบ Admin.
- `@pol/ui` มีเฉพาะ primitives ที่สอง app ใช้ร่วมจริง; component ที่ยังต้อง diverge อยู่ app-local.
- แต่ละ app มี `@/* -> ./src/*`; package imports ใช้ public export (`@pol/ui/*`, `@pol/shared/*`).
- แต่ละ app scan `packages/ui/src` ผ่าน Tailwind `@source` แต่คง global tokens คนละ copy.
- Build output และ standalone server ต้องอยู่ใน app workspace ของตัวเอง; ห้ามใช้ shared `distDir`.

Route contract ชั่วคราว: `Merchant routes = Admin routes ∪ {/register}`. Merchant clone Admin route
implementation, auth/API และ navigation จริง; final Merchant surface อยู่นอก scope feature นี้.

`.github-sync.json` ใน `.claude/specs/<feature>/` = sidecar manifest ของ `/spec-sync-github`
(link map issue<->task) — commit เข้า repo, เฉพาะคำสั่ง sync เขียน; ห้ามแก้มือ,
ห้ามใส่ link ลง tasks.md

## Naming Conventions (โปรเจกต์จริง)

- ไฟล์ `.ts`/`.tsx`: **kebab-case** (`use-data-table.ts`, `policy-columns.tsx`, `custom-breadcrumbs.tsx`)
- type/interface: **PascalCase** (`Policy`, `PolicyStatus`, `SettingsContextValue`)
- custom hook: prefix **`use-*`** (`use-policy-table-with-cart`)
- context provider: suffix **`*-provider.tsx`** + hook เข้าถึงชื่อ `useXxx()` (`settings-provider.tsx` -> `useSettings()`)
- mock data: `entity.ts` (`policies.ts` export `POLICIES: Policy[]`)
- export เป็น **named function** เสมอ (`export function PolicyDataTable()`); default export เฉพาะ Next page/layout

## Import Ordering

1. external (dependency ของภายนอก เช่น `react`, `@tanstack/react-table`)
2. internal absolute ผ่าน alias **`@/*`** (`@/types/policy`, `@/components/ui/*`) — ใช้ absolute เสมอ
3. relative (`./...`) เฉพาะภายในโมดูลเดียวกัน

> `"use client"` (ถ้ามี) อยู่บรรทัดบนสุดก่อน import ทั้งหมด.
> นี่คือ convention เป้าหมาย — บางไฟล์เดิม (เช่น payment columns: `transactions-columns.tsx`,
> `invoice-columns.tsx`, `roles-columns.tsx`) ยังเรียงสลับ external/internal อยู่; จัดใหม่ให้ตรงเมื่อแก้ไฟล์นั้น

## Architectural Patterns

- logic คำนวณ/validate แยกเป็นชั้นของตัวเอง — ส่วน UI เรียกใช้ ไม่ฝังสูตรไว้ในตัว view
- data แยกจากตัว presentation — ส่งผ่าน props หรือ import โดยตรง ไม่ inline ก้อนใหญ่ในไฟล์ view
- design token อยู่ที่เดียว — เรียกผ่าน semantic reference
- ถ้า project มี UI: องค์ประกอบ interactive มี state ครบ (default/hover/focus/active/disabled)
  และ accessible เป็น principle (keyboard reachable, focus มองเห็น, contrast พอ)
- โค้ดพิสูจน์ว่าเขียวด้วย `.ai/bin/gate-task.sh` ตอน flip task เป็น `[x]`: gate อ่าน
  `SDD_TYPECHECK_CMD` / `SDD_TEST_CMD` (auto-detect script ใน package.json ให้ project แบบ Node)
  เพื่อรัน typecheck/test; เมื่อไม่มีทั้งคู่จะข้าม code-green แล้วเหลือเพียง Evidence gate

## Anti-Patterns

- ห้าม duplicate magic constant / ค่าดิบซ้ำหลายที่ (ใช้ single source แทน)
- ห้าม inline data ก้อนใหญ่ในไฟล์ presentation
- ห้ามฝังสูตรคำนวณ/business logic ตรงในตัว view
- ห้าม app-to-app import หรือ package-to-app import
- ห้ามย้าย route/auth/navigation ไป shared package เพื่อแก้ duplicate ระหว่าง parity phase
- ห้าม mark task `[x]` ทั้งที่ typecheck/test ยังไม่เขียว หรือไม่มี Evidence
- test ต้อง assert พฤติกรรมที่สังเกตได้ ไม่ใช่ snapshot รายละเอียดภายในที่เปราะ
