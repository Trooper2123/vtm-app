# API

Backend Node.js/TypeScript executado como Vercel Functions.

## Local

Use Node.js 22 e instale as dependências desta aplicação:

```sh
npm install
npm run dev:vercel -- --listen 3001
npm run dev # API local em http://localhost:3001
```

Endpoints documentados em `../../docs/api/openapi.yaml`:

- `GET /api/v1/health`: disponibilidade.
- `GET /api/v1/profile`: lê somente o perfil da identidade Auth0 autenticada; retorna `404` quando ainda não existe.
- `POST /api/v1/profile`: cria o perfil da identidade autenticada uma única vez.

O roteiro ponta a ponta está em [docs/api/flows/profile-onboarding.md](../../docs/api/flows/profile-onboarding.md).

Na raiz do repositório, `npm run dev` inicia API e frontend juntos. O script da API se chama `dev:vercel` para que o Vercel Dev não o detecte como Development Command e invoque a si mesmo. Nos ajustes do projeto Vercel da API, deixe Development Command sem override; ele não deve chamar `vercel dev`.

## Configuração

Perfil: `GET /api/v1/me` e `PUT /api/v1/me/profile` exigem access token Auth0 RS256. Configure `AUTH0_ISSUER_URL`, `AUTH0_API_AUDIENCE` e `DATABASE_URL` no projeto API. O schema é criado separadamente, nunca durante requisições. Consulte `../../docs/api/flows/player-profile.md` para executar a validação no Preview.

Variáveis privadas e credenciais do banco devem ficar somente no projeto Vercel da API. Use `.env.example` como referência sem adicionar valores secretos ao Git.
Configure `DATABASE_URL` apontando exclusivamente para o Neon compartilhado de Preview/teste neste ambiente. O schema versionado está em `migrations/001_create_profiles.sql`; aplique-o nesse branch antes de validar o fluxo. Não aplique essa migration em produção até o gate de Preview ser aprovado.

Configure `AUTH0_ISSUER_URL` com o issuer do tenant e `AUTH0_API_AUDIENCE` com o identificador da API cadastrada no Auth0. O projeto Auth0 deve expor uma API para esse audience. Os valores de exemplo estão em `.env.example`.

Variáveis privadas e credenciais do banco devem ficar somente no projeto Vercel da API. Use o projeto Preview/dev e o banco compartilhado Preview/teste para validação; nunca use banco de produção em desenvolvimento ou teste.
