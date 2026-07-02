import http from './http';

export const listarEquipamentos = (params) => http.get('/equipamentos', { params }).then((r) => r.data);
export const buscarEquipamento = (id) => http.get(`/equipamentos/${id}`).then((r) => r.data);
export const criarEquipamento = (payload) => http.post('/equipamentos', payload).then((r) => r.data);
export const atualizarEquipamento = (id, payload) => http.put(`/equipamentos/${id}`, payload).then((r) => r.data);
export const alterarStatusEquipamento = (id, ativo) =>
  http.patch(`/equipamentos/${id}/status`, { ativo }).then((r) => r.data);
export const alterarDisponibilidadeEquipamento = (id, disponivel) =>
  http.patch(`/equipamentos/${id}/disponibilidade`, { disponivel }).then((r) => r.data);
export const removerEquipamento = (id) => http.delete(`/equipamentos/${id}`).then((r) => r.data);
