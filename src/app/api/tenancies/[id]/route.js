import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// PUT /api/tenancies/:id/update - Update tenancy details
export async function PUT(req, { params }) {
  try {
    const tenancyId = params.id;
    const body = await req.json();
    const { 
      monthly_rent, 
      deposit_paid,
      lease_terms, 
      notes 
    } = body;

    // Check if tenancy exists
    const [existingTenancy] = await sql`
      SELECT * FROM tenants_units WHERE id = ${tenancyId}
    `;

    if (!existingTenancy) {
      return Response.json({ 
        error: "Tenancy not found" 
      }, { status: 404 });
    }

    // Update tenancy
    const [updatedTenancy] = await sql`
      UPDATE tenants_units SET
        monthly_rent = COALESCE(${monthly_rent || null}, monthly_rent),
        deposit_paid = COALESCE(${deposit_paid || null}, deposit_paid),
        lease_terms = COALESCE(${lease_terms || null}, lease_terms),
        notes = COALESCE(${notes || null}, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${tenancyId}
      RETURNING *
    `;

    return Response.json({ 
      success: true, 
      tenancy: updatedTenancy,
      message: "Tenancy updated successfully" 
    });

  } catch (error) {
    console.error("PUT /api/tenancies/:id/update error:", error);
    return Response.json(
      { error: "Failed to update tenancy", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/tenancies/:id - Get single tenancy details
export async function GET(req, { params }) {
  try {
    const tenancyId = params.id;

    const [tenancy] = await sql`
      SELECT 
        tu.*,
        t.full_name as tenant_name,
        t.phone as tenant_phone,
        t.email as tenant_email,
        u.name as unit_name,
        u.bedrooms,
        u.bathrooms,
        u.space_sqm,
        b.name as building_name,
        o.full_name as owner_name,
        -- Calculate duration
        CASE 
          WHEN tu.end_date IS NULL THEN 
            EXTRACT(days FROM (CURRENT_DATE - tu.start_date))
          ELSE 
            EXTRACT(days FROM (tu.end_date - tu.start_date))
        END as duration_days,
        -- Payment summary
        COALESCE(p.payment_count, 0) as payment_count,
        COALESCE(p.total_payments, 0) as total_payments,
        COALESCE(p.last_payment_date, NULL) as last_payment_date
      FROM tenants_units tu
      JOIN tenants t ON tu.tenant_id = t.id
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
      WHERE tu.id = ${tenancyId}
    `;

    if (!tenancy) {
      return Response.json({ 
        error: "Tenancy not found" 
      }, { status: 404 });
    }

    return Response.json(tenancy);

  } catch (error) {
    console.error("GET /api/tenancies/:id error:", error);
    return Response.json(
      { error: "Failed to fetch tenancy details", details: error.message },
      { status: 500 }
    );
  }
}