# 06 — Qualidade e Monitoramento de Testes (SonarQube)

## Ferramenta escolhida (ADR-008)

**SonarQube Community** em container próprio no Compose (`sonarqube:lts-community`),
analisando todos os módulos backend e o front-end.

## O que é monitorado

| Dimensão | Fonte |
|---|---|
| Cobertura de testes | JaCoCo (`mvn verify` gera `jacoco.xml`); front-end via `vitest --coverage` (lcov) |
| Bugs / vulnerabilidades / code smells | Analisadores Sonar (Java, TS) |
| Duplicação e complexidade | Sonar |
| Quality Gate | Padrão "Sonar way" ajustado: cobertura ≥ 70% em código novo, 0 vulnerabilidades bloqueantes |

## Integração

- Local: `mvn clean verify sonar:sonar -Dsonar.host.url=http://localhost:9000 -Dsonar.token=…`
- CI (GitHub Actions): job `quality` roda testes + análise e **falha o pipeline se o
  Quality Gate reprovar**, impedindo merge.
- Um projeto Sonar por microserviço + um para o front, permitindo acompanhar a saúde de
  cada serviço isoladamente (coerente com o estilo de microserviços).

## Estratégia de testes (referenciada pelas specs SDD)

- **Unitários:** regras de negócio (ex.: detecção de sobreposição de horários — US07).
- **Integração:** repositórios com Testcontainers (PostgreSQL) e controladores com MockMvc + JWT de teste.
- **Contrato:** validação dos endpoints contra o OpenAPI gerado (springdoc + swagger-request-validator).
- **E2E (opcional):** Playwright sobre o Compose completo.
