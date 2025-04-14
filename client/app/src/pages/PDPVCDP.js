

import React,  { useState } from "react";
import { Typography, Box } from "@mui/material";
import StyledDataGrid from "../components/PDPVCDPSupplyTable";
import FilterControlsPDPVCDP from "../components/FilterControlsPDPVCDP";
import StyledTable from "../components/PDPVCDPSupplyTable";
import PDPVCDPSupplyTable from "../components/PDPVCDPSupplyTable";


function PDPVCDP() {


const [pdpReportDatas, setPDPReportDatas] = useState([]);
const [vcdpReportDatas, setVCDPReportDatas] = useState([]);

const handleReportData = (data) => {
    setPDPReportDatas(data.pdpResponseData);
    setVCDPReportDatas(data.vcdpResponseData)
  };
  
  const pdpTableNames = [
    'EI A+ PDP',
    'EI P* PDP',
    'DPO A+ PDP',
    'DPO P* PDP'
    ];
    
    const vcdpTableNames = [
    'EI  A+ CDeploy',
    'EI  P* CDeploy',
    'DPO A+ CDeploy',
    'DPO P* CDeploy',
  ];

  
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
        <Typography variant="h4">PDP & VCDP - Work in Progress</Typography>
        </Box>
        <FilterControlsPDPVCDP onReportData={handleReportData} />
        {pdpReportDatas && (
        <>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {pdpReportDatas.map((pdpReportData, index) => (
              <Box key={pdpTableNames[index]} sx={{ width: "25%" }}>
                <PDPVCDPSupplyTable
                  reportData={pdpReportData}
                  tableName={pdpTableNames[index]}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {vcdpReportDatas.map((vcdpReportData,index) => (
              <Box key={vcdpTableNames[index]} sx={{ width: "25%" }}>
                <PDPVCDPSupplyTable
                  reportData={vcdpReportData}
                  tableName={vcdpTableNames[index]}
                />
              </Box>
            ))}
          </Box>
        </>
      )}
      </Box>
  );
}

export default PDPVCDP;