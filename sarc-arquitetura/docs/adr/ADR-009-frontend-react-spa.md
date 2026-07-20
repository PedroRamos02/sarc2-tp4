# ADR-009 — Front-end como SPA React + TypeScript

**Status:** Aceito · **Data:** 2026-07-01

## Contexto
As funcionalidades do T1 são fortemente interativas (busca de disponibilidade por
data/hora, formulário de reserva, agenda pública) e consomem APIs REST via Gateway.

## Decisão
SPA em **React 18 + TypeScript** com **Vite**, servida por **Nginx** em container
próprio. OIDC com `keycloak-js` (PKCE), dados com TanStack Query, tipos gerados dos
contratos OpenAPI (`openapi-typescript`) — alinhado ao SDD.

## Alternativas consideradas
- **Thymeleaf/server-side:** acoplaria a UI a um serviço backend específico.
- **Next.js (SSR):** benefícios de SSR irrelevantes para app autenticada interna.

## Consequências
- (+) Separação total front/back; deploy independente; tipos sincronizados com a API.
- (−) SEO limitado — irrelevante; a única página pública (agenda) pode ser indexável se necessário.
