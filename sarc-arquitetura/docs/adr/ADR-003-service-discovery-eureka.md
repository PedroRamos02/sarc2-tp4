# ADR-003 — Service Discovery com Netflix Eureka (Spring Cloud)

**Status:** Aceito · **Data:** 2026-07-01

## Contexto
O Gateway e os clients Feign precisam localizar instâncias de serviços sem endereços
fixos, permitindo escalar containers sem reconfiguração.

## Decisão
Usar **Eureka Server** (`spring-cloud-starter-netflix-eureka-server`). Cada serviço se
registra na inicialização (`eureka.client.service-url.defaultZone`) e o balanceamento é
feito pelo Spring Cloud LoadBalancer (`lb://<service-id>`).

## Alternativas consideradas
- **DNS do Docker Compose:** suficiente para 1 instância, mas não oferece health-based
  discovery nem atende ao padrão pedido no enunciado.
- **Consul:** mais recursos, porém maior curva de aprendizado.

## Consequências
- (+) Escala horizontal transparente; dashboard em :8761 facilita diagnóstico.
- (−) Mais um container e dependência de inicialização (mitigado com healthchecks no Compose).
