import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  const body = await request.json();

  const { 
    tenant_type,
    existing_tenant_id,
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

  // Validation based on tenant type
  if (tenant_type === "existing") {
    if (!existing_tenant_id || !unit_id) {
      return Response.json({ error: "Missing required fields: existing_tenant_id, unit_id" }, { status: 400 });
    }
  } else {
    if (!full_name || !phone || !unit_id) {
      return Response.json({ error: "Missing required fields: full_name, phone, unit_id" }, { status: 400 });
    }
  }

  try {
    // Begin transaction
    await sql`BEGIN`;

    try {
      let tenant;
      let randomPassword = null;

      if (tenant_type === "existing") {
        // Use existing tenant
        const [existingTenant] = await sql`
          SELECT * FROM tenants WHERE id = ${existing_tenant_id}
        `;

        if (!existingTenant) {
          await sql`ROLLBACK`;
          return Response.json({ error: "Tenant not found" }, { status: 400 });
        }

        

        tenant = existingTenant;
      } else {
        // Create new tenant
        randomPassword = Math.floor(Math.random() * 9000) + 1000;
        const passwordHash = crypto.createHash("md5").update(randomPassword.toString()).digest("hex");

        const [newTenant] = await sql`
          INSERT INTO tenants (full_name, phone, email, password, password_text)
          VALUES (${full_name}, ${phone}, ${email || null}, ${passwordHash}, ${randomPassword.toString()})
          RETURNING *
        `;
        tenant = newTenant;
      }

      // Get unit details for rent amount
      const [unit] = await sql`
        SELECT rent_amount_kes, deposit_amount_kes FROM units WHERE id = ${unit_id}
      `;

      if (!unit) {
        await sql`ROLLBACK`;
        return Response.json({ error: "Unit not found" }, { status: 400 });
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

      const response = { 
        success: true, 
        tenant_id: tenant.id, 
        tenancy_id: tenancy.id,
        message: tenant_type === "existing" ? "Existing tenant assigned to unit successfully" : "New tenant created and assigned to unit successfully"
      };

      // Only include password for new tenants
      if (tenant_type === "new" && randomPassword) {
        response.password = randomPassword;
      }

      return Response.json(response);

    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }

  } catch (error) {
    console.error("POST /api/tenant-assignment error:", error);
    return Response.json(
      { error: "Failed to assign tenant to unit", details: error.message },
      { status: 500 }
    );
  }
}