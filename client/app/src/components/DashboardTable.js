import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getDashboardSummary } from "../services/dashboardApi";
import { styled } from "@mui/material/styles";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-columnHeader": {
    "& .MuiDataGrid-columnHeaderTitleContainer": {
      "& .MuiDataGrid-columnHeaderTitle": {
        fontWeight: "bold !important", // Ensure the header title text is bold
      },
    },
    backgroundColor: "#008080 !important", // Teal background color
    color: "#fff !important", // White text for contrast
    fontSize: "1rem !important", // Slightly larger font size
    textTransform: "uppercase", // Optional: Make header text uppercase
    borderBottom: "2px solid #ccc", // Optional: Add a bottom border for separation
  },
  "& .last-row": {
    fontWeight: "bold",
  },
  "& .first-column": {
    fontWeight: "bold",
  },
  "& .last-column": {
    fontWeight: "bold",
  },
  "& .negative-value": {
    color: "red",
    fontWeight: "bold",
  },
  "& .MuiDataGrid-root": {
    overflowX: "auto",
  },
  "& .MuiDataGrid-cell": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  "& .MuiDataGrid-columnHeaders": {
    whiteSpace: "nowrap",
  }
}));

const DashboardTable = React.forwardRef((props, ref) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const loadData = async () => {
    try {
      const data = await getDashboardSummary();
      if (data && data.length > 0) {
        const cols = Object.keys(data[0]).map((key, index) => ({
          field: key,
          headerName:
            key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          minWidth: 150,
          flex: 1,
          cellClassName: (params) => {
            const isLastRow = params.row.id === data.length;
            const isFirstColumn = index === 0;
            const isLastColumn = index === Object.keys(data[0]).length - 1;
            const isNegative =
              isLastColumn &&
              typeof params.value === "number" &&
              params.value < 0;

            return `${isLastRow ? "last-row" : ""} ${
              isFirstColumn ? "first-column" : ""
            } 
                    ${isLastColumn ? "last-column" : ""} ${
              isNegative ? "negative-value" : ""
            }`.trim();
          },
        }));
        setColumns(cols);

        const rowsWithId = data.map((row, index) => ({
          ...row,
          id: index + 1,
        }));
        setRows(rowsWithId);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Expose the loadData method to parent components
  React.useImperativeHandle(ref, () => ({
    refresh: loadData,
  }));

  return (
    <div style={{ height: 600, width: "100%", overflow: "auto" }}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        rowHeight={30}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        disableSelectionOnClick
        pagination={false}
        hideFooterPagination
        autoWidth
        sx={{
          '& .MuiDataGrid-main': {
            overflow: 'auto',
          },
          '& .MuiDataGrid-virtualScroller': {
            overflow: 'auto !important',
          }
        }}
      />
    </div>
  );
});

export default DashboardTable;



