# Melhorias do projeto

Este roteiro organiza melhorias incrementais para o painel de despesas. As etapas
1 a 4 preservam o escopo do [PRD](./.plans/prd.md): TypeScript vanilla, dados
somente em memória e sem edição ou exclusão de despesas.

## Etapa 1 — Segurança e robustez do DOM

**Objetivo:** evitar interpretação de conteúdo fornecido pelo usuário como HTML e
falhas silenciosas quando elementos esperados não existirem.

- [x] T001 [Plan:1.1] Substituir a interpolação do título em `innerHTML` por criação de elementos e `textContent` em `src/main.ts`, mantendo os campos e valores da despesa visíveis.
- [x] T002 [Plan:1.2] Substituir as asserções não nulas dos elementos do DOM em `src/main.ts` por verificações explícitas que informem quais elementos obrigatórios estão ausentes.
- [x] T003 [Plan:1.3] Validar a categoria recebida do formulário sem conversão cega de `string` para `Categoria` em `src/main.ts` e `src/types.ts`.

**Pronto quando:** títulos com caracteres como `<` e `>` aparecem como texto;
formulários válidos continuam atualizando lista e resumos; categorias inválidas
não são cadastradas; e uma estrutura HTML incompleta gera erro explícito.

## Etapa 2 — Testes e verificações de tipos

**Objetivo:** tornar os comportamentos importantes verificáveis e detectar erros
de tipagem durante o build.

- [x] T004 [Plan:2.1] Configurar um runner de testes compatível com Vite em `package.json` e criar a estrutura de testes em `src/`.
- [x] T005 [Plan:2.2] Cobrir validação do formulário, estado vazio, cadastro válido e atualização dos totais geral e por categoria com testes focados nos módulos de `src/`.
- [x] T006 [Plan:2.3] Habilitar `strict` em `tsconfig.json` e corrigir os erros identificados sem enfraquecer as verificações de tipo.
- [x] T007 [Plan:2.4] Atualizar os scripts em `package.json` para executar build e testes, mantendo `npm run build` como verificação obrigatória.

**Pronto quando:** os testes e o build passam; os casos inválidos não alteram a
lista nem os totais; e a configuração TypeScript estrita permanece habilitada.

## Etapa 3 — Precisão monetária

**Objetivo:** evitar imprecisão de ponto flutuante ao somar valores em reais.

- [ ] T008 [Plan:3.1] Criar funções de conversão e soma em centavos em `src/money.ts`, mantendo os valores armazenados em `Despesa.valor` compatíveis com o modelo atual.
- [ ] T009 [Plan:3.2] Usar as funções monetárias para calcular o total geral e os totais por categoria em `src/main.ts`.
- [ ] T010 [Plan:3.3] Testar casos com valores decimais, como `0,10 + 0,20`, valores de uma casa decimal e totais por categoria em `src/`.

**Pronto quando:** os cálculos retornam valores corretos até os centavos e a
exibição continua usando `Intl.NumberFormat` em `pt-BR` com moeda `BRL`.

## Etapa 4 — Limpeza e revisão final

**Objetivo:** remover resíduo do template e validar o fluxo completo da aplicação.

- [ ] T011 [Plan:4.1] Remover `src/counter.ts` caso a busca de referências confirme que o módulo não é utilizado.
- [ ] T012 [Plan:4.2] Executar testes, `npm run build` e uma verificação manual do cadastro em desktop e tela estreita; corrigir apenas regressões relacionadas às etapas anteriores.

**Pronto quando:** não há código inicial sem uso, os comandos de validação passam
e o cadastro permanece acessível por teclado e utilizável em telas menores.

## Backlog — depende de decisão de produto

O PRD deixa edição e exclusão em aberto e exclui essas funcionalidades do escopo
atual. Antes de executar os itens abaixo, atualizar `.plans/prd.md` com as regras
de comportamento e critérios de aceite.

- [ ] T013 [Plan:5.1] Definir no PRD se despesas poderão ser editadas ou excluídas e como confirmar essas ações.
- [ ] T014 [Plan:5.2] Se aprovado, implementar as ações de edição e exclusão em `index.html`, `src/main.ts` e `src/style.css`, atualizando lista e resumos a partir do estado em memória.
- [ ] T015 [Plan:5.3] Se aprovado, adicionar testes para edição, exclusão e atualização dos resumos nos arquivos de teste em `src/`.

## Fora do roteiro atual

- Persistência em `localStorage`, banco de dados ou API: contradiz o escopo atual
  do PRD, que especifica estado somente em memória.
- Busca, filtros, ordenação, exportação e gráficos: não fazem parte do MVP; avaliar
  separadamente caso surja essa necessidade.
