import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockResetIcon from "@mui/icons-material/LockReset";
import Select from "react-select";
import axios from "axios";
import ChangePasswordPage from "./ChangePasswordPage";
import DataTable from "./DataTable";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [dropdowns, setDropdowns] = useState({
    roles: [],
    market: [],
    buname: [],
    sbuname: [],
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const primaryColor = "#005EB8"; // Cognizant's primary blue
  // Fetch users from new grouped-users endpoint
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/user/grouped-users"
      );
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/user/dropdown-options"
      );
      setDropdowns(data);
    } catch {
      // ignore for now
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditUser(user);
    setEditForm({
      ...user,
      roles: user.roles
        ? user.roles.split(",").map((v) => ({ value: v, label: v }))
        : [],
      market: user.market
        ? user.market.split(",").map((v) => ({ value: v, label: v }))
        : [],
      buname: user.buname
        ? user.buname.split(",").map((v) => ({ value: v, label: v }))
        : [],
      sbuname: user.sbuname
        ? user.sbuname.split(",").map((v) => ({ value: v, label: v }))
        : [],
    });
    fetchDropdowns();
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSelectChange = (name) => (selected) => {
    setEditForm({ ...editForm, [name]: selected || [] });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post("http://localhost:5000/api/user/update-user", {
        username: editForm.username,
        email: editForm.email,
        firstName: editForm.first_name,
        lastName: editForm.last_name,
        roles: editForm.roles.map((r) => r.value),
        market: editForm.market.map((m) => m.value),
        buname: editForm.buname.map((b) => b.value),
        sbuname: editForm.sbuname.map((s) => s.value),
        parentAccountName: editForm.parentaccountname,
        comments: editForm.comments,
      });
      setSuccess("User updated");
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setError("Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (username) => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post("http://localhost:5000/api/user/deactivate-user", {
        username,
      });
      setSuccess("User deactivated");
      fetchUsers();
    } catch {
      setError("Failed to deactivate user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePassword = (user) => {
    setSelectedUserForPassword(user);
    setShowChangePassword(true);
  };

  const closeChangePassword = () => {
    setShowChangePassword(false);
    setSelectedUserForPassword(null);
  };

  // DataTable columns config
  const columns = [
    {
      field: "actions",
      headerName: "Action",
      sortable: false,
      filterable: false,
      flex: 0.6,
      minWidth: 120,
      renderCell: (params) => (
        <>
          <Button
            size="small"
            onClick={() => handleEdit(params.row)}
            disabled={actionLoading}
            sx={{ minWidth: 0, padding: 0 }}
          >
            <EditIcon fontSize="small" />
          </Button>
          <Button
            size="small"
            onClick={() => handleDeactivate(params.row.user_id)}
            disabled={actionLoading || !params.row.is_active}
            color="error"
            sx={{ minWidth: 0, padding: 0, ml: 1 }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
          <Button
            size="small"
            onClick={() => handleChangePassword(params.row)}
            disabled={actionLoading}
            color="secondary"
            sx={{ minWidth: 0, padding: 0, ml: 1 }}
          >
            <LockResetIcon fontSize="small" />
          </Button>
        </>
      ),
    },
    { field: "user_id", headerName: "User ID", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "roles", headerName: "Roles", flex: 1 },
    { field: "markets", headerName: "Markets", flex: 1 },
    { field: "bu_names", headerName: "BU Names", flex: 1 },
    { field: "sbu_names", headerName: "SBU Names", flex: 1 },
    { field: "parent_accounts", headerName: "Parent Accounts", flex: 1 },
    {
      field: "is_active",
      headerName: "isActive",
      flex: 1,
      valueGetter: (params) =>
        params.row && params.row.is_active ? "Yes" : "No",
    },
  ];

  return (
    <Box mt={4}>
       <Typography
                     variant="h5"
                     sx={{
                       fontWeight: "bold",
                       color: primaryColor,
                       marginBottom: 2,
                       textAlign: "left",
                     }}
                   >
                    Manage Users
                   </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          rows={users}
          columns={columns}
          getRowId={(row) => row.user_id}
          searchPlaceholder="Global Search..."
        />
      )}

      {/* Edit User Dialog */}
      <Dialog
        open={!!editUser}
        onClose={() => setEditUser(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editForm && (
            <form onSubmit={handleEditSubmit}>
              <TextField
                label="Username"
                name="username"
                value={editForm.username}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                name="email"
                value={editForm.email}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="First Name"
                name="first_name"
                value={editForm.first_name}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Last Name"
                name="last_name"
                value={editForm.last_name}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
              />
              <Box mt={2}>
                <Typography>Roles</Typography>
                <Select
                  isMulti
                  name="roles"
                  options={dropdowns.roles}
                  value={editForm.roles}
                  onChange={handleEditSelectChange("roles")}
                  placeholder="Select Roles"
                  closeMenuOnSelect={false}
                />
              </Box>
              <Box mt={2}>
                <Typography>Market</Typography>
                <Select
                  isMulti
                  name="market"
                  options={dropdowns.market}
                  value={editForm.market}
                  onChange={handleEditSelectChange("market")}
                  placeholder="Select Market"
                  closeMenuOnSelect={false}
                />
              </Box>
              <Box mt={2}>
                <Typography>BU Name</Typography>
                <Select
                  isMulti
                  name="buname"
                  options={dropdowns.buname}
                  value={editForm.buname}
                  onChange={handleEditSelectChange("buname")}
                  placeholder="Select BU Name"
                  closeMenuOnSelect={false}
                />
              </Box>
              <Box mt={2}>
                <Typography>SBU Name</Typography>
                <Select
                  isMulti
                  name="sbuname"
                  options={dropdowns.sbuname}
                  value={editForm.sbuname}
                  onChange={handleEditSelectChange("sbuname")}
                  placeholder="Select SBU Name"
                  closeMenuOnSelect={false}
                />
              </Box>
              <TextField
                label="Parent Account Name"
                name="parentaccountname"
                value={editForm.parentaccountname}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Comments"
                name="comments"
                value={editForm.comments}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
              />
              <DialogActions>
                <Button onClick={() => setEditUser(null)} color="secondary">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? <CircularProgress size={24} /> : "Save"}
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={showChangePassword}
        onClose={closeChangePassword}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {selectedUserForPassword && (
            <ChangePasswordPage
              username={selectedUserForPassword.username}
              onClose={closeChangePassword}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ManageUsersPage;
