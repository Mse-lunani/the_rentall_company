import { sql, requireOwnerIdOr401 } from "../_common";
import { updateRow, deleteRow } from "../../../../lib/db";

export async function GET(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const active = searchParams.get("active") === "true";
  const buildingId = searchParams.get("building_id");
  const includePayments = searchParams.get("include_payments") === "true";
  const includeHistory = searchParams.get("include_history") === "true";

  try {
    if (id) {
      // Build dynamic WHERE conditions
      let whereConditions = [
        `t.id = ${Number(id)}`,
        `(u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})`
      ];
      
      const whereClause = sql.unsafe(`WHERE ${whereConditions.join(" AND ")}`);

      const [tenant] = await sql`
        SELECT t.*,
               u.id as unit_id,
               u.name as unit_name,
               u.rent_amount_kes,
               u.deposit_amount_kes,
               b.id as building_id,
               b.name as building_name,
               o.full_name as owner_name,
               tu.start_date,
               tu.end_date,
               tu.monthly_rent,
               tu.deposit_paid,
               tu.occupancy_status
        FROM tenants t
        LEFT JOIN units u ON t.unit_id = u.id
        LEFT JOIN buildings b ON u.building_id = b.id
        LEFT JOIN owners o ON COALESCE(u.owner_id, b.owner_id) = o.id
        LEFT JOIN tenants_units tu ON t.id = tu.tenant_id AND u.id = tu.unit_id AND tu.occupancy_status = 'active'
        ${whereClause}
      `;

      if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });

      if (includePayments) {
        const payments = await sql`
          SELECT p.*, tu.id as tenancy_id, u.name as unit_name
          FROM payments p
          JOIN tenants_units tu ON p.tenancy_id = tu.id
          JOIN units u ON tu.unit_id = u.id
          LEFT JOIN buildings b ON u.building_id = b.id
          WHERE tu.tenant_id = ${Number(id)} 
            AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
          ORDER BY p.date_paid DESC
          LIMIT 20
        `;
        tenant.payments = payments;
      }

      if (includeHistory) {
        const history = await sql`
          SELECT tu.*, u.name as unit_name, b.name as building_name
          FROM tenants_units tu
          JOIN units u ON tu.unit_id = u.id
          LEFT JOIN buildings b ON u.building_id = b.id
          WHERE tu.tenant_id = ${Number(id)} 
            AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
          ORDER BY tu.start_date DESC
        `;
        tenant.tenancy_history = history;
      }

      return Response.json(tenant);
    }

    // Build dynamic WHERE conditions for listing
    let whereConditions = [`(u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})`];
    
    if (active) {
      whereConditions.push(`tu.occupancy_status = 'active'`);
    }

    if (buildingId) {
      whereConditions.push(`b.id = ${Number(buildingId)}`);
    }

    const whereClause = sql.unsafe(`WHERE ${whereConditions.join(" AND ")}`);

    const tenants = await sql`
      SELECT t.*,
             u.id as unit_id,
             u.name as unit_name,
             u.rent_amount_kes,
             b.id as building_id,
             b.name as building_name,
             o.full_name as owner_name,
             tu.start_date,
             tu.monthly_rent,
             tu.deposit_paid,
             tu.occupancy_status,
             COUNT(p.id) as payment_count,
             COALESCE(SUM(p.amount_paid), 0) as total_payments,
             MAX(p.date_paid) as last_payment_date
      FROM tenants t
      LEFT JOIN units u ON t.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN owners o ON COALESCE(u.owner_id, b.owner_id) = o.id
      LEFT JOIN tenants_units tu ON t.id = tu.tenant_id AND u.id = tu.unit_id
      LEFT JOIN payments p ON tu.id = p.tenancy_id
      ${whereClause}
      GROUP BY t.id, u.id, u.name, u.rent_amount_kes, b.id, b.name, o.full_name, 
               tu.start_date, tu.monthly_rent, tu.deposit_paid, tu.occupancy_status
      ORDER BY t.full_name
    `;

    return Response.json(tenants);
  } catch (err) {
    console.error("GET /api/owner/tenants error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid tenant ID" }, { status: 400 });
  }

  try {
    // Verify ownership
    const [existing] = await sql`
      SELECT t.id
      FROM tenants t
      LEFT JOIN units u ON t.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE t.id = ${Number(id)} AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    if (!existing) {
      return Response.json({ error: "Tenant not found or not owned by this owner" }, { status: 403 });
    }

    const data = await request.json();
    await updateRow("tenants", data, { id: Number(id) });
    
    return Response.json({ success: true });
  } catch (err) {
    console.error("PUT /api/owner/tenants error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid tenant ID" }, { status: 400 });
  }

  try {
    // Verify ownership
    const [existing] = await sql`
      SELECT t.id
      FROM tenants t
      LEFT JOIN units u ON t.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE t.id = ${Number(id)} AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    if (!existing) {
      return Response.json({ error: "Tenant not found or not owned by this owner" }, { status: 403 });
    }

    // Check if tenant has active tenancy
    const [activeTenancy] = await sql`
      SELECT id FROM tenants_units WHERE tenant_id = ${Number(id)} AND occupancy_status = 'active'
    `;

    if (activeTenancy) {
      return Response.json({ error: "Cannot delete tenant with active tenancy" }, { status: 400 });
    }

    await deleteRow("tenants", { id: Number(id) });
    
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/owner/tenants error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
