/**
 * CSV Template Generation for Bulk Unit Upload
 * GET /api/csv-template/units?building_id=123
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const buildingId = searchParams.get("building_id");

  if (!buildingId) {
    return Response.json(
      { error: "building_id parameter is required" },
      { status: 400 }
    );
  }

  // CSV Headers with building_id pre-filled
  const headers = [
    "building_id",
    "name",
    "bedrooms",
    "bathrooms",
    "space_sqm",
    "floor_number",
    "amenities",
    "has_dsq",
    "rent_amount_kes",
    "deposit_amount_kes",
  ];

  // Sample data rows
  const sampleRows = [
    [
      buildingId,
      "A101",
      "2",
      "1",
      "75",
      "1",
      "WiFi Balcony Parking",
      "false",
      "25000",
      "50000",
    ],
    [
      buildingId,
      "A102",
      "3",
      "2",
      "95",
      "1",
      "WiFi Gym Access Security",
      "true",
      "30000",
      "60000",
    ],
    [
      buildingId,
      "A201",
      "2",
      "1",
      "80",
      "2",
      "WiFi Balcony",
      "false",
      "28000",
      "56000",
    ],
  ];

  // Generate CSV content
  const csvContent = [
    headers.join(","),
    ...sampleRows.map((row) => row.join(",")),
  ].join("\n");

  // Return as downloadable CSV file
  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="units_template_building_${buildingId}.csv"`,
    },
  });
}
