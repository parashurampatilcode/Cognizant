const pool = require("../config/db");

/**
 * Bulk insert unique allocation employee data using the provided records.
 * Each record should have assoId, assoName, and grade.
 * Uses a single transaction and calls the function in batch for performance.
 */
async function bulkInsert(records) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Use a single multi-row VALUES call for performance
    const values = [];
    const params = [];
    let paramIndex = 1;
    for (const rec of records) {
      values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      params.push(rec.assoId, rec.assoName, rec.grade);
    }
    const sql = `
      INSERT INTO unique_allocation_temp (asso_id, asso_name, grade)
      VALUES ${values.join(",")}
      RETURNING *;
    `;
    // Insert into a temp table, then call the function in batch
    await client.query(`CREATE TEMP TABLE IF NOT EXISTS unique_allocation_temp (
      asso_id TEXT, asso_name TEXT, grade TEXT
    ) ON COMMIT DROP;`);
    const insertResult = await client.query(sql, params);
    // Now call the function for each row
    for (const row of insertResult.rows) {
      await client.query(
        `CALL public.insert_unique_allocation_employee_data($1, $2, $3);`,
        [row.asso_id, row.asso_name, row.grade]
      );
    }
    await client.query("COMMIT");
    return { rowCount: records.length };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { bulkInsert };
