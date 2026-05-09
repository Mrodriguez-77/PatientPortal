import React, { useMemo } from "react";
import { useAuth } from "../services/auth.jsx";
import { useWebSocket } from "../services/useWebSocket.js";
import StatCard from "../components/ui/StatCard.jsx";
import { formatDateTime } from "../utils/formatters.js";

const WsDemo = () => {
  const { patient, token } = useAuth();
  const { messages, isConnected } = useWebSocket(patient?.id, token);

  const stats = useMemo(() => {
    const pending = messages.filter((item) => item.newStatus === "SCHEDULED").length;
    return { total: messages.length, pending };
  }, [messages]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Tiempo real</h2>
          <div className="ws-status">
            <span className={`ws-dot ${isConnected ? "connected" : ""}`} />
            <span className="text-secondary">{isConnected ? "Conectado" : "Desconectado"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">Log de conexion</div>
          <div className="card-body">
            <div className="log-box">
              <div className="log-line">Estado: {isConnected ? "Conectado" : "Desconectado"}</div>
              {messages.map((item, index) => (
                <div key={index} className="log-line">
                  {formatDateTime(item.timestamp)} - {item.doctorName || "Doctor"} {item.newStatus}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid" style={{ gap: 12 }}>
          <StatCard label="Actualizaciones" value={stats.total} accent="blue" />
          <StatCard label="Citas pendientes" value={stats.pending} accent="orange" />
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Eventos recibidos</span>
        </div>
        <div className="card-body">
          {messages.length ? (
            messages.map((item, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                <strong>{item.doctorName || "Doctor"}</strong>
                <p className="text-secondary">{item.newStatus}</p>
                <span className="text-muted">{formatDateTime(item.timestamp)}</span>
              </div>
            ))
          ) : (
            <div className="text-muted">Sin eventos recientes</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WsDemo;

