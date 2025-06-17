const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Insert upload log
router.post("/", async (req, res) => {
  const { fileName, uploadedBy } = req.body;
  try {
    await pool.query("SELECT insert_excel_upload_log($1, $2)", [
      fileName,
      uploadedBy,
    ]);
    res.json({ message: "Log inserted" });
  } catch (error) {
    console.error("Error inserting upload log:", error);
    res.status(500).json({ error: "Failed to insert log" });
  }
});

// Get latest logs
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM get_latest_excel_upload_logs()"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching upload logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;
