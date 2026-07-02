import http from './http';

export const listarEspacos = (params) => http.get('/espacos', { params }).then((r) => r.data);
export const buscarEspaco = (id) => http.get(`/espacos/${id}`).then((r) => r.data);
export const criarEspaco = (payload) => http.post('/espacos', payload).then((r) => r.data);
export const atualizarEspaco = (id, payload) => http.put(`/espacos/${id}`, payload).then((r) => r.data);
export const alterarStatusEspaco = (id, ativo) => http.patch(`/espacos/${id}/status`, { ativo }).then((r) => r.data);
export const removerEspaco = (id) => http.delete(`/espacos/${id}`).then((r) => r.data);
