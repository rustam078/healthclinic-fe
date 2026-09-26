import client from './client';

/** Drops empty filter values so URLs stay clean. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
}

/**
 * Standard REST resource matching the backend's BaseCrudController.
 * Every call resolves to the `data` part of the ApiResponse envelope.
 */
export function createResource(path) {
  const unwrap = (promise) => promise.then((body) => body.data);
  return {
    key: path,
    list: (params) => unwrap(client.get(`/${path}`, { params: cleanParams(params) })),
    get: (id) => unwrap(client.get(`/${path}/${id}`)),
    create: (body) => unwrap(client.post(`/${path}`, body)),
    update: (id, body) => unwrap(client.put(`/${path}/${id}`, body)),
    remove: (id) => unwrap(client.delete(`/${path}/${id}`)),
    status: (id, status, reason) => unwrap(client.patch(`/${path}/${id}/status`, { status, reason })),
    post: (id, action, body) => unwrap(client.post(`/${path}/${id}/${action}`, body)),
    report: (params) => unwrap(client.get(`/${path}/report`, { params: cleanParams(params) })),
  };
}
