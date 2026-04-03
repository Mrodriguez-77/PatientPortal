let currentReadFilter = '';
let currentNotifPage = 0;

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    setNavbar();
    loadNotifications();
});

async function loadNotifications(page = 0) {
    currentNotifPage = page;
    try {
        const data = await Api.notifications.getAll(page, currentReadFilter);
        const el = document.getElementById('notificationsList');

        if (!data || !data.data || !data.data.content || data.data.content.length === 0) {
            el.innerHTML = '<div class="empty-state">No tienes notificaciones</div>';
            document.getElementById('paginationNotifications').innerHTML = '';
            return;
        }

        const unread = data.data.content.filter(n => !n.read).length;
        const badge = document.getElementById('notifBadge');
        if (badge && unread > 0) {
            badge.textContent = unread;
            badge.classList.remove('d-none');
        }

        el.innerHTML = data.data.content.map(n => {
            const typeMap = {
                APPOINTMENT_CONFIRMED: { label: 'Cita confirmada', cls: '' },
                APPOINTMENT_CANCELLED: { label: 'Cita cancelada', cls: 'cancelled' },
                APPOINTMENT_REMINDER: { label: 'Recordatorio', cls: '' }
            };
            const t = typeMap[n.type] || { label: n.type, cls: '' };
            const date = new Date(n.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            });

            return `
                <div class="notif-item ${!n.read ? 'unread' : ''} ${t.cls}"
                     id="notif-${n.id}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div style="font-weight:500;font-size:12px;color:#6366f1;margin-bottom:4px;">
                                ${t.label}
                            </div>
                            <div>${n.message}</div>
                            <div style="font-size:11px;color:#aaa;margin-top:4px;">${date}</div>
                        </div>
                        ${!n.read ? `
                            <button onclick="markRead(${n.id})"
                                    style="background:none;border:none;font-size:11px;color:#6366f1;cursor:pointer;white-space:nowrap;margin-left:12px;">
                                Marcar leída
                            </button>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        renderPaginationNotif(data.data.totalPages, page);

    } catch (e) {
        document.getElementById('notificationsList').innerHTML =
            '<div class="empty-state">Error al cargar notificaciones</div>';
    }
}

async function markRead(id) {
    try {
        await Api.notifications.markRead(id);
        loadNotifications(currentNotifPage);
    } catch (e) {
        console.error('Error al marcar notificación:', e);
    }
}

async function markAllRead() {
    try {
        const data = await Api.notifications.getAll(0, 'false');
        if (!data.data?.content) return;
        await Promise.all(data.data.content.map(n => Api.notifications.markRead(n.id)));
        loadNotifications(0);
    } catch (e) {
        console.error('Error al marcar todas:', e);
    }
}

function filterNotifications(read) {
    currentReadFilter = read;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    loadNotifications(0);
}

function renderPaginationNotif(totalPages, currentPage) {
    const el = document.getElementById('paginationNotifications');
    if (totalPages <= 1) { el.innerHTML = ''; return; }
    let html = '';
    for (let i = 0; i < totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}"
                         onclick="loadNotifications(${i})">${i + 1}</button>`;
    }
    el.innerHTML = html;
}