# SPEC — reserva-service (SDD)

> Serviço central do domínio. Forneça este arquivo + ADR-001, ADR-005, ADR-006, ADR-010
> e o diagrama `sequencia-reserva.md`. Porta 8084 · schema `reserva`.

## Escopo
Criação/cancelamento de reservas com controle de conflitos (US05–US09),
consulta de disponibilidade (US02/US03) e **agenda pública** (US10/US11).

## Modelo de dados (Flyway V1, do modelo T2)
```sql
CREATE TABLE reserva.reserva (
  id_reserva   BIGSERIAL PRIMARY KEY,
  data         DATE NOT NULL,
  hora_inicio  TIME NOT NULL,
  hora_fim     TIME NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA'
               CHECK (status IN ('CONFIRMADA','CANCELADA')),
  observacao   VARCHAR(255),
  id_professor BIGINT NOT NULL,   -- referência lógica a usuario-service
  id_espaco    BIGINT NOT NULL,   -- referência lógica a espaco-service
  CHECK (hora_inicio < hora_fim)
);
CREATE INDEX idx_reserva_espaco_data ON reserva.reserva (id_espaco, data) WHERE status = 'CONFIRMADA';
CREATE TABLE reserva.reserva_equipamento (
  id_reserva     BIGINT NOT NULL REFERENCES reserva.reserva,
  id_equipamento BIGINT NOT NULL,  -- referência lógica a equipamento-service
  PRIMARY KEY (id_reserva, id_equipamento)
);
```

## Integrações (OpenFeign via Eureka)
- `EspacoClient` → `GET lb://espaco-service/espacos/{id}`
- `EquipamentoClient` → `GET lb://equipamento-service/equipamentos/{id}`
- `UsuarioClient` → `GET lb://usuario-service/professores/{id}` (enriquecer agenda)
Fallback: se um client falhar, responder 503 Problem Details ("dependência indisponível").

## Rotas
| Método | Rota | Role | US |
|---|---|---|---|
| POST `/reservas` | PROFESSOR | US05/US06/US07 |
| GET `/reservas/minhas?page=&size=` | PROFESSOR | US09 |
| GET `/reservas/{id}` | PROFESSOR (dono) / ADMIN | — |
| DELETE `/reservas/{id}` | PROFESSOR (dono) | US08 — muda `status=CANCELADA` |
| GET `/disponibilidade?espacoId=&data=&horaInicio=&horaFim=` | autenticado | US02/US03 |
| GET `/agenda?data=&professorId=&espacoId=` | **pública** | US10/US11 |

## Regras de negócio
1. **Conflito (US07):** dentro de transação com lock
   (`SELECT … FOR UPDATE` nas reservas do espaço/data), rejeitar com **409** se
   `hora_inicio < :fim AND hora_fim > :inicio` para reserva CONFIRMADA do mesmo espaço.
   Aplicar a mesma checagem para cada equipamento solicitado (join com `reserva_equipamento`).
2. `id_professor` extraído do token (via `/usuarios/me`), nunca do body.
3. Equipamentos devem existir e estar `DISPONIVEL` no momento da reserva.
4. Cancelamento apenas pelo dono e apenas de reservas futuras; idempotente.
5. Reserva não pode ser criada para data passada.
6. Métrica custom `sarc.reserva.conflitos` (counter) incrementada a cada 409 (ADR-007).

## DTOs
`ReservaRequest {espacoId, data, horaInicio, horaFim, observacao?, equipamentoIds[]}` ·
`ReservaResponse {id, data, horaInicio, horaFim, status, espaco{...}, equipamentos[...], professor{id,nome}}` ·
`AgendaItemResponse {data, horaInicio, horaFim, espacoNome, localizacao, professorNome}`.

## Testes (Sonar ≥ 70%; foco máximo aqui)
- Unit da regra de sobreposição: casos borda (encosta no início/fim → sem conflito;
  contém, contido, cruza início, cruza fim → conflito).
- Integração: Testcontainers + WireMock para os Feign clients; concorrência
  (2 POSTs simultâneos no mesmo horário → exatamente um 201 e um 409).

## Critérios de aceite
1. Reserva válida → 201 com equipamentos vinculados (transação única).
2. Sobreposição → 409 com Problem Details explicando o conflito.
3. `/agenda` responde sem token e nomeia professor e espaço (US10/US11).
4. Cancelar reserva de outro professor → 403.
