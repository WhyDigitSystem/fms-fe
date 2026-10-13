import React, { useEffect, useRef, useState, useCallback } from "react";
import "./GaugeSpeedometer.css";

// Try different import methods
let Gauge;
try {
  Gauge = require("gaugejs/dist/gauge.js").Gauge;
} catch (e1) {
  try {
    Gauge = require("gaugejs/dist/gaugeJS.js").Gauge;
  } catch (e2) {
    try {
      Gauge = require("gaugejs").Gauge;
    } catch (e3) {
      console.warn("GaugeJS not found, using fallback");
      Gauge = class {
        constructor() {
          this.set = () => {};
          this.setOptions = () => this;
        }
      };
    }
  }
}

const GaugeSpeedometer = ({ value = 0, display = "Value" }) => {
  const canvasRef = useRef(null);
  const gaugeRef = useRef(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Function to detect theme
  const detectTheme = useCallback(() => {
    if (typeof window === "undefined") return false;

    const isDark =
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    setIsDarkTheme(isDark);
    return isDark;
  }, []);

  useEffect(() => {
    // Initial theme detection
    detectTheme();

    // Setup theme observer
    const observer = new MutationObserver(() => {
      detectTheme();

      // Update gauge colors if theme changes
      if (gaugeRef.current) {
        const isDarkNow = detectTheme();
        const newStrokeColor = isDarkNow ? "#374151" : "#e5e7eb";
        const newTextColor = isDarkNow ? "#ffffff" : "#111827";

        // Update gauge options
        if (gaugeRef.current.setOptions) {
          gaugeRef.current.setOptions({
            strokeColor: newStrokeColor,
            renderTicks: {
              divisions: 5,
              divWidth: 1.1,
              divLength: 0.7,
              divColor: isDarkNow ? "#4b5563" : "#9ca3af",
              subDivisions: 3,
              subLength: 0.5,
              subWidth: 0.6,
              subColor: isDarkNow ? "#6b7280" : "#d1d5db",
            },
            staticLabels: {
              font: "10px sans-serif",
              labels: [0, 500, 1000, 1500, 2000],
              color: newTextColor,
              fractionDigits: 0,
            },
          });

          // Force redraw
          gaugeRef.current.set(Math.min(Number(value) || 0, 2000));
        }
      }
    });

    // Observe theme changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      detectTheme();
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [detectTheme, value]);

  useEffect(() => {
    if (!canvasRef.current || !Gauge || Gauge.name === "empty") return;

    const isDark = detectTheme();
    const strokeColor = isDark ? "#374151" : "#e5e7eb";
    const textColor = isDark ? "#ffffff" : "#111827";

    const opts = {
      angle: 0.15,
      lineWidth: 0.12,
      radiusScale: 0.9,
      pointer: {
        length: 0.5,
        strokeWidth: 0.035,
        color: "#ef4444",
      },
      limitMax: false,
      colorStart: "#6366f1",
      colorStop: "#8b5cf6",
      strokeColor: strokeColor,
      generateGradient: true,
      highDpiSupport: true,
      renderTicks: {
        divisions: 5,
        divWidth: 1.1,
        divLength: 0.7,
        divColor: isDark ? "#4b5563" : "#9ca3af",
        subDivisions: 3,
        subLength: 0.5,
        subWidth: 0.6,
        subColor: isDark ? "#6b7280" : "#d1d5db",
      },
      staticZones: [],
      staticLabels: {
        font: "10px sans-serif",
        labels: [0, 500, 1000, 1500, 2000],
        color: textColor,
        fractionDigits: 0,
      },
    };

    const gauge = new Gauge(canvasRef.current).setOptions(opts);
    gauge.maxValue = 2000;
    gauge.animationSpeed = 32;
    gauge.set(Math.min(Number(value) || 0, 2000));

    gaugeRef.current = gauge;

    return () => {
      gaugeRef.current = null;
    };
  }, [detectTheme, value]);

  useEffect(() => {
    if (gaugeRef.current && value !== undefined) {
      gaugeRef.current.set(Math.min(Number(value), 2000));
    }
  }, [value]);

  // Calculate text colors based on current theme state
  const textColor = isDarkTheme ? "#ffffff" : "#111827";
  const subtextColor = isDarkTheme
    ? "rgba(255, 255, 255, 0.7)"
    : "rgba(0, 0, 0, 0.6)";

  return (
    <div
      className="gauge-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <canvas
        ref={canvasRef}
        width={180}
        height={90}
        style={{
          display: "block",
          maxWidth: "180px",
          maxHeight: "90px",
        }}
        className="gauge-canvas"
      />
      <div
        className="gauge-text-display"
        style={{
          marginTop: "10px",
          fontSize: "18px",
          fontWeight: "bold",
          textAlign: "center",
          color: textColor,
          transition: "color 0.3s ease",
        }}
      >
        ₹{value}{" "}
        <span
          style={{
            fontSize: "14px",
            color: subtextColor,
            transition: "color 0.3s ease",
          }}
        >
          {display}
        </span>
      </div>
    </div>
  );
};

export default GaugeSpeedometer;
