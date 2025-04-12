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
} from "@mui/material";
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

        //console.log("Parent Customers:", parentCustomerResponse.data); // Debugging log
        //console.log("Business Unit Descriptions:", buDescResponse.data); // Debugging log
        //console.log("PDL Names:", pdlNameResponse.data); // Debugging log
        //console.log("Off/On Values:", offOnResponse.data); // Debugging log

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
        const response = await api.get("/demandselect"); // Use the configured Axios instance
        setData(response.data);

        if (response.data.length > 0) {
          let cols = Object.keys(response.data[0]).map((key) => ({
            field: key,
            headerName: key.replace(/_/g, " ").toUpperCase(),
            width: 150,
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
    let filteredData = data;

    if (parentCustomer !== "All") {
      filteredData = filteredData.filter(
        (row) => row.parent_customer === parentCustomer
      );
    }
    if (buDesc !== "All") {
      filteredData = filteredData.filter(
        (row) => row.businessunit_desc === buDesc
      );
    }
    if (pdlName !== "All") {
      filteredData = filteredData.filter((row) => row.pdl_name === pdlName);
    }
    if (offOn !== "All") {
      filteredData = filteredData.filter((row) => row.off_on === offOn);
    }

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
  }, [data, columns, searchText, parentCustomer, buDesc, pdlName, offOn]);

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

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Demand Supply Matching
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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="parent-customer-label">Parent Customer</InputLabel>
          <Select
            labelId="parent-customer-label"
            id="parent-customer"
            value={parentCustomer}
            label="Parent Customer"
            onChange={handleParentCustomerChange}
          >
            <MenuItem value="All">All</MenuItem>
            {parentCustomerOptions
              .filter((option) => option !== "All")
              .map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="bu-desc-label">Business Unit</InputLabel>
          <Select
            labelId="bu-desc-label"
            id="bu-desc"
            value={buDesc}
            label="Business Unit"
            onChange={handleBuDescChange}
          >
            <MenuItem value="All">All</MenuItem>
            {buDescOptions
              .filter((option) => option !== "All")
              .map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
          </Select>
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
