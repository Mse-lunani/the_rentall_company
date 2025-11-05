/**
 * Database Migration Script
 * Run this to create the tenants_units table in your PostgreSQL database
 *
 * Usage: node run-migration.js
 */

const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

async function runMigration() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    console.log("🔄 Connecting to database...");

    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "migration_add_tenants_units.sql"),
      "utf8"
    );

    console.log("📄 Running migration...");

    // Execute the migration
    await sql(migrationSQL);

    console.log("✅ Migration completed successfully!");
    console.log("📊 The tenants_units table has been created.");

    // Verify the table was created
    const result = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tenants_units'
      ORDER BY ordinal_position
    `;

    console.log("\n📋 Table structure:");
    result.forEach((col) => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
