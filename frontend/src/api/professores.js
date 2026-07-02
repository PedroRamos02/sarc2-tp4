import http from './http';

export const listarProfessores = (params) => http.get('/professores', { params }).then((r) => r.data);
export const buscarProfessor = (id) => http.get(`/professores/${id}`).then((r) => r.data);
export const criarProfessor = (payload) => http.post('/professores', payload).then((r) => r.data);
export const atualizarProfessor = (id, payload) => http.put(`/professores/${id}`, payload).then((r) => r.data);
export const alterarStatusProfessor = (id, ativo) =>
  http.patch(`/professores/${id}/status`, { ativo }).then((r) => r.data);
export const removerProfessor = (id) => http.delete(`/professores/${id}`).then((r) => r.data);
