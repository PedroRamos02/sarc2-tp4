# SPEC — frontend (SDD)

> Forneça este arquivo + ADR-009, ADR-006 e o doc `03-frontend.md`.

## Escopo
SPA React 18 + TypeScript (Vite) servida por Nginx. Consome apenas `http://gateway/api`.

## Autenticação
`keycloak-js`, fluxo Authorization Code + PKCE, client `sarc-frontend`, realm `sarc`.
Guardas de rota por role; interceptor axios injeta `Authorization: Bearer` e faz refresh.

## Páginas e critérios de aceite
| Página | Critério principal | US |
|---|---|---|
| `/agenda` (pública) | Sem login, lista reservas do dia com filtros por professor e espaço | US10, US11 |
| `/disponibilidade` | Formulário data + faixa horária → grade de espaços livres/ocupados e equipamentos disponíveis | US02–US04 |
| `/reservas/nova` | Seleção de espaço, horário e equipamentos; em 409 exibe motivo do conflito | US05–US07 |
| `/reservas` | Lista paginada das reservas do professor com botão Cancelar (confirmação) | US08, US09 |
| `/admin/espacos`, `/admin/equipamentos` | CRUDs completos, visíveis só para ADMIN | cadastros |

## Qualidade
- Tipos gerados do OpenAPI (`openapi-typescript`) — proibido `any` nos DTOs.
- Testes: Vitest + Testing Library (componentes de formulário e guardas de rota);
  cobertura enviada ao SonarQube (lcov).
- Acessibilidade básica: labels em inputs, navegação por teclado no calendário.

## Build/Deploy
`Dockerfile` multi-stage (node:22 build → nginx:alpine). Variáveis: `VITE_API_URL`,
`VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM=sarc`, `VITE_KEYCLOAK_CLIENT=sarc-frontend`.
