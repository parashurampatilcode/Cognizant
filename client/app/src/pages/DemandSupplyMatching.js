// filepath: c:\Users\Parashuram\Projects\ei-demand-supply-tool-Parashuram-branch\Cognizant\client\app\src\pages\DemandSupplyMatching.js
// DemandSupplyMatching.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Box, Typography, InputBase } from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import axios from "axios";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#E6F0FA",
    color: "#000000",
    borderBottom: `2px solid #005EB8`,
  },
  "& .MuiDataGrid-columnHeader": {
    padding: theme.spacing(0, 2),
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#D1E4F9",
    },
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontSize: "0.95rem",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  "& .MuiDataGrid-columnSeparator": {
    color: "#005EB8",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: `1px solid #D3D3D3`,
  },
}));

function DemandSupplyMatching() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [searchText, setSearchText] = useState("");
  const gridRef = useRef(null);
  const [rowModesModel, setRowModesModel] = React.useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/demandselect");
        setData(response.data);

        if (response.data.length > 0) {
          let cols = Object.keys(response.data[0]).map((key) => ({
            field: key,
            headerName: key.replace(/_/g, " ").toUpperCase(),
            width: 150,
            editable: true, // Make columns editable
          }));

          // Add actions column
          cols = [
            ...cols,
            {
              field: "actions",
              type: "actions",
              headerName: "Actions",
              width: 100,
              cellClassName: "actions",
              getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === "edit";

                if (isInEditMode) {
                  return [
                    <GridActionsCellItem
                      icon={<SaveIcon />}
                      label="Save"
                      onClick={handleSaveClick(id)}
                      color="primary"
                    />,
                    <GridActionsCellItem
                      icon={<CancelIcon />}
                      label="Cancel"
                      className="textPrimary"
                      onClick={handleCancelClick(id)}
                      color="inherit"
                    />,
                  ];
                }

                return [
                  <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    className="textPrimary"
                    onClick={handleEditClick(id)}
                    color="inherit"
                  />,
                  <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={handleDeleteClick(id)}
                    color="inherit"
                  />,
                ];
              },
            },
          ];
          setColumns(cols);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [rowModesModel]);

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: "edit" } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: "view" } });
    // Here you would typically make an API call to save the changes to the server
    console.log(`Saving row with id ${id}`);
  };

  const handleDeleteClick = (id) => () => {
    const updatedData = data.filter((row) => row.ID !== id);
    setData(updatedData);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: "view", ignoreModifications: true },
    });
    const editedRow = data.find((row) => row.ID === id);
    if (editedRow.isNew) {
      setData(data.filter((row) => row.ID !== id));
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchText) return data;
    const lowerSearchText = searchText.toLowerCase();
    return data.filter((row) =>
      columns.slice(0, -1).some(
        (
          column // Exclude the 'actions' column
        ) => String(row[column.field]).toLowerCase().includes(lowerSearchText)
      )
    );
  }, [data, columns, searchText]);

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setData(data.map((row) => (row.ID === newRow.ID ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === "rowFocusOut") {
      event.defaultMuiPrevented = true;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Demand Supply Matching
      </Typography>
      <InputBase
        type="text"
        placeholder="Global Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{
          padding: "6px 12px",
          marginBottom: 2,
          borderRadius: 1,
          backgroundColor: "#F5F5F5",
          border: `1px solid #D3D3D3`,
          "&:focus-within": {
            borderColor: "#005EB8",
          },
          width: "100%",
        }}
      />
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
                  backgroundColor: "#FFFFFF",
                  borderBottom: `1px solid #D3D3D3`,
                }}
              >
                {/* Existing toolbar content if any */}
              </GridToolbarContainer>
            ),
          }}
          getRowId={(row) => row.ID}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
        />
      </div>
    </Box>
  );
}

export default DemandSupplyMatching;
