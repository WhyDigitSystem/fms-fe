import React from "react";
import { Box, Typography, Chip } from "@mui/material";

const MonthGraph = ({ yearchartData = [] }) => {
  // Color mapping based on value ranges (unchanged)
  const getColorForValue = (value) => {
    if (value === 0) return "#9e9e9e";
    if (value < 10) return "#F44336";
    if (value < 20) return "#FF9800";
    if (value < 30) return "#FFC107";
    if (value < 40) return "#CDDC39";
    if (value < 50) return "#8BC34A";
    if (value < 60) return "#4CAF50";
    if (value < 70) return "#2196F3";
    if (value < 80) return "#3F51B5";
    if (value < 90) return "#673AB7";
    return "#E91E63";
  };

  const getScoreCaption = (value) => {
    if (value === 0) return "No Data";
    if (value < 10) return "Very Low";
    if (value < 20) return "Low";
    if (value < 30) return "Below Average";
    if (value < 40) return "Average";
    if (value < 50) return "Good";
    if (value < 60) return "Very Good";
    if (value < 70) return "Excellent";
    if (value < 80) return "Outstanding";
    if (value < 90) return "Exceptional";
    return "Exceptional";
  };

  const calculateAverage = () => {
    if (!yearchartData || yearchartData.length === 0) return 0;
    const sum = yearchartData.reduce(
      (total, item) => total + (item.value || 0),
      0
    );
    return sum / yearchartData.length;
  };

  const averageValue = calculateAverage();

  return (
    <Box
      sx={{
        backgroundColor: "bg-white dark:bg-gray-800",
        borderRadius: "15px",
        border: "1px solid rgba(209, 213, 219, 0.5) dark:border-gray-700",
        padding: "1.5rem",
        marginBottom: "1rem",
        minHeight: "400px",
      }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    >
      <h4 className="font-semibold text-gray-800 dark:text-gray-300">
        Yearly Profit Analysis
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-500">
        Monthly trend overview
      </p>

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Chip
          label="Exceptional (90+)"
          size="small"
          className="bg-pink-600 text-gray-900 dark:text-white text-xs"
        />
        <Chip
          label="Outstanding (80+)"
          size="small"
          className="bg-purple-700 text-gray-900 dark:text-white text-xs"
        />
        <Chip
          label="Excellent (70+)"
          size="small"
          className="bg-blue-500 text-gray-900 dark:text-white text-xs"
        />
        <Chip
          label="Very Good (60+)"
          size="small"
          className="bg-green-600 text-gray-900 dark:text-white text-xs"
        />
        <Chip
          label="Good (50+)"
          size="small"
          className="bg-green-500 text-gray-900 dark:text-white text-xs"
        />
        <Chip
          label="Average (40+)"
          size="small"
          className="bg-lime-500 text-gray-900 dark:text-white text-xs"
        />
      </Box>

      {yearchartData.length > 0 ? (
        <>
          {/* Graph */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: "15px",
              height: "180px",
              padding: "20px",
              position: "relative",
              marginTop: "40px",
            }}
          >
            {yearchartData.map((item, index) => {
              const color = getColorForValue(item.value || 0);
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    position: "relative",
                    maxHeight: "200px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "180px",
                      justifyContent: "flex-start",
                    }}
                  >
                    {/* Value Badge */}
                    <Box
                      sx={{
                        background: color,
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        fontSize: "0.6rem",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        marginBottom: "8px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                        minWidth: "45px",
                        textAlign: "center",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.value}
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        height: "120px",
                      }}
                    >
                      {/* Bar Container */}
                      <Box
                        sx={{
                          width: "30px",
                          height: "100px",
                          background:
                            "rgba(0, 0, 0, 0.05) dark:rgba(255, 255, 255, 0.1)",
                          borderRadius: "4px 4px 0 0",
                          overflow: "hidden",
                          border:
                            "1px solid rgba(0, 0, 0, 0.1) dark:rgba(255, 255, 255, 0.2)",
                          position: "relative",
                        }}
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      >
                        {/* Actual Bar */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: item.height || "0%",
                            background: `linear-gradient(135deg, ${color}, ${color}99)`,
                            transition: "all 0.3s ease",
                            borderRadius: "4px 4px 0 0",
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "center",
                            paddingBottom: "3px",
                          }}
                        >
                          {item.value > 0 && (
                            <Typography
                              sx={{
                                color: "white",
                                fontSize: "0.65rem",
                                fontWeight: "bold",
                                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                              }}
                            >
                              {item.value}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Month Label */}
                      <Typography
                        sx={{
                          color: "text-gray-800 dark:text-white",
                          fontSize: "0.7rem",
                          fontWeight: "500",
                          textAlign: "center",
                          marginTop: "6px",
                        }}
                        className="text-gray-800 dark:text-white"
                      >
                        {item.caption
                          ? item.caption.split("\n")[0]
                          : `M${index + 1}`}
                      </Typography>

                      {item.caption && item.caption.includes("\n") && (
                        <Typography
                          sx={{
                            color:
                              "text-gray-600 dark:rgba(255, 255, 255, 0.7)",
                            fontSize: "0.6rem",
                            textAlign: "center",
                            marginTop: "2px",
                          }}
                          className="text-gray-600 dark:text-gray-400"
                        >
                          {item.caption.split("\n")[1]}
                        </Typography>
                      )}

                      {/* Performance Rating */}
                      <Typography
                        sx={{
                          color: color,
                          fontSize: "0.6rem",
                          fontWeight: "bold",
                          textAlign: "center",
                          marginTop: "4px",
                        }}
                      >
                        {getScoreCaption(item.value || 0)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Summary Box */}
          <Box
            sx={{
              marginTop: "20px",
              padding: "1rem",
              background: "rgba(0, 0, 0, 0.02) dark:rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              border:
                "1px solid rgba(0, 0, 0, 0.1) dark:rgba(255, 255, 255, 0.1)",
            }}
            className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
          >
            <Typography
              sx={{
                color: "text-gray-800 dark:text-white",
                fontSize: "0.9rem",
                textAlign: "center",
                fontWeight: "500",
              }}
              className="text-gray-800 dark:text-white"
            >
              📊 Monthly Performance Summary:{" "}
              <span style={{ color: "#4ECDC4", fontWeight: "bold" }}>
                {getScoreCaption(averageValue)}
              </span>{" "}
              overall with an average value of{" "}
              <span style={{ color: "#FF6B6B", fontWeight: "bold" }}>
                {averageValue.toFixed(2)}
              </span>{" "}
              over {yearchartData.length} months
            </Typography>

            {/* Additional Stats */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                marginTop: "10px",
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    color: "#4ECDC4",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  {Math.max(...yearchartData.map((item) => item.value || 0))}
                </Typography>
                <Typography
                  sx={{
                    color: "text-gray-600 dark:rgba(255, 255, 255, 0.7)",
                    fontSize: "0.7rem",
                  }}
                  className="text-gray-600 dark:text-gray-400"
                >
                  Highest
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    color: "#FF6B6B",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  {Math.min(
                    ...yearchartData
                      .filter((item) => item.value > 0)
                      .map((item) => item.value || 0)
                  ) || 0}
                </Typography>
                <Typography
                  sx={{
                    color: "text-gray-600 dark:rgba(255, 255, 255, 0.7)",
                    fontSize: "0.7rem",
                  }}
                  className="text-gray-600 dark:text-gray-400"
                >
                  Lowest
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    color: "#FFD700",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  {
                    yearchartData.filter(
                      (item) => item.value && item.value >= 50
                    ).length
                  }
                </Typography>
                <Typography
                  sx={{
                    color: "text-gray-600 dark:rgba(255, 255, 255, 0.7)",
                    fontSize: "0.7rem",
                  }}
                  className="text-gray-600 dark:text-gray-400"
                >
                  Good+ Months
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <Typography
          sx={{
            color: "text-gray-500 dark:rgba(255, 255, 255, 0.7)",
            textAlign: "center",
            fontStyle: "italic",
            padding: "2rem",
          }}
          className="text-gray-500 dark:text-gray-400"
        >
          No monthly performance data available
        </Typography>
      )}
    </Box>
  );
};

export default MonthGraph;
