import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios"; // Import axios for API requests
import React, { useEffect, useState } from "react";
import { getAllActiveUsers } from "../services/api"; // Assuming the function fetches the active users
import { encryptPassword } from "./encPassword";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8091";

const ChangePasswordPopup = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(""); // Store selected user
  const [password, setPassword] = useState(""); // Store password
  const [users, setUsers] = useState([]); // Store active users
  const [loading, setLoading] = useState(false); // Track loading state for API call
  const [error, setError] = useState(""); // Track error messages

  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, []);

  // Fetch active users from API
  const fetchData = () => {
    getAllActiveUsers()
      .then((response) => {
        setUsers(response); // Set the active users to state
      })
      .catch(() => {
        console.error("Failed to fetch users");
      });
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Handle Save button click
  const handleSave = () => {
    if (!user || !password) {
      setError("Please select a user and enter a password");
      return;
    }

    setLoading(true);
    setError(""); // Clear previous error message

    // Prepare the payload for the API request
    const payload = {
      userName: user, // User selected in the dropdown
      newPassword: encryptPassword(password), // Password entered in the field
    };

    // Call the reset password API
    axios
      .post(`${API_URL}/api/auth/resetPassword`, payload) // Fixed URL concatenation
      .then((response) => {
        console.log("Password reset successfully:", response.data);
        setLoading(false);
        handleClose();
        // Show success message (optional)
      })
      .catch((err) => {
        setLoading(false);
        setError("Failed to reset password. Please try again.");
        console.error("Error resetting password:", err);
      });
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="5vh"
      sx={{ backgroundColor: "#f5f5f5" }}
    >
      {/* Stylish Button */}
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          backgroundColor: "#6200ea",
          color: "#fff",
          fontSize: "12px",
          padding: "5px 10px",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "#3700b3",
          },
        }}
      >
        Reset Password
      </Button>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: "400px",
            borderRadius: "16px",
            padding: "20px",
          },
        }}
      >
        <DialogTitle>
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: "bold", color: "#6200ea" }}
          >
            Change Password
          </Typography>
        </DialogTitle>
        <DialogContent>
          {/* User Dropdown */}
          <FormControl fullWidth margin="normal" sx={{ marginBottom: "20px" }}>
            <InputLabel>User</InputLabel>
            <Select
              value={user}
              onChange={(e) => setUser(e.target.value)}
              sx={{ borderRadius: "8px" }}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.userName}>
                  {user.userName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Password Field */}
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onInput={(e) => {
              // Allow only numbers and enforce max length of 6
              if (!/^\d{0,6}$/.test(e.target.value)) {
                e.preventDefault();
              }
            }}
            inputProps={{
              maxLength: 6, // Limit to 6 characters
            }}
            sx={{
              marginBottom: "20px",
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
          />

          {/* Error message */}
          {error && (
            <Typography
              color="error"
              variant="body2"
              sx={{ marginBottom: "20px" }}
            >
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Box
            display="flex"
            justifyContent="space-between"
            width="100%"
            padding="0 20px 20px"
          >
            <Button
              onClick={handleClose}
              sx={{
                color: "#757575",
                backgroundColor: "#f5f5f5",
                padding: "10px 20px",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              sx={{
                backgroundColor: "#6200ea",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#3700b3" },
              }}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChangePasswordPopup;
