jest.mock('../../src/prismaClient', () => ({
  curso: {
    count: jest.fn().mockResolvedValue(0),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const prisma = require('../../src/prismaClient');
const cursoService = require('../../src/services/cursoService');

const CURSO_EXISTENTE = { id: 1, nome: 'Ciência da Computação', codigo: 'CC01', ativo: true };

describe('cursoService.criarCurso', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.curso.count.mockResolvedValue(0);
  });

  it('rejeita quando nome ou codigo não são informados', async () => {
    await expect(cursoService.criarCurso({ nome: '', codigo: '' })).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(prisma.curso.create).not.toHaveBeenCalled();
  });

  it('rejeita com 409 quando já existe curso com o código informado', async () => {
    prisma.curso.findUnique.mockResolvedValue(CURSO_EXISTENTE);

    await expect(
      cursoService.criarCurso({ nome: 'Outro Nome', codigo: CURSO_EXISTENTE.codigo }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(prisma.curso.create).not.toHaveBeenCalled();
  });

  it('cria o curso com sucesso', async () => {
    prisma.curso.findUnique.mockResolvedValue(null);
    prisma.curso.create.mockResolvedValue(CURSO_EXISTENTE);

    const resultado = await cursoService.criarCurso({
      nome: CURSO_EXISTENTE.nome,
      codigo: CURSO_EXISTENTE.codigo,
    });

    expect(resultado).toEqual(CURSO_EXISTENTE);
    expect(prisma.curso.create).toHaveBeenCalledWith({
      data: { nome: CURSO_EXISTENTE.nome, codigo: CURSO_EXISTENTE.codigo },
    });
  });
});

describe('cursoService.buscarCursoPorId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lança 404 quando o curso não existe', async () => {
    prisma.curso.findUnique.mockResolvedValue(null);

    await expect(cursoService.buscarCursoPorId(999)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('retorna o curso quando encontrado', async () => {
    prisma.curso.findUnique.mockResolvedValue(CURSO_EXISTENTE);

    const resultado = await cursoService.buscarCursoPorId(1);

    expect(resultado).toEqual(CURSO_EXISTENTE);
  });
});

describe('cursoService.atualizarCurso', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lança 404 quando o curso não existe', async () => {
    prisma.curso.findUnique.mockResolvedValue(null);

    await expect(cursoService.atualizarCurso(999, { nome: 'Novo' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('rejeita com 409 quando o novo código já pertence a outro curso', async () => {
    prisma.curso.findUnique
      .mockResolvedValueOnce(CURSO_EXISTENTE)
      .mockResolvedValueOnce({ id: 2, codigo: 'CC02' });

    await expect(cursoService.atualizarCurso(1, { codigo: 'CC02' })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(prisma.curso.update).not.toHaveBeenCalled();
  });

  it('atualiza o curso quando o código não muda', async () => {
    prisma.curso.findUnique.mockResolvedValue(CURSO_EXISTENTE);
    prisma.curso.update.mockResolvedValue({ ...CURSO_EXISTENTE, nome: 'Novo Nome' });

    const resultado = await cursoService.atualizarCurso(1, { nome: 'Novo Nome', codigo: CURSO_EXISTENTE.codigo });

    expect(resultado.nome).toBe('Novo Nome');
  });
});

describe('cursoService.atualizarStatusCurso', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.curso.count.mockResolvedValue(0);
  });

  it('lança 404 quando o curso não existe', async () => {
    prisma.curso.findUnique.mockResolvedValue(null);

    await expect(cursoService.atualizarStatusCurso(999, false)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('atualiza o status do curso', async () => {
    prisma.curso.findUnique.mockResolvedValue(CURSO_EXISTENTE);
    prisma.curso.update.mockResolvedValue({ ...CURSO_EXISTENTE, ativo: false });

    const resultado = await cursoService.atualizarStatusCurso(1, false);

    expect(resultado.ativo).toBe(false);
  });
});

describe('cursoService.deletarCurso', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.curso.count.mockResolvedValue(0);
  });

  it('lança 404 quando o curso não existe', async () => {
    prisma.curso.findUnique.mockResolvedValue(null);

    await expect(cursoService.deletarCurso(999)).rejects.toMatchObject({ statusCode: 404 });
    expect(prisma.curso.delete).not.toHaveBeenCalled();
  });

  it('remove o curso quando ele existe', async () => {
    prisma.curso.findUnique.mockResolvedValue(CURSO_EXISTENTE);
    prisma.curso.delete.mockResolvedValue(CURSO_EXISTENTE);

    await cursoService.deletarCurso(1);

    expect(prisma.curso.delete).toHaveBeenCalledWith({ where: { id: CURSO_EXISTENTE.id } });
  });
});
