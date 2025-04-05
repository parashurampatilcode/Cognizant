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

const FilterControls = ({ onReportData }) => {
  const [practice, setPractice] = useState("All");
  const [market, setMarket] = useState("All");
  const [offOn, setOffOn] = useState("All");
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

  const handleViewReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
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
        onReportData(response.data);
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
        <InputLabel id="market-label">Market</InputLabel>
        <Select
          labelId="market-label"
          id="market-select"
          value={market}
          label="Market"
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
