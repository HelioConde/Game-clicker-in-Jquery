# Game Clicker — jogo incremental em jQuery

**Um projeto de jogo clicker para navegador, inspirado no estilo de progressão de Cookie Clicker.**

![JavaScript](https://img.shields.io/badge/JavaScript-ES5-F7DF1E?logo=javascript&logoColor=black) ![jQuery](https://img.shields.io/badge/jQuery-3.3.1-0769AD?logo=jquery&logoColor=white) ![Status](https://img.shields.io/badge/status-protótipo-64748b)

## Sobre o projeto

Este é um projeto antigo, mantido como registro de aprendizado em desenvolvimento de jogos web. O jogador interage com o personagem/inimigo para obter recursos, comprar armas e aumentar sua progressão.

### O que existe no código

- Sistema de clique e combate com elementos visuais e efeitos sonoros.
- Loja com dez categorias de armas e custos progressivos.
- Recursos e melhorias persistidos no `localStorage` do navegador.
- Interface implementada com HTML, CSS, JavaScript e jQuery.

## Como executar

1. Clone o repositório ou baixe o código-fonte.
2. Abra `index.html` no navegador. Para testar por um servidor local, execute `python -m http.server 8000` na pasta do projeto e acesse `http://localhost:8000`.
3. Clique nos elementos do jogo e use a loja para evoluir.

Nenhuma instalação de dependências via npm é necessária: o jQuery usado pelo projeto está incluído em `js/`.

## Estrutura

```text
index.html        Interface principal
css/              Estilos
js/script.js      Regras do jogo
js/jquery-3.3.1.min.js
img/              Sprites e imagens
efeito/           Efeitos sonoros
```

## Estado e próximos passos

O projeto é um **protótipo legado**, não uma versão comercial nem um jogo testado em todos os navegadores atuais. Melhorias futuras podem incluir acessibilidade, ajustes mobile, balanceamento, organização modular do JavaScript e testes de progressão.

> **Dados do jogador:** o progresso fica no armazenamento local do navegador. Apagar os dados do site pode reiniciar a partida.

Desenvolvido por [Hélio Conde](https://github.com/HelioConde).
