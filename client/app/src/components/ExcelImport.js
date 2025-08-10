// c:\Users\Parashuram\Projects\ei-demand-supply-tool\client\app\src\components\ExcelImport.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Box,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  TextField,
} from "@mui/material";
import UploadComponent from "./UploadComponent";
import DataTable from "./DataTable";

function ExcelImport() {
  const [selectedType, setSelectedType] = useState("Demand");
  const [uploadedData, setUploadedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadLogs, setUploadLogs] = useState([]);
  const [reportExtractionDate, setReportExtractionDate] = useState("");

  // Get username from localStorage or context (adjust as per your app)
  const username = localStorage.getItem("username") || "Unknown";

  // Fetch upload logs on mount and after upload
  const fetchUploadLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/excel-upload-log");
      setUploadLogs(res.data);
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchUploadLogs();
  }, []);

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setUploadedData(null); // Clear data when changing type
    setError(null);
    setSuccessMessage(null);
    // Always clear date when type changes
    setReportExtractionDate("");
  };

  const handleUpload = async (file) => {
    if (
      selectedType === "PDP" ||
      selectedType === "VCDP" ||
      selectedType === "Demand" ||
      selectedType === "Lateral Hiring"
    ) {
      // For Demand, PDP, VCDP and Lateral Hiring, ensure reportExtractionDate is provided
      if (
        (selectedType === "Demand" ||
          selectedType === "PDP" ||
          selectedType === "VCDP" ||
          selectedType === "Lateral Hiring") &&
        !reportExtractionDate
      ) {
        setError("Please select Report Extraction Date before uploading.");
        return;
      }

      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (
          selectedType === "Demand" ||
          selectedType === "PDP" ||
          selectedType === "VCDP" ||
          selectedType === "Lateral Hiring"
        ) {
          formData.append("report_extraction_date", reportExtractionDate);
        }

        const endpoint =
          selectedType === "PDP"
            ? "pdp"
            : selectedType === "VCDP"
            ? "vcdp"
            : selectedType === "Demand"
            ? "demand"
            : "lateralHiring"; // New endpoint

        const response = await axios.post(
          `http://localhost:5000/${endpoint}/uploadAndProcess`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Log the upload
        await axios.post("http://localhost:5000/api/excel-upload-log", {
          fileName: selectedType,
          uploadedBy: username,
        });
        fetchUploadLogs();

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
    } else if (selectedType === "Unique Allocation Report") {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        // Read Excel file and extract only required columns
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        // Only keep required columns
        const filteredData = jsonData
          .map((row) => ({
            assoId:
              row["Asso Id"] || row["AssoId"] || row["Associate Id"] || "",
            assoName: row["Asso Name"] || row["Associate Name"] || "",
            grade: row["Grade"] || "",
          }))
          .filter((row) => row.assoId && row.assoName && row.grade);
        if (filteredData.length === 0) {
          setUploadedData({ columns: [], rows: [] });
          setSuccessMessage("No valid data found in file.");
          setLoading(false);
          return;
        }
        // Send to backend
        const response = await axios.post(
          "http://localhost:5000/unique-allocation/uploadAndProcess",
          { records: filteredData }
        );
        // Log the upload
        await axios.post("http://localhost:5000/api/excel-upload-log", {
          fileName: selectedType,
          uploadedBy: username,
        });
        fetchUploadLogs();
        if (response.data.message) {
          setSuccessMessage(response.data.message);
        }
        setUploadedData({
          columns: [
            { field: "assoId", headerName: "Asso Id", width: 150 },
            { field: "assoName", headerName: "Asso Name", width: 200 },
            { field: "grade", headerName: "Grade", width: 100 },
          ],
          rows: filteredData,
        });
      } catch (error) {
        setError(
          "Error uploading file. Please check the file format and try again."
        );
        console.error("Error uploading unique allocation report:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setUploadedData(null);
      setError("This file type is not yet supported.");
    }
  };
  const primaryColor = "#005EB8"; // Cognizant's primary blue
  const getRowId = (row) =>
    row.assoId || row.import_id || row.pdp_main_id || row.vcdp_main_id; // Use assoId as the ID

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
        {/* Left: Import controls */}
        <Box sx={{ flex: "0 0 320px", mr: 4, minWidth: 900 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: primaryColor,
              marginBottom: 2,
              textAlign: "left",
            }}
          >
            Excel Import
          </Typography>
          <FormControl component="fieldset" sx={{ marginBottom: 3 }}>
            <FormLabel component="legend">Select Import Type</FormLabel>
            <RadioGroup
              row
              value={selectedType}
              onChange={handleTypeChange}
              sx={{ flexWrap: "nowrap", width: "100%", overflowX: "auto" }}
            >
              <FormControlLabel
                value="Demand"
                control={<Radio />}
                label="Demand"
              />
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
              <FormControlLabel
                value="Unique Allocation Report"
                control={<Radio />}
                label="Unique Allocation Report"
              />
            </RadioGroup>
          </FormControl>

          {/* Report Extraction Date - always visible */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Report Extraction Date"
              type="date"
              value={reportExtractionDate}
              onChange={(e) => setReportExtractionDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 260 }}
            />
          </Box>

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
        </Box>
        {/* Right: Recent File Imports */}
        <Box sx={{ width: 600, ml: "auto" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: primaryColor,
              marginBottom: 2,
              textAlign: "left",
            }}
          >
            Recent File Imports
          </Typography>

          <DataTable
            rows={uploadLogs.map((log) => ({
              id: log.out_id,
              fileName: log.out_file_name,
              uploadedBy: log.out_uploaded_by,
              uploadedAt: log.out_upload_datetime
                ? new Date(log.out_upload_datetime).toLocaleString()
                : "",
            }))}
            columns={[
              { field: "fileName", headerName: "File Name", width: 220 },
              { field: "uploadedBy", headerName: "Uploaded By", width: 180 },
              {
                field: "uploadedAt",
                headerName: "Latest Upload Time",
                width: 200,
              },
            ]}
            getRowId={(row) => row.id}
            disableSearch={true}
            height={370}
            hideFooter={true}
          />
        </Box>
      </Box>
      {/* Bottom: Global search and Excel Import Data Grid */}
      <Box sx={{ width: "100%" }}>
        {uploadedData && uploadedData.rows.length > 0 && (
          <Box sx={{ width: "100%" }}>
            <DataTable
              rows={uploadedData.rows}
              columns={uploadedData.columns}
              getRowId={getRowId}
            />
          </Box>
        )}
        {uploadedData && uploadedData.rows.length === 0 && (
          <Alert severity="info" sx={{ marginBottom: 2 }}>
            No data to display.
          </Alert>
        )}
      </Box>
    </Box>
  );
}

export default ExcelImport;
