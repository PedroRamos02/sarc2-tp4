# Professor Service

Responsável pelo CRUD do domínio acadêmico: **professores**, **cursos** e
**disciplinas**. Ao cadastrar um professor, coordena com o `auth-service`
(via chamada HTTP interna) a criação da credencial de login correspondente.

Este serviço nunca valida JWT diretamente — ele confia nos headers
(`x-user-id`, `x-user-role`, `x-user-professor-id`, `x-user-nome`) injetados
pelo `api-gateway` após a validação do token, pois só é alcançável pela rede
interna do Docker.

## Banco de dados

- Database: `professor_db` (MySQL, via Prisma)
- Tabelas:
  - `professores` (`id`, `nome`, `email`, `telefone`, `departamento`, `ativo`, `created_at`, `updated_at`)
  - `cursos` (`id`, `nome`, `codigo`, `ativo`, `created_at`, `updated_at`)
  - `disciplinas` (`id`, `nome`, `codigo`, `curso_id`, `carga_horaria`, `ativo`, `created_at`, `updated_at`)

## Variáveis de ambiente

Ver [`.env.example`](.env.example). Principais:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão MySQL (`mysql://user:pass@host:3306/professor_db`) |
| `INTERNAL_API_KEY` | Chave usada nas chamadas internas ao `auth-service` |
| `AUTH_SERVICE_URL` | URL base do `auth-service` (ex: `http://auth-service:3001`) |
| `CORS_ORIGIN` | Origem permitida para requisições CORS |

## Endpoints

### Públicos (sem autenticação)

Usados pela página pública do aluno (via `consulta-service` ou diretamente pelo frontend):

- `GET /professores?ativo=true` — lista professores (campos: id, nome, email, telefone, departamento, ativo)
- `GET /professores/:id`
- `GET /cursos?ativo=true` — lista cursos
- `GET /cursos/:id`
- `GET /disciplinas?ativo=true&cursoId=` — lista disciplinas, com filtro opcional por curso
- `GET /disciplinas/:id`

### Protegidos (ADMIN, via api-gateway)

- `POST /professores` — `{ nome, email, telefone, departamento }`. Cria o professor e chama o
  `auth-service` para gerar a credencial de login. Se a chamada falhar, o professor criado é
  removido (rollback) e a resposta é `502`. Em caso de sucesso, retorna o professor MAIS
  `credenciais: { email, senhaTemporaria }` para o admin repassar ao professor.
- `PUT /professores/:id` — `{ nome, telefone, departamento, email }`. Se o e-mail mudar, sincroniza
  a credencial no `auth-service` (falha aqui não bloqueia a atualização, apenas gera um warning nos logs).
- `PATCH /professores/:id/status` — `{ ativo }`. Ativa/desativa o professor e tenta sincronizar o
  login no `auth-service` (falha aqui não bloqueia, apenas warning).
- `DELETE /professores/:id`
- `POST /cursos` — `{ nome, codigo }`
- `PUT /cursos/:id`
- `PATCH /cursos/:id/status` — `{ ativo }`
- `DELETE /cursos/:id`
- `POST /disciplinas` — `{ nome, codigo, cursoId, cargaHoraria }` (valida se `cursoId` existe)
- `PUT /disciplinas/:id`
- `PATCH /disciplinas/:id/status` — `{ ativo }`
- `DELETE /disciplinas/:id`

### Observabilidade

- `GET /health` — healthcheck
- `GET /metrics` — métricas Prometheus (`http_requests_total`, `http_request_duration_seconds`,
  `professor_professores_total`, `professor_cursos_total`, `professor_disciplinas_total`, além das
  métricas padrão de processo)

## Rodando localmente

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

## Docker

```bash
docker build -t sarc2-professor-service .
```

O `docker-entrypoint.sh` aguarda o MySQL e aplica `prisma migrate deploy` antes de iniciar o servidor.
