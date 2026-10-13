import {
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  Layers,
  Truck,
  Building2,
  Calendar,
  UserCog,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../hooks/useTheme";
import { logout } from "../../store/slices/authSlice";
import { toggleSidebar } from "../../store/slices/uiSlice";
import { useNavigate } from "react-router-dom";
import GlobalSelectionDropdown from "./GlobalParameter";

const Header = () => {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  /* ============================================================
     GET GLOBAL PARAMETERS SAFELY
  ============================================================ */

  let globalParam = {};

  try {
    const storedGlobalParams = localStorage.getItem("globalParams");

    if (storedGlobalParams) {
      globalParam = JSON.parse(storedGlobalParams);
    }
  } catch (error) {
    console.error("Error parsing globalParams:", error);
    globalParam = {};
  }
  const getDisplayValue = (value, fields = []) => {
    if (value === null || value === undefined) {
      return "";
    }

    // Already a primitive value
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    // Object
    if (typeof value === "object") {
      for (const field of fields) {
        const fieldValue = value?.[field];

        if (
          fieldValue !== null &&
          fieldValue !== undefined &&
          (typeof fieldValue === "string" ||
            typeof fieldValue === "number" ||
            typeof fieldValue === "boolean")
        ) {
          return String(fieldValue);
        }
      }
    }

    return "";
  };
  const loginBranchId =
    localStorage.getItem("branchId") || globalParam?.branchId || "";

  const rawLoginBranch =
    globalParam?.branch ?? localStorage.getItem("branch") ?? "";

  const loginBranch = getDisplayValue(rawLoginBranch, [
    "branchName",
    "branchCode",
    "name",
    "code",
    "label",
    "value",
  ]);

  /* ============================================================
     BRANCH CODE
  ============================================================ */

  const rawLoginBranchCode =
    globalParam?.branchcode ??
    globalParam?.branchCode ??
    localStorage.getItem("branchcode") ??
    localStorage.getItem("branchCode") ??
    "";

  const loginBranchCode = getDisplayValue(rawLoginBranchCode, [
    "branchCode",
    "code",
    "name",
    "value",
  ]);

  /* ============================================================
     CUSTOMER
  ============================================================ */

  const rawLoginCustomer =
    globalParam?.customer ?? localStorage.getItem("customer") ?? "";

  const loginCustomer = getDisplayValue(rawLoginCustomer, [
    "customerName",
    "customerCode",
    "name",
    "code",
    "label",
    "value",
  ]);

  /* ============================================================
     CLIENT
  ============================================================ */

  const rawLoginClient =
    globalParam?.client ?? localStorage.getItem("client") ?? "";

  const loginClient = getDisplayValue(rawLoginClient, [
    "clientName",
    "clientCode",
    "name",
    "code",
    "label",
    "value",
  ]);

  /* ============================================================
     WAREHOUSE
  ============================================================ */

  const rawLoginWarehouse =
    globalParam?.warehouse ?? localStorage.getItem("warehouse") ?? "";

  const loginWarehouse = getDisplayValue(rawLoginWarehouse, [
    "warehouseName",
    "warehouseCode",
    "name",
    "code",
    "label",
    "value",
  ]);

  const rawLoginFinYear =
    globalParam?.finYear ??
    globalParam?.financialYear ??
    localStorage.getItem("finYear") ??
    localStorage.getItem("financialYear") ??
    "";

  const loginFinYear = getDisplayValue(rawLoginFinYear, [
    "finYear",
    "financialYear",
    "year",
    "name",
    "value",
  ]);

  /* ============================================================
     USER NAME
  ============================================================ */

  const loginUserName =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    user?.name ||
    "SYSTEM";

  /* ============================================================
     ORGANIZATION ID
  ============================================================ */

  const orgId = localStorage.getItem("orgId") || "";

  /* ============================================================
     USER DISPLAY NAME
  ============================================================ */

  const displayUserName =
    typeof loginUserName === "string"
      ? loginUserName
      : getDisplayValue(loginUserName, [
        "name",
        "userName",
        "username",
        "employeeName",
      ]) || "User";

  const userInitial = displayUserName?.charAt(0)?.toUpperCase() || "U";

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* ======================================================
            LEFT SECTION
        ====================================================== */}

        <div className="flex items-center space-x-6">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-sm group"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* ======================================================
            CENTER SECTION
        ====================================================== */}

        {/* <div className="flex-1 mx-6">
          <div className="flex flex-wrap items-center gap-3">

            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                         bg-emerald-50 dark:bg-emerald-900/30
                         text-emerald-700 dark:text-emerald-300
                         border border-gray-300 dark:border-gray-600
                         text-sm font-medium"
              title={loginBranchCode ? `Branch: ${loginBranchCode}` : "Branch"}
            >
              <Building2 className="h-4 w-4" />

              {loginBranch || "Branch"}
            </span>

            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                         bg-amber-50 dark:bg-amber-900/30
                         text-amber-700 dark:text-amber-300
                         border border-gray-300 dark:border-gray-600
                         text-sm font-medium"
            >
              <UserCog className="h-4 w-4" />

              {loginCustomer || "Customer"}
            </span>

            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                         bg-amber-50 dark:bg-amber-900/30
                         text-amber-700 dark:text-amber-300
                         border border-gray-300 dark:border-gray-600
                         text-sm font-medium"
            >
              <Calendar className="h-4 w-4" />

              {loginFinYear || "Financial Year"}
            </span>
          </div>
        </div> */}

        {/* CENTER HEADING */}
        <div className="flex-1 min-w-0 mx-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl
                    bg-gradient-to-br from-blue-600 to-indigo-600
                    shadow-md shadow-blue-500/20">
              <Layers className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight
                     text-gray-900 dark:text-white">
                Fright 
                <span className="text-blue-600 dark:text-blue-400"> Flow</span>
              </h1>

              {/* <p className="text-xs font-medium tracking-wide
                    text-gray-500 dark:text-gray-400">
                TRANSPORT & FLEET MANAGEMENT
              </p> */}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">

          <GlobalSelectionDropdown />

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group relative"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* ==================================================
              USER PROFILE
          ================================================== */}

          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 group relative">
              {/* USER AVATAR */}

              <div
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600
                           rounded-xl flex items-center justify-center
                           text-white font-semibold shadow-sm"
              >
                {userInitial}
              </div>

              {/* USER NAME */}

              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {displayUserName}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Administrator
                </div>
              </div>

              <ChevronDown
                className="h-4 w-4 text-gray-400
                           group-hover:text-gray-600
                           dark:group-hover:text-gray-300
                           transition-colors"
              />

              {/* ==================================================
                  USER DROPDOWN
              ================================================== */}

              <div
                className="absolute top-full right-0 mt-2 w-48
                           bg-white dark:bg-gray-800 rounded-xl
                           shadow-lg border border-gray-200
                           dark:border-gray-700
                           opacity-0 invisible
                           group-hover:opacity-100
                           group-hover:visible
                           transition-all duration-200 z-50"
              >
                <div className="p-2">
                  {/* PROFILE */}

                  <button
                    onClick={() => navigate("/settings/profile")}
                    className="w-full flex items-center space-x-2
                               px-3 py-2 text-sm
                               text-gray-700 dark:text-gray-300
                               hover:bg-gray-50 dark:hover:bg-gray-700
                               rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4" />

                    <span>Profile</span>
                  </button>

                  {/* SIGN OUT */}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2
                               px-3 py-2 text-sm
                               text-red-600 dark:text-red-400
                               hover:bg-red-50
                               dark:hover:bg-red-900/20
                               rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />

                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
