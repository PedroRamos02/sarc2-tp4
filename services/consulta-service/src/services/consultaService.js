const { getProfessor, getSala, getEquipamento, getReserva } = require('../clients');

function toMapaPorId(lista) {
  return new Map((lista || []).map((item) => [item.id, item]));
}

async function listarSalas() {
  return getSala('/espacos', { tipo: 'SALA', ativo: true });
}

async function listarLaboratorios() {
  return getSala('/espacos', { tipo: 'LABORATORIO', ativo: true });
}

async function listarProfessores() {
  return getProfessor('/professores', { ativo: true });
}

async function listarEquipamentos() {
  return getEquipamento('/equipamentos', { ativo: true });
}

/**
 * Monta a grade pública de horários: busca as reservas ativas no
 * reserva-service e enriquece com nome de professor, espaço, disciplina,
 * curso e equipamentos, buscando cada lista de referência uma única vez
 * (evita N+1 chamadas por reserva).
 */
async function montarGrade(filtros) {
  const [reservas, professores, espacos, disciplinas, cursos, equipamentos] = await Promise.all([
    getReserva('/reservas/grade', filtros),
    getProfessor('/professores'),
    getSala('/espacos'),
    getProfessor('/disciplinas'),
    getProfessor('/cursos'),
    getEquipamento('/equipamentos'),
  ]);

  const professoresPorId = toMapaPorId(professores);
  const espacosPorId = toMapaPorId(espacos);
  const disciplinasPorId = toMapaPorId(disciplinas);
  const cursosPorId = toMapaPorId(cursos);
  const equipamentosPorId = toMapaPorId(equipamentos);

  return (reservas || []).map((reserva) => {
    const professor = professoresPorId.get(reserva.professorId);
    const espaco = espacosPorId.get(reserva.espacoId);
    const disciplina = reserva.disciplinaId ? disciplinasPorId.get(reserva.disciplinaId) : null;
    const curso = reserva.cursoId ? cursosPorId.get(reserva.cursoId) : null;

    return {
      id: reserva.id,
      data: reserva.data,
      horaInicio: reserva.horaInicio,
      horaFim: reserva.horaFim,
      turma: reserva.turma,
      professor: professor ? { id: professor.id, nome: professor.nome } : null,
      espaco: espaco ? { id: espaco.id, nome: espaco.nome, tipo: espaco.tipo, bloco: espaco.bloco } : null,
      disciplina: disciplina ? { id: disciplina.id, nome: disciplina.nome, codigo: disciplina.codigo } : null,
      curso: curso ? { id: curso.id, nome: curso.nome, codigo: curso.codigo } : null,
      equipamentos: (reserva.equipamentos || []).map((e) => {
        const equipamento = equipamentosPorId.get(e.equipamentoId);
        return {
          id: e.equipamentoId,
          nome: equipamento ? equipamento.nome : `Equipamento #${e.equipamentoId}`,
          quantidade: e.quantidade,
        };
      }),
    };
  });
}

module.exports = { listarSalas, listarLaboratorios, listarProfessores, listarEquipamentos, montarGrade };
