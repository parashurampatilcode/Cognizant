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
  Alert,
} from "@mui/material";
import UploadComponent from "./UploadComponent";
import DataTable from "./DataTable";

function ExcelImport() {
  const [selectedType, setSelectedType] = useState("Demand");
  const [uploadedData, setUploadedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setUploadedData(null); // Clear data when changing type
    setError(null);
    setSuccessMessage(null);
  };

  const handleUpload = async (file) => {
    if (
      selectedType === "PDP" ||
      selectedType === "VCDP" ||
      selectedType === "Demand"
    ) {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const endpoint =
          selectedType === "PDP"
            ? "pdp"
            : selectedType === "VCDP"
            ? "vcdp"
            : "demand";
        const response = await axios.post(
          `http://localhost:5000/${endpoint}/uploadAndProcess`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Display success message from the server
        if (response.data.message) {
          setSuccessMessage(response.data.message);
        }
        // Fetch the updated data after upload
        const dataResponse = await axios.get(
          `http://localhost:5000/${endpoint}`
        );
        const data = dataResponse.data;

        if (data.length > 0) {
          const keys = Object.keys(data[0]);
          const columns = keys.map((key) => ({
            field: key,
            headerName: key.replace(/([A-Z])/g, " $1").trim(), // Add space before capital letters for better readability
            width: 150,
          }));

          setUploadedData({
            columns,
            rows: data,
          });
        } else {
          setUploadedData({
            columns: [],
            rows: [],
          });
          setSuccessMessage("File processed successfully, but no data found.");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setError(
          "Error uploading file. Please check the file format and try again."
        );
        if (
          error.response &&
          error.response.data &&
          error.response.data.details
        ) {
          setError(error.response.data.details);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // TODO: Handle other file types
      // Removed the mock data section as it's not relevant to the problem
      // and was causing confusion.
      setUploadedData(null);
      setError("This file type is not yet supported.");
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
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ marginBottom: 2 }}>
          {successMessage}
        </Alert>
      )}

      <UploadComponent onUpload={handleUpload} disabled={loading} />

      {uploadedData && uploadedData.rows.length > 0 && (
        <Box sx={{ height: 400, width: "100%" }}>
          <DataTable rows={uploadedData.rows} columns={uploadedData.columns} />
        </Box>
      )}
      {uploadedData && uploadedData.rows.length === 0 && (
        <Alert severity="info" sx={{ marginBottom: 2 }}>
          No data to display.
        </Alert>
      )}
    </Box>
  );
}

export default ExcelImport;
