let stompClientDashboard = null;

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    setNavbar();
    loadDashboard();
    connectDashboardWebSocket();
});

function connectDashboardWebSocket() {
    const patientId = getPatientId();
    const token = getToken();
    if (!patientId || !token) return;

    stompClientDashboard = new StompJs.Client({
        brokerURL: 'ws://localhost:8083/ws/websocket',
        connectHeaders: { Authorization: 'Bearer ' + token },
        reconnectDelay: 5000,
        onConnect: () => {
            stompClientDashboard.subscribe(
                '/topic/patient/' + patientId + '/appointments',
                () => {
                    // Recargar dashboard cuando hay actualización
                    loadNextAppointment();
                    loadLatestNotifications();
                }
            );
        },
        onStompError: (frame) => console.error('STOMP error dashboard:', frame)
    });

    stompClientDashboard.activate();
}

async function loadDashboard() {
    try {
        const profileData = await Api.auth.me();
        if (!profileData.success) { logout(); return; }
        const p = profileData.data;
        document.getElementById('welcomeName').textContent =
            p.fullName.split(' ')[0];
        loadNextAppointment();
        loadLatestNotifications();
        loadSpecialties();
    } catch (e) {
        console.error('Error cargando dashboard:', e);
    }
}

async function loadNextAppointment() {
    try {
        const data = await Api.appointments.getAll(0, 10);
        const el = document.getElementById('nextAppointment');

        let content = [];
        if (data?.data?.content) content = data.data.content;
        else if (Array.isArray(data?.data)) content = data.data;

        document.getElementById('statTotal').textContent =
            data?.data?.totalElements || content.length || '0';

        const confirmed = content.filter(a => a.status === 'CONFIRMED').length;
        document.getElementById('statConfirmed').textContent = confirmed;

        const active = content.find(a =>
            a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
        );

        if (!active) {
            el.innerHTML = '<div class="empty-state">No tienes citas próximas</div>';
            return;
        }

        const statusMap = {
            CONFIRMED: 'badge-confirmed',
            SCHEDULED: 'badge-scheduled'
        };
        const date = active.dateTime
            ? new Date(active.dateTime).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short',
                hour: '2-digit', minute: '2-digit'
            })
            : '—';

        el.innerHTML = `
            <div class="d-flex align-items-center gap-3 mb-2">
                <div class="avatar-circle" style="width:40px;height:40px;font-size:13px;">
                    ${active.doctor?.name?.charAt(0) || 'D'}
                </div>
                <div>
                    <div style="font-size:14px;font-weight:500;">
                        ${active.doctor?.name || '—'}
                    </div>
                    <div style="font-size:12px;color:#888;">
                        ${active.doctor?.specialty || '—'}
                    </div>
                </div>
            </div>
            <div style="font-size:13px;color:#555;margin-bottom:8px;">
                📅 ${date}
            </div>
            <span class="badge ${statusMap[active.status] || ''}"
                  style="font-size:11px;">
                ${active.status === 'CONFIRMED' ? 'Confirmada' : 'Agendada'}
            </span>
        `;
    } catch (e) {
        document.getElementById('nextAppointment').innerHTML =
            '<div class="empty-state">No disponible</div>';
        document.getElementById('statTotal').textContent = '—';
        document.getElementById('statConfirmed').textContent = '—';
    }
}

async function loadLatestNotifications() {
    try {
        const data = await Api.notifications.getAll(0);
        const el = document.getElementById('latestNotifications');

        let content = [];
        if (data?.data?.content) content = data.data.content;

        const unread = content.filter(n => !n.read).length;
        document.getElementById('statNotif').textContent = unread;

        const badge = document.getElementById('notifBadge');
        if (badge) {
            if (unread > 0) {
                badge.textContent = unread;
                badge.classList.remove('d-none');
            } else {
                badge.classList.add('d-none');
            }
        }

        if (content.length === 0) {
            el.innerHTML = '<div class="empty-state">Sin notificaciones recientes</div>';
            return;
        }

        el.innerHTML = content.slice(0, 3).map(n => `
            <div class="notif-item ${!n.read ? 'unread' : ''}
                 ${n.type === 'APPOINTMENT_CANCELLED' ? 'cancelled' : ''}">
                ${n.message}
                <div style="font-size:11px;color:#aaa;margin-top:4px;">
                    ${new Date(n.createdAt).toLocaleDateString('es-ES')}
                </div>
            </div>
        `).join('');

    } catch (e) {
        document.getElementById('latestNotifications').innerHTML =
            '<div class="empty-state">No disponible</div>';
        document.getElementById('statNotif').textContent = '—';
    }
}

async function loadSpecialties() {
    try {
        const data = await Api.doctors.getAvailable();
        const el = document.getElementById('specialties');

        let doctors = [];
        if (data?.data?.content) doctors = data.data.content;
        else if (Array.isArray(data?.data)) doctors = data.data;
        else if (Array.isArray(data)) doctors = data;

        if (doctors.length === 0) {
            el.innerHTML =
                '<div class="empty-state w-100">No hay especialidades disponibles</div>';
            return;
        }

        const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))];
        el.innerHTML = specialties.map(s => `
            <a href="/pages/appointments.html?specialty=${encodeURIComponent(s)}"
               class="btn-outline-portal">${s}</a>
        `).join('');

    } catch (e) {
        document.getElementById('specialties').innerHTML =
            '<div class="empty-state w-100">No disponible</div>';
    }
}