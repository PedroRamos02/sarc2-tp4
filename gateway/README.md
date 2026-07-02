# API Gateway

Ponto único de entrada externo do SARC 2. Responsável por:

- Roteamento (proxy HTTP) para os 6 microsserviços internos
- Verificação de JWT (quando presente) e injeção de headers de identidade (`x-user-id`, `x-user-role`, `x-user-professor-id`, `x-user-nome`) para os serviços de destino
- Rate limiting e cabeçalhos de segurança (helmet)
- CORS
- Métricas de borda (Prometheus)

A autorização fina por perfil (ex: "só ADMIN cadastra sala") é responsabilidade de cada microsserviço — o gateway apenas garante que o token, quando enviado, é válido, e repassa a identidade decodificada.

## Roteamento

| Prefixo externo | Serviço de destino | Rota interna equivalente |
|---|---|---|
| `POST /api/auth/login` | auth-service | `POST /login` |
| `GET /api/auth/me` | auth-service | `GET /me` |
| `GET /api/usuarios` | auth-service | `GET /usuarios` |
| `/api/professores/*` | professor-service | `/professores/*` |
| `/api/cursos/*` | professor-service | `/cursos/*` |
| `/api/disciplinas/*` | professor-service | `/disciplinas/*` |
| `/api/espacos/*` | sala-service | `/espacos/*` |
| `/api/equipamentos/*` | equipamento-service | `/equipamentos/*` |
| `/api/reservas/*` | reserva-service | `/reservas/*` |
| `/api/consulta/*` | consulta-service | `/*` (rotas públicas de consulta) |

## Variáveis de ambiente

Ver [`.env.example`](.env.example). `JWT_SECRET` deve ser **idêntico** ao do `auth-service`, pois o gateway apenas verifica a assinatura (quem assina é o auth-service).

## Endpoints próprios

- `GET /health` — healthcheck
- `GET /metrics` — métricas Prometheus (`http_requests_total`, `http_request_duration_seconds`, `gateway_proxy_errors_total`, `gateway_auth_failures_total`)

## Rodando localmente

```bash
cp .env.example .env
npm install
npm run dev
```

## Docker

```bash
docker build -t sarc2-api-gateway .
```
