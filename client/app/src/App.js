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
  Avatar,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  IconButton,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { jwtDecode } from "jwt-decode";
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
import AddUserForm from "./components/AddUserForm";
import LoginPage from "./components/LoginPage";
import ChangePasswordPage from "./components/ChangePasswordPage";
import ManageUsersPage from "./components/ManageUsersPage";

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("token"));
  });
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const menuTimeoutRef = useRef(null);
  const theme = useTheme();

  // Extract user info from JWT
  let username = "";
  let role = "";
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      username = decoded.username || "";
      role = decoded.role || "";
    }
  } catch (e) {}

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

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(true);
    handleProfileMenuClose();
  };

  const renderPage = () => {
    if (showChangePassword) {
      return (
        <ChangePasswordPage
          username={username}
          onClose={() => setShowChangePassword(false)}
        />
      );
    }
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
      case "addUser":
        return <AddUserForm />;
      case "manageUsers":
        return <ManageUsersPage />;
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

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
            <Box sx={{ flex: 1, textAlign: "center", marginLeft: -28 }}>
              <Typography variant="h5" component="div">
                EI Demand Supply Management
              </Typography>
            </Box>
            {/* User Info and Profile Icon */}
            {username && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mr: 2 }}
              >
                <Box sx={{ textAlign: "right", mr: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {username}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#e0e0e0" }}>
                    {role}
                  </Typography>
                </Box>
                <IconButton
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  size="large"
                >
                  <Avatar sx={{ bgcolor: "#1976d2" }}>
                    <AccountCircleIcon />
                  </Avatar>
                </IconButton>
                <MuiMenu
                  anchorEl={profileMenuAnchor}
                  open={Boolean(profileMenuAnchor)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MuiMenuItem onClick={handleChangePasswordClick}>
                    Change Password
                  </MuiMenuItem>
                  <Divider />
                  <MuiMenuItem onClick={handleLogout}>Logout</MuiMenuItem>
                </MuiMenu>
              </Box>
            )}
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
            // Uncomment the following lines - Need to uncomment once they are implemented
            //{ label: "VCDP", value: "vcdp" },
            //{ label: "Lateral Hiring", value: "lateralHiring" },
            //{ label: "Rotation", value: "rotation" },
            //{ label: "NBL", value: "nbl" },
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
          buttonText="Demand Supply Mapping"
          isActive={activePage === "matching"}
          onClick={() => handlePageChange("matching")}
        />

        <MenuWrapper
          buttonText="Admin"
          isActive={
            activePage === "admin" ||
            activePage === "addUser" ||
            activePage === "manageUsers"
          }
          menuKey="admin"
          anchorEl={anchorEl}
          activeMenu={activeMenu}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
        >
          <StyledMenuItem onClick={() => handlePageChange("addUser")}>
            Add New User
          </StyledMenuItem>
          <StyledMenuItem onClick={() => handlePageChange("manageUsers")}>
            Manage Users
          </StyledMenuItem>
        </MenuWrapper>

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
      <Container maxWidth={false} sx={{ padding: 0, margin: 0, marginTop: 4 }}>
        {renderPage()}
      </Container>
    </Box>
  );
}

export default App;
