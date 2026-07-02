const identity = require('../../src/middlewares/identity');

describe('middlewares/identity', () => {
  it('define req.user como null quando não há header x-user-id', () => {
    const req = { headers: {} };
    const next = jest.fn();

    identity(req, {}, next);

    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalledWith();
  });

  it('monta req.user a partir dos headers injetados pelo gateway', () => {
    const req = {
      headers: {
        'x-user-id': '10',
        'x-user-role': 'PROFESSOR',
        'x-user-professor-id': '3',
        'x-user-nome': 'Maria',
      },
    };
    const next = jest.fn();

    identity(req, {}, next);

    expect(req.user).toEqual({ id: 10, role: 'PROFESSOR', professorId: 3, nome: 'Maria' });
    expect(next).toHaveBeenCalledWith();
  });
});
