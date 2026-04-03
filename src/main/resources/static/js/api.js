const API_BASE = '';

async function request(method, url, body = null, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) headers['Authorization'] = `Bearer ${getToken()}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(API_BASE + url, options);
    const data = await res.json();
    return data;
}

function get(url, auth = true) {
    return request('GET', url, null, auth);
}

function post(url, body, auth = false) {
    return request('POST', url, body, auth);
}

function put(url, body, auth = true) {
    return request('PUT', url, body, auth);
}

function del(url, auth = true) {
    return request('DELETE', url, null, auth);
}

const Api = {
    auth: {
        login: (data) => post('/api/auth/login', data, false),
        register: (data) => post('/api/auth/register', data, false),
        me: () => get('/api/auth/me'),
        changePassword: (data) => put('/api/auth/change-password', data),
    },
    appointments: {
        getAll: (page = 0, size = 10, status = '') => {
            let url = `/api/patient/appointments?page=${page}&size=${size}`;
            if (status) url += `&status=${status}`;
            return get(url);
        },
        create: (doctorId, dateTime) =>
            post(`/api/patient/appointments?doctorId=${doctorId}&dateTime=${dateTime}`, null, true),
        cancel: (id) => del(`/api/patient/appointments/${id}`),
    },
    doctors: {
        getAvailable: (specialty = '', page = 0) => {
            let url = `/api/doctors/available?page=${page}&size=10`;
            if (specialty) url += `&specialty=${specialty}`;
            return get(url);
        },
    },
    notifications: {
        getAll: (page = 0, read = '') => {
            let url = `/api/patient/notifications?page=${page}&size=10`;
            if (read !== '') url += `&read=${read}`;
            return get(url);
        },
        markRead: (id) => put(`/api/patient/notifications/${id}/read`, {}),
    }
};