# ADR-010 — Documentação de APIs com Swagger/OpenAPI (springdoc)

**Status:** Aceito · **Data:** 2026-07-01

## Contexto
O enunciado exige que todos os serviços sejam documentados com anotações Swagger no
padrão OpenAPI. As specs SDD e o front-end dependem de contratos precisos.

## Decisão
Usar **springdoc-openapi** em todos os serviços: anotações `@Tag`, `@Operation`,
`@ApiResponse`, `@Schema` nos controllers/DTOs, gerando **OpenAPI 3** em `/v3/api-docs`
e UI em `/swagger-ui.html`. O Gateway agrega os documentos de todos os serviços em um
único Swagger UI (grupo por serviço). Os contratos são fonte para geração de tipos do
front e para testes de contrato.

## Alternativas consideradas
- **Contract-first (escrever YAML à mão):** bom rigor, porém duplicaria esforço; o
  enunciado pede anotações no código.
- **springfox:** descontinuado, incompatível com Spring Boot 3.

## Consequências
- (+) Documentação sempre sincronizada com o código; exploração via UI única no Gateway.
- (−) Anotações verbosas — mitigado com exemplos nas specs SDD para geração por IA.
