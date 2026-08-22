# Bugfix: Admin API Proxy Rejects Local TLS Certificate

> Status: approved 2026-08-22

กำหนดพฤติกรรมแก้ `500` ที่ Next development proxy สร้างก่อน request ถึง `pol-core` โดยคง auth,
security, production topology และ API contract เดิม.

## Current Behavior (Defect)

WHEN `pol-core` ทำงานที่ `https://localhost:5001`, SPA เริ่มด้วย
`ADMIN_API_ORIGIN=https://localhost:5001` และ Admin เปิด `/control/psp/list` THEN request ต่อไปนี้
ตอบ proxy-generated `500 Internal Server Error` ขนาด 21 bytes โดยไม่มี `Content-Type` หรือ
`X-Correlation-ID`:

- `GET /api/v1/merchants?page=1&limit=100`
- `GET /api/v1/approvals?page=1&limit=100&action=psp.credential.change&status=pending`
- `GET /api/v1/payments/psp-connections?page=1&limit=25`

หน้า SPA แสดง `โหลด Merchant catalog ไม่สำเร็จ`, `ตรวจสถานะอนุมัติไม่ได้` และ
`โหลด PSP Connections ไม่สำเร็จ` ตรงกันทุกครั้งในการ reload สองรอบ.

### Reproduction

```bash
for origin in https://localhost:5001 https://localhost:3001; do
  for path in \
    '/api/v1/merchants?page=1&limit=100' \
    '/api/v1/approvals?page=1&limit=100&action=psp.credential.change&status=pending' \
    '/api/v1/payments/psp-connections?page=1&limit=25'; do
    /usr/bin/curl -skS --max-time 5 -o /dev/null \
      -w '%{http_code}|%{content_type}|%{size_download}\n' "$origin$path"
  done
done
```

| Boundary | Merchant | Approval | PSP connection |
|---|---:|---:|---:|
| Direct `:5001` without session | `401`, Problem Details, 127 bytes | `401`, Problem Details, 127 bytes | `401`, Problem Details, 127 bytes |
| Proxied `:3001` | `500`, 21 bytes | `500`, 21 bytes | `500`, 21 bytes |

Direct responses มี `X-Correlation-ID`; proxied responses ไม่มี. Node TLS probe ต่อ
`https://localhost:5001/health/live` คืน `DEPTH_ZERO_SELF_SIGNED_CERT`.

Root cause ที่ยืนยันแล้ว: rewrite ใน `next.config.ts:35` ส่ง `/api/*` ไป local HTTPS upstream
แต่ Node runtime ของ Next ไม่ trust development certificate จึงสร้าง `500` ก่อนถึง backend middleware,
auth หรือ endpoint. `src/lib/api/admin/auth.ts:84` เป็น fetch initiator ไม่ใช่ต้นเหตุ.

## Expected Behavior

- F-1 WHEN `ADMIN_API_ORIGIN` ชี้ไป local `pol-core` HTTPS endpoint ที่ healthy และ SPA รับ request
  ใต้ `/api/*` THE SYSTEM SHALL forward request ถึง backend โดยไม่สร้าง TLS `500` ที่ proxy.
- F-2 WHEN `pol-core` ส่ง response ผ่าน development proxy THE SYSTEM SHALL ส่งต่อ HTTP status,
  content type, body และ `X-Correlation-ID` ที่ backend กำหนด.
- F-3 WHEN authenticated Admin เปิด `/control/psp/list` และสาม list endpoint ตอบ `200`
  THE SYSTEM SHALL แสดง persisted rows หรือ valid empty state โดยไม่มี error banner จากสาม request.
- F-4 WHEN Next process restart หลัง development proxy configuration เปลี่ยน THE SYSTEM SHALL โหลด
  configuration ล่าสุดตอน process start และใช้กับ request ถัดไป.
- F-5 WHERE local HTTPS proxy ต้องเพิ่ม certificate trust THE SYSTEM SHALL trust เฉพาะ development
  certificate material ที่ project อนุมัติสำหรับ local `pol-core` upstream.

## Unchanged Behavior

- B-1 WHEN browser เรียก Admin API THE SYSTEM SHALL CONTINUE TO ใช้ relative same-origin API path.
- B-2 WHEN browser ส่ง Admin API request THE SYSTEM SHALL CONTINUE TO ส่ง session cookie ด้วย
  `credentials: "include"`.
- B-3 WHEN Admin session ใช้งานอยู่ THE SYSTEM SHALL CONTINUE TO ไม่อ่าน session token ด้วย JavaScript.
- B-4 WHEN mutation ถูกส่ง THE SYSTEM SHALL CONTINUE TO แนบ `X-CSRF-Token`, `Idempotency-Key` และ
  `If-Match` ตาม endpoint contract.
- B-5 WHEN backend คืน `401`, `403`, `404`, `409`, network failure หรือ `500` THE SYSTEM SHALL
  CONTINUE TO แสดงสถานะที่ตรง contract พร้อม retry เมื่อ retry ปลอดภัย.
- B-6 WHEN upstream หรือ backend ล้มเหลว THE SYSTEM SHALL CONTINUE TO ไม่สร้าง mock data,
  fallback success หรือ persisted row ปลอม.
- B-7 WHEN production start โดยไม่มี `ADMIN_API_ORIGIN` THE SYSTEM SHALL CONTINUE TO คืน rewrite
  ว่างและใช้ production reverse-proxy same-origin topology.
- B-8 WHEN HTTPS upstream ไม่ใช่ project-approved local development target THE SYSTEM SHALL
  CONTINUE TO บังคับ TLS certificate validation ตามปกติ.
- B-9 WHEN Next สร้าง development rewrites THE SYSTEM SHALL CONTINUE TO รองรับ `/admin/*`,
  `/producer/*` และ `/api/*` ตาม destination contract เดิม.
- B-10 WHEN bugfix ถูก implement THE SYSTEM SHALL CONTINUE TO ไม่เพิ่ม endpoint alias หรือเปลี่ยน
  auth architecture.
- B-11 WHEN bugfix ถูก implement THE SYSTEM SHALL CONTINUE TO ไม่เพิ่ม dependency, mock fallback
  หรือ service abstraction.
- B-12 WHEN bugfix ถูก implement THE SYSTEM SHALL CONTINUE TO ไม่แก้ `pol-core`, PSP adapter,
  vault, database schema หรือ routing rules.
- B-13 WHEN PSP request มี sensitive value THE SYSTEM SHALL CONTINUE TO ไม่ใส่ `secretKey`,
  `pspMerchantId`, cookie หรือ token ใน DOM, URL, browser storage และ log.
- B-14 WHEN bugfix ถูก implement THE SYSTEM SHALL CONTINUE TO ไม่เปลี่ยน PSP UI และ resource-hook
  behavior นอกผลลัพธ์ที่เกิดจาก request ถึง backend ได้สำเร็จ.
