document.addEventListener('DOMContentLoaded', () => {
    if (getToken()) window.location.href = '/pages/dashboard.html';
});

function showRegister() {
    document.getElementById('loginCard').classList.add('d-none');
    document.getElementById('registerCard').classList.remove('d-none');
}

function showLogin() {
    document.getElementById('registerCard').classList.add('d-none');
    document.getElementById('loginCard').classList.remove('d-none');
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showError('loginError', 'Completa todos los campos');
        return;
    }

    try {
        const data = await Api.auth.login({ email, password });
        if (data.success) {
            saveSession(data.data);
            window.location.href = '/pages/dashboard.html';
        } else {
            showError('loginError', data.message || 'Credenciales inválidas');
        }
    } catch (e) {
        showError('loginError', 'Error al conectar con el servidor');
    }
}

async function handleRegister() {
    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const birthDate = document.getElementById('regBirthDate').value;
    const phone = document.getElementById('regPhone').value;

    if (!fullName || !email || !password || !birthDate) {
        showError('registerError', 'Completa todos los campos obligatorios');
        return;
    }

    if (password.length < 8) {
        showError('registerError', 'La contraseña debe tener mínimo 8 caracteres');
        return;
    }

    try {
        const data = await Api.auth.register({ fullName, email, password, birthDate, phone });
        if (data.success) {
            saveSession(data.data);
            showSuccess('registerSuccess', 'Cuenta creada. Redirigiendo...');
            setTimeout(() => window.location.href = '/pages/dashboard.html', 1500);
        } else {
            showError('registerError', data.message || 'Error al registrar');
        }
    } catch (e) {
        showError('registerError', 'Error al conectar con el servidor');
    }
}