import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  useTheme,
  Grid,
} from "@mui/material";
import CognizantLogo from "../cognizant-logo.svg";
import axios from "axios";

const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password) {
      setError("Employee ID and password are required");
      return;
    }
    setLoading(true);
    try {
      //Patil - Change to relative path later.
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username: form.username,
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", form.username); // Store username for later use
      if (onLogin) onLogin();
      window.location.href = res.data.redirect;
    } catch (err) {
      setError(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      {/* Dashboard Banner - Synced with App.js */}
      <header
        style={{
          backgroundColor: theme.palette.primary.main,
          color: "white",
          padding: "0px",
        }}
      >
        <Grid container direction="column">
          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              marginTop: 1,
              minHeight: "56px", // Match App.js/AppBar default height
            }}
          >
            <img
              src={CognizantLogo}
              alt="Cognizant Logo"
              style={{ height: "30px", marginRight: "16px" }}
            />
            <Box sx={{ flex: 1, textAlign: "center", marginLeft: -28 }}>
              <Typography variant="h5" component="div">
                EI & PO Demand Supply Management
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </header>
      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
          <Typography variant="h6" mb={2} align="center">
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Employee ID"
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
            {error && (
              <Typography color="error" mt={1} align="center">
                {error}
              </Typography>
            )}
            <Box mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Login"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;
