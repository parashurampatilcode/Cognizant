// c:\Users\Parashuram\Projects\ei-demand-supply-tool-Parashuram-branch\Cognizant\server\routes\dashboard.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/report", async (req, res) => {
  try {
    const { practice, market, offOn } = req.query;

    // Validate required parameters
    if (!practice || !market || !offOn) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const query = "SELECT * FROM demandsupplymainview($1, $2, $3)";
    const queryParams = [practice, market, offOn];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/detailview", async (req, res) => {
  try {
    const { practice, market, offOn, skill } = req.query; // Receive all four parameters

    // Validate required parameters
    if (!practice || !market || !offOn || !skill) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const query = "SELECT * FROM demandsupplydetailview($1, $2, $3, $4)"; // Update the query
    const queryParams = [practice, market, offOn, skill]; // Pass all four parameters

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
