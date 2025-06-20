// DemandView.js
import React,  { useState } from "react";
import { Typography, Box } from "@mui/material";
import DashboardTable from "../components/DashboardTable";
import FilterControlsDemand from "../components/FilterControlsDemand";
import DemandViewTable from "../components/DemandViewTable";

function DemandView() {

  //const [reportData, setReportData] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [skillCountsByMonthData, setSkillCountsByMonthData] = useState(null);
  const [top10AccountsCountsByMonthData, setTop10AccountsCountsByMonthData] = useState(null);
  const primaryColor = "#005EB8"; 
  const handleReportData = (data, filters) => {
    //setReportData(data);
    console.log("Demand view",data);
    setSkillCountsByMonthData(data.skillCountsByMonth.data);
    setTop10AccountsCountsByMonthData(data.top10AccountsCountsByMonth.data);
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
              Demand View - Detailed View
             </Typography>
        </Box>
        <FilterControlsDemand onReportData={handleReportData} reportName = 'Demand' />
        {skillCountsByMonthData && (
          <DemandViewTable reportData={skillCountsByMonthData} filterValues={filterValues} tableName = 'Skills' tableHeader = 'Detailed Demand' />
        )}
        {top10AccountsCountsByMonthData && (
          <DemandViewTable reportData={top10AccountsCountsByMonthData} filterValues={filterValues} tableName = 'Top10Accounts' tableHeader = 'Top 10 Accounts' />
        )}
      </Box>
  
)};

export default DemandView;
