# Reserva Service

Núcleo de regras de negócio do SARC 2: criação, edição, cancelamento de
reservas de sala/laboratório e equipamentos, com detecção de conflitos de
horário. Orquestra chamadas HTTP síncronas para `sala-service`,
`equipamento-service` e `professor-service` a fim de validar os dados antes
de confirmar uma reserva.

## Banco de dados

- Database: `reserva_db` (MySQL, via Prisma)
- Tabelas: `reservas`, `reserva_equipamentos`

## Regras de negócio implementadas

1. **Conflito de sala**: rejeita (`409`) se já existir reserva `ATIVA` no mesmo espaço/data com sobreposição de horário.
2. **Conflito de professor**: rejeita (`409`) se o professor já tiver outra reserva ativa sobreposta.
3. **Disponibilidade de equipamento**: soma das quantidades já reservadas no intervalo sobreposto + quantidade solicitada não pode exceder `quantidadeTotal` do equipamento.
4. **Autorização**: professor só edita/cancela suas próprias reservas (`criadoPor`); admin pode alterar qualquer uma.
5. `createdAt`, `updatedAt` e `criadoPor` são registrados automaticamente.

## Endpoints

### Público (sem JWT — consumido pelo `consulta-service`)

- `GET /reservas/grade?data=&espacoId=&professorId=` — grade de horários (sem observações nem `criadoPor`)

### Protegidos (JWT via api-gateway, roles `ADMIN` ou `PROFESSOR`)

- `GET /reservas` — lista (professor vê apenas as próprias; admin vê todas, com filtros `professorId`, `espacoId`, `data`, `status`)
- `GET /reservas/:id`
- `POST /reservas` — cria reserva (valida sala, professor, conflitos e equipamentos)
- `PUT /reservas/:id` — edita (revalida conflitos)
- `PATCH /reservas/:id/cancelar`
- `GET /reservas/disponibilidade?espacoId=&data=&horaInicio=&horaFim=` — checagem rápida antes de submeter

### Observabilidade

- `GET /health`, `GET /metrics` — inclui `reserva_reservas_total`, `reserva_criadas_total`, `reserva_conflitos_total{tipo}`, `reserva_canceladas_total`

## Variáveis de ambiente

Ver [`.env.example`](.env.example) — inclui as URLs internas de `sala-service`, `equipamento-service` e `professor-service`, consultadas via seus endpoints públicos de leitura.

## Rodando localmente

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```
