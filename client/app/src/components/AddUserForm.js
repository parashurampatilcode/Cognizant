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
const primaryColor = "#005EB8"; // Cognizant's primary blue
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
    parentAccountName: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [buDisabled, setBuDisabled] = useState(true);
  const [sbuDisabled, setSbuDisabled] = useState(true);
  const [parentAccountDisabled, setParentAccountDisabled] = useState(true);

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
          buname: [], // Start empty, will be populated dynamically
          sbuname: [],
          parentAccountName: [],
        });
      } catch (err) {
        setError("Failed to load dropdown options");
      } finally {
        setLoading(false);
      }
    };
    fetchDropdowns();
  }, []);

  // Fetch BU when Market changes
  useEffect(() => {
    if (form.market.length > 0) {
      setBuDisabled(false);
      const fetchBU = async () => {
        try {
          setLoading(true);
          const marketCsv = form.market.map((m) => m.value).join(",");
          const { data } = await axios.get(`${apiUrl}/hierarchy-dropdown`, {
            params: { market: marketCsv },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setDropdowns((prev) => ({
            ...prev,
            buname: data.map((item) => ({
              value: item.ds_get_market_bu_sbu_hierarchy,
              label: item.ds_get_market_bu_sbu_hierarchy,
            })),
          }));
        } catch {
          setDropdowns((prev) => ({ ...prev, buname: [] }));
        } finally {
          setLoading(false);
        }
      };
      fetchBU();
    } else {
      setBuDisabled(true);
      setDropdowns((prev) => ({ ...prev, buname: [] }));
      setForm((prev) => ({
        ...prev,
        buname: [],
        sbuname: [],
        parentAccountName: "",
      }));
      setSbuDisabled(true);
      setParentAccountDisabled(true);
    }
  }, [form.market]);

  // Fetch SBU when Market and BU change
  useEffect(() => {
    if (form.market.length > 0 && form.buname.length > 0) {
      setSbuDisabled(false);
      const fetchSBU = async () => {
        try {
          setLoading(true);
          const marketCsv = form.market.map((m) => m.value).join(",");
          const buCsv = form.buname.map((b) => b.value).join(",");
          const { data } = await axios.get(`${apiUrl}/hierarchy-dropdown`, {
            params: { market: marketCsv, bu: buCsv },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setDropdowns((prev) => ({
            ...prev,
            sbuname: data.map((item) => ({
              value: item.ds_get_market_bu_sbu_hierarchy,
              label: item.ds_get_market_bu_sbu_hierarchy,
            })),
          }));
        } catch {
          setDropdowns((prev) => ({ ...prev, sbuname: [] }));
        } finally {
          setLoading(false);
        }
      };
      fetchSBU();
    } else {
      setSbuDisabled(true);
      setDropdowns((prev) => ({ ...prev, sbuname: [] }));
      setForm((prev) => ({
        ...prev,
        sbuname: [],
        parentAccountName: "",
      }));
      setParentAccountDisabled(true);
    }
  }, [form.market, form.buname]);

  // Fetch Parent Account Name when Market, BU, and SBU change
  useEffect(() => {
    if (
      form.market.length > 0 &&
      form.buname.length > 0 &&
      form.sbuname.length > 0
    ) {
      setParentAccountDisabled(false);
      const fetchParentAccount = async () => {
        try {
          setLoading(true);
          const marketCsv = form.market.map((m) => m.value).join(",");
          const buCsv = form.buname.map((b) => b.value).join(",");
          const sbuCsv = form.sbuname.map((s) => s.value).join(",");
          const { data } = await axios.get(`${apiUrl}/hierarchy-dropdown`, {
            params: { market: marketCsv, bu: buCsv, sbu: sbuCsv },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setDropdowns((prev) => ({
            ...prev,
            parentAccountName: data.map((item) => ({
              value: item.ds_get_market_bu_sbu_hierarchy,
              label: item.ds_get_market_bu_sbu_hierarchy,
            })),
          }));
        } catch {
          setDropdowns((prev) => ({ ...prev, parentAccountName: [] }));
        } finally {
          setLoading(false);
        }
      };
      fetchParentAccount();
    } else {
      setParentAccountDisabled(true);
      setDropdowns((prev) => ({ ...prev, parentAccountName: [] }));
      setForm((prev) => ({ ...prev, parentAccountName: "" }));
    }
  }, [form.market, form.buname, form.sbuname]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name) => (selected) => {
    setForm((prev) => ({ ...prev, [name]: selected || [] }));
    // Reset dependent dropdowns
    if (name === "market") {
      setForm((prev) => ({
        ...prev,
        buname: [],
        sbuname: [],
        parentAccountName: "",
      }));
    } else if (name === "buname") {
      setForm((prev) => ({ ...prev, sbuname: [], parentAccountName: "" }));
    } else if (name === "sbuname") {
      setForm((prev) => ({ ...prev, parentAccountName: "" }));
    }
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
       <Typography
                     variant="h5"
                     sx={{
                       fontWeight: "bold",
                       color: primaryColor,
                       marginBottom: 2,
                       textAlign: "left",
                     }}
                   >
                    Add New user
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
          <FormControl fullWidth margin="normal" required disabled={buDisabled}>
            <Select
              isMulti
              name="buname"
              options={dropdowns.buname}
              value={form.buname}
              onChange={handleSelectChange("buname")}
              placeholder="Select BU Name"
              closeMenuOnSelect={false}
              isDisabled={buDisabled}
            />
          </FormControl>
        </Box>
        <Box mt={1}>
          <Typography>SBU Name</Typography>
          <FormControl
            fullWidth
            margin="normal"
            required
            disabled={sbuDisabled}
          >
            <Select
              isMulti
              name="sbuname"
              options={dropdowns.sbuname}
              value={form.sbuname}
              onChange={handleSelectChange("sbuname")}
              placeholder="Select SBU Name"
              closeMenuOnSelect={false}
              isDisabled={sbuDisabled}
            />
          </FormControl>
        </Box>
        <Box mt={1}>
          <Typography>Parent Account Name</Typography>
          <FormControl
            fullWidth
            margin="normal"
            disabled={parentAccountDisabled}
          >
            <Select
              name="parentAccountName"
              options={dropdowns.parentAccountName}
              value={
                dropdowns.parentAccountName.find(
                  (opt) => opt.value === form.parentAccountName
                ) || null
              }
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  parentAccountName: selected ? selected.value : "",
                }))
              }
              placeholder="Select Parent Account Name"
              isDisabled={parentAccountDisabled}
              isClearable
            />
          </FormControl>
        </Box>
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
