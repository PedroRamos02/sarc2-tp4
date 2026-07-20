# ADR-008 — SonarQube para monitoramento de testes e qualidade

**Status:** Aceito · **Data:** 2026-07-01

## Contexto
O enunciado pede uma ferramenta de monitoramento de testes (SonarQube ou outra).
Precisamos acompanhar cobertura, bugs e code smells por serviço e bloquear regressões.

## Decisão
**SonarQube Community (LTS)** em container no Compose, com um projeto por microserviço e
um para o front-end. Cobertura via **JaCoCo** (backend) e **lcov/vitest** (front).
**Quality Gate** obrigatório no CI: cobertura ≥ 70% em código novo e zero
vulnerabilidades bloqueantes; reprovação falha o pipeline.

## Alternativas consideradas
- **Codecov/Coveralls:** apenas cobertura, sem análise estática integrada.
- **Somente relatórios JaCoCo:** sem histórico, gates ou visão consolidada.

## Consequências
- (+) Visão histórica de qualidade por serviço; gate automatizado antes do merge.
- (−) SonarQube consome memória (~2 GB) — perfil Compose `tools` opcional para ligá-lo sob demanda.
