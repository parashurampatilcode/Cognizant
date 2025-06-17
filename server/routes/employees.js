const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Get employee name by employee ID
router.get("/getEmployeeById", async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const query =
      "SELECT employee_id, employee_name, grade FROM employees WHERE employee_id = $1";
    const { rows } = await pool.query(query, [employeeId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all employees
router.get("/", async (req, res) => {
  try {
    const query = "SELECT employee_id, employee_name FROM employees";
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
