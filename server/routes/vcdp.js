const express = require("express");
const router = express.Router();
const VCDP = require("../models/vcdp");
const multer = require("multer");
const xlsx = require("xlsx");

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

module.exports = router;