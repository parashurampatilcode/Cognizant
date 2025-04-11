const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const pdpRoutes = require("./routes/pdp");
const vcdpRoutes = require("./routes/vcdp");
const demandRoutes = require("./routes/demand");
const lateralHiringRouter = require("./routes/lateralHiring");
const demandselectRoutes = require("./routes/demandselect");
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
app.use("/demandselect", demandselectRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
