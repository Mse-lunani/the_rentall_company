import { sql, requireOwnerIdOr401 } from "../../_common";
import Papa from "papaparse";

/**
 * CSV Upload API for Bulk Unit Creation (Owner-specific)
 * POST /api/owner/csv-upload/units
 * Automatically adds owner_id to all units
 */
export async function POST(request) {
  // Authenticate owner
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith(".csv")) {
      return Response.json({ error: "File must be a CSV" }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (parseResult.errors.length > 0) {
      return Response.json(
        {
          error: "CSV parsing failed",
          details: parseResult.errors,
        },
        { status: 400 }
      );
    }

    const rows = parseResult.data;

    if (rows.length === 0) {
      return Response.json({ error: "CSV file is empty" }, { status: 400 });
    }

    if (rows.length > 500) {
      return Response.json(
        {
          error: "Too many rows. Maximum 500 rows per upload.",
        },
        { status: 400 }
      );
    }

    // Validate and process rows
    const errors = [];
    const validRows = [];
    const duplicateCheck = new Set();

    // First pass: Validate all rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because: +1 for array index, +1 for header row
      const rowErrors = [];

      // Required field: building_id
      if (!row.building_id || row.building_id.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "building_id",
          value: row.building_id,
          error: "Building ID is required",
        });
      } else {
        const buildingId = parseInt(row.building_id);
        if (isNaN(buildingId) || buildingId <= 0) {
          rowErrors.push({
            row: rowNumber,
            field: "building_id",
            value: row.building_id,
            error: "Building ID must be a positive number",
          });
        }
      }

      // Required field: name (unit name)
      if (!row.name || row.name.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "name",
          value: row.name,
          error: "Unit name is required",
        });
      }

      // Required field: bedrooms
      if (!row.bedrooms || row.bedrooms.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "bedrooms",
          value: row.bedrooms,
          error: "Number of bedrooms is required",
        });
      } else {
        const bedrooms = parseInt(row.bedrooms);
        if (isNaN(bedrooms) || bedrooms <= 0) {
          rowErrors.push({
            row: rowNumber,
            field: "bedrooms",
            value: row.bedrooms,
            error: "Bedrooms must be a positive number",
          });
        }
      }

      // Required field: bathrooms
      if (!row.bathrooms || row.bathrooms.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "bathrooms",
          value: row.bathrooms,
          error: "Number of bathrooms is required",
        });
      } else {
        const bathrooms = parseInt(row.bathrooms);
        if (isNaN(bathrooms) || bathrooms <= 0) {
          rowErrors.push({
            row: rowNumber,
            field: "bathrooms",
            value: row.bathrooms,
            error: "Bathrooms must be a positive number",
          });
        }
      }

      // Required field: space_sqm
      if (!row.space_sqm || row.space_sqm.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "space_sqm",
          value: row.space_sqm,
          error: "Space (sqm) is required",
        });
      } else {
        const space = parseFloat(row.space_sqm);
        if (isNaN(space) || space <= 0) {
          rowErrors.push({
            row: rowNumber,
            field: "space_sqm",
            value: row.space_sqm,
            error: "Space must be a positive number",
          });
        }
      }

      // Required field: floor_number
      if (!row.floor_number || row.floor_number.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "floor_number",
          value: row.floor_number,
          error: "Floor number is required",
        });
      } else {
        const floor = parseInt(row.floor_number);
        if (isNaN(floor)) {
          rowErrors.push({
            row: rowNumber,
            field: "floor_number",
            value: row.floor_number,
            error: "Floor number must be a number",
          });
        }
      }

      // Optional field: has_dsq (boolean)
      if (row.has_dsq && row.has_dsq.trim() !== "") {
        const validBooleans = ["true", "false", "yes", "no", "1", "0"];
        if (!validBooleans.includes(row.has_dsq.trim().toLowerCase())) {
          rowErrors.push({
            row: rowNumber,
            field: "has_dsq",
            value: row.has_dsq,
            error: "has_dsq must be true/false, yes/no, or 1/0",
          });
        }
      }

      // Required field: rent_amount_kes
      if (!row.rent_amount_kes || row.rent_amount_kes.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "rent_amount_kes",
          value: row.rent_amount_kes,
          error: "Rent amount is required",
        });
      } else {
        const rent = parseFloat(row.rent_amount_kes);
        if (isNaN(rent) || rent <= 0) {
          rowErrors.push({
            row: rowNumber,
            field: "rent_amount_kes",
            value: row.rent_amount_kes,
            error: "Rent amount must be a positive number",
          });
        }
      }

      // Required field: deposit_amount_kes
      if (!row.deposit_amount_kes || row.deposit_amount_kes.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "deposit_amount_kes",
          value: row.deposit_amount_kes,
          error: "Deposit amount is required",
        });
      } else {
        const deposit = parseFloat(row.deposit_amount_kes);
        if (isNaN(deposit) || deposit <= 0) {
          rowErrors.push({
            row: rowNumber,
            field: "deposit_amount_kes",
            value: row.deposit_amount_kes,
            error: "Deposit amount must be a positive number",
          });
        }
      }

      // Check for duplicate unit names within the same building in CSV
      if (row.building_id && row.name) {
        const key = `${row.building_id.trim()}-${row.name.trim()}`;
        if (duplicateCheck.has(key)) {
          rowErrors.push({
            row: rowNumber,
            field: "name",
            value: row.name,
            error: `Duplicate unit name "${row.name}" for building ID ${row.building_id} in CSV`,
          });
        } else {
          duplicateCheck.add(key);
        }
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        // Helper function to parse boolean values
        const parseBoolean = (val) => {
          if (!val || val.trim() === "") return false;
          const normalized = val.trim().toLowerCase();
          return (
            normalized === "true" || normalized === "yes" || normalized === "1"
          );
        };

        validRows.push({
          rowNumber,
          building_id: parseInt(row.building_id),
          name: row.name.trim(),
          bedrooms: parseInt(row.bedrooms),
          bathrooms: parseInt(row.bathrooms),
          space_sqm: parseFloat(row.space_sqm),
          floor_number: parseInt(row.floor_number),
          amenities: row.amenities?.trim() || null,
          has_dsq: parseBoolean(row.has_dsq),
          rent_amount_kes: parseFloat(row.rent_amount_kes),
          deposit_amount_kes: parseFloat(row.deposit_amount_kes),
        });
      }
    }

    // If there are validation errors, return them without processing
    if (errors.length > 0) {
      return Response.json(
        {
          success: false,
          message: "Validation failed. Please fix the errors and try again.",
          totalRows: rows.length,
          validRows: validRows.length,
          errorCount: errors.length,
          errors: errors,
        },
        { status: 400 }
      );
    }

    // Second pass: Check database existence for buildings (owner-specific)
    const dbErrors = [];
    const buildingIds = [...new Set(validRows.map((r) => r.building_id))];

    // Check if all buildings exist AND belong to this owner
    const existingBuildings = await sql`
      SELECT id, name, owner_id FROM buildings 
      WHERE id = ANY(${buildingIds}) AND owner_id = ${ownerId}
    `;
    const existingBuildingIds = new Set(existingBuildings.map((b) => b.id));

    // Check for missing buildings or buildings not owned by this owner
    for (const buildingId of buildingIds) {
      if (!existingBuildingIds.has(buildingId)) {
        const affectedRows = validRows
          .filter((r) => r.building_id === buildingId)
          .map((r) => r.rowNumber)
          .join(", ");
        dbErrors.push({
          row: affectedRows,
          field: "building_id",
          value: buildingId,
          error: `Building ID ${buildingId} does not exist or you don't have permission to add units to it`,
        });
      }
    }

    // Check for duplicate unit names in database
    for (const row of validRows) {
      if (existingBuildingIds.has(row.building_id)) {
        const existingUnit = await sql`
          SELECT id, name FROM units 
          WHERE building_id = ${row.building_id} AND name = ${row.name}
        `;
        if (existingUnit.length > 0) {
          dbErrors.push({
            row: row.rowNumber,
            field: "name",
            value: row.name,
            error: `Unit name "${row.name}" already exists in building ID ${row.building_id}`,
          });
        }
      }
    }

    if (dbErrors.length > 0) {
      return Response.json(
        {
          success: false,
          message:
            "Database validation failed. Some buildings do not exist, you don't own them, or unit names are duplicates.",
          totalRows: rows.length,
          validRows: 0,
          errorCount: dbErrors.length,
          errors: dbErrors,
        },
        { status: 400 }
      );
    }

    // Third pass: Create units with transaction (automatically adding owner_id)
    const successfulUnits = [];
    const insertErrors = [];

    await sql`BEGIN`;

    try {
      for (const row of validRows) {
        try {
          const [newUnit] = await sql`
            INSERT INTO units (
              building_id,
              owner_id,
              name,
              bedrooms,
              bathrooms,
              space_sqm,
              floor_number,
              amenities,
              has_dsq,
              rent_amount_kes,
              deposit_amount_kes
            ) VALUES (
              ${row.building_id},
              ${ownerId},
              ${row.name},
              ${row.bedrooms},
              ${row.bathrooms},
              ${row.space_sqm},
              ${row.floor_number},
              ${row.amenities},
              ${row.has_dsq},
              ${row.rent_amount_kes},
              ${row.deposit_amount_kes}
            )
            RETURNING id, name, building_id
          `;

          // Get building name for response
          const building = existingBuildings.find(
            (b) => b.id === row.building_id
          );

          successfulUnits.push({
            row: row.rowNumber,
            unit_id: newUnit.id,
            unit_name: newUnit.name,
            building_id: newUnit.building_id,
            building_name: building?.name || "Unknown",
            bedrooms: row.bedrooms,
            bathrooms: row.bathrooms,
            space_sqm: row.space_sqm,
            rent: row.rent_amount_kes,
            deposit: row.deposit_amount_kes,
          });
        } catch (insertError) {
          insertErrors.push({
            row: row.rowNumber,
            field: "database",
            value: `Unit ${row.name} in Building ${row.building_id}`,
            error: insertError.message,
          });
        }
      }

      // If any insert errors, rollback
      if (insertErrors.length > 0) {
        await sql`ROLLBACK`;
        return Response.json(
          {
            success: false,
            message: "Database insertion failed. Transaction rolled back.",
            totalRows: rows.length,
            successfulUnits: 0,
            errorCount: insertErrors.length,
            errors: insertErrors,
          },
          { status: 500 }
        );
      }

      // Commit transaction
      await sql`COMMIT`;

      return Response.json({
        success: true,
        message: `Successfully created ${successfulUnits.length} units!`,
        totalRows: rows.length,
        successfulUnits: successfulUnits.length,
        failedUnits: 0,
        units: successfulUnits,
      });
    } catch (error) {
      await sql`ROLLBACK`;
      console.error("CSV upload error:", error);
      return Response.json(
        {
          success: false,
          message: "An unexpected error occurred during processing.",
          error: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("CSV upload error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to process CSV file",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
