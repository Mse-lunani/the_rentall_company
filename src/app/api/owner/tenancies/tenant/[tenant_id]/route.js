import { requireOwnerIdOr401, sql } from "../../../_common.js";

export async function GET(req, { params }) {
  const { error, ownerId } = requireOwnerIdOr401(req);
  if (error) return error;

  try {
    const resolvedParams = await params;
    const tenantId = parseInt(resolvedParams.tenant_id);

    if (!tenantId) {
      return Response.json({ error: "Invalid tenant ID" }, { status: 400 });
    }

    // Get tenant basic info
    const [tenant] = await sql`
      SELECT t.id, t.full_name, t.phone, t.email, t.created_at
      FROM tenants t
      JOIN units u ON t.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE t.id = ${tenantId} AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    if (!tenant) {
      return Response.json({ error: "Tenant not found or not owned by this owner" }, { status: 404 });
    }

    // Get tenancy history
    const tenancy_history = await sql`
      SELECT 
        tu.id, tu.tenant_id, tu.unit_id, tu.start_date, tu.end_date,
        tu.occupancy_status, tu.termination_reason, tu.monthly_rent, 
        tu.deposit_paid, tu.notes, tu.created_at,
        u.name as unit_name, b.name as building_name,
        o.full_name as owner_name,
        COALESCE(tu.end_date, CURRENT_DATE) - tu.start_date as duration_days,
        COUNT(p.id) as payment_count,
        COALESCE(SUM(p.amount_paid), 0) as total_payments
      FROM tenants_units tu
      JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN owners o ON COALESCE(u.owner_id, b.owner_id) = o.id
      LEFT JOIN payments p ON p.tenancy_id = tu.id
      WHERE tu.tenant_id = ${tenantId} 
        AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
      GROUP BY tu.id, u.name, b.name, o.full_name
      ORDER BY tu.start_date DESC
    `;

    // Get statistics
    const [statistics] = await sql`
      SELECT 
        COUNT(tu.id) as total_tenancies,
        COUNT(tu.id) FILTER (WHERE tu.occupancy_status = 'active') as active_tenancies,
        COALESCE(SUM(p.amount_paid), 0) as total_payments_made,
        COALESCE(AVG(COALESCE(tu.end_date, CURRENT_DATE) - tu.start_date), 0) as average_tenancy_duration
      FROM tenants_units tu
      JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN payments p ON p.tenancy_id = tu.id
      WHERE tu.tenant_id = ${tenantId} 
        AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    // Get current active units
    const current_units = await sql`
      SELECT 
        tu.unit_id, tu.start_date, tu.monthly_rent,
        u.name as unit_name, b.name as building_name
      FROM tenants_units tu
      JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE tu.tenant_id = ${tenantId} 
        AND tu.occupancy_status = 'active'
        AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    return Response.json({
      tenant,
      tenancy_history,
      statistics: {
        ...statistics,
        current_units
      }
    });

  } catch (error) {
    console.error("GET /api/owner/tenancies/tenant/:id error:", error);
    return Response.json(
      { error: "Failed to fetch tenant history", details: error.message },
      { status: 500 }
    );
  }
}