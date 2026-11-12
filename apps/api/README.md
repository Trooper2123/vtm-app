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

Variáveis privadas e credenciais do banco devem ficar somente no projeto Vercel da API. Use `.env.example` como referência sem adicionar valores secretos ao Git.
