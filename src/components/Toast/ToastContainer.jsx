import React from "react";
import Toast from "./Toast";

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
