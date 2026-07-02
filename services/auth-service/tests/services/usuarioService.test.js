jest.mock('../../src/prismaClient', () => ({
  usuario: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
}));
jest.mock('../../src/utils/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('hash-gerado'),
}));
jest.mock('../../src/utils/generatePassword', () => jest.fn().mockReturnValue('Temp-1234'));

const prisma = require('../../src/prismaClient');
const usuarioService = require('../../src/services/usuarioService');

describe('usuarioService.criarCredencialProfessor', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejeita quando já existe um usuário com o e-mail informado', async () => {
    prisma.usuario.findUnique.mockResolvedValue({ id: 99 });

    await expect(
      usuarioService.criarCredencialProfessor({ nome: 'Ana', email: 'ana@x.com', professorId: 1 }),
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });

  it('gera senha temporária quando nenhuma senha é informada', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.usuario.create.mockResolvedValue({ id: 5, email: 'ana@x.com' });

    const resultado = await usuarioService.criarCredencialProfessor({
      nome: 'Ana',
      email: 'ana@x.com',
      professorId: 1,
    });

    expect(resultado).toEqual({ id: 5, email: 'ana@x.com', senhaTemporaria: 'Temp-1234' });
    expect(prisma.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'PROFESSOR', professorId: 1, senhaHash: 'hash-gerado' }),
      }),
    );
  });
});

describe('usuarioService.atualizarStatusPorProfessorId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lança 404 quando não existe credencial para o professor', async () => {
    prisma.usuario.findFirst.mockResolvedValue(null);

    await expect(usuarioService.atualizarStatusPorProfessorId(42, false)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('atualiza o status quando a credencial existe', async () => {
    prisma.usuario.findFirst.mockResolvedValue({ id: 7, professorId: 42 });
    prisma.usuario.update.mockResolvedValue({ id: 7, ativo: false });

    const resultado = await usuarioService.atualizarStatusPorProfessorId(42, false);

    expect(resultado.ativo).toBe(false);
    expect(prisma.usuario.update).toHaveBeenCalledWith({ where: { id: 7 }, data: { ativo: false } });
  });
});
