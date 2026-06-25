# Control Plane — requirements

Status: drafted 2026-06-24 (AFK /spec-quick style, no approval gate). Frontend-only,
mock data, reuses the minimals theme. Scope: the governance/config surfaces that
orchestrate payments without touching the money path. Data plane (transactions,
policies) already exists.

## Glossary
- Control plane: configuration/governance; console → backend; never on the money path.
- Data plane: payment requests + status (not the money itself; money settles PSP → company).
- PSP: licensed payment provider the platform USES (Omise, 2C2P). Platform is not a PSP.
- Tenant: affiliated company (vCentral / vCommerce / vSouvenir), a separate legal entity.
- Maker-checker: a sensitive action requested by one admin (maker) and approved by another (checker).

## Functional requirements (EARS)

### PSP Connections
- REQ-1.1 The system SHALL list PSP connections scoped by tenant + environment (test/live).
- REQ-1.2 The system SHALL display each connection's health (healthy/degraded/error/disabled) as a badge AND a spine (never color-only).
- REQ-1.3 The system SHALL mark every connection redirect-only (PCI SAQ A).
- REQ-1.4 WHERE a credential is displayed, the system SHALL mask it (prefix+suffix only); it SHALL NEVER render a raw secret.
- REQ-1.5 WHEN an admin requests key rotation, the system SHALL route it through Approvals, never inline edit.

### Routing Rules
- REQ-2.1 The system SHALL present routing rules ordered by priority.
- REQ-2.2 WHEN evaluating a payment context (channel, amount, tenant), the system SHALL select the highest-precedence enabled matching rule's target PSP, else none.
- REQ-2.3 WHEN an admin changes a rule, the system SHALL indicate the change requires maker-checker approval.

### API Clients
- REQ-3.1 The system SHALL list OAuth2 clients with their scopes, tenant, last-used, and status.
- REQ-3.2 The system SHALL show the client secret only masked (shown in full once at creation, conceptually).
- REQ-3.3 WHEN an admin revokes a client, the system SHALL confirm via dialog before applying.

### Webhooks & Events
- REQ-4.1 The system SHALL treat webhooks as the source of truth for payment status.
- REQ-4.2 The system SHALL log delivery events with type, PSP, tenant, delivery status, attempts, signature-verified, received-at.
- REQ-4.3 WHEN an admin replays an event, the system SHALL be idempotent and SHALL disable the action while in-flight.
- REQ-4.4 The system SHALL show the raw payload read-only.

### Approvals (maker-checker)
- REQ-5.1 The system SHALL queue sensitive actions pending a second admin's sign-off.
- REQ-5.2 The system SHALL NOT allow the maker to approve their own request.
- REQ-5.3 The system SHALL NOT allow approving a non-pending request.
- REQ-5.4 WHEN an admin approves/rejects, the system SHALL confirm via dialog summarizing the action.

### Audit Log
- REQ-6.1 The system SHALL present an immutable trail (no edit/delete/bulk) of sensitive actions.
- REQ-6.2 Each entry SHALL record timestamp, actor, action, entity, tenant, result, IP.
- REQ-6.3 WHERE before/after state exists, the system SHALL display the diff read-only.

### Notifications
- REQ-7.1 The system SHALL manage alert rules (event → channel → target) with enable/disable.
- REQ-7.2 The system SHALL show a delivery log (sent/failed).

### Reconciliation
- REQ-8.1 The system SHALL list settlement batches (PSP → company) with expected vs reported and match status.
- REQ-8.2 The system SHALL derive match status: matched when |expected − reported| < 0.01, else variance.
- REQ-8.3 WHEN an admin runs reconciliation, the system SHALL be idempotent (disabled while running).
- REQ-8.4 The system SHALL clarify money settles PSP → company directly; the platform only tracks status.

### Reports
- REQ-9.1 The system SHALL present PSP split, channel breakdown, volume, and top originators, with tenant/date filters.

### Tenants & Workspaces
- REQ-10.1 The system SHALL list tenants with legal entity, SAQ scope, enabled PSPs, admin count, status.
- REQ-10.2 The system SHALL indicate management is Super-tier only; Scoped admins are read-only on their own tenant.

### Originators
- REQ-11.1 The system SHALL list payment sources (branch/app/agent) with tenant, linked API client, status.

## Non-functional
- NFR-1 Reuse the existing minimals theme/tokens/components; one signature layer (mono data face + health spine).
- NFR-2 Accessibility: keyboard reachable, visible focus, status = badge+text+icon, WCAG AA.
- NFR-3 Tenant isolation assumed at backend; screens scope/filter by tenant.
- NFR-4 No backend; deterministic mock data; pure logic colocated with unit tests.
