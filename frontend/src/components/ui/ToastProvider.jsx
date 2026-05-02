import React, { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const pushToast = ({ type = "info", title = "Aviso", message = "", duration = 5000 }) => {
    const id = crypto.randomUUID();
    const toast = { id, type, title, message, duration };
    setToasts((prev) => [toast, ...prev].slice(0, 3));
    setTimeout(() => removeToast(id), duration);
  };

  const value = useMemo(() => ({ pushToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
            type="button"
            aria-label="Cerrar notificacion"
          >
            <span className="toast-title">{toast.title}</span>
            <span className="toast-message">{toast.message}</span>
            <span className="toast-progress" style={{ animationDuration: `${toast.duration}ms` }} />
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

