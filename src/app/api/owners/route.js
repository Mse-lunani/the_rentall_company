import { insertRow, updateRow, deleteRow } from "../../../lib/db.js";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  const body = await req.json();
  const { full_name, phone, email, national_id, address } = body;

  if (!full_name || !phone || !email) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Generate random password (1000-9999)
    const randomPassword = Math.floor(Math.random() * 9000) + 1000;
    const passwordHash = crypto.createHash("md5").update(randomPassword.toString()).digest("hex");

    const owner = await insertRow(
      "owners",
      {
        full_name,
        phone,
        email,
        national_id,
        address,
        password: passwordHash,
        password_text: randomPassword.toString()
      },
      "id"
    );

    return Response.json({ success: true, owner_id: owner.id, password: randomPassword });
  } catch (error) {
    return Response.json(
      { error: "Failed to add owner", details: error.message },
      { status: 500 }
    );
  }
}

// Get owners
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  
  if (!id || isNaN(id)) {
    try {
      const owners = await sql`
        SELECT id, full_name, phone, email, national_id, address, created_at, password_text
        FROM owners
        ORDER BY created_at DESC
      `;

      return Response.json(owners);
    } catch (error) {
      console.error("GET /api/owners error:", error);
      return Response.json(
        { error: "Failed to fetch owners", details: error.message },
        { status: 500 }
      );
    }
  } else {
    // Get single owner
    try {
      const owner = await sql`
        SELECT id, full_name, phone, email, national_id, address, created_at, password_text
        FROM owners
        WHERE id = ${Number(id)}
      `;
      
      if (owner.length === 0) {
        return Response.json({ error: "Owner not found" }, { status: 404 });
      }
      return Response.json(owner[0]);
    } catch (error) {
      console.error("GET /api/owners error:", error);
      return Response.json(
        { error: "Failed to fetch owner", details: error.message },
        { status: 500 }
      );
    }
  }
}

export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid owner ID" }, { status: 400 });
  }

  const data = await req.json();
  
  // If updating password, generate new random password and hash
  if (data.regenerate_password) {
    const randomPassword = Math.floor(Math.random() * 9000) + 1000;
    const passwordHash = crypto.createHash("md5").update(randomPassword.toString()).digest("hex");
    data.password = passwordHash;
    data.password_text = randomPassword.toString();
    delete data.regenerate_password;
  }

  try {
    await updateRow("owners", data, { id: Number(id) });
    return Response.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/owners error:", err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid owner ID" }, { status: 400 });
  }

  try {
    // Check if owner has buildings
    const buildings = await sql`
      SELECT COUNT(*)::int AS count
      FROM buildings
      WHERE owner_id = ${Number(id)}
    `;

    if (buildings[0]?.count > 0) {
      return Response.json(
        { error: "Owner has buildings. Cannot delete." },
        { status: 400 }
      );
    }
    
    await deleteRow("owners", { id: Number(id) });
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/owners error:", err);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}