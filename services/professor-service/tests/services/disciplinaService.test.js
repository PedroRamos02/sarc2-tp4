jest.mock('../../src/prismaClient', () => ({
  disciplina: {
    count: jest.fn().mockResolvedValue(0),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  curso: {
    findUnique: jest.fn(),
  },
}));

const prisma = require('../../src/prismaClient');
const disciplinaService = require('../../src/services/disciplinaService');

const CURSO_EXISTENTE = { id: 1, nome: 'Ciência da Computação', codigo: 'CC01' };
const DISCIPLINA_EXISTENTE = {
  id: 1,
  nome: 'Estrutura de Dados',
  codigo: 'ED01',
  cursoId: 1,
  cargaHoraria: 60,
  ativo: true,
};

describe('disciplinaService.criarDisciplina', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.disciplina.count.mockResolvedValue(0);
  });

  it('rejeita quando faltam campos obrigatórios', async () => {
    await expect(
      disciplinaService.criarDisciplina({ nome: '', codigo: '', cursoId: null, cargaHoraria: null }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(prisma.disciplina.create).not.toHaveBeenCalled();
  });

  it('rejeita com 400 quando o cursoId informado não existe', async () => {
    prisma.curso.findUnique.mockResolvedValue(null);

    await expect(
      disciplinaService.criarDisciplina({
        nome: DISCIPLINA_EXISTENTE.nome,
        codigo: DISCIPLINA_EXISTENTE.codigo,
        cursoId: 999,
        cargaHoraria: 60,
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(prisma.disciplina.create).not.toHaveBeenCalled();
  });

  it('rejeita com 409 quando já existe disciplina com o código informado', async () => {
    prisma.curso.findUnique.mockResolvedValue(CURSO_EXISTENTE);
    prisma.disciplina.findUnique.mockResolvedValue(DISCIPLINA_EXISTENTE);

    await expect(
      disciplinaService.criarDisciplina({
        nome: 'Outra Disciplina',
        codigo: DISCIPLINA_EXISTENTE.codigo,
        cursoId: 1,
        cargaHoraria: 60,
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(prisma.disciplina.create).not.toHaveBeenCalled();
  });

  it('cria a disciplina com sucesso', async () => {
    prisma.curso.findUnique.mockResolvedValue(CURSO_EXISTENTE);
    prisma.disciplina.findUnique.mockResolvedValue(null);
    prisma.disciplina.create.mockResolvedValue(DISCIPLINA_EXISTENTE);

    const resultado = await disciplinaService.criarDisciplina({
      nome: DISCIPLINA_EXISTENTE.nome,
      codigo: DISCIPLINA_EXISTENTE.codigo,
      cursoId: 1,
      cargaHoraria: 60,
    });

    expect(resultado).toEqual(DISCIPLINA_EXISTENTE);
    expect(prisma.disciplina.create).toHaveBeenCalledWith({
      data: {
        nome: DISCIPLINA_EXISTENTE.nome,
        codigo: DISCIPLINA_EXISTENTE.codigo,
        cursoId: 1,
        cargaHoraria: 60,
      },
    });
  });
});

describe('disciplinaService.buscarDisciplinaPorId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lança 404 quando a disciplina não existe', async () => {
    prisma.disciplina.findUnique.mockResolvedValue(null);

    await expect(disciplinaService.buscarDisciplinaPorId(999)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('retorna a disciplina quando encontrada', async () => {
    prisma.disciplina.findUnique.mockResolvedValue(DISCIPLINA_EXISTENTE);

    const resultado = await disciplinaService.buscarDisciplinaPorId(1);

    expect(resultado).toEqual(DISCIPLINA_EXISTENTE);
  });
});

describe('disciplinaService.atualizarDisciplina', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lança 404 quando a disciplina não existe', async () => {
    prisma.disciplina.findUnique.mockResolvedValue(null);

    await expect(disciplinaService.atualizarDisciplina(999, { nome: 'Novo' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('rejeita com 400 quando o novo cursoId não existe', async () => {
    prisma.disciplina.findUnique.mockResolvedValue(DISCIPLINA_EXISTENTE);
    prisma.curso.findUnique.mockResolvedValue(null);

    await expect(
      disciplinaService.atualizarDisciplina(1, { cursoId: 999 }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(prisma.disciplina.update).not.toHaveBeenCalled();
  });

  it('rejeita com 409 quando o novo código já pertence a outra disciplina', async () => {
    prisma.disciplina.findUnique
      .mockResolvedValueOnce(DISCIPLINA_EXISTENTE)
      .mockResolvedValueOnce({ id: 2, codigo: 'ED02' });

    await expect(
      disciplinaService.atualizarDisciplina(1, { codigo: 'ED02' }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(prisma.disciplina.update).not.toHaveBeenCalled();
  });

  it('atualiza a disciplina com sucesso', async () => {
    prisma.disciplina.findUnique.mockResolvedValue(DISCIPLINA_EXISTENTE);
    prisma.disciplina.update.mockResolvedValue({ ...DISCIPLINA_EXISTENTE, nome: 'Novo Nome' });

    const resultado = await disciplinaService.atualizarDisciplina(1, {
      nome: 'Novo Nome',
      codigo: DISCIPLINA_EXISTENTE.codigo,
    });

    expect(resultado.nome).toBe('Novo Nome');
  });
});

describe('disciplinaService.atualizarStatusDisciplina', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.disciplina.count.mockResolvedValue(0);
  });

  it('lança 404 quando a disciplina não existe', async () => {
    prisma.disciplina.findUnique.mockResolvedValue(null);

    await expect(disciplinaService.atualizarStatusDisciplina(999, false)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('atualiza o status da disciplina', async () => {
    prisma.disciplina.findUnique.mockResolvedValue(DISCIPLINA_EXISTENTE);
    prisma.disciplina.update.mockResolvedValue({ ...DISCIPLINA_EXISTENTE, ativo: false });

    const resultado = await disciplinaService.atualizarStatusDisciplina(1, false);

    expect(resultado.ativo).toBe(false);
  });
});

describe('disciplinaService.deletarDisciplina', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.disciplina.count.mockResolvedValue(0);
  });

  it('lança 404 quando a disciplina não existe', async () => {
    prisma.disciplina.findUnique.mockResolvedValue(null);

    await expect(disciplinaService.deletarDisciplina(999)).rejects.toMatchObject({ statusCode: 404 });
    expect(prisma.disciplina.delete).not.toHaveBeenCalled();
  });

  it('remove a disciplina quando ela existe', async () => {
    prisma.disciplina.findUnique.mockResolvedValue(DISCIPLINA_EXISTENTE);
    prisma.disciplina.delete.mockResolvedValue(DISCIPLINA_EXISTENTE);

    await disciplinaService.deletarDisciplina(1);

    expect(prisma.disciplina.delete).toHaveBeenCalledWith({ where: { id: DISCIPLINA_EXISTENTE.id } });
  });
});
