import http from './http';

export const consultarSalas = () => http.get('/consulta/salas').then((r) => r.data);
export const consultarLaboratorios = () => http.get('/consulta/laboratorios').then((r) => r.data);
export const consultarProfessores = () => http.get('/consulta/professores').then((r) => r.data);
export const consultarEquipamentos = () => http.get('/consulta/equipamentos').then((r) => r.data);
export const consultarGrade = (params) => http.get('/consulta/grade', { params }).then((r) => r.data);
