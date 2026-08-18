# Handoff: Remove Merchant Workspace

> From: Codex root session   To: human review   Date: 2026-08-17

## Task Summary

ดำเนิน spec `remove-merchant-workspace` Tasks 1–6 ครบ: ย้าย duplicate Merchant workspace
ออกจาก `pol-admin` แบบกู้คืนได้, ทำ workspace/tooling/CI/container/docs เป็น Admin-only และพิสูจน์
ว่า Admin source, shared packages และ normalized routes ไม่เปลี่ยนจาก commit baseline.

## Current Status

Local implementation และ acceptance ผ่านครบ. Working tree ยังไม่ stage; ไม่มี commit, push หรือ PR.
`pol-admin` เป็น canonical Admin frontend และ [pol-merchant](https://github.com/metrodiesign/pol-merchant.git)
เป็น canonical Merchant frontend.

## Root Cause Evidence

Root cause ไม่ใช่การ copy ผิดขั้นตอน แต่เป็น approved migration design เดิมที่ตั้งใจสร้าง duplicate:

- `.claude/specs/split-admin-merchant-apps/requirements.md:8` กำหนดให้ Merchant clone route, UI,
  navigation และ Admin auth/API ก่อน.
- Requirements เดิมข้อ 3.2, 4.4 และ 5.2 บังคับ clone routes/API และเก็บ source ใน workspace แยก.
- Requirements เดิมบรรทัด 230 เลื่อนการคัด Merchant routes, auth และ navigation ไป feature ภายหลัง.
- ผลคือสอง repository มี Merchant frontend ownership ซ้ำ; cleanup นี้แก้ ownership boundary ที่ต้นเหตุ.

## Files Changed

| Path | State | Change |
|---|---|---|
| `apps/merchant/**` | deleted from working tree | tracked paths 749 รายการย้ายทั้ง directory ไป Recoverable Trash |
| `package.json`, `package-lock.json` | edited | เหลือ explicit workspaces: Admin, UI, Shared; ลบ Merchant root scripts/links |
| `scripts/**` | edited | topology, route, boundary, signal และ smoke verification เป็น Admin-only |
| `.github/workflows/ci.yml`, `Dockerfile` | edited | build/test/smoke/container graph เป็น Admin-only |
| `README.md`, `docs/dev-setup.md` | edited | ลบ local Merchant runtime/setup/deploy และเพิ่ม canonical repository pointer |
| `.ai/shared/PROJECT_CONTEXT.md` | edited | ประกาศ canonical ownership และ retained topology |
| `.ai/shared/ARCHITECTURE.md` | edited | บันทึก Admin-only module/runtime boundary |
| `.ai/shared/stack/nextjs.md` | edited | บันทึก Admin-only Next.js commands, ports และ build output |
| `.claude/specs/remove-merchant-workspace/*` | new, untracked | approved requirements/design/tasks, Evidence และ handoff นี้ |

## Important Decisions

- ใช้ atomic same-device rename ไป Trash ไม่ใช้ permanent delete เพื่อให้ recovery ได้.
- ไม่แก้ tracked content ใต้ `apps/admin`, `packages/ui` หรือ `packages/shared`.
- คง Admin `/merchant/*`, Merchant-management components/APIs/mocks/types และ `/producer/*` rewrite;
  สิ่งเหล่านี้เป็น Admin domain capability ไม่ใช่ Merchant frontend.
- Verifier คง forbidden Merchant strings เฉพาะ negative-enforcement guards และ unit-test fixtures.
- ไม่มี source synchronization ระหว่าง `pol-admin` กับ `pol-merchant`.
- Historical specs และ retrospectives ไม่ถูก rewrite; stale scan ตรวจเฉพาะ operational/current paths.

## Recovery Reference

- Baseline commit: `79644df1bfa4b9ad9149fdeecedc63cbafda76d6`
- Trash path: `/Users/king_developer/.Trash/pol-admin-apps-merchant-79644df1-20260817T222500-01a00fbf`
- Tracked inventory: 749 paths; Task 1 verified Git blobs 749/749.
- Trash และ repository อยู่ filesystem device `16777231`; source path ไม่เหลือ.
- Recovery ต้องตรวจว่า destination ว่างและ Trash inventory ยังครบก่อนย้ายกลับ; ห้าม overwrite.

## Constraints

- ห้าม stage/commit/push ตรง `main` หรือ `develop`; ต้องผ่าน review และ PR.
- ห้าม force push.
- ห้ามแก้ sibling `pol-merchant`, backend, database หรือ external deployment ในงานนี้.
- ห้ามลบ Trash recovery directory จนกว่างานได้รับ review และไม่ต้อง rollback แล้ว.
- Release ต้องผ่าน CI/staging และมี rollback plan ตาม repository rules.

## Tests Run

| Gate | Observed result |
|---|---|
| Node `22.19.0`, npm `11.12.1`, `npm ci` | installed 714 packages; exact local workspaces 3 รายการ |
| `npm audit --omit=dev --audit-level=high` | found 0 vulnerabilities |
| `npm test` | verifier 18, Admin 209, Shared 26 passed |
| `npm run lint` | Admin, UI, Shared passed; zero errors |
| `npm run typecheck` | Admin, UI, Shared passed |
| `npm run build:admin` | 113 generated page entries; build passed |
| `npm run verify:workspaces` | Admin 112 normalized routes; 670 code files scanned |
| baseline/candidate route comparison | 112/112; missing 0; extra 0; SHA-256 `6011454515d15a40e39e171ef87e748f92a63a0f0a995ff43c3c16455d387216` |
| `npm run smoke:routes` | `/` 307, `/admin/user/list` 200, `/register` 404 |
| full-tree secret scan | passed |
| `.claude/hooks/tests/*.test.sh` | 6 suites passed |
| all-spec trace loop | 13 specs passed; active spec 137 criteria covered |
| retained-tree Git comparison | 760 tracked paths; changed paths 0 |
| operational stale-reference scan | active forbidden refs 0; 13 negative guard refs verified by tests |
| Docker build/runtime | image `sha256:f908fccadd763b237da87b3007896d3026de65ebc076c72628ae931d61860e52`; healthy; `nextjs` UID 1001; routes 307/200/404 |

Browser viewport check เป็น n/a: UI source ไม่เปลี่ยน byte-for-byte; production HTTP และ container probes
ครอบ runtime acceptance. Test container และ image tag ถูกลบหลังตรวจเสร็จ.

## Known Issues

- `pol-merchant` local candidate อยู่ branch `codex/merchant-workspace-reset` ที่ commit
  `ae550fa602593b75c77cbc817cb456c86f44311c`; local handoff บันทึก acceptance ผ่าน.
- Read-only remote check วันที่ 2026-08-17 พบ remote branch 0 รายการและ PR `[]`; push/PR/remote CI
  ยัง pending และอยู่นอก scope cleanup นี้.
- `npm ci` summary รายงาน dev dependency vulnerabilities 8 รายการ: low 2, moderate 1, high 5.
  Approved production gate `--omit=dev` พบ 0; dev audit remediation เป็นงานแยก.

## Next Recommended Agent

Human review. งาน implementation ครบแล้ว; ขั้นถัดไปเป็นการยืนยัน diff และ recovery reference ก่อน ship.

## Next Steps

1. อ่าน requirements, design, tasks และ handoff ใน spec นี้ แล้วตรวจ `git status`/`git diff` เทียบ filesystem จริง.
2. Review 749 deletions, Admin-only tooling/doc changes และ Evidence ก่อนอนุญาต commit.
3. เมื่ออนุมัติให้ ship ใช้ PR เข้า `develop`; อย่า push ตรง.
4. จัดการ remote branch/PR ของ `pol-merchant` แยกจาก repo นี้ก่อน release coordination.
