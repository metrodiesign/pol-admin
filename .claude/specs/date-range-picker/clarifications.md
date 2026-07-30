# Clarifications — date-range picker เต็มรูปแบบ

1. Scope: แทนที่ date filter เดิมใน `order-list-toolbar.tsx` เท่านั้น (ไม่ทำ shared component กลาง)
2. Preset: วันนี้ / เมื่อวาน / 7 วันล่าสุด / 30 วันล่าสุด / เดือนนี้ / เดือนที่แล้ว / กำหนดเอง (ตามรูปอ้างอิง)
3. Dependency: อนุญาตเพิ่ม dependency ใหม่ (ต้อง review license + maintenance status ตาม Dependency rules ก่อนเลือก lib จริงใน design phase)
4. ปีปฏิทิน: พ.ศ. (Buddhist Era) เท่านั้น ไม่ต้องสลับ ค.ศ.
5. Data wiring: ทำแค่ UI component ก่อน — ไม่ต่อ filter จริงเข้า `order-list-view.tsx` / ไม่เพิ่ม field date ใน `PaymentSession` ใน spec นี้
6. Responsive: ต้องรองรับจอเล็ก (mobile) — ปฏิทินคู่บน desktop, ปรับเป็นคอลัมน์เดียวบนจอเล็ก
