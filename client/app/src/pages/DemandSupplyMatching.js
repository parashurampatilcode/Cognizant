import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import api from "../api";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
} from "@mui/icons-material";

const primaryColor = "#005EB8";
const darkGrey = "#D3D3D3";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-columnHeader": {
    "& .MuiDataGrid-columnHeaderTitleContainer": {
      "& .MuiDataGrid-columnHeaderTitle": {
        fontWeight: "bold !important",
        whiteSpace: "normal", // Allow wrapping
        wordBreak: "break-word", // Break long words if needed
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
    whiteSpace: "normal", // Allow wrapping
  },
  "& .editable-cell": {
    backgroundColor: "#FFFDE7 !important", // Light yellow background for editable cells in view mode
    "&:hover": {
      backgroundColor: "#FFF9C4 !important",
    },
  },
  "& .MuiDataGrid-row.row-editing .MuiDataGrid-cell--editable": {
    backgroundColor: "#FFF59D !important", // Dark yellow background for editable cells in edit mode
    border: "1px solid #005EB8",
  },
  "& .MuiDataGrid-row.row-editing .MuiDataGrid-cell:not(.MuiDataGrid-cell--editable)":
    {
      backgroundColor: "#E0E0E0 !important",
    },
}));

const DropdownEditCell = React.memo(
  ({ field, value, id, api: gridApi, options }) => {
    // Ensure the value matches one of the available options
    const selectedValue = options.some((option) => option.value === value)
      ? value
      : "";

    return (
      <Select
        value={selectedValue}
        onChange={(event) => {
          const newValue = event.target.value;
          gridApi.setEditCellValue({ id, field, value: newValue });
        }}
        sx={{ width: "100%" }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    );
  }
);

const DateFieldEditCell = React.memo(({ field, value, id, api: gridApi }) => {
  const [date, setDate] = useState(value ? new Date(value) : null);

  const handleChange = (newDate) => {
    setDate(newDate);
    gridApi.setEditCellValue({ id, field, value: newDate?.toISOString() });
  };

  return (
    <TextField
      type="date"
      value={date ? date.toISOString().split("T")[0] : ""}
      onChange={(e) => {
        const newDate = e.target.value ? new Date(e.target.value) : null;
        handleChange(newDate);
      }}
      sx={{ width: "100%" }}
    />
  );
});

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

  const [auditOpen, setAuditOpen] = useState(false);
  const [selectedUnique, setSelectedUnique] = useState(null);
  const [auditData, setAuditData] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [dropdownOptions, setDropdownOptions] = useState({});

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

  const fieldToDropdownTypeMap = {
    DemandCategory: "DEMAND_CATEGORY",
    FulfilmentPlan: "FULFILMENT_PLAN",
    SupplySource: "SUPPLY_SOURCE",
    DemandType: "DEMAND_TYPE",
    DemandStatus: "DEMAND_STATUS",
    Grades: "GRADE",
    IncludedInForecast: "YES_NO",
    CrossSkillRequired: "YES_NO",
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAllDropdownOptions = async () => {
      const options = {};
      for (const field in fieldToDropdownTypeMap) {
        const dropdownType = fieldToDropdownTypeMap[field];
        try {
          const response = await api.get(`/demand/dropdown`, {
            params: { fieldName: dropdownType },
          });
          options[field] = response.data.map((item) => ({
            value: item.key_value,
            label: item.description,
          }));
        } catch (error) {
          console.error(`Error fetching dropdown options for ${field}:`, error);
          options[field] = []; // Ensure there's always a value
        }
      }
      if (isMounted) {
        setDropdownOptions(options);
      }
    };

    const fetchDropdownData = async () => {
      try {
        const [
          parentCustomerResponse,
          buDescResponse,
          pdlNameResponse,
          offOnResponse,
        ] = await Promise.all([
          api.get("/demandselect/parentCustomers"),
          api.get("/demandselect/businessUnitDescs"),
          api.get("/demandselect/pdlNames"),
          api.get("/demandselect/offOns"),
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

    fetchAllDropdownOptions();
    fetchDropdownData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/demandselect");
        let fetchedData = response.data;

        // Format the JoiningAllocationDate to show only the date
        fetchedData = fetchedData.map((item) => {
          if (item.JoiningAllocationDate) {
            item.JoiningAllocationDate =
              item.JoiningAllocationDate.split("T")[0];
          }
          return item;
        });

        setData(fetchedData);

        if (response.data.length > 0) {
          let cols = Object.keys(response.data[0]).map((key) => ({
            field: key,
            headerName: key.replace(/_/g, " ").toUpperCase(),
            width: 150,
          }));

          setColumns(cols);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (id) => () => {
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [id]: { mode: "edit" },
    }));
  };

  const handleSaveClick = useCallback(
    (id) => async () => {
      const updatedRow = data.find((row) => row.item_id === id);
      const payload = {
        SoId: updatedRow["So Id"],
        SOLineStatus: updatedRow["SO Line Status"],
        ...editableColumns.reduce((acc, col) => {
          acc[col] = updatedRow[col];
          return acc;
        }, {}),
      };

      try {
        await api.post("/demand/update", payload);
        // Integrate audit procedure call
        const auditPayload = {
          soid: updatedRow["So Id"],
          status: updatedRow["So Line Status"],
          roles: null,
          modifieddate: new Date().toISOString(),
          modifiedby: pdlName,
          notes:
            updatedRow.RemarksDetails ||
            updatedRow.remarks ||
            updatedRow.remarks_details ||
            "",
        };
        await api.post("/demand/audit_insert", auditPayload);

        setRowModesModel((prevModel) => ({
          ...prevModel,
          [id]: { mode: "view" },
        }));
        console.log(`Row with id ${id} saved successfully.`);
      } catch (error) {
        console.error("Error saving row:", error);
      }
    },
    [data, editableColumns, pdlName, setRowModesModel]
  );

  const handleAuditClick = (id) => async () => {
    const row = data.find((r) => r.item_id === id);
    if (!row) return;
    const uniqueId = row["So Id"];
    setSelectedUnique(uniqueId);
    setAuditOpen(true);
    setAuditLoading(true);
    try {
      const response = await api.get("/demand/audit_history", {
        params: { unique_id: uniqueId },
      });
      setAuditData(response.data);
    } catch (error) {
      console.error("Error fetching audit history:", error);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleAuditClose = () => {
    setAuditOpen(false);
    setAuditData([]);
    setSelectedUnique(null);
  };

  const handleCancelClick = useCallback(
    (id) => () => {
      setRowModesModel((prevModel) => ({
        ...prevModel,
        [id]: { mode: "view", ignoreModifications: true },
      }));

      const editedRow = data.find((row) => row.item_id === id);
      if (editedRow?.isNew) {
        setData(data.filter((row) => row.item_id !== id));
      }
    },
    [data, setRowModesModel]
  );

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
        SoId: updatedRow["So Id"],
        SOLineStatus: updatedRow["SO Line Status"],
        ...editableColumns.reduce((acc, col) => {
          acc[col] = updatedRow[col];
          return acc;
        }, {}),
      };

      await api.post("/demand/update", payload);
      console.log(`Row with id ${updatedRow.item_id} saved successfully.`);

      setData((prevData) =>
        prevData.map((row) => {
          if (row.item_id === updatedRow.item_id) {
            // Format the JoiningAllocationDate after saving
            if (updatedRow.JoiningAllocationDate) {
              updatedRow.JoiningAllocationDate =
                updatedRow.JoiningAllocationDate.split("T")[0];
            }
            return updatedRow;
          }
          return row;
        })
      );
    } catch (error) {
      console.error("Error saving row:", error);
      throw error;
    }

    return updatedRow;
  };

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

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

  const columnsWithActions = useMemo(
    () => [
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 120,
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
              icon={<HistoryIcon />}
              label="Audit History"
              onClick={handleAuditClick(id)}
              color="inherit"
            />,
          ];
        },
      },
      ...columns.map((col) => ({
        ...col,
        editable: editableColumns.includes(col.field),
        cellClassName: editableColumns.includes(col.field)
          ? "editable-cell"
          : null,
        renderEditCell: fieldToDropdownTypeMap[col.field]
          ? (params) => (
              <DropdownEditCell
                field={params.field}
                value={params.value}
                id={params.id}
                api={params.api} // Pass the grid's API object
                options={dropdownOptions[col.field] || []}
              />
            )
          : col.field === "JoiningAllocationDate"
          ? (params) => (
              <DateFieldEditCell
                field={params.field}
                value={params.value}
                id={params.id}
                api={params.api}
              />
            )
          : undefined,
      })),
    ],
    [
      columns,
      rowModesModel,
      data,
      editableColumns,
      handleSaveClick,
      handleCancelClick,
      dropdownOptions,
    ]
  );

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
            options={parentCustomerOptions}
            value={parentCustomer}
            onChange={(event, newValue) => setParentCustomer(newValue)}
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
            }
            isOptionEqualToValue={(option, value) => option === value}
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 300 }}>
          <Autocomplete
            options={buDescOptions}
            value={buDesc}
            onChange={(event, newValue) => setBuDesc(newValue)}
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
            }
            isOptionEqualToValue={(option, value) => option === value}
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
          columns={columnsWithActions.map((col) => ({
            ...col,
            editable: editableColumns.includes(col.field),
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
              ></GridToolbarContainer>
            ),
          }}
          getRowId={(row) => row.item_id}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowEditStart={handleRowEditStart}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          getRowClassName={getRowClassName}
          sx={{
            "& .row-editing": {
              backgroundColor: "#FFF3E0",
            },
          }}
        />
      </div>
      {/* Audit History Dialog */}
      <Dialog
        open={auditOpen}
        onClose={handleAuditClose}
        maxWidth="lg" // increased popup width
        fullWidth
      >
        <DialogTitle>Audit History</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">SO ID: {selectedUnique}</Typography>
          {auditLoading ? (
            <Typography>Loading...</Typography>
          ) : (
            <div style={{ height: 400, width: "100%", marginTop: 16 }}>
              <StyledDataGrid // changed from DataGrid to StyledDataGrid
                rows={auditData}
                columns={[
                  { field: "auditid", headerName: "Audit ID", width: 100 },
                  { field: "so_id", headerName: "SO ID", width: 150 },
                  { field: "status", headerName: "Status", width: 120 },
                  { field: "roles", headerName: "Roles", width: 150 },
                  {
                    field: "modified_date",
                    headerName: "Modified Date",
                    width: 180,
                  },
                  {
                    field: "modified_by",
                    headerName: "Modified By",
                    width: 150,
                  },
                  { field: "comments", headerName: "Comments", width: 200 },
                ]}
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                disableSelectionOnClick
                getRowId={(row) => row.auditid}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAuditClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DemandSupplyMatching;
