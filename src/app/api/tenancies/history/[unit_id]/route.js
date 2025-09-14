import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// GET /api/tenancies/history/:unit_id - Get unit tenancy history
export async function GET(req, { params }) {
  try {
    const unitId = params.unit_id;

    if (!unitId || isNaN(unitId)) {
      return Response.json({ 
        error: "Invalid unit ID" 
      }, { status: 400 });
    }

    // Get complete tenancy history for the unit
    const tenancyHistory = await sql`
      SELECT 
        tu.*,
        t.full_name as tenant_name,
        t.phone as tenant_phone,
        t.email as tenant_email,
        u.name as unit_name,
        b.name as building_name,
        -- Calculate tenancy duration
        CASE 
          WHEN tu.end_date IS NULL THEN 
            EXTRACT(days FROM (CURRENT_DATE - tu.start_date))
          ELSE 
            EXTRACT(days FROM (tu.end_date - tu.start_date))
        END as duration_days,
        -- Payment summary for this tenancy
        COALESCE(p.payment_count, 0) as payment_count,
        COALESCE(p.total_payments, 0) as total_payments
      FROM tenants_units tu
      JOIN tenants t ON tu.tenant_id = t.id
      JOIN units u ON tu.unit_id = u.id
      JOIN buildings b ON u.building_id = b.id
      LEFT JOIN (
        SELECT 
          tenancy_id,
          COUNT(*) as payment_count,
          SUM(amount_paid) as total_payments
        FROM payments 
        WHERE tenancy_id IS NOT NULL
        GROUP BY tenancy_id
      ) p ON tu.id = p.tenancy_id
      WHERE tu.unit_id = ${unitId}
      ORDER BY tu.start_date DESC
    `;

    // Get unit details
    const [unitDetails] = await sql`
      SELECT 
        u.*,
        b.name as building_name,
        o.full_name as owner_name
      FROM units u
      JOIN buildings b ON u.building_id = b.id
      LEFT JOIN owners o ON u.owner_id = o.id
      WHERE u.id = ${unitId}
    `;

    if (!unitDetails) {
      return Response.json({ 
        error: "Unit not found" 
      }, { status: 404 });
    }

    // Calculate unit statistics
    const stats = {
      total_tenancies: tenancyHistory.length,
      active_tenancies: tenancyHistory.filter(t => t.occupancy_status === 'active').length,
      terminated_tenancies: tenancyHistory.filter(t => t.occupancy_status === 'terminated').length,
      total_revenue: tenancyHistory.reduce((sum, t) => sum + Number(t.total_payments), 0),
      average_tenancy_duration: tenancyHistory.length > 0 
        ? Math.round(tenancyHistory.reduce((sum, t) => sum + Number(t.duration_days), 0) / tenancyHistory.length)
        : 0,
      termination_reasons: tenancyHistory
        .filter(t => t.termination_reason)
        .reduce((acc, t) => {
          acc[t.termination_reason] = (acc[t.termination_reason] || 0) + 1;
          return acc;
        }, {})
    };

    return Response.json({
      unit: unitDetails,
      tenancy_history: tenancyHistory,
      statistics: stats
    });

  } catch (error) {
    console.error("GET /api/tenancies/history/:unit_id error:", error);
    return Response.json(
      { error: "Failed to fetch unit tenancy history", details: error.message },
      { status: 500 }
    );
  }
}