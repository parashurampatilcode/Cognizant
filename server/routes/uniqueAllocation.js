const express = require("express");
const router = express.Router();
const uniqueAllocationModel = require("../models/uniqueAllocation");

// POST /unique-allocation/uploadAndProcess
router.post("/uploadAndProcess", async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No records provided." });
    }
    const result = await uniqueAllocationModel.bulkInsert(records);
    res.json({ message: `Successfully imported ${result.rowCount} records.` });
  } catch (err) {
    console.error("Unique Allocation Import Error:", err);
    res
      .status(500)
      .json({ message: "Failed to import records.", details: err.message });
  }
});

module.exports = router;
