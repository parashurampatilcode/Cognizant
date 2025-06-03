import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  CircularProgress,
  Alert,
} from "@mui/material";
import Select from "react-select";
import axios from "axios";

//Patil - Change to relative path later.
const apiUrl = "http://localhost:5000/api/user"; // Adjust if needed

const ddTypeMap = {
  roles: "ROLES",
  market: "MARKET",
  buname: "MARKET_UNIT",
  sbuname: "BUSS_UNIT_DESC",
};

const AddUserForm = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    firstName: "",
    lastName: "",
    roles: [],
    market: [],
    buname: [],
    sbuname: [],
    parentAccountName: "",
    comments: "",
  });
  const [dropdowns, setDropdowns] = useState({
    roles: [],
    market: [],
    buname: [],
    sbuname: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          "http://localhost:5000/api/user/dropdown-options"
        );
        setDropdowns({
          roles: data.roles,
          market: data.market,
          buname: data.buname,
          sbuname: data.sbuname,
        });
      } catch (err) {
        setError("Failed to load dropdown options");
      } finally {
        setLoading(false);
      }
    };
    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name) => (selected) => {
    setForm({ ...form, [name]: selected || [] });
  };

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!validateEmail(form.email)) {
      setError("Invalid email format");
      return;
    }
    if (
      !form.username ||
      !form.password ||
      !form.email ||
      !form.firstName ||
      !form.lastName
    ) {
      setError("Please fill all required fields");
      return;
    }
    if (
      !form.roles.length ||
      !form.market.length ||
      !form.buname.length ||
      !form.sbuname.length
    ) {
      setError("Please select all required dropdowns");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/add-user`, {
        username: form.username,
        password: form.password,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        roles: form.roles.map((r) => r.value),
        market: form.market.map((m) => m.value),
        buname: form.buname.map((b) => b.value),
        sbuname: form.sbuname.map((s) => s.value),
        parentAccountName: form.parentAccountName,
        comments: form.comments,
      });
      setSuccess("User created");
      setForm({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        firstName: "",
        lastName: "",
        roles: [],
        market: [],
        buname: [],
        sbuname: [],
        parentAccountName: "",
        comments: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>
        Add New User
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username (Employee ID)"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          error={form.password !== form.confirmPassword}
          helperText={
            form.password !== form.confirmPassword
              ? "Passwords do not match"
              : ""
          }
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <Box mt={2} /> {/* Add margin top for spacing */}
        <Box mt={1}>
          <Typography>Roles</Typography>
          <FormControl fullWidth margin="normal" required>
            <Select
              isMulti
              name="roles"
              options={dropdowns.roles}
              value={form.roles}
              onChange={handleSelectChange("roles")}
              placeholder="Select Roles"
              closeMenuOnSelect={false}
            />
          </FormControl>
        </Box>
        <Box mt={2} /> {/* Add margin top for spacing */}
        <Box mt={1}>
          <Typography>Market</Typography>
          <FormControl fullWidth margin="normal" required>
            <Select
              isMulti
              name="market"
              options={dropdowns.market}
              value={form.market}
              onChange={handleSelectChange("market")}
              placeholder="Select Market"
              closeMenuOnSelect={false}
            />
          </FormControl>
        </Box>
        <Box mt={2} /> {/* Add margin top for spacing */}
        <Box mt={1}>
          <Typography>BU Name</Typography>
          <FormControl fullWidth margin="normal" required>
            <Select
              isMulti
              name="buname"
              options={dropdowns.buname}
              value={form.buname}
              onChange={handleSelectChange("buname")}
              placeholder="Select BU Name"
              closeMenuOnSelect={false}
            />
          </FormControl>
        </Box>
        <Box mt={1}>
          <Typography>SBU Name</Typography>
          <FormControl fullWidth margin="normal" required>
            <Select
              isMulti
              name="sbuname"
              options={dropdowns.sbuname}
              value={form.sbuname}
              onChange={handleSelectChange("sbuname")}
              placeholder="Select SBU Name"
              closeMenuOnSelect={false}
            />
          </FormControl>
        </Box>
        <TextField
          label="Parent Account Name"
          name="parentAccountName"
          value={form.parentAccountName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Comments"
          name="comments"
          value={form.comments}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
        <Box mt={2}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Add New User"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddUserForm;
