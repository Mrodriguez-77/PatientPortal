let allDoctors = [];
let selectedDoctor = null;
let currentStatusFilter = '';
let currentPage = 0;
let stompClient = null;

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    setNavbar();
    loadDoctors();
    connectWebSocket();

    const params = new URLSearchParams(window.location.search);
    const specialty = params.get('specialty');
    if (specialty) {
        showTab('doctors');
        document.getElementById('specialtyFilter').value = specialty;
        setTimeout(() => filterDoctors(), 300);
    }
});

// ─── WebSocket ───────────────────────────────────────────────────

function connectWebSocket() {
    const patientId = getPatientId();
    const token = getToken();
    if (!patientId || !token) return;

    stompClient = new StompJs.Client({
        brokerURL: 'ws://localhost:8083/ws/websocket',
        connectHeaders: { Authorization: 'Bearer ' + token },
        reconnectDelay: 5000,
        onConnect: () => {
            console.log('WebSocket conectado');
            stompClient.subscribe(
                '/topic/patient/' + patientId + '/appointments',
                (message) => handleRealtimeUpdate(JSON.parse(message.body))
            );
        },
        onDisconnect: () => console.log('WebSocket desconectado'),
        onStompError: (frame) => console.error('STOMP error:', frame)
    });

    stompClient.activate();
}

function handleRealtimeUpdate(data) {
    console.log('Actualización en tiempo real:', data);

    showToast(getToastType(data.newStatus),
        'Cita #' + data.appointmentId +
        ' con ' + data.doctorName +
        ': ' + translateStatus(data.newStatus));

    // Si estamos viendo el historial, recargar
    const historyPanel = document.getElementById('panelHistory');
    if (historyPanel && !historyPanel.classList.contains('d-none')) {
        loadAppointments(currentPage);
    }

    // Actualizar contador en navbar si existe
    updateNotifBadge();
}

function getToastType(status) {
    const map = {
        CONFIRMED: 'success',
        CANCELLED: 'danger',
        COMPLETED: 'secondary',
        IN_PROGRESS: 'warning',
        SCHEDULED: 'info'
    };
    return map[status] || 'info';
}

function showToast(type, message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
        document.body.appendChild(container);
    }

    const colors = {
        success: '#2e7d32', danger: '#c62828',
        warning: '#e65100', info: '#6366f1', secondary: '#555'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: white;
        border-left: 4px solid ${colors[type] || '#6366f1'};
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 13px;
        color: #333;
        box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        max-width: 320px;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function updateNotifBadge() {
    Api.notifications.getAll(0, 'false')
        .then(data => {
            const badge = document.getElementById('notifBadge');
            if (badge && data.data?.content) {
                const count = data.data.content.length;
                if (count > 0) {
                    badge.textContent = count;
                    badge.classList.remove('d-none');
                } else {
                    badge.classList.add('d-none');
                }
            }
        }).catch(() => {});
}

// ─── Tabs ────────────────────────────────────────────────────────

function showTab(tab) {
    const isDoctors = tab === 'doctors';
    document.getElementById('panelDoctors').classList.toggle('d-none', !isDoctors);
    document.getElementById('panelHistory').classList.toggle('d-none', isDoctors);
    document.getElementById('tabDoctors').classList.toggle('active', isDoctors);
    document.getElementById('tabHistory').classList.toggle('active', !isDoctors);
    if (!isDoctors) loadAppointments();
}

// ─── Médicos ─────────────────────────────────────────────────────

async function loadDoctors() {
    try {
        const data = await Api.doctors.getAvailable();
        const el = document.getElementById('doctorsList');

        let list = [];
        if (Array.isArray(data)) {
            list = data;
        } else if (data?.data?.content) {
            list = data.data.content;
        } else if (data?.data && Array.isArray(data.data)) {
            list = data.data;
        }

        allDoctors = list;
        renderDoctors(allDoctors);
    } catch (e) {
        document.getElementById('doctorsList').innerHTML =
            '<div class="col-12"><div class="empty-state">Error al cargar médicos. Verifica conexión con Grupo A.</div></div>';
    }
}

function renderDoctors(doctors) {
    const el = document.getElementById('doctorsList');
    if (!doctors || doctors.length === 0) {
        el.innerHTML = '<div class="col-12"><div class="empty-state">No hay médicos disponibles</div></div>';
        return;
    }

    el.innerHTML = doctors.map(d => `
        <div class="col-md-4 col-sm-6">
            <div class="doctor-card">
                <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="avatar-circle" style="width:36px;height:36px;font-size:13px;">
                        ${d.name?.charAt(0) || 'D'}
                    </div>
                    <div style="font-size:13px;font-weight:500;">${d.name || '—'}</div>
                </div>
                <span class="doctor-specialty">${d.specialty || '—'}</span>
                <div class="doctor-fee mb-3">Tarifa: $${d.consultationFee || '—'}</div>
                <button class="btn custom-btn text-white w-100"
                    style="padding:7px;font-size:12px;"
                    onclick='openModal(${JSON.stringify(d).replace(/'/g, "&#39;")})'>
                    Agendar cita
                </button>
            </div>
        </div>
    `).join('');
}

function filterDoctors() {
    const filter = document.getElementById('specialtyFilter').value.toLowerCase();
    const filtered = allDoctors.filter(d =>
        d.specialty?.toLowerCase().includes(filter) ||
        d.name?.toLowerCase().includes(filter)
    );
    renderDoctors(filtered);
}

// ─── Modal agendar cita ──────────────────────────────────────────

function openModal(doctor) {
    selectedDoctor = doctor;
    document.getElementById('modalDoctorInfo').innerHTML = `
        <div style="font-weight:500;">${doctor.name}</div>
        <div style="color:#888;font-size:12px;">${doctor.specialty} · $${doctor.consultationFee}</div>
    `;
    document.getElementById('appointmentDateTime').value = '';
    document.getElementById('modalError').classList.add('d-none');
    document.getElementById('modalSuccess').classList.add('d-none');
    document.getElementById('modalOverlay').classList.remove('d-none');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('d-none');
    selectedDoctor = null;
}

async function confirmAppointment() {
    const dateTime = document.getElementById('appointmentDateTime').value;
    if (!dateTime) {
        showError('modalError', 'Selecciona una fecha y hora');
        return;
    }

    try {
        const data = await Api.appointments.create(selectedDoctor.id, dateTime);
        if (data.success || data.data) {
            document.getElementById('modalSuccess').textContent =
                '¡Cita agendada exitosamente!';
            document.getElementById('modalSuccess').classList.remove('d-none');
            document.getElementById('modalError').classList.add('d-none');
            setTimeout(() => closeModal(), 2000);
        } else {
            showError('modalError', data.message || 'Error al agendar cita');
        }
    } catch (e) {
        showError('modalError', 'Error al conectar con el servidor');
    }
}

// ─── Historial de citas ──────────────────────────────────────────

async function loadAppointments(page = 0) {
    currentPage = page;
    const el = document.getElementById('appointmentsList');
    el.innerHTML = '<div class="empty-state">Cargando...</div>';

    try {
        const data = await Api.appointments.getAll(page, 10, currentStatusFilter);

        let content = [];
        let totalPages = 0;

        if (data?.data?.content) {
            content = data.data.content;
            totalPages = data.data.totalPages || 0;
        } else if (Array.isArray(data?.data)) {
            content = data.data;
        }

        if (content.length === 0) {
            el.innerHTML = '<div class="empty-state">No tienes citas registradas</div>';
            document.getElementById('paginationAppointments').innerHTML = '';
            return;
        }

        el.innerHTML = content.map(a => {
            const statusMap = {
                SCHEDULED:   { label: 'Agendada',    cls: 'badge-scheduled' },
                CONFIRMED:   { label: 'Confirmada',  cls: 'badge-confirmed' },
                COMPLETED:   { label: 'Completada',  cls: 'badge-completed' },
                CANCELLED:   { label: 'Cancelada',   cls: 'badge-cancelled' },
                IN_PROGRESS: { label: 'En progreso', cls: 'badge-in-progress' }
            };
            const s = statusMap[a.status] || { label: a.status, cls: '' };
            const date = a.dateTime
                ? new Date(a.dateTime).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'short',
                    year: 'numeric', hour: '2-digit', minute: '2-digit'
                })
                : '—';

            const canCancel = a.status === 'SCHEDULED' || a.status === 'CONFIRMED';

            return `
                <div class="appointment-row" data-appointment-id="${a.id}">
                    <div class="d-flex align-items-center gap-3">
                        <div class="avatar-circle" style="width:36px;height:36px;font-size:12px;">
                            ${a.doctor?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                            <div style="font-weight:500;font-size:13px;">
                                ${a.doctor?.name || '—'}
                            </div>
                            <div style="color:#888;font-size:12px;">
                                ${a.doctor?.specialty || '—'} · ${date}
                            </div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge ${s.cls} appointment-status-badge"
                              style="font-size:11px;">${s.label}</span>
                        ${canCancel ? `
                            <button class="btn btn-sm"
                                style="font-size:11px;color:#e53935;
                                       border:1px solid #ffcdd2;border-radius:6px;"
                                onclick="cancelAppointment(${a.id})">
                                Cancelar
                            </button>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        renderPagination('paginationAppointments', totalPages, page, loadAppointments);

    } catch (e) {
        el.innerHTML = '<div class="empty-state">Error al cargar citas</div>';
    }
}

async function cancelAppointment(id) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;
    try {
        const data = await Api.appointments.cancel(id);
        if (data.success || data.data) {
            showToast('success', 'Cita cancelada exitosamente');
            loadAppointments(currentPage);
        } else {
            showToast('danger', data.message || 'Error al cancelar');
        }
    } catch (e) {
        showToast('danger', 'Error al cancelar la cita');
    }
}

function filterByStatus(status) {
    currentStatusFilter = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    loadAppointments(0);
}

function translateStatus(status) {
    const map = {
        SCHEDULED: 'Agendada', CONFIRMED: 'Confirmada',
        COMPLETED: 'Completada', CANCELLED: 'Cancelada',
        IN_PROGRESS: 'En progreso'
    };
    return map[status] || status;
}

function renderPagination(containerId, totalPages, currentPage, callback) {
    const el = document.getElementById(containerId);
    if (!el || totalPages <= 1) {
        if (el) el.innerHTML = '';
        return;
    }
    let html = '';
    for (let i = 0; i < totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}"
                     onclick="${callback.name}(${i})">${i + 1}</button>`;
    }
    el.innerHTML = html;
}