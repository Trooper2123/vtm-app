# Referências e mapeamento das regras V5

Este diretório reúne o levantamento das mecânicas de **Vampiro: A Máscara 5ª Edição**, para orientar implementação em `apps/api` e interfaces em `apps/web`.

## Documentação

- [Mapeamento das regras, mecânicas e fontes](./v5-mapeamento.md): catálogo por ID e público (jogador/Narrador), indicação de fonte/página, base vs. expansão vs. opcional, requisitos de software e lacunas de revisão.

## Política de fontes

1. Usar **somente** os arquivos PDF disponibilizados no projeto.
2. Priorizar o **livro básico V5** para mecânicas fundamentais.
3. Tratar suplementos como extensões, observando seus próprios pré-requisitos, exceções e erratas.
4. Identificar separadamente material comunitário, amostras e arquivos incompletos.
5. Usar páginas **impressas** dos livros e conferir diferença em relação à paginação do PDF.
6. Nunca confundir uma **proposta de implementação** com uma regra publicada.
7. Respeitar direitos autorais: documentação de referência e síntese, não cópia dos livros.

Este levantamento é documental. **Não cria endpoints, funcionalidades, persistência nem testes**, e não altera a especificação OpenAPI.

## Próxima etapa

Validar em detalhe cada regra antes da automação, começando pelos testes com d10/Fome, criação de personagem e rastreadores; seguir com disciplinas, conflitos, Humanidade e suplementos opcionais. Toda alteração de endpoint exigirá atualização de `docs/api/openapi.yaml`, dos fluxos em `docs/api/flows/` e testes relevantes conforme `AGENTS.md`.
