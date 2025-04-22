const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const pdpRoutes = require("./routes/pdp");
const vcdpRoutes = require("./routes/vcdp");
const demandRoutes = require("./routes/demand");
const lateralHiringRouter = require("./routes/lateralHiring");
const demandSelectRoutes = require("./routes/demandselect"); // Ensure the path is correct
const employeesRouter = require("./routes/employees");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/pdp", pdpRoutes);
app.use("/vcdp", vcdpRoutes);
app.use("/demand", demandRoutes);
app.use("/lateralHiring", lateralHiringRouter);
app.use("/dashboard", require("./routes/dashboard"));
app.use("/demandselect", demandSelectRoutes); // Register the demandselect routes
app.use("/employees", employeesRouter); // Make sure employees routes are registered

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
