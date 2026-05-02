import React from "react";
import Badge from "../ui/Badge.jsx";

const AppointmentRow = ({ cita, onCancelar }) => {
  return (
    <tr>
      <td>{cita.medicoNombre}</td>
      <td>{cita.especialidad}</td>
      <td>{cita.fecha}</td>
      <td>
        <Badge estado={cita.estado}>{cita.estadoLabel}</Badge>
      </td>
      <td>
        {cita.puedeCancelar ? (
          <button type="button" className="btn btn-danger" onClick={() => onCancelar(cita)}>
            Cancelar
          </button>
        ) : (
          <span className="text-muted">-</span>
        )}
      </td>
    </tr>
  );
};

export default AppointmentRow;
