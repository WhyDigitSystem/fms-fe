import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  Layers,
  Building2,
  Calendar,
  UserCog,
  Truck,
  Warehouse,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { logout } from "../../store/slices/authSlice";
import { toggleSidebar } from "../../store/slices/uiSlice";
import GlobalSelectionDropdown from "./GlobalParameter";

const Header = () => {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const navigate = useNavigate();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarBtnRef = useRef(null);

  let globalParam = {};

  try {
    globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  } catch (error) {
    console.error("Error parsing globalParams:", error);
  }

  const getDisplayValue = (value, fields = []) => {
    if (value == null) return "";

    if (["string", "number", "boolean"].includes(typeof value)) {
      return String(value);
    }

    if (typeof value === "object") {
      for (const field of fields) {
        const fieldValue = value?.[field];

        if (
          fieldValue != null &&
          ["string", "number", "boolean"].includes(typeof fieldValue)
        ) {
          return String(fieldValue);
        }
      }
    }

    return "";
  };

  const loginBranchId =
    localStorage.getItem("branchId") || globalParam?.branchId || "";

  const loginBranch = getDisplayValue(
    globalParam?.branch ?? localStorage.getItem("branch"),
    ["branchName", "branchCode", "name", "code", "label", "value"],
  );

  const loginBranchCode = getDisplayValue(
    globalParam?.branchcode ??
      globalParam?.branchCode ??
      localStorage.getItem("branchcode") ??
      localStorage.getItem("branchCode"),
    ["branchCode", "code", "name", "value"],
  );

  const loginCustomer = getDisplayValue(
    globalParam?.customer ?? localStorage.getItem("customer"),
    ["customerName", "customerCode", "name", "code", "label", "value"],
  );

  const loginClient = getDisplayValue(
    globalParam?.client ?? localStorage.getItem("client"),
    ["clientName", "clientCode", "name", "code", "label", "value"],
  );

  const loginWarehouse = getDisplayValue(
    globalParam?.warehouse ?? localStorage.getItem("warehouse"),
    ["warehouseName", "warehouseCode", "name", "code", "label", "value"],
  );

  const loginFinYear = getDisplayValue(
    globalParam?.finYear ??
      globalParam?.financialYear ??
      localStorage.getItem("finYear") ??
      localStorage.getItem("financialYear"),
    ["finYear", "financialYear", "year", "name", "value"],
  );

  const rawUserName =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    user?.name ||
    "SYSTEM";

  const displayUserName =
    getDisplayValue(rawUserName, [
      "name",
      "userName",
      "username",
      "employeeName",
    ]) || "User";

  const userInitials =
    displayUserName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const getUserRole = () => {
    if (user?.type === "Employee") return "Operational Staff";
    if (user?.type === "Customer") return "Customer";
    if (user?.type === "Admin") return "System Administrator";

    return user?.role || user?.type || "User";
  };

  const handleLogout = () => {
    localStorage.clear();
    dispatch(logout());
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }

      if (window.innerWidth < 768) {
        const sidebar = document.getElementById("sidebar");

        if (
          sidebarOpen &&
          sidebar &&
          !sidebar.contains(event.target) &&
          sidebarBtnRef.current &&
          !sidebarBtnRef.current.contains(event.target)
        ) {
          dispatch(toggleSidebar());
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen, dispatch]);

  const informationItems = [
    {
      label: loginBranch || "Branch",
      icon: Building2,
      color:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      title: loginBranchCode ? `Branch Code: ${loginBranchCode}` : "Branch",
    },
    {
      label: loginCustomer || "Customer",
      icon: UserCog,
      color:
        "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      title: "Customer",
    },
    {
      label: loginFinYear || "Financial Year",
      icon: Calendar,
      color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      title: "Financial Year",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="px-3">
        <div className="flex items-center justify-between gap-2 h-14">
          {/* Left section */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              ref={sidebarBtnRef}
              onClick={() => dispatch(toggleSidebar())}
              className="shrink-0 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Application title */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Layers className="h-4 w-4 text-white" />
              </div>

              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
                  Freight
                  <span className="text-blue-600 dark:text-blue-400">
                    {" "}
                    Flow
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Global parameters */}
            <div className="shrink-0">
              <GlobalSelectionDropdown />
            </div>

            {/* Current selections */}
            <div className="hidden xl:flex items-center gap-1.5 max-w-[420px] overflow-x-auto scrollbar-hide">
              {informationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <span
                    key={item.title}
                    title={item.title}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-[11px] font-medium whitespace-nowrap ${item.color}`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-28 truncate">{item.label}</span>
                  </span>
                );
              })}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="shrink-0 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-yellow-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-slate-600" />
              )}
            </button>

            {/* User profile */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown((prev) => !prev)}
                aria-expanded={showProfileDropdown}
                aria-label="Toggle user profile menu"
                className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-200 dark:border-gray-700 py-1"
              >
                <div className="relative">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-950 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    {userInitials}
                  </div>

                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                </div>

                <div className="hidden lg:block text-left max-w-28">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {displayUserName}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {getUserRole()}
                  </p>
                </div>

                <ChevronDown
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform ${
                    showProfileDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                  {/* User details */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-blue-600 to-purple-800 flex items-center justify-center text-white text-sm font-semibold">
                        {userInitials}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {displayUserName}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {user?.email || "Signed in"}
                        </p>
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                          {getUserRole()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Organization details */}
                  {(loginBranch ||
                    loginCustomer ||
                    loginClient ||
                    loginWarehouse ||
                    loginFinYear ||
                    loginBranchId ||
                    localStorage.getItem("orgId")) && (
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 space-y-1">
                      {[
                        ["Branch", loginBranch],
                        ["Customer", loginCustomer],
                        ["Client", loginClient],
                        ["Warehouse", loginWarehouse],
                        ["Financial Year", loginFinYear],
                      ]
                        .filter(([, value]) => value)
                        .map(([label, value]) => (
                          <div
                            key={label}
                            className="flex items-center justify-between gap-2 text-[11px]"
                          >
                            <span className="text-gray-500 dark:text-gray-400">
                              {label}
                            </span>
                            <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-32">
                              {value}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate("/settings/profile");
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        Profile
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </span>
                    </button>
                  </div>

                  <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-center text-gray-400">
                      Freight Flow · Version 1.0
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
