import React, { useState, useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import {
  DataGrid,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { IconButton, Tooltip, Button } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";

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
      <DataGrid
        ref={gridRef}
        rows={filteredRows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        disableVirtualization
        components={{
          Toolbar: () => (
            <GridToolbarContainer>
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  padding: "8px",
                  marginLeft: "16px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
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
