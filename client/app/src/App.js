import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Menu,
  MenuItem,
  Button,
  Grid,
  Fade,
  useTheme,
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
import PDPVCDP from "./pages/PDPVCDP";

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

const StyledButton = styled(Button)(({ theme }) => ({
  transition: theme.transitions.create(["transform", "box-shadow"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  transition: theme.transitions.create(["background-color", "color"], {
    duration: theme.transitions.duration.shorter,
  }),
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const MenuButton = ({ buttonText, isActive, onClick }) => (
  <StyledButton
    color={isActive ? "primary" : "inherit"}
    variant="contained"
    onClick={onClick}
  >
    {buttonText}
  </StyledButton>
);

const MenuWrapper = ({
  buttonText,
  isActive,
  menuKey,
  anchorEl,
  activeMenu,
  onMenuOpen,
  onMenuClose,
  children,
}) => {
  const theme = useTheme();
  const menuRef = useRef(null);

  const handleMouseEnter = (event) => {
    onMenuOpen(event.currentTarget, menuKey);
  };

  const handleMouseLeave = () => {
    onMenuClose();
  };

  const handleMenuMouseEnter = (event) => {
    event.stopPropagation();
  };

  const handleMenuMouseLeave = () => {
    onMenuClose();
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={menuRef}
    >
      <MenuButton buttonText={buttonText} isActive={isActive} />
      <Menu
        anchorEl={anchorEl}
        open={activeMenu === menuKey}
        onClose={onMenuClose}
        MenuListProps={{
          onMouseEnter: handleMenuMouseEnter,
          onMouseLeave: handleMenuMouseLeave,
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: theme.transitions.duration.shortest }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            mt: 0.5,
            boxShadow: theme.shadows[6],
            minWidth: 180,
          },
        }}
      >
        {children}
      </Menu>
    </div>
  );
};

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [activeMenu, setActiveMenu] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuTimeoutRef = useRef(null);
  const theme = useTheme();

  const handleMenuOpen = useCallback(
    (element, menuKey) => {
      // Always clear the timeout when opening a new menu
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
      menuTimeoutRef.current = null; // Reset the timeout ref

      if (activeMenu !== menuKey) {
        setActiveMenu(menuKey);
        setAnchorEl(element);
      }
    },
    [] // Removed activeMenu from dependencies
  );

  const handleMenuClose = useCallback(() => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
      setAnchorEl(null);
    }, 150);
  }, []);

  const handlePageChange = useCallback((page) => {
    setActivePage(page);
    setActiveMenu(null);
    setAnchorEl(null);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "excelImport":
        return <ExcelImport />;
      case "dashboard":
        return <Dashboard />;
      case "detailedView":
        return <DemandView />;
      case "pdpvcdp":
        return <PDPVCDP />;
      case "vcdp":
      case "lateralHiring":
      case "rotation":
      case "nbl":
        return <SupplyView type={activePage} />;
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

  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <header
        style={{
          backgroundColor: theme.palette.primary.main,
          color: "white",
          padding: "0px",
        }}
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
          padding: "0 16px",
        }}
      >
        <MenuButton
          buttonText="Dashboard"
          isActive={activePage === "dashboard"}
          onClick={() => handlePageChange("dashboard")}
        />

        <MenuWrapper
          buttonText="Demand View"
          isActive={activePage === "detailedView"}
          menuKey="demand"
          anchorEl={anchorEl}
          activeMenu={activeMenu}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
        >
          <StyledMenuItem onClick={() => handlePageChange("detailedView")}>
            Detailed View
          </StyledMenuItem>
        </MenuWrapper>

        <MenuWrapper
          buttonText="Supply View"
          isActive={[
            "pdpvcdp",
            //"vcdp",
            "lateralHiring",
            "rotation",
            "nbl",
          ].includes(activePage)}
          menuKey="supply"
          anchorEl={anchorEl}
          activeMenu={activeMenu}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
        >
          {[
            { label: "PDP & VCDP", value: "pdpvcdp" },
            //{ label: "VCDP", value: "vcdp" },
            { label: "Lateral Hiring", value: "lateralHiring" },
            { label: "Rotation", value: "rotation" },
            { label: "NBL", value: "nbl" },
          ].map((item) => (
            <StyledMenuItem
              key={item.value}
              onClick={() => handlePageChange(item.value)}
            >
              {item.label}
            </StyledMenuItem>
          ))}
        </MenuWrapper>

        <MenuWrapper
          buttonText="Excel Import"
          isActive={activePage === "excelImport"}
          menuKey="excel"
          anchorEl={anchorEl}
          activeMenu={activeMenu}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
        >
          <StyledMenuItem onClick={() => handlePageChange("excelImport")}>
            Import Data
          </StyledMenuItem>
        </MenuWrapper>

        <MenuButton
          buttonText="Demand Supply Matching"
          isActive={activePage === "matching"}
          onClick={() => handlePageChange("matching")}
        />

        <MenuButton
          buttonText="Admin"
          isActive={activePage === "admin"}
          onClick={() => handlePageChange("admin")}
        />

        <MenuButton
          buttonText="Reports"
          isActive={activePage === "reports"}
          onClick={() => handlePageChange("reports")}
        />

        <MenuButton
          buttonText="Maintenance"
          isActive={activePage === "maintenance"}
          onClick={() => handlePageChange("maintenance")}
        />
      </Box>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {renderPage()}
      </Container>
    </Box>
  );
}

export default App;
