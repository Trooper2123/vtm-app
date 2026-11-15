# VTM App

Nova base do app de RPG Vampiro: A Máscara. O repositório separa frontend e API para permitir evolução e publicação independentes.

## Estrutura

- `apps/web`: frontend Next.js.
- `apps/api`: API Node.js/TypeScript em funções serverless.
- `docs/api/openapi.yaml`: contrato OpenAPI.
- `docs/api/flows/`: fluxos ponta a ponta e passos de validação.

## Desenvolvimento local

Instale as dependências de cada aplicação e as do comando unificado:

```sh
npm install
npm --prefix apps/api install
pnpm --dir apps/web install
npm run dev
```

O frontend inicia em `http://localhost:3000` e a API em `http://localhost:3001`. O comando reutiliza Next.js e Vercel Dev dos aplicativos. `Ctrl+C` encerra ambos; se um processo terminar, o outro também é encerrado.

Configure a URL da API no frontend como `http://localhost:3001` quando integrar seu cliente HTTP. A API precisa das variáveis privadas em `apps/api/.env.local` e do acesso ao projeto Vercel; Vercel Dev pode solicitar login ou vínculo na primeira execução. Use uma conexão Neon de desenvolvimento/teste confirmada.

## Deploy Vercel

- Projeto frontend: diretório raiz `apps/web`.
- Projeto API: diretório raiz `apps/api`.
- Runtime Node.js 26.
- O frontend não acessa o banco diretamente; dados e regras passam pela API.

Cada feature deve ser migrada e liberada após validar seu fluxo completo. Consulte a documentação da API antes de testar endpoints.
