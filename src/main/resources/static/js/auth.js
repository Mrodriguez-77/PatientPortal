function getToken() {
    return localStorage.getItem('token');
}

function getPatientId() {
    return localStorage.getItem('patientId');
}

function getPatientName() {
    return localStorage.getItem('patientName');
}

function saveSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('patientId', data.patientId);
    localStorage.setItem('patientName', data.fullName);
    localStorage.setItem('patientEmail', data.email);
}

function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientName');
    localStorage.removeItem('patientEmail');
}

function requireAuth() {
    if (!getToken()) {
        window.location.href = '/pages/index.html';
        return false;
    }
    return true;
}

function logout() {
    clearSession();
    window.location.href = '/pages/index.html';
}

function showError(divId, message) {
    const div = document.getElementById(divId);
    if (div) {
        div.textContent = message;
        div.classList.remove('d-none');
    }
}

function hideMessage(divId) {
    const div = document.getElementById(divId);
    if (div) div.classList.add('d-none');
}

function showSuccess(divId, message) {
    const div = document.getElementById(divId);
    if (div) {
        div.textContent = message;
        div.classList.remove('d-none');
    }
}

function setNavbar() {
    const nameEl = document.getElementById('navPatientName');
    if (nameEl) nameEl.textContent = getPatientName() || '';
}

function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('open');
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

function setNavbar() {
    const name = getPatientName() || '';
    const email = localStorage.getItem('patientEmail') || '';

    const navName = document.getElementById('navPatientName');
    const dropName = document.getElementById('dropdownName');
    const dropEmail = document.getElementById('dropdownEmail');

    if (navName) navName.textContent = name + ' ▾';
    if (dropName) dropName.textContent = name;
    if (dropEmail) dropEmail.textContent = email;
}