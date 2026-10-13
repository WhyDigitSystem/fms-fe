import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { Space } from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { encryptPassword } from "./encPassword";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8091";

const ResetPasswordPopup = () => {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState(""); // Store password as string
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    setUserName(storedUserName || "");
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setPassword(""); // Reset password when closing
    setError(""); // Clear error
  };

  const handleSave = () => {
    // Validate password length
    if (password.length !== 6) {
      setError("Password must be exactly 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      userName: userName,
      newPassword: encryptPassword(password), // Pass the password string
      ppassword: password, // Pass the password string
    };

    axios
      .post(`${API_URL}/api/auth/resetPassword`, payload)
      .then((response) => {
        console.log("Password reset successfully:", response.data);
        setLoading(false);
        handleClose();
        toast.success("Password changed successfully!");
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
    >
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          textTransform: "none",
          backgroundColor: "transparent",
          "&:hover": { boxShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF" },
          fontWeight: "bold",
        }}
      >
        Reset Password
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <Typography variant="h5" align="center">
            Change Password
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="UserName"
            value={userName}
            readOnly
            sx={{ marginBottom: "20px" }}
          />
          <Typography align="center" sx={{ margin: "20px 0" }}>
            Enter 6-Digit Password
          </Typography>
          <Space size="middle">
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                // Allow only numbers and enforce max length of 6
                const value = e.target.value.replace(/[^0-9]/g, "");
                if (value.length <= 6) {
                  setPassword(value);
                }
              }}
              inputProps={{
                maxLength: 6,
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              sx={{
                marginBottom: "20px",
                "& .MuiInputBase-root": { borderRadius: "8px" },
              }}
            />
          </Space>
          {error && (
            <Typography color="error" align="center" sx={{ marginTop: "20px" }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={loading || password.length !== 6}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </Box>
  );
};

export default ResetPasswordPopup;
