// c:\Users\Parashuram\Projects\ei-demand-supply-tool-Parashuram-branch\Cognizant\client\app\src\pages\Dashboard.js
import React, { useState } from "react";
import { Typography, Box } from "@mui/material";
import DashboardTable from "../components/DashboardTable";
import FilterControls from "../components/FilterControls";

function Dashboard() {
  const [reportData, setReportData] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const primaryColor = "#005EB8"; 
  const handleReportData = (data, filters) => {
    setReportData(data);
    setFilterValues(filters);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
      variant="h5"
      sx={{
        fontWeight: "bold",
        color: primaryColor,
        marginBottom: 2,
        textAlign: "left",
      }}
    >
      Demand & Supply Dashboard
    </Typography>
      </Box>
      <FilterControls onReportData={handleReportData} />
      {reportData && (
        <DashboardTable reportData={reportData} filterValues={filterValues} />
      )}
    </Box>
  );
}

export default Dashboard;
