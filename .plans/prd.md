# PRD: Painel de despesas

## 1. Visão geral

### 1.1 Objetivo

Criar um painel simples para registrar e acompanhar despesas durante a sessão atual do usuário. A aplicação deve permitir adicionar despesas, visualizar a lista completa e consultar o total geral e os totais agrupados por categoria.

### 1.2 Público e contexto de uso

A aplicação é destinada a pessoas que precisam acompanhar rapidamente despesas do dia a dia sem criar uma conta ou configurar um banco de dados. O fluxo principal deve ser direto: preencher o formulário, adicionar a despesa e conferir os totais atualizados.

### 1.3 Escopo

Incluído:

- Cadastro de novas despesas.
- Exibição de todas as despesas cadastradas na sessão.
- Cálculo do total geral.
- Cálculo do total por categoria.
- Interface responsiva para desktop e telas menores.
- Estado mantido somente em memória.

Fora do escopo:

- Persistência em `localStorage`, banco de dados ou API.
- Autenticação e contas de usuário.
- Edição ou exclusão de despesas, salvo decisão posterior de produto.
- Filtros, busca, exportação e gráficos.
- Categorias criadas pelo usuário.

## 2. Requisitos funcionais

### RF-01: Adicionar despesa

A aplicação deve oferecer um card ou seção de formulário para cadastrar uma despesa com:

- Título da despesa.
- Valor.
- Categoria.
- Ação de confirmação para adicionar o registro.

Ao confirmar um cadastro válido, a nova despesa deve aparecer na lista e os totais devem ser recalculados imediatamente.

### RF-02: Validar formulário

O sistema deve impedir o cadastro quando:

- O título estiver vazio ou contiver apenas espaços.
- O valor estiver vazio, não for numérico ou for menor ou igual a zero.
- Nenhuma categoria válida estiver selecionada.

As mensagens de validação devem ser claras e aparecer próximas ao campo correspondente ou em uma área de feedback do formulário. A validação deve ocorrer no TypeScript, sem depender apenas dos atributos HTML.

### RF-03: Listar despesas

A área principal deve exibir todas as despesas cadastradas, preferencialmente da mais recente para a mais antiga. Cada item deve apresentar, no mínimo:

- Título.
- Valor formatado como moeda brasileira (`BRL`).
- Categoria.

Quando não houver despesas, a lista deve exibir um estado vazio explicando que ainda não existem registros.

### RF-04: Exibir resumo geral

A sidebar deve exibir a soma de todas as despesas. O valor deve iniciar em zero e ser atualizado após cada novo cadastro.

### RF-05: Exibir resumo por categoria

A sidebar deve exibir o total acumulado para cada categoria fixa, inclusive categorias sem despesas. As categorias devem aparecer sempre na mesma ordem:

1. Alimento
2. Transporte
3. Lazer
4. Saúde
5. Outros

### RF-06: Manter estado durante a sessão

As despesas devem permanecer disponíveis enquanto a página estiver aberta e a aplicação estiver em execução. Ao recarregar a página, os dados podem ser perdidos, pois não haverá persistência.

### RF-07: Limpar formulário após cadastro

Depois de adicionar uma despesa com sucesso, o formulário deve ser limpo e o foco deve retornar ao primeiro campo relevante para facilitar novos lançamentos.

## 3. Modelo de dados

Todos os tipos TypeScript devem estar centralizados em `src/types.ts`.

### Categoria

A categoria deve ser restrita aos valores:

- `alimento`
- `transporte`
- `lazer`
- `saúde`
- `outros`

### Despesa

```ts
type Despesa = {
  id: string;
  titulo: string;
  valor: number;
  categoria: Categoria;
};
```

O `id` deve ser único por despesa e pode ser gerado no cliente. O valor deve ser armazenado como número, sem símbolo de moeda ou formatação visual.

## 4. Requisitos técnicos

### RT-01: Stack

- Vite.
- TypeScript com JavaScript vanilla, sem framework de UI.
- HTML semântico.
- CSS separado para estilos e responsividade.
- Dependências limitadas ao que já existe no projeto, salvo necessidade justificada.

### RT-02: Organização sugerida

- `src/types.ts`: `Categoria`, `Despesa` e demais tipos compartilhados.
- `src/main.ts`: inicialização da aplicação, estado em memória, eventos, cálculos e atualização dos elementos existentes no DOM.
- `src/style.css`: layout, componentes visuais, estados e media queries.
- `index.html`: estrutura completa e semântica da tela, incluindo formulário, sidebar, resumos, lista e estado vazio, sem eventos inline.

A estrutura pode ser dividida em módulos menores caso o arquivo principal cresça, mas a solução deve continuar simples e fácil de manter. O HTML deve conter a estrutura visual diretamente; o TypeScript não deve montar a aplicação inteira dentro do `#app` usando grandes strings de HTML.

Todas as definições de tipos no TypeScript devem usar a palavra-chave `type`. Não utilizar `interface` no projeto.

### RT-03: Eventos

Todos os eventos devem ser registrados no TypeScript, incluindo o envio do formulário e qualquer interação futura. Não devem existir atributos como `onclick` ou `onsubmit` no HTML.

### RT-04: Responsabilidades do HTML e do TypeScript

- O `index.html` deve declarar diretamente a estrutura completa da aplicação dentro do `#app`, incluindo o formulário de cadastro, a sidebar, o total geral, os totais por categoria, a lista de despesas e o estado vazio.
- O TypeScript deve ser responsável somente pela manipulação dos dados e pela interação com o DOM já existente: ler o formulário, validar entradas, atualizar o estado em memória, calcular totais, registrar eventos e atualizar textos, atributos, classes e conteúdo da lista.
- O TypeScript pode criar, inserir ou remover elementos individuais da lista de despesas quando necessário, mas não deve montar o HTML inteiro da aplicação nem substituir todo o conteúdo do `#app` por uma string.
- Os elementos que recebem dados dinâmicos devem possuir identificadores ou atributos semânticos estáveis, como `id` ou `data-*`, para serem encontrados e atualizados pelo TypeScript.
- A interface deve ser atualizada a partir do estado atual das despesas. O cálculo de totais deve usar os dados em memória, evitando valores duplicados ou atualizações manuais inconsistentes.

### RT-05: Formatação

Os valores monetários devem ser exibidos usando `Intl.NumberFormat` com localidade `pt-BR` e moeda `BRL`. A formatação não deve alterar o valor numérico armazenado.

### RT-06: Qualidade e acessibilidade

- Usar labels associados aos campos.
- Usar elementos semânticos como `main`, `aside`, `form`, `section` e listas quando apropriado.
- Manter a estrutura HTML inicial completa e visível no arquivo `index.html`, evitando depender de uma tela gerada integralmente pelo TypeScript.
- Garantir foco visível para navegação por teclado.
- Permitir envio do formulário com a tecla Enter.
- Usar mensagens e rótulos compreensíveis para leitores de tela.
- Não depender somente de cor para comunicar erro ou categoria.
- Executar `npm run build` sem erros de TypeScript ou Vite.

## 5. Requisitos visuais

### RV-01: Estrutura da tela

A página deve ter duas áreas principais:

- Sidebar lateral esquerda com o resumo financeiro.
- Área de conteúdo principal com o formulário de nova despesa e a lista de despesas abaixo dele.

Em telas estreitas, a sidebar deve ser reorganizada acima do conteúdo principal ou em outra disposição vertical confortável.

### RV-02: Formulário

O formulário deve ser apresentado em um card visualmente destacado, com título, campos bem espaçados e botão de ação claramente identificável. Os campos devem ter largura adequada e indicar quando estão em erro ou foco.

### RV-03: Lista

A lista deve facilitar a leitura rápida. Cada despesa deve ter hierarquia visual entre título, categoria e valor. O valor deve ficar em posição de destaque e permanecer legível em telas pequenas.

### RV-04: Sidebar

A sidebar deve destacar o total geral e apresentar os totais por categoria em uma estrutura fácil de escanear. Cada categoria deve ter rótulo textual e valor monetário; cores podem complementar a distinção, mas não devem ser a única identificação.

### RV-05: Estados visuais

A interface deve contemplar:

- Estado inicial sem despesas.
- Formulário em foco.
- Campo inválido.
- Cadastro concluído com lista atualizada.
- Layout responsivo.

### RV-06: Consistência

Manter uma escala consistente de espaçamento, tipografia, bordas e cores. Evitar excesso de elementos decorativos que prejudiquem a leitura dos dados.

## 6. Fluxos principais

### Fluxo de cadastro

1. Usuário acessa a aplicação.
2. Visualiza o total zerado, os totais por categoria zerados e o estado vazio da lista.
3. Preenche título, valor e categoria.
4. Envia o formulário.
5. Sistema valida os dados.
6. Se válidos, gera o `id`, adiciona a despesa ao estado e atualiza lista e resumos.
7. Sistema limpa o formulário e devolve o foco ao campo de título.

### Fluxo de erro

1. Usuário envia o formulário com um ou mais campos inválidos.
2. Sistema impede o cadastro.
3. Sistema informa o problema de forma associada ao campo ou ao formulário.
4. Nenhum total ou item da lista é alterado.

## 7. Critérios de aceite

- [ ] A aplicação inicia com `npm run dev`.
- [ ] `npm run build` conclui sem erros.
- [ ] O formulário permite informar título, valor e categoria.
- [ ] Uma despesa válida aparece na lista após o envio.
- [ ] O valor da despesa é exibido em reais no formato brasileiro.
- [ ] O total geral corresponde à soma de todas as despesas.
- [ ] O total de cada categoria é calculado corretamente, incluindo categorias zeradas.
- [ ] Dados inválidos não são adicionados e geram feedback visível.
- [ ] O estado vazio é exibido quando não há despesas.
- [ ] O layout funciona em desktop e em telas estreitas.
- [ ] Não existem eventos inline no HTML.
- [ ] A estrutura completa da tela está declarada diretamente no `index.html`.
- [ ] O TypeScript não substitui todo o conteúdo do `#app` nem monta a aplicação inteira por strings de HTML.
- [ ] O TypeScript manipula o estado e atualiza os elementos dinâmicos existentes no DOM.
- [ ] Os tipos compartilhados estão em `src/types.ts`.
- [ ] Recarregar a página pode limpar os dados, conforme o escopo sem persistência.

## 8. Não objetivos e decisões em aberto

### Não objetivos

O MVP não pretende substituir um sistema financeiro completo. Não haverá histórico permanente, sincronização, relatórios ou gerenciamento avançado de registros.

### Decisões em aberto

- Definir se a moeda deve aceitar casas decimais obrigatórias ou opcionais no campo de valor.
- Definir se despesas cadastradas precisarão de ações de edição e exclusão em uma versão posterior.
- Definir a identidade visual final: paleta, tipografia e ícones, preservando os requisitos de legibilidade e contraste.
