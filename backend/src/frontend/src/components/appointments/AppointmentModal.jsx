import React, { useEffect } from "react";

const AppointmentModal = ({ medico, fechaHora, setFechaHora, onClose, onConfirmar, cargando }) => {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!medico) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h3>Agendar cita</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar modal">
            X
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-info">
            <div>
              <span className="label">Medico</span>
              <p>{medico.nombre}</p>
            </div>
            <div>
              <span className="label">Especialidad</span>
              <p>{medico.especialidad}</p>
            </div>
          </div>
          <label className="field">
            <span className="label">Fecha y hora</span>
            <input
              type="datetime-local"
              value={fechaHora}
              onChange={(event) => setFechaHora(event.target.value)}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirmar} disabled={!fechaHora || cargando}>
            {cargando ? (
              <span className="btn-loading">
                <span className="spinner" /> Cargando...
              </span>
            ) : (
              "Confirmar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
