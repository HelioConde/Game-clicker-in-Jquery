<div align="center">
  <h1>⚔️ Game Clicker — RPG Incremental</h1>
  <p><strong>Derrote monstros, conquiste moedas, melhore o arsenal e avance por fases em um clicker com progressão idle.</strong></p>
  <p><img alt="Jogo web" src="https://img.shields.io/badge/jogo-web-2563eb"> <img alt="Status" src="https://img.shields.io/badge/status-prot%C3%B3tipo%20jog%C3%A1vel-64748b"></p>
  <p><a href="https://helioconde.github.io/Game-clicker-in-Jquery/"><strong>Jogar agora</strong></a> · <a href="#executar-localmente"><strong>Como executar</strong></a> · <a href="#qualidade-e-limites"><strong>Qualidade</strong></a></p>
</div>

---

## Um clicker com combate e evolução

O projeto começou em **2022 como experimento HTML, CSS, JavaScript e jQuery**. A versão atual mantém o conceito e as dez armas originais, mas substitui a lógica principal por JavaScript modular com testes.

**Loop do jogo:** atacar → derrotar criaturas → receber moedas → comprar armas/melhorias → aumentar dano → enfrentar chefes.

| Recurso | Como funciona |
| --- | --- |
| **Combate** | Ataque por clique, toque ou botão acessível por teclado |
| **Progressão** | Fases com inimigos e chefe a cada dez fases |
| **Arsenal** | Dez armas com melhorias e preços progressivos |
| **DPS** | Dano automático aplicado aos monstros |
| **Críticos** | Chance de crítico e dano ampliado |
| **Habilidades** | Golpe poderoso, Fúria e Esquiva em situações específicas |
| **Melhorias** | Força, Autômato, Precisão e Fortuna |
| **Idle** | Recompensa parcial pelo tempo ausente, sujeita a limite |
| **Save** | Persistência local com migração de dados antigos |

### Progressão e habilidades

O jogo possui críticos com **5% de chance base**, ampliáveis por Precisão; **Golpe Poderoso** (5× dano de clique, recarga de 15 s) e **Fúria** (2× dano por 10 s, recarga de 60 s).

O bônus offline considera **20% do DPS por segundo**, após 60 s de ausência e limitado a oito horas; não avança fases enquanto o jogador está fora.

Chefes podem anunciar ataques para permitir **Esquiva (E)**. Animações e avisos respeitam `prefers-reduced-motion` quando disponível.

## Regra de interface: tudo em uma tela

**A arena deve caber na viewport sem rolagem global.** Essa é uma característica central do projeto:

- **Desktop:** combate, HP e habilidades permanecem acessíveis; arsenal e melhorias usam rolagem interna.
- **Mobile:** abas Combate, Herói e Loja compartilham a área disponível.
- **Layout:** usa a altura útil da janela (`100dvh`) e adapta os sprites à arena.
- **Acessibilidade:** botões por teclado e suporte a redução de movimento.

Mudanças futuras não devem transformar a página em duas telas de rolagem.

## Executar localmente

O jogo é estático e **não exige conta, banco de dados ou servidor de multiplayer**.

```bash
git clone https://github.com/HelioConde/Game-clicker-in-Jquery.git
cd Game-clicker-in-Jquery
python -m http.server 8000
```

Abra `http://localhost:8000` e comece a atacar.

### Testes de lógica

Com Node.js 18+ (o workflow de referência utiliza Node.js 22):

```bash
node --check js/game-core.js
node --check js/script.js
node --test tests/game-core.test.cjs
```

O histórico do projeto registra verificações automatizadas de viewport, combate, economia, progressão e estados de save. **Esta revisão da documentação não executou os testes.**

## Arquitetura

```text
index.html              Tela do jogo
css/style.css           Layout e responsividade
js/game-core.js         Regras de combate, economia e salvamento
js/script.js            Interações, renderização e temporização
img/                    Personagens, inimigos e cenários
tests/                  Testes automatizados
.github/workflows/      Verificações e publicação
```

## Dados, compatibilidade e segurança

O jogo usa `localStorage` e migra saves antigos para `gameClickerV3`. O progresso depende do navegador e da origem: **apagar dados do site ou trocar de endereço pode causar perda do save**.

O sistema idle utiliza o relógio local e não é um mecanismo antitrapaça. A edição disponível é um **protótipo web**, não um jogo comercial com economia online.

## Qualidade e limites

- O código inclui QA automatizado para lógica e interfaces desktop/mobile.
- Os sprites originais e efeitos históricos foram preservados.
- As melhorias de fases e equilíbrio foram documentadas ao longo da modernização.
- Testes em aparelhos físicos e regressão após mudanças grandes continuam recomendados.

**Documentação preservada:** [histórico completo das etapas, balanceamento e QA](docs/README_HISTORY_2026-10-27.md).  
**Revisar execuções:** [GitHub Actions](https://github.com/HelioConde/Game-clicker-in-Jquery/actions).

---

<div align="center"><strong>Desenvolvido por <a href="https://github.com/HelioConde">Hélio Conde</a></strong></div>
