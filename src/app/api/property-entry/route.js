import { insertRow } from "../../../lib/db";

export async function POST(request) {
  const body = await request.json();

  // Case 1: Add building + units
  if (body.building) {
    const buildingData = { ...body.building };
    
    // Convert owner_id to integer or null if empty
    if (buildingData.owner_id) {
      buildingData.owner_id = parseInt(buildingData.owner_id);
    } else {
      buildingData.owner_id = null;
    }

    const buildingId = await insertRow("buildings", buildingData, "id");

    for (const unit of body.units) {
      const unitData = { 
        ...unit, 
        building_id: buildingId.id,
        owner_id: buildingData.owner_id // Add owner_id to units as well
      };
      await insertRow("units", unitData);
    }

    return Response.json({ success: true });
  }

  // Case 2: Add units only to an existing building
  if (body.building_id && body.units?.length > 0) {
    // First, get the building's owner_id
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL);
    
    const buildingResult = await sql`
      SELECT owner_id FROM buildings WHERE id = ${body.building_id}
    `;
    
    const buildingOwnerId = buildingResult[0]?.owner_id || null;

    for (const unit of body.units) {
      const unitData = {
        ...unit,
        building_id: body.building_id,
        owner_id: buildingOwnerId // Inherit owner_id from building
      };
      await insertRow("units", unitData);
    }

    return Response.json({ success: true });
  }
  // Case 3: Add units only (standalone)
  if (body.units?.length > 0 && !body.building_id) {
    for (const unit of body.units) {
      // For standalone units, owner_id would be null unless specified
      const unitData = {
        ...unit,
        owner_id: unit.owner_id ? parseInt(unit.owner_id) : null
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
