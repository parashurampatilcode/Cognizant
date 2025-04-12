import ExportIcon from "./ExportIcon";


import React, { useState, useRef, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { lighten, styled } from "@mui/material/styles";
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import {
  FileDownload,
  Image,
  ContentCopy,
  Close as CloseIcon,
  TableView,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import * as htmlToImage from "html-to-image";
import axios from "axios";

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
    backgroundColor: primaryColor, // Changed to primary blue
    color: "#FFFFFF !important", // White text for better contrast
    fontSize: "0.95rem !important",
    textTransform: "none",
    borderBottom: `2px solid ${primaryColor}`,
  },
  "& .last-row": {
    fontWeight: "bold",
    backgroundColor: lighten(primaryColor, 0.85), // Lighter shade of blue for last row
    color: "#000",
  },
  "& .first-column": {
    fontWeight: "bold",
  },
  "& .last-column": {
    fontWeight: "bold",
    backgroundColor: lighten(primaryColor, 0.85), // Lighter shade of blue for last column
  },
  "& .negative-value": {
    fontWeight: "bold",
    backgroundColor: "#FF4D4D", // Brighter red
    color: "#fff",
  },
  "& .high-pdp": {
    fontWeight: "bold",
    backgroundColor: "#FFC107",
    color: "#000",
  },
  "& .MuiDataGrid-root": {
    overflowX: "auto",
  },
  "& .MuiDataGrid-cell": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    borderBottom: `1px solid ${darkGrey}`,
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

const DemandViewTable = ({ reportData, filterValues, tableName }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupData, setPopupData] = useState({ rows: [], columns: [] });
  const [popupTitle, setPopupTitle] = useState("");
  const [filterContext, setFilterContext] = useState(null);
  const tableRef = useRef(null);
  const popupTableRef = useRef(null);

  useMemo(() => {
    if (reportData && reportData.length > 0) {
      const cols = Object.keys(reportData[0]).map((key, index) => ({
        field: key,
        headerName:
          key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
        minWidth: 150,
        flex: 1,
        renderCell: (params) =>
          index === 0 && tableName === 'Top10Accounts' ? (
            <StyledClickableCell>{params.value}</StyledClickableCell>
          ) : (
            params.value
          ),
        cellClassName: (params) => {
          const isLastRow = params.row.id === reportData.length;
          const isFirstColumn = index === 0;
          const isLastColumn = index === Object.keys(reportData[0]).length - 1;
        //   const isMiddleColumn = [
        //     "Pdp",
        //     "PDP (PA-)",
        //     "PDP (A+)",
        //     "Vcdp",
        //     "VCDP (PA-)",
        //     "VCDP (A)",
        //   ].includes(params.colDef.headerName);
          const numericValue = Number(params.value);

          const isNegative =
            !isLastRow &&
            isLastColumn &&
            !isNaN(numericValue) &&
            numericValue < 0;

          const highPdp =
            !isLastRow &&
         //   isMiddleColumn &&
            !isNaN(numericValue) &&
            numericValue > 10;

          return `${isLastRow ? "last-row" : ""} 
            ${isFirstColumn ? "first-column" : ""}
            ${isLastColumn ? "last-column" : ""}
            ${highPdp ? "high-pdp" : ""} 
            ${isNegative ? "negative-value" : ""}`.trim();
        },
      }));
      setColumns(cols);
      setRows(reportData.map((row, index) => ({ ...row, id: index + 1 })));
    }
  }, [reportData]);

  const handleCellClick = async (params) => {
    if (params.field === columns[0].field) {
      const cellValue = params.value;
      setPopupTitle(`Demand Detailed View Dashboard - Account Name : ${cellValue}`);
      setFilterContext({
        practice: filterValues.practice,
        market: filterValues.market,
        offOn: filterValues.offOn,
        busUnit: filterValues.busUnit,
        value: cellValue,
      });
      try {
        const response = await axios.get(
          `http://localhost:5000/demand/top10AccountsBreakUpCountsByMonth`,
          {
            params: {
              practice: filterValues.practice,
              market: filterValues.market,
              offOn: filterValues.offOn,
              busUnit : filterValues.busUnit,
              accountName: cellValue,
            },
          }
        );
        const data = response.data;
        const cols = Object.keys(data[0]).map((key, index) => ({
          field: key,
          headerName: key.replace(/_/g, " ").toUpperCase(),
          flex: 1,
          cellClassName: (params) => {
            const isLastRow = params.row.id === data.length;
            const isLastColumn = index === Object.keys(data[0]).length - 1;
            // const isMiddleColumn = [
            //   "Pdp",
            //   "PDP (PA-)",
            //   "PDP (A+)",
            //   "Vcdp",
            //   "VCDP (PA-)",
            //   "VCDP (A)",
            // ].some((header) =>
            //   params.colDef.headerName
            //     .toUpperCase()
            //     .includes(header.toUpperCase())
            // );
            const numericValue = Number(params.value);

            const isNegative =
              !isLastRow &&
              isLastColumn &&
              !isNaN(numericValue) &&
              numericValue < 0;

            const highPdp =
              !isLastRow &&
            //  isMiddleColumn &&
              !isNaN(numericValue) &&
              numericValue > 10;

            return `${isLastRow ? "last-row" : ""} 
              ${isLastColumn ? "last-column" : ""}
              ${highPdp ? "high-pdp" : ""}               
              ${isNegative ? "negative-value" : ""}`.trim();
          },
        }));
        setPopupData({
          rows: data.map((row, index) => ({ ...row, id: index + 1 })),
          columns: cols,
        });
        setOpenPopup(true);
      } catch (error) {
        console.error("Error fetching popup data:", error);
      }
    }
  };

  

  return (
    <Box sx={{ position: "relative" }}>
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
        <ExportIcon exportRows = {rows} exportColumns = {columns} exportTableRef={tableRef} reportName = 'DemandView' />
      </Box>

      <div
        ref={tableRef}
        style={{ height: 600, width: "100%", overflow: "auto" }}
      >
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
          onCellClick={handleCellClick}
          sx={{
            "& .MuiDataGrid-main": { overflow: "auto" },
            "& .MuiDataGrid-virtualScroller": { overflow: "auto !important" },
          }}
        />
      </div>

      <Dialog
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: primaryColor,
            color: "#fff",
            padding: "16px",
            fontWeight: "bold",
          }}
        >
          <Typography variant="h6" component="div">
            {popupTitle}
          </Typography>
          <IconButton
            onClick={() => setOpenPopup(false)}
            sx={{ marginLeft: "auto", color: "#fff" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {filterContext && (
            <Box sx={{ mb: 2, p: 1, bgcolor: lightGrey, borderRadius: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Practice:
                  </Typography>
                  <Typography component="span">
                    {filterContext.practice}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Market:
                  </Typography>
                  <Typography component="span">
                    {filterContext.market}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Off/On:
                  </Typography>
                  <Typography component="span">
                    {filterContext.offOn}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Business Unit:
                  </Typography>
                  <Typography component="span">
                    {filterContext.busUnit}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Account Name:
                  </Typography>
                  <Typography component="span">
                    {filterContext.value}
                  </Typography>
                </Box>
              </Typography>
              <Divider sx={{ borderColor: darkGrey }} />
            </Box>
          )}
          <Box sx={{ position: "relative", paddingTop: 5 }}>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: 1,
                display: "flex",
                gap: 1,
                padding: 1,
              }}
            >
              <ExportIcon exportRows = {rows} exportColumns = {columns} exportTableRef={tableRef} reportName = 'DemandView_PopUp' />
            </Box>

            <Box
              ref={popupTableRef}
              id="popup-table"
              style={{ height: 400, width: "100%", overflow: "auto" }}
            >
              <StyledDataGrid
                rows={popupData.rows}
                columns={popupData.columns}
                autoHeight
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                pagination={false}
                hideFooterPagination
                sx={{
                  "& .MuiDataGrid-main": { overflow: "auto" },
                  "& .MuiDataGrid-virtualScroller": {
                    overflow: "auto !important",
                  },
                  "& .MuiDataGrid-columnHeader": {
                    backgroundColor: primaryColor,
                    color: "#FFFFFF !important",
                  },
                  "& .last-row": {
                    backgroundColor: lighten(primaryColor, 0.85),
                  },
                  "& .last-column": {
                    backgroundColor: lighten(primaryColor, 0.85),
                  },
                }}
              />
            </Box>
          </Box>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={() => setOpenPopup(false)} variant="outlined">
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DemandViewTable;