const express = require("express");
const router = express.Router();
const Demand = require("../models/demand");
const multer = require("multer");
const xlsx = require("xlsx");
const pool = require("../config/db");
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

    // Step 1: Truncate the table
    try {
      await pool.query('TRUNCATE TABLE "so_data_temp"');
    } catch (error) {
      console.error("Error truncating table:", error);
      return res.status(500).json({ error: "Error truncating table" });
    }

    // Step 2: Process the file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { raw: false });

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const row of jsonData) {
      try {
        await Demand.create(row);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: row,
          error: error.message,
        });
        console.error(`Error processing row:`, row);
        console.error("Error details:", error);
      }
    }

    // Step 3: Call the stored procedure
    try {
      await pool.query("CALL public.dsm_excel_db_load()");
    } catch (error) {
      console.error("Error calling stored procedure:", error);
      return res.status(500).json({ error: "Error calling stored procedure" });
    }

    res.json({
      message: "File processing completed",
      results: {
        totalRows: jsonData.length,
        successfulInserts: results.success,
        failedInserts: results.failed,
        errors: results.errors.slice(0, 10), // Limit error details to first 10 failures
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
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

    const query =
      "SELECT * FROM get_demand_skill_counts_by_month_pivot_v1($1, $2, $3, $4)";
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

    const query =
      "SELECT * FROM get_demand_top10_accounts_counts_by_month_pivot_v1($1, $2, $3, $4)";
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
    const { practice, market, offOn, busUnit } = req.query;
    // Validate required parameters
    if (!practice || !market || !offOn || !busUnit) {
      return res.status(400).json({ error: "Missing required parameters-" });
    }
    //get_demand_top10_accounts_breakup_counts_by_month_pivot_v1($1, $2, $3, $4, $5);
    const query =
      "SELECT * FROM get_demand_top10_accounts_counts_by_month_pivot_v1($1, $2, $3, $4)";
    const queryParams = [practice, market, offOn, busUnit];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/update", async (req, res) => {
  const {
    SoId,
    SOLineStatus,
    DemandType,
    DemandStatus,
    FulfilmentPlan,
    DemandCategory,
    SupplySource,
    RotationSO,
    SupplyAccount,
    IdentifiedAssoIdextCandidate,
    Identified_assoc_name,
    Grades,
    EffMonth,
    JoiningAllocationDate,
    AllocationWeek,
    IncludedInForecast,
    CrossSkillRequired,
    RemarksDetails,
  } = req.body;

  try {
    const query = `
      CALL public.demand_update(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
    `;
    const params = [
      SoId,
      SOLineStatus,
      DemandType,
      DemandStatus,
      FulfilmentPlan,
      DemandCategory,
      SupplySource,
      RotationSO,
      SupplyAccount,
      IdentifiedAssoIdextCandidate,
      Identified_assoc_name,
      Grades,
      EffMonth,
      JoiningAllocationDate,
      AllocationWeek,
      IncludedInForecast,
      CrossSkillRequired,
      RemarksDetails,
    ];

    await pool.query(query, params);
    res.status(200).json({ message: "Row updated successfully." });
  } catch (error) {
    console.error("Error updating demand:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dropdown", async (req, res) => {
  const { fieldName } = req.query;

  if (!fieldName) {
    console.error("Field name is missing in the request."); // Debug log
    return res.status(400).json({ error: "Field name is required" });
  }

  try {
    console.log(`Fetching dropdown values for field: ${fieldName}`); // Debug log
    const dropdownValues = await Demand.getDropdownValuesByType(fieldName);
    console.log(`Dropdown values for ${fieldName}:`, dropdownValues); // Debug log
    res.json(dropdownValues);
  } catch (error) {
    console.error("Error fetching dropdown values:", error);
    res.status(500).json({ error: "Failed to fetch dropdown values" });
  }
});

router.get("/audit_history", async (req, res) => {
  const { unique_id } = req.query;
  if (!unique_id) {
    return res.status(400).json({ error: "unique_id is required" });
  }
  try {
    const query = `
      SELECT auditid, so_id, status, roles, modified_date, modified_by, comments
      FROM public.sdm_audit_history
      WHERE so_id = $1
    `;
    const { rows } = await pool.query(query, [unique_id]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching audit history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/audit_insert", async (req, res) => {
  const { soid, status, roles, modifieddate, modifiedby, notes } = req.body;
  // Updated required parameters: make 'status' optional
  if (!soid || !modifieddate || !modifiedby) {
    return res
      .status(400)
      .json({
        error: "Missing required parameters: soid, modifieddate, or modifiedby",
      });
  }
  const auditStatus = status || ""; // default to an empty string if not provided

  try {
    const query = `CALL public.dsm_audit_insert($1, $2, $3, $4, $5, $6)`;
    const params = [soid, auditStatus, roles, modifieddate, modifiedby, notes];
    await pool.query(query, params);
    res.json({ message: "Audit record inserted successfully." });
  } catch (error) {
    console.error("Error inserting audit record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
