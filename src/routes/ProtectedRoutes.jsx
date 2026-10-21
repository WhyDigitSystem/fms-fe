import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import Layout from "../components/Layout/Layout";

export default function ProtectedRoutes() {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
