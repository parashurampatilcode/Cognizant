// filepath: c:\Users\Parashuram\Projects\ei-demand-supply-tool-Parashuram-branch\Cognizant\client\app\src\pages\DemandSupplyMatching.js
// DemandSupplyMatching.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  InputBase,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Button, // Import Button component
} from "@mui/material"; // Import Autocomplete and TextField
import { styled } from "@mui/material/styles";

import {
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import api from "../api"; // Import the configured Axios instance
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

const primaryColor = "#005EB8"; // Cognizant's primary blue
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
    fontSize: "0.95rem !important",
    textTransform: "none",
    borderBottom: `2px solid ${primaryColor}`,
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
  "& .MuiDataGrid-cell--editable": {
    backgroundColor: "#FFFDE7", // Light yellow background for editable cells
    "&:hover": {
      backgroundColor: "#FFF9C4", // Slightly darker yellow on hover
    },
  },
  "& .MuiDataGrid-row.row-editing .MuiDataGrid-cell--editable": {
    backgroundColor: "#FFF59D !important", // Yellow background for editable cells
  },
  "& .MuiDataGrid-row.row-editing .MuiDataGrid-cell:not(.MuiDataGrid-cell--editable)":
    {
      backgroundColor: "#E0E0E0 !important", // Grey background for non-editable cells
    },
}));

function DemandSupplyMatching() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [searchText, setSearchText] = useState("");
  const gridRef = useRef(null);
  const [rowModesModel, setRowModesModel] = React.useState({});

  const [parentCustomer, setParentCustomer] = useState("All");
  const [buDesc, setBuDesc] = useState("All");
  const [pdlName, setPdlName] = useState("All");
  const [offOn, setOffOn] = useState("All");

  const [parentCustomerOptions, setParentCustomerOptions] = useState([]);
  const [buDescOptions, setBuDescOptions] = useState([]);
  const [pdlNameOptions, setPdlNameOptions] = useState([]);
  const [offOnOptions, setOffOnOptions] = useState([]);

  const editableColumns = [
    "DemandType",
    "DemandStatus",
    "FulfilmentPlan",
    "DemandCategory",
    "SupplySource",
    "RotationSO",
    "SupplyAccount",
    "IdentifiedAssoIdextCandidate",
    "Identified_assoc_name",
    "Grades",
    "EffMonth",
    "JoiningAllocationDate",
    "AllocationWeek",
    "IncludedInForecast",
    "CrossSkillRequired",
    "RemarksDetails",
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchDropdownData = async () => {
      try {
        const [
          parentCustomerResponse,
          buDescResponse,
          pdlNameResponse,
          offOnResponse,
        ] = await Promise.all([
          api.get("/demandselect/parentCustomers"), // Use the configured Axios instance
          api.get("/demandselect/businessUnitDescs"), // Use the configured Axios instance
          api.get("/demandselect/pdlNames"), // Use the configured Axios instance
          api.get("/demandselect/offOns"), // Use the configured Axios instance
        ]);

        if (isMounted) {
          setParentCustomerOptions(["All", ...parentCustomerResponse.data]);
          setBuDescOptions(["All", ...buDescResponse.data]);
          setPdlNameOptions(["All", ...pdlNameResponse.data]);
          setOffOnOptions(["All", ...offOnResponse.data]);
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/demandselect");
        setData(response.data);

        if (response.data.length > 0) {
          let cols = Object.keys(response.data[0]).map((key) => ({
            field: key,
            headerName: key.replace(/_/g, " ").toUpperCase(),
            width: 150,
          }));

          cols = [
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
                      onClick={handleCancelClick(id)}
                      color="inherit"
                    />,
                  ];
                }

                return [
                  <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
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
            ...cols,
          ];

          setColumns(cols);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Ensure this runs only once on component mount

  const handleEditClick = (id) => () => {
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [id]: { mode: "edit" },
    }));
  };

  const handleSaveClick = (id) => async () => {
    const updatedRow = data.find((row) => row.item_id === id);
    const payload = {
      SoId: updatedRow.SoId,
      SOLineStatus: updatedRow.SOLineStatus,
      ...editableColumns.reduce((acc, col) => {
        acc[col] = updatedRow[col];
        return acc;
      }, {}),
    };

    try {
      await api.post("/demand/update", payload);
      setRowModesModel((prevModel) => ({
        ...prevModel,
        [id]: { mode: "view" },
      }));
      console.log(`Row with id ${id} saved successfully.`);
    } catch (error) {
      console.error("Error saving row:", error);
    }
  };

  const handleDeleteClick = (id) => () => {
    const updatedData = data.filter((row) => row.ID !== id);
    setData(updatedData);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [id]: { mode: "view", ignoreModifications: true },
    }));

    const editedRow = data.find((row) => row.item_id === id);
    if (editedRow?.isNew) {
      setData(data.filter((row) => row.item_id !== id));
    }
  };

  const filteredRows = useMemo(() => {
    let filteredData = data;

    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filteredData = filteredData.filter((row) =>
        columns
          .slice(0, -1)
          .some((column) =>
            String(row[column.field]).toLowerCase().includes(lowerSearchText)
          )
      );
    }

    return filteredData;
  }, [data, columns, searchText]);

  const processRowUpdate = async (newRow) => {
    const updatedRow = { ...newRow, isNew: false };

    try {
      const payload = {
        SoId: updatedRow.SoId,
        SOLineStatus: updatedRow.SOLineStatus,
        ...editableColumns.reduce((acc, col) => {
          acc[col] = updatedRow[col];
          return acc;
        }, {}),
      };

      // Call the API to save the updated row
      await api.post("/demand/update", payload);
      console.log(`Row with id ${updatedRow.item_id} saved successfully.`);

      // Update the data state with the updated row
      setData((prevData) =>
        prevData.map((row) =>
          row.item_id === updatedRow.item_id ? updatedRow : row
        )
      );
    } catch (error) {
      console.error("Error saving row:", error);
      throw error; // Re-throw the error to prevent the row from being updated in the UI
    }

    return updatedRow;
  };

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true; // Prevent default behavior
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true; // Prevent default behavior
  };

  // Add visual feedback for the row being edited
  const getRowClassName = (params) => {
    return rowModesModel[params.id]?.mode === "edit" ? "row-editing" : "";
  };

  const handleParentCustomerChange = (event) => {
    setParentCustomer(event.target.value);
  };

  const handleBuDescChange = (event) => {
    setBuDesc(event.target.value);
  };

  const handlePdlNameChange = (event) => {
    setPdlName(event.target.value);
  };

  const handleOffOnChange = (event) => {
    setOffOn(event.target.value);
  };

  const handleViewReport = async () => {
    try {
      const params = {
        parentCustomer: parentCustomer === "All" ? "null" : parentCustomer,
        buDesc: buDesc === "All" ? "null" : buDesc,
        pdlName: pdlName === "All" ? "null" : pdlName,
        offOn: offOn === "All" ? "null" : offOn,
      };

      const response = await api.get("/demandselect/report", { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Demand Supply Mapping
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <Autocomplete
            options={parentCustomerOptions} // Options for the dropdown
            value={parentCustomer} // Current selected value
            onChange={(event, newValue) => setParentCustomer(newValue)} // Handle selection
            renderInput={(params) => (
              <TextField
                {...params}
                label="Parent Customer"
                variant="outlined"
                size="small"
              />
            )}
            filterOptions={(options, { inputValue }) =>
              options.filter((option) =>
                option.toLowerCase().includes(inputValue.toLowerCase())
              )
            } // Filter options based on user input
            isOptionEqualToValue={(option, value) => option === value} // Ensure proper equality check
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 300 }}>
          <Autocomplete
            options={buDescOptions} // Options for the dropdown
            value={buDesc} // Current selected value
            onChange={(event, newValue) => setBuDesc(newValue)} // Handle selection
            renderInput={(params) => (
              <TextField
                {...params}
                label="Business Unit"
                variant="outlined"
                size="small"
              />
            )}
            filterOptions={(options, { inputValue }) =>
              options.filter((option) =>
                option.toLowerCase().includes(inputValue.toLowerCase())
              )
            } // Filter options based on user input
            isOptionEqualToValue={(option, value) => option === value} // Ensure proper equality check
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="pdl-name-label">PDL Name</InputLabel>
          <Select
            labelId="pdl-name-label"
            id="pdl-name"
            value={pdlName}
            label="PDL Name"
            onChange={handlePdlNameChange}
          >
            <MenuItem value="All">All</MenuItem>
            {pdlNameOptions
              .filter((option) => option !== "All")
              .map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="off-on-label">Off/On</InputLabel>
          <Select
            labelId="off-on-label"
            id="off-on"
            value={offOn}
            label="Off/On"
            onChange={handleOffOnChange}
          >
            <MenuItem value="All">All</MenuItem>
            {offOnOptions
              .filter((option) => option !== "All")
              .map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleViewReport}
        sx={{ mb: 2 }}
      >
        View Report
      </Button>

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
          columns={columns.map((col) => ({
            ...col,
            editable: editableColumns.includes(col.field), // Enable editing for specific columns
          }))}
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
          getRowId={(row) => row.item_id} // Use item_id as the unique identifier
          editMode="row"
          rowModesModel={rowModesModel}
          onRowEditStart={handleRowEditStart}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate} // Use the updated function
          getRowClassName={getRowClassName} // Apply row class for visual feedback
          sx={{
            "& .row-editing": {
              backgroundColor: "#FFF3E0", // Highlight color for editing rows
            },
          }}
        />
      </div>
    </Box>
  );
}

export default DemandSupplyMatching;
