const express = require("express");
const app = express();
const demandRoutes = require("./routes/demand");
const employeesRouter = require("./routes/employees");
const uniqueAllocationRouter = require("./routes/uniqueAllocation");

// Middleware to parse JSON requests
app.use(express.json());

// Register the demand routes under /demandselect
app.use("/demandselect", demandRoutes);

// Register the employees routes under /employees
app.use("/employees", employeesRouter);

// Register the unique allocation routes under /unique-allocation
app.use("/unique-allocation", uniqueAllocationRouter);

module.exports = app;
