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

test("V3 existente migra com upgrades e habilidades zerados", () => {
  const old={version:3,money:200,owned:Array(10).fill(0),stage:8,hp:3,kills:7,bosses:0,sound:false};
  const state=game.normalize(old);
  assert.equal(state.version,3);
  assert.equal(state.stage,8);
  assert.equal(state.hp,3);
  assert.equal(state.sound,false);
  assert.deepEqual(state.upgrades,{strength:0,engine:0,critical:0,treasure:0});
  assert.equal(state.lastSeen,0);
  assert.equal(state.furyUntil,0);
});

test("melhorias evoluem e não deixam saldo negativo ou nível além do limite", () => {
  const state=game.normalize(null,{dinheiro:100000000});
  const first=game.upgradePrice(state,"strength");
  assert.equal(first,120);
  assert.equal(game.buyUpgrade(state,"strength"),true);
  assert.equal(state.upgrades.strength,1);
  assert.equal(game.clickPower(state),2);
  assert.ok(game.upgradePrice(state,"strength")>first);
  assert.equal(game.buyUpgrade(state,"inexistente"),false);
  state.money=0;
  assert.equal(game.buyUpgrade(state,"strength"),false);
  state.upgrades.strength=game.UPGRADES.strength.max;
  assert.equal(game.upgradePrice(state,"strength"),null);
  assert.equal(game.buyUpgrade(state,"strength"),false);
});

test("melhoria Autômato afeta DPS e Fortuna aumenta pagamento após vitória", () => {
  const state=game.normalize(null,{dinheiro:20000,arma5:5});
  const initialDps=game.dps(state);
  assert.equal(initialDps,1);
  assert.equal(game.buyUpgrade(state,"engine"),true);
  assert.equal(game.dps(state),1.2);
  assert.equal(game.buyUpgrade(state,"treasure"),true);
  const initialGold=state.money;
  const res=game.damage(state,12);
  assert.equal(res.kills,1);
  assert.equal(res.gold,12);
  assert.equal(state.money,initialGold+12);
});

test("crítico tem 5% de chance base e cresce com a melhoria", () => {
  const state=game.normalize(null,{});
  assert.equal(game.critChance(state),.05);
  let strike=game.strike(state,123456,()=>0);
  assert.equal(strike.critical,true);
  assert.equal(strike.damage,2);
  strike=game.strike(state,123456,()=>0.99);
  assert.equal(strike.critical,false);
  assert.equal(strike.damage,1);
  state.upgrades.critical=20;
  assert.equal(game.critChance(state),.45);
});

test("golpe poderoso aplica dano 5x e respeita cooldown", () => {
  const state=game.normalize(null,{});
  const first=game.activateSkill(state,"smash",1_000_000);
  assert.equal(first.ok,true);
  assert.equal(first.damage,5);
  assert.equal(state.hp,7);
  const early=game.activateSkill(state,"smash",1_001_000);
  assert.equal(early.ok,false);
  assert.equal(early.reason,"cooldown");
  const ready=game.activateSkill(state,"smash",1_015_000);
  assert.equal(ready.ok,true);
  assert.equal(state.stage,1);
});

test("Fúria dobra golpes e DPS na interface sem reativar durante cooldown", () => {
  const state=game.normalize(null,{dinheiro:1000,arma5:5});
  const activate=game.activateSkill(state,"fury",5_000_000);
  assert.equal(activate.ok,true);
  assert.equal(game.furyActive(state,5_000_001),true);
  assert.equal(game.furyActive(state,5_010_000),false);
  assert.equal(game.activateSkill(state,"fury",5_005_000).ok,false);
  const hit=game.strike(state,5_000_001,()=>0.99);
  assert.equal(hit.damage,2);
  assert.equal(game.activateSkill(state,"fury",5_060_000).ok,true);
});

test("recompensa offline é concedida apenas uma vez, sem progredir fases", () => {
  const t=1_700_000_000_000;
  const state=game.normalize({version:3,money:100,owned:[0,0,0,0,5,0,0,0,0,0],stage:3,hp:7,lastSeen:t});
  const claim=game.claimOffline(state,t+600_000);
  assert.equal(claim.seconds,600);
  assert.equal(claim.gold,120);
  assert.equal(state.money,220);
  assert.equal(state.offlineEarned,120);
  assert.equal(state.stage,3);
  assert.equal(state.hp,7);
  assert.equal(game.claimOffline(state,t+600_000).gold,0);
});

test("recompensas offline têm teto de 8 horas e não premiam relógio regressivo", () => {
  const t=1_700_000_000_000;
  const state=game.normalize({version:3,money:0,owned:[0,0,0,0,5,0,0,0,0,0],lastSeen:t});
  assert.equal(game.claimOffline(state,t-60_000).gold,0);
  const claim=game.claimOffline(state,t+900_000_000);
  assert.equal(claim.seconds,28800);
  assert.equal(claim.gold,5760);
  assert.equal(game.claimOffline(state,t+900_000_001).gold,0);
});

test("dever respeitar limite de avanço por tick sob dano extremo", () => {
  const state=game.normalize(null,{});
  const result=game.damage(state,1e15);
  assert.equal(result.kills,50);
  assert.equal(state.stage,51);
  assert.equal(state.kills,50);
});
