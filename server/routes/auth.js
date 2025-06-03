const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); // Import bcrypt

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }
    // Call stored procedure to get user details
    const result = await pool.query("SELECT * FROM ds_get_user_details($1)", [
      username,
    ]);
    if (!result.rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.rows[0];
    console.log("result.rows:", result.rows); // Add this line

    // Compare plain-text password (insecure, but per requirements)
    console.log("user.password:", user.password);
    console.log("password:", password);

    /*if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }*/

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("passwordMatch:", passwordMatch); // Add this line

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, redirect: "/dashboard" });
  } catch (err) {
    console.error("Login error:", err); // Log the full error object

    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
