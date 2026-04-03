document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    setNavbar();
    loadDashboard();
});

async function loadDashboard() {
    try {
        const profileData = await Api.auth.me();
        if (!profileData.success) { logout(); return; }

        const p = profileData.data;
        document.getElementById('welcomeName').textContent = p.fullName.split(' ')[0];

        loadNextAppointment();
        loadLatestNotifications();
        loadSpecialties();

        document.getElementById('statTotal').textContent = '—';
        document.getElementById('statConfirmed').textContent = '—';
        document.getElementById('statNotif').textContent = '—';

    } catch (e) {
        console.error('Error cargando dashboard:', e);
    }
}

async function loadNextAppointment() {
    try {
        const data = await Api.appointments.getAll(0, 5);
        const el = document.getElementById('nextAppointment');

        if (!data || !data.data || !data.data.content || data.data.content.length === 0) {
            el.innerHTML = '<div class="empty-state">No tienes citas próximas</div>';
            return;
        }

        const active = data.data.content.find(a =>
            a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
        );

        if (!active) {
            el.innerHTML = '<div class="empty-state">No tienes citas próximas</div>';
            return;
        }

        const statusClass = active.status === 'CONFIRMED' ? 'badge-confirmed' : 'badge-scheduled';
        const statusLabel = active.status === 'CONFIRMED' ? 'Confirmada' : 'Agendada';
        const date = new Date(active.dateTime).toLocaleDateString('es-ES', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        el.innerHTML = `
            <div class="d-flex align-items-center gap-3 mb-2">
                <div class="avatar-circle" style="width:40px;height:40px;font-size:13px;">
                    ${active.doctor?.name?.charAt(0) || 'D'}
                </div>
                <div>
                    <div style="font-size:14px;font-weight:500;">${active.doctor?.name || '—'}</div>
                    <div style="font-size:12px;color:#888;">${active.doctor?.specialty || '—'}</div>
                </div>
            </div>
            <div style="font-size:13px;color:#555;margin-bottom:8px;">
                📅 ${date}
            </div>
            <span class="badge ${statusClass}" style="font-size:11px;">${statusLabel}</span>
        `;

        document.getElementById('statTotal').textContent = data.data.totalElements || '—';
        const confirmed = data.data.content.filter(a => a.status === 'CONFIRMED').length;
        document.getElementById('statConfirmed').textContent = confirmed;

    } catch (e) {
        document.getElementById('nextAppointment').innerHTML =
            '<div class="empty-state">No disponible</div>';
    }
}

async function loadLatestNotifications() {
    try {
        const data = await Api.notifications.getAll(0);
        const el = document.getElementById('latestNotifications');

        if (!data || !data.data || !data.data.content || data.data.content.length === 0) {
            el.innerHTML = '<div class="empty-state">Sin notificaciones recientes</div>';
            return;
        }

        const latest = data.data.content.slice(0, 3);
        const unread = data.data.content.filter(n => !n.read).length;

        if (unread > 0) {
            const badge = document.getElementById('notifBadge');
            if (badge) {
                badge.textContent = unread;
                badge.classList.remove('d-none');
            }
            document.getElementById('statNotif').textContent = unread;
        } else {
            document.getElementById('statNotif').textContent = '0';
        }

        el.innerHTML = latest.map(n => `
            <div class="notif-item ${!n.read ? 'unread' : ''} ${n.type === 'APPOINTMENT_CANCELLED' ? 'cancelled' : ''}">
                ${n.message}
                <div style="font-size:11px;color:#aaa;margin-top:4px;">
                    ${new Date(n.createdAt).toLocaleDateString('es-ES')}
                </div>
            </div>
        `).join('');

    } catch (e) {
        document.getElementById('latestNotifications').innerHTML =
            '<div class="empty-state">No disponible</div>';
    }
}

async function loadSpecialties() {
    try {
        const data = await Api.doctors.getAvailable();
        const el = document.getElementById('specialties');

        if (!data || !data.data || !data.data.content || data.data.content.length === 0) {
            el.innerHTML = '<div class="empty-state w-100">No hay especialidades disponibles</div>';
            return;
        }

        const specialties = [...new Set(data.data.content.map(d => d.specialty))];

        el.innerHTML = specialties.map(s => `
            <a href="/pages/appointments.html?specialty=${s}"
               class="btn-outline-portal">
                ${s}
            </a>
        `).join('');

    } catch (e) {
        document.getElementById('specialties').innerHTML =
            '<div class="empty-state w-100">No disponible</div>';
    }
}