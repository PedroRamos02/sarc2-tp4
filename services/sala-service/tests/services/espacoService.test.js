jest.mock('../../src/prismaClient', () => ({
  espaco: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
}));

const prisma = require('../../src/prismaClient');
const espacoService = require('../../src/services/espacoService');

const ESPACO_SALA = {
  id: 1,
  nome: 'Sala 101',
  tipo: 'SALA',
  capacidade: 40,
  bloco: 'A',
  descricao: null,
  ativo: true,
};

describe('espacoService.criarEspaco', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria um espaço do tipo SALA com sucesso', async () => {
    prisma.espaco.create.mockResolvedValue(ESPACO_SALA);

    const resultado = await espacoService.criarEspaco({
      nome: 'Sala 101',
      tipo: 'SALA',
      capacidade: 40,
      bloco: 'A',
    });

    expect(resultado).toEqual(ESPACO_SALA);
    expect(prisma.espaco.create).toHaveBeenCalledWith({
      data: {
        nome: 'Sala 101',
        tipo: 'SALA',
        capacidade: 40,
        bloco: 'A',
        descricao: null,
      },
    });
  });

  it('cria um espaço do tipo LABORATORIO com sucesso', async () => {
    const laboratorio = { ...ESPACO_SALA, id: 2, nome: 'Lab 1', tipo: 'LABORATORIO' };
    prisma.espaco.create.mockResolvedValue(laboratorio);

    const resultado = await espacoService.criarEspaco({
      nome: 'Lab 1',
      tipo: 'LABORATORIO',
      capacidade: 20,
    });

    expect(resultado).toEqual(laboratorio);
    expect(prisma.espaco.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tipo: 'LABORATORIO' }) }),
    );
  });

  it('rejeita quando o tipo é inválido', async () => {
    await expect(
      espacoService.criarEspaco({ nome: 'Sala X', tipo: 'AUDITORIO', capacidade: 10 }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(prisma.espaco.create).not.toHaveBeenCalled();
  });

  it('rejeita quando a capacidade está ausente', async () => {
    await expect(
      espacoService.criarEspaco({ nome: 'Sala X', tipo: 'SALA' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejeita quando a capacidade é menor ou igual a zero', async () => {
    await expect(
      espacoService.criarEspaco({ nome: 'Sala X', tipo: 'SALA', capacidade: 0 }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(prisma.espaco.create).not.toHaveBeenCalled();
  });

  it('rejeita quando o nome está ausente', async () => {
    await expect(
      espacoService.criarEspaco({ tipo: 'SALA', capacidade: 10 }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('espacoService.buscarPorId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lança 404 quando o espaço não existe', async () => {
    prisma.espaco.findUnique.mockResolvedValue(null);

    await expect(espacoService.buscarPorId(999)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('retorna o espaço quando ele existe', async () => {
    prisma.espaco.findUnique.mockResolvedValue(ESPACO_SALA);

    const resultado = await espacoService.buscarPorId(1);

    expect(resultado).toEqual(ESPACO_SALA);
  });
});

describe('espacoService.atualizarEspaco', () => {
  beforeEach(() => jest.clearAllMocks());

  it('atualiza um espaço existente com sucesso', async () => {
    prisma.espaco.findUnique.mockResolvedValue(ESPACO_SALA);
    const atualizado = { ...ESPACO_SALA, nome: 'Sala 102', capacidade: 50 };
    prisma.espaco.update.mockResolvedValue(atualizado);

    const resultado = await espacoService.atualizarEspaco(1, { nome: 'Sala 102', capacidade: 50 });

    expect(resultado).toEqual(atualizado);
    expect(prisma.espaco.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { nome: 'Sala 102', capacidade: 50 },
    });
  });

  it('lança 404 ao tentar atualizar um espaço inexistente', async () => {
    prisma.espaco.findUnique.mockResolvedValue(null);

    await expect(espacoService.atualizarEspaco(999, { nome: 'X' })).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(prisma.espaco.update).not.toHaveBeenCalled();
  });

  it('rejeita atualização com tipo inválido', async () => {
    prisma.espaco.findUnique.mockResolvedValue(ESPACO_SALA);

    await expect(espacoService.atualizarEspaco(1, { tipo: 'AUDITORIO' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('rejeita atualização com capacidade menor ou igual a zero', async () => {
    prisma.espaco.findUnique.mockResolvedValue(ESPACO_SALA);

    await expect(espacoService.atualizarEspaco(1, { capacidade: -5 })).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe('espacoService.atualizarStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ativa um espaço com sucesso', async () => {
    prisma.espaco.findUnique.mockResolvedValue({ ...ESPACO_SALA, ativo: false });
    prisma.espaco.update.mockResolvedValue({ ...ESPACO_SALA, ativo: true });

    const resultado = await espacoService.atualizarStatus(1, true);

    expect(resultado.ativo).toBe(true);
    expect(prisma.espaco.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { ativo: true } });
  });

  it('desativa um espaço com sucesso', async () => {
    prisma.espaco.findUnique.mockResolvedValue(ESPACO_SALA);
    prisma.espaco.update.mockResolvedValue({ ...ESPACO_SALA, ativo: false });

    const resultado = await espacoService.atualizarStatus(1, false);

    expect(resultado.ativo).toBe(false);
  });

  it('lança 404 ao tentar alterar status de espaço inexistente', async () => {
    prisma.espaco.findUnique.mockResolvedValue(null);

    await expect(espacoService.atualizarStatus(999, false)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('espacoService.removerEspaco', () => {
  beforeEach(() => jest.clearAllMocks());

  it('remove um espaço existente com sucesso', async () => {
    prisma.espaco.findUnique.mockResolvedValue(ESPACO_SALA);
    prisma.espaco.delete.mockResolvedValue(ESPACO_SALA);

    await expect(espacoService.removerEspaco(1)).resolves.toBeUndefined();
    expect(prisma.espaco.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('lança 404 ao tentar remover espaço inexistente', async () => {
    prisma.espaco.findUnique.mockResolvedValue(null);

    await expect(espacoService.removerEspaco(999)).rejects.toMatchObject({ statusCode: 404 });
    expect(prisma.espaco.delete).not.toHaveBeenCalled();
  });
});

describe('espacoService.listarEspacos', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejeita listagem com tipo inválido', async () => {
    await expect(espacoService.listarEspacos({ tipo: 'AUDITORIO' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('lista espaços filtrando por tipo e status', async () => {
    prisma.espaco.findMany.mockResolvedValue([ESPACO_SALA]);

    const resultado = await espacoService.listarEspacos({ tipo: 'SALA', ativo: 'true' });

    expect(resultado).toEqual([ESPACO_SALA]);
    expect(prisma.espaco.findMany).toHaveBeenCalledWith({
      where: { tipo: 'SALA', ativo: true },
      orderBy: { nome: 'asc' },
    });
  });
});
