import React, { useRef, useEffect } from "react";
import { Typography } from "@mui/material";
import DashboardTable from "../components/DashboardTable";

function Dashboard() {
  const tableRef = useRef(null);

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

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <DashboardTable ref={tableRef} />
    </>
  );
}

export default Dashboard;