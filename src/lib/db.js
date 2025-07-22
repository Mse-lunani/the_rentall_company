// src/lib/db.js
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

/**
 * Dynamically inserts a row into a given table.
 * @param {string} table - table name
 * @param {object} data - key-value pairs for the row
 * @param {string} returnCol - optional column to return (e.g., "id")
 * @returns inserted row or true if no return
 */
export async function insertRow(table, data, returnCol = null) {
  // Validate that table and keys are safe identifiers
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    throw new Error("Invalid table name");
  }

  const keys = Object.keys(data);
  const values = Object.values(data);

  const columns = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
    INSERT INTO "${table}" (${columns})
    VALUES (${placeholders})
    ${returnCol ? `RETURNING "${returnCol}"` : ""}
  `;

  console.log("Query:", query);
  console.log("Values:", values);

  const result = await sql.query(query, values);

  return returnCol ? result[0] : true;
}
export async function getRows(table) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    throw new Error("Invalid table name");
  }
  const result = await sql.query(`SELECT * FROM "${table}"`);
  return result;
}
export async function query(sqlStatement, params = []) {
  const result = await sql.query(sqlStatement, params);
  return result;
}

/**
 * Updates a row in the given table
 *
 * @param {string} table - Table name (safe identifier only)
 * @param {Object} data - Key-value pairs of columns to update
 * @param {Object} where - Key-value pairs for WHERE clause (e.g., { id: 1 })
 * @param {string|null} returnCol - Optional column name to return
 * @returns {Promise<any>} - Updated row (if returnCol) or `true`
 */
export async function updateRow(table, data, where, returnCol = null) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    throw new Error("Invalid table name");
  }

  const dataKeys = Object.keys(data);
  const dataValues = Object.values(data);

  const setClause = dataKeys.map((key, i) => `"${key}" = $${i + 1}`).join(", ");

  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);

  const whereClause = whereKeys
    .map((key, i) => `"${key}" = $${dataValues.length + i + 1}`)
    .join(" AND ");

  const values = [...dataValues, ...whereValues];

  const query = `
    UPDATE "${table}"
    SET ${setClause}
    WHERE ${whereClause}
    ${returnCol ? `RETURNING "${returnCol}"` : ""}
  `;

  console.log("Query:", query);
  console.log("Values:", values);

  const result = await sql.query(query, values);
  return returnCol ? result[0] : true;
}
/**
 * Deletes a row from the given table
 *
 * @param {string} table - Table name (safe identifier only)
 * @param {Object} where - Key-value pairs for WHERE clause (e.g., { id: 1 })
 * @returns {Promise<boolean>} - True if successful
 */
export async function deleteRow(table, where) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    throw new Error("Invalid table name");
  }

  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);

  const whereClause = whereKeys
    .map((key, i) => `"${key}" = $${i + 1}`)
    .join(" AND ");

  const query = `DELETE FROM "${table}" WHERE ${whereClause}`;

  console.log("Query:", query);
  console.log("Values:", whereValues);

  await sql.query(query, whereValues);
  return true;
}
