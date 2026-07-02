const requireRole = require('../../src/middlewares/requireRole');

function criarMockRes() {
  return {};
}

describe('middlewares/requireRole', () => {
  it('chama next com erro 401 quando não há usuário autenticado', () => {
    const next = jest.fn();
    requireRole('ADMIN')({ user: null }, criarMockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  it('chama next com erro 403 quando o role não é permitido', () => {
    const next = jest.fn();
    requireRole('ADMIN')({ user: { role: 'PROFESSOR' } }, criarMockRes(), next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
  });

  it('chama next sem argumentos quando o role é permitido', () => {
    const next = jest.fn();
    requireRole('ADMIN', 'PROFESSOR')({ user: { role: 'PROFESSOR' } }, criarMockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
