const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM public.demand_select()";
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
      "SELECT DISTINCT parent_customer FROM ds_so_data_main WHERE parent_customer IS NOT NULL  and is_so_main_active = true  ORDER BY parent_customer ASC;";
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
      "SELECT DISTINCT bu FROM ds_so_data_main WHERE bu IS NOT NULL  and is_so_main_active = true ORDER BY bu ASC";
      //it should be businessunit_desc, column missing in the table ds_so_data_main
    const { rows } = await pool.query(query);

    res.json(rows.map((row) => row.bu));
  } catch (error) {
    console.error("Error fetching business unit descriptions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pdlNames", async (req, res) => {
  try {
    const query =
      "SELECT DISTINCT pdl_name FROM ds_so_data_main WHERE pdl_name IS NOT NULL  and is_so_main_active = true ORDER BY pdl_name ASC";
      //it should be pdl_name, column missing in the table ds_so_data_main
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
      "SELECT DISTINCT off_on FROM ds_so_data_main WHERE off_on IS NOT NULL  and is_so_main_active = true ORDER BY off_on ASC";
    const { rows } = await pool.query(query);

    res.json(rows.map((row) => row.off_on));
  } catch (error) {
    console.error("Error fetching Off/On values:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/market", async (req, res) => {
  try {
    const query =
      "SELECT DISTINCT market FROM ds_so_data_main WHERE market IS NOT NULL and is_so_main_active = true ORDER BY market ASC";
    const { rows } = await pool.query(query);

    res.json(rows.map((row) => row.market));
  } catch (error) {
    console.error("Error fetching Market values:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/practice", async (req, res) => {
  try {
    const query =
      "SELECT DISTINCT practice FROM ds_so_data_main WHERE practice IS NOT NULL and is_so_main_active = true ORDER BY practice ASC";
    const { rows } = await pool.query(query);

    res.json(rows.map((row) => row.practice));
  } catch (error) {
    console.error("Error fetching Practice values:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/report", async (req, res) => {
  const { parentCustomer, buDesc, pdlName, offOn } = req.query;

  try {
    const query = `
      SELECT * FROM public.demand_select($1, $2, $3, $4)
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
