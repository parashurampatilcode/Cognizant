import React, { useState, useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import { InputBase, Box } from "@mui/material";

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

function DataTable({
  rows,
  columns,
  getRowId,
  searchPlaceholder = "Global Search...",
  disableSearch = false,
  height,
  hideFooter = false,
}) {
  const [searchText, setSearchText] = useState("");
  const gridRef = useRef(null);

  const filteredRows = useMemo(() => {
    if (disableSearch || !searchText) return rows;
    return rows.filter((row) =>
      columns.some((column) =>
        String(row[column.field] ?? "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    );
  }, [rows, columns, searchText, disableSearch]);

  return (
    <div style={{ height: height || 600, width: "100%" }}>
      {!disableSearch && (
        <Box
          sx={{
            padding: 1,
            backgroundColor: "#FFFFFF",
            borderBottom: `1px solid #D3D3D3`,
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <InputBase
            type="text"
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            fullWidth
            sx={{
              padding: "6px 12px",
              marginLeft: 1,
              borderRadius: 1,
              backgroundColor: "#F5F5F5",
              border: `1px solid #D3D3D3`,
              "&:focus-within": {
                borderColor: "#005EB8",
              },
              minWidth: 260,
              width: "100%",
            }}
          />
        </Box>
      )}
      <StyledDataGrid
        ref={gridRef}
        rows={filteredRows}
        getRowId={getRowId}
        columns={columns}
        pageSize={7}
        rowsPerPageOptions={hideFooter ? [] : [10, 25, 50]}
        disableVirtualization
        autoHeight={false}
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#E6F0FA",
            color: "#005EB8",
            fontWeight: 600,
            borderBottom: "2px solid #005EB8",
          },
        }}
        hideFooterSelectedRowCount
        hideFooter={hideFooter}
      />
    </div>
  );
}

export default DataTable;
