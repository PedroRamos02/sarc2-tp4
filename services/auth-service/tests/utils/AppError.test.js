const AppError = require('../../src/utils/AppError');

describe('AppError', () => {
  it('define statusCode, publicMessage e details', () => {
    const err = new AppError(404, 'Não encontrado', { campo: 'id' });

    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(404);
    expect(err.publicMessage).toBe('Não encontrado');
    expect(err.details).toEqual({ campo: 'id' });
    expect(err.message).toBe('Não encontrado');
  });

  it('permite omitir details', () => {
    const err = new AppError(400, 'Requisição inválida');
    expect(err.details).toBeUndefined();
  });
});
