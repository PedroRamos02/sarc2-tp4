# SPEC — usuario-service (SDD)

> Forneça este arquivo + ADR-005, ADR-006, ADR-010. Porta 8081 · schema `usuario`.

## Escopo
Perfis de usuários (dados cadastrais) e consulta de professores. Autenticação/senha são do Keycloak;
este serviço vincula o perfil ao `sub` do token (coluna `keycloak_sub`).

## Modelo de dados (Flyway V1, do modelo T2)
```sql
CREATE TABLE usuario.usuario (
  id_usuario   BIGSERIAL PRIMARY KEY,
  keycloak_sub UUID NOT NULL UNIQUE,
  nome         VARCHAR(120) NOT NULL,
  email        VARCHAR(160) NOT NULL UNIQUE,
  tipo         VARCHAR(20)  NOT NULL CHECK (tipo IN ('PROFESSOR','ALUNO','ADMIN'))
);
CREATE TABLE usuario.professor (
  id_usuario   BIGINT PRIMARY KEY REFERENCES usuario.usuario,
  siape        VARCHAR(20) NOT NULL UNIQUE,
  departamento VARCHAR(80) NOT NULL
);
CREATE TABLE usuario.aluno (
  id_usuario BIGINT PRIMARY KEY REFERENCES usuario.usuario,
  matricula  VARCHAR(20) NOT NULL UNIQUE,
  curso      VARCHAR(80) NOT NULL
);
CREATE TABLE usuario.admin (
  id_usuario BIGINT PRIMARY KEY REFERENCES usuario.usuario,
  cargo      VARCHAR(80) NOT NULL
);
```

## Rotas (anotar com @Tag/@Operation/@ApiResponse/@Schema)
| Método | Rota | Role | Regras |
|---|---|---|---|
| POST `/usuarios` | ADMIN | cria USUARIO + subtipo conforme `tipo`; email/siape/matricula únicos → 409 se duplicado |
| GET `/usuarios/me` | autenticado | busca por `keycloak_sub` do JWT (US01) |
| GET `/usuarios/{id}` | autenticado | 404 se inexistente |
| GET `/professores?nome=` | autenticado | lista paginada (US11) |
| GET `/professores/{id}` | autenticado | perfil completo |
| PUT `/usuarios/{id}` | ADMIN ou o próprio | não altera email para um já existente |
| DELETE `/usuarios/{id}` | ADMIN | 204 |

## DTOs
`UsuarioResponse {id, nome, email, tipo}` · `ProfessorResponse {id, nome, siape, departamento}` ·
`UsuarioCreateRequest {nome, email, tipo, siape?, departamento?, matricula?, curso?, cargo?}` (Bean Validation).

## Erros
RFC 7807 via `@RestControllerAdvice`: 400 validação, 404, 409 unicidade.

## Testes (Sonar/JaCoCo ≥ 70%)
- Unit: regra de criação por tipo. Integração: repositórios com Testcontainers;
  MockMvc com JWT mockado (`spring-security-test`) validando roles.

## Critérios de aceite
1. ADMIN cria professor → 201 e registro em `usuario` + `professor`.
2. Email duplicado → 409 Problem Details.
3. `/usuarios/me` com token de professor retorna o próprio perfil.
