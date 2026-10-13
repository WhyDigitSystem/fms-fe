import React, { useEffect, useRef } from "react";

const SplitChart = ({ multiGraphData, display, selectedType }) => {
  const canvasRef = useRef(null);

  const sizeConfig = {
    small: { width: 150, height: 90, fontSize: 14 },
    medium: { width: 400, height: 220, fontSize: 22 },
    large: { width: 250, height: 150, fontSize: 22 },
  };

  const config = sizeConfig.medium;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !multiGraphData || !multiGraphData.length) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height * 0.8;
    const radius = Math.min(width, height) * 0.35;

    ctx.clearRect(0, 0, width, height);

    // Background arc with theme support
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = "#d1d5db"; // Light theme color
    if (document.documentElement.classList.contains("dark")) {
      ctx.strokeStyle = "#374151"; // Dark theme color
    }
    ctx.lineWidth = 12;
    ctx.stroke();

    const totalValue = multiGraphData.reduce(
      (sum, item) => sum + item.percentage,
      0
    );

    let startAngle = Math.PI;

    multiGraphData.forEach((item) => {
      if (item.percentage === 0) return;

      const segmentAngle = (item.percentage / totalValue) * Math.PI;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = item.fill;
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.stroke();

      startAngle = endAngle;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
  }, [multiGraphData]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        position: "relative",
        marginTop: "-120px",
      }}
    >
      <canvas
        ref={canvasRef}
        width={config.width}
        height={config.height}
        style={{
          display: "block",
          maxWidth: `${config.width}px`,
          maxHeight: `${config.height}px`,
          marginTop: "10px",
          borderRadius: "8px",
        }}
      />

      {/* Display text with theme support */}
      <div className="mt-2 text-center w-full max-w-[400px]">
        <span className="text-gray-600 dark:text-gray-300 text-lg">
          {selectedType === "CUSTOMER" && display
            ? `SalesPerson - ${display}`
            : "Branch Distribution"}
        </span>
      </div>

      {/* Legend with theme support */}
      {multiGraphData && multiGraphData.length > 0 && (
        <div className="flex flex-col mt-3 w-full max-w-[400px] gap-2">
          {multiGraphData
            .filter((item) => item.percentage !== 0)
            .map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center px-2 py-1 rounded bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-gray-800 dark:text-gray-200 text-sm">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-sm">
                  ₹{item.percentage.toLocaleString("en-IN")}L
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SplitChart;
