# Handoff: ปรับสเกลตัวอักษรทั้งระบบ

> From: Pi   To: any   Date: 2026-09-16

## Task Summary

งานใน spec `typography-base-scale` ปรับ global typography token ให้ `text-base` เป็น `1.25rem` (20px ที่ root 16px) พร้อมเลื่อน scale อื่นให้ต่อเนื่อง ปรับ semantic utilities และ date-range calendar ให้ใช้ scale เดียวกัน

## Current Status

เสร็จแล้วทั้ง 3 tasks และ artifacts อยู่สถานะ `approved` แบบ quick workflow เพิ่มการเลื่อน utility ตั้งแต่ `text-xl` ขึ้นไปใน 108 TSX files พร้อมแก้ inline typography ที่เป็น root cause ใน 8 จุด; ไม่ได้เปลี่ยน settings provider, route, auth หรือ API

## Files Changed

- `.claude/specs/typography-base-scale/requirements.md` — สร้าง requirements แบบ EARS
- `.claude/specs/typography-base-scale/design.md` — สร้าง design และ traceability
- `.claude/specs/typography-base-scale/tasks.md` — สร้าง task list, ติ๊กครบ และบันทึก Evidence
- `.claude/specs/typography-base-scale/handoff.md` — บันทึก handoff นี้
- `src/app/globals.css` — ปรับ token `xs` ถึง `5xl`, semantic utilities และ calendar typography
- `src/app/typography.test.ts` — เพิ่ม regression test ของ token/utility/calendar และ mapping count
- `src/app/**/*.tsx`, `src/components/**/*.tsx`, `packages/ui/src/**/*.tsx` — เลื่อน utility `text-xl` ขึ้นไปลงหนึ่งระดับ
- `src/app/minimals/{blank,params,permission,subpaths}/**`, `src/components/dashboard/booking/**`, `src/components/dashboard/ecommerce/ecommerce-summary.tsx` — ย้าย inline font size/line-height ไป shared typography utilities

## Important Decisions

- ใช้ scale แบบเลื่อนค่าชุดเดิมลงหนึ่งระดับ: `xs 15px`, `sm 17px`, `base 20px`, `lg 23px`, `xl 27px`, `2xl 31px`, `3xl 37px`, `4xl 45px`, `5xl 54px`
- คง `fontSize` ใน settings provider เป็น root `font-size` แบบ pixel เพราะ token ใช้ `rem` และยังรองรับการปรับทั้งระบบตามเดิม
- ใช้ mapping พร้อมกันทั้งชุดเพื่อไม่ให้ replacement chain เลื่อนซ้ำ: `xl→lg`, `2xl→xl`, `3xl→2xl`, `4xl→3xl`, `5xl→4xl`
- คง `text-base`, `text-sm`, `text-xs` และ SVG/chart labels ที่เป็น geometry เฉพาะไว้

## Constraints

- ห้ามแตะ `.env.local`, auth, API, route, backend, dependency และไฟล์ untracked ที่มีอยู่ก่อนงานนี้
- อย่า commit/push โดยตรงไป `develop` หรือ `main`
- Browser visual verification ยังไม่ได้รันใน Pi session; หากต้องการหลักฐานภาพ ให้ตรวจใน target runtime ต่อ

## Tests Run

- `npx vitest run src/app/typography.test.ts` -> ผ่าน 5 tests; regression mapping และ inline typography ผ่าน
- `npm run typecheck` -> exit 0; root และ 2 workspaces ผ่าน
- `npm run lint` -> exit 0; root และ 2 workspaces ผ่าน
- `npm run build` -> compiled successfully และสร้าง static pages 101 routes
- `npm test` -> node 39/39, root Vitest 343/343, `@pol/shared` 26/26 ผ่าน
- `scripts/spec-trace.sh typography-base-scale` -> เกณฑ์ 7 ข้อถูกอ้างครบ, EARS lint ผ่าน
- `.ai/bin/gate-task.sh typography-base-scale` -> exit 0
- `grep -r -E -o --include='*.css' -- '--text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl):[^;}]+' .next/static/chunks` -> พบ token ใหม่ครบรวม `--text-base:1.25rem`
- diagnostic utility count ก่อนแก้ -> fail ด้วย `xl:66, 2xl:63, 3xl:11, 4xl:25, 5xl:15`; หลังแก้ -> regression test ผ่านด้วย `lg:73, xl:63, 2xl:14, 3xl:25, 4xl:15, 5xl:0`
- viewports: n/a — token/CSS change; ไม่มี browser verification runtime ใน Pi

## Known Issues

- Repo มี untracked files จากงานอื่นอยู่ก่อนแล้ว; ไม่ได้แก้หรือรวมไว้ในงานนี้
- ไม่มี functional deviation; browser visual verification เป็นงานต่อถ้าต้องการ screenshot evidence

## Next Recommended Agent

ให้มนุษย์ review diff และตรวจ visual ใน browser หากต้องการยืนยัน layout จริง

## Next Steps

1. อ่าน `requirements.md`, `design.md`, `tasks.md` และตรวจ `git status --short` ก่อน commit
2. ตรวจ screenshot ที่ acceptance viewport ใน target runtime หากมี browser tooling แล้วจึงพิจารณา commit ผ่าน PR
