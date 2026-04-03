let allDoctors = [];
let selectedDoctor = null;
let currentStatusFilter = '';
let currentPage = 0;

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    setNavbar();
    loadDoctors();

    const params = new URLSearchParams(window.location.search);
    const specialty = params.get('specialty');
    if (specialty) {
        showTab('doctors');
        document.getElementById('specialtyFilter').value = specialty;
        setTimeout(() => filterDoctors(), 300);
    }
});

function showTab(tab) {
    const isDoctors = tab === 'doctors';
    document.getElementById('panelDoctors').classList.toggle('d-none', !isDoctors);
    document.getElementById('panelHistory').classList.toggle('d-none', isDoctors);
    document.getElementById('tabDoctors').classList.toggle('active', isDoctors);
    document.getElementById('tabHistory').classList.toggle('active', !isDoctors);
    if (!isDoctors) loadAppointments();
}

async function loadDoctors() {
    try {
        const data = await Api.doctors.getAvailable();
        const el = document.getElementById('doctorsList');

        if (!data || !data.data || !data.data.content || data.data.content.length === 0) {
            el.innerHTML = '<div class="col-12"><div class="empty-state">No hay médicos disponibles</div></div>';
            return;
        }

        allDoctors = data.data.content;
        renderDoctors(allDoctors);

    } catch (e) {
        document.getElementById('doctorsList').innerHTML =
            '<div class="col-12"><div class="empty-state">Error al cargar médicos. Verifica que Grupo A esté disponible.</div></div>';
    }
}

function renderDoctors(doctors) {
    const el = document.getElementById('doctorsList');
    if (doctors.length === 0) {
        el.innerHTML = '<div class="col-12"><div class="empty-state">No se encontraron médicos</div></div>';
        return;
    }

    el.innerHTML = doctors.map(d => `
        <div class="col-md-4 col-sm-6">
            <div class="doctor-card">
                <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="avatar-circle" style="width:36px;height:36px;font-size:13px;">
                        ${d.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                        <div style="font-size:13px;font-weight:500;">${d.name || '—'}</div>
                    </div>
                </div>
                <span class="doctor-specialty">${d.specialty || '—'}</span>
                <div class="doctor-fee mb-3">
                    Tarifa: $${d.consultationFee || '—'}
                </div>
                <button class="btn custom-btn text-white w-100"
                        style="padding:7px;font-size:12px;"
                        onclick="openModal(${JSON.stringify(d).replace(/"/g, '&quot;')})">
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

function openModal(doctor) {
    selectedDoctor = doctor;
    document.getElementById('modalDoctorInfo').innerHTML = `
        <div style="font-weight:500;">${doctor.name}</div>
        <div style="color:#888;">${doctor.specialty} · $${doctor.consultationFee}</div>
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
        if (data.success) {
            document.getElementById('modalSuccess').textContent = 'Cita agendada exitosamente';
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

async function loadAppointments(page = 0) {
    currentPage = page;
    try {
        const data = await Api.appointments.getAll(page, 10, currentStatusFilter);
        const el = document.getElementById('appointmentsList');

        if (!data || !data.data || !data.data.content || data.data.content.length === 0) {
            el.innerHTML = '<div class="empty-state">No tienes citas registradas</div>';
            document.getElementById('paginationAppointments').innerHTML = '';
            return;
        }

        el.innerHTML = data.data.content.map(a => {
            const statusMap = {
                SCHEDULED: { label: 'Agendada', cls: 'badge-scheduled' },
                CONFIRMED: { label: 'Confirmada', cls: 'badge-confirmed' },
                COMPLETED: { label: 'Completada', cls: 'badge-completed' },
                CANCELLED: { label: 'Cancelada', cls: 'badge-cancelled' },
                IN_PROGRESS: { label: 'En progreso', cls: 'badge-in-progress' }
            };
            const s = statusMap[a.status] || { label: a.status, cls: '' };
            const date = new Date(a.dateTime).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            return `
                <div class="appointment-row">
                    <div class="d-flex align-items-center gap-3">
                        <div class="avatar-circle" style="width:36px;height:36px;font-size:12px;">
                            ${a.doctor?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                            <div style="font-weight:500;">${a.doctor?.name || '—'}</div>
                            <div style="color:#888;font-size:12px;">${a.doctor?.specialty || '—'} · ${date}</div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge ${s.cls}" style="font-size:11px;">${s.label}</span>
                        ${a.status === 'SCHEDULED' || a.status === 'CONFIRMED' ? `
                            <button class="btn btn-sm"
                                    style="font-size:11px;color:#e53935;border:1px solid #ffcdd2;border-radius:6px;"
                                    onclick="cancelAppointment(${a.id})">
                                Cancelar
                            </button>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        renderPagination(
            'paginationAppointments',
            data.data.totalPages,
            page,
            loadAppointments
        );

    } catch (e) {
        document.getElementById('appointmentsList').innerHTML =
            '<div class="empty-state">Error al cargar citas</div>';
    }
}

async function cancelAppointment(id) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;
    try {
        const data = await Api.appointments.cancel(id);
        if (data.success) loadAppointments(currentPage);
    } catch (e) {
        alert('Error al cancelar la cita');
    }
}

function filterByStatus(status) {
    currentStatusFilter = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    loadAppointments(0);
}

function renderPagination(containerId, totalPages, currentPage, callback) {
    const el = document.getElementById(containerId);
    if (totalPages <= 1) { el.innerHTML = ''; return; }
    let html = '';
    for (let i = 0; i < totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}"
                         onclick="${callback.name}(${i})">${i + 1}</button>`;
    }
    el.innerHTML = html;
}