import React, { useEffect, useMemo, useState } from "react";
import { api, normalizeList, normalizeDoctor, normalizeAppointment } from "../services/api.js";
import { useAuth } from "../services/auth.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import { formatDateTime } from "../utils/formatters.js";

const statusFilters = [
  { label: "Todas", value: "" },
  { label: "Agendadas", value: "SCHEDULED" },
  { label: "Confirmadas", value: "CONFIRMED" },
  { label: "Completadas", value: "COMPLETED" },
  { label: "Canceladas", value: "CANCELLED" },
];

const Appointments = () => {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const [tab, setTab] = useState("doctors");
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [dateTime, setDateTime] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const response = await api.get(`/api/doctors/available?specialty=${search}&page=0&size=10`, token);
      setDoctors((normalizeList(response).list || []).map(normalizeDoctor));
    } catch (error) {
      pushToast({ type: "error", title: "Error", message: error.message });
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAppointments = async (nextPage = page, nextStatus = statusFilter) => {
    setLoadingAppointments(true);
    try {
      const filter = nextStatus ? `&status=${nextStatus}` : "";
      const response = await api.get(`/api/patient/appointments?page=${nextPage}&size=10${filter}`, token);
      const normalized = normalizeList(response);
      setAppointments((normalized.list || []).map(normalizeAppointment));
      setTotalPages(normalized.total || 0);
    } catch (error) {
      pushToast({ type: "error", title: "Error", message: error.message });
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchDoctors, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchAppointments(page, statusFilter);
  }, [page, statusFilter]);

  const filteredDoctors = useMemo(() => {
    if (!search) return doctors;
    return doctors.filter((doctor) =>
      (doctor.fullName || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [doctors, search]);

  const scheduleAppointment = async () => {
    if (!selectedDoctor) return;
    try {
      await api.post(`/api/patient/appointments?doctorId=${selectedDoctor.id}&dateTime=${dateTime}`, {}, token);
      pushToast({ type: "success", title: "Cita creada", message: "La cita fue agendada" });
      setSelectedDoctor(null);
      setDateTime("");
      fetchAppointments();
    } catch (error) {
      pushToast({ type: "error", title: "Error", message: error.message });
    }
  };

  const cancelAppointment = async (appointment) => {
    try {
      await api.del(`/api/patient/appointments/${appointment.id}`, token);
      pushToast({ type: "success", title: "Cancelada", message: "La cita fue cancelada" });
      fetchAppointments();
    } catch (error) {
      pushToast({ type: "error", title: "Error", message: error.message });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Citas</h2>
        <div className="tabs">
          <button type="button" className={`tab-btn ${tab === "doctors" ? "active" : ""}`} onClick={() => setTab("doctors")}>
            Medicos disponibles
          </button>
          <button type="button" className={`tab-btn ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
            Historial de citas
          </button>
        </div>
      </div>

      {tab === "doctors" ? (
        <div>
          <div style={{ marginBottom: 16 }}>
            <input
              placeholder="Buscar especialidad o medico"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="grid grid-3">
            {loadingDoctors ? (
              [...Array(6)].map((_, index) => (
                <div key={index} className="card">
                  <Skeleton height={40} width={40} radius={20} />
                  <Skeleton height={12} width={120} />
                  <Skeleton height={10} width={80} />
                </div>
              ))
            ) : filteredDoctors.length ? (
              filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4>{doctor.fullName}</h4>
                    <p className="text-secondary">{doctor.specialty}</p>
                    <span className="text-muted">Tarifa ${doctor.fee}</span>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => setSelectedDoctor(doctor)}>
                    Agendar
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <strong>No hay medicos disponibles</strong>
                <span className="text-muted">Prueba con otra especialidad</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="pill-filters" style={{ marginBottom: 12 }}>
            {statusFilters.map((filter) => (
              <button
                key={filter.value || "all"}
                type="button"
                className={`pill-filter ${statusFilter === filter.value ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setPage(0);
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="card">
            <div className="card-body" style={{ paddingTop: 0 }}>
              {loadingAppointments ? (
                [...Array(4)].map((_, index) => <Skeleton key={index} height={16} width="100%" />)
              ) : appointments.length ? (
                <div className="table-scroll">
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
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{appointment.doctorName}</td>
                          <td>{appointment.specialty}</td>
                          <td>{formatDateTime(appointment.dateTime)}</td>
                          <td>
                            <Badge variant={appointment.status === "CONFIRMED" ? "success" : "info"}>
                              {appointment.status}
                            </Badge>
                          </td>
                          <td>
                            {(["SCHEDULED", "CONFIRMED"].includes(appointment.status)) ? (
                              <button type="button" className="btn btn-danger" onClick={() => cancelAppointment(appointment)}>
                                Cancelar
                              </button>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <strong>No tienes citas aun</strong>
                  <button type="button" className="btn btn-primary" onClick={() => setTab("doctors")}>
                    Agendar primera cita
                  </button>
                </div>
              )}
            </div>
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
      )}

      {selectedDoctor ? (
        <Modal
          title="Agendar cita"
          onClose={() => setSelectedDoctor(null)}
          actions={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedDoctor(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={scheduleAppointment} disabled={!dateTime}>
                Confirmar
              </button>
            </>
          }
        >
          <div className="field">
            <span className="label">Medico</span>
            <p>{selectedDoctor.fullName}</p>
          </div>
          <div className="field">
            <span className="label">Especialidad</span>
            <p>{selectedDoctor.specialty}</p>
          </div>
          <label className="field">
            <span className="label">Fecha y hora</span>
            <input type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} />
          </label>
        </Modal>
      ) : null}
    </div>
  );
};

export default Appointments;

