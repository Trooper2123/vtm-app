# VTM App

Nova base do app de RPG Vampiro: A Máscara. O repositório separa frontend e API para permitir evolução e publicação independentes.

## Estrutura

- `apps/web`: frontend Next.js.
- `apps/api`: API Node.js/TypeScript em funções serverless.
- `docs/api/openapi.yaml`: contrato OpenAPI.
- `docs/api/flows/`: fluxos ponta a ponta e passos de validação.

## Deploy Vercel

- Projeto frontend: diretório raiz `apps/web`.
- Projeto API: diretório raiz `apps/api`.
- Runtime Node.js 22.
- O frontend não acessa o banco diretamente; dados e regras passam pela API.

Cada feature deve ser migrada e liberada após validar seu fluxo completo. Consulte a documentação da API antes de testar endpoints.
