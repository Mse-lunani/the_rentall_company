# Owner Dashboard Path Fixing Checklist

This document contains all paths in the owner_dashboard system that need verification for proper links and API endpoints.

## Main Dashboard

- [x] `/owner_dashboard` - Main dashboard page
  - [x] Verify all sidebar navigation links point to owner_dashboard routes
  - [x] Check all API calls use `/api/owner/*` endpoints
  - [x] Verify chart data comes from owner-specific APIs

## Property Management

- [x] `/owner_dashboard/property_entry` - Add new properties

  - [x] Verify form submission goes to `/api/owner/property-entry`
  - [x] Check redirect after success goes to `/owner_dashboard/property_records`
  - [x] Verify building dropdown uses `/api/owner/buildings`

- [ ] `/owner_dashboard/property_records` - View all properties

  - [ ] Check table loads data from `/api/owner/property-records`
  - [ ] Verify action buttons point to owner_dashboard routes
  - [ ] Test building delete uses `/api/owner/buildings?id=X`

- [ ] `/owner_dashboard/property_records/buildings/[id]` - View building details

  - [ ] Verify data loads from `/api/owner/buildings?id=X`
  - [ ] Check all unit action links point to owner_dashboard routes
  - [ ] Test navigation breadcrumbs

- [ ] `/owner_dashboard/property_records/buildings/edit/[id]` - Edit building

  - [ ] Verify form loads data from `/api/owner/buildings?id=X`
  - [ ] Check form submission goes to `/api/owner/buildings` (PUT)
  - [ ] Verify redirect after success

- [ ] `/owner_dashboard/property_records/units/edit/[id]` - Edit unit
  - [ ] Verify form loads data from `/api/owner/units?id=X`
  - [ ] Check form submission goes to `/api/owner/units` (PUT)
  - [ ] Verify redirect after success

## Unit Management

- [ ] `/owner_dashboard/units` - View all units

  - [ ] Check table loads data from `/api/owner/units`
  - [ ] Verify action buttons point to owner_dashboard routes
  - [ ] Test unit delete functionality

- [ ] `/owner_dashboard/units/standalone` - View standalone units
  - [ ] Check table loads data from `/api/owner/units?standalone=true`
  - [ ] Verify action buttons point to owner_dashboard routes

## Tenant Management

- [ ] `/owner_dashboard/tenants` - View all tenants

  - [ ] Check table loads data from `/api/owner/tenants`
  - [ ] Verify action buttons point to owner_dashboard routes
  - [ ] Test tenant delete functionality

- [ ] `/owner_dashboard/tenants/add` - Add new tenant

  - [ ] Verify unit dropdown loads from `/api/owner/units`
  - [ ] Check form submission goes to `/api/owner/tenants`
  - [ ] Verify redirect after success to `/owner_dashboard/tenants`

- [ ] `/owner_dashboard/tenants/[id]` - View tenant details

  - [ ] Verify data loads from `/api/owner/tenants?id=X`
  - [ ] Check all action links point to owner_dashboard routes
  - [ ] Test navigation and breadcrumbs

- [ ] `/owner_dashboard/tenants/edit/[id]` - Edit tenant

  - [ ] Verify form loads data from `/api/owner/tenants?id=X`
  - [ ] Check form submission goes to `/api/owner/tenants` (PUT)
  - [ ] Verify redirect after success

- [ ] `/owner_dashboard/tenants/[id]/move` - Move tenant to different unit
  - [ ] Verify available units load from `/api/owner/units?available=true`
  - [ ] Check move action uses proper API endpoint
  - [ ] Verify redirect after success

## Tenancy Management

- [ ] `/owner_dashboard/tenancies/tenant/[tenant_id]` - View tenant history
  - [ ] Verify data loads from `/api/owner/tenancies/tenant/[tenant_id]`
  - [ ] Check all related links point to owner_dashboard routes

## Payment Management

- [ ] `/owner_dashboard/payments` - View all payments

  - [ ] Check table loads data from `/api/owner/payments`
  - [ ] Verify action buttons point to owner_dashboard routes
  - [ ] Test payment delete functionality

- [ ] `/owner_dashboard/payments/add` - Add new payment

  - [ ] Verify tenant dropdown loads from `/api/owner/tenants`
  - [ ] Check form submission goes to `/api/owner/payments`
  - [ ] Verify redirect after success to `/owner_dashboard/payments`

- [ ] `/owner_dashboard/payments/edit/[id]` - Edit payment
  - [ ] Verify form loads data from `/api/owner/payments?id=X`
  - [ ] Check form submission goes to `/api/owner/payments` (PUT)
  - [ ] Verify redirect after success

## Maintenance Management

- [ ] `/owner_dashboard/maintenance` - View all maintenance requests

  - [ ] Check table loads data from `/api/owner/maintenance`
  - [ ] Verify action buttons point to owner_dashboard routes
  - [ ] Test maintenance delete functionality

- [ ] `/owner_dashboard/maintenance/add` - Add new maintenance request
  - [ ] Verify unit dropdown loads from `/api/owner/units`
  - [ ] Check form submission goes to `/api/owner/maintenance`
  - [ ] Verify redirect after success to `/owner_dashboard/maintenance`

## Profile Management

- [ ] `/owner_dashboard/profile` - View/edit profile
  - [ ] Verify profile data loads from `/api/owner/profile`
  - [ ] Check profile update goes to `/api/owner/profile` (PUT)
  - [ ] Verify password change uses proper endpoint
  - [ ] Test form validation and success messages

## Components (Check in all pages where used)

- [ ] `Sidebar.jsx` - Navigation sidebar

  - [ ] Verify all menu links point to `/owner_dashboard/*` routes
  - [ ] Check active state highlighting works correctly
  - [ ] Verify no admin-only menu items are present

- [ ] `Navbar.jsx` - Top navigation

  - [ ] Check owner profile loads from `/api/owner/profile`
  - [ ] Verify logout functionality works properly
  - [ ] Test dropdown menus and links

- [ ] `Footer.jsx` - Page footer
  - [ ] Verify all links are appropriate for owner context

## API Endpoints to Verify

All API calls should use `/api/owner/*` endpoints and include proper authentication:

- [ ] `/api/owner/profile` - Owner profile data
- [ ] `/api/owner/buildings` - Owner's buildings
- [ ] `/api/owner/units` - Owner's units
- [ ] `/api/owner/tenants` - Owner's tenants
- [ ] `/api/owner/payments` - Owner's payments
- [ ] `/api/owner/maintenance` - Owner's maintenance requests
- [ ] `/api/owner/property-entry` - Create new properties
- [ ] `/api/owner/property-records` - Property records data
- [ ] `/api/owner/tenancies/tenant/[id]` - Tenant history

## Testing Instructions

1. **Navigation Testing**: Click every link and button to ensure they work
2. **API Testing**: Use browser dev tools to verify API calls go to correct endpoints
3. **Form Testing**: Submit all forms and verify data is saved correctly
4. **Permission Testing**: Ensure owners can only see their own data
5. **Error Handling**: Test with invalid IDs and ensure proper error handling
6. **Redirect Testing**: Verify all redirects after actions go to correct pages

## Common Issues to Look For

- Links pointing to `/dashboard/*` instead of `/owner_dashboard/*`
- API calls going to admin endpoints instead of owner endpoints
- Missing authentication on API calls
- Incorrect redirects after form submissions
- Hardcoded admin-specific references
- Missing owner-specific data filtering
