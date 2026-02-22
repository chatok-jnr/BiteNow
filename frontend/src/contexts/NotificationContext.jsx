import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showSuccess = useCallback((message) => {
    setNotification({
      type: "success",
      message,
      id: Date.now(),
    });
  }, []);

  const showError = useCallback((message) => {
    setNotification({
      type: "error",
      message,
      id: Date.now(),
    });
  }, []);

  const showWarning = useCallback((message) => {
    setNotification({
      type: "warning",
      message,
      id: Date.now(),
    });
  }, []);

  const showInfo = useCallback((message) => {
    setNotification({
      type: "info",
      message,
      id: Date.now(),
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...options,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideNotification,
        confirm,
      }}
    >
      {children}

      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          notification={notification}
          onClose={hideNotification}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          dialog={confirmDialog}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </NotificationContext.Provider>
  );
};

const NotificationToast = ({ notification, onClose }) => {
  const { type, message } = notification;

  // Auto-dismiss
  React.useEffect(() => {
    const duration = type === "error" ? 5000 : 4000;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [notification, type, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      color: "#67A177",
      title: "Success!",
    },
    error: {
      icon: AlertCircle,
      color: "#EF4444",
      title: "Error",
    },
    warning: {
      icon: AlertTriangle,
      color: "#F59E0B",
      title: "Warning",
    },
    info: {
      icon: Info,
      color: "#3B82F6",
      title: "Info",
    },
  };

  const { icon: Icon, color, title } = config[type] || config.info;
  const duration = type === "error" ? 5000 : 4000;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slideInRight">
      <div
        className="bg-white rounded-xl shadow-2xl overflow-hidden min-w-[320px] max-w-md"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className={
              type === "error" ? "animate-shrinkSlow" : "animate-shrink"
            }
            style={{
              height: "100%",
              backgroundColor: color,
              width: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ dialog, onConfirm, onCancel }) => {
  const {
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger", // 'danger' or 'warning' or 'info'
  } = dialog;

  const typeConfig = {
    danger: {
      icon: AlertCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      buttonBg: "bg-red-500 hover:bg-red-600",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-500",
      buttonBg: "bg-yellow-500 hover:bg-yellow-600",
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      buttonBg: "bg-blue-500 hover:bg-blue-600",
    },
  };

  const config = typeConfig[type] || typeConfig.danger;
  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in-down">
        <div className="text-center mb-6">
          <div
            className={`mx-auto w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mb-4`}
          >
            <Icon className={`w-10 h-10 ${config.iconColor}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-400 text-white py-3 rounded-full hover:bg-gray-500 font-semibold transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${config.buttonBg} text-white py-3 rounded-full font-semibold transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
