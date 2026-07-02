# Consulta Service

Agregador **público e somente leitura**, sem banco de dados próprio. É o
serviço que alimenta a página do aluno (sem login): compõe dados de
`professor-service`, `sala-service`, `equipamento-service` e
`reserva-service`.

## Endpoints (todos públicos, sem JWT)

- `GET /salas` — lista de salas ativas
- `GET /laboratorios` — lista de laboratórios ativos
- `GET /professores` — lista de professores ativos
- `GET /equipamentos` — lista de equipamentos ativos
- `GET /grade?data=&espacoId=&professorId=` — grade de horários (disciplina, curso, turma, professor, espaço, horário, equipamentos), montada a partir de `reserva-service` e enriquecida com os demais serviços

### Observabilidade

- `GET /health`, `GET /metrics` — inclui `consulta_publicas_total{tipo}`

## Variáveis de ambiente

Ver [`.env.example`](.env.example) — URLs internas dos 4 serviços consultados.

## Rodando localmente

```bash
cp .env.example .env
npm install
npm run dev
```
