const express = require("express");
const router = express.Router();
const Demand = require("../models/demand");
const multer = require("multer");
const xlsx = require("xlsx");

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all Demand records
router.get("/", async (req, res) => {
  try {
    const demands = await Demand.getAll();
    res.json(demands);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Upload Excel and process data
router.post("/uploadAndProcess", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { raw: false });

    // Process each row and insert into database
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const row of jsonData) {
      try {
        await Demand.create(row);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: row,
          error: error.message
        });
        console.error(`Error processing row:`, row);
        console.error('Error details:', error);
        // Continue processing other rows
      }
    }

    res.json({ 
      message: "File processing completed",
      results: {
        totalRows: jsonData.length,
        successfulInserts: results.success,
        failedInserts: results.failed,
        errors: results.errors.slice(0, 10) // Limit error details to first 10 failures
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: "Server error",
      details: err.message 
    });
  }
});


router.get("/skillCountsByMonth", async (req, res) => {
  try {
    const { practice, market, offOn, busUnit } = req.query;

    // Validate required parameters
    if (!practice || !market || !offOn || !busUnit) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const query = "SELECT * FROM get_demand_skill_counts_by_month_pivot_v1($1, $2, $3, $4)";
    const queryParams = [practice, market, offOn, busUnit];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/top10AccountsCountsByMonth", async (req, res) => {
  try {
    const { practice, market, offOn, busUnit } = req.query;

    // Validate required parameters
    if (!practice || !market || !offOn || !busUnit) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const query = "SELECT * FROM get_demand_top10_accounts_counts_by_month_pivot_v1($1, $2, $3, $4)";
    const queryParams = [practice, market, offOn, busUnit];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/top10AccountsBreakUpCountsByMonth", async (req, res) => {
  try {
    const { practice, market, offOn, busUnit, account } = req.query;

    // Validate required parameters
    if (!practice || !market || !offOn || !busUnit || !account) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const query = "SELECT * FROM get_demand_top10_accounts_breakup_counts_by_month_pivot_v1($1, $2, $3, $4, $5)";
    const queryParams = [practice, market, offOn, busUnit, account];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
