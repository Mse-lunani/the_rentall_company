import { neon } from "@neondatabase/serverless";
import { updateRow, deleteRow } from "../../../lib/db";
const sql = neon(process.env.DATABASE_URL);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    // Get single unit by id
    if (isNaN(id)) {
      return Response.json(
        { error: "Invalid id parameter" },
        { status: 400 }
      );
    }

    try {
      const result = await sql`
        SELECT *
        FROM units
        WHERE id = ${Number(id)}
      `;

      if (result.length === 0) {
        return Response.json({ error: "Unit not found" }, { status: 404 });
      }

      return Response.json(result[0]);
    } catch (err) {
      console.error("GET /api/units single error:", err);
      return Response.json({ error: "Failed to fetch unit" }, { status: 500 });
    }
  } else {
    // Get all units with occupancy status
    try {
      const result = await sql`
        SELECT 
          u.*,
          b.name as building_name,
          CASE WHEN tu.id IS NOT NULL THEN true ELSE false END as is_occupied
        FROM units u
        LEFT JOIN buildings b ON u.building_id = b.id
        LEFT JOIN tenants_units tu ON u.id = tu.unit_id AND tu.occupancy_status = 'active'
        ORDER BY u.name
      `;

      return Response.json(result);
    } catch (err) {
      console.error("GET /api/units all error:", err);
      return Response.json({ error: "Failed to fetch units" }, { status: 500 });
    }
  }
}

export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid unit ID" }, { status: 400 });
  }

  const data = await req.json();

  try {
    await updateRow("units", data, { id: Number(id) });
    return Response.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/units error:", err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid unit ID" }, { status: 400 });
  }

  try {
    // Check if unit has active tenancies
    const tenancies = await sql`
      SELECT COUNT(*)::int AS count
      FROM tenants_units
      WHERE unit_id = ${Number(id)} AND occupancy_status = 'active'
    `;

    if (tenancies[0]?.count > 0) {
      return Response.json(
        { error: "Unit has active tenant. Cannot delete." },
        { status: 400 }
      );
    }

    await deleteRow("units", { id: Number(id) });

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/units error:", err);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
