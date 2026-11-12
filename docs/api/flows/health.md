# Fluxo: verificar disponibilidade da API

## Objetivo

Confirmar que o deployment da API responde. Este endpoint é público e não altera dados.

## Chamada

```http
GET /api/v1/health
```

## Resultado esperado

- HTTP `200`
- Cabeçalho `Cache-Control: no-store`
- JSON com `status: "ok"`, `service: "vtm-app-api"` e `timestamp` em ISO 8601

## Teste manual

```sh
curl -i https://<host-da-api>/api/v1/health
```

## Limite do fluxo

Este endpoint confirma apenas que a função responde. Ele não verifica banco, autenticação ou dependências externas.
