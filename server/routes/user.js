const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// JWT middleware (replace with your actual middleware if different)
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// GET /api/user/dropdown-options
router.get("/dropdown-options", authenticateJWT, async (req, res) => {
  try {
    const query = `SELECT demand_dropdown_master_id, dd_type, key, descr, dd_sub_type FROM public.ds_demand_dropdown_master WHERE dd_type IN ('ROLES', 'MARKET', 'MARKET_UNIT', 'BUSS_UNIT_DESC')`;
    const { rows } = await pool.query(query);
    const mapOptions = (type) =>
      rows
        .filter((r) => r.dd_type === type)
        .map((r) => ({ value: r.key, label: r.descr }));
    res.json({
      roles: mapOptions("ROLES"),
      market: mapOptions("MARKET"),
      buname: mapOptions("MARKET_UNIT"),
      sbuname: mapOptions("BUSS_UNIT_DESC"),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dropdown options" });
  }
});

// POST /api/user/add-user
router.post("/add-user", authenticateJWT, async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      firstName,
      lastName,
      roles,
      market,
      buname,
      sbuname,
      parentAccountName,
      comments,
    } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Check for unique username
    const userCheck = await pool.query(
      "SELECT 1 FROM ds_users WHERE username = $1",
      [username]
    );
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Call stored procedure
    const result = await pool.query(
      `SELECT ds_manage_user(
        p_operation := 'create',
        p_username := $1,
        p_password := $2,
        p_email := $3,
        p_first_name := $4,
        p_last_name := $5,
        p_role := $6,
        p_bu := $8,
        p_sbu := $9,
        p_parent_account := $10,
        p_comments := $11,
        p_is_active := TRUE,
        p_actor := $12
      )`,
      [
        username,
        hashedPassword,
        email,
        firstName,
        lastName,
        Array.isArray(roles) ? roles.join(",") : roles,
        Array.isArray(market) ? market.join(",") : market,
        Array.isArray(buname) ? buname.join(",") : buname,
        Array.isArray(sbuname) ? sbuname.join(",") : sbuname,
        parentAccountName || null,
        req.user?.username || "admin", // fallback if JWT doesn't have username
      ]
    );
    res.json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create user" });
  }
});

// POST /api/user/change-password
router.post("/change-password", authenticateJWT, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and new password are required" });
    }
    // Only allow changing own password
    if (req.user?.username !== username) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword:", hashedPassword); // Debugging line
    console.log("password:", password); // Debugging line

    // Call stored procedure to update password (plain text as per current setup)
    await pool.query(
      `SELECT ds_manage_user(
        p_operation := 'update',
        p_username := $1,
        p_password := $2,
        p_email := NULL,
        p_first_name := NULL,
        p_last_name := NULL,
        p_role := NULL,
        p_bu := NULL,
        p_sbu := NULL,
        p_parent_account := NULL,
        p_comments := 'Password changed',
        p_is_active := TRUE,
        p_actor := $1
      )`,
      [username, hashedPassword]
    );
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// GET /api/user/all-users
router.get("/all-users", authenticateJWT, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM public.ds_get_all_user_details()"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/user/update-user
router.post("/update-user", authenticateJWT, async (req, res) => {
  try {
    const {
      username,
      email,
      firstName,
      lastName,
      roles,
      market,
      buname,
      sbuname,
      parentAccountName,
      comments,
    } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    await pool.query(
      `SELECT ds_manage_user(
        p_operation := 'update',
        p_username := $1,
        p_password := NULL,
        p_email := $2,
        p_first_name := $3,
        p_last_name := $4,
        p_role := $5,
        p_bu := $6,
        p_sbu := $7,
        p_parent_account := $8,
        p_comments := $9,
        p_is_active := TRUE,
        p_actor := $10
      )`,
      [
        username,
        email,
        firstName,
        lastName,
        Array.isArray(roles) ? roles.join(",") : roles,
        Array.isArray(market) ? market.join(",") : market,
        Array.isArray(buname) ? buname.join(",") : buname,
        Array.isArray(sbuname) ? sbuname.join(",") : sbuname,
        parentAccountName || null,
        req.user?.username || "admin",
      ]
    );
    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// POST /api/user/deactivate-user
router.post("/deactivate-user", authenticateJWT, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    await pool.query(
      `SELECT ds_manage_user(
        p_operation := 'update',
        p_username := $1,
        p_password := NULL,
        p_email := NULL,
        p_first_name := NULL,
        p_last_name := NULL,
        p_role := NULL,
        p_bu := NULL,
        p_sbu := NULL,
        p_parent_account := NULL,
        p_comments := 'Deactivated',
        p_is_active := FALSE,
        p_actor := $2
      )`,
      [username, req.user?.username || "admin"]
    );
    res.json({ message: "User deactivated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

module.exports = router;
