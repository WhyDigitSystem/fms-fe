import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LoginForm from "../components/Auth/LoginForm";

export default function PublicRoutes() {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <LoginForm />;
}
