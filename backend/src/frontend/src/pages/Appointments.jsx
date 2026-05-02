import React, { useEffect, useMemo, useState } from "react";
import DoctorCard from "../components/appointments/DoctorCard.jsx";
import AppointmentModal from "../components/appointments/AppointmentModal.jsx";
import AppointmentRow from "../components/appointments/AppointmentRow.jsx";
import Pagination from "../components/ui/Pagination.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import api, { normalize } from "../services/api.js";
import { useAuth } from "../services/auth.jsx";
import useWebSocket from "../services/useWebSocket.js";
import { useToast, TIPOS } from "../components/ui/Toast.jsx";
import { formatDateTime } from "../utils/formatters.js";

const estados = [
  { label: "Todas", value: "" },
  { label: "Agendadas", value: "SCHEDULED" },
  { label: "Confirmadas", value: "CONFIRMED" },
  { label: "Completadas", value: "COMPLETED" },
  { label: "Canceladas", value: "CANCELLED" },
];

const Appointments = () => {
  const { token, paciente } = useAuth();
  const { pushToast } = useToast();
  const { messages } = useWebSocket(paciente?.id, token);
  const [tab, setTab] = useState("medicos");
  const [busqueda, setBusqueda] = useState("");
  const [medicos, setMedicos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [errorMedicos, setErrorMedicos] = useState("");
  const [errorCitas, setErrorCitas] = useState("");
  const [modalMedico, setModalMedico] = useState(null);
  const [fechaHora, setFechaHora] = useState("");
  const [agendando, setAgendando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [pagina, setPagina] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadMedicos = async () => {
    setLoadingMedicos(true);
    setErrorMedicos("");
    try {
      const data = await api.get(`/api/doctors/available?specialty=${busqueda}&page=0&size=10`, token);
      setMedicos(normalize(data).list || []);
    } catch (error) {
      setErrorMedicos(error.message);
      pushToast({ tipo: TIPOS.error, titulo: "Error", mensaje: error.message });
    } finally {
      setLoadingMedicos(false);
    }
  };

  const loadCitas = async (page = pagina, estado = filtroEstado) => {
    setLoadingCitas(true);
    setErrorCitas("");
    try {
      const estadoParam = estado ? `&status=${estado}` : "";
      const data = await api.get(`/api/patient/appointments?page=${page}&size=10${estadoParam}`, token);
      const normal = normalize(data);
      setCitas(normal.list || []);
      setTotalPages(normal.total || 0);
    } catch (error) {
      setErrorCitas(error.message);
      pushToast({ tipo: TIPOS.error, titulo: "Error", mensaje: error.message });
    } finally {
      setLoadingCitas(false);
    }
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      loadMedicos();
    }, 400);
    return () => clearTimeout(handle);
  }, [busqueda]);

  useEffect(() => {
    loadCitas(pagina, filtroEstado);
  }, [pagina, filtroEstado]);

  useEffect(() => {
    if (messages.length) {
      pushToast({
        tipo: TIPOS.info,
        titulo: "Actualizacion",
        mensaje: "Se actualizo el estado de una cita",
      });
      loadCitas();
    }
  }, [messages]);

  const handleAgendar = async () => {
    if (!modalMedico) return;
    setAgendando(true);
    try {
      await api.post(`/api/patient/appointments?doctorId=${modalMedico.id}&dateTime=${fechaHora}`, {}, token);
      pushToast({ tipo: TIPOS.success, titulo: "Cita creada", mensaje: "La cita fue agendada" });
      setModalMedico(null);
      setFechaHora("");
      loadCitas();
    } catch (error) {
      pushToast({ tipo: TIPOS.error, titulo: "Error", mensaje: error.message });
    } finally {
      setAgendando(false);
    }
  };

  const handleCancelar = async (cita) => {
    try {
      await api.del(`/api/patient/appointments/${cita.id}`, token);
      pushToast({ tipo: TIPOS.success, titulo: "Cancelada", mensaje: "La cita fue cancelada" });
      loadCitas();
    } catch (error) {
      pushToast({ tipo: TIPOS.error, titulo: "Error", mensaje: error.message });
    }
  };

  const medicosFiltrados = useMemo(() => {
    if (!busqueda) return medicos;
    return medicos.filter((medico) =>
      (medico.fullName || medico.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [medicos, busqueda]);

  return (
    <div>
      <div className="page-header">
        <h2>Citas</h2>
        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${tab === "medicos" ? "active" : ""}`}
            onClick={() => setTab("medicos")}
          >
            Medicos disponibles
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === "historial" ? "active" : ""}`}
            onClick={() => setTab("historial")}
          >
            Historial de citas
          </button>
        </div>
      </div>

      {tab === "medicos" ? (
        <div>
          <div className="search-input" style={{ marginBottom: 16 }}>
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              placeholder="Buscar especialidad o medico"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>
          {errorMedicos ? (
            <div className="error-banner">
              <span>{errorMedicos}</span>
              <button type="button" className="btn btn-secondary" onClick={loadMedicos}>
                Reintentar
              </button>
            </div>
          ) : null}
          <div className="grid grid-3">
            {loadingMedicos ? (
              [...Array(6)].map((_, index) => (
                <div className="card" key={index}>
                  <Skeleton height={40} width={40} radius={20} />
                  <Skeleton height={12} width={120} />
                  <Skeleton height={10} width={80} />
                </div>
              ))
            ) : medicosFiltrados.length ? (
              medicosFiltrados.map((medico) => (
                <DoctorCard
                  key={medico.id}
                  medico={{
                    id: medico.id,
                    nombre: medico.fullName || medico.nombre,
                    especialidad: medico.specialty || medico.especialidad,
                    tarifa: medico.fee || medico.tarifa,
                  }}
                  onAgendar={setModalMedico}
                />
              ))
            ) : (
              <div className="empty-state">
                <svg viewBox="0 0 120 90" fill="none">
                  <rect width="120" height="90" rx="12" fill="#eff6ff" />
                  <path d="M30 48h60" stroke="#1e6fbf" strokeWidth="4" strokeLinecap="round" />
                  <path d="M60 30v36" stroke="#1e6fbf" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <strong>No hay medicos disponibles</strong>
                <span className="text-muted">Prueba con otra especialidad</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="pill-filters" style={{ marginBottom: 12 }}>
            {estados.map((estado) => (
              <button
                key={estado.value || "all"}
                type="button"
                className={`pill-filter ${filtroEstado === estado.value ? "active" : ""}`}
                onClick={() => {
                  setFiltroEstado(estado.value);
                  setPagina(0);
                }}
              >
                {estado.label}
              </button>
            ))}
          </div>
          {errorCitas ? (
            <div className="error-banner">
              <span>{errorCitas}</span>
              <button type="button" className="btn btn-secondary" onClick={() => loadCitas()}>
                Reintentar
              </button>
            </div>
          ) : null}
          <div className="card">
            <div className="card-body" style={{ paddingTop: 0 }}>
              {loadingCitas ? (
                [...Array(4)].map((_, index) => (
                  <Skeleton key={index} height={16} width="100%" />
                ))
              ) : citas.length ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Especialidad</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citas.map((cita) => (
                      <AppointmentRow
                        key={cita.id}
                        cita={{
                          id: cita.id,
                          medicoNombre: cita.doctorName || cita.medicoNombre,
                          especialidad: cita.specialty || cita.especialidad,
                          fecha: cita.dateTime || cita.fecha ? formatDateTime(cita.dateTime || cita.fecha) : "-",
                          estado: cita.status || cita.estado,
                          estadoLabel: cita.status || cita.estado,
                          puedeCancelar: ["SCHEDULED", "CONFIRMED"].includes(cita.status || cita.estado),
                        }}
                        onCancelar={handleCancelar}
                      />
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <svg viewBox="0 0 120 90" fill="none">
                    <rect width="120" height="90" rx="12" fill="#eff6ff" />
                    <path d="M30 48h60" stroke="#1e6fbf" strokeWidth="4" strokeLinecap="round" />
                    <path d="M60 30v36" stroke="#1e6fbf" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  <strong>No tienes citas aun</strong>
                  <button type="button" className="btn btn-primary" onClick={() => setTab("medicos")}
                  >
                    Agendar primera cita
                  </button>
                </div>
              )}
            </div>
          </div>
          <Pagination currentPage={pagina} totalPages={totalPages} onChange={setPagina} />
        </div>
      )}

      <AppointmentModal
        medico={modalMedico}
        fechaHora={fechaHora}
        setFechaHora={setFechaHora}
        onClose={() => setModalMedico(null)}
        onConfirmar={handleAgendar}
        cargando={agendando}
      />
    </div>
  );
};

export default Appointments;
