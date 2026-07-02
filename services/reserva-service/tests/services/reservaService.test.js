jest.mock('../../src/prismaClient', () => ({
  reserva: {
    count: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  reservaEquipamento: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
}));
jest.mock('../../src/clients/salaServiceClient');
jest.mock('../../src/clients/equipamentoServiceClient');
jest.mock('../../src/clients/professorServiceClient');

const prisma = require('../../src/prismaClient');
const salaServiceClient = require('../../src/clients/salaServiceClient');
const equipamentoServiceClient = require('../../src/clients/equipamentoServiceClient');
const professorServiceClient = require('../../src/clients/professorServiceClient');
const reservaService = require('../../src/services/reservaService');

const PROFESSOR = { id: 10, role: 'PROFESSOR', professorId: 5 };
const ADMIN = { id: 1, role: 'ADMIN', professorId: null };

const PAYLOAD_VALIDO = {
  turma: 'T1',
  espacoId: 1,
  data: '2026-08-10',
  horaInicio: '08:00',
  horaFim: '10:00',
};

const ESPACO_ATIVO = { id: 1, nome: 'Sala 101', ativo: true };
const PROFESSOR_ATIVO = { id: 5, nome: 'Maria', ativo: true };

describe('reservaService.criarReserva', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((cb) => cb(prisma));
    prisma.reserva.count.mockResolvedValue(0);
    salaServiceClient.buscarEspaco.mockResolvedValue(ESPACO_ATIVO);
    professorServiceClient.buscarProfessor.mockResolvedValue(PROFESSOR_ATIVO);
    prisma.reserva.findFirst.mockResolvedValue(null);
    prisma.reservaEquipamento.findMany.mockResolvedValue([]);
  });

  it('rejeita quando faltam campos obrigatórios', async () => {
    await expect(
      reservaService.criarReserva({ ...PAYLOAD_VALIDO, turma: undefined }, PROFESSOR),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejeita quando horaInicio não é anterior a horaFim', async () => {
    await expect(
      reservaService.criarReserva({ ...PAYLOAD_VALIDO, horaInicio: '10:00', horaFim: '08:00' }, PROFESSOR),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('admin sem professorId no payload é rejeitado', async () => {
    await expect(reservaService.criarReserva(PAYLOAD_VALIDO, ADMIN)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('rejeita quando o espaço não existe', async () => {
    salaServiceClient.buscarEspaco.mockResolvedValue(null);

    await expect(reservaService.criarReserva(PAYLOAD_VALIDO, PROFESSOR)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('rejeita quando o espaço está inativo', async () => {
    salaServiceClient.buscarEspaco.mockResolvedValue({ ...ESPACO_ATIVO, ativo: false });

    await expect(reservaService.criarReserva(PAYLOAD_VALIDO, PROFESSOR)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('rejeita quando o professor não existe', async () => {
    professorServiceClient.buscarProfessor.mockResolvedValue(null);

    await expect(reservaService.criarReserva(PAYLOAD_VALIDO, PROFESSOR)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('rejeita por conflito de sala', async () => {
    prisma.reserva.findFirst.mockResolvedValueOnce({ id: 999, turma: 'Outra turma' });

    await expect(reservaService.criarReserva(PAYLOAD_VALIDO, PROFESSOR)).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(prisma.reserva.create).not.toHaveBeenCalled();
  });

  it('rejeita por conflito de professor', async () => {
    prisma.reserva.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 998 });

    await expect(reservaService.criarReserva(PAYLOAD_VALIDO, PROFESSOR)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('rejeita quando o equipamento não tem unidades suficientes disponíveis', async () => {
    equipamentoServiceClient.buscarEquipamento.mockResolvedValue({
      id: 3,
      nome: 'Projetor',
      ativo: true,
      disponivel: true,
      quantidadeTotal: 2,
    });
    prisma.reservaEquipamento.findMany.mockResolvedValue([{ quantidade: 2 }]);

    const payload = { ...PAYLOAD_VALIDO, equipamentos: [{ equipamentoId: 3, quantidade: 1 }] };

    await expect(reservaService.criarReserva(payload, PROFESSOR)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('cria a reserva com sucesso e força o professorId do usuário logado', async () => {
    prisma.reserva.create.mockResolvedValue({ id: 1, ...PAYLOAD_VALIDO, professorId: 5 });

    const resultado = await reservaService.criarReserva(
      { ...PAYLOAD_VALIDO, professorId: 999 },
      PROFESSOR,
    );

    expect(resultado.id).toBe(1);
    expect(prisma.reserva.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ professorId: 5, criadoPor: PROFESSOR.id }),
      }),
    );
  });

  it('admin pode criar reserva informando o professorId no payload', async () => {
    prisma.reserva.create.mockResolvedValue({ id: 2 });

    await reservaService.criarReserva({ ...PAYLOAD_VALIDO, professorId: 5 }, ADMIN);

    expect(prisma.reserva.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ professorId: 5, criadoPor: ADMIN.id }) }),
    );
  });
});

describe('reservaService.atualizarReserva / cancelarReserva', () => {
  const RESERVA_EXISTENTE = {
    id: 1,
    turma: 'T1',
    espacoId: 1,
    professorId: 5,
    data: new Date('2026-08-10T00:00:00.000Z'),
    horaInicio: '08:00',
    horaFim: '10:00',
    observacoes: null,
    status: 'ATIVA',
    criadoPor: PROFESSOR.id,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((cb) => cb(prisma));
    prisma.reserva.count.mockResolvedValue(0);
    prisma.reserva.findFirst.mockResolvedValue(null);
  });

  it('impede que um professor altere reserva de outro professor', async () => {
    prisma.reserva.findUnique.mockResolvedValue({ ...RESERVA_EXISTENTE, criadoPor: 555 });

    await expect(
      reservaService.atualizarReserva(1, { turma: 'Nova turma' }, PROFESSOR),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('impede alterar uma reserva já cancelada', async () => {
    prisma.reserva.findUnique.mockResolvedValue({ ...RESERVA_EXISTENTE, status: 'CANCELADA' });

    await expect(
      reservaService.atualizarReserva(1, { turma: 'Nova turma' }, PROFESSOR),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('admin pode cancelar reserva de qualquer professor', async () => {
    prisma.reserva.findUnique.mockResolvedValue({ ...RESERVA_EXISTENTE });
    prisma.reserva.update.mockResolvedValue({ ...RESERVA_EXISTENTE, status: 'CANCELADA' });

    const resultado = await reservaService.cancelarReserva(1, ADMIN);

    expect(resultado.status).toBe('CANCELADA');
  });

  it('rejeita cancelar uma reserva já cancelada', async () => {
    prisma.reserva.findUnique.mockResolvedValue({ ...RESERVA_EXISTENTE, status: 'CANCELADA' });

    await expect(reservaService.cancelarReserva(1, PROFESSOR)).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});

describe('reservaService.verificarDisponibilidade', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna disponível quando não há conflito', async () => {
    prisma.reserva.findFirst.mockResolvedValue(null);

    const resultado = await reservaService.verificarDisponibilidade({
      espacoId: 1,
      data: '2026-08-10',
      horaInicio: '08:00',
      horaFim: '10:00',
    });

    expect(resultado).toEqual({ disponivel: true, conflito: null });
  });

  it('retorna indisponível e os dados do conflito', async () => {
    prisma.reserva.findFirst.mockResolvedValue({ horaInicio: '09:00', horaFim: '11:00', turma: 'T2' });

    const resultado = await reservaService.verificarDisponibilidade({
      espacoId: 1,
      data: '2026-08-10',
      horaInicio: '08:00',
      horaFim: '10:00',
    });

    expect(resultado.disponivel).toBe(false);
    expect(resultado.conflito).toEqual({ horaInicio: '09:00', horaFim: '11:00', turma: 'T2' });
  });
});
