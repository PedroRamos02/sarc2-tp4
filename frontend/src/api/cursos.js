import http from './http';

export const listarCursos = (params) => http.get('/cursos', { params }).then((r) => r.data);
export const buscarCurso = (id) => http.get(`/cursos/${id}`).then((r) => r.data);
export const criarCurso = (payload) => http.post('/cursos', payload).then((r) => r.data);
export const atualizarCurso = (id, payload) => http.put(`/cursos/${id}`, payload).then((r) => r.data);
export const alterarStatusCurso = (id, ativo) => http.patch(`/cursos/${id}/status`, { ativo }).then((r) => r.data);
export const removerCurso = (id) => http.delete(`/cursos/${id}`).then((r) => r.data);
