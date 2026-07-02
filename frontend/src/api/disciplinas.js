import http from './http';

export const listarDisciplinas = (params) => http.get('/disciplinas', { params }).then((r) => r.data);
export const buscarDisciplina = (id) => http.get(`/disciplinas/${id}`).then((r) => r.data);
export const criarDisciplina = (payload) => http.post('/disciplinas', payload).then((r) => r.data);
export const atualizarDisciplina = (id, payload) => http.put(`/disciplinas/${id}`, payload).then((r) => r.data);
export const alterarStatusDisciplina = (id, ativo) =>
  http.patch(`/disciplinas/${id}/status`, { ativo }).then((r) => r.data);
export const removerDisciplina = (id) => http.delete(`/disciplinas/${id}`).then((r) => r.data);
