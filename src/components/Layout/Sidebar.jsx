import { clsx } from "clsx";
import {
  LayoutDashboard,
  ShoppingCart,
  Database,
  Settings,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { hasScreenAccess } from "../../utils/accessControl";
import { toggleSidebar } from "../../store/slices/uiSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const user = useSelector((state) => state.auth.user);

  const userType =
    user?.type?.toUpperCase() ||
    localStorage.getItem("userType")?.toUpperCase();

  const isSAdmin = userType === "SADMIN";

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      color: "indigo",
      screenCode: "DASHBOARD",
    },
    {
      name: "Master",
      href: "/master",
      icon: Database,
      color: "emerald",
      screenCode: "MASTER",
    },
    {
      name: "Sales",
      href: "/sales",
      icon: ShoppingCart,
      color: "orange",
      screenCode: "SALES",
    },
    {
      name: "Setup",
      href: "/setup",
      icon: Settings,
      color: "slate",
      screenCode: "SETUP",
    },
  ];

  const filteredNavigation = navigation.filter((item) => {
    if (isSAdmin) {
      return item.screenCode === "SETUP";
    }

    return hasScreenAccess(item.screenCode);
  });

  const iconColors = {
    indigo: {
      icon: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
      active: "bg-indigo-200 dark:bg-indigo-800",
    },
    emerald: {
      icon: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
      active: "bg-emerald-200 dark:bg-emerald-800",
    },
    orange: {
      icon: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/40",
      active: "bg-orange-200 dark:bg-orange-800",
    },
    slate: {
      icon: "text-slate-600 dark:text-slate-300",
      bg: "bg-slate-100 dark:bg-slate-800",
      active: "bg-slate-200 dark:bg-slate-700",
    },
  };

  const closeMobileSidebar = () => {
    if (window.innerWidth < 768 && sidebarOpen) {
      dispatch(toggleSidebar());
    }
  };

  if (filteredNavigation.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close sidebar"
        tabIndex={sidebarOpen ? 0 : -1}
        onClick={closeMobileSidebar}
        className={clsx(
          "fixed inset-x-0 bottom-0 top-14 z-30 bg-black/30",
          "transition-opacity duration-300 ease-in-out md:hidden",
          sidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      {/* Sidebar */}
      <aside
        id="sidebar"
        aria-label="Sidebar Navigation"
        className={clsx(
          "fixed bottom-0 left-0 top-14 z-40 flex flex-col",
          "w-[min(170px,80vw)]",
          "border-r border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900",
          "transform-gpu transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:sticky md:top-0 md:bottom-auto md:h-full",
          "md:translate-x-0 md:transform-none",
          "md:transition-[width] md:duration-300 md:ease-in-out",
          sidebarOpen ? "md:w-[170px]" : "md:w-20",
        )}
      >
        {/* Mobile sidebar header */}

        {/* Navigation links */}
        <nav className="mt-1 flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto px-1.5 py-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const colors = iconColors[item.color];

            return (
              <NavLink
                key={item.name}
                to={item.href}
                title={!sidebarOpen ? item.name : undefined}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  clsx(
                    "group flex min-w-0 rounded-md border",
                    "transition-colors duration-200",
                    isActive
                      ? "border-gray-200 bg-gray-100/80 dark:border-gray-700 dark:bg-gray-800/70"
                      : "border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800",
                    sidebarOpen
                      ? "items-center gap-2 px-2 py-1.5"
                      : "flex-col items-center justify-center gap-1 px-1 py-2",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Colored icon */}
                    <div
                      className={clsx(
                        "flex shrink-0 items-center justify-center rounded-md p-1.5",
                        "transition-transform duration-200 ease-out group-hover:scale-105",
                        colors.bg,
                        isActive && colors.active,
                      )}
                    >
                      <Icon
                        className={clsx("h-4 w-4", colors.icon)}
                        strokeWidth={1.8}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={clsx(
                        "font-medium text-gray-600 dark:text-gray-300",
                        "transition-colors duration-200",
                        sidebarOpen
                          ? "min-w-0 flex-1 truncate text-xs"
                          : "w-full text-center text-[10px] leading-tight",
                      )}
                    >
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className={clsx(
            "shrink-0 overflow-hidden border-t border-gray-100 dark:border-gray-800",
            "transition-opacity duration-200",
            sidebarOpen ? "opacity-100" : "opacity-0 md:hidden",
          )}
        >
          <p className="whitespace-nowrap px-2 py-2 text-center text-[10px] text-gray-500 dark:text-gray-400">
            Version 1.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
