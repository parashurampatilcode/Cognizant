import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import UploadComponent from "./UploadComponent";
import DataTable from "./DataTable";

function ExcelImport() {
  const [selectedType, setSelectedType] = useState("Demand");
  const [uploadedData, setUploadedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleUpload = async (file) => {
    if (selectedType === "PDP" || selectedType === "VCDP") {
      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const endpoint = selectedType === "PDP" ? "pdp" : "vcdp";
        await axios.post(
          `http://localhost:5000/${endpoint}/uploadAndProcess`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Fetch the updated data after upload
        const response = await axios.get(`http://localhost:5000/${endpoint}`);
        const data = response.data;

        if (data.length > 0) {
          const keys = Object.keys(data[0]);
          const columns = keys.map((key) => ({
            field: key,
            headerName: key,
            width: 150,
          }));

          setUploadedData({
            columns,
            rows: data,
          });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setError(
          "Error uploading file. Please check the file format and try again."
        );
      } finally {
        setLoading(false);
      }
    } else {
      // TODO: Handle other file types
      const mockData = {
        columns: [
          { field: "id", headerName: "ID", width: 90 },
          { field: "name", headerName: "Name", width: 130 },
          { field: "value", headerName: "Value", width: 130 },
        ],
        rows: [{ id: 1, name: "Sample", value: "Data" }],
      };
      setUploadedData(mockData);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" sx={{ marginBottom: 3 }}>
        Excel Import
      </Typography>

      <FormControl component="fieldset" sx={{ marginBottom: 3 }}>
        <FormLabel component="legend">Select Import Type</FormLabel>
        <RadioGroup row value={selectedType} onChange={handleTypeChange}>
          <FormControlLabel value="Demand" control={<Radio />} label="Demand" />
          <FormControlLabel value="PDP" control={<Radio />} label="PDP" />
          <FormControlLabel value="VCDP" control={<Radio />} label="VCDP" />
          <FormControlLabel
            value="Lateral Hiring"
            control={<Radio />}
            label="Lateral Hiring"
          />
          <FormControlLabel
            value="Rotation List"
            control={<Radio />}
            label="Rotation List"
          />
          <FormControlLabel value="NBL" control={<Radio />} label="NBL" />
        </RadioGroup>
      </FormControl>

      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}

      <UploadComponent onUpload={handleUpload} disabled={loading} />

      {uploadedData && (
        <Box sx={{ height: 400, width: "100%" }}>
          <DataTable rows={uploadedData.rows} columns={uploadedData.columns} />
        </Box>
      )}
    </Box>
  );
}

export default ExcelImport;
