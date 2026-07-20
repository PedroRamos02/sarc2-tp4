# SARC — Sistema de Reserva de Recursos Acadêmicos
## Parte 3 — Desenho da Arquitetura

**Construção de Software — TDE Parte 3**
Bruno Souza Sa Brito · Pedro Henrique Ramos Araujo · Vitória Gabriela Luz Fröhlich

---

## Objetivo deste pacote

Este repositório contém a documentação de arquitetura do sistema SARC, organizada para
apoiar **SDD (Spec Driven Development)** com ferramentas de IA: cada serviço possui uma
especificação `.md` autocontida que pode ser fornecida a um assistente de código
(Claude Code, Copilot, etc.) para gerar a implementação correspondente.

## Estrutura

```
sarc-arquitetura/
├── README.md                     ← este arquivo
├── docker-compose.yml            ← orquestração de todos os containers
├── docs/
│   ├── arquitetura/
│   │   ├── 01-visao-geral.md     ← visão C4 (contexto e containers) + diagramas
│   │   ├── 02-servicos-e-rotas.md← catálogo de microserviços e rotas REST
│   │   ├── 03-frontend.md        ← arquitetura do front-end
│   │   ├── 04-seguranca.md       ← OpenID Connect + Keycloak
│   │   ├── 05-observabilidade.md ← OpenTelemetry, métricas, traces e logs
│   │   └── 06-qualidade.md       ← SonarQube e pipeline de qualidade
│   ├── diagramas/
│   │   ├── componentes.md        ← diagrama UML de componentes (Mermaid)
│   │   ├── sequencia-reserva.md  ← diagrama UML de sequência do fluxo de reserva
│   │   └── implantacao.md        ← diagrama UML de implantação (deployment)
│   ├── adr/                      ← Architecture Decision Records (ADR-001 … ADR-010)
│   └── specs/                    ← especificações SDD por serviço
│       ├── spec-gateway.md
│       ├── spec-usuario-service.md
│       ├── spec-espaco-service.md
│       ├── spec-equipamento-service.md
│       ├── spec-reserva-service.md
│       └── spec-frontend.md
├── infra/
│   ├── init-schemas.sql          ← schemas e usuários do PostgreSQL (ADR-005)
│   ├── otel-collector-config.yaml← pipeline OTEL (traces→Jaeger, métricas→Prometheus)
│   └── prometheus.yml
├── keycloak/README.md            ← configuração do realm `sarc`
└── openapi/
    └── reserva-service.yaml      ← exemplo de contrato OpenAPI 3
```

## Resumo da arquitetura

- **Estilo:** microserviços com escopo pequeno e delimitado (um serviço por agregado de domínio).
- **Stack backend:** Java 21 + Spring Boot 3 + Spring Cloud (Gateway, Eureka, Config Server).
- **Documentação:** springdoc-openapi (anotações Swagger, padrão OpenAPI 3) em todos os serviços.
- **Banco de dados:** PostgreSQL compartilhado (schemas separados por serviço) — ver ADR-005.
- **Segurança:** Keycloak como Identity Provider (OpenID Connect / OAuth2), validação de JWT no Gateway e nos serviços — ver ADR-006.
- **Observabilidade:** OpenTelemetry (agente Java + Collector) exportando traces para Jaeger, métricas para Prometheus e dashboards no Grafana — ver ADR-007.
- **Qualidade:** SonarQube analisando cobertura (JaCoCo) e code smells no CI — ver ADR-008.
- **Front-end:** SPA em React + TypeScript (Vite), consumindo a API exclusivamente via Gateway — ver ADR-009.
- **Orquestração:** Docker Compose com um container por serviço.

## Como usar com SDD + IA

1. Leia `docs/arquitetura/01-visao-geral.md` para entender o todo.
2. Para implementar um serviço, forneça à ferramenta de IA:
   - a spec do serviço (`docs/specs/spec-<serviço>.md`);
   - os ADRs referenciados nela;
   - o `docker-compose.yml` como contexto de infraestrutura.
3. Cada spec define: escopo, modelo de dados, rotas, regras de negócio, segurança,
   observabilidade e critérios de aceite rastreáveis às user stories (US01–US11) do T1.
