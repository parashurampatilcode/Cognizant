import ExportIcon from "./ExportIcon";
import React, { useState, useRef, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { lighten, styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

const primaryColor = "#005EB8"; // Cognizant's primary blue
const secondaryColor = "#E6F0FA"; // Light blue
const lightGrey = "#F5F5F5";
const darkGrey = "#D3D3D3";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-columnHeader": {
    "& .MuiDataGrid-columnHeaderTitleContainer": {
      "& .MuiDataGrid-columnHeaderTitle": {
        fontWeight: "bold !important",
      },
    },
    backgroundColor: primaryColor,
    color: "#FFFFFF !important",
    fontSize: "0.8rem !important", // Reduced font size
    textTransform: "none",
    borderBottom: `2px solid ${primaryColor}`,
    whiteSpace: "normal",
    wordWrap: "break-word",
  },
  "& .last-row": {
    fontWeight: "bold",
    backgroundColor: lighten(primaryColor, 0.85),
    color: "#000",
  },
  "& .first-column": {
    fontWeight: "bold",
  },
  // "& .last-column": {
  //   fontWeight: "bold",
  //   backgroundColor: lighten(primaryColor, 0.85),
  // },
  "& .negative-value": {
    fontWeight: "bold",
    backgroundColor: "#FF4D4D",
    color: "#fff",
  },
  // "& .high-pdp": {
  //   fontWeight: "bold",
  //   backgroundColor: "#FFC107",
  //   color: "#000",
  // },
  "& .MuiDataGrid-root": {
    overflowX: "auto",
  },
  "& .MuiDataGrid-cell": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    borderBottom: `1px solid ${darkGrey}`,
    fontSize: "0.8rem",
  },
  "& .MuiDataGrid-columnHeaders": {
    whiteSpace: "nowrap",
  },
}));

const StyledClickableCell = styled("div")(({ theme }) => ({
  cursor: "pointer",
  color: theme.palette.primary.main,
  textDecoration: "underline",
  "&:hover": {
    color: theme.palette.primary.dark,
  },
}));

const PDPVCDPSupplyTable = ({ reportData, tableName }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const tableRef = useRef(null);

  useMemo(() => {
    if (reportData && reportData.length > 0) {
      console.log("in seting rwos and columns", reportData);
      const cols = Object.keys(reportData[0]).map((key, index) => {
        let columnWidth = 30; // Default width

        if (index === 0) {
          columnWidth = 150;  // Increased width for the first column
        }

        return {
          field: key,
          headerName:
            key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          minWidth: columnWidth,
          flex: index === 0 ? 0 : 1, // Don't apply flex to the first column
          renderCell: (params) =>
            index === 0 && tableName === "Top10Accounts" ? (
              <StyledClickableCell>{params.value}</StyledClickableCell>
            ) : (
              params.value
            ),
          cellClassName: (params) => {
            const isLastRow = params.row.id === reportData.length;
            const isFirstColumn = index === 0;
            const isLastColumn = index ===
              Object.keys(reportData[0]).length - 1;
            const numericValue = Number(params.value);

            const isNegative =
              !isLastRow &&
              isLastColumn &&
              !isNaN(numericValue) &&
              numericValue < 0;

            const highPdp =
              !isLastRow &&
              !isNaN(numericValue) &&
              numericValue > 10;

            return `${isLastRow ? "last-row" : ""} 
              ${isFirstColumn ? "first-column" : ""}
              ${isLastColumn ? "last-column" : ""}
              ${highPdp ? "high-pdp" : ""} 
              ${isNegative ? "negative-value" : ""}`.trim();
          },
        };
      });
      setColumns(cols);
      setRows(reportData.map((row, index) => ({ ...row, id: index + 1 })));
      console.log("rows", rows);
      console.log("columns", columns);
    }
  }, [reportData, tableName]);

  return (
    <Box sx={{ position: "relative", padding:"0 5px" }}>
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: 0,
          zIndex: 1,
          display: "flex",
          gap: 1,
          padding: 1,
        }}
      >
        <ExportIcon
          exportRows={rows}
          exportColumns={columns}
          exportTableRef={tableRef}
          reportName="PDPVCDPSupply"
        />
      </Box>
      

      <div
        ref={tableRef}
        style={{ height: "auto", width: "auto", overflow: "auto" }}
      >
        <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          //backgroundColor: "#FFC107"
        }}
      >
        {tableName}
      </Typography>
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
            "& .MuiDataGrid-main": { overflow: "auto" },
            "& .MuiDataGrid-virtualScroller": { overflow: "auto !important" },
          }}
        />
      </div>
    </Box>
  );
};

export default PDPVCDPSupplyTable;