import { FileText, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hasScreenAccess } from "../../utils/accessControl";

const sales = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType")?.toUpperCase();

  const masters = [
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
  ];

  // Filter masters based on screen access and user type
  const filteredMasters = masters.filter((item) => {
    if (userType === "SADMIN") {
      return item.sadminOnly === true;
    }

    if (item.sadminOnly) {
      return false;
    }

    return hasScreenAccess(item.screenCode);
  });

  // If no masters are available, show a message
  if (filteredMasters.length === 0) {
    return (
      <div className="max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Sales Masters
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No enquiry or quotation available for your role
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            User Type: {localStorage.getItem("userType") || "None"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-auto mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Sales Masters
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-5">
        {filteredMasters.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className="cursor-pointer group bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700 p-4 rounded-2xl
              shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div
                className={`p-3 rounded-xl ${
                  item.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                } mb-3 inline-flex`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                {item.name}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default sales;
