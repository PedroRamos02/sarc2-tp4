const generateTempPassword = require('../../src/utils/generatePassword');

describe('utils/generatePassword', () => {
  it('gera uma senha temporária no formato Xxxx-Yyyy', () => {
    const senha = generateTempPassword();
    expect(senha).toMatch(/^[A-Za-z0-9]+-[A-Za-z0-9]+$/);
  });

  it('gera valores diferentes a cada chamada', () => {
    const senha1 = generateTempPassword();
    const senha2 = generateTempPassword();
    expect(senha1).not.toBe(senha2);
  });
});
