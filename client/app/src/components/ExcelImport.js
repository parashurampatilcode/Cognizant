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
          { field: "id", headerName: "ID", width: 70 },
          { field: "name", headerName: "Name", width: 150 },
          { field: "value", headerName: "Value", width: 100 },
          { field: "status", headerName: "Status", width: 110 },
          {
            field: "dateCreated",
            headerName: "Date Created",
            width: 160,
            type: "date",
          },
          {
            field: "quantity",
            headerName: "Quantity",
            type: "number",
            width: 110,
          },
          { field: "category", headerName: "Category", width: 130 },
          { field: "email", headerName: "Email", width: 200 },
          { field: "city", headerName: "City", width: 140 },
          { field: "score", headerName: "Score", type: "number", width: 100 },
        ],
        rows: [
          {
            id: 1,
            name: "User One",
            value: "Value 1",
            status: "Active",
            dateCreated: new Date(2025, 2, 11),
            quantity: 75,
            category: "Alpha",
            email: "user.one@example.com",
            city: "Metropolis",
            score: 88,
          },
          {
            id: 2,
            name: "User Two",
            value: "Value 2",
            status: "Inactive",
            dateCreated: new Date(2025, 2, 12),
            quantity: 120,
            category: "Beta",
            email: "user.two@example.com",
            city: "Gotham",
            score: 45,
          },
          {
            id: 3,
            name: "User Three",
            value: "Value 3",
            status: "Active",
            dateCreated: new Date(2025, 2, 13),
            quantity: 30,
            category: "Alpha",
            email: "user.three@example.com",
            city: "Star City",
            score: 92,
          },
          {
            id: 4,
            name: "User Four",
            value: "Value 4",
            status: "Active",
            dateCreated: new Date(2025, 2, 14),
            quantity: 500,
            category: "Gamma",
            email: "user.four@example.com",
            city: "Central City",
            score: 76,
          },
          {
            id: 5,
            name: "User Five",
            value: "Value 5",
            status: "Pending",
            dateCreated: new Date(2025, 2, 15),
            quantity: 22,
            category: "Beta",
            email: "user.five@example.com",
            city: "Metropolis",
            score: 60,
          },
          {
            id: 6,
            name: "User Six",
            value: "Value 6",
            status: "Inactive",
            dateCreated: new Date(2025, 2, 16),
            quantity: 850,
            category: "Gamma",
            email: "user.six@example.com",
            city: "Gotham",
            score: 33,
          },
          {
            id: 7,
            name: "User Seven",
            value: "Value 7",
            status: "Active",
            dateCreated: new Date(2025, 2, 17),
            quantity: 15,
            category: "Alpha",
            email: "user.seven@example.com",
            city: "Star City",
            score: 95,
          },
          {
            id: 8,
            name: "User Eight",
            value: "Value 8",
            status: "Active",
            dateCreated: new Date(2025, 2, 18),
            quantity: 199,
            category: "Beta",
            email: "user.eight@example.com",
            city: "Central City",
            score: 81,
          },
          {
            id: 9,
            name: "User Nine",
            value: "Value 9",
            status: "Pending",
            dateCreated: new Date(2025, 2, 19),
            quantity: 345,
            category: "Gamma",
            email: "user.nine@example.com",
            city: "Metropolis",
            score: 55,
          },
          {
            id: 10,
            name: "User Ten",
            value: "Value 10",
            status: "Active",
            dateCreated: new Date(2025, 2, 20),
            quantity: 67,
            category: "Alpha",
            email: "user.ten@example.com",
            city: "Gotham",
            score: 79,
          },
        ],
      };

      // You can optionally log it to see the structure
      // console.log(JSON.stringify(mockData, null, 2));
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
