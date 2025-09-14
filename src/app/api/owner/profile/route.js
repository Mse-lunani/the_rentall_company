import { sql, requireOwnerIdOr401 } from "../_common";

export async function GET(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const [owner] = await sql`SELECT id, full_name, email, phone, address FROM owners WHERE id = ${ownerId}`;
  if (!owner) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(owner);
}

export async function PUT(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const body = await request.json();
  const { full_name, phone, address } = body;

  try {
    const [row] = await sql`
      UPDATE owners
      SET full_name = ${full_name || null},
          phone = ${phone || null},
          address = ${address || null}
      WHERE id = ${ownerId}
      RETURNING id, full_name, email, phone, address
    `;
    return Response.json(row);
  } catch (err) {
    console.error("PUT /api/owner/profile error:", err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}
