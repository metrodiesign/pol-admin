# Tasks: Control Plane UI Parity

> Status: approved 2026-08-31 (quick, no gates)

- [ ] 1. Shared kit — styles/toolbar/detail-shell/stat-card/row-action ใต้ `control/shared`, psp re-export (REQ-3.1–3.5)
  - Satisfies: REQ-3.1-3.5
- [ ] 2. Group การเชื่อมต่อ — routing, api-client, webhook: list/columns/detail/pages (REQ-1.1–1.6, 2.1–2.6)
  - Satisfies: REQ-1.1-1.6, REQ-2.1-2.6
- [ ] 3. Group การกำกับดูแล — approval, audit, notification (tabs strip) (REQ-1.1–1.7, 2.1–2.6)
  - Satisfies: REQ-1.7, REQ-2.2
- [ ] 4. Group การเงิน — reconciliation, reports (StatCard/KPI/chart shell) (REQ-1.1–1.3, 1.6)
  - Satisfies: REQ-1.6
- [ ] 5. Group องค์กร + cleanup — tenant, originator, ลบ list-toolbar/status-spine, note ใน control-plane/design.md (REQ-3.6, 4.5)
  - Satisfies: REQ-3.6, REQ-4.5
- [ ] 6. Verify — SSR tests ทุก view, typecheck, eslint, npm test, spec-trace (REQ-4.1–4.4)
  - Satisfies: REQ-4.1-4.4
