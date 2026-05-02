import React, { useEffect, useMemo, useState } from "react";
import StatCard from "../components/ui/StatCard.jsx";
import Badge from "../components/ui/Badge.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import { useAuth } from "../services/auth.jsx";
import api, { normalize } from "../services/api.js";
import useWebSocket from "../services/useWebSocket.js";
import { formatDate, formatDateTime } from "../utils/formatters.js";

const Dashboard = () => {
  const { paciente, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medicos, setMedicos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [error, setError] = useState("");
  const { messages, isConnected } = useWebSocket(paciente?.id, token);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        setError("");
        const [medicosData, citasData, notifData] = await Promise.all([
          api.get("/api/doctors/available?specialty=&page=0&size=3", token),
          api.get("/api/patient/appointments?page=0&size=3", token),
          api.get("/api/patient/notifications?page=0&size=3", token),
        ]);
        if (!active) return;
        setMedicos(normalize(medicosData).list || []);
        setCitas(normalize(citasData).list || []);
        setNotificaciones(normalize(notifData).list || []);
      } catch (err) {
        if (!active) return;
        setError(err.message || "No se pudo cargar el dashboard");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [token]);

  const stats = useMemo(() => {
    const total = citas.length;
    const confirmadas = citas.filter((cita) => cita.status === "CONFIRMED").length;
    const pendientes = citas.filter((cita) => cita.status === "SCHEDULED").length;
    const notiCount = notificaciones.length;
    return { total, confirmadas, pendientes, notiCount };
  }, [citas, notificaciones]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            Inicio / <strong>Dashboard</strong>
          </div>
          <h1>Hola, {paciente?.nombre || "Paciente"}</h1>
          <p className="text-secondary">{formatDate(new Date())}</p>
        </div>
      </div>

      {error ? (
        <div className="error-banner">
          <span>{error}</span>
          <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      ) : null}

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        {loading ? (
          [...Array(4)].map((_, index) => (
            <div className="stat-card" key={index}>
              <Skeleton height={10} width={80} />
              <Skeleton height={24} width={60} />
              <Skeleton height={10} width={50} />
            </div>
          ))
        ) : (
          <>
            <StatCard titulo="Citas totales" valor={stats.total} delta="+4%" accent="blue" />
            <StatCard titulo="Confirmadas" valor={stats.confirmadas} delta="+2%" accent="green" />
            <StatCard titulo="Pendientes" valor={stats.pendientes} delta="-1%" accent="orange" />
            <StatCard titulo="Notificaciones" valor={stats.notiCount} delta="+1%" accent="red" />
          </>
        )}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">Medicos disponibles</div>
          <div className="card-body">
            {loading ? (
              [...Array(3)].map((_, index) => (
                <div key={index} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <Skeleton height={40} width={40} radius={20} />
                  <div style={{ flex: 1 }}>
                    <Skeleton height={12} width={120} />
                    <Skeleton height={10} width={100} />
                  </div>
                </div>
              ))
            ) : medicos.length ? (
              medicos.slice(0, 3).map((medico) => (
                <div key={medico.id} className="doctor-info" style={{ marginBottom: 12 }}>
                  <Avatar nombre={medico.fullName || medico.nombre} size="md" />
                  <div>
                    <h4>{medico.fullName || medico.nombre}</h4>
                    <p className="text-secondary">{medico.specialty || medico.especialidad}</p>
                    <span className="text-muted">Tarifa ${medico.fee || medico.tarifa}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted">No hay medicos disponibles</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Proximas citas</div>
          <div className="card-body">
            {loading ? (
              [...Array(3)].map((_, index) => (
                <div key={index} style={{ marginBottom: 12 }}>
                  <Skeleton height={12} width={140} />
                  <Skeleton height={10} width={90} />
                </div>
              ))
            ) : citas.length ? (
              citas.slice(0, 3).map((cita) => (
                <div key={cita.id} style={{ marginBottom: 12 }}>
                  <strong>{cita.doctorName || cita.medicoNombre}</strong>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="text-muted">
                      {cita.dateTime || cita.fecha ? formatDateTime(cita.dateTime || cita.fecha) : "-"}
                    </span>
                    <Badge estado={cita.status || cita.estado}>{cita.status || cita.estado}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted">No hay citas proximas</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">Notificaciones recientes</div>
          <div className="card-body">
            {loading ? (
              [...Array(3)].map((_, index) => (
                <div key={index} style={{ marginBottom: 12 }}>
                  <Skeleton height={10} width={160} />
                  <Skeleton height={10} width={80} />
                </div>
              ))
            ) : notificaciones.length ? (
              notificaciones.slice(0, 3).map((notif) => (
                <div key={notif.id} style={{ marginBottom: 12 }}>
                  <strong>{notif.type || notif.tipo}</strong>
                  <p className="text-secondary">{notif.message || notif.mensaje}</p>
                  <span className="text-muted">
                    {notif.timestamp || notif.fecha ? formatDateTime(notif.timestamp || notif.fecha) : "-"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-muted">No hay notificaciones</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Tiempo real</div>
          <div className="card-body">
            <div className="ws-status" style={{ marginBottom: 12 }}>
              <span className={`ws-dot ${isConnected ? "connected" : ""}`} />
              <span className="text-secondary">{isConnected ? "Conectado" : "Desconectado"}</span>
            </div>
            {messages.length ? (
              messages.slice(0, 2).map((msg, index) => (
                <div key={index} style={{ marginBottom: 12 }}>
                  <strong>{msg.doctorName}</strong>
                  <p className="text-secondary">{msg.newStatus}</p>
                  <span className="text-muted">
                    {msg.timestamp ? formatDateTime(msg.timestamp) : "-"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-muted">Aun no hay eventos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
