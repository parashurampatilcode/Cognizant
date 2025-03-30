import React, { useState, useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import { InputBase } from "@mui/material";

// Custom styled DataGrid
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#E6F0FA", // Light blue background matching the app's theme
    color: "#000000", // Black text for high contrast
    borderBottom: `2px solid #005EB8`, // Darker blue border for separation
  },
  "& .MuiDataGrid-columnHeader": {
    padding: theme.spacing(0, 2), // Consistent padding
    fontWeight: 600, // Slightly bold headers
    "&:hover": {
      backgroundColor: "#D1E4F9", // Slightly darker blue on hover
    },
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontSize: "0.95rem", // Slightly larger text
    letterSpacing: "0.5px", // Better readability
    textTransform: "uppercase", // Modern look
  },
  "& .MuiDataGrid-columnSeparator": {
    color: "#005EB8", // Matching separator color
  },
  "& .MuiDataGrid-cell": {
    borderBottom: `1px solid #D3D3D3`, // Light grey border for rows, matching the app
  },
}));

function DataTable({ rows, columns }) {
  const [searchText, setSearchText] = useState("");
  const gridRef = useRef(null);

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    return rows.filter((row) =>
      columns.some((column) =>
        String(row[column.field])
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    );
  }, [rows, columns, searchText]);

  return (
    <div style={{ height: 600, width: "100%" }}>
      <StyledDataGrid
        ref={gridRef}
        rows={filteredRows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        disableVirtualization
        components={{
          Toolbar: () => (
            <GridToolbarContainer
              sx={{
                padding: 1,
                backgroundColor: "#FFFFFF", // White background for toolbar
                borderBottom: `1px solid #D3D3D3`, // Light grey border
              }}
            >
              <InputBase
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{
                  padding: "6px 12px",
                  marginLeft: 1,
                  borderRadius: 1,
                  backgroundColor: "#F5F5F5", // Light grey background for input
                  border: `1px solid #D3D3D3`, // Light grey border
                  "&:focus-within": {
                    borderColor: "#005EB8", // Blue border on focus
                  },
                }}
              />
            </GridToolbarContainer>
          ),
        }}
      />
    </div>
  );
}

export default DataTable;
