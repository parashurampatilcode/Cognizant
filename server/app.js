const express = require("express");
const app = express();
const demandRoutes = require("./routes/demand");

// Middleware to parse JSON requests
app.use(express.json());

// Register the demand routes under /demandselect
app.use("/demandselect", demandRoutes);

module.exports = app;
