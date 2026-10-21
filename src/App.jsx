import { useEffect } from "react";
import { Provider, useSelector } from "react-redux";

import { store } from "./store";
import { ToastProvider } from "./components/Toast/ToastContext";
import AppRouter from "./routes/AppRouter";

import "./styles/globals.css";

// Apply the selected theme globally
function ThemeInitializer() {
  const mode = useSelector((state) => state.theme?.mode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return null;
}

function App() {
  return (
    <Provider store={store}>
      <ThemeInitializer />
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </Provider>
  );
}

export default App;
