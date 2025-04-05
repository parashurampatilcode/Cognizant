import React, { useState } from "react";
import { Typography, Box } from "@mui/material";
import DashboardTable from "../components/DashboardTable";
import FilterControls from "../components/FilterControls";

function Dashboard() {
  const [reportData, setReportData] = useState(null);

  const handleReportData = (data) => {
    setReportData(data);
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
        <Typography variant="h4">Dashboard</Typography>
      </Box>
      <FilterControls onReportData={handleReportData} />
      {reportData && <DashboardTable reportData={reportData} />}
    </Box>
  );
}

export default Dashboard;
