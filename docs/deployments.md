# Fluxo de deploy

- `main` é a branch de produção dos projetos Vercel.
- `dev` gera previews para validar os fluxos antes da publicação.
- Outras branches não devem gerar deploys nesses projetos.
- Frontend e API publicam separadamente a partir dos diretórios `apps/web` e `apps/api`.

As mudanças devem ser integradas a `main` somente depois de validadas no preview de `dev`.
