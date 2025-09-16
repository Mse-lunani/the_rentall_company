import { requireOwnerIdOr401, sql } from "../_common.js";
import crypto from "crypto";

export async function POST(request) {
  const { error, ownerId } = requireOwnerIdOr401();
  if (error) return error;

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
    // Verify the unit belongs to the authenticated owner
    const [unit] = await sql`
      SELECT u.rent_amount_kes, u.deposit_amount_kes, b.owner_id
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.id = ${unit_id}
    `;

    if (!unit) {
      return Response.json({ error: "Unit not found" }, { status: 400 });
    }

    // For units without buildings (standalone), the unit owner should be checked differently
    // Let's check if this unit belongs to this owner through buildings or direct ownership
    const unitOwnershipCheck = await sql`
      SELECT 1
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.id = ${unit_id}
      AND (b.owner_id = ${ownerId} OR (b.owner_id IS NULL AND u.owner_id = ${ownerId}))
    `;

    if (unitOwnershipCheck.length === 0) {
      return Response.json({ error: "You don't have permission to assign tenants to this unit" }, { status: 403 });
    }

    // Begin transaction
    await sql`BEGIN`;

    try {
      let tenant;
      let randomPassword = null;

      if (tenant_type === "existing") {
        // Verify the existing tenant belongs to the owner's properties
        const [existingTenant] = await sql`
          SELECT DISTINCT t.*
          FROM tenants t
          JOIN tenants_units tu ON t.id = tu.tenant_id
          JOIN units u ON tu.unit_id = u.id
          LEFT JOIN buildings b ON u.building_id = b.id
          WHERE t.id = ${existing_tenant_id}
          AND (b.owner_id = ${ownerId} OR (b.owner_id IS NULL AND u.owner_id = ${ownerId}))
        `;

        if (!existingTenant) {
          await sql`ROLLBACK`;
          return Response.json({ error: "Tenant not found or you don't have permission to assign this tenant" }, { status: 403 });
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
    console.error("POST /api/owner/tenant-assignment error:", error);
    return Response.json(
      { error: "Failed to assign tenant to unit", details: error.message },
      { status: 500 }
    );
  }
}