import React, { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const TIPOS = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const pushToast = (payload) => {
    const id = crypto.randomUUID();
    const nuevo = {
      id,
      tipo: payload.tipo || TIPOS.info,
      titulo: payload.titulo || "Aviso",
      mensaje: payload.mensaje || "",
      duracion: payload.duracion || 5000,
    };
    setToasts((prev) => [nuevo, ...prev].slice(0, 3));
    setTimeout(() => removeToast(id), nuevo.duracion);
  };

  const value = useMemo(
    () => ({ toasts, pushToast, removeToast, TIPOS }),
    [toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            className={`toast toast-${toast.tipo}`}
            onClick={() => removeToast(toast.id)}
            type="button"
            aria-label="Cerrar notificacion"
          >
            <div className="toast-content">
              <span className="toast-title">{toast.titulo}</span>
              <span className="toast-message">{toast.mensaje}</span>
            </div>
            <div className="toast-progress" style={{ animationDuration: `${toast.duracion}ms` }} />
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

export { ToastProvider, useToast, TIPOS };

export default ToastProvider;
