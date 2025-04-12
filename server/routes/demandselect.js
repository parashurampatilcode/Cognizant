const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM public.demandselect()";
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching data from demandselect:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
