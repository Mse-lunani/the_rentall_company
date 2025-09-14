import { sql, requireOwnerIdOr401 } from "../_common";

export async function GET(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenant_id");

  try {
    const rows = await sql`
      SELECT p.*, t.full_name, u.name as unit_name, b.name as building_name
      FROM payments p
      JOIN tenants t ON p.tenant_id = t.id
      LEFT JOIN units u ON p.unit_id = u.id OR t.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
      ${tenantId ? sql.unsafe(`AND t.id = ${Number(tenantId)}`) : sql``}
      ORDER BY p.date_paid DESC, p.created_at DESC
    `;
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/owner/payments error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
