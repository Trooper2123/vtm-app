# Fluxo de deploy

- `main` é a branch de produção dos projetos Vercel.
- `dev` gera previews para validar os fluxos antes da publicação.
- Outras branches não devem gerar deploys nesses projetos.
- Frontend e API publicam separadamente a partir dos diretórios `apps/web` e `apps/api`.
- `vtm-app/apps/web` deve ter deploy no projeto Vercel `meus-vampiros-web`, com Root Directory `apps/web`.
- `vtm-app/apps/api` deve ter deploy no projeto Vercel `meus-vampiros-api`, com Root Directory `apps/api`.
- Os valores de Root Directory são relativos à raiz do repositório `vtm-app`.
- Os dois projetos usam Node.js 26 LTS, definido em `engines.node` nos respectivos `package.json`. Confira a versão efetiva em cada deployment Preview antes de integrar em `main`.

As mudanças devem ser integradas a `main` somente depois de validadas no preview de `dev`.
