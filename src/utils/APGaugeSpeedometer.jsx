import React, { useEffect, useRef } from "react";
import { Gauge } from "gaugeJS";
import "./GaugeSpeedometer.css";

const APGaugeSpeedometer = ({ value, maxValue = 5, display }) => {
  const canvasRef = useRef(null);
  const gaugeRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const opts = {
      lines: 12,
      angle: 0.0,
      lineWidth: 0.4,
      pointer: {
        length: 0.6,
        strokeWidth: 0.05,
        color: "#000000",
      },
      limitMax: true,
      colorStart: "#FF6B6B",
      colorStop: "#4ECDC4",
      strokeColor: "#F0F0F0",
      generateGradient: true,
      percentColors: [
        [0.0, "#FF6B6B"],
        [0.5, "#FFD166"],
        [1.0, "#4ECDC4"],
      ],
      staticLabels: {
        font: "10px sans-serif",
        labels: [0, 1, 2, 3, 4, 5],
        color: "white",
        fractionDigits: 0,
      },
      staticZones: [
        { strokeStyle: "#FF6B6B", min: 0, max: 1 },
        { strokeStyle: "#FFD166", min: 1, max: 3 },
        { strokeStyle: "#4ECDC4", min: 3, max: 5 },
      ],
    };

    const gauge = new Gauge(canvasRef.current).setOptions(opts);
    gauge.maxValue = maxValue;
    gauge.animationSpeed = 32;

    // Convert value to number and handle undefined/null
    const numericValue = Number(value) || 0;
    gauge.set(numericValue);

    gaugeRef.current = gauge;

    return () => {
      gaugeRef.current = null;
    };
  }, [maxValue, value]);

  useEffect(() => {
    if (gaugeRef.current && value !== undefined) {
      const numericValue = Number(value) || 0;
      gaugeRef.current.set(numericValue);
    }
  }, [value]);

  // Safely convert value to number for display
  const numericValue = Number(value) || 0;
  const displayValue =
    typeof numericValue === "number" ? numericValue.toFixed(1) : "0";

  return (
    <div
      style={{
        textAlign: "center",
        margin: "0 auto",
        padding: "0px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        width="260"
        height="70"
        style={{
          display: "block",
          maxWidth: "100%",
        }}
      ></canvas>
      {/* <div
        style={{
          marginTop: "-30px",
          fontSize: "1.2rem",
          fontWeight: "bold",
          color: "#333",
          background: "rgba(255, 255, 255, 0.8)",
          padding: "5px 10px",
          borderRadius: "10px",
          border: "1px solid #e0e0e0",
        }}
      >
        {displayValue}/5
      </div>
      {display && (
        <div
          style={{
            marginTop: "5px",
            fontSize: "0.9rem",
            color: "#666",
            fontStyle: "italic",
          }}
        >
          {display}
        </div>
      )} */}
    </div>
  );
};

export default APGaugeSpeedometer;
