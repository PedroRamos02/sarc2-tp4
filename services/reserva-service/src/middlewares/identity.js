/**
 * Lê a identidade injetada pelo api-gateway após validar o JWT. Este serviço
 * nunca é exposto diretamente à internet, então confia nesses headers apenas
 * quando a chamada chega através da rede Docker interna.
 */
function identity(req, res, next) {
  const userId = req.headers['x-user-id'];
  const role = req.headers['x-user-role'];
  const professorId = req.headers['x-user-professor-id'];
  const nome = req.headers['x-user-nome'];

  req.user = userId
    ? {
        id: Number(userId),
        role,
        professorId: professorId ? Number(professorId) : null,
        nome,
      }
    : null;

  next();
}

module.exports = identity;
