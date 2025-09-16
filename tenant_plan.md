create a tenant dashboard folder in src/app/(dashboard)/ called tenant_dashboard so that it will be src/app/(dashboard)/tenant_dashboard
copy over relevant folders and files from src/app/(dashboard)/dashboard
since its tenants we shall be showing records but not really creating anything so we shall show tenancy and we copy that from src/app/(dashboard)/dashboard/tenancies/tenant/[tenant_id]/page.jsx that can be like the index of the dashboard. however the tenant won't have options to move or terminate
we shall also show his payments in a table and show expected payment and when due : by default its just 5th of every month.
for apis we shall create a folder in src/app/api called tenants_apis so it will be src/app/api/tenants_apis
the apis will follow the example of src/app/api/tenancies/route.js
for login create a login page in src/app/(auth)/ ccalled src/app/(auth)/tenant_login and follow example of admin login in src/app/(auth)/login
use src/app/api/auth to add an api for login you call follow owner login example in src/app/api/auth/owner
