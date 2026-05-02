import React, { useMemo, useState } from "react";
import useWebSocket from "../services/useWebSocket.js";
import { useAuth } from "../services/auth.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import { formatDateTime } from "../utils/formatters.js";

const WsDemo = () => {
  const { paciente, token } = useAuth();
  const { messages, isConnected } = useWebSocket(paciente?.id, token);
  const [manual, setManual] = useState(messages);

  const stats = useMemo(() => {
    const pendientes = manual.filter((msg) => msg.newStatus === "SCHEDULED").length;
    return { total: manual.length, pendientes };
  }, [manual]);

  const agregarEvento = () => {
    setManual(messages);
  };

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
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={agregarEvento}>
            Conectar
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setManual([])}>
            Desconectar
          </button>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">Log de conexion</div>
          <div className="card-body">
            <div className="log-box">
              <div className="log-line">Estado: {isConnected ? "Conectado" : "Desconectado"}</div>
              {manual.map((msg, index) => (
                <div key={index} className="log-line">
                  {msg.timestamp ? formatDateTime(msg.timestamp) : "-"} - {msg.doctorName} {msg.newStatus}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid" style={{ gap: 12 }}>
          <StatCard titulo="Actualizaciones" valor={stats.total} accent="blue" />
          <StatCard titulo="Citas pendientes" valor={stats.pendientes} accent="orange" />
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Eventos recibidos</span>
          <button type="button" className="btn btn-secondary" onClick={() => setManual([])}>
            Limpiar
          </button>
        </div>
        <div className="card-body">
          {manual.length ? (
            manual.map((msg, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                <strong>{msg.doctorName}</strong>
                <p className="text-secondary">{msg.newStatus}</p>
                <span className="text-muted">
                  {msg.timestamp ? formatDateTime(msg.timestamp) : "-"}
                </span>
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
