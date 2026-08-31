# Bugfix: Admin Logout and Microsoft SSO State

> Status: approved 2026-08-22

> Evidence reconciliation: current callers navigate only after `logout()` resolves with `204`; failure remains on the page or in the drawer with retry. Current evidence is tracked in `.claude/specs/bugfix-auth-evidence-and-docs/`.

แก้ false-success ของ Admin logout และทำให้ Microsoft login ขอเลือกบัญชีอย่างชัดเจน โดยคง BFF session,
OIDC security และ local-only logout ตาม contract เดิม.

## Current Behavior (Defect)

WHEN Admin กด Logout แล้ว `POST /api/v1/admins/auth/logout` ล้มเหลวด้วย non-2xx หรือ network error
THEN `pol-admin` ยัง redirect ไป `/login` เพราะ callers ใช้ `logout().finally(...)`; ผู้ใช้จึงเห็นเหมือน
logout สำเร็จ ทั้งที่ POL session อาจยัง active.

WHEN Admin เปิด `/login` หลัง local logout แล้วกด Microsoft ขณะที่ Entra session ยัง active
THEN authorization request ไม่มี `prompt` และ Entra SSO ส่งกลับ `/dashboard` โดยไม่แสดง account/credential UI.

### Reproduction

1. เปิด `https://localhost:3001/control/psp/list` ที่ viewport 1440px และมี Admin session.
2. เปิด Account drawer แล้วกด `Logout`.
3. ทำให้ `POST /api/v1/admins/auth/logout` unavailable หรือคืน non-2xx (เช่น block request ใน browser
   DevTools) แล้วสังเกตว่า SPA ยังไป `/login`.
4. จาก `/login` กด Microsoft ขณะมี Entra session เดิม แล้วสังเกตว่า browser กลับ `/dashboard` โดยไม่มี
   username/password หรือ account chooser.

หลักฐานต้นเหตุ: `pol-admin/src/components/layout/account-drawer.tsx` และ
`pol-admin/src/app/logout/page.tsx` redirect ใน `finally`; `pol-core/src/Hosts/Api/Program.cs` ล้างเฉพาะ
POL cookies/session; `pol-core/src/Hosts/Api/Admins/OidcAuthentication.cs` ไม่กำหนด `prompt`.

## Expected Behavior

- F-1 WHEN `POST /api/v1/admins/auth/logout` คืน `204` THEN THE SYSTEM SHALL navigate ไป `/login` และถือว่า
  local logout สำเร็จ.
- F-2 WHEN logout คืน non-2xx หรือ network error THEN THE SYSTEM SHALL ไม่ navigate เหมือนสำเร็จ และต้อง
  แสดงข้อความ failure พร้อม action สำหรับ retry.
- F-3 WHEN Admin เริ่ม Microsoft login THEN THE SYSTEM SHALL ส่ง OIDC authorization parameter
  `prompt=select_account` แบบค่าคงที่ เพื่อให้ผู้ใช้เลือกบัญชีก่อน callback.
- F-4 WHEN Admin เริ่ม Google login หรือ merchant login THEN THE SYSTEM SHALL ไม่รับหรือส่งต่อ `prompt`
  จาก input ของ browser และต้องคง provider flow เดิม.

## Unchanged Behavior

- B-1 WHEN local logout สำเร็จ THEN THE SYSTEM SHALL CONTINUE TO revoke current POL session family, append
  logout audit, clear session/CSRF cookies และคืน `204`.
- B-2 WHEN logout-all สำเร็จ THEN THE SYSTEM SHALL CONTINUE TO revoke ทุก POL session ของ Admin ทุกอุปกรณ์.
- B-3 WHEN logout mutation ไม่มี valid CSRF THEN THE SYSTEM SHALL CONTINUE TO คืน `403`.
- B-4 WHEN Microsoft login ทำงาน THEN THE SYSTEM SHALL CONTINUE TO ใช้ Authorization Code, PKCE S256,
  unique `state`/`nonce`, tenant pinning และ minimal scopes.
- B-5 WHEN auth ทำงาน THEN THE SYSTEM SHALL CONTINUE TO ไม่เปิดเผย token หรือ session credential แก่
  frontend JavaScript, URL, browser storage หรือ log.
- B-6 WHEN local logout ถูกเลือก THEN THE SYSTEM SHALL CONTINUE TO ไม่ sign out Microsoft session ของ app
  อื่นโดยอัตโนมัติ และไม่เรียก RP-Initiated Logout `end_session_endpoint`.
- B-7 WHEN Google callback configuration มีปัญหา THEN THE SYSTEM SHALL CONTINUE TO แยกปัญหา
  `redirect_uri_mismatch` ออกจาก Microsoft login fix.
- B-8 WHEN merchant authentication หรือ merchant logout ทำงาน THEN THE SYSTEM SHALL CONTINUE TO ไม่เปลี่ยน
  behavior.
- B-9 WHEN bugfix ถูก implement THEN THE SYSTEM SHALL CONTINUE TO ไม่เปลี่ยน database schema, session-store
  contract, cookie names, RBAC policy หรือ API route contract.
- B-10 WHEN existing PSP/TLS worktree changes ถูกเก็บไว้ THEN THE SYSTEM SHALL CONTINUE TO ไม่แก้หรือ revert
  changes ที่ไม่เกี่ยวกับ auth bugfix.

## Hard Scope

แก้ได้เฉพาะ Admin auth callers/tests ใน `pol-admin` และ Admin OIDC login/tests ใน `pol-core` ที่จำเป็นต่อ
F-1 ถึง F-4. ห้ามเพิ่ม dependency, เปลี่ยน merchant auth, เพิ่ม federated logout, แก้ Google app registration,
แก้ session schema หรือแตะ PSP/TLS implementation เดิม.
