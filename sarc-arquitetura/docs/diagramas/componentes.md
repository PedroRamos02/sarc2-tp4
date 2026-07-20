# Diagrama UML de Componentes

```mermaid
flowchart LR
    subgraph FE["<<component>> Front-end SPA"]
        UI["Páginas React"]
        AUTH["Módulo OIDC (keycloak-js)"]
        API["Clientes HTTP (axios)"]
        UI --> AUTH & API
    end

    subgraph GW["<<component>> api-gateway"]
        ROUTES["RouteLocator"]
        JWTF["Filtro JWT (Resource Server)"]
        AGG["Agregador Swagger"]
    end

    subgraph INFRA["<<components>> Spring Cloud"]
        EUREKA["discovery-server (Eureka)"]
        CONFIG["config-server"]
    end

    subgraph USR["<<component>> usuario-service"]
        USRC["UsuarioController"] --> USRS["UsuarioService"] --> USRR["UsuarioRepository"]
    end
    subgraph ESP["<<component>> espaco-service"]
        ESPC["EspacoController"] --> ESPS["EspacoService"] --> ESPR["EspacoRepository"]
    end
    subgraph EQP["<<component>> equipamento-service"]
        EQPC["EquipamentoController"] --> EQPS["EquipamentoService"] --> EQPR["EquipamentoRepository"]
    end
    subgraph RES["<<component>> reserva-service"]
        RESC["ReservaController / AgendaController"] --> RESS["ReservaService<br/>(regra de conflito US07)"] --> RESR["ReservaRepository"]
        RESS --> FEIGN["Clients Feign:<br/>EspacoClient, EquipamentoClient"]
    end

    API -->|REST/JSON + JWT| GW
    ROUTES --> USRC & ESPC & EQPC & RESC
    FEIGN -->|lb://| ESP & EQP
    GW & USR & ESP & EQP & RES -.registro/descoberta.-> EUREKA
    GW & USR & ESP & EQP & RES -.configuração.-> CONFIG

    KC["<<external>> Keycloak (OIDC)"]
    AUTH --> KC
    JWTF -.JWKS.-> KC

    DB[("<<database>> PostgreSQL<br/>schemas: usuario | espaco | equipamento | reserva")]
    USRR & ESPR & EQPR & RESR --> DB
```

**Notas**

- Interfaces providas: cada serviço expõe sua API REST descrita em OpenAPI (`/v3/api-docs`).
- Interfaces requeridas: `reserva-service` consome `espaco-service` e `equipamento-service`
  (validação de existência/status) via OpenFeign com descoberta pelo Eureka.
- O Gateway é o único componente exposto ao front-end.
