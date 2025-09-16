import { sql, requireTenantIdOr401 } from "../_common";

export async function GET(request) {
  const { error, tenantId } = requireTenantIdOr401(request);
  if (error) return error;

  try {
    // Get tenant basic information
    const [tenant] = await sql`
      SELECT id, full_name, phone, email, created_at
      FROM tenants
      WHERE id = ${tenantId}
    `;

    if (!tenant) {
      return Response.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get all tenancy history for this tenant
    const tenancy_history = await sql`
      SELECT
        tu.*,
        u.name as unit_name,
        u.rent_amount_kes,
        b.name as building_name,
        o.full_name as owner_name,
        (CASE WHEN tu.end_date IS NULL THEN CURRENT_DATE ELSE tu.end_date END - tu.start_date) as duration_days,
        COUNT(p.id) as payment_count,
        COALESCE(SUM(p.amount_paid), 0) as total_payments
      FROM tenants_units tu
      JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN owners o ON COALESCE(u.owner_id, b.owner_id) = o.id
      LEFT JOIN payments p ON tu.id = p.tenancy_id
      WHERE tu.tenant_id = ${tenantId}
      GROUP BY tu.id, u.name, u.rent_amount_kes, b.name, o.full_name
      ORDER BY tu.start_date DESC
    `;

    // Calculate statistics
    const statistics = {
      total_tenancies: tenancy_history.length,
      active_tenancies: tenancy_history.filter(t => t.occupancy_status === 'active').length,
      total_payments_made: tenancy_history.reduce((sum, t) => sum + Number(t.total_payments), 0),
      average_tenancy_duration: tenancy_history.length > 0
        ? Math.round(tenancy_history.reduce((sum, t) => sum + Number(t.duration_days), 0) / tenancy_history.length)
        : 0,
      current_units: tenancy_history
        .filter(t => t.occupancy_status === 'active')
        .map(t => ({
          unit_name: t.unit_name,
          building_name: t.building_name,
          monthly_rent: t.monthly_rent,
          start_date: t.start_date
        }))
    };

    return Response.json({
      tenant,
      tenancy_history,
      statistics
    });

  } catch (err) {
    console.error("GET /api/tenants_apis/tenancies error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}