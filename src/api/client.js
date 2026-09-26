import axios from 'axios';

/**
 * Single HTTP client. The backend keeps the login in a session cookie and expects the
 * XSRF-TOKEN cookie echoed in the X-XSRF-TOKEN header (axios does this for same-origin calls).
 */
const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

/** Normalised error thrown by every API call: { status, message, errors }. */
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

const listeners = new Set();

/** Lets the auth layer react when the session expires (401 on a normal request). */
export function onSessionExpired(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function toApiError(error) {
  if (!error.response) {
    return new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }
  const { status, data } = error.response;
  const message = data?.message || 'Something went wrong. Please try again.';
  return new ApiError(status, message, data?.errors);
}

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const apiError = toApiError(error);
    const isAuthCall = error.config?.url?.startsWith('/auth/');
    if (apiError.status === 401 && !isAuthCall) listeners.forEach((listener) => listener());
    return Promise.reject(apiError);
  },
);

export default client;
