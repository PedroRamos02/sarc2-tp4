# 05 — Observabilidade com OpenTelemetry (OTEL)

## Estratégia (ADR-007)

Instrumentação **sem código** com o **OpenTelemetry Java Agent** anexado a cada serviço
Spring (`JAVA_TOOL_OPTIONS=-javaagent:/otel/opentelemetry-javaagent.jar`), exportando
pelo protocolo **OTLP** para um **OTel Collector** central, que roteia:

| Sinal | Backend | Uso |
|---|---|---|
| Traces | **Jaeger** | Rastrear uma requisição do Gateway até o banco (ex.: POST /reservas → espaco-service → equipamento-service) |
| Métricas | **Prometheus** | Latência p95 por rota, taxa de erro, JVM, conexões de pool |
| Logs | stdout estruturado (JSON) coletado pelo driver do Docker; correlação por `trace_id` injetado via MDC | Diagnóstico |
| Dashboards/alertas | **Grafana** | Visualização unificada |

## Pipeline do Collector (`otel-collector-config.yaml`)

```yaml
receivers:
  otlp:
    protocols: { grpc: {}, http: {} }
processors:
  batch: {}
exporters:
  otlp/jaeger:
    endpoint: jaeger:4317
    tls: { insecure: true }
  prometheus:
    endpoint: 0.0.0.0:8889
service:
  pipelines:
    traces:  { receivers: [otlp], processors: [batch], exporters: [otlp/jaeger] }
    metrics: { receivers: [otlp], processors: [batch], exporters: [prometheus] }
```

## Convenções

- `service.name` = nome do container (`reserva-service`, `api-gateway`…), definido por
  `OTEL_SERVICE_NAME`; `deployment.environment=dev`.
- Propagação de contexto **W3C Trace Context** (padrão do agente) — os spans do Gateway,
  dos serviços e das chamadas Feign/JDBC formam um único trace.
- Health checks expostos via Spring Actuator (`/actuator/health`) e usados pelo
  `depends_on/healthcheck` do Compose.

## Métricas mínimas acompanhadas

- `http.server.request.duration` (p95 por serviço e rota);
- taxa de respostas 4xx/5xx no Gateway;
- contagem de conflitos de reserva (métrica de negócio custom `sarc.reserva.conflitos`,
  via Micrometer → OTLP) — indicador direto da US07.
