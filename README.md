<div align="center">
  <h1>⚔️ Game Clicker — RPG Incremental</h1>
  <p><strong>Derrote monstros, melhore seu arsenal e avance por fases em um clicker com combate e progressão idle.</strong></p>
  <p>
    <a href="https://helioconde.github.io/Game-clicker-in-Jquery/"><img alt="Jogar no navegador" src="https://img.shields.io/badge/JOGAR%20AGORA-GitHub%20Pages-2563eb?style=for-the-badge"></a>
    <img alt="Status" src="https://img.shields.io/badge/Status-prot%C3%B3tipo%20jog%C3%A1vel-64748b?style=for-the-badge">
  </p>
  <p><a href="https://helioconde.github.io/Game-clicker-in-Jquery/"><strong>Abrir o jogo</strong></a> · <a href="#jogar-localmente"><strong>Rodar localmente</strong></a> · <a href="#rodar-testes"><strong>Testes</strong></a></p>
</div>

---

## Sobre o jogo

O projeto começou como um **clicker em jQuery em 2022** e foi modernizado mantendo a identidade, as dez armas originais e as artes e sons. Hoje usa JavaScript modular para controlar combate, economia, evolução e salvamento.

**Como jogar:** clique ou toque para atacar, acumule moedas ao derrotar inimigos, compre armas e melhorias e enfrente um chefe a cada dez fases. Seu dano por segundo (**DPS**) também age automaticamente.

| Sistema | Como funciona |
| --- | --- |
| **Combate** | Dano por clique, DPS, críticos e habilidades com recarga |
| **Progressão** | Fases e chefes; recompensas ao derrotar inimigos |
| **Arsenal** | Dez armas com evolução de custo e dano |
| **Melhorias** | Força, Autômato, Precisão e Fortuna |
| **Idle** | Recompensa parcial pelo tempo fora do jogo, com limite definido |
| **Persistência** | Save no navegador e migração de dados de versões anteriores |
| **Interface** | Desktop em uma única viewport; mobile com abas Combate, Herói e Loja |

**Status:** protótipo web publicado, com testes automáticos documentados. A experiência em dispositivos físicos diferentes ainda merece revisão manual.

> **Regra de interface:** a arena principal deve caber em uma tela sem rolagem global. Arsenal e melhorias podem ter rolagem interna. Esse comportamento foi uma prioridade da modernização.

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

## Publicação e evidências de QA

- [Abrir Game Clicker](https://helioconde.github.io/Game-clicker-in-Jquery/)
- [Deploy oficial no GitHub Actions](https://github.com/HelioConde/Game-clicker-in-Jquery/actions/runs/40174968289)
- [QA da versão integrada na main](https://github.com/HelioConde/Game-clicker-in-Jquery/actions/runs/40174968297)

**Validação:** 18 testes unitários e 10 cenários automatizados de Chromium para desktop/mobile, sem testes manuais em aparelhos físicos. A publicação é estática, sem login ou servidor de jogo.
