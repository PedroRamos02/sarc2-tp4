# Auth Service

Responsável por autenticação (login), emissão/validação de JWT e gestão das
credenciais de acesso (`usuarios`). É o único serviço que assina tokens JWT.

## Banco de dados

- Database: `auth_db` (MySQL, via Prisma)
- Tabela: `usuarios` (`id`, `nome`, `email`, `senha_hash`, `role`, `professor_id`, `ativo`, `created_at`, `updated_at`)

## Variáveis de ambiente

Ver [`.env.example`](.env.example). Principais:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão MySQL (`mysql://user:pass@host:3306/auth_db`) |
| `JWT_SECRET` | Segredo usado para assinar os tokens |
| `JWT_EXPIRES_IN` | Validade do token (ex: `8h`) |
| `INTERNAL_API_KEY` | Chave usada pelas rotas `/internal/*` (comunicação entre serviços) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credenciais do administrador criado automaticamente no primeiro start |

## Endpoints

### Públicos (via api-gateway, sem JWT)

- `POST /login` — `{ email, senha }` → `{ token, usuario }`

### Protegidos (JWT via api-gateway)

- `GET /me` — retorna a identidade do usuário autenticado
- `GET /usuarios` — (ADMIN) lista todas as credenciais cadastradas

### Internos (rede Docker + `x-internal-key`, chamados por outros serviços)

- `POST /internal/usuarios` — cria credencial de login para um professor recém-cadastrado (chamado pelo `professor-service`)
- `PATCH /internal/usuarios/professor/:professorId/status` — ativa/desativa o login de um professor
- `PATCH /internal/usuarios/professor/:professorId/dados` — sincroniza nome/e-mail quando o professor é editado

### Observabilidade

- `GET /health` — healthcheck
- `GET /metrics` — métricas Prometheus (`http_requests_total`, `http_request_duration_seconds`, `auth_logins_total`, `auth_usuarios_total`, além das métricas padrão de processo)

## Testes automatizados

Testes unitários com Jest (`tests/`), sem banco/rede reais — `prismaClient` e
utilitários são mockados. Cobrem `utils/` (hash de senha, JWT, geração de
senha temporária), `services/` (`authService.login`, `usuarioService`) e os
middlewares `identity`/`requireRole`.

```bash
npm install
npm test
```

Roda automaticamente no CI a cada Pull Request para `master`
(`.github/workflows/tests.yml`).

## Rodando localmente

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

## Docker

```bash
docker build -t sarc2-auth-service .
```

O `docker-entrypoint.sh` aguarda o MySQL, aplica `prisma migrate deploy` e executa o seed do administrador antes de iniciar o servidor.
