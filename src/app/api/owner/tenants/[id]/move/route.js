import { requireOwnerIdOr401, sql } from "../../_common.js";

export async function POST(req, { params }) {
  const { error, ownerId } = requireOwnerIdOr401(req);
  if (error) return error;

  try {
    const resolvedParams = await params;
    const tenantId = parseInt(resolvedParams.id);
    
    const { 
      new_unit_id, 
      move_date, 
      new_monthly_rent, 
      new_deposit_paid, 
      move_reason, 
      notes 
    } = await req.json();

    if (!tenantId || !new_unit_id || !move_date) {
      return Response.json({ 
        error: "tenant_id, new_unit_id, and move_date are required" 
      }, { status: 400 });
    }

    // Verify tenant exists and is owned by this owner
    const [tenant] = await sql`
      SELECT t.id, t.full_name
      FROM tenants t
      JOIN units u ON t.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE t.id = ${tenantId} AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    if (!tenant) {
      return Response.json({
        error: "Tenant not found or not owned by this owner"
      }, { status: 403 });
    }

    // Verify new unit is available and owned by this owner
    const [newUnit] = await sql`
      SELECT u.id, u.name, u.rent_amount_kes, u.is_occupied
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.id = ${parseInt(new_unit_id)} 
        AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    if (!newUnit) {
      return Response.json({
        error: "New unit not found or not owned by this owner"
      }, { status: 403 });
    }

    if (newUnit.is_occupied) {
      return Response.json({
        error: "Target unit is already occupied"
      }, { status: 400 });
    }

    // Get current active tenancy
    const [currentTenancy] = await sql`
      SELECT tu.id, tu.unit_id
      FROM tenants_units tu
      JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE tu.tenant_id = ${tenantId} 
        AND tu.occupancy_status = 'active'
        AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    if (!currentTenancy) {
      return Response.json({
        error: "No active tenancy found for this tenant"
      }, { status: 400 });
    }

    // Begin transaction-like operations
    // 1. Terminate current tenancy
    await sql`
      UPDATE tenants_units 
      SET 
        end_date = ${move_date},
        occupancy_status = 'terminated',
        termination_reason = 'transferred',
        notes = ${move_reason ? `Moved: ${move_reason}` : 'Moved to different unit'},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${currentTenancy.id}
    `;

    // 2. Create new tenancy
    const finalRent = new_monthly_rent || newUnit.rent_amount_kes;
    const [newTenancy] = await sql`
      INSERT INTO tenants_units (
        tenant_id, unit_id, start_date, occupancy_status, monthly_rent,
        deposit_paid, notes, created_at, updated_at
      ) VALUES (
        ${tenantId}, ${parseInt(new_unit_id)}, ${move_date}, 'active', ${finalRent},
        ${new_deposit_paid || null}, ${notes || null}, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    // 3. Update tenant's current unit
    await sql`
      UPDATE tenants 
      SET unit_id = ${parseInt(new_unit_id)}
      WHERE id = ${tenantId}
    `;

    // 4. Update unit occupancy status
    // Mark old unit as available
    await sql`
      UPDATE units 
      SET is_occupied = false 
      WHERE id = ${currentTenancy.unit_id}
    `;

    // Mark new unit as occupied
    await sql`
      UPDATE units 
      SET is_occupied = true 
      WHERE id = ${parseInt(new_unit_id)}
    `;

    return Response.json({
      success: true,
      message: "Tenant moved successfully",
      new_tenancy: newTenancy,
      tenant_name: tenant.full_name,
      new_unit_name: newUnit.name
    });

  } catch (error) {
    console.error("POST /api/owner/tenants/:id/move error:", error);
    return Response.json(
      { error: "Failed to move tenant", details: error.message },
      { status: 500 }
    );
  }
}