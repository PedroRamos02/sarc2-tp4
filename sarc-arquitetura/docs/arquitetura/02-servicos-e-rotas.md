# 02 — Catálogo de Serviços e Rotas

Convenções: JSON, versionamento implícito v1, paginação `?page=&size=`,
erros no formato RFC 7807 (Problem Details). Todas as rotas expostas ao cliente
passam pelo Gateway com prefixo `/api`. Papéis (roles Keycloak): `PROFESSOR`, `ALUNO`, `ADMIN`.

## api-gateway (porta 8080)

| Prefixo | Destino (Eureka) | Autenticação |
|---|---|---|
| `/api/usuarios/**` | `lb://usuario-service` | JWT |
| `/api/espacos/**` | `lb://espaco-service` | JWT (GET liberado p/ autenticados) |
| `/api/equipamentos/**` | `lb://equipamento-service` | JWT |
| `/api/reservas/**` | `lb://reserva-service` | JWT |
| `/api/agenda/**` | `lb://reserva-service` | **pública** (US10, US11) |
| `/swagger/**` | agrega os `/v3/api-docs` dos serviços | pública |

## usuario-service (8081) — schema `usuario`

| Método | Rota | Papel | US |
|---|---|---|---|
| POST | `/usuarios` | ADMIN | — |
| GET | `/usuarios/{id}` | autenticado | — |
| GET | `/usuarios/me` | autenticado | US01 |
| GET | `/professores` | autenticado | US11 |
| GET | `/professores/{id}` | autenticado | US11 |
| PUT | `/usuarios/{id}` | ADMIN ou o próprio | — |
| DELETE | `/usuarios/{id}` | ADMIN | — |

## espaco-service (8082) — schema `espaco`

| Método | Rota | Papel | US |
|---|---|---|---|
| POST | `/espacos` | ADMIN | US (cadastro de salas/labs) |
| GET | `/espacos` (filtros: `tipo`, `capacidadeMin`, `localizacao`) | autenticado | US02, US03 |
| GET | `/espacos/{id}` | autenticado | US02 |
| PUT | `/espacos/{id}` | ADMIN | — |
| DELETE | `/espacos/{id}` | ADMIN | — |

`tipo ∈ {sala, laboratorio}` (CHECK do modelo T2).

## equipamento-service (8083) — schema `equipamento`

| Método | Rota | Papel | US |
|---|---|---|---|
| POST | `/equipamentos` | ADMIN | US (cadastro de equipamentos) |
| GET | `/equipamentos` (filtros: `tipo`, `status`) | autenticado | US04 |
| GET | `/equipamentos/{id}` | autenticado | US04 |
| PUT | `/equipamentos/{id}` | ADMIN | — |
| PATCH | `/equipamentos/{id}/status` | ADMIN | — |
| DELETE | `/equipamentos/{id}` | ADMIN | — |

## reserva-service (8084) — schema `reserva`

| Método | Rota | Papel | US |
|---|---|---|---|
| POST | `/reservas` | PROFESSOR | US05, US06, US07 |
| GET | `/reservas/minhas` | PROFESSOR | US09 |
| GET | `/reservas/{id}` | PROFESSOR/ADMIN | — |
| DELETE | `/reservas/{id}` (cancelamento lógico → `status=CANCELADA`) | PROFESSOR (dono) | US08 |
| GET | `/disponibilidade?espacoId=&data=&horaInicio=&horaFim=` | autenticado | US02, US03 |
| GET | `/agenda?data=&professorId=&espacoId=` | **pública** | US10, US11 |

**Regra de conflito (US07):** rejeitar com `409 Conflict` quando existir reserva com
`status=CONFIRMADA` para o mesmo `id_espaco` e `data` com interseção de intervalo
(`hora_inicio < :fim AND hora_fim > :inicio`). O mesmo vale para equipamentos incluídos.
Invariante do T2: `hora_inicio < hora_fim`.

## Documentação OpenAPI

Todos os serviços usam `springdoc-openapi-starter-webmvc-ui`:
`/swagger-ui.html` e `/v3/api-docs` em cada serviço; o Gateway agrega tudo em um
Swagger UI único (ver ADR-010 e specs).
