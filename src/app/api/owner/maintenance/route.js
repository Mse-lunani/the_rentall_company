import { requireOwnerIdOr401, sql } from "../_common.js";

export async function GET(req) {
  const { error, ownerId } = requireOwnerIdOr401(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const unit_id = searchParams.get("unit_id");

  try {
    if (id) {
      // Get single maintenance request
      const [maintenance] = await sql`
        SELECT 
          ml.id, ml.unit_id, ml.description, ml.cost_kes, 
          ml.notes, ml.image_url, ml.reported_by,
          ml.created_at, ml.tenancy_id,
          u.name as unit_name,
          b.name as building_name,
          t.full_name as reported_by_name
        FROM maintenance_logs ml
        JOIN units u ON ml.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        LEFT JOIN tenants t ON ml.reported_by = t.id
        WHERE ml.id = ${parseInt(id)} AND b.owner_id = ${ownerId}
      `;

      if (!maintenance) {
        return Response.json({ error: "Maintenance request not found" }, { status: 404 });
      }

      return Response.json(maintenance);
    } else {
      // Get all maintenance requests for owner's properties  
      if (unit_id) {
        const maintenance = await sql`
          SELECT 
            ml.id, ml.unit_id, ml.description, ml.cost_kes,
            ml.notes, ml.image_url, ml.reported_by,
            ml.created_at, ml.tenancy_id,
            u.name as unit_name,
            b.name as building_name,
            t.full_name as reported_by_name
          FROM maintenance_logs ml
          JOIN units u ON ml.unit_id = u.id
          LEFT JOIN buildings b ON u.building_id = b.id
          LEFT JOIN tenants t ON ml.reported_by = t.id
          WHERE (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId}) AND ml.unit_id = ${parseInt(unit_id)}
          ORDER BY ml.created_at DESC
        `;
        return Response.json(maintenance);
      } else {
        const maintenance = await sql`
          SELECT 
            ml.id, ml.unit_id, ml.description, ml.cost_kes,
            ml.notes, ml.image_url, ml.reported_by,
            ml.created_at, ml.tenancy_id,
            u.name as unit_name,
            b.name as building_name,
            t.full_name as reported_by_name
          FROM maintenance_logs ml
          JOIN units u ON ml.unit_id = u.id
          LEFT JOIN buildings b ON u.building_id = b.id
          LEFT JOIN tenants t ON ml.reported_by = t.id
          WHERE (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
          ORDER BY ml.created_at DESC
        `;
        return Response.json(maintenance);
      }
    }
  } catch (error) {
    console.error("GET /api/owner/maintenance error:", error);
    return Response.json(
      { error: "Failed to fetch maintenance requests", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { error, ownerId } = requireOwnerIdOr401(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { unit_id, description, priority = 'medium', notes } = body;

    if (!unit_id || !description) {
      return Response.json(
        { error: "unit_id and description are required" },
        { status: 400 }
      );
    }

    // Verify the unit belongs to the owner
    const [unit] = await sql`
      SELECT u.id 
      FROM units u 
      JOIN buildings b ON u.building_id = b.id 
      WHERE u.id = ${parseInt(unit_id)} AND b.owner_id = ${ownerId}
    `;

    if (!unit) {
      return Response.json(
        { error: "Unit not found or not owned by this owner" },
        { status: 403 }
      );
    }

    // Create maintenance request
    const [maintenance] = await sql`
      INSERT INTO maintenance_logs (
        unit_id, description, status, priority, notes, created_at, updated_at
      ) VALUES (
        ${parseInt(unit_id)}, ${description}, 'open', ${priority}, ${notes || null}, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    return Response.json({ 
      success: true, 
      maintenance_id: maintenance.id,
      message: "Maintenance request created successfully"
    });

  } catch (error) {
    console.error("POST /api/owner/maintenance error:", error);
    return Response.json(
      { error: "Failed to create maintenance request", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const { error, ownerId } = requireOwnerIdOr401(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Maintenance ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status, cost_kes, notes, priority } = body;

    // Verify the maintenance request belongs to owner's property
    const [existing] = await sql`
      SELECT ml.id 
      FROM maintenance_logs ml
      JOIN units u ON ml.unit_id = u.id
      JOIN buildings b ON u.building_id = b.id
      WHERE ml.id = ${parseInt(id)} AND b.owner_id = ${ownerId}
    `;

    if (!existing) {
      return Response.json(
        { error: "Maintenance request not found or not owned by this owner" },
        { status: 403 }
      );
    }

    // Build update query dynamically
    let updateFields = [];
    let params = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (cost_kes !== undefined) {
      updateFields.push(`cost_kes = $${paramIndex}`);
      params.push(parseFloat(cost_kes));
      paramIndex++;
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }

    if (priority !== undefined) {
      updateFields.push(`priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(parseInt(id));

    const query = `
      UPDATE maintenance_logs 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [updated] = await sql.unsafe(query, params);

    return Response.json({ 
      success: true, 
      maintenance: updated,
      message: "Maintenance request updated successfully"
    });

  } catch (error) {
    console.error("PUT /api/owner/maintenance error:", error);
    return Response.json(
      { error: "Failed to update maintenance request", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const { error, ownerId } = requireOwnerIdOr401(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Maintenance ID is required" }, { status: 400 });
  }

  try {
    // Verify the maintenance request belongs to owner's property
    const [existing] = await sql`
      SELECT ml.id 
      FROM maintenance_logs ml
      JOIN units u ON ml.unit_id = u.id
      JOIN buildings b ON u.building_id = b.id
      WHERE ml.id = ${parseInt(id)} AND b.owner_id = ${ownerId}
    `;

    if (!existing) {
      return Response.json(
        { error: "Maintenance request not found or not owned by this owner" },
        { status: 403 }
      );
    }

    // Delete maintenance request
    await sql`DELETE FROM maintenance_logs WHERE id = ${parseInt(id)}`;

    return Response.json({ 
      success: true,
      message: "Maintenance request deleted successfully"
    });

  } catch (error) {
    console.error("DELETE /api/owner/maintenance error:", error);
    return Response.json(
      { error: "Failed to delete maintenance request", details: error.message },
      { status: 500 }
    );
  }
}