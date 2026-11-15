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
5. Cada jogador pode ter **no máximo um personagem vampiro vivo/ativo por mesa**. Outros vampiros desse jogador na mesma mesa devem permanecer inativos, históricos ou não vinculados; um substituto só pode ser ativado depois que o vampiro anterior morrer (morte registrada e validada pelo Narrador).
6. O mesmo usuário pode participar como jogador em várias mesas e ser Narrador em outras, **mas nunca ser jogador na crônica/mesa que narra**. A autorização é contextual à mesa/recurso, não um `role` global mutuamente exclusivo.
7. A escolha de visualização é preferência de interface, **não** permissão. A API valida identidade, propriedade e associação à mesa a cada operação.
8. Personagem independente permanece acessível mesmo sem mesa; a ausência de mesa **não** implica exclusão nem rascunho inválido.
9. Desvincular personagem **não** apaga ficha, notas pessoais ou histórico; dados privados da mesa e direitos de participação permanecem sujeitos às regras de autorização da mesa.
10. Personagens vinculados não podem ser transferidos diretamente para outra mesa sem primeiro encerrar o vínculo anterior, segundo o fluxo autorizado.
11. **Fichas humanas são dependentes de um personagem vampiro**: cada ficha humana deve referenciar um vampiro existente e autorizado; não é uma vaga independente de jogador nem pode existir sem vínculo com vampiro. O proprietário e a visibilidade do humano seguem política explícita da mesa; o vínculo com o vampiro é obrigatório. Humanos não contam para o limite de um vampiro ativo por jogador e mesa.
12. A morte do vampiro é um evento de domínio validado pelo Narrador; arquivamento, inatividade, desconexão ou remoção de mesa **não equivalem a morte** e não liberam automaticamente vaga para substituição. A eventual exceção administrativa deverá ser especificada separadamente.

## 3. Entidades e persistência propostas

### `user_profiles`
- `id` UUID PK; `auth_subject` texto UNIQUE NOT NULL (identificador imutável do provedor de autenticação).
- `display_name` texto NOT NULL (limites e normalização validados); `avatar_url` opcional **fora do MVP**.
- `preferred_view` enum `player|storyteller` (preferência; padrão `player`; não conceder acesso).
- `created_at`, `updated_at`; evitar duplicar email se não necessário. Se email for exibido, obtê-lo de fonte autenticada e tratar privacidade.
- Criação idempotente: mesmo `auth_subject` nunca produz perfis duplicados.

### `characters`
- `id` UUID PK; `owner_user_id` FK NOT NULL → `user_profiles.id`.
- `name` texto NOT NULL; `character_type` enum `vampire|human` NOT NULL; `concept` opcional; `clan` opcional (apenas vampiro); `character_data` JSON versionado para campos V5 **somente após definição de contrato de ficha**.
- Para humanos, `linked_vampire_id` FK NOT NULL → `characters.id` (tipo vampiro); para vampiros, `linked_vampire_id` NULL. Implementar validação transacional e de autorização para impedir referência cruzada indevida. Proibir ciclo e humano apontando para humano.
- Para vampiros, registrar estado narrativo `alive|dead` e data/evento de morte quando aplicável; não permitir que o jogador marque a morte diretamente para liberar outra ficha.
- `created_at`, `updated_at`, `archived_at` opcional; `revision` inteiro para concorrência.
- O MVP não deve aceitar valores mecânicos arbitrários como definitivos sem validação V5 futura. Definir campos mínimos e seu estado de rascunho explicitamente antes da implementação.

### `campaigns` / `tables`
- Uma mesa/crônica com `id` e proprietário/administrador; schema e lifecycle **dependem de SPEC própria**. Não criar mesa fictícia ou placeholder persistente para cumprir esta SPEC.

### `character_table_memberships` (preferência arquitetural)
- `id`, `character_id` FK, `table_id` FK, `status` (`pending|active|ended`), `created_at`, `ended_at`, `approved_by` opcional.
- Para um humano associado a vampiro de mesa, o contexto de mesa é **derivado do vampiro vinculado**; não criar vínculo independente que permita ao humano aparecer em outra crônica.
- Índice único parcial por `character_id` para `status IN ('pending','active')` **se** convites pendentes também bloquearem novas solicitações; esta política deve ser aprovada antes da migração.
- Para a regra inequívoca de no máximo **uma mesa ativa**, índice único parcial por `character_id` onde `status='active'` é obrigatório.
- **Unicidade adicional obrigatória:** no máximo um vampiro com vínculo `active` e estado `alive` por (`owner_user_id`, `table_id`). Como a regra cruza tabelas, não basta um índice simples em `character_table_memberships`: projetar uma restrição de slot/ocupação por jogador+mesa, ou esquema equivalente, com transação e trava/constraint no banco. A validação deve resistir a concorrência.
- A mesa deve ter Narrador identificado (`storyteller_user_id` ou associação equivalente) e impedir, por regra de integridade/autorização, qualquer participação desse usuário como jogador nessa mesma mesa.
- Preservar histórico em vez de sobrescrever `table_id` diretamente. A relação ativa é derivada de um vínculo vigente, não uma lista enviada pelo cliente.
- Impedir vínculo a mesa inexistente, arquivada/inativa (se houver esse conceito) ou sem permissão. Autorizar criação, aprovação e encerramento por política de mesa, ainda a especificar.

**Alternativa simplificada:** `characters.table_id NULL` atende à cardinalidade atual, mas perde histórico de vínculo. Preferir tabela de vínculos se convites e auditoria estiverem previstos. **Não implementar as duas fontes de verdade.**

## 4. Jornada do Jogador — P0

1. **Entrar:** autenticação existente; carregar `GET /me`; se perfil não existir, encaminhar para criação do perfil sem criar permissões.
2. **Primeiro acesso:** informar nome de exibição, validar e salvar. Não exigir criação de personagem.
3. **Área inicial do jogador:** mostrar saudação com nome real, quantidade de personagens e lista com nome, conceito (quando houver), estado de vínculo (`Sem mesa`, `Vínculo pendente`, `Vinculado à mesa`) e ações efetivamente implementadas. Nunca exibir dados de exemplo como se fossem reais.
4. **Criar personagem:** iniciar ficha de vampiro independente; ao criar ficha humana, exigir a seleção de vampiro autorizado existente. Salvar campos mínimos validados; ao sucesso, mostrar ficha e permitir voltar à lista.
5. **Consultar/editar:** somente proprietário ou acesso explicitamente autorizado; edição otimista deve usar `revision` ou ETag para impedir sobrescrita silenciosa.
6. **Vincular a mesa:** não criar botão operacional até existir fluxo de mesa/convite/autorização. Na primeira fase, indicar apenas o estado do vínculo existente; o vínculo é **P1 dependente de mesas**. Ao ativar um vampiro, conferir que o usuário não narra a crônica e não tem outro vampiro vivo ativo nela; humanos acompanham o contexto do vampiro.
7. **Morte e sucessão:** o Narrador registra/confirma morte do vampiro; a ficha falecida permanece no histórico e o jogador pode criar/vincular um novo vampiro para aquela mesa. O vínculo anterior deve ser encerrado como consequência transacional. Desvincular ou arquivar uma ficha viva não deve ser usado para burlar a regra de sucessão; política de saída de mesa será definida separadamente.
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
- O jogador não pode autodeclarar morte para liberar vaga. A API valida evento autorizado pelo Narrador, encerra o vínculo anterior e só então libera a nova ativação.
- Proibir qualquer associação jogador↔mesa quando o mesmo usuário é Narrador da crônica; a troca de visualização não contorna essa regra.
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
- **US-05 Múltiplas mesas:** usuário pode ter vampiro A na mesa 1 e vampiro B na mesa 2, sem transferir propriedade.
- **US-05a Um vampiro por mesa:** tentar ativar segundo vampiro vivo do mesmo jogador na mesma mesa retorna conflito, inclusive sob concorrência.
- **US-05b Sucessão por morte:** após morte confirmada pelo Narrador e encerramento do vínculo ativo, um novo vampiro pode ser ativado; arquivar/desvincular sem morte não é autorização de substituição.
- **US-05c Humanos vinculados:** criar humano sem vampiro ou com vampiro de outro proprietário/sem autorização falha; humano pertence ao contexto do vampiro e não ocupa slot de vampiro.
- **US-06 Duplo papel:** usuário que narra uma mesa pode continuar usando a visão de jogador em **outras mesas**, mas não pode vincular personagem jogador à crônica que narra; mudar visão não muda autorização.
- **US-07 Isolamento:** usuário X não lê, edita nem lista ficha de Y por manipular IDs; não recebe dados reservados da mesa.
- **US-08 Concorrência:** duas edições da mesma revisão não sobrescrevem silenciosamente; a segunda retorna 409.
- **US-09 Falhas:** erro de rede preserva campos; retorno do servidor não é interpretado como sucesso antes da confirmação.
- **US-10 Acessibilidade:** fluxo completo com teclado, leitor de tela, zoom e tamanhos especificados.

## 8. Plano incremental

**Fase A — P0:** autenticação existente ou dependência resolvida; perfil; CRUD mínimo de personagens independentes; listagem; isolamento por proprietário; UI de jogador; testes.

**Fase B — P1:** mesa/crônica e política de participação; vínculo único de vampiro vivo por jogador/mesa; ficha humana vinculada ao vampiro; bloqueio de Narrador como jogador na própria crônica; sucessão após morte confirmada; histórico; testes de concorrência e permissões.

**Fase C — P2:** visão Narrador separada, ações de mesa, convites, sessões e controle de personagens autorizados. Não antecipar a UI de Narrador na Fase A.

## 9. Dependências e decisões abertas

1. **Autenticação:** confirmar provedor, claims e fluxo de primeiro acesso efetivamente disponíveis no novo repositório.
2. **Ficha V5:** decidir quais campos podem ser salvos como rascunho sem automatizar criação mecânica; consultar apenas os PDFs V5.
3. **Participação (decidida):** no máximo um vampiro vivo ativo por jogador/mesa; humanos devem referenciar vampiro. **Pendente:** definir propriedade/visibilidade de humanos quando representarem NPCs ou dependentes de outro jogador.
4. **Aprovação:** convite, solicitação ou ambos? Quem aprova e quando o vínculo passa a `active`?
5. **Histórico e morte:** reuso de ficha em nova mesa e retenção de dados privados da anterior; definir tratamento de exceções administrativas (saída de jogador, cancelamento de mesa, mudança de Narrador) sem confundir com morte.
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
- [ ] Testar segundo vampiro vivo na mesma mesa, sucessão por morte autorizada, humano sem vampiro e Narrador tentando ingressar como jogador na própria crônica.
- [ ] Executar build, lint, testes e revisão visual/acessibilidade; registrar resultados reais.
- [ ] Validar frontend e API no Preview de `dev` antes de integrar à `main`.

**Definição de pronto:** a Fase A permite a uma pessoa autenticada manter múltiplos personagens independentes e seguros, com UI de jogador funcional, sem pressupor mesa nem acesso de Narrador. Vínculos reais com mesas e visão Narrador são entregas posteriores, explicitamente dependentes de suas próprias regras de autorização.
