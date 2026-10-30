import { useEffect, useState } from "react";
import { Edit, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import currencyAPI from "../../../api/currencyAPI";

const CurrencyList = ({ onAddNew, onEdit, onBack }) => {
  const { addToast } = useToast();
  const orgId = parseInt(localStorage.getItem("orgId")) || 1000000001;

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Back Navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  // Load Currency Data
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await currencyAPI.getAllCurrencies(orgId);
      setList(data);
    } catch (error) {
      console.error("Failed to load currencies:", error);
      addToast("Failed to load currencies", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            title="Back"
            className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Currency Master
          </h1>
        </div>

        <button
          type="button"
          onClick={onAddNew}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Add Currency
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-600 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Currency</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Sub Currency</th>
              <th className="px-4 py-3 font-semibold">Country</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No currencies found.
                </td>
              </tr>
            ) : (
              list.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-gray-800/50 text-slate-800 dark:text-gray-200"
                >
                  <td className="px-4 py-3">{item.currency}</td>

                  <td className="px-4 py-3">{item.currencySymbol || "-"}</td>

                  <td className="px-4 py-3">{item.subCurrency || "-"}</td>

                  <td className="px-4 py-3">{item.country || "-"}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.active === "Active" || item.active === true
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.active === "Active" || item.active === true
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="Edit Currency"
                      className="p-1 text-blue-600 hover:text-blue-800 transition"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrencyList;
