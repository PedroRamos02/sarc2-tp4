jest.mock('../../src/prismaClient', () => ({
  equipamento: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const prisma = require('../../src/prismaClient');
const equipamentoService = require('../../src/services/equipamentoService');

const EQUIPAMENTO = {
  id: 1,
  nome: 'Projetor',
  tipo: 'AUDIOVISUAL',
  quantidadeTotal: 5,
  disponivel: true,
  ativo: true,
};

describe('equipamentoService.criarEquipamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.equipamento.findMany.mockResolvedValue([]);
  });

  it('cria um equipamento com sucesso', async () => {
    prisma.equipamento.create.mockResolvedValue(EQUIPAMENTO);

    const resultado = await equipamentoService.criarEquipamento({
      nome: 'Projetor',
      tipo: 'AUDIOVISUAL',
      quantidadeTotal: 5,
    });

    expect(resultado).toEqual(EQUIPAMENTO);
    expect(prisma.equipamento.create).toHaveBeenCalledWith({
      data: {
        nome: 'Projetor',
        tipo: 'AUDIOVISUAL',
        quantidadeTotal: 5,
        disponivel: true,
      },
    });
  });

  it('cria um equipamento informando disponivel explicitamente', async () => {
    prisma.equipamento.create.mockResolvedValue({ ...EQUIPAMENTO, disponivel: false });

    const resultado = await equipamentoService.criarEquipamento({
      nome: 'Projetor',
      tipo: 'AUDIOVISUAL',
      quantidadeTotal: 5,
      disponivel: false,
    });

    expect(resultado.disponivel).toBe(false);
    expect(prisma.equipamento.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ disponivel: false }) }),
    );
  });
});

describe('equipamentoService.buscarPorId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lança 404 quando o equipamento não existe', async () => {
    prisma.equipamento.findUnique.mockResolvedValue(null);

    await expect(equipamentoService.buscarPorId(999)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('retorna o equipamento quando ele existe', async () => {
    prisma.equipamento.findUnique.mockResolvedValue(EQUIPAMENTO);

    const resultado = await equipamentoService.buscarPorId(1);

    expect(resultado).toEqual(EQUIPAMENTO);
  });
});

describe('equipamentoService.atualizarEquipamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.equipamento.findMany.mockResolvedValue([]);
  });

  it('atualiza um equipamento existente com sucesso', async () => {
    prisma.equipamento.findUnique.mockResolvedValue(EQUIPAMENTO);
    const atualizado = { ...EQUIPAMENTO, nome: 'Projetor HD', quantidadeTotal: 8 };
    prisma.equipamento.update.mockResolvedValue(atualizado);

    const resultado = await equipamentoService.atualizarEquipamento(1, {
      nome: 'Projetor HD',
      quantidadeTotal: 8,
    });

    expect(resultado).toEqual(atualizado);
    expect(prisma.equipamento.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { nome: 'Projetor HD', quantidadeTotal: 8 },
    });
  });

  it('lança 404 ao tentar atualizar um equipamento inexistente', async () => {
    prisma.equipamento.findUnique.mockResolvedValue(null);

    await expect(equipamentoService.atualizarEquipamento(999, { nome: 'X' })).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(prisma.equipamento.update).not.toHaveBeenCalled();
  });
});

describe('equipamentoService.atualizarStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.equipamento.findMany.mockResolvedValue([]);
  });

  it('ativa um equipamento com sucesso', async () => {
    prisma.equipamento.findUnique.mockResolvedValue({ ...EQUIPAMENTO, ativo: false });
    prisma.equipamento.update.mockResolvedValue({ ...EQUIPAMENTO, ativo: true });

    const resultado = await equipamentoService.atualizarStatus(1, true);

    expect(resultado.ativo).toBe(true);
    expect(prisma.equipamento.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { ativo: true } });
  });

  it('desativa um equipamento com sucesso', async () => {
    prisma.equipamento.findUnique.mockResolvedValue(EQUIPAMENTO);
    prisma.equipamento.update.mockResolvedValue({ ...EQUIPAMENTO, ativo: false });

    const resultado = await equipamentoService.atualizarStatus(1, false);

    expect(resultado.ativo).toBe(false);
  });

  it('lança 404 ao tentar alterar status de equipamento inexistente', async () => {
    prisma.equipamento.findUnique.mockResolvedValue(null);

    await expect(equipamentoService.atualizarStatus(999, false)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('equipamentoService.atualizarDisponibilidade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.equipamento.findMany.mockResolvedValue([]);
  });

  it('marca um equipamento como indisponível (em manutenção) com sucesso', async () => {
    prisma.equipamento.findUnique.mockResolvedValue(EQUIPAMENTO);
    prisma.equipamento.update.mockResolvedValue({ ...EQUIPAMENTO, disponivel: false });

    const resultado = await equipamentoService.atualizarDisponibilidade(1, false);

    expect(resultado.disponivel).toBe(false);
    expect(prisma.equipamento.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { disponivel: false },
    });
  });

  it('marca um equipamento como disponível novamente com sucesso', async () => {
    prisma.equipamento.findUnique.mockResolvedValue({ ...EQUIPAMENTO, disponivel: false });
    prisma.equipamento.update.mockResolvedValue({ ...EQUIPAMENTO, disponivel: true });

    const resultado = await equipamentoService.atualizarDisponibilidade(1, true);

    expect(resultado.disponivel).toBe(true);
  });

  it('lança 404 ao tentar alterar disponibilidade de equipamento inexistente', async () => {
    prisma.equipamento.findUnique.mockResolvedValue(null);

    await expect(equipamentoService.atualizarDisponibilidade(999, false)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('equipamentoService.removerEquipamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.equipamento.findMany.mockResolvedValue([]);
  });

  it('remove um equipamento existente com sucesso', async () => {
    prisma.equipamento.findUnique.mockResolvedValue(EQUIPAMENTO);
    prisma.equipamento.delete.mockResolvedValue(EQUIPAMENTO);

    await expect(equipamentoService.removerEquipamento(1)).resolves.toBeUndefined();
    expect(prisma.equipamento.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('lança 404 ao tentar remover equipamento inexistente', async () => {
    prisma.equipamento.findUnique.mockResolvedValue(null);

    await expect(equipamentoService.removerEquipamento(999)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(prisma.equipamento.delete).not.toHaveBeenCalled();
  });
});

describe('equipamentoService.listarEquipamentos', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lista equipamentos filtrando por ativo e disponivel', async () => {
    prisma.equipamento.findMany.mockResolvedValue([EQUIPAMENTO]);

    const resultado = await equipamentoService.listarEquipamentos({ ativo: true, disponivel: true });

    expect(resultado).toEqual([EQUIPAMENTO]);
    expect(prisma.equipamento.findMany).toHaveBeenCalledWith({
      where: { ativo: true, disponivel: true },
      orderBy: { nome: 'asc' },
    });
  });
});
