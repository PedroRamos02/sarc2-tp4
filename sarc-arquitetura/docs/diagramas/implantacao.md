# Diagrama UML de Implantação (Deployment)

```mermaid
flowchart TB
    subgraph HOST["<<device>> Host de desenvolvimento — Docker Engine"]
        subgraph NET["<<network>> sarc-net (bridge do Docker Compose)"]
            FE["<<container>> frontend<br/>Nginx :80 → host :3000"]
            GW["<<container>> api-gateway :8080"]
            EU["<<container>> discovery-server :8761"]
            CF["<<container>> config-server :8888"]
            US["<<container>> usuario-service :8081"]
            ES["<<container>> espaco-service :8082"]
            EQ["<<container>> equipamento-service :8083"]
            RE["<<container>> reserva-service :8084"]
            KC["<<container>> keycloak :8180"]
            PG[("<<container>> postgres :5432<br/>volume pg-data")]
            OT["<<container>> otel-collector :4317/4318"]
            JG["<<container>> jaeger :16686"]
            PR["<<container>> prometheus :9090"]
            GF["<<container>> grafana :3001"]
            SQ["<<container>> sonarqube :9000<br/>volume sonar-data"]
        end
    end

    NAV["<<device>> Navegador do usuário"] -->|HTTP :3000| FE
    NAV -->|HTTP :8080 /api| GW
    NAV -->|HTTP :8180 login| KC
    FE -.artefatos estáticos.-> NAV
    GW --> US & ES & EQ & RE
    US & ES & EQ & RE --> PG
    KC --> PG
    US & ES & EQ & RE & GW -->|OTLP| OT
    OT --> JG & PR
    GF --> PR & JG
    US & ES & EQ & RE -.-> EU & CF
```

**Portas expostas ao host:** 3000 (front), 8080 (gateway), 8180 (Keycloak),
8761 (Eureka UI), 16686 (Jaeger), 9090 (Prometheus), 3001 (Grafana), 9000 (SonarQube).
Os microserviços de negócio **não** são expostos diretamente — apenas via Gateway.
