# Game Clicker — RPG incremental

Jogo web de clique e combate originalmente feito em jQuery em 2022. Esta branch recupera a ideia original e adiciona uma base independente do jQuery, preservando as 10 armas e os arquivos de arte e áudio.

> **Status:** Etapa 2 implementada na branch `feat/etapa-1-recuperacao`. A branch `main` mantém o projeto original. O jogo ainda precisa de QA manual no navegador antes de fazer merge.

## Funcionalidades

- Ataque por clique/toque ou teclado (botão nativo aceita Enter e Espaço).
- Inimigos com pontos de vida (HP) e barra visual.
- Progressão de fases; chefe a cada 10 fases, com mais vida e recompensa.
- Dinheiro recebido **ao derrotar inimigos** (não por clique).
- 10 armas originais com níveis, preços progressivos e bônus de dano por clique ou DPS.
- DPS causa dano real aos monstros, podendo derrotá-los e avançar de fase.
- Efeitos sonoros opcionais, layout responsivo e salvamento local.
- Migração automática de `gameClickerV2` e das chaves do projeto de 2022 para `gameClickerV3`.
- Sem conta, banco de dados ou servidor necessários.

## Jogar localmente

Abra `index.html` em um navegador moderno. Se preferir, sirva a pasta com um servidor HTTP simples:

```bash
python -m http.server 8000
```

Depois, abra `http://localhost:8000`.

Os saves ficam no `localStorage` do navegador e da origem usada. Um domínio/origem diferente usa outro armazenamento; esta versão não faz sincronização em nuvem nem oferece recompensa offline.

## Organização

- `js/game-core.js`: regras de armas, preço, inimigos, dano, derrotas, chefes e migração de save (sem DOM).
- `js/script.js`: interface, ações, sons, temporização e persistência.
- `index.html` e `css/style.css`: tela principal e versão mobile.
- `tests/game-core.test.cjs`: testes de progressão, combate, compras e saves.
- `.github/workflows/qa.yml`: verificação automática de sintaxe e testes a cada push/PR.

## Rodar testes

Necessário Node.js 18+ (o workflow usa Node.js 22):

```bash
node --check js/game-core.js
node --check js/script.js
node --test tests/game-core.test.cjs
```

## Etapas

- [x] **Etapa 1:** recuperação de economia, loja, salvamento, navegação e mobile (código implementado).
- [x] **Etapa 2:** combate com HP, fases, chefes, recompensas e DPS (código implementado; QA de navegador pendente).
- [ ] **Etapa 3:** progressão Idle RPG, habilidades, balanceamento e recompensas offline.
- [ ] **Etapa 4:** publicação e QA visual de desktop/mobile no GitHub Pages.

## Notas de compatibilidade

O save novo fica na chave `gameClickerV3`. A aplicação também mantém a chave V2 e as chaves legadas atualizadas para facilitar rollback. A migração reutiliza moedas, quantidade de armas e preferência de som; novos personagens começam na fase 1. Não limpe os dados do site se quiser preservar sua partida.
