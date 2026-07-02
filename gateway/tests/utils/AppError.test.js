const AppError = require('../../src/utils/AppError');

describe('AppError', () => {
  it('define statusCode, publicMessage e details', () => {
    const err = new AppError(503, 'Serviço indisponível', { target: '/api/reservas' });

    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(503);
    expect(err.publicMessage).toBe('Serviço indisponível');
    expect(err.details).toEqual({ target: '/api/reservas' });
  });
});
