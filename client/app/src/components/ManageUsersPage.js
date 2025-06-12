import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockResetIcon from "@mui/icons-material/LockReset";
import Select from "react-select";
import axios from "axios";
import ChangePasswordPage from "./ChangePasswordPage";

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

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/user/all-users"
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

  return (
    <Box mt={4}>
      <Typography variant="h5" mb={2}>
        Manage Users
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Market</TableCell>
                <TableCell>BUName</TableCell>
                <TableCell>SBUName</TableCell>
                <TableCell>ParentAccountName</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>isActive</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.username}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.first_name}</TableCell>
                  <TableCell>{user.last_name}</TableCell>
                  <TableCell>{user.roles}</TableCell>
                  <TableCell>{user.market}</TableCell>
                  <TableCell>{user.buname}</TableCell>
                  <TableCell>{user.sbuname}</TableCell>
                  <TableCell>{user.parentaccountname}</TableCell>
                  <TableCell>{user.comments}</TableCell>
                  <TableCell>{user.is_active ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <span>
                        <IconButton
                          onClick={() => handleEdit(user)}
                          disabled={actionLoading}
                        >
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Deactivate">
                      <span>
                        <IconButton
                          onClick={() => handleDeactivate(user.username)}
                          disabled={actionLoading || !user.is_active}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Change Password">
                      <span>
                        <IconButton
                          onClick={() => handleChangePassword(user)}
                          disabled={actionLoading}
                        >
                          <LockResetIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
