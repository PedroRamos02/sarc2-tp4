jest.mock('../../src/clients');

const { getProfessor, getSala, getEquipamento, getReserva } = require('../../src/clients');
const consultaService = require('../../src/services/consultaService');

describe('consultaService.listarSalas', () => {
  beforeEach(() => jest.clearAllMocks());

  it('repassa tipo SALA e ativo true para o client de sala', async () => {
    getSala.mockResolvedValue([{ id: 1, nome: 'Sala 101' }]);

    const resultado = await consultaService.listarSalas();

    expect(getSala).toHaveBeenCalledWith('/espacos', { tipo: 'SALA', ativo: true });
    expect(resultado).toEqual([{ id: 1, nome: 'Sala 101' }]);
  });
});

describe('consultaService.listarLaboratorios', () => {
  beforeEach(() => jest.clearAllMocks());

  it('repassa tipo LABORATORIO e ativo true para o client de sala', async () => {
    getSala.mockResolvedValue([{ id: 2, nome: 'Lab 01' }]);

    const resultado = await consultaService.listarLaboratorios();

    expect(getSala).toHaveBeenCalledWith('/espacos', { tipo: 'LABORATORIO', ativo: true });
    expect(resultado).toEqual([{ id: 2, nome: 'Lab 01' }]);
  });
});

describe('consultaService.listarProfessores', () => {
  beforeEach(() => jest.clearAllMocks());

  it('repassa ativo true para o client de professor', async () => {
    getProfessor.mockResolvedValue([{ id: 1, nome: 'Ana' }]);

    const resultado = await consultaService.listarProfessores();

    expect(getProfessor).toHaveBeenCalledWith('/professores', { ativo: true });
    expect(resultado).toEqual([{ id: 1, nome: 'Ana' }]);
  });
});

describe('consultaService.listarEquipamentos', () => {
  beforeEach(() => jest.clearAllMocks());

  it('repassa ativo true para o client de equipamento', async () => {
    getEquipamento.mockResolvedValue([{ id: 1, nome: 'Projetor' }]);

    const resultado = await consultaService.listarEquipamentos();

    expect(getEquipamento).toHaveBeenCalledWith('/equipamentos', { ativo: true });
    expect(resultado).toEqual([{ id: 1, nome: 'Projetor' }]);
  });
});

describe('consultaService.montarGrade', () => {
  const PROFESSORES = [{ id: 1, nome: 'Ana' }, { id: 2, nome: 'Bruno' }];
  const ESPACOS = [{ id: 10, nome: 'Sala 101', tipo: 'SALA', bloco: 'A' }];
  const DISCIPLINAS = [{ id: 20, nome: 'Estrutura de Dados', codigo: 'ED01' }];
  const CURSOS = [{ id: 30, nome: 'Ciência da Computação', codigo: 'CC01' }];
  const EQUIPAMENTOS = [{ id: 40, nome: 'Projetor' }];

  beforeEach(() => {
    jest.clearAllMocks();
    getProfessor.mockImplementation((caminho) =>
      Promise.resolve(caminho === '/disciplinas' ? DISCIPLINAS : caminho === '/cursos' ? CURSOS : PROFESSORES),
    );
    getSala.mockResolvedValue(ESPACOS);
    getEquipamento.mockResolvedValue(EQUIPAMENTOS);
  });

  it('enriquece cada reserva com professor, espaço, disciplina, curso e equipamentos', async () => {
    getReserva.mockResolvedValue([
      {
        id: 100,
        data: '2026-08-10',
        horaInicio: '08:00',
        horaFim: '10:00',
        turma: 'T1',
        professorId: 1,
        espacoId: 10,
        disciplinaId: 20,
        cursoId: 30,
        equipamentos: [{ equipamentoId: 40, quantidade: 2 }],
      },
    ]);

    const resultado = await consultaService.montarGrade({ data: '2026-08-10' });

    expect(getReserva).toHaveBeenCalledWith('/reservas/grade', { data: '2026-08-10' });
    expect(resultado).toEqual([
      {
        id: 100,
        data: '2026-08-10',
        horaInicio: '08:00',
        horaFim: '10:00',
        turma: 'T1',
        professor: { id: 1, nome: 'Ana' },
        espaco: { id: 10, nome: 'Sala 101', tipo: 'SALA', bloco: 'A' },
        disciplina: { id: 20, nome: 'Estrutura de Dados', codigo: 'ED01' },
        curso: { id: 30, nome: 'Ciência da Computação', codigo: 'CC01' },
        equipamentos: [{ id: 40, nome: 'Projetor', quantidade: 2 }],
      },
    ]);
  });

  it('retorna null graciosamente quando uma referência não é encontrada nas listas', async () => {
    getReserva.mockResolvedValue([
      {
        id: 101,
        data: '2026-08-11',
        horaInicio: '10:00',
        horaFim: '12:00',
        turma: 'T2',
        professorId: 999,
        espacoId: 999,
        disciplinaId: null,
        cursoId: null,
        equipamentos: [],
      },
    ]);

    const resultado = await consultaService.montarGrade({});

    expect(resultado[0].professor).toBeNull();
    expect(resultado[0].espaco).toBeNull();
    expect(resultado[0].disciplina).toBeNull();
    expect(resultado[0].curso).toBeNull();
    expect(resultado[0].equipamentos).toEqual([]);
  });

  it('usa um nome de fallback quando o equipamento referenciado não é encontrado', async () => {
    getReserva.mockResolvedValue([
      {
        id: 102,
        data: '2026-08-12',
        horaInicio: '14:00',
        horaFim: '16:00',
        turma: 'T3',
        professorId: 1,
        espacoId: 10,
        equipamentos: [{ equipamentoId: 999, quantidade: 1 }],
      },
    ]);

    const resultado = await consultaService.montarGrade({});

    expect(resultado[0].equipamentos).toEqual([{ id: 999, nome: 'Equipamento #999', quantidade: 1 }]);
  });

  it('retorna lista vazia quando não há reservas', async () => {
    getReserva.mockResolvedValue([]);

    const resultado = await consultaService.montarGrade({});

    expect(resultado).toEqual([]);
  });
});
