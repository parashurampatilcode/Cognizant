import React, { useState } from "react";
import {
  Typography,
  Container,
  Box,
  Menu,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CognizantLogo from "./cognizant-logo.svg";
import Dashboard from "./pages/Dashboard";
import DemandView from "./pages/DemandView";
import SupplyView from "./pages/SupplyView";
import DemandSupplyMatching from "./pages/DemandSupplyMatching";
import Admin from "./pages/Admin";
import Reports from "./pages/Reports";
import Maintenance from "./pages/Maintenance";
import ExcelImport from "./components/ExcelImport";

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

function App() {
  const [anchorElDemand, setAnchorElDemand] = useState(null);
  const [anchorElSupply, setAnchorElSupply] = useState(null);
  const [activePage, setActivePage] = useState("dashboard"); // Default page
  const [showSubMenu, setShowSubMenu] = useState(null); // State to track which submenu to show
  const [anchorElExcel, setAnchorElExcel] = useState(null);

  const handleMenuClick = (event, menu) => {
    event.preventDefault();
    if (menu === "demand") setAnchorElDemand(event.currentTarget);
    if (menu === "supply") setAnchorElSupply(event.currentTarget);
    if (menu === "excel") setAnchorElExcel(event.currentTarget);
    setShowSubMenu(menu);
  };

  const handleMenuClose = (menu) => {
    if (menu === "demand") setAnchorElDemand(null);
    if (menu === "supply") setAnchorElSupply(null);
    if (menu === "excel") setAnchorElExcel(null);
    setShowSubMenu(null); // Hide submenu on close
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    setShowSubMenu(null); // Hide submenu when changing pages
  };

  const renderPage = () => {
    switch (activePage) {
      case "excelImport":
        return <ExcelImport />;
      case "dashboard":
        return <Dashboard />;
      case "detailedView":
        return <DemandView />;
      case "pdp":
        return <SupplyView />;
      case "matching":
        return <DemandSupplyMatching />;
      case "admin":
        return <Admin />;
      case "reports":
        return <Reports />;
      case "maintenance":
        return <Maintenance />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <header
        style={{ backgroundColor: "#1976d2", color: "white", padding: "0px" }}
      >
        <Grid container direction="column">
          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              marginTop: 1,
            }}
          >
            <img
              src={CognizantLogo}
              alt="Cognizant Logo"
              style={{ height: "30px", marginRight: "16px" }}
            />
            <Typography
              variant="h5"
              component="div"
              sx={{
                width: "100%",
                textAlign: "center",
                marginLeft: -28,
              }}
            >
              EI Demand Supply Management
            </Typography>
          </Grid>
        </Grid>
      </header>
      <Offset />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          gap: 1,
          marginTop: -7,
        }}
      >
        <Button
          color={activePage === "dashboard" ? "primary" : "inherit"}
          onClick={() => handlePageChange("dashboard")}
          variant="contained"
        >
          Dashboard
        </Button>
        <Button
          color={activePage === "detailedView" ? "primary" : "inherit"}
          onClick={(event) => handleMenuClick(event, "demand")}
          variant="contained"
        >
          Demand View
        </Button>
        <Button
          color={activePage === "pdp" ? "primary" : "inherit"}
          onClick={(event) => handleMenuClick(event, "supply")}
          variant="contained"
        >
          Supply View
        </Button>
        <Button
          color={activePage === "excelImport" ? "primary" : "inherit"}
          onClick={(event) => handleMenuClick(event, "excel")}
          variant="contained"
        >
          Excel Import
        </Button>
        <Button
          color={activePage === "matching" ? "primary" : "inherit"}
          onClick={() => handlePageChange("matching")}
          variant="contained"
        >
          Demand Supply Matching
        </Button>
        <Button
          color={activePage === "admin" ? "primary" : "inherit"}
          onClick={() => handlePageChange("admin")}
          variant="contained"
        >
          Admin
        </Button>
        <Button
          color={activePage === "reports" ? "primary" : "inherit"}
          onClick={() => handlePageChange("reports")}
          variant="contained"
        >
          Reports
        </Button>
        <Button
          color={activePage === "maintenance" ? "primary" : "inherit"}
          onClick={() => handlePageChange("maintenance")}
          variant="contained"
        >
          Maintenance
        </Button>
      </Box>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {renderPage()}
      </Container>

      <Menu
        anchorEl={anchorElDemand}
        open={showSubMenu === "demand"}
        onClose={() => handleMenuClose("demand")}
      >
        <MenuItem onClick={() => handlePageChange("detailedView")}>
          Detailed View
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorElSupply}
        open={showSubMenu === "supply"}
        onClose={() => handleMenuClose("supply")}
      >
        <MenuItem onClick={() => handlePageChange("pdp")}>PDP</MenuItem>
        <MenuItem onClick={() => handlePageChange("vcdp")}>VCDP</MenuItem>
        <MenuItem onClick={() => handlePageChange("lateralHiring")}>
          Lateral Hiring
        </MenuItem>
        <MenuItem onClick={() => handlePageChange("rotation")}>
          Rotation
        </MenuItem>
        <MenuItem onClick={() => handlePageChange("nbl")}>NBL</MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorElExcel}
        open={showSubMenu === "excel"}
        onClose={() => handleMenuClose("excel")}
      >
        <MenuItem onClick={() => handlePageChange("excelImport")}>
          Import Data
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default App;
