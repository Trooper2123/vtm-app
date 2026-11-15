# Direcionamento de UI — Arquivo Gótico Contemporâneo

> **Vigência nesta branch:** proposta de identidade visual e tokens implementados em `apps/web/app/globals.css`. **Não implica** que telas de login, primeiro acesso, perfil ou funcionalidades herdadas já existam. Ver também [UI-GUIDE.md](./UI-GUIDE.md) e [design-system.md](./design-system.md); em conflito sobre o estado real do frontend novo, prevalece o código.

## Conceito

Mesclar **70% de interface digital sóbria** (carvão, campos lisos, contraste, hierarquia) e **30% de dossiê físico** (papel envelhecido, etiqueta, linhas editoriais, tipografia técnica). Não é uma proporção computada pelo CSS, e sim orientação editorial.

- **Prioridade absoluta:** tarefa, leitura, acessibilidade e dados reais.
- Papel envelhecido é um **componente pontual** (`.archive-document` e `.archive-tag`), não fundo de formulários, erros ou tabelas densas.
- Manchas, sangue, carimbos, recortes e fotografias são **referências visuais**, não foram adicionados como assets. Qualquer inclusão futura deve ser discreta, licenciada, não interativa e subordinada ao contraste.
- **Nunca** inventar selos de aprovação, níveis de acesso, números de processo, datas ou identidade de usuário.
- Vermelho é reservado para ação principal, perigo e alertas; **não** é sinal de sucesso.
- Títulos em Georgia; interface em Arial; mono local apenas para metadados. Não carregar fontes externas nesta etapa.

## Tokens do CSS global

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#0d0d0f` | Fundo carvão |
| `--card` | `#181719` | Painéis digitais |
| `--foreground` | `#eee9e2` | Texto principal |
| `--muted` / `--muted-foreground` | `#b5aaa3` | Texto secundário |
| `--border` | `#50494b` | Divisórias |
| `--primary` / `--primary-hover` | `#a32930` / `#c03940` | Ação principal |
| `--primary-foreground` | `#fff8f1` | Texto sobre vermelho |
| `--focus` / `--ring` | `#e6c5a3` | Foco visível |
| `--surface-input` | `#211e20` | Campos |
| `--intro` | `#282123` | Capa editorial |
| `--error` | `#e6a19e` | Erros |
| `--archive-paper` | `#e7d9c4` | Papel pontual |
| `--archive-ink` | `#302a29` | Texto no papel |
| `--archive-line` | `#817469` | Bordas no papel |
| `--archive-label` | `#c7b7a2` | Etiquetas técnicas |

Todos os valores novos ficam em `:root`; nunca espalhar hexadecimais em seletores de páginas.

## Componentes disponíveis

- `.page-shell`, `.panel`, `.panel--entry`: largura, painel e entrada de duas partes (uma coluna até 760px).
- `.archive-cover`, `.archive-rule`, `.archive-record`, `.archive-meta`: capa, divisórias e registros.
- `.archive-document`, `.archive-tag`, `.archive-stamp`: decoração **restrita a dados verdadeiros**, com contraste escuro sobre papel.
- `.eyebrow`, `.section-label`: metadados legíveis.
- `.form-field`, `.input`, `.select`, `.textarea`: formulários.
- `.button-primary`, `.button-ghost`: ações principais/secundárias.
- `.form-error`, `.message-error`, `.message-info`: feedback.

Não criar telas ou atalhos para módulos ainda inexistentes. Os exemplos de interface são **direcionamento futuro**, não componentes prontos.

## Aplicação prevista por tela

1. **Acesso:** capa escura à esquerda e ações claras à direita. Ações reais apenas, sem links simulados.
2. **Primeiro acesso:** mesma capa compacta; formulário sobre fundo liso, labels explícitos, erro junto ao campo quando disponível.
3. **Área inicial:** título editorial e linhas de registro com dados do servidor. Não inventar nome, email, data de criação ou ações de personagens.

## Acessibilidade e revisão

- Alvos interativos com pelo menos 44×44px; foco global visível em `:focus-visible`.
- Não depender apenas de cor para estado, erro ou seleção; associar texto e atributos semânticos.
- Respeitar `prefers-reduced-motion`; nenhuma textura cobre conteúdo ou recebe cliques.
- Verificar manualmente contraste WCAG AA, navegação por teclado, zoom de 200%, 390px, 768px e 1440px. **Esses testes ainda não foram executados**.
- Para uma futura tela, verificar carregamento, sucesso, erro e estado vazio, sem divulgar dados reservados do Narrador.
- A interface não é fonte de autorização: a API deve validar acesso a dados e ações.

## Limites da entrega

Foi criado o CSS global e seu import no layout raiz. A página inicial existente permanece simples. Não foram criados login, registro, perfil, rotas, imagens, fontes externas, dados, APIs ou lógica de negócio. A estética não substitui testes de contraste e revisão visual em navegador.
