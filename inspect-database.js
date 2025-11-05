/**
 * Database Structure Inspector
 * Checks the current database schema structure
 */

const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function inspectDatabase() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    console.log("🔍 Inspecting database structure...\n");

    // Get all tables
    console.log("📋 Tables in database:");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log(tables.map((t) => `  - ${t.table_name}`).join("\n"));
    console.log("\n" + "=".repeat(80) + "\n");

    // Check if tenants_units exists
    const hasTenantsUnits = tables.some(
      (t) => t.table_name === "tenants_units"
    );

    if (hasTenantsUnits) {
      console.log("✅ tenants_units table EXISTS\n");

      // Get tenants_units structure
      console.log("📊 tenants_units table structure:");
      const columns = await sql`
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'tenants_units'
        ORDER BY ordinal_position
      `;

      columns.forEach((col) => {
        const nullable = col.is_nullable === "YES" ? "NULL" : "NOT NULL";
        const def = col.column_default ? ` DEFAULT ${col.column_default}` : "";
        console.log(
          `  - ${col.column_name}: ${col.data_type}${
            col.character_maximum_length
              ? `(${col.character_maximum_length})`
              : ""
          } ${nullable}${def}`
        );
      });

      // Get constraints
      console.log("\n🔒 Constraints:");
      const constraints = await sql`
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.table_name = 'tenants_units'
        ORDER BY tc.constraint_type, tc.constraint_name
      `;

      constraints.forEach((c) => {
        if (c.constraint_type === "FOREIGN KEY") {
          console.log(
            `  - ${c.constraint_name}: ${c.column_name} -> ${c.foreign_table_name}(${c.foreign_column_name})`
          );
        } else {
          console.log(
            `  - ${c.constraint_name}: ${c.constraint_type} on ${c.column_name}`
          );
        }
      });

      // Get indexes
      console.log("\n📇 Indexes:");
      const indexes = await sql`
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename = 'tenants_units'
        ORDER BY indexname
      `;

      indexes.forEach((idx) => {
        console.log(`  - ${idx.indexname}`);
      });
    } else {
      console.log("❌ tenants_units table DOES NOT EXIST\n");
    }

    // Check tenants table structure
    console.log("\n" + "=".repeat(80) + "\n");
    console.log("📊 tenants table structure:");
    const tenantCols = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'tenants'
      ORDER BY ordinal_position
    `;

    tenantCols.forEach((col) => {
      const nullable = col.is_nullable === "YES" ? "NULL" : "NOT NULL";
      console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}`);
    });

    // Check units table structure
    console.log("\n📊 units table structure:");
    const unitCols = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'units'
      ORDER BY ordinal_position
    `;

    unitCols.forEach((col) => {
      const nullable = col.is_nullable === "YES" ? "NULL" : "NOT NULL";
      console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}`);
    });
  } catch (error) {
    console.error("❌ Inspection failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

inspectDatabase();
