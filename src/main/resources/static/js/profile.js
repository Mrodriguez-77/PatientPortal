document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    setNavbar();
    loadProfile();
    scrollToHash();
});

function scrollToHash() {
    if (window.location.hash === '#cambiar-password') {
        setTimeout(() => {
            const el = document.getElementById('cambiar-password');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }
}

async function loadProfile() {
    try {
        const data = await Api.auth.me();
        if (!data.success) { logout(); return; }

        const p = data.data;
        const initials = p.fullName.split(' ')
            .map(n => n[0]).join('').substring(0, 2).toUpperCase();

        document.getElementById('avatarInitials').textContent = initials;
        document.getElementById('profileName').textContent = p.fullName;
        document.getElementById('profileEmail').textContent = p.email;
        document.getElementById('profilePhone').textContent = p.phone || '—';
        document.getElementById('profileBirth').textContent = p.birthDate || '—';
        document.getElementById('profileRole').textContent = p.role;
        document.getElementById('profileCreated').textContent =
            new Date(p.createdAt).toLocaleDateString('es-ES');

    } catch (e) {
        console.error('Error cargando perfil:', e);
    }
}

async function handleChangePassword() {
    const currentPw = document.getElementById('currentPw').value;
    const newPw = document.getElementById('newPw').value;
    const confirmPw = document.getElementById('confirmPw').value;

    hideMessage('pwError');
    hideMessage('pwSuccess');

    if (!currentPw || !newPw || !confirmPw) {
        showError('pwError', 'Completa todos los campos');
        return;
    }
    if (newPw.length < 8) {
        showError('pwError', 'La nueva contraseña debe tener mínimo 8 caracteres');
        return;
    }
    if (newPw !== confirmPw) {
        showError('pwError', 'Las contraseñas nuevas no coinciden');
        return;
    }

    try {
        const data = await Api.auth.changePassword({
            currentPassword: currentPw,
            newPassword: newPw
        });

        if (data.success) {
            showSuccess('pwSuccess', 'Contraseña actualizada exitosamente');
            document.getElementById('currentPw').value = '';
            document.getElementById('newPw').value = '';
            document.getElementById('confirmPw').value = '';
        } else {
            showError('pwError', data.message || 'Error al cambiar contraseña');
        }
    } catch (e) {
        showError('pwError', 'Error al conectar con el servidor');
    }
}