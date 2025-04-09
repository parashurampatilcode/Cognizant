// DemandView.js
import React,  { useState } from "react";
import { Typography, Box } from "@mui/material";
import DashboardTable from "../components/DashboardTable";
import FilterControls from "../components/FilterControls";
import DemandViewTable from "../components/DemandViewTable";

function DemandView() {

  //const [reportData, setReportData] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [skillCountsByMonthData, setSkillCountsByMonthData] = useState(null);
  const [top10AccountsCountsByMonthData, setTop10AccountsCountsByMonthData] = useState(null);

  const handleReportData = (data, filters) => {
    //setReportData(data);
    console.log("Demand view",data);
    setSkillCountsByMonthData(data.skillCountsByMonth.data);
    setTop10AccountsCountsByMonthData(data.top10AccountsCountsByMonth.data);
    setFilterValues(filters);
  };

  return (
  <Box sx={{ width: "100%" }}>
     <DemandViewTable />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
         <Typography variant="h4">Demand View - Detailed View-</Typography>;
        </Box>
        <FilterControls onReportData={handleReportData} reportName = 'Demand' />
        {skillCountsByMonthData && (
          <DashboardTable reportData={skillCountsByMonthData} filterValues={filterValues} />
        )}
        {top10AccountsCountsByMonthData && (
          <DashboardTable reportData={top10AccountsCountsByMonthData} filterValues={filterValues} />
        )}
      </Box>
  
)};

export default DemandView;
