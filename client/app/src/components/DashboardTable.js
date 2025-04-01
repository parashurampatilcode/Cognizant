import React, { useState, useEffect, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getDashboardSummary } from "../services/dashboardApi";
import { styled } from "@mui/material/styles";
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import {
  FileDownload,
  Image,
  ContentCopy,
  Close as CloseIcon,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import * as htmlToImage from "html-to-image";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-columnHeader": {
    "& .MuiDataGrid-columnHeaderTitleContainer": {
      "& .MuiDataGrid-columnHeaderTitle": {
        fontWeight: "bold !important",
      },
    },
    backgroundColor: "#008080 !important",
    color: "#fff !important",
    fontSize: "1rem !important",
    textTransform: "uppercase",
    borderBottom: "2px solid #ccc",
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

const DashboardTable = React.forwardRef(({ filters }, ref) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupData, setPopupData] = useState({ rows: [], columns: [] });
  const [popupTitle, setPopupTitle] = useState("");
  const tableRef = useRef(null);
  const popupTableRef = useRef(null);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard Data");
    XLSX.writeFile(workbook, "dashboard_data.xlsx");
  };

  const handleExportImage = async () => {
    if (tableRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(tableRef.current);
        const link = document.createElement("a");
        link.download = "dashboard_table.png";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Error exporting image:", error);
      }
    }
  };

  const handleCopyData = async () => {
    try {
      const data = rows.map((row) => {
        const rowData = {};
        columns.forEach((col) => {
          rowData[col.headerName] = row[col.field];
        });
        return rowData;
      });
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      alert("Data copied to clipboard!");
    } catch (err) {
      console.error("Error copying data:", err);
    }
  };

  const loadData = async (currentFilters = filters) => {
    try {
      const data = await getDashboardSummary(currentFilters);
      if (data && data.length > 0) {
        const cols = Object.keys(data[0]).map((key, index) => ({
          field: key,
          headerName:
            key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          minWidth: 150,
          flex: 1,
          renderCell: (params) =>
            index === 0 ? (
              <StyledClickableCell>{params.value}</StyledClickableCell>
            ) : (
              params.value
            ),
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
            } ${isLastColumn ? "last-column" : ""} ${
              isNegative ? "negative-value" : ""
            }`.trim();
          },
        }));
        setColumns(cols);
        setRows(data.map((row, index) => ({ ...row, id: index + 1 })));
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const handleCellClick = async (params) => {
    if (params.field === columns[0].field) {
      setPopupTitle(params.value);
      try {
        const response = await fetch("http://localhost:5000/dashboard/summary");
        const data = await response.json();
        const cols = Object.keys(data[0]).map((key) => ({
          field: key,
          headerName: key.replace(/_/g, " ").toUpperCase(),
          flex: 1,
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

  const handleExportPopupExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(popupData.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Popup Data");
    XLSX.writeFile(workbook, "popup_data.xlsx");
  };

  const handleExportPopupImage = async () => {
    if (popupTableRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(popupTableRef.current);
        const link = document.createElement("a");
        link.download = "popup_table.png";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Error exporting popup image:", error);
      }
    }
  };

  const handleCopyPopupData = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(popupData.rows, null, 2)
      );
      alert("Popup data copied to clipboard!");
    } catch (error) {
      console.error("Error copying popup data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  React.useImperativeHandle(ref, () => ({
    refresh: loadData,
  }));

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
        <IconButton
          onClick={handleExportExcel}
          title="Export Excel"
          sx={{ color: "#008080" }}
        >
          <FileDownload />
        </IconButton>
        <IconButton
          onClick={handleExportImage}
          title="Export Image"
          sx={{ color: "#008080" }}
        >
          <Image />
        </IconButton>
        <IconButton
          onClick={handleCopyData}
          title="Copy Data"
          sx={{ color: "#008080" }}
        >
          <ContentCopy />
        </IconButton>
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
          sx={{
            "& .MuiDataGrid-main": { overflow: "auto" },
            "& .MuiDataGrid-virtualScroller": { overflow: "auto !important" },
          }}
          onCellClick={handleCellClick}
        />
      </div>

      <Dialog
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          {popupTitle}
          <IconButton
            onClick={() => setOpenPopup(false)}
            sx={{ marginLeft: "auto" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
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
              <IconButton
                onClick={handleExportPopupExcel}
                title="Export Excel"
                sx={{ color: "#008080" }}
              >
                <FileDownload />
              </IconButton>
              <IconButton
                onClick={handleExportPopupImage}
                title="Export Image"
                sx={{ color: "#008080" }}
              >
                <Image />
              </IconButton>
              <IconButton
                onClick={handleCopyPopupData}
                title="Copy Data"
                sx={{ color: "#008080" }}
              >
                <ContentCopy />
              </IconButton>
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
});

export default DashboardTable;
