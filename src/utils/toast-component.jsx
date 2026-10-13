// utils/toast-component.js

import { useToast } from "../components/Toast/ToastContext";

// For backward compatibility, you can keep this function
export const showToast = (type, message, description = "") => {
  // Use your custom toast system
  const toastMessage = description ? `${message}: ${description}` : message;

  // This will be connected to your ToastContext
  if (typeof window !== "undefined" && window.showCustomToast) {
    window.showCustomToast(toastMessage, type);
  }
};

export default showToast;
