import React, { useState } from "react";
import { Button, Typography, Box } from "@mui/material";

function UploadComponent({ onUpload, disabled }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Simulate database upload and retrieval
      console.log("Uploading file:", selectedFile.name);
      onUpload(selectedFile);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="upload-file"
      />
      <label htmlFor="upload-file">
        <Button
          variant="contained"
          component="span"
          sx={{ marginRight: "16px" }}
        >
          Upload Excel File
        </Button>
      </label>
      {selectedFile && (
        <Typography sx={{ mr: 2 }}>{selectedFile.name}</Typography>
      )}
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!selectedFile || disabled}
      >
        Upload
      </Button>
    </Box>
  );
}

export default UploadComponent;
