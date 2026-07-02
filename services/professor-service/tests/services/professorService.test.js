jest.mock('../../src/prismaClient', () => ({
  professor: {
    count: jest.fn().mockResolvedValue(0),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('../../src/clients/authServiceClient');

const prisma = require('../../src/prismaClient');
const authServiceClient = require('../../src/clients/authServiceClient');
const professorService = require('../../src/services/professorService');
const AppError = require('../../src/utils/AppError');

const PROFESSOR_EXISTENTE = {
  id: 1,
  nome: 'Ana Souza',
  email: 'ana@sarc2.local',
  telefone: '999999999',
  departamento: 'Computação',
  ativo: true,
};

describe('professorService.criarProfessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.professor.count.mockResolvedValue(0);
  });

  it('rejeita quando nome ou email não são informados', async () => {
    await expect(professorService.criarProfessor({ nome: '', email: '' })).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(prisma.professor.create).not.toHaveBeenCalled();
  });

  it('rejeita com 409 quando já existe professor com o e-mail informado', async () => {
    prisma.professor.findUnique.mockResolvedValue(PROFESSOR_EXISTENTE);

    await expect(
      professorService.criarProfessor({ nome: 'Ana', email: PROFESSOR_EXISTENTE.email }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(prisma.professor.create).not.toHaveBeenCalled();
  });

  it('cria o professor e a credencial no auth-service com sucesso', async () => {
    prisma.professor.findUnique.mockResolvedValue(null);
    prisma.professor.create.mockResolvedValue(PROFESSOR_EXISTENTE);
    authServiceClient.criarCredencial.mockResolvedValue({ id: 10, senhaTemporaria: 'Temp-1234' });

    const resultado = await professorService.criarProfessor({
      nome: PROFESSOR_EXISTENTE.nome,
      email: PROFESSOR_EXISTENTE.email,
      telefone: PROFESSOR_EXISTENTE.telefone,
      departamento: PROFESSOR_EXISTENTE.departamento,
    });

    expect(authServiceClient.criarCredencial).toHaveBeenCalledWith({
      nome: PROFESSOR_EXISTENTE.nome,
      email: PROFESSOR_EXISTENTE.email,
      professorId: PROFESSOR_EXISTENTE.id,
    });
    expect(resultado).toEqual({
      ...PROFESSOR_EXISTENTE,
      credenciais: { id: 10, senhaTemporaria: 'Temp-1234' },
    });
  });

  it('faz rollback do professor quando a criação da credencial falha no auth-service', async () => {
    prisma.professor.findUnique.mockResolvedValue(null);
    prisma.professor.create.mockResolvedValue(PROFESSOR_EXISTENTE);
    const erroAuth = new AppError(502, 'Professor não pôde ser cadastrado: falha ao criar credencial de acesso');
    authServiceClient.criarCredencial.mockRejectedValue(erroAuth);
    prisma.professor.delete.mockResolvedValue(PROFESSOR_EXISTENTE);

    await expect(
      professorService.criarProfessor({ nome: PROFESSOR_EXISTENTE.nome, email: PROFESSOR_EXISTENTE.email }),
    ).rejects.toBe(erroAuth);

    expect(prisma.professor.delete).toHaveBeenCalledWith({ where: { id: PROFESSOR_EXISTENTE.id } });
  });
});

describe('professorService.buscarProfessorPorId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lança 404 quando o professor não existe', async () => {
    prisma.professor.findUnique.mockResolvedValue(null);

    await expect(professorService.buscarProfessorPorId(999)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('retorna o professor quando encontrado', async () => {
    prisma.professor.findUnique.mockResolvedValue(PROFESSOR_EXISTENTE);

    const resultado = await professorService.buscarProfessorPorId(1);

    expect(resultado).toEqual(PROFESSOR_EXISTENTE);
  });
});

describe('professorService.atualizarProfessor', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lança 404 quando o professor não existe', async () => {
    prisma.professor.findUnique.mockResolvedValue(null);

    await expect(professorService.atualizarProfessor(999, { nome: 'Novo' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('não sincroniza com o auth-service quando o e-mail não muda', async () => {
    prisma.professor.findUnique.mockResolvedValue(PROFESSOR_EXISTENTE);
    prisma.professor.update.mockResolvedValue({ ...PROFESSOR_EXISTENTE, nome: 'Ana Souza Silva' });

    const resultado = await professorService.atualizarProfessor(1, { nome: 'Ana Souza Silva' });

    expect(resultado.nome).toBe('Ana Souza Silva');
    expect(authServiceClient.atualizarDados).not.toHaveBeenCalled();
  });

  it('rejeita com 409 quando o novo e-mail já pertence a outro professor', async () => {
    prisma.professor.findUnique
      .mockResolvedValueOnce(PROFESSOR_EXISTENTE)
      .mockResolvedValueOnce({ id: 2, email: 'outro@sarc2.local' });

    await expect(
      professorService.atualizarProfessor(1, { email: 'outro@sarc2.local' }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(prisma.professor.update).not.toHaveBeenCalled();
  });

  it('sincroniza nome/e-mail no auth-service quando o e-mail muda', async () => {
    prisma.professor.findUnique.mockResolvedValueOnce(PROFESSOR_EXISTENTE).mockResolvedValueOnce(null);
    const atualizado = { ...PROFESSOR_EXISTENTE, email: 'ana.nova@sarc2.local' };
    prisma.professor.update.mockResolvedValue(atualizado);

    const resultado = await professorService.atualizarProfessor(1, { email: 'ana.nova@sarc2.local' });

    expect(resultado.email).toBe('ana.nova@sarc2.local');
    expect(authServiceClient.atualizarDados).toHaveBeenCalledWith(PROFESSOR_EXISTENTE.id, {
      nome: atualizado.nome,
      email: atualizado.email,
    });
  });
});

describe('professorService.atualizarStatusProfessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.professor.count.mockResolvedValue(0);
  });

  it('lança 404 quando o professor não existe', async () => {
    prisma.professor.findUnique.mockResolvedValue(null);

    await expect(professorService.atualizarStatusProfessor(999, false)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('desativa o professor e propaga o status para o auth-service', async () => {
    prisma.professor.findUnique.mockResolvedValue(PROFESSOR_EXISTENTE);
    prisma.professor.update.mockResolvedValue({ ...PROFESSOR_EXISTENTE, ativo: false });

    const resultado = await professorService.atualizarStatusProfessor(1, false);

    expect(resultado.ativo).toBe(false);
    expect(authServiceClient.atualizarStatus).toHaveBeenCalledWith(PROFESSOR_EXISTENTE.id, false);
  });

  it('ativa o professor e propaga o status para o auth-service', async () => {
    prisma.professor.findUnique.mockResolvedValue({ ...PROFESSOR_EXISTENTE, ativo: false });
    prisma.professor.update.mockResolvedValue({ ...PROFESSOR_EXISTENTE, ativo: true });

    const resultado = await professorService.atualizarStatusProfessor(1, true);

    expect(resultado.ativo).toBe(true);
    expect(authServiceClient.atualizarStatus).toHaveBeenCalledWith(PROFESSOR_EXISTENTE.id, true);
  });
});

describe('professorService.deletarProfessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.professor.count.mockResolvedValue(0);
  });

  it('lança 404 quando o professor não existe', async () => {
    prisma.professor.findUnique.mockResolvedValue(null);

    await expect(professorService.deletarProfessor(999)).rejects.toMatchObject({ statusCode: 404 });
    expect(prisma.professor.delete).not.toHaveBeenCalled();
  });

  it('remove o professor quando ele existe', async () => {
    prisma.professor.findUnique.mockResolvedValue(PROFESSOR_EXISTENTE);
    prisma.professor.delete.mockResolvedValue(PROFESSOR_EXISTENTE);

    await professorService.deletarProfessor(1);

    expect(prisma.professor.delete).toHaveBeenCalledWith({ where: { id: PROFESSOR_EXISTENTE.id } });
  });
});
