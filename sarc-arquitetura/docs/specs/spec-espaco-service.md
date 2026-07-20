# SPEC — espaco-service (SDD)

> Forneça este arquivo + ADR-005, ADR-006, ADR-010. Porta 8082 · schema `espaco`.

## Escopo
CRUD de salas e laboratórios (US02, US03; cadastro pelo Admin).

## Modelo de dados (Flyway V1, do modelo T2)
```sql
CREATE TABLE espaco.espaco (
  id_espaco   BIGSERIAL PRIMARY KEY,
  nome        VARCHAR(120) NOT NULL,
  tipo        VARCHAR(20)  NOT NULL CHECK (tipo IN ('sala','laboratorio')),
  capacidade  INT NOT NULL CHECK (capacidade > 0),
  localizacao VARCHAR(160) NOT NULL,
  id_admin    BIGINT NOT NULL,           -- referência lógica a usuario-service (ADR-005)
  ativo       BOOLEAN NOT NULL DEFAULT TRUE
);
```

## Rotas
| Método | Rota | Role | Regras |
|---|---|---|---|
| POST `/espacos` | ADMIN | `id_admin` = usuário do token; valida CHECKs |
| GET `/espacos?tipo=&capacidadeMin=&localizacao=&page=&size=` | autenticado | filtros combináveis (US02/US03) |
| GET `/espacos/{id}` | autenticado | 404 se inexistente/inativo |
| PUT `/espacos/{id}` | ADMIN | — |
| DELETE `/espacos/{id}` | ADMIN | **soft delete** (`ativo=false`) para preservar reservas históricas |

## DTOs
`EspacoRequest {nome, tipo, capacidade, localizacao}` · `EspacoResponse {id, nome, tipo, capacidade, localizacao}`.

## Observabilidade / Docs / Erros
OTEL agent (`OTEL_SERVICE_NAME=espaco-service`); springdoc com exemplos; RFC 7807.

## Critérios de aceite
1. `GET /espacos?tipo=laboratorio&capacidadeMin=30` retorna apenas labs com capacidade ≥ 30.
2. POST com `tipo=auditorio` → 400 (CHECK do T2).
3. DELETE mantém a linha com `ativo=false` e some das listagens.
