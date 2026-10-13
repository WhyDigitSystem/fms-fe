import { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import LoginForm from "./components/Auth/LoginForm";
import Layout from "./components/Layout/Layout";
import CountryMaster from "./components/masters/country/CountryMaster";
import Setup from "./components/masters/Setup";
import ProfileSettings from "./components/settings/Profile";
import SettingsDashboard from "./components/settings/SettingsDashboard";
import UserManagement from "./components/settings/UserManagement";
// import Dashboard from "./pages/Dashboard";
import { store } from "./store";
import "./styles/globals.css";
import { ToastProvider } from "./components/Toast/ToastContext";
import StateMaster from "./components/masters/state/StateMaster";
import CityMaster from "./components/masters/city/CityMaster";
import User from "./components/masters/user/User";
import EmployeeMasterPage from "./components/masters/employee/EmployeeMaster";
import DocType from "./components/masters/DocType/DocTypeMaster";
import DocumentMapping from "./components/masters/DocMapping/DocumentMapping";
import FinYear from "./components/masters/finyear/Finyear";
import ScreenNames from "./components/masters/screens/ScreenNames";
import ScreenAccess from "./components/masters/screenAccess/screenAccess";
import CreateCompanyPage from "./components/masters/createCompany/companyMaster";
import BranchMaster from "./components/masters/branch/BranchMaster";
import RolesAndResponsibilitySetup from "./components/masters/rolesResponsibilities/RolesAndResponsibilitySetup";
import DepartmentMasterPage from "./components/masters/Department/DepartmentMaster";
import DesignationMasterPage from "./components/masters/Designation/DesignationMaster";
import FmsDashboard from "./pages/FmsDashboard";

// Enquiry and Quotation imports
import Enquiry from "./components/sales/Enquiry/Enquiry";
import Quotation from "./components/sales/quotation/Quotation";
import Sales from "./components/sales/Sales";

// Theme initializer component
const ThemeInitializer = () => {
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  return null;
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route component
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/" />;
};

const AppContent = () => {
  return (
    <>
      <ThemeInitializer />
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      {/* Dashboard */}
                      {/* <Route path="/" element={<Dashboard />} /> */}
                      <Route path="/" element={<FmsDashboard />} />

                      {/* Settings */}
                      <Route path="/settings" element={<SettingsDashboard />} />
                      <Route
                        path="/settings/users"
                        element={<UserManagement />}
                      />
                      <Route
                        path="/settings/profile"
                        element={<ProfileSettings />}
                      />

                      {/* Masters */}
                      <Route
                        path="/department"
                        element={<DepartmentMasterPage />}
                      />
                      <Route
                        path="/designation"
                        element={<DesignationMasterPage />}
                      />
                      <Route path="/country" element={<CountryMaster />} />
                      <Route path="/setup" element={<Setup />} />
                      <Route path="/document-type" element={<DocType />} />
                      <Route
                        path="/document-type-mapping"
                        element={<DocumentMapping />}
                      />
                      <Route path="/state" element={<StateMaster />} />
                      <Route path="/city" element={<CityMaster />} />
                      <Route path="/financial-year" element={<FinYear />} />
                      <Route path="/screens" element={<ScreenNames />} />
                      <Route path="/screen-access" element={<ScreenAccess />} />
                      <Route
                        path="/new-entries"
                        element={<CreateCompanyPage />}
                      />
                      <Route path="/branch" element={<BranchMaster />} />
                      <Route
                        path="/roles"
                        element={<RolesAndResponsibilitySetup />}
                      />
                      <Route path="/user" element={<User />} />
                      <Route
                        path="/employee"
                        element={<EmployeeMasterPage />}
                      />

                      {/* Enquiry and Quotation */}
                      <Route path="/sales" element={<Sales/>} />
                      <Route path="/enquiry" element={<Enquiry />} />
                      <Route path="/quotation" element={<Quotation />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ToastProvider>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      {/* <ChatWidget /> */}
      <AppContent />
    </Provider>
  );
}

export default App;
