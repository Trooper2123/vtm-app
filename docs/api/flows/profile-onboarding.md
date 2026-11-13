# Fluxo: cadastro inicial de perfil

## Objetivo

Validar que uma pessoa autenticada pelo Auth0 cria um perfil próprio no banco Neon novo e que logins seguintes seguem para a área inicial. Nenhum dado do repositório antigo é consultado ou importado.

## Pré-requisitos

- Frontend e API da branch `dev` publicados em Preview.
- Variáveis Auth0 do frontend configuradas: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `AUTH0_AUDIENCE`.
- Uma API criada no mesmo tenant Auth0 da aplicação web com audience igual a `AUTH0_AUDIENCE`; o frontend solicita `openid profile email`.
- `AUTH0_ISSUER_URL` e `AUTH0_API_AUDIENCE` na API, usando o mesmo issuer e audience.
- `API_BASE_URL` no projeto Vercel do frontend apontando para o deployment Preview da API.
- `DATABASE_URL` no projeto Vercel da API apontando ao Neon compartilhado de Preview/teste.
- Migration `apps/api/migrations/001_create_profiles.sql` aplicada somente no branch Neon compartilhado de Preview/teste.

## Configuração do Auth0 para Preview

No tenant associado ao projeto Vercel:

1. Cadastre uma API com **Identifier** `https://vtm-app-api` e assinatura RS256. Esse valor deve ser igual ao audience configurado no frontend e na API.
2. Na aplicação Web, permita o callback `https://meus-vampiros-web-git-dev-tereza-s-cereja.vercel.app/auth/callback`.
3. Adicione `https://meus-vampiros-web-git-dev-tereza-s-cereja.vercel.app` às Allowed Logout URLs e Allowed Web Origins.
4. Autorize a aplicação Web para acesso delegado à API.
5. As variáveis de Preview `APP_BASE_URL`, `API_BASE_URL`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER_URL` e `AUTH0_API_AUDIENCE` foram preparadas para a branch `dev`. As credenciais do frontend permanecem nas variáveis `VTM_AUTH_AUTH0_*` já conectadas ao projeto.

A URL de callback é específica do domínio estável da branch Preview. Se o domínio do projeto Vercel mudar, atualize essas URLs no Auth0 e o `APP_BASE_URL` no Vercel.

## Jornada pela interface

1. Acesse o Preview do frontend sem sessão e escolha **Entrar** ou **Criar conta**.
2. Após autenticar, a página inicial chama `GET /api/v1/profile`.
3. Se a API retornar `404 profile_not_found`, preencha nome, apelido opcional, pronomes opcionais, e-mail e tipo de cadastro.
4. Salve. A interface envia a criação por uma Server Action para a API.
5. Após HTTP `201`, a interface navega para `/home`.
6. Encerre e inicie novamente a sessão; perfil existente deve levar direto à área inicial.
7. Na área inicial, escolha **Sair**. O link `/auth/logout` é atendido pelo middleware do SDK Auth0, encerra a sessão da aplicação e redireciona conforme as Allowed Logout URLs.

## Rotas de autenticação do frontend

As rotas abaixo são fornecidas pelo middleware `auth0.middleware()` do SDK; não são endpoints da API de domínio:

| Rota | Uso |
|---|---|
| `/auth/login` | Iniciar login |
| `/auth/callback` | Retorno após autenticação |
| `/auth/logout` | Encerrar sessão e iniciar logout no Auth0 |

## Contrato de chamadas

### Perfil ainda não cadastrado

```http
GET /api/v1/profile
Authorization: Bearer <access_token Auth0 destinado à API>
```

Esperado: HTTP `404`, `Cache-Control: no-store`, corpo `{"error":{"code":"profile_not_found","message":"Perfil ainda não cadastrado."}}`.

### Criar o perfil

```http
POST /api/v1/profile
Authorization: Bearer <access_token Auth0 destinado à API>
Content-Type: application/json

{
  "name": "Nome de teste",
  "nickname": "Apelido",
  "pronouns": "ela/dela",
  "email": "teste@example.com",
  "accountType": "both"
}
```

Esperado: HTTP `201` com `profile` e datas ISO 8601. A chave de vínculo é o `sub` do token validado no backend, nunca um identificador recebido do frontend.

### Consultas posteriores

Repita `GET /api/v1/profile`. Esperado: HTTP `200` com o perfil salvo. Repetir o `POST` deve retornar HTTP `409 profile_already_exists` sem alterar o registro.

## Casos negativos

| Caso | Esperado |
|---|---|
| Requisição sem Bearer token | `401 unauthorized` |
| Token expirado, assinatura ou audience inválidos | `401 unauthorized` |
| Campos obrigatórios inválidos ou accountType fora da enumeração | `400 validation_error` |
| Criar perfil quando já existe um para o mesmo subject | `409 profile_already_exists` |
| Qualquer método diferente de GET/POST | `405 method_not_allowed` |

## Teste manual direto da API

Use um access token recente obtido pelo fluxo Auth0 configurado para o audience da API. Não salve tokens no repositório, em issues ou logs.

```sh
curl -i -H "Authorization: Bearer $ACCESS_TOKEN" "$API_BASE_URL/api/v1/profile"
curl -i -X POST "$API_BASE_URL/api/v1/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"Perfil de teste","nickname":"Teste","pronouns":"ela/dela","email":"teste@example.com","accountType":"player"}'
```

## Estado da validação

**Estado: login e exibição do formulário inicial validados; criação e persistência do perfil ainda pendentes de validação.**

- O login no Preview Auth0 foi concluído e a interface exibiu o formulário de primeiro acesso.
- A tela `/home` agora oferece **Sair** por `/auth/logout`, rota atendida pelo middleware do SDK Auth0.
- Ainda é necessário validar o salvamento do perfil (HTTP `201`), a consulta seguinte (HTTP `200`), o retorno direto à área inicial em novo login e o encerramento da sessão.
- Builds de frontend e API da branch `dev` haviam passado no commit `740b119`; a atualização do link de logout precisa de novo build Preview.

Não marcar o fluxo completo como validado até concluir os testes autenticados de sucesso e erro.
