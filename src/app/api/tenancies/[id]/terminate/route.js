import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// PUT /api/tenancies/:id/terminate - End tenancy with reason
export async function PUT(req, { params }) {
  try {
    const tenancyId = params.id;
    const body = await req.json();
    const { 
      end_date, 
      termination_reason, 
      notes 
    } = body;

    if (!end_date || !termination_reason) {
      return Response.json({ 
        error: "Missing required fields: end_date, termination_reason" 
      }, { status: 400 });
    }

    // Validate termination reason
    const validReasons = ['evicted', 'lease-expired', 'voluntary', 'transferred'];
    if (!validReasons.includes(termination_reason)) {
      return Response.json({ 
        error: `Invalid termination reason. Must be one of: ${validReasons.join(', ')}` 
      }, { status: 400 });
    }

    // Check if tenancy exists and is active
    const [existingTenancy] = await sql`
      SELECT * FROM tenants_units 
      WHERE id = ${tenancyId} AND occupancy_status = 'active'
    `;

    if (!existingTenancy) {
      return Response.json({ 
        error: "Active tenancy not found" 
      }, { status: 404 });
    }

    // Validate end_date is not before start_date
    if (new Date(end_date) < new Date(existingTenancy.start_date)) {
      return Response.json({ 
        error: "End date cannot be before start date" 
      }, { status: 400 });
    }

    // Update tenancy to terminated status
    const [updatedTenancy] = await sql`
      UPDATE tenants_units SET
        end_date = ${end_date},
        occupancy_status = 'terminated',
        termination_reason = ${termination_reason},
        notes = ${notes ? (existingTenancy.notes ? `${existingTenancy.notes}. ${notes}` : notes) : existingTenancy.notes},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${tenancyId}
      RETURNING *
    `;

    return Response.json({ 
      success: true, 
      tenancy: updatedTenancy,
      message: "Tenancy terminated successfully" 
    });

  } catch (error) {
    console.error("PUT /api/tenancies/:id/terminate error:", error);
    return Response.json(
      { error: "Failed to terminate tenancy", details: error.message },
      { status: 500 }
    );
  }
}