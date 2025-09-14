import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// POST /api/tenants/:id/move - Move tenant between units
export async function POST(req, { params }) {
  try {
    const tenantId = params.id;
    const body = await req.json();
    const { 
      new_unit_id, 
      move_date, 
      new_monthly_rent, 
      new_deposit_paid,
      move_reason,
      notes 
    } = body;

    if (!new_unit_id || !move_date) {
      return Response.json({ 
        error: "Missing required fields: new_unit_id, move_date" 
      }, { status: 400 });
    }

    // Begin transaction
    await sql`BEGIN`;

    try {
      // Check if tenant exists and has active tenancy
      const [currentTenancy] = await sql`
        SELECT tu.*, u.name as current_unit_name, u.rent_amount_kes as current_rent
        FROM tenants_units tu
        JOIN units u ON tu.unit_id = u.id
        WHERE tu.tenant_id = ${tenantId} AND tu.occupancy_status = 'active'
      `;

      if (!currentTenancy) {
        await sql`ROLLBACK`;
        return Response.json({ 
          error: "No active tenancy found for this tenant" 
        }, { status: 404 });
      }

      // Check if new unit exists and is available
      const [newUnit] = await sql`
        SELECT u.*, 
               CASE WHEN tu.id IS NOT NULL THEN true ELSE false END as is_occupied
        FROM units u
        LEFT JOIN tenants_units tu ON u.id = tu.unit_id AND tu.occupancy_status = 'active'
        WHERE u.id = ${new_unit_id}
      `;

      if (!newUnit) {
        await sql`ROLLBACK`;
        return Response.json({ 
          error: "New unit not found" 
        }, { status: 404 });
      }

      if (newUnit.is_occupied) {
        await sql`ROLLBACK`;
        return Response.json({ 
          error: "New unit is already occupied" 
        }, { status: 400 });
      }

      // Validate move_date is not before current tenancy start
      if (new Date(move_date) < new Date(currentTenancy.start_date)) {
        await sql`ROLLBACK`;
        return Response.json({ 
          error: "Move date cannot be before current tenancy start date" 
        }, { status: 400 });
      }

      // Terminate current tenancy
      const moveNote = `Moved to unit ${newUnit.name}${notes ? '. ' + notes : ''}`;
      const finalNotes = currentTenancy.notes ? `${currentTenancy.notes}. ${moveNote}` : moveNote;
      
      const [terminatedTenancy] = await sql`
        UPDATE tenants_units SET
          end_date = ${move_date},
          occupancy_status = 'terminated',
          termination_reason = 'transferred',
          notes = ${finalNotes},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${currentTenancy.id}
        RETURNING *
      `;

      // Create new tenancy
      const newTenancyNote = `Moved from unit ${currentTenancy.current_unit_name}${move_reason ? '. ' + move_reason : ''}`;
      
      const [newTenancy] = await sql`
        INSERT INTO tenants_units (
          tenant_id, unit_id, start_date, occupancy_status, 
          monthly_rent, deposit_paid, notes
        ) VALUES (
          ${tenantId}, 
          ${new_unit_id}, 
          ${move_date}, 
          'active',
          ${new_monthly_rent || newUnit.rent_amount_kes}, 
          ${new_deposit_paid || null}, 
          ${newTenancyNote}
        ) RETURNING *
      `;


      await sql`COMMIT`;

      return Response.json({ 
        success: true, 
        message: "Tenant moved successfully",
        previous_tenancy: terminatedTenancy,
        new_tenancy: newTenancy,
        move_summary: {
          tenant_id: tenantId,
          from_unit: currentTenancy.current_unit_name,
          to_unit: newUnit.name,
          move_date: move_date,
          old_rent: currentTenancy.monthly_rent,
          new_rent: new_monthly_rent || newUnit.rent_amount_kes
        }
      });

    } catch (transactionError) {
      await sql`ROLLBACK`;
      throw transactionError;
    }

  } catch (error) {
    console.error("POST /api/tenants/:id/move error:", error);
    return Response.json(
      { error: "Failed to move tenant", details: error.message },
      { status: 500 }
    );
  }
}