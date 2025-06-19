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
  
  const [offOn, setOffOn] = useState("All");
  const [loading, setLoading] = useState(false);

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
            offOn,
          },
        }
      );  
      const eiPStarPDPData = await axios.get(
        "http://localhost:5000/pdp/getEIPStarPDPData",
        {
          params: {
            offOn,
          },
        }
      ); 
      
      const dpoAplusPDPData = await axios.get(
        "http://localhost:5000/pdp/getDPOAPlusPDPData",
        {
          params: {
            offOn,
          },
        }
      ); 

      const dpoPStarPDPData = await axios.get(
        "http://localhost:5000/pdp/getDPOPStarPDPData",
        {
          params: {
            offOn,
          },
        }
      ); 
        
      const pdpResponseData = [eiAplusPDPData.data,eiPStarPDPData.data,dpoAplusPDPData.data,dpoPStarPDPData.data]; 

      const eiAplusVCDPData = await axios.get(
        "http://localhost:5000/vcdp/getEIAPlusVCDPData",
        {
          params: {
            offOn,
          },
        }
      );  
      const eiPStarVCDPData = await axios.get(
        "http://localhost:5000/vcdp/getEIPStarVCDPData",
        {
          params: {
             offOn,
          },
        }
      ); 
      
      const dpoAplusVCDPData = await axios.get(
        "http://localhost:5000/vcdp/getDPOAPlusVCDPData",
        {
          params: {
            offOn,
          },
        }
      ); 

      const dpoPStarVCDPData = await axios.get(
        "http://localhost:5000/vcdp/getDPOPStarVCDPData",
        {
          params: {
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
          onReportData(pdpVcdpResponse, {  offOn }); // Pass filter values here
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
