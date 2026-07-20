# 04 — Segurança: OpenID Connect + Keycloak

## Visão (ADR-006)

O **Keycloak** é o Identity Provider do sistema. Nenhum microserviço armazena senha:
a tabela `USUARIO.senha` do modelo T2 é substituída pela credencial gerida no Keycloak,
e o `usuario-service` guarda apenas dados de perfil, ligados ao `sub` do token.

- **Realm:** `sarc`
- **Clients:**
  - `sarc-frontend` — público, Authorization Code + PKCE (SPA);
  - `sarc-services` — confidencial, usado para comunicação service-to-service quando necessário (client credentials).
- **Roles de realm:** `PROFESSOR`, `ALUNO`, `ADMIN` (espelham a hierarquia USUARIO→PROFESSOR/ALUNO/ADMIN do T2).

## Fluxo de autenticação (US01)

1. SPA redireciona para o Keycloak (Authorization Code + PKCE).
2. Keycloak autentica e devolve `access_token` (JWT) + `refresh_token`.
3. SPA envia `Authorization: Bearer <JWT>` ao Gateway.
4. **Gateway** valida assinatura/expiração via JWKS (`spring-boot-starter-oauth2-resource-server`)
   e bloqueia requisições não autenticadas (exceto `/api/agenda/**` e Swagger).
5. **Cada microserviço** também atua como Resource Server (defesa em profundidade) e aplica
   autorização fina com `@PreAuthorize("hasRole('ADMIN')")` etc.

## Matriz de autorização (resumo)

| Recurso | ALUNO | PROFESSOR | ADMIN |
|---|---|---|---|
| Agenda pública (`/agenda`) | ✔ (até sem login) | ✔ | ✔ |
| Consultar espaços/equipamentos | ✔ | ✔ | ✔ |
| Criar/cancelar reserva | ✖ | ✔ (somente as próprias) | ✔ |
| CRUD de espaços/equipamentos/usuários | ✖ | ✖ | ✔ |

## Regras adicionais

- **Ownership:** `reserva-service` compara o `sub` do JWT com `id_professor` da reserva
  antes de permitir cancelamento (US08).
- **CORS** configurado apenas no Gateway, para a origem do front-end.
- Comunicação interna na rede do Docker Compose; apenas Gateway, Keycloak e front expostos ao host.
- Tokens de curta duração (5 min) + refresh; logout via endpoint OIDC do Keycloak.
