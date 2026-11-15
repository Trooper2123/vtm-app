# Mapeamento de regras — Vampiro: A Máscara V5

> **Estado:** catálogo documental inicial, não implementação. **Escopo:** exclusivamente os PDFs V5 fornecidos no projeto. Não usar D&D, Pathfinder, SRDs externos nem a inferência de que uma funcionalidade de software já esteja implementada.  
> **Fonte-base:** `VtM V5 - Vampire the Masquerade.pdf` (*Vampire: The Masquerade Fifth Edition*, livro básico). As páginas abaixo são **páginas impressas** do livro, e não necessariamente o índice do visualizador de PDF (no arquivo fornecido o início do capítulo de regras está na página 117 impressa / página 119 do PDF).

## Como ler este catálogo

- **[B] Base:** regra ou subsistema do livro básico.
- **[E] Expansão:** complemento presente em suplemento identificado.
- **[O] Opcional:** o livro o descreve como opcional ou alternativa.
- **[P] Proposta técnica:** requisito sugerido para o aplicativo, **não** regra oficial do V5.
- **[C] Conferir:** houve identificação de fonte/tema, mas detalhes de fórmula, exceções ou compatibilidade precisam ser conferidos no livro antes de automatizar.
- Toda implementação deve armazenar `source_title`, `printed_page`, `edition`, `classification`, `rule_id` e, quando relevante, `requires_storyteller_decision`.
- Não reproduzir integralmente páginas, fichas, listas de poderes ou textos protegidos. Este material é um índice funcional e uma paráfrase de referência.

## 1. Núcleo compartilhado

| ID | Mecânica | Regras e responsabilidades | Fonte impressa | Estado |
|---|---|---|---|---|
| V5-CORE-001 | Paradas de dados | Testes agrupam dados d10 definidos pelo atributo + habilidade (ou outro conjunto especificado); mestre define circunstância/dificuldade | Básico, pp. 115–124 | [B] |
| V5-CORE-002 | Sucesso e dificuldade | Cada d10 com 6–10 vale um sucesso; atingir ou superar a dificuldade resulta em êxito; registrar margem e contexto | Básico, pp. 118–123 | [B] |
| V5-CORE-003 | Críticos | Pares de resultados 10 alteram o total de sucessos; tratar combinações múltiplas e efeitos dramáticos | Básico, pp. 120–123 | [B] |
| V5-CORE-004 | Fome nos dados | A Fome substitui dados regulares da parada por dados de Fome, respeitando o tamanho total; esses dados não podem ser rerrolados com Força de Vontade | Básico, pp. 205–207 | [B] |
| V5-CORE-005 | Crítico bagunçado (*messy critical*) | Resultado crítico que envolve 10 em dado de Fome: êxito com manifestação da Besta, sujeito à interpretação narrativa | Básico, p. 207 | [B] |
| V5-CORE-006 | Falha bestial (*bestial failure*) | Falha no teste com 1 em dado de Fome pode produzir consequência da Besta; êxito no teste não é falha bestial | Básico, pp. 206–208 | [B] |
| V5-CORE-007 | Compulsões | Consequências comportamentais gerais e de clã, com decisão/aplicação do Narrador; não tratar como simples penalidade universal | Básico, pp. 208–211 | [B] |
| V5-CORE-008 | Custos de sangue | Testes de Despertar (*Rouse Checks*), Fome e ativação de habilidades específicas; o custo é por poder/efeito, não regra genérica de mana | Básico, pp. 205–223, 244 em diante | [B] |
| V5-CORE-009 | Potência de Sangue | Efeitos de geração/Potência de Sangue sobre uso do sangue, recursos e limites | Básico, pp. 214–220 | [B] |
| V5-CORE-010 | Alimentação e caça | Métodos de caça, nível de Fome, presas, condições e consequências; escolha do predador e domínio alteram abordagem | Básico, pp. 211–213 e 306–308 | [B] |
| V5-CORE-011 | Ressonância | Ressonância e aspectos da alimentação interagem com desenvolvimento e poderes | Básico, pp. 226–230 e 244 | [B] |
| V5-CORE-012 | Vitalidade e Força de Vontade | Rastreadores, dano superficial/agravado, prejuízo e consequências; conflito físico e social afetam rastreadores distintos | Básico, pp. 119 e 124–130 | [B] |
| V5-CORE-013 | Conflito e turnos | Conflitos físicos e sociais, iniciativa narrativa, ações, oposição, margens, dano e encerramento | Básico, pp. 123–130 | [B] |
| V5-CORE-014 | Combate avançado | Alternativas de iniciativa, combate próximo e à distância, cobertura, dano de armas e outras opções; não substituir por padrão o conflito básico | Básico, pp. 295–305 | [O] |
| V5-CORE-015 | Humanidade | Humanidade, Princípios da Crônica, Convicções/Pilares, Máculas e remorso; consequências morais não devem ser decididas automaticamente sem o Narrador | Básico, pp. 172–175 e 236–241 | [B] |
| V5-CORE-016 | Laços de Sangue e diablerie | Relações sobrenaturais e consequências específicas; requer tratamento independente de condições comuns | Básico, pp. 233–235 | [B] |

### Observações de implementação [P]

1. **Rolagem:** guardar os valores de cada d10 **e** sua natureza (regular/Fome). Registrar número de sucessos, pares de 10, dificuldade, margem, eventual rerrolagem válida, resultado e decisão narrativa.
2. **Árbitro humano:** o software deve calcular componentes mecânicos verificáveis e deixar ao Narrador a escolha de Compulsões, complicações, grau de exposição da Máscara e interpretação de resultados quando o texto prevê decisão narrativa.
3. **Privacidade:** resultados secretos, dificuldades reservadas, dados de antagonistas e cenas não reveladas não devem chegar ao cliente de jogador.
4. **Modos:** conflito básico e regras avançadas devem ter seletores explícitos por crônica; não impor uma economia de ações derivada de outros RPGs.
5. **Testes automatizados:** cobrir 0 sucessos, empate com dificuldade, múltiplos 10, 10 em dado de Fome, falha com 1 em dado de Fome, Fome igual à parada e tentativas proibidas de rerrolar dado de Fome.

## 2. Jogadores — personagem e progressão

| ID | Mecânica | O que mapear | Fonte impressa | Estado |
|---|---|---|---|---|
| V5-PC-001 | Conceito e histórico | Nome, conceito, Ambição, Desejo, senhor, geração, idade, antecedentes narrativos | Básico, pp. 135–152; `VtM V5-Ficha PTBR-Editável.pdf`, pp. 1–2 | [B] |
| V5-PC-002 | Atributos | 9 atributos físicos/sociais/mentais; níveis e limites de criação | Básico, pp. 145–154; ficha PT-BR p. 1 | [B] |
| V5-PC-003 | Habilidades | Habilidades e especializações; combinação com atributos nos testes | Básico, pp. 145–154 e 159 em diante; ficha PT-BR p. 1 | [B] |
| V5-PC-004 | Clã e geração | Escolha, maldição/perdição, Compulsão e Disciplinas vinculadas; inclui opções adicionais quando suplemento habilitado | Básico, pp. 63–113 e 145–155; *Companion*, pp. 5–28 | [B]/[E] |
| V5-PC-005 | Tipo de Predador | Benefícios, desvantagens, especializações, caça; não reduzir a rótulo cosmético | Básico, pp. 175–178; arquivo *Player's Guide* fornecido, pp. 3 em diante [ver procedência] | [B]/[E] |
| V5-PC-006 | Vantagens e Defeitos | Pontos, pré-requisitos e efeitos sociais/ficcionais; rastrear elementos sujeitos à aprovação | Básico, pp. 179–194; expansões nos suplementos | [B]/[E] |
| V5-PC-007 | Loresheets | Níveis 1–5 adquiridos **individualmente**; restrições por linhagem, clã ou culto; aprovação do Narrador | Básico, pp. 382 em diante; `Loresheets - VTM Wiki.pdf`, pp. 1–2 | [B]/[E] |
| V5-PC-008 | Disciplinas | Níveis, poderes escolhidos, pré-requisitos, custos, testes, duração, alcance e efeitos individuais | Básico, pp. 243–287; *Companion*, pp. 24–28 | [B]/[E] |
| V5-PC-009 | Experiência | XP total/gasto, compras, elegibilidade, custos específicos do desenvolvimento; verificar tabelas oficiais antes de codificar | Básico, criação e desenvolvimento de personagem; ficha PT-BR p. 2 | [B]/[C] |
| V5-PC-010 | Saúde e cura | Dano superficial/agravado, condição prejudicado, reparo e torpor | Básico, pp. 126–130 e 218–220 | [B] |
| V5-PC-011 | Crônica e coterie | Princípios da Crônica, laços, mapa de relacionamentos, Pilares, tipos/atributos da coterie e domínio | Básico, pp. 141–145, 172–175, 195–199 | [B] |

**Ficha de referência em português:** `VtM V5-Ficha PTBR-Editável.pdf`, p. 1: nove atributos, habilidades, Disciplinas, Fome, Humanidade e rastreadores; p. 2: Princípios, Pilares/Convicções, Vantagens/Defeitos, Potência de Sangue, experiência e histórico. Campos da ficha não equivalem, isoladamente, a regras completas.

## 3. Narrador — procedimentos e decisões

| ID | Responsabilidade | Exigência de jogo e do aplicativo | Fonte impressa | Estado |
|---|---|---|---|---|
| V5-ST-001 | Definir crônica | Princípios, tom, personagens, seitas, território, coterie e relações | Básico, pp. 135–145, 172–175, 195–199 | [B] |
| V5-ST-002 | Determinar testes | Dificuldade, paradas, modificadores, resistências, oposição e testes prolongados quando cabíveis | Básico, pp. 115–124; 291–295 | [B] |
| V5-ST-003 | Interpretar efeitos | Falhas bestiais, críticos bagunçados, Compulsões e escolhas de consequência | Básico, pp. 205–211 | [B] |
| V5-ST-004 | Conflitos | Gerir participantes, objetivos, consequências, dano físico/social e opções avançadas quando selecionadas | Básico, pp. 123–130 e 295–305 | [B]/[O] |
| V5-ST-005 | Caça e domínio | Regras de caça, Chasse, circunstâncias, locais e segurança do domínio | Básico, pp. 195–199, 306–308, 327–329 | [B] |
| V5-ST-006 | Construção de cenas | NPCs, pistas, situações, atmosferas e apresentação das informações | `VtM V5 - storytellers-toolkit-.pdf`, pp. 3–4; *Quickstart*, p. 2 | [E] |
| V5-ST-007 | Narrativa publicada | Estrutura de capítulos, cenas, ganchos, consequências e NPCs como referência de preparação, **não** regras universais | *Fall of London*, sumário pp. 3–4; *Let the Streets Run Red*, sumário pp. 2–4 | [E] |
| V5-ST-008 | Conteúdo sensível | Alinhar limites e ferramentas de segurança entre participantes, respeitar decisões do grupo | Básico, aviso e apêndice de jogo cuidadoso; *Blood-Stained Love*, contracapa | [B]/[E] |

## 4. Expansões por obra

| Obra fornecida | Conteúdo efetivamente identificado | Tratamento |
|---|---|---|
| `VtM V5 - Companion.pdf` | Ravnos, Salubri, Tzimisce, novos poderes, mortais, carniçais, errata e atualizações de regras (sumário, p. 3) | [E] Opções de personagens e correções; conferir a seção de errata antes de consolidar comportamento |
| `VtM V5 - blood-sigils-5-pdf-free.pdf` | Feitiçaria de Sangue, Alquimia Sangue-Ralo, fórmulas, rituais e sistemas para criar fórmulas/rituais (contracapa, p. 2) | [E] Catálogo separado por tipo, nível, componentes, custo, teste e efeito |
| `VtM V5 - Cults of the Blood Gods (Backer_s Copy).pdf` | Cultos, religiões vampíricas, rituais, opções de coterie e material relacionado ao Oblívio (sumário) | [E] Habilitar por campanha/expansão |
| `VtM V5 - forbidden-religions.pdf` | Cultos, hierarquias, ganchos de história e poderes (sumário, pp. 3 em diante) | [E] Política, história e opções temáticas |
| `VtM V5 - gehenna war.pdf` | Personagens voltados à ação, novas opções de combate/equipamento, facções, vantagens, poderes e cenas de ação (contracapa, p. 2) | [E] Regras de ação documentadas separadamente do combate-base |
| `VtM V5 - In Memorian.pdf` | Ancillae, regras e variações de Memoriam, épocas e Loresheets (contracapa, p. 2) | [E] Camadas avançadas para histórico e cenas retrospectivas |
| `V5StLove.pdf` | Romance, segurança à mesa, vantagens, defeitos e novos poderes (contracapa, p. 2) | [E] Subsistema narrativo/relacional, opt-in |
| `VtM v5 - live from the succubus club.document.pdf` | Performances, empreendimentos, músicos, viagens e opções de personagem (contracapa, p. 2) | [E] Subsistemas sociais/econômicos opcionais |
| `VtM V5 - Tattered Façade .pdf` | Caça, Night Maps, arquétipos, poderes e ameaças à Máscara (amostra, p. 2) | [E] Amostra disponível, conteúdo integral não presumido |
| `VtM V5 - Vampire The Masquerade 5.0 - Anarch.pdf` | Movimento Anarquista e ambientação de seita | [E] Contexto político e opções presentes no suplemento |
| `VtM V5 - Vampire The Masquerade 5.0 - Camarilla.pdf` | Corte, cargos, tradições e política (sumário, pp. 2–3) | [E] Estruturas de poder e relações |
| `VtM V5 - vampire-the-masquerade-v5-sabbat-the-black-hand.pdf` | Sabbat como facção/ameaça e conteúdo temático | [E] Não presumir que material de antagonistas seja escolha padrão de jogador |
| `VtM V5 - Vampire the Masquerade 5.0 - Chicago by Night.pdf` | Cidade, domínios, cenário, NPCs e material Lasombra (sumário) | [E] Ambientação e personagens, não sistema universal |
| `VtM V5_the-chicago-folios.pdf` | Ganchos para Camarilla, Anarquistas, mortais e ameaças (sumário) | [E] Recursos para cenas/campanhas |
| `VtM V5 -let-the-streets-run-red-2020.pdf` | Histórias, capítulos, cenas, protagonistas e desfechos (sumário) | [E] Exemplos de estrutura de histórias |
| `VtM V5 - Vampire the Masquerade 5.0 - The fall of London.pdf` | Crônica ambientada em Londres, com objetivos por capítulo e cenas (sumário) | [E] Modelo de planejamento narrativo |
| `VtM V5 - boston-by-night.pdf` | Livro de cenário; PDF fornecido é majoritariamente imagético, sem texto extraído confiável | [C] Revisão visual por seção antes de catalogar regras |
| `VtM V5 - vampire-the-masquerade-v5-children-of-the-blood.pdf` | Suplemento de personagens e conteúdo adicional; extração de texto apresenta defeitos | [C] Conferência visual para indexar itens individualmente |
| `VtM V5 - second-inquisition.pdf` | **Arquivo recebido contém uma única página** com nomes de personagens/cargos, não o suplemento completo | [C] Não atribuir regras não disponíveis a este PDF |
| `VtM_v5-quickstart.pdf` | Introdução a jogo, papel do Narrador, dados d10, roteiro de aventura (p. 2) | [B] Referência didática, não substitui o livro básico |
| `VtM - vampire-players-guide.pdf` | O PDF fornecido se apresenta como trabalho de comunidade/Storytellers Vault (créditos, p. 2); tipos de predador e poderes adicionais | [E]/[C] **Não classificar automaticamente como o Players Guide oficial**: procedência e compatibilidade devem ser checadas antes de ativar regras |

## 5. Requisitos técnicos derivados do catálogo [P]

Estes itens **não são regras do V5**; são requisitos propostos para registrar e executar regras com fidelidade:

- **Definição de regra:** `id`, nome PT-BR/termo original, descrição curta, origem (arquivo, edição, página), tipo (base/expansão/opcional), pré-requisitos, parâmetros, efeitos, exceções e estado de verificação.
- **Estado da personagem:** atributos, habilidades, especializações, clã, geração, Potência de Sangue, Disciplinas/poderes, Fome, Humanidade, Máculas, Vitalidade, Força de Vontade, vantagens/defeitos, XP, convicções, pilares, predador e histórico.
- **Evento de jogo:** ator, autor, crônica, instante, tipo (rolagem, dano, mudança de Fome, uso de poder, decisão do Narrador), dados de entrada, resultado calculado, regra aplicada e visibilidade.
- **Permissões:** Narrador controla informações sigilosas, SPCs, dificuldade, resultados ocultos e arbitragem; jogador acessa somente estado autorizado de sua personagem/crônica.
- **Auditabilidade:** alterações de XP, Fome, poder, dano e Humanidade geram eventos revisáveis, sem transformar a decisão narrativa em cálculo obrigatório.
- **Compatibilidade:** opcionais e expansões precisam ser habilitados explicitamente; errata/atualização de regras devem registrar precedência por edição.
- **Validação:** a API é autoridade de regras e autorização, alinhada a `AGENTS.md`; frontend exibe resultados, mas não determina resultados confiáveis.

## 6. Lacunas de conferência (não automatizar ainda)

1. Tabelas completas de custos de XP, limites de personagem, aquisição de Disciplinas e exceções por geração.
2. Todos os poderes, rituais, cerimônias e fórmulas individualmente, incluindo pré-requisitos, custo e regras de oposição.
3. Atualizações/errata do *Companion* e eventual impacto em referências do livro básico.
4. Mecânicas de cada Loresheet de cada obra: **níveis comprados individualmente**, restrições específicas e efeitos próprios.
5. Procedência e possíveis regras alternativas do arquivo comunitário `VtM - vampire-players-guide.pdf`.
6. Suplementos incompletos/imagéticos: *Second Inquisition*, *Boston by Night*, *Children of the Blood* e amostra *Tattered Façade*.

### Critérios de aceite para ampliar o mapeamento

- Cada nova regra aponta para **arquivo realmente disponível e página efetivamente conferida**.
- Expansão não altera a base sem referência explícita e justificativa de precedência.
- Fórmulas e exceções só entram no motor de regras depois de cotejadas com o texto da fonte.
- Materiais de comunidade e material oficial são rotulados de modo distinto.
- Nenhuma afirmação de testes, build ou deploy validados sem execução real.

**Referências permitidas:** somente os PDFs fornecidos no contexto do projeto. Links externos e sistemas de outros RPGs foram intencionalmente excluídos.
