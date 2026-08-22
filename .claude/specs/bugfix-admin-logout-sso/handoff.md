# Handoff: Admin Logout and Microsoft SSO State

แก้ false-success logout และเพิ่ม Microsoft account chooser ตาม bugfix spec ที่อนุมัติแล้ว.

## Delivered

- `logout()` ยอมรับ success เฉพาะ HTTP `204`.
- logout failure คงหน้าเดิมและแสดงข้อความพร้อม retry.
- Admin Microsoft OIDC ส่ง `prompt=select_account` จาก server แบบค่าคงที่.
- Google, merchant auth, CSRF, PKCE, state, nonce, session cookie และ local-only logout คงเดิม.

## Verification

- Frontend: `npm test` — Node 22 ผ่าน, root Vitest 262 ผ่าน, shared 26 ผ่าน.
- Frontend: `npm run typecheck` และ `npm run lint` — ผ่าน.
- Backend: Hosts.Tests focused 5 ผ่าน และ full suite 634 ผ่าน.
- Browser production: `/logout` เมื่อ proxy พบ TLS failure (`500`) แสดง error/retry และไม่ redirect; Microsoft authorize request มี `prompt=select_account`.
- Security review: approve, ไม่พบ finding.

## Scope Notes

- ไม่เพิ่ม Microsoft federated logout.
- Google `redirect_uri_mismatch` เป็น config issue แยกงาน.
- ไม่แก้หรือ revert dirty PSP/TLS changes เดิมใน `pol-admin`.
- In-app browser ไม่มี viewport emulation; production check วัด `clientWidth=1068`, `innerWidth=1068`.
