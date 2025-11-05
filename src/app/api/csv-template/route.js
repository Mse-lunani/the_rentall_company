export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "tenant-assignments";

  if (type === "tenant-assignments") {
    // CSV template for bulk tenant creation and assignments (new tenants)
    const csvContent = `full_name,phone,email,unit_name,start_date,monthly_rent,deposit,lease_terms,notes
John Doe,+254712345678,john.doe@example.com,Unit A1,2025-01-15,25000,50000,12 months renewable,Corporate tenant
Jane Smith,+254723456789,jane.smith@example.com,Unit B2,2025-02-01,30000,60000,6 months contract,Prefers ground floor
Michael Johnson,+254734567890,,Unit C3,2025-01-20,,,Standard lease,Good payment history
Sarah Williams,+254745678901,sarah.w@example.com,Unit D1,2025-03-01,20000,40000,,Student tenant`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          'attachment; filename="tenant_assignments_template.csv"',
      },
    });
  }

  return Response.json({ error: "Invalid template type" }, { status: 400 });
}
