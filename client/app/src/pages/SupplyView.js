import React, { useState, useMemo, useEffect } from "react";
import { Typography } from "@mui/material";
import UploadComponent from "../components/UploadComponent";
import DataTable from "../components/DataTable";
import axios from "axios";

function SupplyView() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Assuming you have an endpoint to handle file uploads and process them
      // and then store the data using your existing /POST endpoint.
      // You will need to create this endpoint.
      await axios.post("http://localhost:5000/pdp/uploadAndProcess", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      fetchData(); // Fetch the updated data after upload
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/pdp");
      setData(response.data);

      if (response.data.length > 0) {
        const keys = Object.keys(response.data[0]);
        const cols = keys.map((key) => ({
          field: key,
          headerName: key,
          width: 150, // Adjust width as needed
        }));
        setColumns(cols);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <Typography variant="h4">Supply View - PDP</Typography>
      <UploadComponent onUpload={handleUpload} />
      {data.length > 0 && <DataTable rows={data} columns={columns} />}
    </>
  );
}

export default SupplyView;
