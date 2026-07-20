# ADR-004 — Configuração centralizada com Spring Cloud Config

**Status:** Aceito · **Data:** 2026-07-01

## Contexto
Parâmetros comuns (URL do Keycloak, datasource, endpoint OTLP, regras de log) se repetem
em todos os serviços; mudanças exigiriam rebuild de várias imagens.

## Decisão
Usar **Spring Cloud Config Server** com backend Git (repositório `sarc-config`), servindo
`application.yml` (comum) e `<serviço>.yml` (específico), com perfis `dev`/`prod`.
Segredos entram por variáveis de ambiente do Compose, nunca no Git.

## Alternativas consideradas
- **Só variáveis de ambiente:** simples, mas sem versionamento/auditoria de configuração.
- **Kubernetes ConfigMaps:** fora do escopo (Compose).

## Consequências
- (+) Configuração versionada, auditável e consistente entre serviços.
- (+) `/actuator/refresh` permite atualizar propriedades sem rebuild.
- (−) Dependência de inicialização (config-server primeiro) — resolvida com healthcheck + `depends_on`.
