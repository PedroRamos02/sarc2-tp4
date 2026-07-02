# Observabilidade — SARC 2

## Prometheus

`prometheus/prometheus.yml` define os alvos de scraping — um job por
microsserviço (incluindo o `api-gateway`), todos expondo `/metrics` via
`prom-client`. Acesse em `http://localhost:9090` (porta configurável via
`PROMETHEUS_PORT`).

## Grafana

Provisionado automaticamente ao subir o container (sem necessidade de
configuração manual):

- `grafana/provisioning/datasources/datasource.yml` — datasource Prometheus (`http://prometheus:9090`)
- `grafana/provisioning/dashboards/dashboard.yml` — provider apontando para `dashboards-json/`
- `grafana/provisioning/dashboards-json/sarc2-overview.json` — dashboard "SARC 2 - Visão Geral" com:
  - Requisições HTTP por serviço
  - Tempo médio de resposta
  - Taxa de erros HTTP (>=500)
  - Falhas de proxy no gateway
  - Uso de memória e CPU por serviço
  - Reservas ativas, usuários ativos, professores ativos, espaços ativos
  - Conflitos de reserva rejeitados (por tipo: sala/professor/equipamento)
  - Reservas criadas vs. canceladas

Acesse em `http://localhost:3300` (porta configurável via `GRAFANA_PORT`), login padrão `admin`/`admin` (definido em `GRAFANA_ADMIN_USER`/`GRAFANA_ADMIN_PASSWORD`).

## Métricas expostas por todos os serviços

- `http_requests_total{method,route,status_code,service}`
- `http_request_duration_seconds{method,route,status_code,service}`
- `http_errors_total{method,route,status_code,service}`
- Métricas padrão de processo Node.js (`*_process_cpu_seconds_total`, `*_process_resident_memory_bytes`, `*_nodejs_heap_size_used_bytes`, etc. — prefixadas por serviço, agregáveis via `{__name__=~".*_process_cpu_seconds_total"}`)

## Métricas de negócio

| Métrica | Serviço |
|---|---|
| `auth_logins_total{status}`, `auth_usuarios_total` | auth-service |
| `professor_professores_total`, `professor_cursos_total`, `professor_disciplinas_total` | professor-service |
| `sala_espacos_total{tipo}` | sala-service |
| `equipamento_equipamentos_total`, `equipamento_unidades_total` | equipamento-service |
| `reserva_reservas_total`, `reserva_criadas_total`, `reserva_conflitos_total{tipo}`, `reserva_canceladas_total` | reserva-service |
| `consulta_publicas_total{tipo}` | consulta-service |
| `gateway_proxy_errors_total{target}`, `gateway_auth_failures_total{reason}` | api-gateway |
