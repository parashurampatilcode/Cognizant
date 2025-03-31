// c:\Users\Parashuram\Projects\ei-demand-supply-tool\server\routes\lateralHiring.js
const express = require("express");
const router = express.Router();
const LateralHiring = require("../models/lateralHiring");
const multer = require("multer");
const xlsx = require("xlsx");

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
