import { neon } from "@neondatabase/serverless";
import { updateRow, deleteRow } from "../../../lib/db";
const sql = neon(process.env.DATABASE_URL);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // ✅ Early return if id is missing or not a valid integer
  if (!id || isNaN(id)) {
    return Response.json(
      { error: "Missing or invalid id parameter" },
      { status: 400 }
    );
  }

  try {
    const result = await sql`
      SELECT id, name, type, units_owned, total_space_sqm, occupancy_status
      FROM buildings
      WHERE id = ${Number(id)}
    `;

    if (result.length === 0) {
      return Response.json({ error: "Building not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (err) {
    console.error("GET /api/buildings error:", err);
    return Response.json(
      { error: "Failed to fetch building" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid building ID" }, { status: 400 });
  }

  const data = await req.json();

  try {
    await updateRow("buildings", data, { id: Number(id) });
    return Response.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/buildings error:", err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid building ID" }, { status: 400 });
  }

  try {
    const units = await sql`
      SELECT COUNT(*)::int AS count
      FROM units
      WHERE building_id = ${Number(id)}
    `;

    if (units[0]?.count > 0) {
      return Response.json(
        { error: "Building has units. Cannot delete." },
        { status: 400 }
      );
    }

    await deleteRow("buildings", { id: Number(id) });

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/buildings error:", err);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
