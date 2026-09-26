'use client';

import { createContext, useContext } from 'react';
import { toast } from 'react-toastify';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback direct to react-toastify if used outside provider
    return {
      showSuccess: (msg, duration = 3000) => toast.success(msg, { autoClose: duration }),
      showError: (msg, duration = 4000) => toast.error(msg, { autoClose: duration }),
      showWarning: (msg, duration = 3500) => toast.warning(msg, { autoClose: duration }),
      showInfo: (msg, duration = 3000) => toast.info(msg, { autoClose: duration }),
      addToast: (msg, type = 'info', duration = 3000) => {
        const fn = toast[type] || toast.info;
        return fn(msg, { autoClose: duration });
      },
      removeToast: (id) => toast.dismiss(id)
    };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const addToast = (message, type = 'info', duration = 3000) => {
    const fn = toast[type] || toast.info;
    return fn(message, { autoClose: duration });
  };

  const removeToast = (id) => {
    toast.dismiss(id);
  };

  const showSuccess = (message, duration = 3000) => toast.success(message, { autoClose: duration });
  const showError = (message, duration = 4000) => toast.error(message, { autoClose: duration });
  const showWarning = (message, duration = 3500) => toast.warning(message, { autoClose: duration });
  const showInfo = (message, duration = 3000) => toast.info(message, { autoClose: duration });

  return (
    <ToastContext.Provider value={{
      addToast,
      removeToast,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastContext;