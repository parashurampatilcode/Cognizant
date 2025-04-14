const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM public.demandselectnewpp()";
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching data from demandselect:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/parentCustomers", async (req, res) => {
  try {
    const query =
      "SELECT DISTINCT parent_customer FROM so_data_main WHERE parent_customer IS NOT NULL ORDER BY parent_customer ASC;";
    const { rows } = await pool.query(query);

    res.json(rows.map((row) => row.parent_customer));
  } catch (error) {
    console.error("Error fetching parent customers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/businessUnitDescs", async (req, res) => {
  try {
    const query =
      "SELECT DISTINCT businessunit_desc FROM so_data_main WHERE businessunit_desc IS NOT NULL ORDER BY businessunit_desc ASC";
    const { rows } = await pool.query(query);

    res.json(rows.map((row) => row.businessunit_desc));
  } catch (error) {
    console.error("Error fetching business unit descriptions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pdlNames", async (req, res) => {
  try {
    const query =
      "SELECT DISTINCT pdl_name FROM so_data_main WHERE pdl_name IS NOT NULL ORDER BY pdl_name ASC";
    const { rows } = await pool.query(query);

    res.json(rows.map((row) => row.pdl_name));
  } catch (error) {
    console.error("Error fetching PDL names:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/offOns", async (req, res) => {
  try {
    const query =
      "SELECT DISTINCT off_on FROM so_data_main WHERE off_on IS NOT NULL ORDER BY off_on ASC";
    const { rows } = await pool.query(query);

    res.json(rows.map((row) => row.off_on));
  } catch (error) {
    console.error("Error fetching Off/On values:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/report", async (req, res) => {
  const { parentCustomer, buDesc, pdlName, offOn } = req.query;

  try {
    const query = `
      SELECT * FROM public.demandselectnewpp($1, $2, $3, $4)
    `;
    const queryParams = [
      parentCustomer === "null" ? null : parentCustomer,
      buDesc === "null" ? null : buDesc,
      pdlName === "null" ? null : pdlName,
      offOn === "null" ? null : offOn,
    ];

    const results = await pool.query(query, queryParams);
    res.json(results.rows);
  } catch (error) {
    console.error("Error fetching report data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
