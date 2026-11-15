# API

Backend Node.js/TypeScript executado como Vercel Functions.

## Local

Use Node.js 22 e instale as dependências desta aplicação:

```sh
npm install
npm run dev
```

A rota inicial é `GET /api/v1/health`. O contrato está em `../../docs/api/openapi.yaml` e o roteiro de validação em `../../docs/api/flows/health.md`.

## Configuração

Perfil: `GET /api/v1/me` e `PUT /api/v1/me/profile` exigem access token Auth0 RS256. Configure `AUTH0_ISSUER_URL`, `AUTH0_API_AUDIENCE` e `DATABASE_URL` no projeto API. O schema é criado separadamente, nunca durante requisições. Consulte `../../docs/api/flows/player-profile.md` para executar a validação no Preview.

Variáveis privadas e credenciais do banco devem ficar somente no projeto Vercel da API. Use `.env.example` como referência sem adicionar valores secretos ao Git.
