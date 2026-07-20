# 03 — Arquitetura do Front-End

## Stack (ADR-009)

- **React 18 + TypeScript**, build com **Vite**, servido por **Nginx** em container próprio.
- Roteamento: React Router. Estado de servidor: TanStack Query. UI: Tailwind CSS.
- Autenticação: OIDC Authorization Code + PKCE via `keycloak-js` (ADR-006).
- Toda chamada de API passa pelo Gateway (`VITE_API_URL=http://localhost:8080/api`),
  com o token JWT no header `Authorization: Bearer`.

## Mapa de páginas × user stories

| Rota SPA | Página | Papel | US |
|---|---|---|---|
| `/login` | Redirecionamento para o Keycloak | todos | US01 |
| `/agenda` | **Agenda pública** — reservas do dia, filtro por professor e espaço | público (sem login) | US10, US11 |
| `/disponibilidade` | Busca de salas/labs por data e horário + status de equipamentos | PROFESSOR | US02, US03, US04 |
| `/reservas/nova` | Formulário de reserva (espaço + equipamentos + horário); exibe conflito 409 | PROFESSOR | US05, US06, US07 |
| `/reservas` | Minhas reservas (listar / cancelar) | PROFESSOR | US08, US09 |
| `/admin/espacos` | CRUD de salas e laboratórios | ADMIN | cadastro de espaços |
| `/admin/equipamentos` | CRUD de equipamentos | ADMIN | cadastro de equipamentos |

## Estrutura de pastas sugerida

```
frontend/
├── src/
│   ├── api/            # clientes HTTP por serviço (axios + interceptor JWT)
│   ├── auth/           # KeycloakProvider, guards de rota por role
│   ├── pages/          # uma pasta por página acima
│   ├── components/     # componentes compartilhados (Calendar, TimeRangePicker…)
│   └── types/          # DTOs TypeScript espelhando os schemas OpenAPI
└── Dockerfile          # build Vite + Nginx
```

Os tipos em `src/types` podem ser **gerados automaticamente** a partir dos contratos
OpenAPI dos serviços (`openapi-typescript`), reforçando o fluxo Spec Driven Development.

## Decisões de UX relevantes

- A agenda pública (US10/US11) não exige login: é a única rota que consome `/api/agenda/**`.
- Conflito de horário (US07) é tratado no backend; o front apenas exibe a mensagem do
  `409 Problem Details` e sugere horários livres retornados por `/disponibilidade`.
- Cancelamento (US08) pede confirmação e atualiza a lista via invalidação de cache do Query.
