import React, { useEffect, useMemo, useState } from "react";
import { api, normalizeList } from "../services/api.js";
import { useAuth } from "../services/auth.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import Badge from "../components/ui/Badge.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import { formatDate, formatDateTime } from "../utils/formatters.js";
import { useWebSocket } from "../services/useWebSocket.js";

const Dashboard = () => {
  const { token, patient } = useAuth();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { messages, isConnected } = useWebSocket(patient?.id, token);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [doctorsRes, appointmentsRes, notificationsRes] = await Promise.all([
          api.get("/api/doctors/available?specialty=&page=0&size=3", token),
          api.get("/api/patient/appointments?page=0&size=3", token),
          api.get("/api/patient/notifications?page=0&size=3", token),
        ]);
        if (!active) return;
        setDoctors(normalizeList(doctorsRes).list || []);
        setAppointments(normalizeList(appointmentsRes).list || []);
        setNotifications(normalizeList(notificationsRes).list || []);
      } catch (err) {
        if (!active) return;
        setError(err.message || "No se pudo cargar el dashboard");
        pushToast({ type: "error", title: "Error", message: err.message });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [token, pushToast]);

  const metrics = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((item) => (item.status || item.estado) === "CONFIRMED").length;
    const scheduled = appointments.filter((item) => (item.status || item.estado) === "SCHEDULED").length;
    return {
      total,
      confirmed,
      scheduled,
      notifications: notifications.length,
    };
  }, [appointments, notifications]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="text-muted">Inicio / Dashboard</div>
          <h1>Hola, {patient?.name || "Paciente"}</h1>
          <p className="text-secondary">{formatDate(new Date())}</p>
        </div>
      </div>

      {error ? (
        <div className="card" style={{ marginBottom: 16, borderColor: "#fecaca" }}>
          <div className="text-secondary">{error}</div>
        </div>
      ) : null}

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        {loading ? (
          [...Array(4)].map((_, index) => (
            <div key={index} className="stat-card">
              <Skeleton height={10} width={80} />
              <Skeleton height={24} width={60} />
              <Skeleton height={10} width={50} />
            </div>
          ))
        ) : (
          <>
            <StatCard label="Citas totales" value={metrics.total} delta="+4%" accent="blue" />
            <StatCard label="Confirmadas" value={metrics.confirmed} delta="+2%" accent="green" />
            <StatCard label="Pendientes" value={metrics.scheduled} delta="-1%" accent="orange" />
            <StatCard label="Notificaciones" value={metrics.notifications} delta="+1%" accent="red" />
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
            ) : doctors.length ? (
              doctors.slice(0, 3).map((doctor) => (
                <div key={doctor.id} className="doctor-info" style={{ marginBottom: 12 }}>
                  <Avatar name={doctor.fullName || doctor.nombre} size="md" />
                  <div>
                    <h4>{doctor.fullName || doctor.nombre}</h4>
                    <p className="text-secondary">{doctor.specialty || doctor.especialidad}</p>
                    <span className="text-muted">Tarifa ${doctor.fee || doctor.tarifa}</span>
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
            ) : appointments.length ? (
              appointments.slice(0, 3).map((item) => (
                <div key={item.id} style={{ marginBottom: 12 }}>
                  <strong>{item.doctorName || item.medicoNombre}</strong>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="text-muted">{formatDateTime(item.dateTime || item.fecha)}</span>
                    <Badge variant={item.status === "CONFIRMED" ? "success" : "info"}>
                      {item.status || item.estado}
                    </Badge>
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
            ) : notifications.length ? (
              notifications.slice(0, 3).map((item) => (
                <div key={item.id} style={{ marginBottom: 12 }}>
                  <strong>{item.type || item.tipo}</strong>
                  <p className="text-secondary">{item.message || item.mensaje}</p>
                  <span className="text-muted">{formatDateTime(item.timestamp || item.fecha)}</span>
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
              messages.slice(0, 2).map((item, index) => (
                <div key={index} style={{ marginBottom: 12 }}>
                  <strong>{item.doctorName || "Actualizacion"}</strong>
                  <p className="text-secondary">{item.newStatus || "Actualizado"}</p>
                  <span className="text-muted">{formatDateTime(item.timestamp)}</span>
                </div>
              ))
            ) : (
              <div className="text-muted">Sin eventos recientes</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

