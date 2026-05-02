import React from "react";
import Avatar from "../ui/Avatar.jsx";

const DoctorCard = ({ medico, onAgendar }) => {
  return (
    <div className="card doctor-card">
      <div className="doctor-info">
        <Avatar nombre={medico.nombre} size="md" />
        <div>
          <h4>{medico.nombre}</h4>
          <p className="text-secondary">{medico.especialidad}</p>
          <span className="text-muted">Tarifa ${medico.tarifa}</span>
        </div>
      </div>
      <button type="button" className="btn btn-primary" onClick={() => onAgendar(medico)}>
        Agendar
      </button>
    </div>
  );
};

export default DoctorCard;
