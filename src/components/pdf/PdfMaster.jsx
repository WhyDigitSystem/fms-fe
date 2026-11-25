import React from "react";
import {
  FileText,
  Files,
  FileCheck,
  FileOutput,
  FileSpreadsheet,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { hasScreenAccess } from "../../utils/accessControl";

// PDF Format Menu Items
const PDF_MASTERS = [
  {
    name: "Multimodal Transport Bill of Lading",
    icon: FileText,
    path: "/Pdfformat1",
    color: "blue",
    screenCode: "PDF1",
  },
  {
    name: "Air Waybill",
    icon: Files,
    path: "/Pdfformat2",
    color: "teal",
    screenCode: "PDF2",
  },
  {
    name: "Combined Transport Sea Waybill",
    icon: FileCheck,
    path: "/Pdfformat3",
    color: "purple",
    screenCode: "PDF3",
  },
  {
    name: "Non-Negotiable Waybill",
    icon: FileOutput,
    path: "/Pdfformat4",
    color: "orange",
    screenCode: "PDF4",
  },
  {
    name: "House Air Waybill",
    icon: FileSpreadsheet,
    path: "/Pdfformat5",
    color: "indigo",
    screenCode: "PDF5",
  },
  {
    name: "House Bill of Lading",
    icon: FileSpreadsheet,
    path: "/Pdfformat6",
    color: "orange",
    screenCode: "PDF6",
  },
];

// Colors
const getColorStyles = (color) => {
  const colors = {
    blue: {
      hover: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
      border: "hover:border-blue-300 dark:hover:border-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      iconBg:
        "bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
    },
    teal: {
      hover: "hover:bg-teal-50 dark:hover:bg-teal-900/30",
      border: "hover:border-teal-300 dark:hover:border-teal-600",
      text: "text-teal-600 dark:text-teal-400",
      iconBg:
        "bg-teal-100 dark:bg-teal-900/40 group-hover:bg-teal-200 dark:group-hover:bg-teal-800",
    },
    purple: {
      hover: "hover:bg-purple-50 dark:hover:bg-purple-900/30",
      border: "hover:border-purple-300 dark:hover:border-purple-600",
      text: "text-purple-600 dark:text-purple-400",
      iconBg:
        "bg-purple-100 dark:bg-purple-900/40 group-hover:bg-purple-200 dark:group-hover:bg-purple-800",
    },
    orange: {
      hover: "hover:bg-orange-50 dark:hover:bg-orange-900/30",
      border: "hover:border-orange-300 dark:hover:border-orange-600",
      text: "text-orange-600 dark:text-orange-400",
      iconBg:
        "bg-orange-100 dark:bg-orange-900/40 group-hover:bg-orange-200 dark:group-hover:bg-orange-800",
    },
    indigo: {
      hover: "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
      border: "hover:border-indigo-300 dark:hover:border-indigo-600",
      text: "text-indigo-600 dark:text-indigo-400",
      iconBg:
        "bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800",
    },
  };

  return colors[color] || colors.blue;
};

// PDF Master Component
const PdfMaster = () => {
  const navigate = useNavigate();

  const filteredPdfMasters = PDF_MASTERS.filter((item) =>
    hasScreenAccess(item.screenCode),
  );

  return (
    <div className="animate-fadeIn px-3 py-3">
      {/* Header */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-sm">
            <FileText className="h-4 w-4 text-white" />
          </div>

          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            PDF Formats
          </h2>

          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
        </div>

        {/* PDF Cards */}
        {filteredPdfMasters.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 2xl:grid-cols-12 gap-3">
            {filteredPdfMasters.map((item, index) => {
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

                      {/* Name */}
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
              No PDF formats available.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

// Animations
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
  !document.getElementById("pdf-master-animations")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "pdf-master-animations";
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default PdfMaster;
