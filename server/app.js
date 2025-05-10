const express = require("express");
const app = express();
const demandRoutes = require("./routes/demand");
const employeesRouter = require("./routes/employees");

// Middleware to parse JSON requests
app.use(express.json());

// Register the demand routes under /demandselect
app.use("/demandselect", demandRoutes);

// Register the employees routes under /employees
app.use("/employees", employeesRouter);

module.exports = app;
