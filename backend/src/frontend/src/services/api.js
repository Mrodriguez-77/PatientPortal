const apiFetch = async (url, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const respuesta = await fetch(url, { ...options, headers });
  const data = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok || data?.success === false) {
    const mensaje = data?.message || "Ocurrio un error inesperado";
    const error = new Error(mensaje);
    error.status = respuesta.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const normalize = (data) => {
  if (Array.isArray(data?.data)) return { list: data.data, total: 0 };
  if (data?.data?.content)
    return { list: data.data.content, total: data.data.totalPages };
  if (Array.isArray(data)) return { list: data, total: 0 };
  return { list: [], total: 0 };
};

export const api = {
  get: (url, token) =>
    apiFetch(url, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  post: (url, body, token) =>
    apiFetch(url, {
      method: "POST",
      body: JSON.stringify(body || {}),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  put: (url, body, token) =>
    apiFetch(url, {
      method: "PUT",
      body: JSON.stringify(body || {}),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  del: (url, token) =>
    apiFetch(url, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
};

export default api;
