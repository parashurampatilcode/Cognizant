const express = require("express");
const router = express.Router();
const Demand = require("../models/demand");
const multer = require("multer");
const xlsx = require("xlsx");
const pool = require("../config/db");
// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const jwt = require("jsonwebtoken");

// Replace with your JWT secret or use your public key if using RS256
const JWT_SECRET = process.env.JWT_SECRET;

function getLoggedInUserId(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log("Authorization header:", authHeader); // Debug
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded JWT:", decoded); // Debug
    return decoded.username || decoded.id || decoded.sub || null;
  } catch (e) {
    console.error("JWT decode error:", e);
    return null;
  }
}


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
  console.log("Received file:", req.file); // Debug
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Step 1: Truncate the table
    try {
      await pool.query('TRUNCATE TABLE "so_stage"');
      console.log("Table truncated successfully.");
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
      // await pool.query("CALL public.transform_so_stage_to_main()");
      await pool.query("select * from  public.transform_so_stage_to_main()");
      console.log("Stored procedure called successfully.");
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
  const SoId = req.body.SoId;
  const SOLineStatus = req.body.SOLineStatus;
  const DemandType = req.body["Demand Type"];
  const DemandStatus = req.body["Demand Status"];
  const FulfilmentPlan = req.body["Fulfilment Plan"];
  const DemandCategory = req.body["Demand Category"];
  const SupplySource = req.body["Supply Source"];
  const RotationSO = req.body["Rotation So"];
  const SupplyAccount = req.body["Supply Account"];
  const IdentifiedAssoIdExtCandidateId =
    req.body["Identified Asso Id Ext Candidate Id"];
  const IdentifiedAssocName = req.body["Identified Assoc Name"];
  const Grades = req.body.Grades;
  const EffMonth = req.body["Eff Month"];
  const AllocationDate = req.body["Allocation Date"];
  const AllocationWeek = req.body["Allocation Week"];
  const IncludedInForecast = req.body["Included In Forecast"];
  const CrossSkillRequired = req.body["Cross Skill Required"];
  const RemarksDetails = req.body["Remarks Details"];

  try {
    const query = `
      CALL public.update_so_data_main(
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
      IdentifiedAssoIdExtCandidateId,
      IdentifiedAssocName,
      Grades,
      EffMonth,
      AllocationDate,
      AllocationWeek,
      IncludedInForecast,
      CrossSkillRequired,
      RemarksDetails,
    ];
    console.log("Executing query:", query, "with params:", params); // 
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
    //console.log(`Dropdown values for ${fieldName}:`, dropdownValues); // Debug log
    res.json(dropdownValues);
  } catch (error) {
    console.error("Error fetching dropdown values:", error);
    res.status(500).json({ error: "Failed to fetch dropdown values" });
  }
});

router.get("/dropdownBySubType", async (req, res) => {
  const { fieldName } = req.query;
  const { subType } = req.query;

  if (!fieldName && !subType ) {
    console.error("Field name or subtype is missing in the request."); // Debug log
    return res.status(400).json({ error: "Field name and Sub Type are required" });
  }

  try {
    console.log(`Fetching dropdown values for field: ${fieldName}`); // Debug log
    console.log(`Fetching dropdown values for subtype: ${subType}`); // Debug log
    const dropdownValues = await Demand.getDropdownValuesByTypeAndSubType(fieldName,subType);
    //console.log(`Dropdown values for ${fieldName}:`, dropdownValues); // Debug log
    res.json(dropdownValues);
  } catch (error) {
    console.error("Error fetching dropdown values by subtype:", error);
    res.status(500).json({ error: "Failed to fetch dropdown values by sub type" });
  }
});

router.get("/audit_history", async (req, res) => {
  const { unique_id } = req.query;
  
  if (!unique_id) {
    return res.status(400).json({ error: "unique_id is required" });
  }
  try {
    const query = `
      SELECT sdm_audit_history as auditid, so_id, status, roles, modified_date, modified_by, comments, demand_type, demand_status,
      fulfilment_plan, demand_category, supply_source, rotation_so, supply_account,identified_assoc_id_external_candidate_id ,
      identified_assoc_name, grade, eff_month, joining_allocation_date, allocation_week, included_in_forecast, cross_skill_required_yes_no,
      remarks_details
      FROM public.ds_sdm_audit_history
      WHERE so_id = $1 order by modified_date desc
    `;
    const { rows } = await pool.query(query, [unique_id]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching audit history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/audit_insert", async (req, res) => {
  const userId = getLoggedInUserId(req);
  console.log("User ID from JWT:", userId); // Debug
  const SoId = req.body.SoId;
  const SOLineStatus = req.body.SOLineStatus;
  const DemandType = req.body["Demand Type"];
  const DemandStatus = req.body["Demand Status"];
  const FulfilmentPlan = req.body["Fulfilment Plan"];
  const DemandCategory = req.body["Demand Category"];
  const SupplySource = req.body["Supply Source"];
  const RotationSO = req.body["Rotation So"];
  const SupplyAccount = req.body["Supply Account"];
  const IdentifiedAssoIdExtCandidateId =
    req.body["Identified Asso Id Ext Candidate Id"];
  const IdentifiedAssocName = req.body["Identified Assoc Name"];
  const Grades = req.body.Grades;
  const EffMonth = req.body["Eff Month"];
  const AllocationDate = req.body["Allocation Date"];
  const AllocationWeek = req.body["Allocation Week"];
  const IncludedInForecast = req.body["Included In Forecast"];
  const CrossSkillRequired = req.body["Cross Skill Required"];
  const RemarksDetails = req.body["Remarks Details"];
  //console.log("User ID from JWT:", userId); // Debug log
  //const { soid, status, roles, demandType, demandStatus, notes,fulfilmentPlan,demandCategory,supplySource,rotationSO,supplyAccount,
   // identifiedAssoIdExtCandidateId,identifiedAssocName,grades,effMonth,allocationDate,allocationWeek,includedInForecast,crossSkillRequired,
   // remarksDetails } = req.body;
  // Updated required parameters: make 'status' optional
  if (!SoId) {
    return res.status(400).json({
      error: "Missing required parameters: soid",
    });
  }
  const auditStatus = SOLineStatus || ""; // default to an empty string if not provided

  try {
    const query = `CALL public.ds_insert_so_data_to_audit_history($1, $2, $3, $4, $5, $6, $7, $8, $9,
       $10, $11, $12, $13, $14, $15, $16, $17, $18,$19, $20, $21)`;
    const params = [SoId, auditStatus, "",userId,"",AllocationWeek ,CrossSkillRequired,DemandCategory,DemandStatus,DemandType,
      EffMonth, FulfilmentPlan,Grades,IdentifiedAssoIdExtCandidateId,IdentifiedAssocName,IncludedInForecast,RemarksDetails,RotationSO,
      SupplyAccount, SupplySource, AllocationDate];
    await pool.query(query, params);
    res.json({ message: "Audit record inserted successfully." });
  } catch (error) {
    console.error("Error inserting audit record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
