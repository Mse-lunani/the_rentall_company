import { sql, requireOwnerIdOr401 } from "../_common";
import { updateRow, deleteRow } from "../../../../lib/db";

export async function GET(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const buildingId = searchParams.get("building_id");
  const available = searchParams.get("available") === "true";
  const standalone = searchParams.get("standalone") === "true";
  const includePayments = searchParams.get("include_payments") === "true";
  const includeHistory = searchParams.get("include_history") === "true";

  try {
    if (id) {
      // Build dynamic WHERE conditions
      let whereConditions = [
        `u.id = ${Number(id)}`,
        `(u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})`
      ];
      
      const whereClause = sql.unsafe(`WHERE ${whereConditions.join(" AND ")}`);

      const [unit] = await sql`
        SELECT u.*,
               COALESCE(b.name, 'Standalone') as building_name,
               b.id as building_id,
               o.full_name as owner_name,
               o.id as owner_id,
               CASE WHEN tu.id IS NOT NULL THEN true ELSE false END as is_occupied,
               t.full_name as tenant_name,
               t.id as tenant_id,
               t.phone as tenant_phone,
               t.email as tenant_email
        FROM units u
        LEFT JOIN buildings b ON u.building_id = b.id
        LEFT JOIN owners o ON COALESCE(u.owner_id, b.owner_id) = o.id
        LEFT JOIN tenants_units tu ON u.id = tu.unit_id AND tu.occupancy_status = 'active'
        LEFT JOIN tenants t ON tu.tenant_id = t.id
        ${whereClause}
      `;

      if (!unit) return Response.json({ error: "Unit not found" }, { status: 404 });

      if (includePayments && unit.tenant_id) {
        const payments = await sql`
          SELECT p.*, tu.id as tenancy_id
          FROM payments p
          JOIN tenants_units tu ON p.tenancy_id = tu.id
          WHERE tu.tenant_id = ${unit.tenant_id} AND tu.unit_id = ${Number(id)}
          ORDER BY p.date_paid DESC
          LIMIT 10
        `;
        unit.recent_payments = payments;
      }

      if (includeHistory) {
        const history = await sql`
          SELECT tu.*, t.full_name as tenant_name
          FROM tenants_units tu
          JOIN tenants t ON tu.tenant_id = t.id
          WHERE tu.unit_id = ${Number(id)}
          ORDER BY tu.start_date DESC
        `;
        unit.tenancy_history = history;
      }

      return Response.json(unit);
    }

    // Build dynamic WHERE conditions for listing
    let whereConditions = [`(u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})`];
    
    if (available) {
      whereConditions.push(`tu.id IS NULL`);
    }

    if (standalone) {
      whereConditions.push(`u.building_id IS NULL`);
    }

    if (buildingId) {
      whereConditions.push(`u.building_id = ${Number(buildingId)}`);
    }

    const whereClause = sql.unsafe(`WHERE ${whereConditions.join(" AND ")}`);

    const units = await sql`
      SELECT u.*,
             COALESCE(b.name, 'Standalone') as building_name,
             b.id as building_id,
             o.full_name as owner_name,
             o.id as owner_id,
             CASE WHEN tu.id IS NOT NULL THEN true ELSE false END as is_occupied,
             t.full_name as tenant_name,
             t.id as tenant_id,
             t.phone as tenant_phone
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN owners o ON COALESCE(u.owner_id, b.owner_id) = o.id
      LEFT JOIN tenants_units tu ON u.id = tu.unit_id AND tu.occupancy_status = 'active'
      LEFT JOIN tenants t ON tu.tenant_id = t.id
      ${whereClause}
      ORDER BY COALESCE(b.name, 'Standalone'), u.name
    `;

    return Response.json(units);
  } catch (err) {
    console.error("GET /api/owner/units error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid unit ID" }, { status: 400 });
  }

  try {
    // Verify ownership
    const [existing] = await sql`
      SELECT u.id
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.id = ${Number(id)} AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    if (!existing) {
      return Response.json({ error: "Unit not found or not owned by this owner" }, { status: 403 });
    }

    const data = await request.json();
    await updateRow("units", data, { id: Number(id) });
    
    return Response.json({ success: true });
  } catch (err) {
    console.error("PUT /api/owner/units error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid unit ID" }, { status: 400 });
  }

  try {
    // Verify ownership
    const [existing] = await sql`
      SELECT u.id
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.id = ${Number(id)} AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    if (!existing) {
      return Response.json({ error: "Unit not found or not owned by this owner" }, { status: 403 });
    }

    // Check if unit has active tenant
    const [tenant] = await sql`
      SELECT id FROM tenants_units WHERE unit_id = ${Number(id)} AND occupancy_status = 'active'
    `;

    if (tenant) {
      return Response.json({ error: "Cannot delete unit with active tenant" }, { status: 400 });
    }

    await deleteRow("units", { id: Number(id) });
    
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/owner/units error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
