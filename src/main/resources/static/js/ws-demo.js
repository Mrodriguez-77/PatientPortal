let stompClient = null;
let pendingCount = 0;
let totalCount = 0;

function connect() {
    const patientId = document.getElementById('patientId').value;
    const token = document.getElementById('token').value;

    if (!patientId || !token) {
        alert('Por favor ingresa el Patient ID y el Token JWT');
        return;
    }

    if (parseInt(patientId) <= 0) {
        alert('El Patient ID debe ser un número positivo');
        return;
    }

    stompClient = new StompJs.Client({
        brokerURL: 'ws://localhost:8083/ws/websocket',
        connectHeaders: {
            Authorization: 'Bearer ' + token
        },
        reconnectDelay: 5000,
        onConnect: () => {
            setStatus(true);
            stompClient.subscribe(
                '/topic/patient/' + patientId + '/appointments',
                (message) => onMessage(JSON.parse(message.body))
            );
        },
        onDisconnect: () => setStatus(false),
        onStompError: (frame) => {
            console.error('Error STOMP:', frame);
            setStatus(false);
        }
    });

    stompClient.activate();
}

function disconnect() {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
    setStatus(false);
}

function onMessage(data) {
    document.getElementById('emptyMsg')?.remove();

    totalCount++;
    document.getElementById('totalCount').textContent = totalCount;

    if (data.newStatus === 'SCHEDULED' || data.newStatus === 'CONFIRMED') {
        pendingCount++;
    } else if (data.newStatus === 'CANCELLED' || data.newStatus === 'COMPLETED') {
        pendingCount = Math.max(0, pendingCount - 1);
    }
    document.getElementById('pendingCount').textContent = pendingCount;

    const li = document.createElement('li');

    if (data.newStatus === 'CANCELLED') {
        li.className = 'cancelled';
    } else if (data.newStatus === 'CONFIRMED') {
        li.className = 'confirmed';
    }

    const time = new Date().toLocaleTimeString();
    li.innerHTML = `<strong>${time}</strong> — Cita #${data.appointmentId} 
                    con Dr. ${data.doctorName}: 
                    <strong>${data.newStatus}</strong>`;

    const list = document.getElementById('messages');
    list.insertBefore(li, list.firstChild);
}

function setStatus(connected) {
    const label = document.getElementById('statusLabel');
    label.textContent = connected ? 'Conectado' : 'Desconectado';
    label.className = 'status ' + (connected ? 'connected' : 'disconnected');
    document.getElementById('btnConnect').disabled = connected;
    document.getElementById('btnDisconnect').disabled = !connected;
}
