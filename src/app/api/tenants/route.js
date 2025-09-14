import { insertRow, updateRow, deleteRow } from "../../../lib/db.js";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL);
export async function POST(req) {
  const body = await req.json();
  const { 
    full_name, 
    phone, 
    email, 
    unit_id, 
    start_date, 
    monthly_rent, 
    deposit_paid,
    lease_terms,
    notes
  } = body;

  if (!full_name || !phone || !unit_id) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Generate random password (1000-9999)
    const randomPassword = Math.floor(Math.random() * 9000) + 1000;
    const passwordHash = crypto.createHash("md5").update(randomPassword.toString()).digest("hex");

    // Begin transaction: Create both tenant and tenancy
    await sql`BEGIN`;

    try {
      // Create tenant record
      const [tenant] = await sql`
        INSERT INTO tenants (full_name, phone, email, password, password_text)
        VALUES (${full_name}, ${phone}, ${email || null}, ${passwordHash}, ${randomPassword.toString()})
        RETURNING *
      `;
      // Get unit details for rent amount
      const [unit] = await sql`
        SELECT rent_amount_kes, deposit_amount_kes FROM units WHERE id = ${unit_id}
      `;

      if (!unit) {
        await sql`ROLLBACK`;
        return Response.json({ error: "Unit not found" }, { status: 400 });
      }

      // Check if unit is already occupied
      const [existingTenancy] = await sql`
        SELECT id FROM tenants_units WHERE unit_id = ${unit_id} AND occupancy_status = 'active'
      `;

      if (existingTenancy) {
        await sql`ROLLBACK`;
        return Response.json({ error: "Unit is already occupied" }, { status: 400 });
      }

      // Create tenancy record
      const [tenancy] = await sql`
        INSERT INTO tenants_units (
          tenant_id, unit_id, start_date, occupancy_status, 
          monthly_rent, deposit_paid, lease_terms, notes
        ) VALUES (
          ${tenant.id}, 
          ${unit_id}, 
          ${start_date || new Date().toISOString().split('T')[0]}, 
          'active',
          ${monthly_rent || unit.rent_amount_kes}, 
          ${deposit_paid || unit.deposit_amount_kes}, 
          ${lease_terms || null}, 
          ${notes || null}
        ) RETURNING *
      `;

      await sql`COMMIT`;

      return Response.json({ 
        success: true, 
        tenant_id: tenant.id, 
        tenancy_id: tenancy.id,
        password: randomPassword,
        message: "Tenant and tenancy created successfully"
      });

    } catch (transactionError) {
      await sql`ROLLBACK`;
      throw transactionError;
    }

  } catch (error) {
    console.error("POST /api/tenants error:", error);
    return Response.json(
      { error: "Failed to add tenant", details: error.message },
      { status: 500 }
    );
  }
}
// get tenants - Updated for Phase 2: Parallel support for old and new structure
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const include_history = searchParams.get("include_history") === "true";
  
  if (!id || isNaN(id)) {
    try {
      // Get all tenants with current tenancy information
      const tenants = await sql`
        SELECT 
          t.id, 
          t.full_name, 
          t.phone, 
          t.email, 
          t.password_text, 
          t.created_at,
          tu.unit_id,
          u.name as unit_name,
          u.name as unit_number,
          u.rent_amount_kes,
          b.name AS building_name,
          tu.start_date,
          tu.occupancy_status,
          tu.monthly_rent as tenancy_rent,
          tu.id as tenancy_id,
          -- Tenancy status
          CASE 
            WHEN tu.id IS NOT NULL THEN 'HAS_ACTIVE_TENANCY'
            ELSE 'NO_UNIT'
          END as tenancy_status
        FROM tenants t
        LEFT JOIN tenants_units tu ON t.id = tu.tenant_id AND tu.occupancy_status = 'active'
        LEFT JOIN units u ON tu.unit_id = u.id
        LEFT JOIN buildings b ON u.building_id = b.id
        ORDER BY t.full_name
      `;

      return Response.json(tenants);
    } catch (error) {
      console.error("GET /api/tenants error:", error);
      return Response.json(
        { error: "Failed to fetch tenants", details: error.message },
        { status: 500 }
      );
    }
  } else {
    // Get single tenant with enhanced details
    try {
      const [tenant] = await sql`
        SELECT 
          t.id, 
          t.full_name, 
          t.phone, 
          t.email, 
          t.password_text,
          t.created_at,
          tu.unit_id,
          tu.id as current_tenancy_id,
          u.name as unit_number,
          u.id as unit_id,
          u.name as unit_name,
          u.rent_amount_kes,
          b.name AS building_name,
          tu.start_date,
          tu.occupancy_status,
          tu.monthly_rent as tenancy_rent,
          tu.deposit_paid,
          tu.lease_terms,
          tu.notes as tenancy_notes
        FROM tenants t
        LEFT JOIN tenants_units tu ON t.id = tu.tenant_id AND tu.occupancy_status = 'active'
        LEFT JOIN units u ON tu.unit_id = u.id
        LEFT JOIN buildings b ON u.building_id = b.id
        WHERE t.id = ${Number(id)}
      `;

      if (!tenant) {
        return Response.json({ error: "Tenant not found" }, { status: 404 });
      }

      // If history is requested, get all tenancies
      if (include_history) {
        const tenancyHistory = await sql`
          SELECT 
            tu.*,
            u.name as unit_name,
            b.name as building_name,
            (CASE WHEN tu.end_date IS NULL THEN CURRENT_DATE ELSE tu.end_date END - tu.start_date) as duration_days
          FROM tenants_units tu
          JOIN units u ON tu.unit_id = u.id
          JOIN buildings b ON u.building_id = b.id
          WHERE tu.tenant_id = ${Number(id)}
          ORDER BY tu.start_date DESC
        `;

        tenant.tenancy_history = tenancyHistory;
      }

      return Response.json(tenant);
    } catch (error) {
      console.error("GET /api/tenants error:", error);
      return Response.json(
        { error: "Failed to fetch tenant", details: error.message },
        { status: 500 }
      );
    }
  }
}
export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid tenant ID" }, { status: 400 });
  }

  const data = await req.json();

  try {
    // Check if password regeneration is requested
    if (data.regenerate_password) {
      const randomPassword = Math.floor(Math.random() * 9000) + 1000;
      const passwordHash = crypto.createHash("md5").update(randomPassword.toString()).digest("hex");
      
      data.password = passwordHash;
      data.password_text = randomPassword.toString();
      delete data.regenerate_password;
      
      await updateRow("tenants", data, { id: Number(id) });
      return Response.json({ success: true, password: randomPassword });
    }
    
    await updateRow("tenants", data, { id: Number(id) });
    return Response.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/tenants error:", err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid tenant ID" }, { status: 400 });
  }

  try {
    const units = await sql`
        SELECT COUNT(*)::int AS count
        FROM payments
        WHERE tenant_id = ${Number(id)}
      `;

    if (units[0]?.count > 0) {
      return Response.json(
        { error: "tenant has records of payment. Cannot delete." },
        { status: 400 }
      );
    }
    await deleteRow("tenants", { id: Number(id) });

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/tenants error:", err);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
