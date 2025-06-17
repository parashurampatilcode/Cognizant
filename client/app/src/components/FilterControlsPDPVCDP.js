import React, { useState } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
} from "@mui/material";
import axios from "axios";

const FilterControlsPDPVCDP = ({ onReportData }) => {
  const [region, setRegion] = useState("All");
  const [offOn, setOffOn] = useState("All");
  const [loading, setLoading] = useState(false);

    const handleRegionChange = (event) => {
    setRegion(event.target.value);
  };

  const handleOffOnChange = (event) => {
    setOffOn(event.target.value);
  };

  

  const handleViewReport = async () => {
    try {
      setLoading(true);
      
      const eiAplusPDPData = await axios.get(
        "http://localhost:5000/pdp/getEIAPlusPDPData",
        {
          params: {
            region,
            offOn,
          },
        }
      );  
      const eiPStarPDPData = await axios.get(
        "http://localhost:5000/pdp/getEIPStarPDPData",
        {
          params: {
            region,
            offOn,
          },
        }
      ); 
      
      const dpoAplusPDPData = await axios.get(
        "http://localhost:5000/pdp/getDPOAPlusPDPData",
        {
          params: {
            region,
            offOn,
          },
        }
      ); 

      const dpoPStarPDPData = await axios.get(
        "http://localhost:5000/pdp/getDPOPStarPDPData",
        {
          params: {
            region,
            offOn,
          },
        }
      ); 
        
      const pdpResponseData = [eiAplusPDPData.data,eiPStarPDPData.data,dpoAplusPDPData.data,dpoPStarPDPData.data]; 

      const eiAplusVCDPData = await axios.get(
        "http://localhost:5000/vcdp/getEIAPlusVCDPData",
        {
          params: {
            region,
            offOn,
          },
        }
      );  
      const eiPStarVCDPData = await axios.get(
        "http://localhost:5000/vcdp/getEIPStarVCDPData",
        {
          params: {
            region,
            offOn,
          },
        }
      ); 
      
      const dpoAplusVCDPData = await axios.get(
        "http://localhost:5000/vcdp/getDPOAPlusVCDPData",
        {
          params: {
            region,
            offOn,
          },
        }
      ); 

      const dpoPStarVCDPData = await axios.get(
        "http://localhost:5000/vcdp/getDPOPStarVCDPData",
        {
          params: {
            region,
            offOn,
          },
        }
      ); 

      const vcdpResponseData = [eiAplusVCDPData.data,eiPStarVCDPData.data,dpoAplusVCDPData.data,dpoPStarVCDPData.data]; 
      
      const pdpResponse= {pdpResponseData : pdpResponseData};
      const vcdpResponse = {vcdpResponseData : vcdpResponseData};
      const pdpVcdpResponse = Object.assign({},pdpResponse,vcdpResponse);
      
        if (onReportData) {
            console.log("PDPVCDP",pdpVcdpResponse);
          onReportData(pdpVcdpResponse, { region, offOn }); // Pass filter values here
        }
      
      
    } catch (error) {
      console.error("Error fetching report::", error);
      // You might want to add error handling UI here
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled =loading;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 3,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="region-label">Market</InputLabel>
        <Select
          labelId="region-label"
          id="region-select"
          value={region}
          label="Region"
          onChange={handleRegionChange}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="NA">NA</MenuItem>
          <MenuItem value="GGM">GGM</MenuItem>
          <MenuItem value="Others">Others</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="off-on-label">Off/On</InputLabel>
        <Select
          labelId="off-on-label"
          id="off-on-select"
          value={offOn}
          label="Off/On"
          onChange={handleOffOnChange}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="onsite">onsite</MenuItem>
          <MenuItem value="offshore">offshore</MenuItem>
        </Select>
      </FormControl>
   
      <Button
        variant="contained"
        color="primary"
        onClick={handleViewReport}
        disabled={isButtonDisabled}
      >
        {loading ? "Loading..." : "View Report"}
      </Button>
    </Box>
  );
};

export default FilterControlsPDPVCDP;
