import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// POST /api/tenancies/:id/extend - Extend existing tenancy
export async function POST(req, { params }) {
  try {
    const tenancyId = params.id;
    const body = await req.json();
    const { 
      new_monthly_rent, 
      lease_terms, 
      notes,
      extension_period_months 
    } = body;

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

    // Update tenancy details
    const updateFields = {
      updated_at: new Date().toISOString()
    };

    if (new_monthly_rent) {
      updateFields.monthly_rent = new_monthly_rent;
    }
    
    if (lease_terms) {
      updateFields.lease_terms = lease_terms;
    }
    
    if (notes) {
      updateFields.notes = existingTenancy.notes 
        ? `${existingTenancy.notes}. Extended: ${notes}`
        : `Extended: ${notes}`;
    }

    const [updatedTenancy] = await sql`
      UPDATE tenants_units SET
        monthly_rent = COALESCE(${new_monthly_rent || null}, monthly_rent),
        lease_terms = COALESCE(${lease_terms || null}, lease_terms),
        notes = CASE 
          WHEN ${notes || null} IS NOT NULL THEN 
            CASE 
              WHEN notes IS NULL THEN CONCAT('Extended: ', ${notes})
              ELSE CONCAT(notes, '. Extended: ', ${notes})
            END
          ELSE notes
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${tenancyId}
      RETURNING *
    `;

    return Response.json({ 
      success: true, 
      tenancy: updatedTenancy,
      message: "Tenancy extended successfully",
      changes: {
        rent_changed: new_monthly_rent && new_monthly_rent !== existingTenancy.monthly_rent,
        old_rent: existingTenancy.monthly_rent,
        new_rent: new_monthly_rent || existingTenancy.monthly_rent
      }
    });

  } catch (error) {
    console.error("POST /api/tenancies/:id/extend error:", error);
    return Response.json(
      { error: "Failed to extend tenancy", details: error.message },
      { status: 500 }
    );
  }
}