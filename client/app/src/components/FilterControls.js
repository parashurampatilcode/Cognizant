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

const FilterControls = ({ onReportData, reportName }) => {
  const [practice, setPractice] = useState("All");
  const [market, setMarket] = useState("All");
  const [offOn, setOffOn] = useState("All");
  const [busUnit, setBusUnit] = useState("All");
  const [loading, setLoading] = useState(false);

  const handlePracticeChange = (event) => {
    setPractice(event.target.value);
  };

  const handleMarketChange = (event) => {
    setMarket(event.target.value);
  };

  const handleOffOnChange = (event) => {
    setOffOn(event.target.value);
  };

  const handleBusUnitChange = (event) => {
    setBusUnit(event.target.value);
  };

  const handleViewReport = async () => {
    try {
      setLoading(true);

      if (reportName === "Demand") {
        const skillCountsByMonth = await axios.get(
          "http://localhost:5000/demand/skillCountsByMonth",
          {
            params: {
              practice,
              market,
              offOn,
              busUnit,
            },
          }
        );
        const top10AccountsCountsByMonth = await axios.get(
          "http://localhost:5000/demand/top10AccountsCountsByMonth",
          {
            params: {
              practice,
              market,
              offOn,
              busUnit,
            },
          }
        );
        const skillCountsByMonthResponse = {
          skillCountsByMonth: skillCountsByMonth,
        };
        const top10AccountsCountsByMonthResponse = {
          top10AccountsCountsByMonth: top10AccountsCountsByMonth,
        };
        const demandResponse = Object.assign(
          {},
          skillCountsByMonthResponse,
          top10AccountsCountsByMonthResponse
        );
        console.log("FilterControl - ReportName -" + reportName);
        console.log(
          "skillCountsByMonthResponse",
          skillCountsByMonthResponse
        );
        console.log(
          "top10AccountsCountsByMonthResponse",
          top10AccountsCountsByMonthResponse
        );
        console.log("demandResponse", demandResponse);

        if (onReportData) {
          onReportData(demandResponse, {
            practice,
            market,
            offOn,
            busUnit,
          }); // Pass filter values here
        }
      } else {
        const dashboardResponse = await axios.get(
          "http://localhost:5000/dashboard/report",
          {
            params: {
              practice,
              market,
              offOn,
            },
          }
        );
        if (onReportData) {
          onReportData(dashboardResponse.data, { practice, market, offOn }); // Pass filter values here
        }
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      // You might want to add error handling UI here
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled =
    practice === "All" || market === "All" || offOn === "All" || loading;

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
        <InputLabel id="practice-label">Practice</InputLabel>
        <Select
          labelId="practice-label"
          id="practice-select"
          value={practice}
          label="Practice"
          onChange={handlePracticeChange}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="EPS PEGA">EPS PEGA</MenuItem>
          <MenuItem value="EPS IPM">EPS IPM</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="market-label">Region</InputLabel>
        <Select
          labelId="market-label"
          id="market-select"
          value={market}
          label="Region"
          onChange={handleMarketChange}
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

      {reportName === "Demand" && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="bus-unit-label">Business Unit</InputLabel>
          <Select
            labelId="bus-unit-label"
            id="bus-unit-select"
            value={busUnit}
            label="Business Unit"
            onChange={handleBusUnitChange}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="ANZ">ANZ</MenuItem>
            <MenuItem value="ASEAN and GCN">ASEAN and GCN</MenuItem>
            <MenuItem value="CMT NA">CMT NA</MenuItem>
            <MenuItem value="DACH">DACH</MenuItem>
            <MenuItem value="FSI NA">FSI NA</MenuItem>
            <MenuItem value="HEALTH NA">HEALTH NA</MenuItem>
            <MenuItem value="India">India</MenuItem>
            <MenuItem value="MLEU NA">MLEU NA</MenuItem>
            <MenuItem value="Northern Europe">Northern Europe</MenuItem>
            <MenuItem value="Others">Others</MenuItem>
            <MenuItem value="RCGTH NA">RCGTH NA</MenuItem>
            <MenuItem value="Southern Europe & Middle East">
              Southern Europe & Middle East
            </MenuItem>
            <MenuItem value="UK&I">UK&I</MenuItem>
          </Select>
        </FormControl>
      )}

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

export default FilterControls;