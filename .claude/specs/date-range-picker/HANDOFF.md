# Handoff — date-range-picker

## Task 1 — react-day-picker dependency
- สถานะ: DONE
- version ที่ติดตั้ง: `react-day-picker@^9.14.0` (resolved 9.14.0)
- ไฟล์ที่แก้: `package.json`, `package-lock.json`
- Evidence:
  - `node -e "console.log(require.resolve('react-day-picker'))"` → `/Users/king_developer/Desktop/Project/pol-admin/node_modules/react-day-picker/dist/cjs/index.js`
  - `npm run build` → ผ่านทั้งหมด (ทุกหน้ารวม `/order/list` build สำเร็จ, ไม่มี error ที่เกี่ยวกับ react-day-picker)
  - `package.json` line 21: `"react-day-picker": "^9.14.0"` — caret ตาม dependency rules (ไม่ใช่ `*`/`latest`)
- หมายเหตุถึง Task 3 (คนที่จะ import DayPicker): เวอร์ชันที่ล็อกคือ 9.14.0 (RDP v9 API — `mode="range"`, `selected`/`onSelect` ใช้ shape `{from, to}` ไม่ใช่ `{start, end}` แบบ lib logic ของ task 2 ต้อง map ที่ขอบ component ตามที่ design.md ระบุไว้ที่บรรทัด ~100). style import คือ `react-day-picker/style.css`. ยังไม่ได้แตะไฟล์ component ใดๆ — task 1 ทำแค่ install dependency เท่านั้น.
