import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// GET /api/tenancies/tenant/:tenant_id - Get tenant's all tenancies
export async function GET(req, { params }) {
  try {
    const tenantId = params.tenant_id;

    if (!tenantId || isNaN(tenantId)) {
      return Response.json({ 
        error: "Invalid tenant ID" 
      }, { status: 400 });
    }

    // Get complete tenancy history for the tenant
    const tenantTenancies = await sql`
      SELECT 
        tu.*,
        u.name as unit_name,
        u.bedrooms,
        u.bathrooms,
        u.space_sqm,
        b.name as building_name,
        o.full_name as owner_name,
        -- Calculate tenancy duration
        CASE 
          WHEN tu.end_date IS NULL THEN 
            (CURRENT_DATE - tu.start_date)::integer
          ELSE 
            (tu.end_date - tu.start_date)::integer
        END as duration_days,
        -- Payment summary for this tenancy
        COALESCE(p.payment_count, 0) as payment_count,
        COALESCE(p.total_payments, 0) as total_payments,
        COALESCE(p.last_payment_date, NULL) as last_payment_date
      FROM tenants_units tu
      JOIN units u ON tu.unit_id = u.id
      JOIN buildings b ON u.building_id = b.id
      LEFT JOIN owners o ON u.owner_id = o.id
      LEFT JOIN (
        SELECT 
          tenancy_id,
          COUNT(*) as payment_count,
          SUM(amount_paid) as total_payments,
          MAX(date_paid) as last_payment_date
        FROM payments 
        WHERE tenancy_id IS NOT NULL
        GROUP BY tenancy_id
      ) p ON tu.id = p.tenancy_id
      WHERE tu.tenant_id = ${tenantId}
      ORDER BY tu.start_date DESC
    `;

    // Get tenant details
    const [tenantDetails] = await sql`
      SELECT 
        id,
        full_name,
        phone,
        email,
        created_at
      FROM tenants
      WHERE id = ${tenantId}
    `;

    if (!tenantDetails) {
      return Response.json({ 
        error: "Tenant not found" 
      }, { status: 404 });
    }

    // Calculate tenant statistics
    const stats = {
      total_tenancies: tenantTenancies.length,
      active_tenancies: tenantTenancies.filter(t => t.occupancy_status === 'active').length,
      completed_tenancies: tenantTenancies.filter(t => t.occupancy_status === 'terminated').length,
      total_payments_made: tenantTenancies.reduce((sum, t) => sum + Number(t.total_payments), 0),
      total_rent_paid: tenantTenancies.reduce((sum, t) => sum + Number(t.total_payments), 0),
      average_tenancy_duration: tenantTenancies.length > 0 
        ? Math.round(tenantTenancies.reduce((sum, t) => sum + Number(t.duration_days), 0) / tenantTenancies.length)
        : 0,
      properties_lived_in: tenantTenancies.length,
      current_units: tenantTenancies.filter(t => t.occupancy_status === 'active').map(t => ({
        unit_name: t.unit_name,
        building_name: t.building_name,
        monthly_rent: t.monthly_rent,
        start_date: t.start_date
      }))
    };

    return Response.json({
      tenant: tenantDetails,
      tenancy_history: tenantTenancies,
      statistics: stats
    });

  } catch (error) {
    console.error("GET /api/tenancies/tenant/:tenant_id error:", error);
    return Response.json(
      { error: "Failed to fetch tenant tenancy history", details: error.message },
      { status: 500 }
    );
  }
}