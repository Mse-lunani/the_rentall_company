import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";

export function getTenantIdFromSession() {
  const cookieStore = cookies();
  const tenantSession = cookieStore.get("tenant_session");
  if (!tenantSession) return null;
  const tenantId = parseInt(tenantSession.value, 10);
  return Number.isFinite(tenantId) ? tenantId : null;
}

export function requireTenantIdOr401(request) {
  const tenantId = getTenantIdFromSession();
  if (!tenantId) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      tenantId: null,
    };
  }
  return { error: null, tenantId };
}

export const sql = neon(process.env.DATABASE_URL);