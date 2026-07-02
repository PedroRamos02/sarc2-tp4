process.env.JWT_SECRET = 'segredo-de-teste';
process.env.JWT_EXPIRES_IN = '1h';

const { signToken, verifyToken } = require('../../src/utils/jwt');

describe('utils/jwt', () => {
  it('assina e verifica um token com o payload esperado', () => {
    const token = signToken({ sub: 1, role: 'ADMIN' });
    const payload = verifyToken(token);

    expect(payload.sub).toBe(1);
    expect(payload.role).toBe('ADMIN');
    expect(payload.exp).toBeDefined();
  });

  it('lança erro ao verificar um token assinado com outro segredo', () => {
    const jwt = require('jsonwebtoken');
    const tokenForjado = jwt.sign({ sub: 1, role: 'ADMIN' }, 'outro-segredo');

    expect(() => verifyToken(tokenForjado)).toThrow();
  });
});
