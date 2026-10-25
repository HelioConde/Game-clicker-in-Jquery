# Game Clicker — RPG incremental

[**Jogar agora no navegador**](https://helioconde.github.io/Game-clicker-in-Jquery/) · [**Ver código**](https://github.com/HelioConde/Game-clicker-in-Jquery)

Jogo web de clique e combate originalmente feito em jQuery em 2022. Esta branch recupera a ideia original e adiciona uma base independente do jQuery, preservando as 10 armas e os arquivos de arte e áudio.

> **Status:** Etapas 1–4 integradas na branch `main` e publicadas no GitHub Pages. Testes automatizados aprovados; inspeção visual humana em dispositivos físicos ainda é recomendada.

## Funcionalidades

- Ataque por clique/toque ou teclado (botão nativo aceita Enter e Espaço).
- Inimigos com pontos de vida (HP) e barra visual.
- Progressão de fases; chefe a cada 10 fases, com mais vida e recompensa.
- Dinheiro recebido **ao derrotar inimigos** (não por clique).
- 10 armas originais com níveis, preços progressivos e bônus de dano por clique ou DPS.
- DPS causa dano real aos monstros, podendo derrotá-los e avançar de fase.
- Efeitos sonoros opcionais, layout responsivo e salvamento local.
- Migração automática de `gameClickerV2` e das chaves do projeto de 2022 para `gameClickerV3`.
- Golpes críticos: 5% de chance base, até 45% com Precisão, dano crítico 2×.
- Golpe poderoso (5× por clique, recarga 15s) e Fúria (2× dano por 10s, recarga 60s).
- Melhorias permanentes: Força (+20% clique/nível), Autômato (+20% DPS/nível), Precisão (+2 pontos percentuais de crítico/nível) e Fortuna (+15% ouro/vitória/nível).
- Bônus offline: 20% do DPS por segundo, a partir de 60s ausente e limite de 8 horas; não avança fases offline.
- Sem conta, banco de dados ou servidor necessários.

## Etapa 6 — Diversidade de inimigos e cenários

- Inimigos alternados por fase: **Criatura Sombria** (sprite legado), **Slime do Bosque**, **Morcego do Crepúsculo** e **Golem de Pedra**.
- Chefes com aparência exclusiva: **Guardião do Bosque** (fase 10) e **Colosso do Eclipse** (fase 20); variantes repetem em ciclos regionais.
- Cenários com gradações de cor por região: bosque, eclipse, montanha e crepúsculo.
- Efeitos de impacto, dano crítico, avisos de mudança de fase e brilho especial de chefes.
- Os cinco novos sprites são SVGs pixelados disponíveis em `img/inimigos/`, sem scripts nem recursos externos; os sprites legados são preservados.
- A aparência é **determinística a partir da fase**. Salvamentos V3 continuam válidos e HP, drops, níveis, preços e DPS não foram alterados.
- Layout continua limitado a **uma tela** com rolagem exclusivamente dentro dos painéis; o workflow do GitHub Pages copia também os novos SVGs.

## Jogar localmente

Abra `index.html` em um navegador moderno. Se preferir, sirva a pasta com um servidor HTTP simples:

```bash
python -m http.server 8000
```

Depois, abra `http://localhost:8000`.

Os saves ficam no `localStorage` do navegador e da origem usada. Um domínio/origem diferente usa outro armazenamento; esta versão não faz sincronização em nuvem. O bônus offline usa o último registro de atividade e o relógio do dispositivo, com resgate único por retorno.

## Organização

- `js/game-core.js`: regras de armas, inimigos, críticos, habilidades, melhorias, bônus offline e migração do save (sem DOM).
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
- [x] **Etapa 3:** Idle RPG, críticos, habilidades, melhorias e recompensas offline (código e testes implementados).
- [x] **Etapa 4:** GitHub Pages publicado após merge; 10 testes Playwright aprovados (Chromium desktop + dispositivo móvel emulado), screenshots e traces disponíveis nos artifacts. Revisão manual em dispositivo físico recomendada.

## Notas de compatibilidade

O save novo fica na chave `gameClickerV3`. A aplicação também mantém a chave V2 e as chaves legadas atualizadas para facilitar rollback. A migração reutiliza moedas, quantidade de armas e preferência de som; novos personagens começam na fase 1. A Etapa 3 reutiliza a chave V3 e preenche upgrades e habilidades ausentes com valores seguros. O cálculo offline depende do relógio local e não pretende ser um sistema antitrapaça. Não limpe os dados do site se quiser preservar sua partida.

## Interface em tela única

O jogo usa toda a área útil da janela (100dvh), **sem rolagem da página**. No desktop, o combate, HP e habilidades permanecem sempre acessíveis. O arsenal e a lista de melhorias podem rolar independentemente. No celular, as abas Combate, Herói e Loja compartilham a mesma viewport.

A área `Como jogar` começa recolhida e pode ser aberta por toque ou teclado. Ícones de moedas são desenhados em CSS, sem depender de fontes emoji instaladas no sistema. Os sprites se adaptam à arena sem alterar o tamanho do documento.

**Regra de projeto:** melhorias futuras não devem exigir rolagem geral para acessar arena ou habilidades. Os testes Playwright cobrem 7 resoluções e verificam ajuda, moedas, sprites e rolagem interna.

## Histórico e autoria

O **Game Clicker original**, criado em fevereiro de 2022, era um exercício de desenvolvimento de jogos web com **HTML, CSS, JavaScript ES5 e jQuery 3.3.1**, inspirado em Cookie Clicker. Ele já possuía dez armas, personagens e monstros animados, sons e persistência por `localStorage`. O código histórico permanece preservado nos commits originais do Git, anteriores à modernização.

Esta evolução substitui a lógica jQuery por JavaScript modular, mas mantém os sprites e o conceito central. Não é uma versão comercial validada. Limpar os dados do site ou mudar a origem do navegador pode apagar a partida.

Desenvolvido por [Hélio Conde](https://github.com/HelioConde).

## Jogar publicado e acompanhar QA

- [Abrir Game Clicker](https://helioconde.github.io/Game-clicker-in-Jquery/)
- [Deploy oficial no GitHub Actions](https://github.com/HelioConde/Game-clicker-in-Jquery/actions/runs/40174968289)
- [QA da versão integrada na main](https://github.com/HelioConde/Game-clicker-in-Jquery/actions/runs/40174968297)

**Validação:** 18 testes unitários e 10 cenários automatizados de Chromium para desktop/mobile, sem testes manuais em aparelhos físicos. A publicação é estática, sem login ou servidor de jogo.
