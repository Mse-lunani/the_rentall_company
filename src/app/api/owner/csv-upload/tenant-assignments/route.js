import { sql, requireOwnerIdOr401 } from "../../_common";
import Papa from "papaparse";

/**
 * CSV Upload API for Bulk Tenant Creation and Assignments (Owner-specific)
 * POST /api/owner/csv-upload/tenant-assignments
 * Only allows uploads for units owned by the logged-in owner
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

      // Required field: full_name
      if (!row.full_name || row.full_name.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "full_name",
          value: row.full_name,
          error: "Full name is required",
        });
      }

      // Required field: phone
      if (!row.phone || row.phone.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "phone",
          value: row.phone,
          error: "Phone number is required",
        });
      }

      // Optional field: email (validate format if provided)
      if (row.email && row.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email.trim())) {
          rowErrors.push({
            row: rowNumber,
            field: "email",
            value: row.email,
            error: "Invalid email format",
          });
        }
      }

      // Required field: unit_name
      if (!row.unit_name || row.unit_name.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "unit_name",
          value: row.unit_name,
          error: "Unit name is required",
        });
      }

      // Required field: start_date
      if (!row.start_date || row.start_date.trim() === "") {
        rowErrors.push({
          row: rowNumber,
          field: "start_date",
          value: row.start_date,
          error: "Start date is required",
        });
      } else {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(row.start_date)) {
          rowErrors.push({
            row: rowNumber,
            field: "start_date",
            value: row.start_date,
            error: "Invalid date format. Use YYYY-MM-DD (e.g., 2025-01-15)",
          });
        } else {
          const date = new Date(row.start_date);
          if (isNaN(date.getTime())) {
            rowErrors.push({
              row: rowNumber,
              field: "start_date",
              value: row.start_date,
              error: "Invalid date value",
            });
          }
        }
      }

      // Optional field: monthly_rent
      if (row.monthly_rent && row.monthly_rent.trim() !== "") {
        const rent = parseFloat(row.monthly_rent);
        if (isNaN(rent) || rent < 0) {
          rowErrors.push({
            row: rowNumber,
            field: "monthly_rent",
            value: row.monthly_rent,
            error: "Monthly rent must be a positive number",
          });
        }
      }

      // Optional field: deposit_paid
      if (row.deposit_paid && row.deposit_paid.trim() !== "") {
        const deposit = parseFloat(row.deposit_paid);
        if (isNaN(deposit) || deposit < 0) {
          rowErrors.push({
            row: rowNumber,
            field: "deposit_paid",
            value: row.deposit_paid,
            error: "Deposit paid must be a positive number",
          });
        }
      }

      // Check for duplicate phone numbers in CSV (each tenant should be unique)
      const phone = row.phone.trim();
      const unitName = row.unit_name.trim();
      const key = `${phone}-${unitName}`;

      if (duplicateCheck.has(key)) {
        rowErrors.push({
          row: rowNumber,
          field: "phone,unit_name",
          value: key,
          error: `Duplicate assignment: Phone ${phone} to Unit ${unitName} appears multiple times in CSV`,
        });
      } else {
        duplicateCheck.add(key);
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        validRows.push({
          rowNumber,
          full_name: row.full_name.trim(),
          phone: row.phone.trim(),
          email: row.email?.trim() || null,
          unit_name: row.unit_name.trim(),
          start_date: row.start_date,
          monthly_rent:
            row.monthly_rent && row.monthly_rent.trim() !== ""
              ? parseFloat(row.monthly_rent)
              : null,
          deposit_paid:
            row.deposit_paid && row.deposit_paid.trim() !== ""
              ? parseFloat(row.deposit_paid)
              : null,
          lease_terms: row.lease_terms?.trim() || null,
          notes: row.notes?.trim() || null,
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

    // Second pass: Check database existence for units only (owner-specific)
    const dbErrors = [];
    const unitNames = [...new Set(validRows.map((r) => r.unit_name))];
    const phoneNumbers = [...new Set(validRows.map((r) => r.phone))];

    // Check if any phone numbers already exist in tenants table
    const existingPhones = await sql`
      SELECT phone FROM tenants WHERE phone = ANY(${phoneNumbers})
    `;
    const existingPhoneSet = new Set(existingPhones.map((t) => t.phone));

    // Check if all units exist, belong to this owner, and get unit details
    const existingUnits = await sql`
      SELECT u.id, u.name, u.rent_amount_kes, u.deposit_amount_kes, u.building_id, u.owner_id, b.name as building_name 
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.name = ANY(${unitNames}) AND u.owner_id = ${ownerId}
    `;

    // Create a map of unit name to unit details (to handle duplicates)
    const unitsByName = new Map();
    for (const unit of existingUnits) {
      if (!unitsByName.has(unit.name)) {
        unitsByName.set(unit.name, []);
      }
      unitsByName.get(unit.name).push(unit);
    }

    // Validate phone uniqueness and unit existence, and handle duplicate unit names
    const unitResolutionNeeded = [];
    for (const row of validRows) {
      // Check if phone number already exists
      if (existingPhoneSet.has(row.phone)) {
        dbErrors.push({
          row: row.rowNumber,
          field: "phone",
          value: row.phone,
          error: `Phone number ${row.phone} already exists in database. Each tenant must have a unique phone number.`,
        });
      }

      const matchingUnits = unitsByName.get(row.unit_name);
      if (!matchingUnits || matchingUnits.length === 0) {
        dbErrors.push({
          row: row.rowNumber,
          field: "unit_name",
          value: row.unit_name,
          error: `Unit "${row.unit_name}" does not exist in your properties or you don't have permission to assign tenants to it.`,
        });
      } else if (matchingUnits.length > 1) {
        // Multiple units with same name - need clarification
        const buildingInfo = matchingUnits
          .map((u) => `${u.building_name || "Unknown Building"} (ID: ${u.id})`)
          .join(", ");
        dbErrors.push({
          row: row.rowNumber,
          field: "unit_name",
          value: row.unit_name,
          error: `Duplicate unit name "${row.unit_name}" found in multiple buildings: ${buildingInfo}. Please use a unique unit name or provide building information.`,
        });
        unitResolutionNeeded.push({
          row: row.rowNumber,
          unit_name: row.unit_name,
          options: matchingUnits.map((u) => ({
            unit_id: u.id,
            building_name: u.building_name || "Unknown",
            building_id: u.building_id,
          })),
        });
      } else {
        // Single match - save the unit_id for later use
        row.unit_id = matchingUnits[0].id;
      }
    }

    if (dbErrors.length > 0) {
      const response = {
        success: false,
        message:
          "Database validation failed. Some phone numbers already exist, unit names do not exist in your properties, or unit names are ambiguous.",
        totalRows: rows.length,
        validRows: 0,
        errorCount: dbErrors.length,
        errors: dbErrors,
      };

      // Add unit resolution info if there are duplicate unit names
      if (unitResolutionNeeded.length > 0) {
        response.unitResolutionNeeded = unitResolutionNeeded;
      }

      return Response.json(response, { status: 400 });
    }

    // Third pass: Create tenants and assignments with transaction
    const successfulAssignments = [];
    const insertErrors = [];

    await sql`BEGIN`;

    try {
      for (const row of validRows) {
        try {
          // Get unit details for default rent/deposit (unit_id was set during validation)
          const unit = existingUnits.find((u) => u.id === row.unit_id);

          const finalRent =
            row.monthly_rent !== null ? row.monthly_rent : unit.rent_amount_kes;
          const finalDeposit =
            row.deposit_paid !== null
              ? row.deposit_paid
              : unit.deposit_amount_kes;

          // Step 1: Create new tenant
          const [newTenant] = await sql`
            INSERT INTO tenants (
              full_name,
              phone,
              email
            ) VALUES (
              ${row.full_name},
              ${row.phone},
              ${row.email}
            )
            RETURNING id, full_name
          `;

          // Step 2: Insert into tenants_units (tenancy assignment)
          const [assignment] = await sql`
            INSERT INTO tenants_units (
              tenant_id,
              unit_id,
              start_date,
              monthly_rent,
              deposit_paid,
              lease_terms,
              notes,
              occupancy_status
            ) VALUES (
              ${newTenant.id},
              ${row.unit_id},
              ${row.start_date},
              ${finalRent},
              ${finalDeposit},
              ${row.lease_terms},
              ${row.notes},
              'active'
            )
            RETURNING id
          `;

          successfulAssignments.push({
            row: row.rowNumber,
            assignment_id: assignment.id,
            tenant_id: newTenant.id,
            tenant_name: newTenant.full_name,
            tenant_phone: row.phone,
            unit_id: row.unit_id,
            unit_name: unit.name,
            building_name: unit.building_name,
            start_date: row.start_date,
          });
        } catch (insertError) {
          insertErrors.push({
            row: row.rowNumber,
            field: "database",
            value: `${row.full_name} (${row.phone}) to Unit ${row.unit_name}`,
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
            successfulAssignments: 0,
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
        message: `Successfully created ${successfulAssignments.length} tenant assignments!`,
        totalRows: rows.length,
        successfulAssignments: successfulAssignments.length,
        failedAssignments: 0,
        assignments: successfulAssignments,
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
