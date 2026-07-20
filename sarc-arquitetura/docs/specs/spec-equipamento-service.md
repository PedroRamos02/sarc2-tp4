# SPEC — equipamento-service (SDD)

> Forneça este arquivo + ADR-005, ADR-006, ADR-010. Porta 8083 · schema `equipamento`.

## Escopo
CRUD de equipamentos e controle de status (US04; cadastro pelo Admin).

## Modelo de dados (Flyway V1, do modelo T2)
```sql
CREATE TABLE equipamento.equipamento (
  id_equipamento BIGSERIAL PRIMARY KEY,
  nome           VARCHAR(120) NOT NULL,
  tipo           VARCHAR(40)  NOT NULL,           -- notebook, projetor, ...
  patrimonio     VARCHAR(30)  NOT NULL UNIQUE,
  status         VARCHAR(20)  NOT NULL DEFAULT 'DISPONIVEL'
                 CHECK (status IN ('DISPONIVEL','MANUTENCAO','INDISPONIVEL')),
  id_admin       BIGINT NOT NULL                  -- referência lógica (ADR-005)
);
```

## Rotas
| Método | Rota | Role | Regras |
|---|---|---|---|
| POST `/equipamentos` | ADMIN | patrimônio único → 409 |
| GET `/equipamentos?tipo=&status=&page=&size=` | autenticado | US04 |
| GET `/equipamentos/{id}` | autenticado | 404 |
| PUT `/equipamentos/{id}` | ADMIN | — |
| PATCH `/equipamentos/{id}/status` | ADMIN | body `{status}`; valida enum |
| DELETE `/equipamentos/{id}` | ADMIN | 204 |

## DTOs
`EquipamentoRequest {nome, tipo, patrimonio}` · `EquipamentoResponse {id, nome, tipo, patrimonio, status}` · `StatusUpdateRequest {status}`.

## Critérios de aceite
1. Patrimônio duplicado → 409 Problem Details.
2. `GET /equipamentos?status=DISPONIVEL` só retorna disponíveis (consumido pelo reserva-service).
3. Swagger UI documenta o enum de status com exemplos.
