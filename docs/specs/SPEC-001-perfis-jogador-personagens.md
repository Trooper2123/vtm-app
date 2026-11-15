# SPEC-001 — Perfil de usuário e personagens do jogador

**Status:** proposta para implementação; nenhum endpoint, tela ou migração é criado por esta SPEC.  
**Prioridade:** P0 (jogador), com contratos extensíveis para Narrador.  
**Repositório:** `Trooper2123/vtm-app`.  
**Referências internas:** `AGENTS.md`, `docs/api/openapi.yaml`, `docs/ui/UI-GUIDE.md`, `docs/ui/design-system.md`; considerar a proposta de identidade Arquivo Gótico Contemporâneo na branch de UI correspondente após integração.  
**Fontes de jogo:** PDFs V5 fornecidos no projeto; esta SPEC descreve organização de contas, vínculos e telas — **decisões de produto**, não regras oficiais de V5.

## 1. Objetivo e fronteira

Implementar perfil e área do **Jogador** para criar, consultar, editar e organizar múltiplos personagens, vinculados ou não a uma mesa. O mesmo usuário poderá atuar como **Narrador** em outras mesas no futuro, mas essa visualização não será implementada nesta entrega.

Não criar por antecipação: gestão de Narrador, sessões, convites, aprovações, personagens não jogadores, rolagens, XP, regras automatizadas de V5, uploads de retrato, chat, novas fontes de jogo ou autenticação alternativa. Se alguma dependência ainda não existir, documentar bloqueio e implementar somente o mínimo indispensável para o fluxo aprovado.

## 2. Invariantes do domínio

1. Uma identidade autenticada corresponde a um perfil de usuário no aplicativo (1:1 por `auth_subject` único).
2. Um usuário pode possuir **0..N** personagens jogáveis.
3. Cada personagem tem **exatamente um proprietário**; a propriedade não muda implicitamente com o vínculo de mesa.
4. Um personagem tem **0..1 mesa ativa**; não pode estar simultaneamente vinculado a duas mesas.
5. Uma mesa pode ter **0..N personagens** de jogadores distintos; a mesma pessoa pode ter múltiplos personagens na mesma mesa **somente se permitido pela política da mesa** (decisão em aberto; padrão sugerido: permitir e sinalizar ao Narrador futuramente).
6. O mesmo usuário pode participar como jogador em várias mesas e ser Narrador em outras; a autorização é **contextual à mesa/recurso**, não um `role` global mutuamente exclusivo.
7. A escolha de visualização é preferência de interface, **não** permissão. A API valida identidade, propriedade e associação à mesa a cada operação.
8. Personagem independente permanece acessível mesmo sem mesa; a ausência de mesa **não** implica exclusão nem rascunho inválido.
9. Desvincular personagem **não** apaga ficha, notas pessoais ou histórico; dados privados da mesa e direitos de participação permanecem sujeitos às regras de autorização da mesa.
10. Personagens vinculados não podem ser transferidos diretamente para outra mesa sem primeiro encerrar o vínculo anterior, segundo o fluxo autorizado.

## 3. Entidades e persistência propostas

### `user_profiles`
- `id` UUID PK; `auth_subject` texto UNIQUE NOT NULL (identificador imutável do provedor de autenticação).
- `display_name` texto NOT NULL (limites e normalização validados); `avatar_url` opcional **fora do MVP**.
- `preferred_view` enum `player|storyteller` (preferência; padrão `player`; não conceder acesso).
- `created_at`, `updated_at`; evitar duplicar email se não necessário. Se email for exibido, obtê-lo de fonte autenticada e tratar privacidade.
- Criação idempotente: mesmo `auth_subject` nunca produz perfis duplicados.

### `characters`
- `id` UUID PK; `owner_user_id` FK NOT NULL → `user_profiles.id`.
- `name` texto NOT NULL; `concept` opcional; `clan` opcional; `character_data` JSON versionado para campos V5 **somente após definição de contrato de ficha**.
- `created_at`, `updated_at`, `archived_at` opcional; `revision` inteiro para concorrência.
- O MVP não deve aceitar valores mecânicos arbitrários como definitivos sem validação V5 futura. Definir campos mínimos e seu estado de rascunho explicitamente antes da implementação.

### `campaigns` / `tables`
- Uma mesa/crônica com `id` e proprietário/administrador; schema e lifecycle **dependem de SPEC própria**. Não criar mesa fictícia ou placeholder persistente para cumprir esta SPEC.

### `character_table_memberships` (preferência arquitetural)
- `id`, `character_id` FK, `table_id` FK, `status` (`pending|active|ended`), `created_at`, `ended_at`, `approved_by` opcional.
- Índice único parcial por `character_id` para `status IN ('pending','active')` **se** convites pendentes também bloquearem novas solicitações; esta política deve ser aprovada antes da migração.
- Para a regra inequívoca de no máximo **uma mesa ativa**, índice único parcial por `character_id` onde `status='active'` é obrigatório.
- Preservar histórico em vez de sobrescrever `table_id` diretamente. A relação ativa é derivada de um vínculo vigente, não uma lista enviada pelo cliente.
- Impedir vínculo a mesa inexistente, arquivada/inativa (se houver esse conceito) ou sem permissão. Autorizar criação, aprovação e encerramento por política de mesa, ainda a especificar.

**Alternativa simplificada:** `characters.table_id NULL` atende à cardinalidade atual, mas perde histórico de vínculo. Preferir tabela de vínculos se convites e auditoria estiverem previstos. **Não implementar as duas fontes de verdade.**

## 4. Jornada do Jogador — P0

1. **Entrar:** autenticação existente; carregar `GET /me`; se perfil não existir, encaminhar para criação do perfil sem criar permissões.
2. **Primeiro acesso:** informar nome de exibição, validar e salvar. Não exigir criação de personagem.
3. **Área inicial do jogador:** mostrar saudação com nome real, quantidade de personagens e lista com nome, conceito (quando houver), estado de vínculo (`Sem mesa`, `Vínculo pendente`, `Vinculado à mesa`) e ações efetivamente implementadas. Nunca exibir dados de exemplo como se fossem reais.
4. **Criar personagem:** iniciar ficha independente; salvar os campos mínimos validados; ao sucesso, mostrar ficha e permitir voltar à lista.
5. **Consultar/editar:** somente proprietário ou acesso explicitamente autorizado; edição otimista deve usar `revision` ou ETag para impedir sobrescrita silenciosa.
6. **Vincular a mesa:** não criar botão operacional até existir fluxo de mesa/convite/autorização. Na primeira fase, indicar apenas o estado do vínculo existente; o vínculo é **P1 dependente de mesas**.
7. **Desvincular:** futura ação autorizada, com confirmação e preservação do histórico; não permitir contornar aprovação ou acesso a informações reservadas.
8. **Visão Narrador:** não apresentar painel funcional nem atalho que pareça disponível. Futuramente, alternância de contexto sem trocar conta ou expor dados de outra mesa.

### Estados de interface obrigatórios
Carregando, vazio (nenhum personagem), sucesso, erro de campo, erro de serviço, sem acesso, conflito de edição, vínculo pendente e vínculo ativo. Em falha de salvamento, preservar entradas e permitir tentativa segura; não presumir sucesso.

## 5. Contratos de API propostos (não existentes no OpenAPI atual)

**Base:** `/api/v1`, autenticação obrigatória; respostas JSON e erros padronizados. Os caminhos abaixo são **propostas**, não endpoints já implementados.

| Método | Caminho | Propósito | Autorização |
|---|---|---|---|
| GET | `/me` | Obter perfil autenticado; indicar `profile_required` | Identidade atual |
| PUT | `/me/profile` | Criar/atualizar nome e preferências permitidas; idempotente | Identidade atual |
| GET | `/me/characters` | Listar personagens próprios, com paginação e estado de vínculo | Proprietário |
| POST | `/me/characters` | Criar personagem independente | Proprietário |
| GET | `/me/characters/{id}` | Ler ficha própria | Proprietário |
| PATCH | `/me/characters/{id}` | Atualizar campos autorizados com revisão | Proprietário |
| GET | `/me/characters/{id}/membership` | Consultar vínculo vigente, se houver | Proprietário, sem dados privados da mesa |

**P1 dependente de SPEC de mesas:** endpoints de convite/solicitação, aprovação, vinculação e encerramento; nunca permitir `table_id` arbitrário em POST/PATCH da ficha. Não expor operações de Narrador em `/me` como atalho de autorização.

### Respostas e segurança
- `401` sem sessão; `403` autenticado sem autorização; `404` recurso inexistente ou não revelável; `409` conflito de revisão ou vínculo; `422` validação de entrada; `429` se limites aplicáveis; `5xx` falha de serviço sem dados internos.
- Paginação com limite máximo e ordenação estável; não carregar todos os personagens sem limite.
- A API deriva `owner_user_id` da sessão, nunca do corpo.
- O cliente não escolhe `approved_by`, `status` de vínculo ou `table_id` sem fluxo específico autorizado.
- Respostas do jogador nunca incluem notas privadas, segredos, SPCs ou decisões do Narrador.
- Se o provedor de autenticação não estiver definido/operacional, resolver essa dependência antes de implementar `/me`.

## 6. UI e navegação — primeira iteração

Usar a identidade **Arquivo Gótico Contemporâneo** quando integrada: carvão e superfícies lisas para formulários; Georgia em títulos; Arial em campos; vermelho em CTA e perigo; papel envelhecido somente em etiquetas/capa e detalhes de arquivo com dados reais.

| Tela sugerida | Conteúdo | Ação primária |
|---|---|---|
| `/profile/setup` | Nome de exibição e validação | Salvar perfil |
| `/player` | Saudação, lista de personagens, estados de vínculo | Criar personagem |
| `/player/characters/new` | Formulário mínimo de ficha independente | Salvar personagem |
| `/player/characters/[id]` | Detalhe da ficha e vínculo atual | Editar personagem |
| `/player/characters/[id]/edit` | Edição de campos permitidos | Salvar alterações |

**Rotas são sugestões** e precisam ser reconciliadas com rotas já existentes antes de codificar. Se a autenticação estiver indisponível, não criar formulário de login falso.

Acessibilidade: foco visível, labels, erro junto ao campo, alvos de 44×44px, contraste WCAG AA, zoom 200%, layout 390/768/1440px, estados não comunicados apenas por cor e respeito a `prefers-reduced-motion`.

## 7. Histórias de usuário e aceite

- **US-01 Perfil:** dado usuário autenticado sem perfil, ao salvar nome válido, perfil é criado uma vez; segundo envio não duplica; usuário não autenticado recebe 401.
- **US-02 Múltiplos personagens:** dado perfil válido, criar A e B resulta em dois registros com mesmo proprietário e IDs diferentes; ambos aparecem na lista.
- **US-03 Independente:** ao criar personagem sem mesa, estado é `Sem mesa` e ficha continua editável pelo dono.
- **US-04 Vínculo único:** não é possível ter dois vínculos `active` para a mesma ficha, inclusive sob requisições concorrentes; banco impede duplicação.
- **US-05 Múltiplas mesas:** usuário pode ter personagem A na mesa 1 e B na mesa 2, sem transferir propriedade.
- **US-06 Duplo papel:** usuário que narra uma mesa pode continuar usando a visão de jogador e suas próprias fichas; mudar visão não muda autorização.
- **US-07 Isolamento:** usuário X não lê, edita nem lista ficha de Y por manipular IDs; não recebe dados reservados da mesa.
- **US-08 Concorrência:** duas edições da mesma revisão não sobrescrevem silenciosamente; a segunda retorna 409.
- **US-09 Falhas:** erro de rede preserva campos; retorno do servidor não é interpretado como sucesso antes da confirmação.
- **US-10 Acessibilidade:** fluxo completo com teclado, leitor de tela, zoom e tamanhos especificados.

## 8. Plano incremental

**Fase A — P0:** autenticação existente ou dependência resolvida; perfil; CRUD mínimo de personagens independentes; listagem; isolamento por proprietário; UI de jogador; testes.

**Fase B — P1:** mesa/crônica e política de participação; vínculos com aprovação, encerramento e histórico; listagem de estados; testes de concorrência e permissões.

**Fase C — P2:** visão Narrador separada, ações de mesa, convites, sessões e controle de personagens autorizados. Não antecipar a UI de Narrador na Fase A.

## 9. Dependências e decisões abertas

1. **Autenticação:** confirmar provedor, claims e fluxo de primeiro acesso efetivamente disponíveis no novo repositório.
2. **Ficha V5:** decidir quais campos podem ser salvos como rascunho sem automatizar criação mecânica; consultar apenas os PDFs V5.
3. **Participação:** pode o mesmo jogador colocar mais de um personagem na mesma mesa? Padrão sugerido: sim, condicionado à política da mesa.
4. **Aprovação:** convite, solicitação ou ambos? Quem aprova e quando o vínculo passa a `active`?
5. **Histórico:** reuso de ficha em nova mesa e retenção de dados privados da anterior.
6. **Exclusão:** arquivamento reversível ou exclusão; política de retenção e impacto em vínculos.
7. **Rotas:** confirmar compatibilidade com a navegação já existente antes de implementação.

## 10. Checklist técnico de implementação

- [ ] Ler o código real e identificar autenticação, banco, rotas e testes existentes.
- [ ] Definir e revisar schema/migrações versionadas; **não** executar DDL em requisição.
- [ ] Confirmar ambiente de Preview antes de aplicar migração; produção isolada.
- [ ] Implementar API com validação e autorização no servidor.
- [ ] Atualizar `docs/api/openapi.yaml` e `docs/api/flows/` na **mesma mudança** dos endpoints.
- [ ] Implementar UI com estados completos e sem funcionalidades fictícias.
- [ ] Testar 401, 403, 404, 409, 422, IDOR/BOLA, concorrência, paginação e isolamento de mesas.
- [ ] Executar build, lint, testes e revisão visual/acessibilidade; registrar resultados reais.
- [ ] Validar frontend e API no Preview de `dev` antes de integrar à `main`.

**Definição de pronto:** a Fase A permite a uma pessoa autenticada manter múltiplos personagens independentes e seguros, com UI de jogador funcional, sem pressupor mesa nem acesso de Narrador. Vínculos reais com mesas e visão Narrador são entregas posteriores, explicitamente dependentes de suas próprias regras de autorização.
