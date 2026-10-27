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
  const state=game.normalize({version:3,money:100,owned:[0,0,0,0,1,0,0,0,0,0],stage:3,hp:7,lastSeen:t});
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
  const state=game.normalize({version:3,money:0,owned:[0,0,0,0,1,0,0,0,0,0],lastSeen:t});
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

test("Etapa 6 alterna inimigos por fase sem alterar HP ou recompensa", () => {
  const expected = [
    [1,"shadow","bosque","img/monstro.gif"],
    [4,"slime","bosque","img/inimigos/slime-bosque.svg"],
    [7,"bat","bosque","img/inimigos/morcego-crepusculo.svg"],
    [10,"guardian","bosque","img/inimigos/guardiao-bosque.svg"],
    [11,"golem","eclipse","img/inimigos/golem-pedra.svg"],
    [20,"titan","eclipse","img/inimigos/colosso-eclipse.svg"],
    [21,"golem","montanha","img/inimigos/golem-pedra.svg"],
    [30,"guardian","montanha","img/inimigos/guardiao-bosque.svg"]
  ];
  for (const [stage,id,biome,sprite] of expected) {
    const monster=game.enemyFor(stage);
    assert.equal(monster.id,id,"sprite incorreto na fase "+stage);
    assert.equal(monster.biome,biome);
    assert.equal(monster.sprite,sprite);
    assert.equal(monster.boss,stage%10===0);
    assert.equal(monster.hp,Math.min(1e15,Math.ceil(12*Math.pow(1.22,stage-1)*(monster.boss?3.5:1))));
    assert.equal(monster.reward,Math.min(1e15,Math.ceil(10*Math.pow(1.2,stage-1)*(monster.boss?6:1))));
  }
});

test("save antigo na fase 21 preserva HP, chefe e sprites determinísticos", () => {
  const raw={version:3,money:1234,owned:Array(10).fill(0),stage:21,hp:177,kills:20,bosses:2};
  const s=game.normalize(raw);
  assert.equal(s.stage,21);
  assert.equal(s.hp,177);
  assert.equal(s.kills,20);
  assert.equal(s.bosses,2);
  assert.equal(game.enemyFor(s.stage).id,"golem");
  assert.equal(game.enemyFor(s.stage).sprite,game.enemyFor(s.stage).sprite);
  const before=s.money;
  const hit=game.damage(s,12);
  assert.equal(hit.kills,0);
  assert.equal(s.money,before);
  assert.equal(s.hp,165);
});

test("chefes das regiões alternam aparência mantendo ciclo de dez fases", () => {
  const a=game.enemyFor(10);
  const b=game.enemyFor(20);
  const c=game.enemyFor(30);
  assert.notEqual(a.id,b.id);
  assert.equal(a.id,c.id);
  assert.equal(a.reward,game.enemyFor(10).reward);
  assert.ok(b.hp>game.enemyFor(19).hp);
});


test("Etapa 7 mantém vida e recompensas originais até fase 30", () => {
  for(const stage of [1,10,20,21,29,30]) {
    const enemy=game.enemyFor(stage);
    const boss=stage%10===0;
    assert.equal(enemy.hp,Math.min(1e15,Math.ceil(12*Math.pow(1.22,stage-1)*(boss?3.5:1))));
    assert.equal(enemy.reward,Math.min(1e15,Math.ceil(10*Math.pow(1.2,stage-1)*(boss?6:1))));
  }
});

test("Etapa 7 reduz crescimento de HP a partir da fase 31", () => {
  const wave30=game.enemyFor(30);
  const wave31=game.enemyFor(31);
  const old31=Math.ceil(12*Math.pow(1.22,30));
  assert.ok(wave31.hp<old31,"fase 31 deve crescer mais lentamente");
  assert.ok(game.enemyFor(40).hp < Math.ceil(12*Math.pow(1.22,39)*3.5));
  assert.ok(game.enemyFor(50).hp>game.enemyFor(40).hp);
  assert.ok(wave30.hp>game.enemyFor(29).hp);
  assert.equal(wave31.reward,Math.ceil(10*Math.pow(1.2,30)));
});

test("save legado após fase 30 preserva percentual de HP sem migrar duas vezes", () => {
  const stage=40;
  const oldMax=Math.ceil(12*Math.pow(1.22,39)*3.5);
  const old={version:3,money:400,owned:Array(10).fill(0),stage,hp:Math.floor(oldMax/4),kills:39,bosses:3};
  const migrated=game.normalize(old);
  const nowMax=game.enemyFor(stage).hp;
  assert.equal(migrated.balanceVersion,2);
  assert.ok(Math.abs(migrated.hp/nowMax-.25)<.01);
  assert.equal(migrated.money,400);
  assert.equal(migrated.kills,39);
  assert.equal(migrated.bosses,3);
  assert.equal(game.normalize(migrated).hp,migrated.hp);
  assert.equal(game.normalize(migrated).stage,stage);
});

test("derrotas informam sprite anterior, inclusive chefes, sem alterar moedas", () => {
  const state=game.normalize({version:3,money:0,owned:Array(10).fill(0),stage:10,hp:1,kills:9,bosses:0});
  const result=game.damage(state,1);
  assert.equal(result.kills,1);
  assert.equal(result.bosses,1);
  assert.equal(result.defeated.id,"guardian");
  assert.equal(result.defeatedBoss.sprite,"img/inimigos/guardiao-bosque.svg");
  assert.equal(state.stage,11);
  assert.equal(state.money,game.enemyFor(10).reward);
  const none=game.damage(state,0);
  assert.equal(none.kills,0);
  assert.equal(none.defeated,null);
});

test("dano massivo mantém informação do último chefe derrotado",()=>{
  const s=game.normalize({version:3,money:0,owned:Array(10).fill(0),stage:9,hp:1});
  const result=game.damage(s,1e10);
  assert.ok(result.bosses>=1);
  assert.equal(result.defeatedBoss.boss,true);
  assert.equal(result.defeatedBoss.stage%10,0);
  assert.ok(result.defeated.stage>=result.defeatedBoss.stage);
});

test("Etapa 8 oferece spritesheet de quatro quadros sem alterar sprite original", () => {
  for (const stage of [4,7,10,11,20,21,30]) {
    const monster=game.enemyFor(stage);
    assert.ok(monster.sheet.endsWith("-sheet.svg"));
    assert.equal(monster.sheet,monster.sprite.replace(".svg","-sheet.svg"));
    assert.equal(monster.hp,game.enemyFor(stage).hp);
    assert.equal(monster.reward,game.enemyFor(stage).reward);
  }
  const legacy=game.enemyFor(1);
  assert.equal(legacy.sprite,"img/monstro.gif");
  assert.equal(legacy.sheet,null);
});

test("Etapa 8 mantém HP, recursos e progresso salvos durante rotação de monstros", () => {
  const old={version:3,balanceVersion:2,money:1234,owned:Array(10).fill(0),
    stage:21,hp:177,kills:20,bosses:2,upgrades:{strength:2}};
  const state=game.normalize(old);
  assert.equal(state.stage,21);
  assert.equal(state.hp,177);
  assert.equal(state.money,1234);
  assert.equal(state.kills,20);
  assert.equal(game.enemyFor(state.stage).sheet,"img/inimigos/golem-pedra-sheet.svg");
});


test("Etapa 9 cria combo por ritmo de ataque, mas não afeta DPS",()=>{
  const s=game.normalize(null,{dinheiro:0,arma2:20});
  const base=game.clickPower(s);
  const passive=game.dps(s);
  const first=game.strike(s,1_000_000,()=>.99);
  const second=game.strike(s,1_000_600,()=>.99);
  const third=game.strike(s,1_001_300,()=>.99);
  assert.equal(first.combo,1);
  assert.equal(first.damage,base);
  assert.equal(second.combo,2);
  assert.ok(second.damage>first.damage);
  assert.equal(third.combo,3);
  assert.ok(third.damage>=second.damage);
  assert.equal(game.dps(s),passive);
  const reset=game.strike(s,1_004_000,()=>.99);
  assert.equal(reset.combo,1);
  assert.equal(reset.damage,base);
});

test("contratos alternam mortes, cliques e habilidades com prêmio resgatado uma vez",()=>{
  const s=game.normalize(null,{});
  assert.equal(game.huntInfo(s).id,"defeat");
  assert.equal(game.huntInfo(s).progress,0);
  for(let i=0;i<3;i++)game.recordHunt(s,"kill");
  assert.equal(game.huntInfo(s).ready,true);
  const reward=game.huntInfo(s).reward;
  assert.ok(reward>0);
  assert.equal(game.claimHunt(s),reward);
  assert.equal(game.claimHunt(s),0);
  assert.equal(s.money,reward);
  assert.equal(game.huntInfo(s).id,"combo");
  game.recordHunt(s,"kill",10);
  assert.equal(game.huntInfo(s).progress,0);
  for(let i=0;i<8;i++)game.recordHunt(s,"hit");
  assert.equal(game.huntInfo(s).ready,true);
  game.claimHunt(s);
  assert.equal(game.huntInfo(s).id,"skills");
  assert.equal(game.activateSkill(s,"fury",1_000_000).ok,true);
  assert.equal(game.activateSkill(s,"smash",1_001_000).ok,true);
  assert.equal(game.huntInfo(s).ready,true);
});

test("uma vitória da fase 5 libera baú de escolha sem premiar duas vezes",()=>{
  const s=game.normalize({version:3,stage:5,hp:1,owned:Array(10).fill(0),money:0,kills:4,bosses:0});
  const result=game.damage(s,1);
  assert.equal(result.kills,1);
  assert.equal(s.stage,6);
  assert.equal(s.pendingChests,1);
  assert.equal(game.claimChest(s,"invalido").ok,false);
  assert.equal(s.pendingChests,1);
  const after=game.claimChest(s,"strength");
  assert.equal(after.ok,true);
  assert.equal(s.upgrades.strength,1);
  assert.equal(s.pendingChests,0);
  assert.equal(s.chestsOpened,1);
  assert.equal(game.claimChest(s,"strength").ok,false);
});

test("baús oferecem ouro ou DPS, e fazem fallback no nível máximo",()=>{
  const a=game.normalize({version:3,stage:11,hp:5,owned:Array(10).fill(0),pendingChests:1});
  const gold=game.chestGold(a);
  assert.ok(gold>0);
  const r=game.claimChest(a,"gold");
  assert.equal(r.gold,gold);
  assert.equal(a.money,gold);
  const b=game.normalize({version:3,stage:11,hp:5,owned:Array(10).fill(0),pendingChests:2});
  assert.equal(game.claimChest(b,"engine").ok,true);
  assert.equal(b.upgrades.engine,1);
  b.upgrades.strength=game.UPGRADES.strength.max;
  assert.equal(game.claimChest(b,"strength").choice,"gold");
  assert.equal(b.upgrades.strength,game.UPGRADES.strength.max);
  assert.equal(b.pendingChests,0);
});

test("save V3 antigo inicia missões e baús neutros; baú pendente é recuperado",()=>{
  const old=game.normalize({version:3,money:432,stage:21,hp:77,owned:Array(10).fill(0),kills:20,bosses:2});
  assert.equal(old.pendingChests,0);
  assert.equal(old.hunt.cycle,0);
  assert.equal(old.money,432);
  const save=game.normalize({...old,pendingChests:1,
    hunt:{cycle:1,progress:5,ready:false,reward:0}});
  assert.equal(save.pendingChests,1);
  assert.equal(game.huntInfo(save).id,"combo");
  assert.equal(game.huntInfo(save).progress,5);
  assert.equal(save.hp,77);
  assert.equal(save.combo.count,0);
});
