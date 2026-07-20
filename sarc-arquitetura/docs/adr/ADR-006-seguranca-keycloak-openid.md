# ADR-006 — Segurança com OpenID Connect e Keycloak

**Status:** Aceito · **Data:** 2026-07-01

## Contexto
O enunciado exige segurança do backend com OpenID e Keycloak. O T1 pede login de
professores (US01) e perfis distintos (professor, aluno, admin — hierarquia USUARIO do T2).

## Decisão
**Keycloak** como Identity Provider (realm `sarc`), fluxo **Authorization Code + PKCE**
no SPA, tokens **JWT** validados no Gateway e em cada serviço
(`spring-boot-starter-oauth2-resource-server`). Roles de realm `PROFESSOR`, `ALUNO`,
`ADMIN` mapeadas para `@PreAuthorize`. O `usuario-service` guarda apenas perfil
(vinculado ao `sub`); senhas ficam exclusivamente no Keycloak.

## Alternativas consideradas
- **Auth própria com JWT caseiro:** reinventa segurança; sem SSO, sem gestão de usuários.
- **Sessões no Gateway:** estado no servidor dificulta escala.

## Consequências
- (+) Padrões abertos (OIDC/OAuth2), console de administração pronto, defesa em profundidade.
- (+) Rota pública `/api/agenda/**` atende US10/US11 sem login.
- (−) Container adicional e configuração de realm — versionada em `keycloak/realm-export.json`.
