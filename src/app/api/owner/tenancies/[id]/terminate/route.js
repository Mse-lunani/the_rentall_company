import { requireOwnerIdOr401, sql } from "../../_common.js";

export async function PUT(req, { params }) {
  const { error, ownerId } = requireOwnerIdOr401(req);
  if (error) return error;

  try {
    const resolvedParams = await params;
    const tenancyId = parseInt(resolvedParams.id);
    const { end_date, termination_reason, notes } = await req.json();

    if (!tenancyId) {
      return Response.json({ error: "Invalid tenancy ID" }, { status: 400 });
    }

    if (!end_date || !termination_reason) {
      return Response.json({ 
        error: "end_date and termination_reason are required" 
      }, { status: 400 });
    }

    // Verify the tenancy belongs to the owner
    const [tenancy] = await sql`
      SELECT tu.id 
      FROM tenants_units tu
      JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE tu.id = ${tenancyId} 
        AND tu.occupancy_status = 'active'
        AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    if (!tenancy) {
      return Response.json({
        error: "Active tenancy not found or not owned by this owner"
      }, { status: 403 });
    }

    // Valid termination reasons
    const validReasons = ['evicted', 'lease-expired', 'voluntary', 'transferred'];
    if (!validReasons.includes(termination_reason)) {
      return Response.json({
        error: "Invalid termination reason. Must be: " + validReasons.join(', ')
      }, { status: 400 });
    }

    // Terminate the tenancy
    const [updated] = await sql`
      UPDATE tenants_units 
      SET 
        end_date = ${end_date},
        occupancy_status = 'terminated',
        termination_reason = ${termination_reason},
        notes = COALESCE(${notes}, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${tenancyId}
      RETURNING *
    `;

    // Update unit occupancy status to available
    await sql`
      UPDATE units 
      SET is_occupied = false 
      WHERE id = ${updated.unit_id}
    `;

    return Response.json({
      success: true,
      message: "Tenancy terminated successfully",
      tenancy: updated
    });

  } catch (error) {
    console.error("PUT /api/owner/tenancies/:id/terminate error:", error);
    return Response.json(
      { error: "Failed to terminate tenancy", details: error.message },
      { status: 500 }
    );
  }
}