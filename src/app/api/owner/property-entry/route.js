import { requireOwnerIdOr401 } from "../_common.js";
import { insertRow } from "../../../../lib/db";

export async function POST(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const body = await request.json();

  // Case 1: Add building + units (owner-scoped)
  if (body.building) {
    const buildingData = { 
      ...body.building,
      owner_id: ownerId // Always assign to authenticated owner
    };

    const buildingId = await insertRow("buildings", buildingData, "id");

    for (const unit of body.units) {
      const unitData = { 
        ...unit, 
        building_id: buildingId.id,
        owner_id: ownerId // Always assign to authenticated owner
      };
      await insertRow("units", unitData);
    }

    return Response.json({ success: true });
  }

  // Case 2: Add units only to an existing building (verify ownership)
  if (body.building_id && body.units?.length > 0) {
    // Verify the building belongs to the authenticated owner
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL);
    
    const buildingResult = await sql`
      SELECT id FROM buildings WHERE id = ${body.building_id} AND owner_id = ${ownerId}
    `;
    
    if (buildingResult.length === 0) {
      return Response.json(
        { error: "Building not found or not owned by this owner" },
        { status: 403 }
      );
    }

    for (const unit of body.units) {
      const unitData = {
        ...unit,
        building_id: body.building_id,
        owner_id: ownerId // Always assign to authenticated owner
      };
      await insertRow("units", unitData);
    }

    return Response.json({ success: true });
  }

  // Case 3: Add units only (standalone) - always assign to authenticated owner
  if (body.units?.length > 0 && !body.building_id) {
    for (const unit of body.units) {
      const unitData = {
        ...unit,
        owner_id: ownerId // Always assign to authenticated owner
      };
      await insertRow("units", unitData);
    }

    return Response.json({ success: true });
  }

  return Response.json(
    { success: false, message: "Invalid payload" },
    { status: 400 }
  );
}