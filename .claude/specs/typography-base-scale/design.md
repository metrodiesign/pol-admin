# การออกแบบ: ปรับสเกลตัวอักษรทั้งระบบ

> Status: approved 2026-09-16 (quick, no gates)

## แนวทาง

ปรับ design token ใน `src/app/globals.css` ซึ่งเป็น single source ของ typography ของ Admin โดยเลื่อนสเกลหลักลงหนึ่งระดับจากชุดเดิมให้ `base = 1.25rem` และกำหนด line-height ใหม่ให้สัมพันธ์กับขนาดตัวอักษรภาษาไทย ส่วน utility แบบ semantic และ calendar จะอ้างอิง token เดียวกันเพื่อไม่ให้มี scale ย่อยที่ขัดกัน

## Root cause ที่ตรวจพบ

ก่อนการ hardening พบว่า token กลางถูกต้อง แต่ component ยังใช้ utility ตั้งแต่ `text-xl` ขึ้นไปตามค่าก่อนหน้า และบางส่วนกำหนด `fontSize`/`lineHeight` แบบ inline ทำให้ global token และ settings ที่ปรับ root `rem` คุมขนาดไม่ครบ การตรวจ source นับได้ 180 utility occurrences ใน 108 TSX files ที่ต้องเลื่อนลงหนึ่งระดับ และพบ inline typography ใน 8 ไฟล์

การตั้งค่า `fontSize` ใน `settings-provider.tsx` ยังคงเป็น root `font-size` แบบ pixel ตามเดิม เพราะ token ทั้งชุดใช้หน่วย `rem`; เมื่อผู้ใช้ปรับ settings ขนาดทุก token จะปรับตามโดยอัตโนมัติ

## ไฟล์ที่แตะ

| ไฟล์ | การเปลี่ยน |
|---|---|
| `src/app/globals.css` | ปรับค่าและ line-height ของ `--text-xs` ถึง `--text-5xl`, ให้ semantic typography utilities อ้างอิง token และปรับขนาดข้อความใน date-range calendar |
| `src/**/*.tsx`, `packages/**/*.tsx` | เลื่อน utility `text-xl` ขึ้นไปลงหนึ่งระดับด้วย mapping เดียว โดยคง `text-base` ลงไป |
| `src/app/minimals/*/page.tsx`, `src/components/dashboard/booking/*`, `src/components/dashboard/ecommerce/ecommerce-summary.tsx` | เปลี่ยน user-facing inline typography เป็น shared utility/token และคง font-family inline ที่ไม่เกี่ยวข้อง |
| `src/app/typography.test.ts` | เพิ่ม regression test ตรวจ token, semantic utilities, class mapping และการไม่มี inline typography ในจุดที่พบ root cause |

## การเลื่อน utility ใน component

หลังจากปรับ base token แล้ว ให้เลื่อนเฉพาะ utility ตั้งแต่ `text-xl` ขึ้นไปลงหนึ่งระดับโดยแทนค่าพร้อมกันจากค่าก่อนหน้า เพื่อป้องกัน chain replacement:

| เดิม | ใหม่ |
|---|---|
| `text-xl` และ responsive variant | `text-lg` และ variant เดิม |
| `text-2xl` และ responsive variant | `text-xl` และ variant เดิม |
| `text-3xl` และ responsive variant | `text-2xl` และ variant เดิม |
| `text-4xl` และ responsive variant | `text-3xl` และ variant เดิม |
| `text-5xl` และ responsive variant | `text-4xl` และ variant เดิม |

การแทนค่าใช้ mapping เดียวในรอบเดียว ไม่ทำแบบเรียง replace ทีละ token เพราะจะทำให้ค่าที่เพิ่งแทนถูกเลื่อนซ้ำ ส่วน `text-base`, `text-sm`, `text-xs` และ utility ที่เล็กกว่ายังคงเดิม

## ขอบเขตที่ไม่เปลี่ยน

- ไม่แก้ `src/components/providers/settings-provider.tsx` เพราะกลไก root `font-size` และ localStorage เป็น contract เดิมที่รองรับ token แบบ `rem` อยู่แล้ว
- ไม่ปรับขนาดตัวอักษรภายใน SVG/chart ที่กำหนดเป็น geometry เฉพาะของกราฟ เพื่อป้องกัน label ล้นหรือทับกัน
- ไม่เปลี่ยน layout, spacing, route, authentication, API, color และ font family

## รายละเอียดสเกล

| Token | ขนาด | line-height |
|---|---:|---:|
| `xs` | `0.9375rem` (15px) | `1.5rem` |
| `sm` | `1.0625rem` (17px) | `1.625rem` |
| `base` | `1.25rem` (20px) | `1.875rem` |
| `lg` | `1.4375rem` (23px) | `2.125rem` |
| `xl` | `1.6875rem` (27px) | `2.375rem` |
| `2xl` | `1.9375rem` (31px) | `2.625rem` |
| `3xl` | `2.3125rem` (37px) | `3rem` |
| `4xl` | `2.8125rem` (45px) | `3.5rem` |
| `5xl` | `3.375rem` (54px) | `4rem` |

## การทดสอบ

`src/app/typography.test.ts` อ่าน stylesheet และ TSX ที่ commit อยู่ ตรวจค่าของ token หลัก, line-height, การอ้างอิง token ของ semantic utilities, การใช้ token ใน calendar, จำนวน utility หลัง mapping และ inline typography ที่ root cause ระบุ ตัวทดสอบเป็น regression guard ระดับ design token/source contract; การปรับ root `font-size` ยังคงถูกตรวจทาง typecheck/build ของแอป

## Requirement Traceability

| Design element | REQ | Section |
|---|---|---|
| token หลักและ line-height ใน `globals.css` | REQ-1.1, REQ-1.2 | รายละเอียดสเกล |
| semantic utilities อ้างอิง token | REQ-1.3 | แนวทาง |
| calendar ใช้ scale ใหม่และคง geometry ของช่องวัน | REQ-1.4 | ขอบเขตที่ไม่เปลี่ยน |
| เลื่อน utility `text-xl` ขึ้นไปลงหนึ่งระดับด้วย mapping เดียว | REQ-1.5 | การเลื่อน utility ใน component |
| คง utility ตั้งแต่ `text-base` ลงไป | REQ-1.6 | การเลื่อน utility ใน component |
| คง root `font-size` ของ settings provider | REQ-2.1 | แนวทาง |
| จำกัดไฟล์และไม่เปลี่ยน behavior อื่น | REQ-2.2 | ขอบเขตที่ไม่เปลี่ยน |
| การใช้ token กลางแทนการแก้ทุก component | REQ-2.3 | แนวทาง |
