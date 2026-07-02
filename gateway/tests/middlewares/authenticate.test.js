process.env.JWT_SECRET = 'segredo-de-teste';

const jwt = require('jsonwebtoken');
const authenticate = require('../../src/middlewares/authenticate');

function criarToken(payload, secret = process.env.JWT_SECRET, options = {}) {
  return jwt.sign(payload, secret, options);
}

describe('middlewares/authenticate', () => {
  it('segue anônimo quando não há header Authorization', () => {
    const req = { headers: {} };
    const next = jest.fn();

    authenticate(req, {}, next);

    expect(req.identity).toBeNull();
    expect(next).toHaveBeenCalledWith();
  });

  it('rejeita header mal formado (sem "Bearer")', () => {
    const req = { headers: { authorization: 'Token abc123' } };
    const next = jest.fn();

    authenticate(req, {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  it('decodifica e injeta req.identity para um token válido', () => {
    const token = criarToken({ sub: 1, role: 'ADMIN', nome: 'Admin' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    authenticate(req, {}, next);

    expect(req.identity).toMatchObject({ sub: 1, role: 'ADMIN', nome: 'Admin' });
    expect(next).toHaveBeenCalledWith();
  });

  it('rejeita token assinado com segredo incorreto', () => {
    const token = criarToken({ sub: 1, role: 'ADMIN' }, 'segredo-errado');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    authenticate(req, {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  it('rejeita token expirado', () => {
    const token = criarToken({ sub: 1, role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: -10 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    authenticate(req, {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });
});
