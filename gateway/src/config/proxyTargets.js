/**
 * Mapa de roteamento: prefixo externo -> serviço de destino.
 * `rewrite` é o trecho removido do início do path antes de repassar ao
 * serviço (cada microsserviço expõe suas rotas de negócio na raiz, ex:
 * professor-service escuta em "/professores", não em "/api/professores").
 */
module.exports = [
  { path: '/api/auth', target: process.env.AUTH_SERVICE_URL, rewrite: '^/api/auth' },
  { path: '/api/usuarios', target: process.env.AUTH_SERVICE_URL, rewrite: '^/api' },
  { path: '/api/professores', target: process.env.PROFESSOR_SERVICE_URL, rewrite: '^/api' },
  { path: '/api/cursos', target: process.env.PROFESSOR_SERVICE_URL, rewrite: '^/api' },
  { path: '/api/disciplinas', target: process.env.PROFESSOR_SERVICE_URL, rewrite: '^/api' },
  { path: '/api/espacos', target: process.env.SALA_SERVICE_URL, rewrite: '^/api' },
  { path: '/api/equipamentos', target: process.env.EQUIPAMENTO_SERVICE_URL, rewrite: '^/api' },
  { path: '/api/reservas', target: process.env.RESERVA_SERVICE_URL, rewrite: '^/api' },
  { path: '/api/consulta', target: process.env.CONSULTA_SERVICE_URL, rewrite: '^/api/consulta' },
];
