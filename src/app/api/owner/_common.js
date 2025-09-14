import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";

export function getOwnerIdFromSession() {
  const cookieStore = cookies();
  const ownerSession = cookieStore.get("owner_session");
  if (!ownerSession) return null;
  const ownerId = parseInt(ownerSession.value, 10);
  return Number.isFinite(ownerId) ? ownerId : null;
}

export function requireOwnerIdOr401(request) {
  const ownerId = getOwnerIdFromSession();
  if (!ownerId) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }), ownerId: null };
  }
  return { error: null, ownerId };
}

export const sql = neon(process.env.DATABASE_URL);
