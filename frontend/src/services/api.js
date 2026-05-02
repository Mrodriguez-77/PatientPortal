const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const buildError = async (response) => {
  const payload = await parseJson(response);
  const message = payload?.message || payload?.error || "Ocurrio un error inesperado";
  const error = new Error(message);
  error.status = response.status;
  error.data = payload;
  return error;
};

const request = async (url, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw await buildError(response);
  }
  const payload = await parseJson(response);
  if (payload?.success === false) {
    throw new Error(payload?.message || "Ocurrio un error inesperado");
  }
  return payload;
};

export const api = {
  get: (url, token) =>
    request(url, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  post: (url, body, token) =>
    request(url, {
      method: "POST",
      body: JSON.stringify(body || {}),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  put: (url, body, token) =>
    request(url, {
      method: "PUT",
      body: JSON.stringify(body || {}),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  del: (url, token) =>
    request(url, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
};

export const normalizeList = (response) => {
  if (Array.isArray(response?.data)) {
    return { list: response.data, total: 0 };
  }
  if (response?.data?.content) {
    return { list: response.data.content, total: response.data.totalPages || 0 };
  }
  if (Array.isArray(response)) {
    return { list: response, total: 0 };
  }
  return { list: [], total: 0 };
};

