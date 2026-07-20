# ADR-005 — PostgreSQL compartilhado com schema por serviço

**Status:** Aceito · **Data:** 2026-07-01

## Contexto
O enunciado permite bases compartilhadas. O modelo relacional do T2 possui FKs entre
agregados (ex.: RESERVA → PROFESSOR, ESPACO), e manter um banco por serviço elevaria o
custo operacional do trabalho.

## Decisão
Uma única instância **PostgreSQL 16** com **um schema por serviço**
(`usuario`, `espaco`, `equipamento`, `reserva`). Cada serviço tem seu próprio usuário de
banco com permissão **apenas no seu schema**; o acesso a dados de outro agregado ocorre
**via API do serviço dono**, nunca por join direto entre schemas. FKs entre agregados do
modelo T2 (ex.: `reserva.id_espaco`) tornam-se referências lógicas validadas na aplicação.
Migrações por serviço com Flyway.

## Alternativas consideradas
- **Database-per-service:** isolamento máximo, custo desnecessário aqui.
- **Schema único compartilhado:** acoplamento forte; qualquer serviço poderia alterar tudo.

## Consequências
- (+) Operação simples (1 container, 1 backup) mantendo fronteiras lógicas de microserviços.
- (−) Consistência entre agregados é eventual/aplicacional (ex.: espaço excluído com
  reservas futuras) — mitigada por regras de negócio (impedir exclusão com reservas ativas).
