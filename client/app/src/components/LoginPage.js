import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import axios from "axios";

const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      {/* Dashboard Banner */}
      <Box
        sx={{
          backgroundColor: "#005EB8",
          color: "white",
          py: 2,
          px: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5">EI Demand Supply Management</Typography>
      </Box>
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
