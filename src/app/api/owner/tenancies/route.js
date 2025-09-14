import { sql, requireOwnerIdOr401 } from "../_common";
import { updateRow, deleteRow } from "../../../../lib/db";

export async function GET(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status"); // 'active', 'terminated', 'expired'
  const buildingId = searchParams.get("building_id");
  const tenantId = searchParams.get("tenant_id");
  const includeStats = searchParams.get("include_stats") === "true";
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");

  try {
    if (id) {
      // Build dynamic WHERE conditions
      let whereConditions = [
        `tu.id = ${Number(id)}`,
        `(u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})`
      ];
      
      const whereClause = sql.unsafe(`WHERE ${whereConditions.join(" AND ")}`);

      const [tenancy] = await sql`
        SELECT tu.*,
               t.full_name as tenant_name,
               t.phone as tenant_phone,
               t.email as tenant_email,
               u.name as unit_name,
               u.rent_amount_kes as unit_rent,
               b.name as building_name,
               b.id as building_id,
               o.full_name as owner_name,
               COUNT(p.id) as payment_count,
               COALESCE(SUM(p.amount_paid), 0) as total_payments,
               MAX(p.date_paid) as last_payment_date,
               COALESCE(tu.end_date, CURRENT_DATE) - tu.start_date as duration_days
        FROM tenants_units tu
        JOIN tenants t ON tu.tenant_id = t.id
        JOIN units u ON tu.unit_id = u.id
        LEFT JOIN buildings b ON u.building_id = b.id
        LEFT JOIN owners o ON COALESCE(u.owner_id, b.owner_id) = o.id
        LEFT JOIN payments p ON tu.id = p.tenancy_id
        ${whereClause}
        GROUP BY tu.id, t.full_name, t.phone, t.email, u.name, u.rent_amount_kes,
                 b.name, b.id, o.full_name, tu.start_date, tu.end_date
      `;

      if (!tenancy) return Response.json({ error: "Tenancy not found" }, { status: 404 });

      // Get payment history for this tenancy
      const payments = await sql`
        SELECT p.*
        FROM payments p
        WHERE p.tenancy_id = ${Number(id)}
        ORDER BY p.date_paid DESC
      `;
      tenancy.payments = payments;

      return Response.json(tenancy);
    }

    // Build dynamic WHERE conditions for listing
    let whereConditions = [`(u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})`];
    
    if (status) {
      if (status === 'expired') {
        whereConditions.push(`tu.end_date < CURRENT_DATE AND tu.occupancy_status = 'active'`);
      } else {
        whereConditions.push(`tu.occupancy_status = '${status}'`);
      }
    }

    if (buildingId) {
      whereConditions.push(`b.id = ${Number(buildingId)}`);
    }

    if (tenantId) {
      whereConditions.push(`t.id = ${Number(tenantId)}`);
    }

    if (dateFrom) {
      whereConditions.push(`tu.start_date >= '${dateFrom}'`);
    }

    if (dateTo) {
      whereConditions.push(`tu.start_date <= '${dateTo}'`);
    }

    const whereClause = sql.unsafe(`WHERE ${whereConditions.join(" AND ")}`);

    const tenancies = await sql`
      SELECT tu.*,
             t.full_name as tenant_name,
             t.phone as tenant_phone,
             u.name as unit_name,
             u.rent_amount_kes as unit_rent,
             b.name as building_name,
             b.id as building_id,
             o.full_name as owner_name,
             COUNT(p.id) as payment_count,
             COALESCE(SUM(p.amount_paid), 0) as total_payments,
             MAX(p.date_paid) as last_payment_date,
             CASE 
               WHEN tu.end_date < CURRENT_DATE AND tu.occupancy_status = 'active' THEN 'expired'
               ELSE tu.occupancy_status 
             END as effective_status,
             COALESCE(tu.end_date, CURRENT_DATE) - tu.start_date as duration_days
      FROM tenants_units tu
      JOIN tenants t ON tu.tenant_id = t.id
      JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN owners o ON COALESCE(u.owner_id, b.owner_id) = o.id
      LEFT JOIN payments p ON tu.id = p.tenancy_id
      ${whereClause}
      GROUP BY tu.id, t.full_name, t.phone, u.name, u.rent_amount_kes,
               b.name, b.id, o.full_name, tu.start_date, tu.end_date, tu.occupancy_status
      ORDER BY tu.start_date DESC
    `;

    let response = { tenancies };

    if (includeStats) {
      const [stats] = await sql`
        SELECT 
          COUNT(tu.id) as total_tenancies,
          COUNT(tu.id) FILTER (WHERE tu.occupancy_status = 'active') as active_tenancies,
          COUNT(tu.id) FILTER (WHERE tu.occupancy_status = 'terminated') as terminated_tenancies,
          COUNT(tu.id) FILTER (WHERE tu.end_date < CURRENT_DATE AND tu.occupancy_status = 'active') as expired_tenancies,
          COALESCE(AVG(COALESCE(tu.end_date, CURRENT_DATE) - tu.start_date), 0) as average_duration,
          COALESCE(SUM(p.amount_paid), 0) as total_payments_received
        FROM tenants_units tu
        JOIN units u ON tu.unit_id = u.id
        LEFT JOIN buildings b ON u.building_id = b.id
        LEFT JOIN payments p ON tu.id = p.tenancy_id
        WHERE (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
      `;
      response.statistics = stats;
    }

    return Response.json(response);
  } catch (err) {
    console.error("GET /api/owner/tenancies error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid tenancy ID" }, { status: 400 });
  }

  try {
    // Verify ownership
    const [existing] = await sql`
      SELECT tu.id
      FROM tenants_units tu
      JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE tu.id = ${Number(id)} AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    if (!existing) {
      return Response.json({ error: "Tenancy not found or not owned by this owner" }, { status: 403 });
    }

    const data = await request.json();
    await updateRow("tenants_units", data, { id: Number(id) });
    
    return Response.json({ success: true });
  } catch (err) {
    console.error("PUT /api/owner/tenancies error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid tenancy ID" }, { status: 400 });
  }

  try {
    // Verify ownership
    const [existing] = await sql`
      SELECT tu.id
      FROM tenants_units tu
      JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE tu.id = ${Number(id)} AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    if (!existing) {
      return Response.json({ error: "Tenancy not found or not owned by this owner" }, { status: 403 });
    }

    // Check if tenancy has payments
    const [paymentCount] = await sql`
      SELECT COUNT(*) as count FROM payments WHERE tenancy_id = ${Number(id)}
    `;

    if (paymentCount.count > 0) {
      return Response.json({ error: "Cannot delete tenancy with existing payments" }, { status: 400 });
    }

    await deleteRow("tenants_units", { id: Number(id) });
    
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/owner/tenancies error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}