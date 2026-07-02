const { hashPassword, comparePassword } = require('../../src/utils/password');

describe('utils/password', () => {
  it('gera um hash diferente do texto original', async () => {
    const hash = await hashPassword('Admin@12345');
    expect(hash).not.toBe('Admin@12345');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('valida a senha correta contra o hash', async () => {
    const hash = await hashPassword('Admin@12345');
    await expect(comparePassword('Admin@12345', hash)).resolves.toBe(true);
  });

  it('rejeita a senha incorreta', async () => {
    const hash = await hashPassword('Admin@12345');
    await expect(comparePassword('senha-errada', hash)).resolves.toBe(false);
  });
});
