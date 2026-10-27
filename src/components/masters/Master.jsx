import React from "react";
import {
  Boxes,
  Building2,
  CalendarCheck,
  Coins,
  FileText,
  GitBranch,
  GitMerge,
  Globe,
  IdCard,
  Landmark,
  Map,
  Monitor,
  Shield,
  PlusCircle,
  Tag,
  UserCheck,
  UserPlus,
  Users,
  Warehouse,
  BriefcaseBusiness,
  KeyRound,
  Network,
  FileCheck,
  Package,
  Wrench,
  Truck,
  Anchor,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { hasScreenAccess } from "../../utils/accessControl";

// All master menu items
const MASTERS = [
  {
    name: "Country",
    icon: Globe,
    path: "/country",
    color: "emerald",
    screenCode: "COUNTRY",
  },
  {
    name: "State",
    icon: Map,
    path: "/state",
    color: "orange",
    screenCode: "STATE",
  },
  {
    name: "City",
    icon: Landmark,
    path: "/city",
    color: "sky",
    screenCode: "CITY",
  },
  {
    name: "Department",
    icon: Building2,
    path: "/department",
    color: "green",
    screenCode: "DEPT",
  },
  {
    name: "Designation",
    icon: BriefcaseBusiness,
    path: "/designation",
    color: "purple",
    screenCode: "DESIGNATION",
  },
  {
    name: "Employee",
    icon: UserCheck,
    path: "/employee",
    color: "cyan",
    screenCode: "EMP",
  },
  {
    name: "User Creation",
    icon: UserPlus,
    path: "/user",
    color: "pink",
    screenCode: "US",
  },
  {
    name: "Document Type",
    icon: FileText,
    path: "/document-type",
    color: "slate",
    screenCode: "DT",
  },
  {
    name: "Document Type Mapping",
    icon: GitMerge,
    path: "/document-type-mapping",
    color: "sky",
    screenCode: "DTM",
  },
  {
    name: "Financial Year",
    icon: CalendarCheck,
    path: "/financial-year",
    color: "indigo",
    screenCode: "FY",
  },
  {
    name: "Screens",
    icon: Monitor,
    path: "/screens",
    color: "violet",
    screenCode: "SCR",
  },
  {
    name: "Screen Access",
    icon: Shield,
    path: "/screen-access",
    color: "rose",
    screenCode: "SA",
  },
  {
    name: "New Entries",
    icon: PlusCircle,
    path: "/new-entries",
    color: "amber",
    screenCode: "NEWE",
    sadminOnly: true,
  },
  {
    name: "Branch",
    icon: GitBranch,
    path: "/branch",
    color: "teal",
    screenCode: "BR",
  },
  {
    name: "Roles",
    icon: KeyRound,
    path: "/roles",
    color: "blue",
    screenCode: "RR",
  },
  {
    name: "Product",
    icon: Package,
    path: "/product",
    color: "blue",
    screenCode: "PROD",
  },
  {
    name: "Service",
    icon: Wrench,
    path: "/service",
    color: "teal",
    screenCode: "SERV",
  },
  {
    name: "Port",
    icon: Anchor,
    path: "/port",
    color: "cyan",
    screenCode: "PORT",
  },
  {
    name: "Mode",
    icon: Truck,
    path: "/mode",
    color: "orange",
    screenCode: "MODE",
  },
  {
    name: "Currency",
    icon: Coins,
    path: "/currency",
    color: "teal",
    screenCode: "CUR",
  },
];

// Business Master contains only these items
const BUSINESS_MASTER_NAMES = ["Product", "Service", "Port", "Mode"];

// Split the master items into two sections
const BASIC_MASTER = MASTERS.filter(
  (item) => !BUSINESS_MASTER_NAMES.includes(item.name),
);

const BUSINESS_MASTER = MASTERS.filter((item) =>
  BUSINESS_MASTER_NAMES.includes(item.name),
);

// Static Tailwind classes ensure production builds include all styles.
const getColorStyles = (color) => {
  const colors = {
    blue: {
      hover: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
      border: "hover:border-blue-300 dark:hover:border-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      iconBg:
        "bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
    },
    cyan: {
      hover: "hover:bg-cyan-50 dark:hover:bg-cyan-900/30",
      border: "hover:border-cyan-300 dark:hover:border-cyan-600",
      text: "text-cyan-600 dark:text-cyan-400",
      iconBg:
        "bg-cyan-100 dark:bg-cyan-900/40 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800",
    },
    teal: {
      hover: "hover:bg-teal-50 dark:hover:bg-teal-900/30",
      border: "hover:border-teal-300 dark:hover:border-teal-600",
      text: "text-teal-600 dark:text-teal-400",
      iconBg:
        "bg-teal-100 dark:bg-teal-900/40 group-hover:bg-teal-200 dark:group-hover:bg-teal-800",
    },
    indigo: {
      hover: "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
      border: "hover:border-indigo-300 dark:hover:border-indigo-600",
      text: "text-indigo-600 dark:text-indigo-400",
      iconBg:
        "bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800",
    },
    amber: {
      hover: "hover:bg-amber-50 dark:hover:bg-amber-900/30",
      border: "hover:border-amber-300 dark:hover:border-amber-600",
      text: "text-amber-600 dark:text-amber-400",
      iconBg:
        "bg-amber-100 dark:bg-amber-900/40 group-hover:bg-amber-200 dark:group-hover:bg-amber-800",
    },
    rose: {
      hover: "hover:bg-rose-50 dark:hover:bg-rose-900/30",
      border: "hover:border-rose-300 dark:hover:border-rose-600",
      text: "text-rose-600 dark:text-rose-400",
      iconBg:
        "bg-rose-100 dark:bg-rose-900/40 group-hover:bg-rose-200 dark:group-hover:bg-rose-800",
    },
    purple: {
      hover: "hover:bg-purple-50 dark:hover:bg-purple-900/30",
      border: "hover:border-purple-300 dark:hover:border-purple-600",
      text: "text-purple-600 dark:text-purple-400",
      iconBg:
        "bg-purple-100 dark:bg-purple-900/40 group-hover:bg-purple-200 dark:group-hover:bg-purple-800",
    },
    pink: {
      hover: "hover:bg-pink-50 dark:hover:bg-pink-900/30",
      border: "hover:border-pink-300 dark:hover:border-pink-600",
      text: "text-pink-600 dark:text-pink-400",
      iconBg:
        "bg-pink-100 dark:bg-pink-900/40 group-hover:bg-pink-200 dark:group-hover:bg-pink-800",
    },
    orange: {
      hover: "hover:bg-orange-50 dark:hover:bg-orange-900/30",
      border: "hover:border-orange-300 dark:hover:border-orange-600",
      text: "text-orange-600 dark:text-orange-400",
      iconBg:
        "bg-orange-100 dark:bg-orange-900/40 group-hover:bg-orange-200 dark:group-hover:bg-orange-800",
    },
    emerald: {
      hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/30",
      border: "hover:border-emerald-300 dark:hover:border-emerald-600",
      text: "text-emerald-600 dark:text-emerald-400",
      iconBg:
        "bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800",
    },
    sky: {
      hover: "hover:bg-sky-50 dark:hover:bg-sky-900/30",
      border: "hover:border-sky-300 dark:hover:border-sky-600",
      text: "text-sky-600 dark:text-sky-400",
      iconBg:
        "bg-sky-100 dark:bg-sky-900/40 group-hover:bg-sky-200 dark:group-hover:bg-sky-800",
    },
    violet: {
      hover: "hover:bg-violet-50 dark:hover:bg-violet-900/30",
      border: "hover:border-violet-300 dark:hover:border-violet-600",
      text: "text-violet-600 dark:text-violet-400",
      iconBg:
        "bg-violet-100 dark:bg-violet-900/40 group-hover:bg-violet-200 dark:group-hover:bg-violet-800",
    },
    slate: {
      hover: "hover:bg-slate-50 dark:hover:bg-slate-900/30",
      border: "hover:border-slate-300 dark:hover:border-slate-600",
      text: "text-slate-600 dark:text-slate-400",
      iconBg:
        "bg-slate-100 dark:bg-slate-900/40 group-hover:bg-slate-200 dark:group-hover:bg-slate-800",
    },
    green: {
      hover: "hover:bg-green-50 dark:hover:bg-green-900/30",
      border: "hover:border-green-300 dark:hover:border-green-600",
      text: "text-green-600 dark:text-green-400",
      iconBg:
        "bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-800",
    },
  };

  return colors[color] || colors.blue;
};

// Master Data component
const Master = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType")?.toUpperCase();

  // Preserve existing access-control rules
  const filterByAccess = (items) =>
    items.filter((item) => {
      if (userType === "SADMIN") {
        return item.sadminOnly === true;
      }

      if (item.sadminOnly) {
        return false;
      }

      return hasScreenAccess(item.screenCode);
    });

  const filteredBasicMasters = filterByAccess(BASIC_MASTER);
  const filteredBusinessMasters = filterByAccess(BUSINESS_MASTER);

  // Reusable master section
  const renderMasterSection = (title, items, SectionIcon) => (
    <section className="mb-6" key={title}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-sm">
          <SectionIcon className="h-4 w-4 text-white" />
        </div>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>

        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({items.length})
        </span>

        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
      </div>

      {/* Master Cards */}
      {items.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 2xl:grid-cols-12 gap-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            const colors = getColorStyles(item.color);

            return (
              <div
                key={item.name}
                role="button"
                tabIndex={0}
                aria-label={`Open ${item.name}`}
                onClick={() => navigate(item.path)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(item.path);
                  }
                }}
                className="group cursor-pointer animate-slideUp"
                style={{
                  animationDelay: `${index * 30}ms`,
                }}
              >
                <div
                  className={`
                    relative overflow-hidden
                    bg-white dark:bg-gray-800
                    rounded-lg border border-gray-200 dark:border-gray-700
                    ${colors.border} ${colors.hover}
                    transition-all duration-200
                    hover:shadow-md hover:scale-[1.02]
                    focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-emerald-500
                  `}
                >
                  <div className="p-1 h-20 flex flex-col items-center justify-center text-center">
                    {/* Icon */}
                    <div
                      className={`
                        p-2 rounded-lg ${colors.iconBg}
                        transition-all duration-200
                        group-hover:scale-105 mb-1.5
                      `}
                    >
                      <Icon className={`h-4 w-4 ${colors.text}`} />
                    </div>

                    {/* Master Name */}
                    <h3
                      className={`
                        text-xs font-medium ${colors.text}
                        transition-colors leading-tight line-clamp-2
                      `}
                    >
                      {item.name}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No {title.toLowerCase()} items available.
          </p>
        </div>
      )}
    </section>
  );

  const hasAnyMasters =
    filteredBasicMasters.length > 0 || filteredBusinessMasters.length > 0;

  return (
    <div className="animate-fadeIn px-3 py-3">
      {hasAnyMasters ? (
        <>
          {/* First Section: Basic Master */}
          {renderMasterSection("Basic Master", filteredBasicMasters, Boxes)}

          {/* Second Section: Business Master */}
          {renderMasterSection(
            "Business Master",
            filteredBusinessMasters,
            BriefcaseBusiness,
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                <Boxes className="h-6 w-6 text-gray-400" />
              </div>
            </div>

            <h2 className="text-base font-semibold text-gray-800 dark:text-white">
              No master data available
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You do not have access to any master data module.
            </p>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              User Type: {localStorage.getItem("userType") || "None"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Shared entrance animations
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out forwards;
  opacity: 0;
}
`;

// Add animation styles once
if (
  typeof document !== "undefined" &&
  !document.getElementById("master-page-animations")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "master-page-animations";
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Master;
