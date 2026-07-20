# ADR-001 — Estilo arquitetural de microserviços

**Status:** Aceito · **Data:** 2026-07-01

## Contexto
O enunciado do T3 exige serviços de escopo pequeno e delimitado, implantados em
containers separados e orquestrados com Docker Compose. O domínio (T1/T2) possui
agregados naturais: usuários, espaços, equipamentos e reservas.

## Decisão
Adotar microserviços, com **um serviço por agregado de domínio**:
`usuario-service`, `espaco-service`, `equipamento-service` e `reserva-service`,
além dos serviços de infraestrutura (gateway, discovery, config).
Cada serviço é um projeto Spring Boot independente, com build, container e ciclo de
deploy próprios.

## Alternativas consideradas
- **Monólito modular:** mais simples, porém não atende ao enunciado.
- **Serviço por user story:** granularidade excessiva; alto custo de orquestração.

## Consequências
- (+) Escopos claros, times/IA podem implementar serviços em paralelo a partir das specs.
- (+) Escala e falha isoladas por serviço.
- (−) Complexidade operacional (discovery, config, observabilidade) — mitigada pelos ADR-002/003/004/007.
- (−) Consultas que cruzam agregados exigem chamadas entre serviços (ver ADR-005).
