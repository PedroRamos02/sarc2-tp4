const { isHoraValida, toMinutos } = require('../../src/utils/time');

describe('utils/time', () => {
  describe('isHoraValida', () => {
    it.each(['08:00', '23:59', '00:00', '13:45'])('aceita %s como horário válido', (hora) => {
      expect(isHoraValida(hora)).toBe(true);
    });

    it.each(['24:00', '8:00', '08:60', '08:0', '', null, undefined, 123])(
      'rejeita %s como horário inválido',
      (hora) => {
        expect(isHoraValida(hora)).toBe(false);
      },
    );
  });

  describe('toMinutos', () => {
    it('converte HH:MM para minutos desde 00:00', () => {
      expect(toMinutos('00:00')).toBe(0);
      expect(toMinutos('01:30')).toBe(90);
      expect(toMinutos('23:59')).toBe(1439);
    });
  });
});
