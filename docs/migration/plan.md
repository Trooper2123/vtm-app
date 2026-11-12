# Plano de migração incremental — Meus Vampiros

**Status:** proposta para revisão  
**Repositório de origem:** [Trooper2123/meus-vampiros](https://github.com/Trooper2123/meus-vampiros)  
**Repositório de destino:** [Trooper2123/vtm-app](https://github.com/Trooper2123/vtm-app)  
**Deploys do destino:** `main` = produção; `dev` = Preview. Ver [docs/deployments.md](../deployments.md).

## 1. Objetivo e estratégia

Migrar o produto por **fluxos verticais completos** — interface, API, regras e validação — mantendo o app atual disponível enquanto cada fluxo novo é aprovado. Não fazer uma cópia integral do monólito.

**Fora do escopo:** transferir ou importar fichas, mesas, sessões, usuários ou quaisquer registros existentes do app antigo. O novo app começa com um banco próprio vazio (além de dados sintéticos em Preview). Os registros atuais continuam acessíveis somente no app antigo. A migração trata do código e das capacidades funcionais; não converte dados legados.

## 2. O que foi encontrado

| Aspecto | Repositório antigo | Repositório novo |
| --- | --- | --- |
| Organização | Next.js com frontend e backend no mesmo app | Projetos Vercel separados para `apps/web` e `apps/api` |
| Rotas e páginas | 93 handlers em `app/api/` e 23 páginas principais | Uma função `GET /api/v1/health` e uma página inicial |
| Domínio e interface | 125 arquivos em `lib/`, 112 em `components/`; regras V5 distribuídas em módulos | Ainda sem módulos de domínio migrados |
| Testes | 147 arquivos em `tests/`, incluindo testes de UI, regras, segurança e integração | Estrutura de validação ainda inicial |
| Persistência | Neon/PostgreSQL, `pg` e Drizzle; `lib/db.ts` também contém criação/ajustes de tabelas em runtime | API ainda não conectada ao domínio/banco |
| Autenticação | Auth0 via sessão do Next.js; autorização por usuário, personagem e mesa | Estratégia de autenticação ainda precisa ser implementada |
| Integrações | Vercel Blob, LiveKit e rolagens com `rpg-dice-roller` | Ainda não migradas |
| Versões | Next.js 16.4.3, React 19.3 e Auth0 SDK 4.32.0 no manifesto atual | Next.js 15.5.28 e React 19.1.0 |

O README do app antigo classifica vários recursos como implementados, mas ressalva que isso não significa validação integral em produção. Portanto, **implementado**, **configurado**, **testado** e **aprovado para migração** devem ser estados separados.

## 3. Arquitetura-alvo

- **Frontend — `apps/web`:** páginas, componentes, navegação e estado visual. Não acessa PostgreSQL, não contém credenciais privadas e não decide autorização.
- **Backend — `apps/api`:** funções Node.js/TypeScript em `api/v1/`; autentica e autoriza no servidor, aplica regras de domínio e acessa dados/serviços externos.
- **Contrato:** `docs/api/openapi.yaml` descreve cada endpoint; `docs/api/flows/` registra os fluxos exercitáveis. Ambos acompanham a implementação no mesmo conjunto de mudanças.
- **Banco:** PostgreSQL/Neon em uma base própria do `vtm-app`, sem copiar nem compartilhar o banco de produção do app antigo. A base de produção nova começa vazia; a base de desenvolvimento/Preview deve usar dados fictícios. Não importar registros legados ou linhas de usuários.
- **Autenticação:** definir primeiro a troca segura de identidade entre frontend e API. O cookie de sessão do Auth0 do Next antigo não deve ser presumido válido no domínio/projeto da nova API. A API precisa validar token/claims e autorizar cada recurso. A decisão entre chamadas servidor-servidor usando sessão do frontend (BFF) e token de acesso enviado pelo cliente deve ser validada com Auth0, CORS, callbacks, logout e os domínios da Vercel antes de migrar fluxos com dados privados.
- **Integrações:** preservar controle de acesso a arquivos privados e salas LiveKit no backend; nenhuma chave secreta deve chegar ao navegador.

## 4. Regras para dados e compatibilidade

1. Criar uma base Neon própria para o `vtm-app`; não conectar os projetos novos ao banco de produção do legado.
2. Não copiar/importar registros de personagens, mesas, sessões, perfis ou outros dados do app antigo. O banco novo de produção começa vazio; Preview/dev usam dados sintéticos.
3. O app antigo continua operando com seus dados e banco atuais. O novo app grava somente na base nova. Não há dual-write, leitura cruzada ou sincronização entre as aplicações.
4. Controlar o schema do banco novo por migrações versionadas e revisadas; não executar DDL automaticamente durante requisições.
5. Antes de liberar escrita nova em produção, documentar tabelas, invariantes, autorização, efeitos colaterais, backup e rollback do próprio `vtm-app`.
6. Registros criados no `vtm-app` não aparecerão no legado. Se houver rollback de tráfego para o app antigo, novos registros do app novo ficarão acessíveis somente nele; não planejar cópia de volta como parte deste trabalho.

## 5. Fases propostas

### Fase 0 — Inventário e linha de base

**Entregas**

- Inventário estático detalhado em [`docs/migration/inventory.md`](./inventory.md): 93 rotas e métodos, 23 páginas, módulos de domínio, tabelas declaradas, modelo de autorização, integrações e testes encontrados.
- Estados do legado separados entre implementação, configuração, evidência de teste, pendências e decisão de migração; nenhum dado de personagens, mesas, sessões ou usuários será transferido.
- Busca inicial por ações de servidor; mutações encontradas estão nos Route Handlers. A relação completa entre UI, chamadas, payloads/erros e efeitos colaterais deve ser confirmada durante o piloto.
- Piloto proposto: leitura do catálogo de poderes de disciplina, sem migrar telas/persistência de fichas nem registros de mesas. O handler tem teste de sessão ausente e validação de parâmetros; o teste ainda precisa ser executado.

**Gate:** inventário e escopo do piloto registrados. O gate de reprodução do comportamento legado permanece **pendente** até executar os testes e a consulta no ambiente isolado; os arquivos de teste e os resultados de CI de escopo limitado não provam validação global.

### Fase 1 — Base técnica, identidade e contrato

**Entregas**

- Estabelecer versão suportada e compatível de Node, Next, React, Auth0 SDK e TypeScript nos dois projetos. Validar a diferença atual de versões antes de transportar código.
- Definir configuração Auth0 para web/API, audience/claims, callbacks, logout, CORS e autorização por usuário e recurso.
- Definir formato consistente para erros HTTP, validação, logs sem dados sensíveis e identificador de correlação.
- Definir acesso à Neon e estratégia de migrações; retirar o acoplamento entre regras e DDL em runtime aos poucos.
- Expandir o contrato OpenAPI e os fluxos de teste; definir comandos e ambiente de teste da API e da interface.

**Gate:** chamada autenticada de ponta a ponta no Preview, acesso negado sem permissão, nenhum segredo exposto ao navegador e teste conectado somente ao banco isolado.

### Fase 2 — Primeiro vertical slice: leitura de catálogo

Começar por leitura de dados de referência sem alterar personagens ou mesas. Candidatos a confirmar no inventário: catálogo de ficha, clãs, disciplinas/poderes, tipos de predação e vantagens/defeitos.

**Entregas**

- Selecionar um catálogo pequeno que esteja validado no legado.
- Implementar endpoint documentado, acesso do frontend, estados de carregamento/erro/vazio e teste de contrato.
- Comparar resultados novos com as regras/catálogos do legado e verificar idioma, ordenação e restrições relevantes.

**Gate:** mesmo resultado funcional nos ambientes de desenvolvimento e Preview; sem dependência direta do frontend em dados locais duplicados.

### Fase 3 — Perfil e ciclo básico de personagem

Migrar um fluxo de cada vez: criação de perfil na base nova após autenticação; criar, listar, visualizar, editar e validar fichas criadas no `vtm-app`; depois duplicar fichas dentro do novo app. Não buscar nem importar fichas do legado.

**Atenção:** a identidade Auth0 pode ser a mesma, mas perfis e registros da aplicação são novos e ficam no banco do `vtm-app`. Toda consulta/mutação deve aplicar propriedade e permissão no servidor.

**Gate:** testes de não autenticado, usuário sem permissão, tentativa de acesso a ficha de outra conta criada no novo app e persistência após nova sessão. Não é necessário testar compatibilidade de dados com o schema legado.

### Fase 4 — Evolução e regras do personagem

Migrar recursos em etapas dependentes: atributos/condições e ações de sangue; disciplinas e poderes; XP e histórico; rolagens, rerrolagens e adjudicação. O servidor deve recalcular regras e resultados: não confiar em cálculos ou permissões enviados pelo cliente.

**Gate:** casos de regra cobertos por testes, histórico coerente, operações de escrita protegidas contra repetição/concorrência quando aplicável e autorização de Narrador validada.

### Fase 5 — Mesas e agenda

Migrar criação/gestão de novas mesas, participantes, convites, políticas e configurações; em seguida, eventos, calendário, disponibilidade e convocação. Não importar mesas, participantes ou eventos existentes do app antigo. Manter propriedade da mesa e participação independentes do perfil comum do Auth0.

**Gate:** isolamento entre mesas, convite com estados e expiração conforme comportamento aprovado, calendário consistente e regressão dos fluxos ainda servidos pelo legado.

### Fase 6 — Sessões e ferramentas narrativas

Migrar início/fim e leitura da sessão persistida; recursos e rolagens em sessão; NPCs; notas e compartilhamento; projetos/coterie; handouts e ferramentas visuais/sonoras. A ordem deve respeitar os vínculos entre mesa, personagem, sessão e Narrador.

**Gate:** persistência após reinício, uma sessão ativa conforme regra atual, visibilidade correta por papel, notas privadas protegidas e fluxo validado sem depender de vídeo.

### Fase 7 — Arquivos, tempo real e itens parciais

Integrar uploads e leitura privada via Blob e salas/tokens LiveKit depois de a autorização da API estar estável. Migrar funcionalidades que o README marca como parciais ou planejadas somente depois de especificar e validar o comportamento; não tratá-las como equivalentes por existirem telas ou endpoints.

**Gate:** acesso a arquivos/salas restrito aos participantes autorizados, tokens gerados no servidor, expiração/revogação coerentes e testes reais de integração em Preview.

### Fase 8 — Adoção e encerramento do legado

- Manter o app antigo como entrada principal durante o piloto. Abrir o novo app para um grupo pequeno e ampliar após aceite de cada fluxo.
- Comunicar qual aplicação é responsável por cada fluxo e evitar alternar uma edição entre duas interfaces sem uma estratégia explícita de compatibilidade.
- Definir domínio, callbacks Auth0, comunicação aos usuários, observabilidade e procedimento de retorno antes de redirecionar o acesso geral.
- O app antigo permanece como acesso aos registros legados. Encerrá-lo é uma decisão independente e não faz parte desta migração.
- Como as bases são separadas, não haverá reconciliação entre registros antigos e novos. Comunicar que fichas/mesas antigas permanecem no legado e as criadas no `vtm-app` existem apenas no novo app.

**Gate final:** jornadas novas aprovadas, suporte/observabilidade prontos, rollback praticado e decisão explícita de adoção. O cutover não transfere registros.

## 6. Critério de aceite por fluxo

Um módulo só está pronto para migrar/ser liberado quando:

- [ ] O comportamento e as regras aceitas estão descritos e delimitados.
- [ ] A API está descrita no OpenAPI e o fluxo ponta a ponta está em `docs/api/flows/`.
- [ ] UI e backend estão completos para o mesmo caso de uso; não há botões ou rotas que terminem em comportamento simulado.
- [ ] Autenticação, autorização, propriedade do recurso e isolamento por usuário/mesa foram testados no servidor.
- [ ] Testes relevantes de domínio, contrato, integração e interface passam no ambiente isolado.
- [ ] O Preview de `dev` foi exercitado com dados fictícios, incluindo sucesso, erro e tentativa de acesso indevido.
- [ ] Banco e serviços externos não receberam alterações não autorizadas; migrações do banco novo estão revisadas. Nenhum dado legado foi copiado.
- [ ] Limitações e pendências foram registradas; não se chama de “validado” algo que só foi implementado ou compilado.

## 7. Estratégia de teste e deploy

- Reaproveitar os **casos de comportamento** dos testes legados, não copiar em bloco testes que dependem de imports, mocks ou rotas internas do monólito. Adaptar testes de domínio para os módulos novos e acrescentar testes de contrato/API e jornada.
- A suíte antiga conta com 147 arquivos de teste; isso é um inventário de evidências úteis, não uma garantia de cobertura do sistema nem de que todos passaram recentemente.
- Testar contra PostgreSQL local isolado ou branch Neon de Preview com dados sintéticos. Nunca executar seed, limpeza ou testes mutáveis na produção.
- Integrar feature branches em `dev` para gerar Preview; branches fora de `dev` e `main` não geram deploy nesses projetos. Fazer merge em `main` só depois do aceite no Preview, conforme [docs/deployments.md](../deployments.md).
- Para mudanças que atingem os dois projetos, verificar deployment do frontend e da API, comunicação entre origens, CORS, autenticação e fluxo completo; não validar cada projeto isoladamente apenas pelo status de build.
- Manter o app antigo implantado durante a adoção. Ele continua sendo o único acesso aos registros antigos; o app novo usa sua própria base. Reversão do deployment novo preserva os dados novos, mas não os torna visíveis no legado.

## 8. Riscos e decisões antes do piloto

| Risco/decisão | Tratamento proposto |
| --- | --- |
| Sessão Auth0 presa ao Next.js antigo | Fechar o padrão de sessão/token e validar callbacks, audiência, CORS e domínios antes de migrar qualquer dado privado. |
| Diferença de versões Next/React | Testar a compatibilidade e escolher a versão-alvo antes de portar componentes; não copiar dependências em bloco. |
| DDL em runtime e migrações manuais | Não levar o DDL do monólito para a API nova; definir schema e migrações versionadas para a base própria. |
| Semântica escondida nas 93 rotas | Inventariar consumidores e efeitos colaterais por fluxo; API nova não deve ser somente um proxy genérico para a antiga. |
| Funcionalidade parcial apresentada como pronta | Usar status de implementação e evidência de validação separados; itens parciais ficam fora do piloto. |
| Arquivos e tempo real | Manter políticas de autorização e URLs/tokens privados no backend; migrar após o fluxo básico da sessão. |
| Bases independentes | Não haverá importação nem sincronização. O legado mantém seus registros; novos registros pertencem ao `vtm-app` e não aparecem no app antigo. |
| Rollback com dados novos | Reverter o código não apaga a base nova. Se o tráfego voltar ao legado, os registros criados no `vtm-app` só permanecem acessíveis pelo próprio app novo. |

**Próximo passo:** fechar a reprodução do piloto indicado em [`docs/migration/inventory.md`](./inventory.md) no legado, usando ambiente e dados isolados. Depois, aprovar o padrão Auth0/Neon para a base independente vazia do `vtm-app` e portar somente o catálogo selecionado.
