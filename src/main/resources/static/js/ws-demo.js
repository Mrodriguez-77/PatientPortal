let stompClient = null;
let countUpdates = 0;
let countPending = 0;

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    setNavbar();
    connectWS();
});

function connectWS() {
    const patientId = getPatientId();
    const token = getToken();
    if (!patientId || !token) return;

    addLog('Conectando a WebSocket...');

    stompClient = new StompJs.Client({
        brokerURL: 'ws://localhost:8083/ws/websocket',
        connectHeaders: { Authorization: 'Bearer ' + token },
        reconnectDelay: 5000,
        onConnect: () => {
            setStatus(true);
            addLog('✅ Conectado exitosamente');
            stompClient.subscribe(
                '/topic/patient/' + patientId + '/appointments',
                (message) => onMessage(JSON.parse(message.body))
            );
            addLog('📡 Suscrito a /topic/patient/' + patientId + '/appointments');
        },
        onDisconnect: () => {
            setStatus(false);
            addLog('❌ Desconectado');
        },
        onStompError: (frame) => {
            setStatus(false);
            addLog('⚠️ Error: ' + frame.headers?.message);
        }
    });

    stompClient.activate();
}

function disconnectWS() {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
    setStatus(false);
}

function onMessage(data) {
    addLog('📨 Mensaje recibido: ' + JSON.stringify(data));

    countUpdates++;
    document.getElementById('countUpdates').textContent = countUpdates;

    if (data.newStatus === 'SCHEDULED' || data.newStatus === 'CONFIRMED') {
        countPending++;
    } else if (data.newStatus === 'CANCELLED' || data.newStatus === 'COMPLETED') {
        countPending = Math.max(0, countPending - 1);
    }
    document.getElementById('countPending').textContent = countPending;

    const el = document.getElementById('messagesList');
    const empty = el.querySelector('.empty-state');
    if (empty) empty.remove();

    const statusMap = {
        CONFIRMED:   { label: 'Confirmada',  cls: 'badge-confirmed' },
        CANCELLED:   { label: 'Cancelada',   cls: 'badge-cancelled' },
        COMPLETED:   { label: 'Completada',  cls: 'badge-completed' },
        SCHEDULED:   { label: 'Agendada',    cls: 'badge-scheduled' },
        IN_PROGRESS: { label: 'En progreso', cls: 'badge-in-progress' }
    };
    const s = statusMap[data.newStatus] || { label: data.newStatus, cls: '' };
    const time = new Date().toLocaleTimeString('es-ES');

    const item = document.createElement('div');
    item.className = 'notif-item' +
        (data.newStatus === 'CANCELLED' ? ' cancelled' : '');
    item.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <div style="font-weight:500;font-size:13px;">
                    Cita #${data.appointmentId}
                    con ${data.doctorName || '—'}
                </div>
                <div style="font-size:12px;color:#888;margin-top:2px;">
                    Estado actualizado a
                    <span class="badge ${s.cls}"
                          style="font-size:11px;">${s.label}</span>
                </div>
            </div>
            <span style="font-size:11px;color:#aaa;white-space:nowrap;
                         margin-left:12px;">${time}</span>
        </div>
    `;

    el.insertBefore(item, el.firstChild);
}

function setStatus(connected) {
    const dot = document.getElementById('statusDot');
    const label = document.getElementById('statusLabel');
    const btnConnect = document.getElementById('btnConnect');
    const btnDisconnect = document.getElementById('btnDisconnect');

    dot.style.background = connected ? '#2e7d32' : '#e53935';
    label.textContent = connected ? 'Conectado' : 'Desconectado';
    label.style.color = connected ? '#2e7d32' : '#e53935';
    btnConnect.disabled = connected;
    btnDisconnect.disabled = !connected;
}

function addLog(message) {
    const log = document.getElementById('wsLog');
    const time = new Date().toLocaleTimeString('es-ES');
    log.innerHTML = `[${time}] ${message}\n` + log.innerHTML;
}

function clearLog() {
    document.getElementById('messagesList').innerHTML =
        '<div class="empty-state">Sin actualizaciones aún.</div>';
    document.getElementById('wsLog').innerHTML = 'Log limpiado.';
    countUpdates = 0;
    countPending = 0;
    document.getElementById('countUpdates').textContent = '0';
    document.getElementById('countPending').textContent = '0';
}