# ADR-002 — Spring Cloud Gateway como API Gateway

**Status:** Aceito · **Data:** 2026-07-01

## Contexto
Com múltiplos serviços, o front-end precisaria conhecer N endereços, e preocupações
transversais (autenticação, CORS, rate limit) seriam duplicadas.

## Decisão
Usar **Spring Cloud Gateway** como ponto único de entrada: roteamento declarativo por
prefixo (`/api/reservas/** → lb://reserva-service`), integração nativa com Eureka,
validação de JWT (Resource Server), CORS centralizado e agregação dos documentos OpenAPI.

## Alternativas consideradas
- **Nginx/Kong:** maduros, mas fora do ecossistema Spring exigido no enunciado.
- **Sem gateway:** exporia serviços diretamente e duplicaria segurança.

## Consequências
- (+) Front-end conhece uma única URL; serviços internos não são expostos.
- (+) Ponto natural para métricas de borda e políticas de segurança.
- (−) Ponto único de falha — aceitável no escopo acadêmico; mitigável com réplicas.
