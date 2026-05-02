import React, { useEffect, useState } from "react";
import { api, normalizeList } from "../services/api.js";
import { useAuth } from "../services/auth.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { formatRelative } from "../utils/formatters.js";

const filters = [
  { label: "Todas", value: "" },
  { label: "No leidas", value: "false" },
  { label: "Leidas", value: "true" },
];

const Notifications = () => {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [items, setItems] = useState([]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const query = filter === "" ? "" : `&read=${filter}`;
      const response = await api.get(`/api/patient/notifications?page=${page}&size=10${query}`, token);
      const normalized = normalizeList(response);
      setItems(normalized.list || []);
      setTotalPages(normalized.total || 0);
    } catch (error) {
      pushToast({ type: "error", title: "Error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  const markAsRead = async (notification) => {
    try {
      await api.put(`/api/patient/notifications/${notification.id}/read`, {}, token);
      fetchNotifications();
    } catch (error) {
      pushToast({ type: "error", title: "Error", message: error.message });
    }
  };

  const markAll = async () => {
    try {
      await Promise.all(items.filter((item) => !item.read).map((item) => api.put(`/api/patient/notifications/${item.id}/read`, {}, token)));
      fetchNotifications();
    } catch (error) {
      pushToast({ type: "error", title: "Error", message: error.message });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Notificaciones</h2>
          <p className="text-secondary">Seguimiento de tus comunicaciones</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={markAll}>
          Marcar todas como leidas
        </button>
      </div>

      <div className="pill-filters" style={{ marginBottom: 16 }}>
        {filters.map((item) => (
          <button
            key={item.value || "all"}
            type="button"
            className={`pill-filter ${filter === item.value ? "active" : ""}`}
            onClick={() => {
              setFilter(item.value);
              setPage(0);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid" style={{ gap: 12 }}>
        {loading ? (
          [...Array(5)].map((_, index) => <Skeleton key={index} height={52} width="100%" />)
        ) : items.length ? (
          items.map((item) => (
            <div key={item.id} className={`card ${item.read ? "" : ""}`} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
              <div className="ws-dot" style={{ background: item.read ? "#cbd5f3" : "var(--blue-primary)" }} />
              <div>
                <span className="text-secondary">{item.type || "Recordatorio"}</span>
                <p>{item.message || item.mensaje}</p>
                <span className="text-muted">{formatRelative(item.timestamp || item.fecha || item.createdAt)}</span>
              </div>
              {!item.read ? (
                <button type="button" className="btn btn-secondary" onClick={() => markAsRead(item)}>
                  Marcar leida
                </button>
              ) : null}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <strong>No hay notificaciones</strong>
            <span className="text-muted">Tus avisos apareceran aqui</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 12 }}>
        <button type="button" className="btn btn-secondary" onClick={() => setPage((prev) => Math.max(0, prev - 1))} disabled={page === 0}>
          Anterior
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))} disabled={page >= totalPages - 1}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Notifications;

