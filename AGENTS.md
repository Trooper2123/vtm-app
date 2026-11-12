# AGENTS.md — Orientações do repositório

## Estrutura e limites entre aplicações

Este repositório separa interface e backend para que cada parte possa ser validada e publicada de forma independente.

- `apps/web/`: frontend Next.js 15, React 19 e TypeScript. Responsável por páginas, componentes, navegação e experiência do usuário.
- `apps/api/`: backend Node.js/TypeScript executado como Vercel Functions. Responsável por endpoints, validação no servidor, autorização, regras de domínio e acesso a dados.
- `docs/api/openapi.yaml`: contrato oficial dos endpoints.
- `docs/api/flows/`: roteiros ponta a ponta para exercitar e validar os fluxos da API.
- `docs/deployments.md`: política de branches e deploy.

Mantenha a separação: o frontend não acessa o banco diretamente nem contém credenciais privadas. Toda leitura ou alteração persistente deve passar pela API.

## Frontend — `apps/web/`

- Mantenha componentes, páginas e lógica visual no frontend; não replique nele regras de autorização ou regras de domínio que precisam ser confiáveis.
- Consuma o backend usando a URL pública da API configurada para o ambiente. Variáveis expostas ao navegador devem conter somente dados que possam ser públicos.
- Trate estados de carregamento, sucesso, erro e ausência de dados nas interfaces que dependem da API.
- Todo texto visível ao usuário deve estar em português do Brasil, salvo conteúdo de jogo que tenha sido definido intencionalmente em outro idioma.
- Antes de alterar comportamento específico do Next.js, consulte a documentação correspondente à versão instalada em `apps/web/node_modules/next/dist/docs/` quando disponível. Não presuma que APIs ou convenções de outra versão se aplicam.

## Backend — `apps/api/`

- Implemente endpoints como Vercel Functions em `apps/api/api/`; mantenha as rotas versionadas sob `api/v1/`.
- Valide método HTTP, parâmetros, corpo, tipos, limites e formato antes de executar operações.
- Faça autenticação e autorização no servidor. Nunca confie em controles existentes somente na interface.
- Mantenha segredos, credenciais de banco e variáveis privadas somente no projeto Vercel da API. Use `.env.example` apenas para nomes e exemplos não secretos.
- Use consultas parametrizadas. Evite retornar detalhes internos, credenciais ou dados privados em respostas e logs.
- Padronize códigos HTTP e respostas de erro; atualize OpenAPI e os fluxos de validação quando um endpoint mudar.
- Não acesse nem altere dados de produção para desenvolvimento, demonstração ou teste. Para operações persistentes, confirme que o destino é o ambiente correto e use dados fictícios.

## Contrato e documentação da API

Ao criar ou modificar um endpoint, atualize no mesmo conjunto de mudanças:

1. `docs/api/openapi.yaml`, incluindo método, caminho, autenticação, parâmetros, corpo, respostas e erros relevantes.
2. O fluxo correspondente em `docs/api/flows/`, com pré-condições, sequência de chamadas, exemplos e resultados esperados.
3. A documentação específica da aplicação, se configuração ou execução local mudar.

Use a documentação para orientar testes manuais e automatizados. Não descreva um fluxo como validado se ele não tiver sido executado.

## Segurança e privacidade

- Aplique autorização por recurso e por usuário no backend; proteja contra acesso indevido pela troca de identificadores (IDOR/BOLA).
- Separe dados e permissões de jogador e narrador. Dados ou resultados exclusivos do narrador não podem ser incluídos em respostas destinadas a jogadores.
- Valide entradas nas fronteiras de confiança e codifique saídas conforme o contexto para reduzir riscos de injeção e XSS.
- Não confie em resultados, permissões, XP, atributos ou estados enviados pelo cliente quando o servidor puder calculá-los ou verificá-los.
- Não registre tokens, segredos ou conteúdo privado desnecessário. Não inclua segredos em commits, documentação, exemplos ou bundles do frontend.
- Revise alterações de autenticação, autorização, sessão, banco e comunicação em tempo real com atenção a isolamento entre usuários e campanhas.
- Considere OWASP Top 10, OWASP ASVS e as recomendações de segurança das versões instaladas.

## Implementação e validação

- Prefira a menor mudança completa que preserve os padrões existentes. Evite abstrações, dependências e configuração sem necessidade concreta.
- Antes de editar, leia a implementação e identifique callers, contratos, documentação e fluxos que a mudança afeta.
- Mudanças de comportamento devem incluir ou atualizar testes pertinentes, especialmente validação, autorização e isolamento de dados.
- Execute as verificações disponíveis para a aplicação alterada e registre os comandos e resultados. Não afirme que tipos, lint, build, testes ou revisão de segurança passaram sem tê-los executado.
- Se uma verificação necessária não puder ser executada ou falhar, informe o bloqueio e não marque a tarefa como validada.
- Revise o diff final para remover alterações acidentais em manifests e lockfiles e confirmar que nenhum segredo foi incluído.

## Deploy e branches

- `main` é a branch de produção.
- `dev` gera deployments Preview para validação.
- Outras branches não devem gerar deployments nesses projetos Vercel.
- O projeto frontend usa `apps/web` como diretório raiz; o projeto da API usa `apps/api`.
- Integre mudanças em `main` somente depois de validar o fluxo afetado no Preview de `dev`. Quando uma mudança atingir frontend e API, valide os dois deployments e a integração entre eles.
- Consulte `docs/deployments.md` antes de alterar a configuração de deploy.
