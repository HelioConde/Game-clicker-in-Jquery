const test = require("node:test");
const assert = require("node:assert/strict");
const game = require("../js/game-core.js");

test("jogo novo começa com fase 1 e inimigo com vida completa", () => {
  const state = game.normalize(null, {});
  assert.equal(state.version, 3);
  assert.equal(state.stage, 1);
  assert.equal(state.hp, 12);
  assert.equal(game.clickPower(state), 1);
  assert.equal(game.dps(state), 0);
});

test("migração do save v2 mantém moedas, níveis e som", () => {
  const old = { version:2, money:789, owned:[1,2,0,0,1,0,0,0,0,0], sound:false };
  const state = game.normalize(old);
  assert.equal(state.money, 789);
  assert.deepEqual(state.owned.slice(0,5), old.owned.slice(0,5));
  assert.equal(state.sound, false);
  assert.equal(state.stage, 1);
  assert.equal(game.dps(state), 1);
});

test("migração da versão 2022 converte unidades antigas em níveis", () => {
  const state = game.normalize(null, { dinheiro:"56", arma1:"2", arma2:"4", arma10:"10", efetioSom:"off" });
  assert.equal(state.money, 56);
  assert.equal(state.owned[0], 2);
  assert.equal(state.owned[1], 2);
  assert.equal(state.owned[9], 1);
  assert.equal(state.sound, false);
});

test("v3 recupera fase e HP parcial e saneia dados inválidos", () => {
  const state = game.normalize({version:3,money:55,owned:Array(10).fill(0),sound:true,stage:3,hp:8,kills:2,bosses:0});
  assert.equal(state.stage, 3);
  assert.equal(state.hp, 8);
  assert.equal(state.kills, 2);
  const bad = game.normalize({version:3,money:-1,owned:Array(10).fill(-9),sound:true,stage:-3,hp:-55,kills:-1});
  assert.equal(bad.money, 0);
  assert.equal(bad.stage, 1);
  assert.equal(bad.hp, 12);
  assert.equal(bad.kills, 0);
});

test("ataques causam dano, mas não dão moedas até a derrota", () => {
  const state = game.normalize(null, {});
  const partial = game.damage(state, 5);
  assert.equal(partial.kills, 0);
  assert.equal(state.hp, 7);
  assert.equal(state.money, 0);
  const finish = game.damage(state, 7);
  assert.equal(finish.kills, 1);
  assert.equal(state.stage, 2);
  assert.equal(state.kills, 1);
  assert.equal(state.money, 10);
  assert.equal(state.hp, game.enemyFor(2).hp);
});

test("chefes aparecem a cada dez fases e contam vitórias separadas", () => {
  assert.equal(game.enemyFor(9).boss, false);
  assert.equal(game.enemyFor(10).boss, true);
  assert.equal(game.enemyFor(20).boss, true);
  const state = game.normalize({version:3,money:0,owned:Array(10).fill(0),stage:10,hp:1,kills:9,bosses:0});
  const result = game.damage(state, 1);
  assert.equal(result.kills, 1);
  assert.equal(result.bosses, 1);
  assert.equal(state.bosses, 1);
  assert.equal(state.stage, 11);
  assert.equal(state.money, game.enemyFor(10).reward);
});

test("DPS e golpes acima do HP transportam dano para próximo inimigo", () => {
  const state = game.normalize(null, {});
  const hit = game.damage(state, 27);
  assert.equal(hit.kills, 2);
  assert.equal(state.stage, 3);
  assert.equal(state.hp, game.enemyFor(3).hp);
  assert.equal(state.kills, 2);
});

test("compras aumentam custo e poder, sem permitir saldo negativo", () => {
  const state = game.normalize(null,{dinheiro:25});
  assert.equal(game.price(state,0),25);
  assert.equal(game.buy(state,0),true);
  assert.equal(state.money,0);
  assert.equal(state.owned[0],1);
  assert.equal(game.clickPower(state),2);
  assert.ok(game.price(state,0)>25);
  assert.equal(game.buy(state,0),false);
  assert.equal(state.money,0);
  assert.equal(game.buy(state,-1),false);
});

test("armas automáticas alimentam DPS e não o dano por clique", () => {
  const state = game.normalize(null,{dinheiro:2000});
  assert.equal(game.buy(state,4),true);
  assert.equal(game.dps(state),1);
  assert.equal(game.clickPower(state),1);
  assert.equal(game.buy(state,9),true);
  assert.equal(game.dps(state),3);
});
