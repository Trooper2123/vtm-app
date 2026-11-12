# Inventário da Fase 0 — Meus Vampiros

**Escopo:** leitura estática do branch `main` de [meus-vampiros](https://github.com/Trooper2123/meus-vampiros) e comparação com [vtm-app](https://github.com/Trooper2123/vtm-app).  
**Data da consulta:** 12/11/2026.  
**Restrição de dados:** não migrar fichas, mesas, sessões, usuários nem qualquer registro. O banco novo do `vtm-app` começa vazio; esta página inventaria o schema legado para compreender os fluxos e as regras, não para copiar dados.

## 1. Resumo da linha de base

| Área | Achado |
| --- | --- |
| Repositório legado | 624 arquivos no snapshot de `main`. |
| API integrada ao Next.js | 93 Route Handlers em `app/api/`, cobrindo 157 combinações de método e rota: GET 67, POST 46, PATCH 29, DELETE 9 e PUT 6. |
| Interface | 23 páginas `page.tsx`; o fluxo de leitura/escrita é acoplado aos Route Handlers do mesmo Next.js. |
| Ações de servidor | Não foram encontrados diretórios/arquivos dedicados `actions.ts`; a busca estática por diretivas `use server` não encontrou ações de servidor. As mutações observadas estão nas rotas HTTP. Confirmar localmente antes de remover qualquer comportamento. |
| Domínio | 125 arquivos em `lib/`: 44 em `lib/vtm-v5/`, 78 módulos no nível raiz, além de `lib/auth/` e `lib/db/`. |
| UI | 112 arquivos em `components/`, além das páginas. |
| Persistência declarada | 27 declarações `CREATE TABLE` em `lib/db.ts`, 12 arquivos SQL de migração e 19 declarações de tabelas nesses SQLs; 46 nomes de tabela distintos entre essas fontes. Isso é inventário do código, não confirmação do schema aplicado em um banco. |
| Testes | 147 arquivos sob `tests/`; 144 nomes correspondem a `*.test.*`/`*.spec.*` fora de snapshots. A presença de arquivos não comprova execução recente nem aprovação. |
| Projeto novo | `apps/web` tem a estrutura inicial Next.js; `apps/api` tem `GET /api/v1/health`; contrato/fluxo da API documentam somente health. Não há domínio migrado. |

### Métodos por rota

As contagens representam métodos exportados nos 93 handlers; uma rota pode expor vários.

| Método | Rotas |
| --- | ---: |
| GET | 67 |
| POST | 46 |
| PATCH | 29 |
| DELETE | 9 |
| PUT | 6 |

## 2. Inventário dos endpoints legados

Os nomes abaixo são caminhos derivados dos arquivos Route Handler e os métodos foram lidos dos exports. A coluna de guardas registra símbolos encontrados diretamente nos handlers, **não uma aprovação de segurança**: várias rotas delegam autenticação e permissão para serviços compartilhados. Esta tabela ainda não documenta payload/response completo, cookies nem todos os callers. Rotas sem guarda literal exigem leitura de todo o caminho de chamada antes da migração.

| Caminho legado | Métodos | Guarda/helper visto no handler |
| --- | --- | --- |
| `/api/campaign-availability` | `GET`, `POST`, `PATCH` | `getSessionOrDev`, `isUserInCampaign` |
| `/api/campaign-event-calendar/status` | `GET`, `PATCH` | `getSessionOrDev`, `canManageCampaign`, `isUserInCampaign` |
| `/api/campaign-event-calendar/toggle` | `PATCH` | `getSessionOrDev`, `canManageCampaign` |
| `/api/campaign-events` | `GET`, `POST`, `PATCH`, `DELETE` | `getSessionOrDev`, `canManageCampaign`, `isUserInCampaign` |
| `/api/campaign-invitations` | `POST` | `notesActor` |
| `/api/campaign-scheduling-calendar/status` | `GET`, `PATCH` | `getSessionOrDev`, `canManageCampaign`, `isUserInCampaign` |
| `/api/campaign-scheduling-calendar/toggle` | `PATCH` | `getSessionOrDev`, `canManageCampaign` |
| `/api/campaigns/[id]/archive` | `PATCH` | `notesActor` |
| `/api/campaigns/[id]/awake-settings` | `GET`, `POST` | `getSessionOrDev` |
| `/api/campaigns/[id]/blood-policy` | `GET`, `PATCH` | `getSessionOrDev`, `canManageCampaign` |
| `/api/campaigns/[id]/call/roll-characters` | `GET` | `notesActor` |
| `/api/campaigns/[id]/call` | `GET`, `PUT` | `notesActor` |
| `/api/campaigns/[id]/character-sms/[threadId]` | `GET`, `POST`, `PATCH` | Política delegada ao serviço/helper; confirmar por método |
| `/api/campaigns/[id]/character-sms/contacts` | `GET` | Política delegada ao serviço/helper; confirmar por método |
| `/api/campaigns/[id]/character-sms` | `GET`, `POST` | Política delegada ao serviço/helper; confirmar por método |
| `/api/campaigns/[id]/clans` | `GET` | `getSessionOrDev`, `canManageCampaign` |
| `/api/campaigns/[id]/coteries` | `GET`, `POST` | `getSessionOrDev` |
| `/api/campaigns/[id]/cover` | `GET`, `PUT`, `DELETE` | `getSessionOrDev` |
| `/api/campaigns/[id]/details` | `PATCH` | `getSessionOrDev` |
| `/api/campaigns/[id]/handouts` | `GET`, `POST` | `notesActor` |
| `/api/campaigns/[id]/handouts/upload` | `POST` | `notesActor` |
| `/api/campaigns/[id]/limits/[limitId]` | `PATCH`, `DELETE` | `getSessionOrDev` |
| `/api/campaigns/[id]/limits` | `GET`, `POST` | `getSessionOrDev` |
| `/api/campaigns/[id]/missions` | `GET`, `POST` | `getSessionOrDev` |
| `/api/campaigns/[id]/nights/awake` | `GET`, `POST` | `getSessionOrDev` |
| `/api/campaigns/[id]/npc-catalog-settings` | `GET`, `PATCH` | `getSessionOrDev` |
| `/api/campaigns/[id]/npcs` | `POST` | `notesActor`, `canManageCampaign` |
| `/api/campaigns/[id]/participants` | `GET` | `profileActor` |
| `/api/campaigns/[id]/player-handouts/[handoutId]` | `GET` | `getSessionOrDev` |
| `/api/campaigns/[id]/player-handouts` | `GET` | `getSessionOrDev`, `playerHandouts` |
| `/api/campaigns/[id]/predator-types` | `GET` | `getSessionOrDev`, `canManageCampaign` |
| `/api/campaigns/[id]/predator-types/settings` | `PATCH` | `getSessionOrDev`, `canManageCampaign` |
| `/api/campaigns/[id]/projects` | `GET`, `POST` | `getSessionOrDev` |
| `/api/campaigns/[id]/projects/stakes` | `GET` | `getSessionOrDev` |
| `/api/campaigns/[id]/session-shortcuts` | `GET`, `PATCH` | `getSessionOrDev` |
| `/api/campaigns/[id]/sessions` | `GET`, `POST` | `notesActor` |
| `/api/campaigns/[id]/settings/character-sms` | `GET`, `PATCH` | Política delegada ao serviço/helper; confirmar por método |
| `/api/campaigns/[id]/sheets` | `GET`, `POST` | `notesActor` |
| `/api/campaigns/[id]/visual` | `GET`, `PUT` | `notesActor` |
| `/api/campaigns/[id]/xp-history` | `GET`, `PATCH` | `notesActor` |
| `/api/campaigns/[id]/xp` | `POST` | `getSessionOrDev`, `canManageCampaign` |
| `/api/campaigns` | `GET`, `POST` | `getSessionOrDev`, `hasMasterAccess` |
| `/api/characters/[id]/awake` | `GET`, `POST` | `getSessionOrDev` |
| `/api/characters/[id]/blood-actions` | `POST` | `getSessionOrDev` |
| `/api/characters/[id]/blood-potency-effects` | `GET` | `getSessionOrDev` |
| `/api/characters/[id]/campaign` | `POST` | `notesActor` |
| `/api/characters/[id]/clan` | `GET`, `PATCH`, `POST` | `getSessionOrDev`, `notesActor` |
| `/api/characters/[id]/condition` | `PATCH` | `notesActor` |
| `/api/characters/[id]/discipline-rolls` | `GET`, `POST` | `getSessionOrDev` |
| `/api/characters/[id]/disciplines` | `GET`, `POST` | `getSessionOrDev`, `notesActor` |
| `/api/characters/[id]/duplicate` | `POST` | `getSessionOrDev` |
| `/api/characters/[id]/predator-type/override` | `POST` | `getSessionOrDev`, `canManageCampaign` |
| `/api/characters/[id]/predator-type` | `DELETE`, `POST` | `getSessionOrDev` |
| `/api/characters/[id]/resources` | `GET`, `PATCH` | `getSessionOrDev` |
| `/api/characters/[id]/rolls/[rollId]/adjudications` | `POST` | `notesActor` |
| `/api/characters/[id]/rolls/[rollId]/reroll` | `POST` | `notesActor` |
| `/api/characters/[id]/rolls` | `GET`, `POST` | `getSessionOrDev`, `notesActor` |
| `/api/characters/[id]/session-summary` | `GET` | `getSessionOrDev` |
| `/api/characters/[id]/specialties` | `GET`, `POST` | `getSessionOrDev` |
| `/api/characters/[id]/status` | `PATCH` | `notesActor` |
| `/api/characters/[id]/validate` | `POST`, `GET` | `getSessionOrDev`, `canManageCampaign` |
| `/api/characters/resources` | `PATCH` | `getSessionOrDev` |
| `/api/characters` | `GET`, `POST`, `PUT`, `DELETE`, `PATCH` | `getSessionOrDev`, `notesActor`, `hasMasterAccess`, `canManageCampaign`, `isUserInCampaign` |
| `/api/characters/xp-import` | `POST` | `getSessionOrDev` |
| `/api/discipline-powers` | `GET` | `getSessionOrDev` |
| `/api/handouts/[id]/file` | `GET` | `notesActor` |
| `/api/handouts/[id]` | `DELETE` | `notesActor` |
| `/api/handouts/[id]/share` | `PATCH` | `notesActor` |
| `/api/livekit/room` | `GET`, `POST` | `getSessionOrDev`, `notesActor` |
| `/api/merits-flaws` | `GET` | `getSessionOrDev` |
| `/api/migrate` | `POST` | Política delegada ao serviço/helper; confirmar por método |
| `/api/notes/[id]` | `GET`, `PATCH`, `DELETE` | `notesActor` |
| `/api/notes/context` | `GET` | `notesActor` |
| `/api/notes/links` | `GET` | `notesActor` |
| `/api/notes` | `GET`, `POST` | `notesActor` |
| `/api/npc-templates` | `GET` | `narratorActor` |
| `/api/npcs/[id]` | `GET`, `PATCH`, `DELETE` | `narratorActor` |
| `/api/npcs` | `GET`, `POST` | `narratorActor` |
| `/api/possessions` | `GET`, `POST`, `PUT` | `getSessionOrDev`, `notesActor`, `canManageCampaign` |
| `/api/predator-types` | `GET` | `getSessionOrDev`, `canManageCampaign`, `isUserInCampaign` |
| `/api/profile` | `GET`, `PUT` | `profileActor` |
| `/api/rule-sources/[id]` | `GET` | `notesActor` |
| `/api/sessions/[id]/chat` | `GET`, `POST` | `notesActor` |
| `/api/sessions/[id]/npcs` | `GET`, `POST`, `PATCH` | `notesActor` |
| `/api/sessions/[id]/reveals` | `GET`, `POST` | `notesActor` |
| `/api/sessions/[id]/rolls` | `POST` | `getSessionOrDev` |
| `/api/sessions/[id]` | `GET`, `PATCH` | `notesActor` |
| `/api/sessions/[id]/soundtrack` | `GET`, `POST` | `getSessionOrDev` |
| `/api/sessions/[id]/visual` | `GET`, `PATCH` | `notesActor` |
| `/api/sheet-catalog` | `GET` | `notesActor` |
| `/api/sheet-media/[id]` | `GET`, `PATCH`, `DELETE` | `notesActor` |
| `/api/sheet-media` | `GET`, `POST` | `notesActor` |
| `/api/sheet-media/upload` | `POST` | `notesActor` |

## 3. Inventário de páginas

Caminhos atuais sob `app/`. A lista inclui páginas principais; componentes compartilhados e layouts estão contabilizados à parte.

- `app/campaigns/[id]/coterie`
- `app/campaigns/[id]/npcs/new`
- `app/campaigns/[id]`
- `app/campaigns/[id]/projects`
- `app/campaigns/[id]/session`
- `app/campaigns/new`
- `app/campaigns`
- `app/campaigns/player/[id]`
- `app/characters/[id]/edit`
- `app/characters/[id]/evolution`
- `app/characters/[id]/narrative`
- `app/characters/[id]`
- `app/characters/[id]/summary`
- `app/characters`
- `app/create-characters`
- `app/master/catalogo`
- `app/master`
- `app/master/vantagens-defeitos`
- `app/notes`
- `app/npcs/[id]`
- `app/npcs`
- `app`
- `app/profile`

## 4. Módulos de domínio e responsabilidades

| Área | Módulos de referência no legado | Observação de acoplamento |
| --- | --- | --- |
| Identidade/autorização | `lib/auth0.ts`, `lib/auth/authorization.ts`, `lib/user-profile.ts`, `lib/player-campaigns.ts` | A sessão Auth0 é lida pelo SDK do Next. O identificador de usuário é o `sub` do Auth0. |
| Personagens e comandos | `lib/characters.ts`, `lib/character-commands.ts`, `lib/character-xp.ts`, `lib/xp-transactions.ts`, `lib/character-rolls.ts`, `lib/character-roll-history.ts`, `lib/character-resources.ts`, `lib/character-disciplines.ts`, `lib/character-specialties.ts` | As regras, validações, atualizações de estado e queries de persistência são repartidas em arquivos TypeScript; seguir callers e invariantes antes de portar. |
| Regras V5 | 44 arquivos em `lib/vtm-v5/`, incluindo `disciplines`, `discipline-powers`, `clans`, `predator-types`, `trait-options`, `validation`, `creation-grants`, `session-state` | Há regras parciais e catálogos especializados; não interpretar o conjunto como implementação completa do sistema V5. |
| Mesas e agenda | `lib/campaigns.ts`, `lib/availability.ts`, `lib/background-availability.ts`, `lib/campaign-invitations.ts`, `lib/campaign-events`, `lib/campaign-missions.ts`, `lib/campaign-xp-history.ts` | Proprietário e participante são permissões diferentes; várias operações consultam personagens ligados à mesa. |
| Sessões | `lib/game-sessions.ts`, `lib/chronicle-nights.ts`, `lib/session-rolls.ts`, `lib/session-chat.ts`, `lib/session-soundtrack.ts`, `lib/session-visual.ts`, `lib/session-handouts.ts` | Sessão tem estado persistido e validações próprias de membro/Narrador. |
| NPCs, fichas narrativas e mídia | `lib/npc-domain.ts`, `lib/npc-store.ts`, `lib/npc-sessions.ts`, `lib/sheet-access.ts`, `lib/sheet-records.ts`, `lib/sheet-media.ts` | Várias tabelas só existem após as migrações SQL do módulo; visibilidade pode depender de papel, mesa e item. |
| Notas e catálogo narrativo | `lib/notes.ts`, `lib/notes-http.ts`, `lib/npc-http.ts`, `lib/rule-profile.ts`, `lib/possessions.ts` | Helpers HTTP combinam sessão, proteção de origem, tratamento de erro e delegação de domínio. |
| Persistência | `lib/db.ts`, `lib/db/`, `migrations/*.sql` | `ensureAllTables()` contém DDL e é chamada por rotas/serviços. Não portar inicialização automática para a API nova; definir schema novo vazio e migrações versionadas. |

## 5. Entidades/tabelas encontradas no código

As tabelas foram agrupadas por função a partir de `CREATE TABLE` em `lib/db.ts` e dos 12 arquivos em `migrations/`. Algumas podem não existir no banco de um ambiente se a migração correspondente não tiver sido aplicada.

| Grupo | Nomes encontrados |
| --- | --- |
| Base/identidade | `users`, `campaigns`, `characters`, `character_possessions`, `campaign_limits`, `notes`, `note_requests`, `character_ledger_events`, `character_commands` |
| Campanha/agenda | `campaign_awake_setting_events`, `chronicle_nights`, `night_awakenings`, `campaign_predator_type_settings`, `campaign_availability`, `campaign_event_calendars`, `campaign_events`, `campaign_scheduling_calendars`, `campaign_missions`, `campaign_mission_characters`, `campaign_mission_npcs`, `campaign_mission_events` |
| Regras/catálogos | `discipline_catalog`, `clan_disciplines`, `skill_catalog`, `discipline_research_catalog` |
| Sessão/colaboração | `game_sessions`, `game_session_nights`, `game_session_close_operations`, `session_soundtrack_state`, `session_soundtrack_commands`, `session_chat_messages`, `session_shared_visuals`, `campaign_visual_state`, `campaign_handouts`, `campaign_handout_recipients` |
| NPC/ficha narrativa/mídia | `npc_definitions`, `campaign_npcs`, `npc_session_instances`, `npc_operations`, `sheet_contexts`, `sheet_records`, `sheet_relations`, `sheet_media`, `sheet_upload_requests`, `sheet_reveals` |
| Outros/confirmar no schema | `livekit_rooms`, `character_message_threads`, `character_messages`, `character_message_deliveries` |

**Atenção:** este levantamento não consulta Neon e não confirma a versão do schema implantado. Para o novo app, usar esses nomes como vocabulário funcional, não como instrução de compartilhar ou preencher o banco legado. Não copiar linhas.

## 6. Modelo de autenticação e autorização observado

| Regra/camada | Evidência no código | Consequência para o inventário |
| --- | --- | --- |
| Sessão | `lib/auth0.ts`: Auth0 no runtime de produção; usuário `dev|local` sintético quando `NODE_ENV !== production`. | No novo app, desenhar autenticação da API separada da sessão Next legado; proibir bypass em produção. |
| Identidade | Persistência usa `auth0_id`/`sub` como identificador do usuário. | É possível manter a mesma identidade do provedor sem importar linhas de perfil; perfis do novo app serão novos. |
| Dono de personagem | `characters.user_id`, consultas de `getCharacterById` e `canEditCharacter`. | Cada endpoint que recebe id deve limitar consulta/mutação ao usuário ou a autorização explícita. |
| Narrador/dono de mesa | `campaigns.master_user_id`, `hasMasterAccess`, `canManageCampaign`. | Permissão por recurso; não inferir acesso a partir de “usuário autenticado”. |
| Participante | `isUserInCampaign`, `getPlayerCampaign`, associação de personagem à mesa e helpers de sessão. | Acesso de jogador requer participação válida; dados retornados variam conforme papel. |
| Narrativa | `notesActor` exige sessão e, em mutações, valida origem e content-type; `narratorActor` adiciona checagem de Narrador. | Ao portar, separar autenticação de autorização e declarar ambas por operação no OpenAPI. |
| Fichas narrativas | `sheet-access.ts` verifica membro, Narrador, visibilidade, autor e configuração `allow_player_narrative_edits`. | Regras de visibilidade não podem ser reconstruídas somente no frontend. |
| Mídia/handouts | `sheet-media.ts`, `session-handouts.ts`, `player-handouts.ts` filtram por acesso/compartilhamento; configuração Vercel Blob privada. | URL, token e acesso a arquivo precisam continuar mediados pelo backend. |
| Sala de voz/vídeo | `lib/livekit.ts`, `isLiveKitHost` e checagem de participante. | Token de sala deve ser criado no servidor só para participantes válidos. |

A triagem de símbolos nos 93 handlers encontrou chamadas diretas a `getSessionOrDev` em 50 arquivos, `notesActor` em 39, `canManageCampaign` em 16 e `isUserInCampaign` em 6 (contagens sobrepostas). Serviços como `character-sms-http`, `game-sessions` e `sheet-access` implementam outras camadas. **Essas contagens não medem cobertura de autorização**; é necessário rastrear cada método e chamadas delegadas antes de portar qualquer endpoint.

## 7. Integrações e configuração

| Integração | Presença/uso encontrado | Dependências de migração |
| --- | --- | --- |
| Auth0 | `@auth0/nextjs-auth0`; middleware/proxy e sessão no app antigo. | Configurar novo callback/logout, estratégia web→API, audience/claims e segredos em projetos separados. |
| Neon/PostgreSQL | `pg`, `@neondatabase/serverless`, Drizzle; produção e dev dependem de `DATABASE_URL`. | Nova base Neon independente; schema próprio; ambiente de Preview com dados sintéticos. |
| Vercel Blob | Upload/download privado de handouts, capas/imagens e mídia; requer token/configuração. | Reimplementar política de acesso no backend e validar storage novo sem usar objetos legados. |
| LiveKit | Cliente, componentes e SDK de servidor; recurso opcional segundo README. | API deve emitir token após autorizar membro e sala. Confirmar chaves/URLs e comportamento real. |
| Rolagens | `@dice-roller/rpg-dice-roller` e serviços V5 no servidor. | Migrar serviço e testes de regras antes de ativar rolagem no cliente novo. |
| Outras dependências | Manifesto também inclui `@jitsi/react-sdk`, SDK S3/AWS, Vercel Analytics e Ollama. | Confirmar uso efetivo, dono do dado e segredo necessário antes de decidir migração; dependência instalada não prova funcionalidade ativa. |

## 8. Status dos fluxos e evidências

O README legado, atualizado em 03/11/2026, chama as capacidades abaixo de “ativas”, mas diz que configuração e migrações afetam disponibilidade e que isso não equivale à validação integral em produção.

| Fluxo | Estado descrito no legado | Testes relacionados encontrados | Configuração/pendências | Decisão para a migração |
| --- | --- | --- | --- | --- |
| Perfil | Implementado | `dev-master-profile.test.ts`, `unified-profile-ownership.test.ts` | Auth0 e persistência; no novo app serão perfis novos. | Migrar depois da base de identidade; criar perfis novos, sem importar linhas antigas. |
| Catálogos/regras de ficha | Implementados em parte por catálogos V5 | `discipline-powers-route.test.ts`, `discipline-ui.test.ts`, `discipline-power-row.test.ts`, `clan-rules-catalog.test.ts`, `predator-types-core.test.ts`, `merits-flaws-research.test.ts` | Confirmar escopo de regras e fontes; não é implementação integral do sistema V5. | **Piloto proposto:** catálogo somente leitura de poderes de disciplina, condicionado à execução dos testes. |
| Personagem | Criação/edição, fichas independentes, duplicação, validação e aprovação listadas como ativas | `character-creation-dialog.test.ts`, `character-form-*.test.ts`, `character-independent*.test.ts`, `character-save-concurrency.test.ts`, `character-type-access-route.test.ts` | Migração de fluxo de código, mas sem fichas legadas no app novo. | Migrar funcionalidade em etapa posterior; fichas existentes ficam somente no legado. |
| Evolução/rolagens | XP/histórico, recursos, ações de sangue e rolagens listados como ativos | `character-xp-*.test.ts`, `character-rolls*.test.ts`, `blood-actions.test.ts`, `v5-spec-dice*.test.ts` | Regras de servidor, idempotência/concorrência e autorização por papel. | Depois do ciclo de personagem; não portar XP ou estado de fichas existentes. |
| Mesas/agenda | Criação/gestão, convites, participantes, políticas, arquivamento, eventos e disponibilidade listados como ativos | `campaign-creation*.test.ts`, `campaign-invitations.test.ts`, `campaign-participant-controls.test.ts`, `campaign-calendar.integration.test.ts`, `availability-audit.test.ts` | Não há registros de mesas antigos no app novo; integração de e-mail externa não está presumida. | Migrar criação e gestão de novas mesas depois do perfil/personagem; sem importar mesas, participantes ou eventos antigos. |
| Sessões | Sessões persistidas, noites, ferramentas e rolagens listadas como ativas | `game-sessions.test.ts`, `game-session-storage.test.ts`, `session-hub-collaboration.test.ts`; ver também `v5-spec-dice*.test.ts` | README relata pendências globais de validação e requer PostgreSQL; sem registros anteriores no novo banco. | Posterior às mesas novas e ao personagem; somente sessões criadas no `vtm-app`. |
| NPCs/fichas narrativas | Há partes ativas e outras parciais | `npc-domain-v2.test.ts`, `npc-validation.test.ts`, `sheet-media-lifecycle.test.ts`, `sheet-relations-submit.test.ts` | 10 tabelas iniciais definidas em migração própria; validar destino e objetos Blob novos. | Migrar depois de sessão/autorizações; sem migrar fichas narrativas ou registros de mesa antigos. |
| Notas, handouts e mídia | Implementados com controles de visibilidade; disponibilidade depende de schema/configuração | `notes.test.ts`, `session-notes.test.ts`, `sheet-media-api.test.ts`, `sheet-media-ui.test.ts` | Banco, Blob privado, permissões de Narrador/participante. | Posterior ao fluxo básico de mesa; armazenar novos itens apenas no serviço do app novo. |
| Voz/vídeo | LiveKit opcional | `livekit-token.test.ts` | Requer configuração e integração externa real; não é bom primeiro piloto. | Migrar por último e somente após validar autorização de sessão/sala. |
| Itens parciais/planejados | NPC/carniçal e combate completos; feed/visibilidade da chamada; wiki; regras avançadas | Testes existentes cobrem recortes específicos | Não incluir como “validado” só porque há código/testes parciais. | Adiar até escopo, regra, teste e dependência editorial estarem confirmados. |
### Testes e execução CI observados

- Testes são Vitest, com configuração que rejeita `DATABASE_URL` fora de localhost e usa schema isolado `meus_vampiros_test`. Há helpers que abortam se o host do banco não for local.
- Foram localizados dois workflows de CI com filtros por paths: `NPC messaging validation` e `SPEC-SESSION-011 validation`. Não há workflow geral de execução da suíte completa listado no snapshot do repositório.
- Execução mais recente encontrada entre as 10 execuções consultadas: [NPC messaging validation — develop, sucesso em 11/11/2026](https://github.com/Trooper2123/meus-vampiros/actions/runs/43116931332). É evidência apenas para o escopo desse workflow/commit.
- Há falhas recentes observadas em execuções de `SPEC-SESSION-011 validation` em branches de feature em 06–07/11/2026; elas não provam falha do `main`, mas justificam não assumir estabilidade global.
- **Não executei o app legado neste ambiente**: o workspace não contém checkout do repositório, configuração Auth0 nem PostgreSQL local. Portanto, a reprodução isolada prevista no gate permanece pendente; arquivos de teste e CI não substituem essa execução.

## 9. Piloto proposto

**Candidato:** catálogo somente leitura de poderes de disciplina, usando o comportamento de `GET /api/discipline-powers?disciplineId=CELERITY&maxLevel=2` como referência.

**Por que é um piloto pequeno**

- Um endpoint GET, sem escrita e sem dependência de banco.
- Dados vêm dos catálogos estáticos `lib/vtm-v5/disciplines.ts` e `discipline-powers.ts`.
- Há teste do handler para sessão ausente (401), parâmetros inválidos/repetidos e conteúdo retornado; há testes específicos do componente de seleção.
- Exercita o contrato documentado, autenticação e integração frontend/API sem transportar fichas nem registros de mesas.

**Escopo permitido do piloto:** endpoint e uma visualização nova/isolada do catálogo. Não migrar as telas completas de fichas, criação/edição/duplicação de personagens, persistência de personagens, mesas nem dados legados.

**Gate do piloto ainda pendente:** executar os testes relevantes no app legado em ambiente de desenvolvimento isolado e reproduzir a consulta com usuário autenticado e sem sessão. A inspeção do arquivo de teste não confirma que esteja passando hoje. Com a Fase 1 pronta, repetir o mesmo conjunto de casos na API/frontend do `vtm-app`.

## 10. Fechamento da Fase 0

- [x] Inventário estático dos 93 handlers, métodos, 23 páginas, módulos, tabelas declaradas, regras de autorização, integrações e testes relacionados.
- [x] Status funcional separado de configuração e evidência de teste; itens parciais anotados.
- [x] Piloto proposto e delimitado sem migração de fichas, mesas ou registros.
- [ ] Completar para o piloto o mapa UI→endpoint, parâmetros/corpo, respostas/erros, efeitos de sessão/cookies e chamadas repetidas/lote.
- [ ] Reproduzir o fluxo de referência no ambiente isolado do app legado; sem esses passos, o gate da Fase 0 não está fechado.

**Conclusão:** a leitura do repositório dá base para iniciar a preparação técnica, mas a Fase 0 está parcialmente concluída: o contrato detalhado do piloto e sua reprodução isolada ainda estão pendentes. Nenhum fluxo está aprovado para lançamento. O primeiro candidato é o catálogo de poderes; ele só deve ser considerado baseline depois que o teste local isolado for executado e o comportamento confirmado.
