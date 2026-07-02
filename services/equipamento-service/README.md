# Equipamento Service

Responsável pelo CRUD de equipamentos reserváveis (projetores, notebooks, etc.)
e pelo controle da quantidade total disponível de cada um (`equipamentos`).
A verificação de conflitos de reserva de um equipamento em um horário específico
NÃO é feita aqui — isso é responsabilidade do `reserva-service`, que consulta
este serviço apenas para saber a `quantidadeTotal` e se o equipamento está
`disponivel`/`ativo`.

## Banco de dados

- Database: `equipamento_db` (MySQL, via Prisma)
- Tabela: `equipamentos` (`id`, `nome`, `tipo`, `quantidade_total`, `disponivel`, `ativo`, `created_at`, `updated_at`)

`disponivel` é uma flag manual do admin (ex: equipamento em manutenção = `false`,
mesmo estando `ativo`). `ativo` representa o soft-delete/desativação geral do
equipamento. `quantidadeTotal` é o total de unidades existentes desse equipamento.

## Variáveis de ambiente

Ver [`.env.example`](.env.example). Principais:

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP do serviço (padrão `3004`) |
| `DATABASE_URL` | String de conexão MySQL (`mysql://user:pass@host:3306/equipamento_db`) |
| `CORS_ORIGIN` | Origem permitida para CORS |
| `LOG_LEVEL` | Nível de log do Winston |

Este serviço não valida JWT diretamente e não possui `JWT_SECRET` nem
`INTERNAL_API_KEY` — a identidade do usuário chega via headers (`x-user-id`,
`x-user-role`, `x-user-professor-id`, `x-user-nome`) injetados pelo
api-gateway, pois o serviço só é alcançável pela rede interna do Docker.

## Endpoints

### Públicos (sem autenticação)

Usados pela página do aluno via `consulta-service`, pelo frontend público, e
também consultados diretamente pelo `reserva-service` para validar
disponibilidade/quantidade ao criar uma reserva.

- `GET /equipamentos?ativo=true&disponivel=true` — lista equipamentos, com filtros opcionais `ativo` e `disponivel`
- `GET /equipamentos/:id` — busca um equipamento pelo id

### Protegidos (ADMIN, via api-gateway)

- `POST /equipamentos` — cria um equipamento (`{ nome, tipo, quantidadeTotal, disponivel }`)
- `PUT /equipamentos/:id` — atualiza os dados de um equipamento
- `PATCH /equipamentos/:id/status` — ativa/desativa o equipamento (`{ ativo: boolean }`)
- `PATCH /equipamentos/:id/disponibilidade` — marca disponibilidade manual, ex: manutenção (`{ disponivel: boolean }`)
- `DELETE /equipamentos/:id` — remove um equipamento

### Observabilidade

- `GET /health` — healthcheck
- `GET /metrics` — métricas Prometheus (`http_requests_total`, `http_request_duration_seconds`, `http_errors_total`, `equipamento_equipamentos_total`, `equipamento_unidades_total`, além das métricas padrão de processo)

## Rodando localmente

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

## Docker

```bash
docker build -t sarc2-equipamento-service .
```

O `docker-entrypoint.sh` aguarda o MySQL e aplica `prisma migrate deploy`
antes de iniciar o servidor.
