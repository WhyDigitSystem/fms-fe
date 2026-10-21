import React from "react";
import {
  FileText,
  ClipboardList,
  CalendarCheck,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hasScreenAccess } from "../../utils/accessControl";

const SALES = [
  {
    name: "Enquiry",
    icon: ClipboardList,
    path: "/enquiry",
    color: "blue",
    screenCode: "ENQUIRY",
  },
  {
    name: "Quotation",
    icon: FileText,
    path: "/quotation",
    color: "green",
    screenCode: "QUOTATION",
  },
  {
    name: "Booking",
    icon: CalendarCheck,
    path: "/booking",
    color: "purple",
    screenCode: "BOOKING",
  },
];

// Static Tailwind classes for reliable production builds.
const getColorStyles = (color) => {
  const colors = {
    blue: {
      hover: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
      border: "hover:border-blue-300 dark:hover:border-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      iconBg:
        "bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
    },
    green: {
      hover: "hover:bg-green-50 dark:hover:bg-green-900/30",
      border: "hover:border-green-300 dark:hover:border-green-600",
      text: "text-green-600 dark:text-green-400",
      iconBg:
        "bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-800",
    },
    purple: {
      hover: "hover:bg-purple-50 dark:hover:bg-purple-900/30",
      border: "hover:border-purple-300 dark:hover:border-purple-600",
      text: "text-purple-600 dark:text-purple-400",
      iconBg:
        "bg-purple-100 dark:bg-purple-900/40 group-hover:bg-purple-200 dark:group-hover:bg-purple-800",
    },
  };

  return colors[color] || colors.blue;
};

const Sales = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType")?.toUpperCase();

  // Preserve existing screen access rules.
  const filteredSales = SALES.filter((item) => {
    if (userType === "SADMIN") {
      return item.sadminOnly === true;
    }

    if (item.sadminOnly) {
      return false;
    }

    return hasScreenAccess(item.screenCode);
  });

  return (
    <div className="animate-fadeIn px-3 py-3">
      {filteredSales.length > 0 ? (
        <>
          {/* Main Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>

            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Sales Masters
            </h2>

            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              Manage sales transactions
            </span>

            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
          </div>

          {/* Compact Sales Cards */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 2xl:grid-cols-12 gap-3">
            {filteredSales.map((item, index) => {
              const Icon = item.icon;
              const colors = getColorStyles(item.color);

              return (
                <div
                  key={item.name}
                  role="button"
                  tabIndex={0}
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
                      relative overflow-hidden bg-white dark:bg-gray-800
                      rounded-lg border border-gray-200 dark:border-gray-700
                      ${colors.border} ${colors.hover}
                      transition-all duration-200
                      hover:shadow-md hover:scale-[1.02]
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

                      {/* Sales Module Name */}
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
        </>
      ) : (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
            </div>

            <h2 className="text-base font-semibold text-gray-800 dark:text-white">
              No sales modules available
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You do not have access to any sales module.
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

// Shared entrance animations — added only once.
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

if (
  typeof document !== "undefined" &&
  !document.getElementById("sales-page-animations")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "sales-page-animations";
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Sales;
