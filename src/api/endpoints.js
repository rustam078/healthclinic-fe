import client from './client';
import { cleanParams, createResource } from './resource';

/** The response's data; null when there is none (the server leaves out empty fields, e.g. no doctor yet). */
const data = (promise) => promise.then((body) => body.data ?? null);

export const patientsApi = createResource('patients');
export const doctorsApi = { ...createResource('doctors'), clinic: () => data(client.get('/doctors/clinic')) };
export const roomsApi = createResource('rooms');
export const bedsApi = createResource('beds');
export const appointmentsApi = {
  ...createResource('appointments'),
  preview: (params) => data(client.get('/appointments/preview', { params: cleanParams(params) })),
  requestDelete: (id) => client.post(`/appointments/${id}/delete-request`),
};
export const deleteRequestsApi = createResource('appointment-delete-requests');
export const prescriptionApi = {
  get: (appointmentId) => data(client.get(`/appointments/${appointmentId}/prescription`)),
  save: (appointmentId, body) => data(client.put(`/appointments/${appointmentId}/prescription`, body)),
  complete: (appointmentId, body) => data(client.post(`/appointments/${appointmentId}/prescription/complete`, body)),
};
export const ipdApi = createResource('ipd');
export const usersApi = createResource('users');

export const activityApi = {
  key: 'activity',
  list: (params) => data(client.get('/activity', { params: cleanParams(params) })),
};

export const authApi = {
  me: () => data(client.get('/auth/me')),
  login: (credentials) => data(client.post('/auth/login', credentials)),
  logout: () => client.post('/auth/logout'),
};

export const settingsApi = {
  key: 'settings',
  get: () => data(client.get('/settings')),
  update: (body) => data(client.put('/settings', body)),
  uploadLogo: (file) => {
    const form = new FormData();
    form.append('file', file);
    return data(client.post('/settings/logo', form));
  },
  removeLogo: () => data(client.delete('/settings/logo')),
};

export const templatesApi = {
  key: 'templates',
  list: () => data(client.get('/templates')),
  get: (type) => data(client.get(`/templates/${type}`)),
  update: (type, body) => data(client.put(`/templates/${type}`, body)),
  reset: (type) => data(client.post(`/templates/${type}/reset`)),
};

export const permissionsApi = {
  key: 'permissions',
  list: () => data(client.get('/permissions')),
  update: (changes) => data(client.put('/permissions', changes)),
  actions: () => data(client.get('/permissions/actions')),
  updateActions: (changes) => data(client.put('/permissions/actions', changes)),
};

export const dashboardApi = {
  key: 'dashboard',
  get: (params) => data(client.get('/dashboard', { params: cleanParams(params) })),
};
