import { BrowserRouter, useRoutes } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import NotFound from "./NotFound";

import dashboardRoutes from "./DashboardRoutes";
import masterRoutes from "./MasterRoutes";
import salesRoutes from "./SalesRoutes";
import setupRoutes from "./setupRoutes";
import settingsRoutes from "./SettingsRoutes";

const routes = [
  // Public routes
  {
    path: "/login",
    element: <PublicRoutes />,
  },

  // All protected routes share authentication and Layout
  {
    element: <ProtectedRoutes />,
    children: [
      ...dashboardRoutes,
      ...masterRoutes,
      ...salesRoutes,
      ...setupRoutes,
      ...settingsRoutes,

      // Fallback for invalid URLs
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

function RouteRenderer() {
  return useRoutes(routes);
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RouteRenderer />
    </BrowserRouter>
  );
}
