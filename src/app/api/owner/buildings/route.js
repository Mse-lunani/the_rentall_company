import { sql, requireOwnerIdOr401 } from "../_common";
import { updateRow, deleteRow } from "../../../../lib/db";

export async function GET(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const includeUnits = searchParams.get("include_units") === "true";
  const occupancyFilter = searchParams.get("occupancy"); // 'Fully Occupied', 'Partially Occupied', 'Not Occupied'
  const includeStats = searchParams.get("include_stats") === "true";

  try {
    if (id) {
      // Build dynamic WHERE conditions
      let whereConditions = [`b.id = ${Number(id)}`, `b.owner_id = ${ownerId}`];
      
      const whereClause = sql.unsafe(`WHERE ${whereConditions.join(" AND ")}`);

      const [building] = await sql`
        SELECT b.*,
               o.full_name as owner_name,
               o.id as owner_id,
               COUNT(u.id) as total_units,
               COUNT(u.id) FILTER (WHERE t.unit_id IS NOT NULL) as occupied_units,
               COUNT(u.id) FILTER (WHERE t.unit_id IS NULL) as vacant_units
        FROM buildings b
        JOIN owners o ON b.owner_id = o.id
        LEFT JOIN units u ON b.id = u.building_id
        LEFT JOIN tenants t ON u.id = t.unit_id
        ${whereClause}
        GROUP BY b.id, o.full_name, o.id
      `;

      if (!building) return Response.json({ error: "Building not found" }, { status: 404 });

      if (includeUnits) {
        const units = await sql`
          SELECT u.*,
                 CASE WHEN t.unit_id IS NOT NULL THEN true ELSE false END as is_occupied,
                 t.full_name as tenant_name,
                 t.id as tenant_id
          FROM units u
          LEFT JOIN tenants t ON u.id = t.unit_id
          WHERE u.building_id = ${Number(id)}
          ORDER BY u.name
        `;
        building.units = units;
      }

      return Response.json(building);
    }

    // Build dynamic WHERE conditions for listing
    let whereConditions = [`b.owner_id = ${ownerId}`];
    
    if (occupancyFilter) {
      whereConditions.push(`b.occupancy_status = '${occupancyFilter}'`);
    }

    const whereClause = sql.unsafe(`WHERE ${whereConditions.join(" AND ")}`);

    const buildings = await sql`
      SELECT b.*,
             o.full_name as owner_name,
             o.id as owner_id,
             COUNT(u.id) as total_units,
             COUNT(u.id) FILTER (WHERE t.unit_id IS NOT NULL) as occupied_units,
             COUNT(u.id) FILTER (WHERE t.unit_id IS NULL) as vacant_units,
             COALESCE(SUM(u.rent_amount_kes), 0) as potential_monthly_income
      FROM buildings b
      JOIN owners o ON b.owner_id = o.id
      LEFT JOIN units u ON b.id = u.building_id
      LEFT JOIN tenants t ON u.id = t.unit_id
      ${whereClause}
      GROUP BY b.id, o.full_name, o.id
      ORDER BY b.name
    `;

    return Response.json(buildings);
  } catch (err) {
    console.error("GET /api/owner/buildings error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid building ID" }, { status: 400 });
  }

  try {
    // Verify ownership
    const [existing] = await sql`
      SELECT id FROM buildings WHERE id = ${Number(id)} AND owner_id = ${ownerId}
    `;

    if (!existing) {
      return Response.json({ error: "Building not found or not owned by this owner" }, { status: 403 });
    }

    const data = await request.json();
    await updateRow("buildings", data, { id: Number(id) });
    
    return Response.json({ success: true });
  } catch (err) {
    console.error("PUT /api/owner/buildings error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid building ID" }, { status: 400 });
  }

  try {
    // Verify ownership
    const [existing] = await sql`
      SELECT id FROM buildings WHERE id = ${Number(id)} AND owner_id = ${ownerId}
    `;

    if (!existing) {
      return Response.json({ error: "Building not found or not owned by this owner" }, { status: 403 });
    }

    // Check if building has units
    const [unitCount] = await sql`
      SELECT COUNT(*) as count FROM units WHERE building_id = ${Number(id)}
    `;

    if (unitCount.count > 0) {
      return Response.json({ error: "Cannot delete building with existing units" }, { status: 400 });
    }

    await deleteRow("buildings", { id: Number(id) });
    
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/owner/buildings error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
