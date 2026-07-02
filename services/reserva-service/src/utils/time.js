const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isHoraValida(hora) {
  return typeof hora === 'string' && HORA_REGEX.test(hora);
}

function toMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

module.exports = { isHoraValida, toMinutos };
