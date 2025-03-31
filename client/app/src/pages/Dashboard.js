import React, { useRef, useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import DashboardTable from "../components/DashboardTable";
import FilterControls from "../components/FilterControls";

function Dashboard() {
  const tableRef = useRef(null);
  const [filters, setFilters] = useState({
    viewType: 'Practice',
    location: 'All'
  });

  useEffect(() => {
    const refreshData = () => {
      if (tableRef.current) {
        tableRef.current.refresh();
      }
    };

    window.addEventListener('dashboard-click', refreshData);
    return () => {
      window.removeEventListener('dashboard-click', refreshData);
    };
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (tableRef.current) {
      tableRef.current.refresh(newFilters);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <FilterControls onFilterChange={handleFilterChange} />
      <DashboardTable ref={tableRef} filters={filters} />
    </Box>
  );
}

export default Dashboard;
