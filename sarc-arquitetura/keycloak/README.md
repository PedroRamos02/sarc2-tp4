# Keycloak — realm `sarc`
Exportar o realm configurado para `realm-export.json` (importado no start do container):
- Clients: `sarc-frontend` (público, PKCE, redirect http://localhost:3000/*) e `sarc-services` (confidencial).
- Realm roles: PROFESSOR, ALUNO, ADMIN.
- Usuários de teste: prof1/prof1 (PROFESSOR), admin1/admin1 (ADMIN), aluno1/aluno1 (ALUNO).
