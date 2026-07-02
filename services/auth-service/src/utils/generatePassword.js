const crypto = require('crypto');

/**
 * Gera uma senha temporária legível (ex: "Xk4T-9pQw"), usada quando o
 * professor-service cria um professor sem senha explícita.
 */
function generateTempPassword() {
  const part = () => crypto.randomBytes(4).toString('hex').slice(0, 4);
  return `${part()}-${part()}`.replace(/^\w/, (c) => c.toUpperCase());
}

module.exports = generateTempPassword;
