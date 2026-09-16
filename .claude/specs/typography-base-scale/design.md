# การออกแบบ: ปรับสเกลตัวอักษรทั้งระบบ

> Status: approved 2026-09-16 (quick, no gates)

## แนวทาง

ปรับเฉพาะ design token ใน `src/app/globals.css` ซึ่งเป็น single source ของ typography ของ Admin โดยเลื่อนสเกลหลักลงหนึ่งระดับจากชุดเดิมให้ `base = 1.25rem` และกำหนด line-height ใหม่ให้สัมพันธ์กับขนาดตัวอักษรภาษาไทย ส่วน utility แบบ semantic และ calendar จะอ้างอิง token เดียวกันเพื่อไม่ให้มี scale ย่อยที่ขัดกัน

การตั้งค่า `fontSize` ใน `settings-provider.tsx` ยังคงเป็น root `font-size` แบบ pixel ตามเดิม เพราะ token ทั้งชุดใช้หน่วย `rem`; เมื่อผู้ใช้ปรับ settings ขนาดทุก token จะปรับตามโดยอัตโนมัติ

## ไฟล์ที่แตะ

| ไฟล์ | การเปลี่ยน |
|---|---|
| `src/app/globals.css` | ปรับค่าและ line-height ของ `--text-xs` ถึง `--text-5xl`, ให้ semantic typography utilities อ้างอิง token และปรับขนาดข้อความใน date-range calendar |
| `src/app/typography.test.ts` | เพิ่ม regression test ตรวจ contract ของ typography token และ semantic utilities |

## ขอบเขตที่ไม่เปลี่ยน

- ไม่แก้ `src/components/providers/settings-provider.tsx` เพราะกลไก root `font-size` และ localStorage เป็น contract เดิมที่รองรับ token แบบ `rem` อยู่แล้ว
- ไม่แก้ component หลายร้อยไฟล์ที่ใช้ `text-base`, `text-sm` หรือ token อื่น เพราะ utility จะรับค่าใหม่จาก `globals.css` กลาง
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

`src/app/typography.test.ts` อ่าน stylesheet ที่ commit อยู่และตรวจค่าของ token หลัก, line-height, การอ้างอิง token ของ semantic utilities และการใช้ token ใน calendar ตัวทดสอบเป็น regression guard ระดับ design token; การปรับ root `font-size` ยังคงถูกตรวจทาง typecheck/build ของแอป

## Requirement Traceability

| Design element | REQ | Section |
|---|---|---|
| token หลักและ line-height ใน `globals.css` | REQ-1.1, REQ-1.2 | รายละเอียดสเกล |
| semantic utilities อ้างอิง token | REQ-1.3 | แนวทาง |
| calendar ใช้ scale ใหม่และคง geometry ของช่องวัน | REQ-1.4 | ขอบเขตที่ไม่เปลี่ยน |
| คง root `font-size` ของ settings provider | REQ-2.1 | แนวทาง |
| จำกัดไฟล์และไม่เปลี่ยน behavior อื่น | REQ-2.2 | ขอบเขตที่ไม่เปลี่ยน |
| การใช้ token กลางแทนการแก้ทุก component | REQ-2.3 | แนวทาง |
