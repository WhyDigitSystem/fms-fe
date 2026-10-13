import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
      default:
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800 dark:text-green-200";
      case "error":
        return "text-red-800 dark:text-red-200";
      case "warning":
        return "text-yellow-800 dark:text-yellow-200";
      default:
        return "text-green-800 dark:text-green-200";
    }
  };

  return (
    <div
      className={`flex items-center p-4 rounded-lg border shadow-sm ${getBackgroundColor()} ${getTextColor()} animate-in slide-in-from-top duration-300 mx-auto`}
      role="alert"
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-center">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
