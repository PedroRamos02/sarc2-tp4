import http from './http';

export const listarReservas = (params) => http.get('/reservas', { params }).then((r) => r.data);
export const buscarReserva = (id) => http.get(`/reservas/${id}`).then((r) => r.data);
export const criarReserva = (payload) => http.post('/reservas', payload).then((r) => r.data);
export const atualizarReserva = (id, payload) => http.put(`/reservas/${id}`, payload).then((r) => r.data);
export const cancelarReserva = (id) => http.patch(`/reservas/${id}/cancelar`).then((r) => r.data);
export const verificarDisponibilidade = (params) =>
  http.get('/reservas/disponibilidade', { params }).then((r) => r.data);
