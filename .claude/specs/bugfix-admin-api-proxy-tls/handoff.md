# Handoff: Admin API Proxy Local TLS

> From: Codex `/root`
> To: any Codex session
> Date: 2026-08-22

## Task Summary

แก้ Next development proxy ให้ trust public certificate ของ `pol-core` สำหรับ F-1 ถึง F-5 และ
B-1 ถึง B-14 ใน `bugfix.md` โดยไม่แก้ API client, auth, backend หรือ production topology.

## Current Status

Task 1 completed. Automated, network และ authenticated browser gates ผ่านแล้ว. เพิ่ม production-local
start preload เพื่อไม่ให้ logout และ Admin API mutations ถูก proxy สร้าง `500` ก่อนถึง `pol-core`.

## Files Changed

- `.ai/shared/stack/nextjs.md` — edited — บันทึก local CA startup contract
- `README.md` — edited — เพิ่ม local HTTPS setup
- `docs/dev-setup.md` — edited — เพิ่ม public certificate export และ override
- `package.json` — edited — preload CA ด้วย Node native TLS API สำหรับ `npm run dev` และ `npm run start`, กำหนด Node >=22.19
- `package-lock.json` — edited — sync root engine
- `scripts/dev-tls-ca.cjs` — created — append local public CA โดยรักษา default roots
- `scripts/lib/workspace-verification.test.mjs` — edited — regression checks สำหรับ command, engine,
  no TLS bypass และ CA preservation
- `.claude/specs/bugfix-admin-api-proxy-tls/bugfix.md` — created — approved bugfix spec
- `.claude/specs/bugfix-admin-api-proxy-tls/tasks.md` — created — approved task; checkbox ปิดพร้อม Evidence
- `.claude/specs/bugfix-admin-api-proxy-tls/handoff.md` — created — checkpoint นี้

## Important Decisions

- ใช้ `tls.setDefaultCACertificates()` ผ่าน `--require` เพราะ Next 16 `next dev
  --experimental-https` override `NODE_EXTRA_CA_CERTS` ใน child process.
- append public local CA เข้า default roots; ห้าม `NODE_TLS_REJECT_UNAUTHORIZED=0` หรือ global bypass.
- `certificates/` ถูก ignore; local artifact เป็น public certificate เท่านั้น.
- Node >=22.19 ตรง CI/Docker และเป็นรุ่นที่รองรับ API นี้.

## Constraints

- ห้ามแก้ `/Users/king_developer/Desktop/Project/pol-core`.
- ห้าม mock, fallback, hardcode credential, อ่าน cookie/token หรือแก้ backend.
- ห้าม commit/push; รักษา dirty changes ที่ไม่เกี่ยวข้อง.
- `.env`, credential, private key และ secret paths ถูก policy ห้ามอ่าน.

## Tests Run

- `npm run typecheck` -> exit 0
- `npm run lint` -> exit 0
- `npm test` -> Node 23/23, root Vitest 269/269, shared Vitest 26/26; exit 0
- focused Vitest command -> 4 files, 71 tests passed
- `node --check scripts/dev-tls-ca.cjs` -> exit 0
- `npm run build` -> compile/TypeScript ผ่าน; static pages 115/115; exit 0
- `scripts/spec-trace.sh bugfix-admin-api-proxy-tls` -> exit 0; bugfix spec skipped by design
- real `next dev --experimental-https` proxy, unauthenticated -> merchants, approvals และ
  PSP connections ส่งต่อ `401 application/problem+json`, body 127 bytes และ `X-Correlation-ID`
- production-local proxy without preload -> logout `500` self-signed certificate failure
- production-local `npm run start -- -p 3101` with preload -> logout reaches `pol-core` and returns
  `401 application/problem+json` with `X-Correlation-ID` (no proxy `500`)
- direct/backend normalized body comparison -> MATCH ทั้ง 3 endpoint
- authenticated UI -> Admin session with `settings.manage`; PSP list loaded connection data at
  `/control/psp/list`, URL remained unchanged, and console warning/error ว่าง
- viewport 375/768/1440 -> ไม่มี horizontal overflow, clipped interactive element หรือ hydration error;
  viewport reset แล้ว

## Known Issues

- ไม่มีในขอบเขต local TLS proxy และ authenticated Admin PSP flow.

## Next Recommended Agent

human review

## Next Steps

1. Review diff และ Evidence ใน tasks.md.
2. รอ CI ผ่านก่อน merge เข้า `develop`.
3. สรุป root cause, files, endpoint evidence, commands, owner `Next proxy/config`, จบ `STATUS: DONE`.
