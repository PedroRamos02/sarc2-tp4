# SPEC — api-gateway (SDD)

> Forneça este arquivo + ADR-002, ADR-003, ADR-006 e ADR-010 à ferramenta de IA.

## Escopo
Ponto único de entrada HTTP. Roteia, autentica (JWT/Keycloak), aplica CORS e agrega Swagger.
**Não contém regra de negócio.**

## Stack
Java 21 · Spring Boot 3 · `spring-cloud-starter-gateway` · `spring-cloud-starter-netflix-eureka-client`
· `spring-cloud-starter-config` · `spring-boot-starter-oauth2-resource-server` · `springdoc-openapi-starter-webflux-ui`.

## Rotas
| Prefixo | Destino | Auth |
|---|---|---|
| `/api/usuarios/**`, `/api/professores/**` | `lb://usuario-service` | JWT |
| `/api/espacos/**` | `lb://espaco-service` | JWT |
| `/api/equipamentos/**` | `lb://equipamento-service` | JWT |
| `/api/reservas/**`, `/api/disponibilidade` | `lb://reserva-service` | JWT |
| `/api/agenda/**` | `lb://reserva-service` | **permitAll** |
| `/swagger-ui/**`, `/v3/api-docs/**` | agregação local | permitAll |
Remover o prefixo `/api` antes de encaminhar (StripPrefix=1).

## Segurança
- Resource Server JWT: `issuer-uri = http://keycloak:8080/realms/sarc` (interno).
- `permitAll`: `/api/agenda/**`, swagger, `/actuator/health`. Restante: `authenticated()`.
- CORS: origem `http://localhost:3000`, métodos GET/POST/PUT/PATCH/DELETE, header Authorization.

## Observabilidade
OTEL Java Agent (var. `OTEL_SERVICE_NAME=api-gateway`, `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318`). Actuator health/info expostos.

## Critérios de aceite
1. Requisição sem token a `/api/reservas` → 401; com role errada, o serviço destino responde 403.
2. `/api/agenda?data=2026-07-01` responde 200 sem token (US10).
3. `swagger-ui` no gateway lista os 4 serviços de negócio (grupos).
4. Gateway registra-se no Eureka e resolve `lb://reserva-service`.
