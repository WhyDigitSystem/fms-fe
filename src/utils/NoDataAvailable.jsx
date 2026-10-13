import { Box, Button, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";

const NoDataAvailable = ({ message, onRetry }) => {
  const [isChecked, setIsChecked] = useState(
    localStorage.getItem("theme") === "dark"
  );
  useEffect(() => {
    // Save the theme preference to localStorage whenever it changes
    localStorage.setItem("theme", isChecked ? "dark" : "light");
  }, [isChecked]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        textAlign: "center",
        backgroundColor: "#ffffff",
        padding: 4,
        borderRadius: 2,
        // boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      {/* GIF with Reduced Size */}
      <img
        src="https://cdn-icons-gif.flaticon.com/17771/17771140.gif"
        alt="No Data"
        style={{
          width: "100px", // Reduced size
          height: "100px", // Aspect ratio maintained
          objectFit: "contain",
          marginBottom: "10px",
        }}
      />

      {/* Message */}
      <Typography
        variant="h6"
        sx={{ color: "#555", marginTop: 2, fontWeight: 500 }}
      >
        {message}
      </Typography>

      {/* Retry Button */}
      {onRetry && (
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{
            marginTop: 2,
            background: "linear-gradient(135deg, #59FF31, #FF421B)",
            color: "#fff",
            textTransform: "none",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            "&:hover": {
              background: "linear-gradient(135deg, #FF421B, #59FF31)",
            },
          }}
        >
          Retry
        </Button>
      )}
    </Box>
  );
};

export default NoDataAvailable;
