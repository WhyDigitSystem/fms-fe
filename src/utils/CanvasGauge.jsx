import React, { useEffect, useRef } from "react";

const CanvasGauge = ({ value = 0, display = "Value", size = "medium" }) => {
  const canvasRef = useRef(null);

  const sizeConfig = {
    small: { width: 150, height: 90, fontSize: 14 },
    medium: { width: 400, height: 220, fontSize: 22 },
    large: { width: 250, height: 150, fontSize: 22 },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    const safeValue = value || 0.0001;
    const maxValue = 2000;
    const progress = Math.min(safeValue / maxValue, 1);
    const endAngle = Math.PI + progress * Math.PI;

    if (progress > 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
      ctx.strokeStyle = getGradientColor(progress);
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    if (progress > 0) {
      const pointerAngle = Math.PI + progress * Math.PI;
      const pointerLength = radius * 0.7;
      const pointerX = centerX + Math.cos(pointerAngle) * pointerLength;
      const pointerY = centerY + Math.sin(pointerAngle) * pointerLength;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(pointerX, pointerY);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
    }
  }, [value]);

  const getGradientColor = (progress) => {
    if (progress < 0.5) return "#10b981";
    if (progress < 0.8) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={config.width}
        height={config.height}
        className="block max-w-[400px] max-h-[220px] mt-[-150px] rounded-lg"
      />

      <div className="mt-2 text-center w-full max-w-[400px]">
        <span className="text-gray-900 dark:text-white text-xl font-bold">
          ₹{value.toLocaleString("en-IN")}{" "}
        </span>
        <span className="text-gray-600 dark:text-gray-300 text-lg">
          {display}
        </span>
      </div>
    </div>
  );
};

export default CanvasGauge;
