# Game Clicker — Design System (2026-10-27)

## Identidade e Image to Code
Preservar os recursos originais: cenário, herói, sprites de monstros, ícones das dez armas e a atmosfera de RPG incremental. Redesenho guiado por componentes reais presentes em `index.html`; sem afirmar conversão pixel-perfect de referência ausente.

## Tokens Taste Skill
Fonte do sistema; base 16 px. Tokens centrais aplicados em `css/style.css`:
- `--bg`, `--panel`, `--panel2`: camadas escuras do ambiente.
- `--border`, `--text`, `--muted`: divisões e hierarquia.
- `--gold`: progresso, moeda e avisos importantes.
- `--green`: save/ação disponível; `--red`: erros.
- `--focus-ring`: foco visual perceptível em botões, links, inputs e menu.
- Escala `--space-1/2/3/4/6` = 4, 8, 12, 16, 24 px; `--radius-control` = 10 px.

## Estrutura de componentes (Awesome Design)
1. Topbar: título, situação de salvamento, menu Backup e áudio.
2. Arena de combate: HP, inimigo, botão de ataque, habilidades, contrato e baú.
3. Herói: moedas, atributos e melhorias.
4. Arsenal: grade de equipamentos com preço, nível e legibilidade mesmo indisponíveis.
5. Navegação mobile: alternância Combate/Herói/Loja para caber na viewport.
6. Backup: `details/summary` nativo e popover com comandos de importar/exportar, com validação e status acessível.

## Regras Web Design Guidelines
- Interface em **uma única viewport** (100dvh), sem rolagem global; painéis internos rolam.
- Botões e menu utilizam `:focus-visible` e alvos de toque acessíveis.
- Status textuais complementam cores, principalmente salvamento, custo e cooldown.
- `prefers-reduced-motion` desliga animações e transições não essenciais.
- Backup usa `aria-live` e permite Enter/Espaço sem dependência de mouse.
- Arquivos importados passam por validação de tamanho, versão e valores antes da restauração.

## GitHub Pages sem banco de dados
`index.html` usa caminhos relativos. O site funciona como página estática; persistência fica em `localStorage` e o arquivo de backup migra a partida entre navegadores. Não implica contas, cloud saves nem multiplayer.

## QA (Playwright CLI)
Cobrir desktop e mobile, inicialização, combate, economia, salvamento, menus, importação/exportação, reduzido movimento, capturas e overflow. Critério de aceitação: testes automáticos verdes e gameplay preservado. Artefatos do workflow permanecem disponíveis em Actions.
