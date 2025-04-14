const express = require("express");
const router = express.Router();
const PDP = require("../models/pdp");
const multer = require("multer");
const xlsx = require("xlsx");
const pool = require("../config/db");
// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all PDP records
router.get("/", async (req, res) => {
  try {
    const pdps = await PDP.getAll();
    res.json(pdps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new PDP record
router.post("/", async (req, res) => {
  try {
    const pdp = await PDP.create(req.body);
    res.json(pdp);
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
    for (const row of jsonData) {
      // Function to handle integer values
      const getIntValue = (value) => {
        if (value === undefined || value === null || value === "") {
          return null; // Handle missing values as NULL
        }
        if (isNaN(value)) {
          console.error(`Invalid integer value: ${value}`);
          return null; // Handle non-numeric values as NULL
        }
        return parseInt(value, 10);
      };

      // Handle integer columns
      const employeeId = getIntValue(row.EmployeeId);
      const hackersRankScore = getIntValue(row.HackersRankScore);

      // Create the PDP object
      await PDP.create({
        PDPTranId: row.PDPTranId,
        EmployeeId: employeeId,
        EmployeeName: row.EmployeeName,
        Grade: row.Grade,
        PrimarySkill: row.PrimarySkill,
        SecondarySkill: row.SecondarySkill,
        HackersRankScore: hackersRankScore,
        Location: row.Location,
        ProjectId: row.ProjectId,
        ProjectName: row.ProjectName,
        AllocationStartDate: row.AllocationStartDate,
        AllocationEndDate: row.AllocationEndDate,
        Vertical: row.Vertical,
        Practice: row.Practice,
        DepartmentName: row.DepartmentName,
        ReleasingProjectId: row.ReleasingProjectId,
        ReleasingProjectName: row.ReleasingProjectName,
        ReleasingAccountName: row.ReleasingAccountName,
        ReleasingMarketUnit: row.ReleasingMarketUnit,
        ReleasingBusinessUnit: row.ReleasingBusinessUnit,
        ReleasingProjectPMID: row.ReleasingProjectPMID,
        ReleasingProjectPMName: row.ReleasingProjectPMName,
        Region: row.Region,
        Action: row.Action,
        ProposedBU: row.ProposedBU,
        ActionDate: row.ActionDate,
        "Displayed Project - Allocation%":
          row["Displayed Project - Allocation%"],
        "Deployable %": row["Deployable %"],
        "Billability %": row["Billability %"],
        Comments: row.Comments,
        PreviousComments: row.PreviousComments,
        PDPAgeing: row.PDPAgeing,
        Visibility: row.Visibility,
        "HR Status": row["HR Status"],
        Campus: row.Campus,
        "ADP Ageing": row["ADP Ageing"],
        BenchAgeing: row.BenchAgeing,
        AgeingBucket: row.AgeingBucket,
        DateOfJoining: row.DateOfJoining,
        PriorityBilling: row.PriorityBilling,
        PDPPolicy: row.PDPPolicy,
        PDPPolicyInitiationDate: row.PDPPolicyInitiationDate,
        OnVCDP: row.OnVCDP,
        DateOfPostingToVCDP: row.DateOfPostingToVCDP,
        ProjectedReleaseDate: row.ProjectedReleaseDate,
        Proposal1Documentation: row.Proposal1Documentation,
        Proposal2Documentation: row.Proposal2Documentation,
        Proposal3Documentation: row.Proposal3Documentation,
        AssociateonapprovedBenefitsLeave: row.AssociateonapprovedBenefitsLeave,
        WasAssociateonBenchbeforegoingonBenefitsLeave:
          row.WasAssociateonBenchbeforegoingonBenefitsLeave,
        COOApproval: row.COOApproval,
        COOApprovalTillDate: row.COOApprovalTillDate,
        ProposedAccountName: row.ProposedAccountName,
        PoCName: row.PoCName,
      });
    }

    res.json({ message: "File processed and data inserted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


//Get EI PDP A+ data

router.get("/getEIAPlusPDPData", async (req, res) => {
  try {
     const { region,  offOn } = req.query;
     // Validate required parameters
     if ( !region || !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    console.log("region",region);
    const query = "SELECT * FROM get_ei_a_plus_pdp_data($1, $2)";
    const queryParams = [region, offOn];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Get EI PDP P* data

router.get("/getEIPStarPDPData", async (req, res) => {
  try {
     const { region,  offOn } = req.query;
     // Validate required parameters
     if ( !region || !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    console.log("region",region);
    const query = "SELECT * FROM get_ei_p_star_pdp_data($1, $2)";
    const queryParams = [region, offOn];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Get DPO PDP A+ data

router.get("/getDPOAPlusPDPData", async (req, res) => {
  try {
     const { region,  offOn } = req.query;
     // Validate required parameters
     if ( !region || !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    console.log("region",region);
    const query = "SELECT * FROM get_dpo_a_plus_pdp_data($1, $2)";
    const queryParams = [region, offOn];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Get DPO PDP P* data

router.get("/getDPOPStarPDPData", async (req, res) => {
  try {
     const { region,  offOn } = req.query;
     // Validate required parameters
     if ( !region || !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    console.log("region",region);
    const query = "SELECT * FROM get_dpo_p_star_pdp_data($1, $2)";
    const queryParams = [region, offOn];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
