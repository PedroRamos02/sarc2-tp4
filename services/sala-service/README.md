# Sala Service

Responsável pelo cadastro e consulta de espaços físicos da universidade —
salas de aula e laboratórios. Ambos são modelados numa única tabela
(`espacos`), distinguidos pelo campo `tipo` (`SALA` ou `LABORATORIO`); não há
um serviço separado de laboratório.

Este serviço nunca valida o JWT diretamente: confia nos headers de
identidade (`x-user-id`, `x-user-role`, `x-user-professor-id`, `x-user-nome`)
injetados pelo api-gateway após a validação do token, pois só é alcançável
pela rede interna do Docker. Não expõe rotas `/internal` nem consome outros
serviços — os endpoints públicos de listagem/consulta são usados diretamente
pelo consulta-service, pelo frontend público e pelo reserva-service (para
validar a existência/status de um espaço ao criar uma reserva).

## Banco de dados

- Database: `sala_db` (MySQL, via Prisma)
- Tabela: `espacos` (`id`, `nome`, `tipo`, `capacidade`, `bloco`, `descricao`, `ativo`, `created_at`, `updated_at`)

## Variáveis de ambiente

Ver [`.env.example`](.env.example). Principais:

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP do serviço (padrão `3003`) |
| `DATABASE_URL` | String de conexão MySQL (`mysql://user:pass@host:3306/sala_db`) |
| `CORS_ORIGIN` | Origem permitida para requisições CORS |
| `LOG_LEVEL` | Nível de log do Winston (padrão `info`) |

## Endpoints

### Públicos (sem autenticação)

- `GET /espacos?tipo=SALA|LABORATORIO&ativo=true` — lista espaços, com filtros opcionais por `tipo` e `ativo`
- `GET /espacos/:id` — retorna um espaço específico

### Protegidos (ADMIN, via api-gateway)

- `POST /espacos` — cria um espaço. Body: `{ nome, tipo, capacidade, bloco, descricao }`
- `PUT /espacos/:id` — atualiza dados de um espaço
- `PATCH /espacos/:id/status` — ativa/desativa um espaço. Body: `{ ativo: boolean }`
- `DELETE /espacos/:id` — remove um espaço

### Observabilidade

- `GET /health` — healthcheck
- `GET /metrics` — métricas Prometheus (`http_requests_total`, `http_request_duration_seconds`, `http_errors_total`, `sala_espacos_total` por `tipo`, além das métricas padrão de processo)

## Rodando localmente

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

## Docker

```bash
docker build -t sarc2-sala-service .
```

O `docker-entrypoint.sh` aguarda o MySQL e aplica `prisma migrate deploy` antes de iniciar o servidor.
