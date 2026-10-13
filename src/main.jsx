import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import App from "./App";

import { ToastProvider } from "./components/Toast/ToastContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
