const express = require("express");
const router = express.Router();
const VCDP = require("../models/vcdp");
const multer = require("multer");
const xlsx = require("xlsx");
const pool = require("../config/db");
// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all VCDP records
router.get("/", async (req, res) => {
  try {
    const vcdps = await VCDP.getAll();
    res.json(vcdps);
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
      try {
        await VCDP.create(row);
      } catch (error) {
        console.error(`Error processing row:`, row);
        console.error('Error details:', error);
        // Continue processing other rows
      }
    }

    res.json({ message: "File processed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: "Server error",
      details: err.message 
    });
  }
});


//Get EI VCDP A+ data

router.get("/getEIAPlusVCDPData", async (req, res) => {
  try {
     const { region,  offOn } = req.query;
     // Validate required parameters
     if ( !region || !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    console.log("region",region);
    const query = "SELECT * FROM get_ei_a_plus_vcdp_data($1, $2)";
    const queryParams = [region, offOn];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Get EI VCDP P* data

router.get("/getEIPStarVCDPData", async (req, res) => {
  try {
     const { region,  offOn } = req.query;
     // Validate required parameters
     if ( !region || !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    console.log("region",region);
    const query = "SELECT * FROM get_ei_p_star_vcdp_data($1, $2)";
    const queryParams = [region, offOn];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Get DPO VCDP A+ data

router.get("/getDPOAPlusVCDPData", async (req, res) => {
  try {
     const { region,  offOn } = req.query;
     // Validate required parameters
     if ( !region || !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    console.log("region",region);
    const query = "SELECT * FROM get_dpo_a_plus_vcdp_data($1, $2)";
    const queryParams = [region, offOn];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Get DPO VCDP P* data

router.get("/getDPOPStarVCDPData", async (req, res) => {
  try {
     const { region,  offOn } = req.query;
     // Validate required parameters
     if ( !region || !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    console.log("region",region);
    const query = "SELECT * FROM get_dpo_p_star_vcdp_data($1, $2)";
    const queryParams = [region, offOn];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;