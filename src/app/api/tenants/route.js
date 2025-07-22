import { insertRow, updateRow, deleteRow } from "../../../lib/db.js";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL);
export async function POST(req) {
  const body = await req.json();
  const { full_name, phone, email, unit_id } = body;

  if (!full_name || !phone || !unit_id) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Generate random password (1000-9999)
    const randomPassword = Math.floor(Math.random() * 9000) + 1000;
    const passwordHash = crypto.createHash("md5").update(randomPassword.toString()).digest("hex");

    const tenant = await insertRow(
      "tenants",
      {
        full_name,
        phone,
        email,
        unit_id,
        password: passwordHash,
        password_text: randomPassword.toString()
      },
      "id"
    );

    return Response.json({ success: true, tenant_id: tenant.id, password: randomPassword });
  } catch (error) {
    return Response.json(
      { error: "Failed to add tenant", details: error.message },
      { status: 500 }
    );
  }
}
// get tenants
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || isNaN(id)) {
    try {
      const tenants = await sql`
      SELECT t.id, t.full_name, t.phone, t.email, t.password_text, u.name as unit_number, u.name as unit_name, u.rent_amount_kes, b.name AS building_name
      FROM tenants t
      JOIN units u ON t.unit_id = u.id
      JOIN buildings b ON u.building_id = b.id
    `;

      return Response.json(tenants);
    } catch (error) {
      console.error("GET /api/tenants error:", error);
      return Response.json(
        { error: "Failed to fetch tenants", details: error.message },
        { status: 500 }
      );
    }
  } else {
    //get single tenant
    try {
      const tenant = await sql`
            SELECT t.id, t.full_name, t.phone, t.email, t.password_text, u.name as unit_number, u.id as unit_id, b.name AS building_name
            FROM tenants t
            JOIN units u ON t.unit_id = u.id
            JOIN buildings b ON u.building_id = b.id
            WHERE t.id = ${Number(id)}
          `;
      if (tenant.length === 0) {
        return Response.json({ error: "Tenant not found" }, { status: 404 });
      }
      return Response.json(tenant[0]);
    } catch (error) {
      console.error("GET /api/tenants error:", error);
      return Response.json(
        { error: "Failed to fetch tenants", details: error.message },
        { status: 500 }
      );
    }
  }
}
export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid tenant ID" }, { status: 400 });
  }

  const data = await req.json();

  try {
    // Check if password regeneration is requested
    if (data.regenerate_password) {
      const randomPassword = Math.floor(Math.random() * 9000) + 1000;
      const passwordHash = crypto.createHash("md5").update(randomPassword.toString()).digest("hex");
      
      data.password = passwordHash;
      data.password_text = randomPassword.toString();
      delete data.regenerate_password;
      
      await updateRow("tenants", data, { id: Number(id) });
      return Response.json({ success: true, password: randomPassword });
    }
    
    await updateRow("tenants", data, { id: Number(id) });
    return Response.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/tenants error:", err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid tenant ID" }, { status: 400 });
  }

  try {
    const units = await sql`
        SELECT COUNT(*)::int AS count
        FROM payments
        WHERE tenant_id = ${Number(id)}
      `;

    if (units[0]?.count > 0) {
      return Response.json(
        { error: "tenant has records of payment. Cannot delete." },
        { status: 400 }
      );
    }
    await deleteRow("tenants", { id: Number(id) });

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/tenants error:", err);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
