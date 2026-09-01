# หลักฐาน Browser Verification ของ Control Plane

ตรวจ working tree บน branch `fix/control-plane-badge-parity-gaps` ซึ่งมีฐานจาก commit `94685d7b945f74e079cd03478f85836560faf3c0` ผ่าน Chrome CDP หลัง Microsoft SSO สำเร็จ

## ขอบเขต

- ตรวจ 21 page states ที่ viewport กว้าง `375`, `768` และ `1440` รวม 63 checks
- ครอบ 12 list states: PSP, routing, API clients, webhooks, approvals, audit, notification rules, notification log, reconciliation, reports, tenants และ originators
- ครอบ 9 detail routes: PSP, routing, API client, webhook, approval, audit, notification log, tenant และ originator

## ผลตรวจ

- ผ่าน 63 จาก 63 checks
- ตรวจ badge/chip ที่ render รวม 552 instances ทุกตัวมี class `h-[30px]` และ computed height 30px
- Notification tab count ยังคงสูง 20px และไม่มี class `h-[30px]`
- ไม่พบ body overflow
- ไม่พบ browser console error หรือ runtime exception
- ไม่พบ legacy `StatusSpine`, `<aside>` ภายใน main content, `text-overline` หรือ `mmd:grid-cols-12`
- Routing channel, PSP ปลายทาง, PSP สำรอง และ status ใช้ merchant pill geometry ทุกแถว
- Webhook PSP, signature และ delivery status ใช้ merchant pill geometry ทุกแถว
- Notification tab count ยังคง compact geometry
- ทุก route อยู่ที่ path ที่ร้องขอ ไม่มี redirect กลับ login หรือ dashboard

## ไฟล์หลักฐาน

- `results.json` เก็บผลราย route, viewport, table header, pill-column check, overflow และ console error
- `height-30-results.json` เก็บ computed height ของ badge/chip ทั้ง 552 instances และ compact count exception
- `routing-375.png`, `routing-768.png`, `routing-1440.png` แสดง routing pills หลังแก้
- `webhooks-375.png`, `webhooks-768.png`, `webhooks-1440.png` แสดง webhook PSP pill หลังแก้
