import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
} from "@mui/material";
import api from "../api";
import axios from "axios";
const FilterControlsDemand = ({ onReportData, reportName }) => {
  const [practice, setPractice] = useState("All");
  const [market, setMarket] = useState("All");
  const [offOn, setOffOn] = useState("All");
  const [busUnit, setBusUnit] = useState("All");
  
  const [businessUnitsList, setBusinessUnitsList] = useState([]); // State to store business units
  const [offshoreOnsiteList, setOffshoreOnsiteList] = useState([]); // State to store offshore/onsite values
  const [marketList, setMarketList] = useState([]); // State to store business units
  const [practiceList, setPracticeList] = useState([]); // State to store offshore/onsite values
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBusinessUnitsList = async () => {
      try {
        const response = await api.get("/demandselect/businessUnitDescs");
        setBusinessUnitsList(response.data); // Populate business units from API response
      } catch (error) {
        console.error("Error fetching business units list:", error);
      }
    };

    const fetchOffshoreOnsiteList = async () => {
      try {
        const response = await api.get("/demandselect/offOns");
        setOffshoreOnsiteList(response.data); // Populate business units from API response
      } catch (error) {
        console.error("Error fetching onsite/offshore list:", error);
      }
    };

    const fetchMarketList = async () => {
      try {
        const response = await api.get("/demandselect/market");
        setMarketList(response.data); 
      } catch (error) {
        console.error("Error fetching market list:", error);
      }
    };

    const fetchPracticeList = async () => {
      try {
        const response = await api.get("/demandselect/practice");
        setPracticeList(response.data); 
      } catch (error) {
        console.error("Error fetching practice list:", error);
      }
    };

    fetchBusinessUnitsList();
    fetchOffshoreOnsiteList();
    fetchMarketList();
    fetchPracticeList()
  }, []);

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

  const isButtonDisabled = loading;

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
          {practiceList.map((unit, index) => (
              <MenuItem key={index} value={unit}>
                {unit}
              </MenuItem>
            ))}
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
          {marketList.map((unit, index) => (
              <MenuItem key={index} value={unit}>
                {unit}
              </MenuItem>
            ))}
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
            {offshoreOnsiteList.map((unit, index) => (
              <MenuItem key={index} value={unit}>
                {unit}
              </MenuItem>
            ))}
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
            {businessUnitsList.map((unit, index) => (
              <MenuItem key={index} value={unit}>
                {unit}
              </MenuItem>
            ))}
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

export default FilterControlsDemand;