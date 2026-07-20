# ADR-007 — Observabilidade baseada em OpenTelemetry

**Status:** Aceito · **Data:** 2026-07-01

## Contexto
O enunciado exige observabilidade com ferramentas baseadas em OTEL. Em microserviços,
uma requisição atravessa gateway e vários serviços; sem tracing distribuído o
diagnóstico é inviável.

## Decisão
Instrumentação automática com **OpenTelemetry Java Agent** em todos os serviços,
exportando via **OTLP** para um **OTel Collector**, que envia traces ao **Jaeger** e
métricas ao **Prometheus**; **Grafana** para dashboards. Logs estruturados em JSON com
`trace_id` para correlação. Propagação W3C Trace Context.

## Alternativas consideradas
- **Micrometer Tracing + Zipkin:** funciona, mas menos aderente a "ferramentas baseadas em OTEL".
- **Instrumentação manual:** custo alto e cobertura irregular.

## Consequências
- (+) Zero código de instrumentação; trace ponta a ponta (gateway → serviços → JDBC).
- (+) Collector desacopla os backends (trocar Jaeger por Tempo sem tocar nos serviços).
- (−) ~4 containers extras de observabilidade — aceitável e isolado no Compose.
