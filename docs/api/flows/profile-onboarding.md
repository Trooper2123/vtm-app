# Fluxo: cadastro inicial de perfil

## Objetivo

Validar que uma pessoa autenticada pelo Auth0 cria um perfil próprio no banco Neon novo e que logins seguintes seguem para a área inicial. Nenhum dado do repositório antigo é consultado ou importado.

## Pré-requisitos

- Frontend e API da branch `dev` publicados em Preview.
- Variáveis Auth0 do frontend configuradas: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `AUTH0_AUDIENCE`.
- Uma API criada no tenant Auth0 com audience igual a `AUTH0_AUDIENCE); o frontend solicita `openid profile email`.
- `AUTH0_ISSUER_URL` e `AUTH0_API_AUDIENCE` na API, usando o mesmo issuer e audience.
- `API_BASE_URL` no projeto Vercel do frontend apontando para o deployment Preview da API.
- `DATABASE_URL` no projeto Vercel da API apontando ao Neon compartilhado de Preview/teste.
- Migration `apps/api/migrations/001_create_profiles.sql` aplicada somente no branch Neon compartilhado de Preview/teste.

## Configuração do Auth0 para Preview

No tenant associado ao projeto Vercel:

1. Cadastre uma API com **Identifier** `https://vtm-app-api` e assinatura RS256. Esse valor deve ser igual ao audience configurado no frontend e na API.
2. Na aplicação Web, permita o callback `https://meus-vampiros-web-git-dev-tereza-s-cereja.vercel.app/auth/callback`.
3. Adicione `https://meus-vampiros-web-git-dev-tereza-s-cereja.vercel.app` às Allowed Logout URLs e Allowed Web Origins.
4. As variáveis de Preview `APP_BASE_URL`, `API_BASE_URL`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER_URL` e `AUTH0_API_AUDIENCE` foram preparadas para a branch `dev`. As credenciais do frontend permanecem nas variáveis `VTM_AUTH_AUTH0_*` já conectadas ao projeto.

A URL de callback é específica do domínio estável da branch Preview. Se o domínio do projeto Vercel mudar, atualize essas URLs no Auth0 e o `APP_BASE_URL` no Vercel.

## Jornada pela interface

1. Acesse o Preview do frontend sem sessão e escolha **Entrar** ou **Criar conta**.
2. Após autenticar, a página inicial chama `GET /api/v1/profile`.
3. Se a API retornar `404 profile_not_found`, preencha nome, apelido opcional, pronomes opcionais, e-mail e tipo de cadastro.
4. Salve. A interface envia a criação por uma Server Action para a API.
5. Após HTTP `201`, a interface navega para `/home`.
6. Encerre e inicie novamente a sessão; perfil existente deve levar direto à área inicial.

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

**Estado: implementado parcialmente; jornada autenticada ainda não aprovada.**

- Os builds Vercel de frontend e API da branch `dev` passaram no commit `f28d480`.
- A página inicial do Preview respondeu HTTP `200`; `/auth/login` redirecionou HTTP `307` ao Auth0 com audience `https://vtm-app-api` e callback estável da branch `dev`.
- `GET /api/v1/health` respondeu HTTP `200`.
- A tabela `public.profiles` foi criada no branch Neon compartilhado `preview-test` e no branch Vercel `preview/dev`. Ambos estavam sem dados de aplicação; a branch de produção não foi alterada.
- Falta cadastrar no Auth0 a API com o identifier `https://vtm-app-api` e liberar os callback/logout URLs listados acima. Em seguida, executar login real, consulta inicial `404`, criação `201`, consulta posterior `200` e repetição `409`.

Não marcar o fluxo como validado até completar os testes autenticados de sucesso e erro.
