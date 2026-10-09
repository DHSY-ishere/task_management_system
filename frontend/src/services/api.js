const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors || null; // field-level validation errors from the server
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Please check that the API is running.', 0);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // non-JSON response; handled below
  }

  if (!res.ok) {
    throw new ApiError(payload?.message || `Request failed (${res.status})`, res.status, payload?.errors);
  }
  return payload;
}

const toQueryString = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value);
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
};

export const taskApi = {
  /** @returns {Promise<{data: object[], meta: {total:number,page:number,limit:number,totalPages:number}}>} */
  list: (params = {}, signal) => request(`/tasks${toQueryString(params)}`, { signal }),
  get: (id) => request(`/tasks/${id}`).then((r) => r.data),
  create: (task) => request('/tasks', { method: 'POST', body: task }).then((r) => r.data),
  update: (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: task }).then((r) => r.data),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
