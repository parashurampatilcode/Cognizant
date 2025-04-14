const express = require("express");
const app = express();
const demandselectRoutes = require("./routes/demandselect");

// Register the demandselect routes
app.use("/demandselect", demandselectRoutes);

module.exports = app;
