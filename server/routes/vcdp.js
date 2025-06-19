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
        //console.log("Processing row from routers vcdp:", row); // Debug
        await VCDP.create(row);
      } catch (error) {
        console.error(`Error processing row:`, row);
        console.error('Error details:', error);
        // Continue processing other rows
      }
    }

    //Call the function to load data from stage to main table
    try {
      await pool.query("select * from  public.transform_vcdp_stage_to_main()");
      console.log("Stored procedure called successfully.");
    } catch (error) {
      console.error("Error calling stored procedure:", error);
      return res.status(500).json({ error: "Error calling stored procedure" });
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
     const {  offOn } = req.query;
     // Validate required parameters
     if (  !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    //console.log("offOn",offOn);
    const query = "SELECT * FROM ds_supply_view_vcdp($1, $2, $3)";
    const queryParams = [offOn,"A+","EI"];

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
     const { offOn } = req.query;
     // Validate required parameters
     if (  !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    //console.log("offOn",offOn);
    const query = "SELECT * FROM ds_supply_view_vcdp($1, $2, $3)";
    const queryParams = [offOn,"P*","EI"];

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
     const {  offOn } = req.query;
     // Validate required parameters
     if (  !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    //console.log("offOn",offOn);
    const query = "SELECT * FROM ds_supply_view_vcdp($1, $2, $3)";
    const queryParams = [offOn,"A+","PO"];

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
     const {  offOn } = req.query;
     // Validate required parameters
     if (  !offOn  ) {
       return res.status(400).json({ error: "Missing required parameters-" });
     }
    //console.log("offOn",offOn);
    const query = "SELECT * FROM ds_supply_view_vcdp($1, $2, $3)";
    const queryParams = [offOn,"P*","PO"];

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;