import { insertRow } from "../../../lib/db";

export async function POST(request) {
  const body = await request.json();

  // Case 1: Add building + units
  if (body.building) {
    const buildingId = await insertRow("buildings", body.building, "id");

    for (const unit of body.units) {
      await insertRow("units", { ...unit, building_id: buildingId.id });
    }

    return Response.json({ success: true });
  }

  // Case 2: Add units only to an existing building
  if (body.building_id && body.units?.length > 0) {
    for (const unit of body.units) {
      await insertRow("units", { ...unit, building_id: body.building_id });
    }

    return Response.json({ success: true });
  }
  // Case 3: Add units only (standalone)
  if (body.units?.length > 0 && !body.building_id) {
    for (const unit of body.units) {
      await insertRow("units", unit);
    }

    return Response.json({ success: true });
  }

  return Response.json(
    { success: false, message: "Invalid payload" },
    { status: 400 }
  );
}
