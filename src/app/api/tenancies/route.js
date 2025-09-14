import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// POST /api/tenancies - Start new tenancy
export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      tenant_id, 
      unit_id, 
      start_date, 
      monthly_rent, 
      deposit_paid, 
      lease_terms, 
      notes 
    } = body;

    if (!tenant_id || !unit_id || !start_date || !monthly_rent) {
      return Response.json({ 
        error: "Missing required fields: tenant_id, unit_id, start_date, monthly_rent" 
      }, { status: 400 });
    }

    // Check if unit is already occupied
    const existingTenancy = await sql`
      SELECT id FROM tenants_units 
      WHERE unit_id = ${unit_id} AND occupancy_status = 'active'
    `;

    if (existingTenancy.length > 0) {
      return Response.json({ 
        error: "Unit is already occupied by another tenant" 
      }, { status: 400 });
    }

    // Create new tenancy
    const [tenancy] = await sql`
      INSERT INTO tenants_units (
        tenant_id, unit_id, start_date, occupancy_status, 
        monthly_rent, deposit_paid, lease_terms, notes
      ) VALUES (
        ${tenant_id}, ${unit_id}, ${start_date}, 'active',
        ${monthly_rent}, ${deposit_paid || null}, ${lease_terms || null}, ${notes || null}
      ) RETURNING *
    `;

    return Response.json({ 
      success: true, 
      tenancy: tenancy,
      message: "Tenancy created successfully" 
    });

  } catch (error) {
    console.error("POST /api/tenancies error:", error);
    return Response.json(
      { error: "Failed to create tenancy", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/tenancies - Get all tenancies with optional filters
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant_id = searchParams.get("tenant_id");
    const unit_id = searchParams.get("unit_id");
    const status = searchParams.get("status") || "active";

    let tenancies;
    
    if (tenant_id && unit_id && status) {
      tenancies = await sql`
        SELECT 
          tu.*,
          t.full_name as tenant_name,
          t.phone as tenant_phone,
          t.email as tenant_email,
          u.name as unit_name,
          b.name as building_name
        FROM tenants_units tu
        JOIN tenants t ON tu.tenant_id = t.id
        JOIN units u ON tu.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        WHERE tu.tenant_id = ${tenant_id} AND tu.unit_id = ${unit_id} AND tu.occupancy_status = ${status}
        ORDER BY tu.start_date DESC
      `;
    } else if (tenant_id && status) {
      tenancies = await sql`
        SELECT 
          tu.*,
          t.full_name as tenant_name,
          t.phone as tenant_phone,
          t.email as tenant_email,
          u.name as unit_name,
          b.name as building_name
        FROM tenants_units tu
        JOIN tenants t ON tu.tenant_id = t.id
        JOIN units u ON tu.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        WHERE tu.tenant_id = ${tenant_id} AND tu.occupancy_status = ${status}
        ORDER BY tu.start_date DESC
      `;
    } else if (unit_id && status) {
      tenancies = await sql`
        SELECT 
          tu.*,
          t.full_name as tenant_name,
          t.phone as tenant_phone,
          t.email as tenant_email,
          u.name as unit_name,
          b.name as building_name
        FROM tenants_units tu
        JOIN tenants t ON tu.tenant_id = t.id
        JOIN units u ON tu.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        WHERE tu.unit_id = ${unit_id} AND tu.occupancy_status = ${status}
        ORDER BY tu.start_date DESC
      `;
    } else if (tenant_id) {
      tenancies = await sql`
        SELECT 
          tu.*,
          t.full_name as tenant_name,
          t.phone as tenant_phone,
          t.email as tenant_email,
          u.name as unit_name,
          b.name as building_name
        FROM tenants_units tu
        JOIN tenants t ON tu.tenant_id = t.id
        JOIN units u ON tu.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        WHERE tu.tenant_id = ${tenant_id}
        ORDER BY tu.start_date DESC
      `;
    } else if (unit_id) {
      tenancies = await sql`
        SELECT 
          tu.*,
          t.full_name as tenant_name,
          t.phone as tenant_phone,
          t.email as tenant_email,
          u.name as unit_name,
          b.name as building_name
        FROM tenants_units tu
        JOIN tenants t ON tu.tenant_id = t.id
        JOIN units u ON tu.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        WHERE tu.unit_id = ${unit_id}
        ORDER BY tu.start_date DESC
      `;
    } else if (status) {
      tenancies = await sql`
        SELECT 
          tu.*,
          t.full_name as tenant_name,
          t.phone as tenant_phone,
          t.email as tenant_email,
          u.name as unit_name,
          b.name as building_name
        FROM tenants_units tu
        JOIN tenants t ON tu.tenant_id = t.id
        JOIN units u ON tu.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        WHERE tu.occupancy_status = ${status}
        ORDER BY tu.start_date DESC
      `;
    } else {
      tenancies = await sql`
        SELECT 
          tu.*,
          t.full_name as tenant_name,
          t.phone as tenant_phone,
          t.email as tenant_email,
          u.name as unit_name,
          b.name as building_name
        FROM tenants_units tu
        JOIN tenants t ON tu.tenant_id = t.id
        JOIN units u ON tu.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        ORDER BY tu.start_date DESC
      `;
    }
    return Response.json(tenancies);

  } catch (error) {
    console.error("GET /api/tenancies error:", error);
    return Response.json(
      { error: "Failed to fetch tenancies", details: error.message },
      { status: 500 }
    );
  }
}