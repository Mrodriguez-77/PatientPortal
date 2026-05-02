import React, { useEffect, useState } from "react";
import NotificationItem from "../components/notifications/NotificationItem.jsx";
import Pagination from "../components/ui/Pagination.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import api, { normalize } from "../services/api.js";
import { useAuth } from "../services/auth.jsx";
import { useToast, TIPOS } from "../components/ui/Toast.jsx";
import { formatRelative } from "../utils/formatters.js";

const filtros = [
  { label: "Todas", value: "" },
  { label: "No leidas", value: "false" },
  { label: "Leidas", value: "true" },
];

const Notifications = () => {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);

  const load = async (page = pagina, read = filtro) => {
    setLoading(true);
    try {
      const readParam = read === "" ? "" : `&read=${read}`;
      const data = await api.get(`/api/patient/notifications?page=${page}&size=10${readParam}`, token);
      const normal = normalize(data);
      setNotificaciones(normal.list || []);
      setTotalPages(normal.total || 0);
    } catch (error) {
      pushToast({ tipo: TIPOS.error, titulo: "Error", mensaje: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [pagina, filtro]);

  const marcarLeida = async (notif) => {
    try {
      await api.put(`/api/patient/notifications/${notif.id}/read`, {}, token);
      load();
    } catch (error) {
      pushToast({ tipo: TIPOS.error, titulo: "Error", mensaje: error.message });
    }
  };

  const marcarTodas = async () => {
    try {
      await Promise.all(
        notificaciones.filter((notif) => !notif.read).map((notif) =>
          api.put(`/api/patient/notifications/${notif.id}/read`, {}, token)
        )
      );
      load();
    } catch (error) {
      pushToast({ tipo: TIPOS.error, titulo: "Error", mensaje: error.message });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Notificaciones</h2>
          <p className="text-secondary">Seguimiento de tus comunicaciones</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={marcarTodas}>
          Marcar todas como leidas
        </button>
      </div>

      <div className="pill-filters" style={{ marginBottom: 16 }}>
        {filtros.map((item) => (
          <button
            key={item.value || "all"}
            type="button"
            className={`pill-filter ${filtro === item.value ? "active" : ""}`}
            onClick={() => {
              setFiltro(item.value);
              setPagina(0);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid" style={{ gap: 12 }}>
        {loading ? (
          [...Array(5)].map((_, index) => <Skeleton key={index} height={52} width="100%" />)
        ) : notificaciones.length ? (
          notificaciones.map((notif) => (
            <NotificationItem
              key={notif.id}
              notificacion={{
                id: notif.id,
                tipo: notif.type || "Recordatorio",
                mensaje: notif.message || notif.mensaje,
                leida: notif.read || notif.leida,
                fechaRelativa: formatRelative(notif.timestamp || notif.fecha || notif.createdAt),
              }}
              onMark={marcarLeida}
            />
          ))
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 120 90" fill="none">
              <rect width="120" height="90" rx="12" fill="#eff6ff" />
              <path d="M30 48h60" stroke="#1e6fbf" strokeWidth="4" strokeLinecap="round" />
              <path d="M60 30v36" stroke="#1e6fbf" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <strong>No hay notificaciones</strong>
            <span className="text-muted">Tus avisos apareceran aqui</span>
          </div>
        )}
      </div>
      <Pagination currentPage={pagina} totalPages={totalPages} onChange={setPagina} />
    </div>
  );
};

export default Notifications;
