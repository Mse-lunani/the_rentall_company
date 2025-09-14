# Owner Dashboard – Complete Implementation Guide

Purpose
- Add a role-scoped Owner Dashboard that mirrors the Admin Dashboard UI while strictly filtering data to the authenticated owner’s portfolio.
- Preserve Admin APIs and behavior. Introduce new Owner APIs with server-side owner scoping.

Assumptions
- Next.js App Router with pages under src/app.
- Existing Admin dashboard at src/app/(dashboard)/dashboard.
- Existing data access layer (e.g., Prisma/ORM) with buildings, units, tenants, payments, maintenance tables and an owners table.
- Owners authenticate separately from admins.

High-Level Architecture
- UI: src/app/(dashboard)/owner_dashboard mirrors admin structure (minus owners management), with navigation and fetches pointed to /api/owner/*.
- Auth: Separate owner login page and API. Owner session stored in a secure cookie, read by middleware and API routes.
- APIs: New /api/owner/* endpoints that apply owner scoping on all queries server-side. Admin APIs remain unchanged.

================================
1) Scaffold Owner Dashboard UI
================================

1.1 Copy Admin UI to Owner UI
- Command:
  cp -r src/app/(dashboard)/dashboard src/app/(dashboard)/owner_dashboard

1.2 Remove Admin-only sections from Owner UI
- Remove owners management page(s):
  rm -rf src/app/(dashboard)/owner_dashboard/owners

1.3 Update paths and navigation
- In all files under src/app/(dashboard)/owner_dashboard:
  - Change internal links from /dashboard/* to /owner_dashboard/*.
  - Remove the Owners menu item from Sidebar.
  - Update the Navbar to display the owner’s name and an Owner badge.

1.4 Suggested Owner dashboard sections
- Overview (page.jsx): KPIs and recent activity
- Buildings: src/app/(dashboard)/owner_dashboard/buildings
- Units: src/app/(dashboard)/owner_dashboard/units
- Tenants: src/app/(dashboard)/owner_dashboard/tenants
- Payments: src/app/(dashboard)/owner_dashboard/payments
- Maintenance: src/app/(dashboard)/owner_dashboard/maintenance
- Profile: src/app/(dashboard)/owner_dashboard/profile

Tip: Keep component names identical where possible to maximize reuse; only change data sources (API URLs) and owner-specific UI text.

====================================
2) Owner Authentication and Sessions
====================================

2.1 Create Owner Login Page
- Path: src/app/owner-login/page.jsx
- Behavior: Simple email/password form posts to /api/auth/owner/login.
- On success: set cookie via API response, redirect to /owner_dashboard.

2.2 Owner Login API
- Path: src/app/api/auth/owner/login/route.ts (or .js)
- Method: POST
- Request body: { email: string, password: string }
- Response: 200 with Set-Cookie establishing an owner session containing owner_id, owner_name, role: 'owner'. On failure: 401.
- Security: Use httpOnly, secure (in prod), sameSite=lax cookies. Signed or JWT.

2.3 Session format (example)
- Cookie name: owner_session
- Payload: { sub: <owner_id>, name: <owner_name>, role: 'owner', iat, exp }
- Signed HS256 JWT, or an opaque session ID referencing a server store. If using JWT, store the secret in env (OWNER_JWT_SECRET).

2.4 Logout
- Path: src/app/api/auth/owner/logout/route.ts
- Method: POST
- Clears the owner_session cookie.

===============================
3) Route Protection (Middleware)
===============================

3.1 Middleware responsibilities
- Block unauthenticated access to: /owner_dashboard and /api/owner/*.
- Parse and validate owner_session cookie; attach owner context to requests (e.g., via request headers or by re-reading cookie in route handlers).
- Redirect unauthenticated users to /owner-login.

3.2 Scope
- Protect these matchers: ['/owner_dashboard/:path*', '/api/owner/:path*']

3.3 Notes
- Keep admin middleware separate if it already exists. Do not conflate roles.
- Ensure no Owner routes rely on client-side checks only.

=====================================
4) Owner-Scoped API Endpoints (Server)
=====================================

All endpoints require a valid owner_session. Every query must enforce owner scoping server-side (no reliance on client-provided IDs).

4.1 Endpoints summary
- GET /api/owner/dashboard-stats
- CRUD /api/owner/buildings
- CRUD /api/owner/units
- CRUD /api/owner/tenants
- CRUD /api/owner/payments
- CRUD /api/owner/maintenance
- GET/PUT /api/owner/profile
- GET /api/owner/property-records (optional, if this exists for admin)

4.2 Filters and relationships
- buildings: where ownerId = session.owner_id
- units: where building.ownerId = session.owner_id (or unit.ownerId if modeled directly)
- tenants: where tenant.unit.building.ownerId = session.owner_id
- payments: where payment.unit.building.ownerId = session.owner_id
- maintenance: where request.unit.building.ownerId = session.owner_id (or buildingId path)

4.3 Example ORM patterns (Prisma-like pseudocode)
- Buildings: db.building.findMany({ where: { ownerId } })
- Units: db.unit.findMany({ where: { building: { ownerId } } })
- Tenants: db.tenant.findMany({ where: { unit: { building: { ownerId } } } })
- Payments: db.payment.findMany({ where: { unit: { building: { ownerId } } } })
- Maintenance: db.maintenance.findMany({ where: { unit: { building: { ownerId } } } })

4.4 Dashboard stats (example KPIs)
- totalBuildings, totalUnits, occupiedUnits, vacancyRate
- mtdRentCollected, ytdRentCollected, outstandingBalances
- openMaintenanceCount, avgResolutionTimeDays

4.5 Request/response contracts (examples)
- GET /api/owner/buildings
  - Response: 200 [{ id, name, address, unitCount, ... }]
- POST /api/owner/buildings
  - Body: { name, address, ... }
  - Response: 201 { id, ... }
- GET /api/owner/units?buildingId=...
  - Response: 200 [{ id, number, bedrooms, rent, tenantId, status }]
- GET /api/owner/tenants
  - Response: 200 [{ id, name, contact, unitId, balance }]
- GET /api/owner/payments?from=YYYY-MM-DD&to=YYYY-MM-DD
  - Response: 200 [{ id, tenantId, unitId, amount, date, method }]
- GET /api/owner/maintenance?status=open|in_progress|closed
  - Response: 200 [{ id, unitId, title, status, openedAt, closedAt }]

4.6 Validation and authorization
- Validate all input IDs belong to the authenticated owner before executing mutations.
- For mutations (POST/PUT/DELETE), reject if the targeted resource is not under the owner’s portfolio (prevent IDOR).

====================================
5) Frontend Integration (Owner UI)
====================================

5.1 Switch all fetches to Owner APIs
- Update fetch URLs:
  - /api/buildings        -> /api/owner/buildings
  - /api/units            -> /api/owner/units
  - /api/tenants          -> /api/owner/tenants
  - /api/payments         -> /api/owner/payments
  - /api/maintenance      -> /api/owner/maintenance
  - /api/dashboard-stats  -> /api/owner/dashboard-stats
  - property-records      -> /api/owner/property-records

5.2 Add credentials to requests
- Use fetch(url, { credentials: 'include' }) in client components or fetch API routes server-side passing cookies.

5.3 Navbar and Sidebar updates
- Navbar: display owner name from session (via a /api/owner/profile fetch or SSR session read).
- Sidebar: remove Owners section. Keep: Overview, Buildings, Units, Tenants, Payments, Maintenance, Profile.

5.4 Owner Profile
- Provide a simple profile page reading /api/owner/profile and allowing updates via PUT (name, phone, notification prefs, etc.).

5.5 Dashboard page (KPIs)
- Call /api/owner/dashboard-stats and render KPI cards and recent lists filtered for the owner only.

=============================
6) Security and Hardening
=============================

- Server-side ownership checks only; never trust IDs from the client.
- Use zod/yup or similar for input validation.
- Return 403 for authorization failures, 401 for missing/invalid sessions.
- Set cookies httpOnly, secure (in production), sameSite=lax, with short expirations and refresh.
- Rate-limit login and write endpoints.
- Log security-relevant events (logins, failed logins, forbidden access attempts).

=====================
7) Testing Strategy
=====================

7.1 Unit tests (API)
- Validate owner scoping for each endpoint using fixtures for owners A and B.
- Ensure create/update/delete are rejected when targeting non-owned entities.
- Verify filtering (e.g., payments by date, maintenance by status) remains scoped.

7.2 Component tests (UI)
- Sidebar: proper nav items, links point to /owner_dashboard/*.
- Pages: fetches call /api/owner/*.
- Profile: update flow calls PUT /api/owner/profile.

7.3 E2E scenarios
- Owner login success -> redirected to /owner_dashboard.
- Cross-owner access attempt -> 403 or filtered empty result.
- CRUD happy paths: create building/unit, assign tenant, record payment, open/close maintenance; all visible only to that owner.
- Logout clears session and blocks dashboard access.

=========================
8) Rollout Checklist
=========================

- [ ] Copy admin to owner_dashboard and remove owners section.
- [ ] Update internal links and navigation.
- [ ] Implement owner-login page and login/logout APIs.
- [ ] Add middleware to protect /owner_dashboard and /api/owner/*.
- [ ] Implement owner-scoped APIs with strict server-side filters.
- [ ] Wire up UI to use /api/owner/* and display owner identity.
- [ ] Add validation, error handling, and rate limits.
- [ ] Write tests per the testing strategy.
- [ ] Verify no admin data leaks into owner views.

=====================================
9) Operational Notes and Monitoring
=====================================

- Observability: add structured logs (request id, owner id, endpoint, latency, outcome).
- Metrics: requests by endpoint, error rates, auth failures, DB latency.
- Alerts: spikes in 401/403, 5xx on /api/owner/*, or unusual query volumes.

=====================================
Appendix A: Helpful Commands
=====================================

- Copy and prune:
  cp -r src/app/\(dashboard\)/dashboard src/app/\(dashboard\)/owner_dashboard
  rm -rf src/app/\(dashboard\)/owner_dashboard/owners

- Update links (example ripgrep + sed; review before applying):
  rg -l "\/dashboard\/" src/app/(dashboard)/owner_dashboard | xargs sed -i 's|/dashboard/|/owner_dashboard/|g'

- Verify no residual admin endpoints:
  rg "/api/(buildings|units|tenants|payments|maintenance|dashboard-stats)" src/app/(dashboard)/owner_dashboard

=====================================
Appendix B: Example Data Models (reference only)
=====================================

- owners: id, name, email, password_hash, phone, createdAt
- buildings: id, ownerId, name, address, createdAt
- units: id, buildingId, number, bedrooms, bathrooms, rent, status
- tenants: id, unitId, name, email, phone, balance
- payments: id, tenantId, unitId, amount, date, method, reference
- maintenance: id, unitId, title, description, status, openedAt, closedAt

Ownership rule of thumb: any resource must be reachable via a path that includes ownerId and that path must be validated on the server for every request.

End of document.