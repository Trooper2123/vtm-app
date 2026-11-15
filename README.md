# VTM App

Nova base do app de RPG Vampiro: A Máscara. O repositório separa frontend e API para permitir evolução e publicação independentes.

## Estrutura

- `apps/web`: frontend Next.js.
- `apps/api`: API Node.js/TypeScript em funções serverless.
- `docs/api/openapi.yaml`: contrato OpenAPI.
- `docs/api/flows/`: fluxos ponta a ponta e passos de validação.

## Deploy Vercel

O projeto é disponibilizado por meio de **dois projetos Vercel**, informados pelo responsável:

- **Frontend (web):** [meus-vampiros-web](https://vercel.com/tereza-s-cereja/meus-vampiros-web) — diretório raiz `apps/web`.
- **Backend (API):** [meus-vampiros-api](https://vercel.com/tereza-s-cereja/meus-vampiros-api) — diretório raiz `apps/api`.

Esses links são para os **painéis dos projetos na Vercel**, não necessariamente URLs públicas da aplicação ou da API. O acesso aos painéis pode exigir autenticação e permissão na equipe.

- Runtime Node.js 26.
- O frontend não acessa o banco diretamente; dados e regras passam pela API.
- Conforme `AGENTS.md`, `main` é a branch de produção e `dev` é usada para Preview; valide os fluxos antes de integrar mudanças.

Cada feature deve ser migrada e liberada após validar seu fluxo completo. Consulte a documentação da API antes de testar endpoints.
