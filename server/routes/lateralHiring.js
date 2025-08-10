// c:\Users\Parashuram\Projects\ei-demand-supply-tool\server\routes\lateralHiring.js
const express = require("express");
const router = express.Router();
const LateralHiring = require("../models/lateralHiring");
const multer = require("multer");
const xlsx = require("xlsx");
const pool = require("../config/db");
// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all Lateral Hiring records
router.get("/", async (req, res) => {
  try {
    const lateralHirings = await LateralHiring.getAll();
    res.json(lateralHirings);
  } catch (err) {
    console.error("Error in GET /lateralHiring:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Upload Excel and process data
router.post("/uploadAndProcess", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Optional date from form for stamping the batch
    const reportExtractionDate = req.body.report_extraction_date || null;

    // Ensure stage table contains only the current batch
    try {
      await pool.query('TRUNCATE TABLE "lateral_hiring_stage"');
    } catch (error) {
      console.error("Error truncating lateral_hiring_stage:", error);
      return res.status(500).json({ error: "Error truncating stage table" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { raw: false });

    // Process each row and insert into database
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const row of jsonData) {
      try {
        await LateralHiring.create(row);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: row,
          error: error.message,
        });
        console.error(`Error processing row:`, row);
        console.error("Error details:", error);
        // Continue processing other rows
      }
    }

    // Update report_extraction_date on this batch if provided
    if (reportExtractionDate) {
      try {
        await pool.query(
          'UPDATE "lateral_hiring_stage" SET report_extraction_date = $1',
          [reportExtractionDate]
        );
      } catch (error) {
        console.error(
          "Error updating report_extraction_date in lateral_hiring_stage:",
          error
        );
        return res.status(500).json({
          error:
            "Error updating report_extraction_date in stage table. Ensure the column exists.",
          details: error.message,
        });
      }
    }

    //Call the function to load data from stage to main table
    try {
      await pool.query(
        "select * from  public.transform_lateral_hire_stage_to_main()"
      );
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
    console.error("Error in POST /lateralHiring/uploadAndProcess:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

module.exports = router;
