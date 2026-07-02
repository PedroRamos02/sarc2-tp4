process.env.JWT_SECRET = 'segredo-de-teste';
process.env.JWT_EXPIRES_IN = '1h';

jest.mock('../../src/prismaClient', () => ({
  usuario: { findUnique: jest.fn() },
}));
jest.mock('../../src/utils/password', () => ({
  comparePassword: jest.fn(),
}));

const prisma = require('../../src/prismaClient');
const { comparePassword } = require('../../src/utils/password');
const authService = require('../../src/services/authService');
const AppError = require('../../src/utils/AppError');

const USUARIO_ATIVO = {
  id: 1,
  nome: 'Admin',
  email: 'admin@sarc2.local',
  senhaHash: 'hash-qualquer',
  role: 'ADMIN',
  professorId: null,
  ativo: true,
};

describe('authService.login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejeita quando o usuário não existe', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    await expect(authService.login({ email: 'x@x.com', senha: '123' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('rejeita quando o usuário está inativo', async () => {
    prisma.usuario.findUnique.mockResolvedValue({ ...USUARIO_ATIVO, ativo: false });

    await expect(authService.login({ email: USUARIO_ATIVO.email, senha: '123' })).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it('rejeita quando a senha está incorreta', async () => {
    prisma.usuario.findUnique.mockResolvedValue(USUARIO_ATIVO);
    comparePassword.mockResolvedValue(false);

    await expect(
      authService.login({ email: USUARIO_ATIVO.email, senha: 'errada' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('retorna token e dados do usuário em caso de sucesso', async () => {
    prisma.usuario.findUnique.mockResolvedValue(USUARIO_ATIVO);
    comparePassword.mockResolvedValue(true);

    const resultado = await authService.login({ email: USUARIO_ATIVO.email, senha: 'Admin@12345' });

    expect(typeof resultado.token).toBe('string');
    expect(resultado.usuario).toEqual({
      id: USUARIO_ATIVO.id,
      nome: USUARIO_ATIVO.nome,
      email: USUARIO_ATIVO.email,
      role: USUARIO_ATIVO.role,
      professorId: USUARIO_ATIVO.professorId,
    });
  });
});
