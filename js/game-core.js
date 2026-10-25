/* Game Clicker: regras puras, compatíveis com Node e navegador. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.GameCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const MAX = 1e15;
  const WEAPONS = Object.freeze([
    ["Stone",25,1,0],["Blade",50,2,0],["Sword",100,3,0],
    ["Sword Iron",200,4,0],["Sword Fire",400,0,1],
    ["Razor Sword",600,6,0],["Ruins Sword",800,7,0],
    ["Fate Sword",1000,8,0],["Obsidian Sword",1200,9,0],
    ["Ragnarok Sword",1400,0,2]
  ]);
  const UPGRADES = Object.freeze({
    strength:{name:"Força",description:"+20% de dano por clique",base:120,max:25},
    engine:{name:"Autômato",description:"+20% de dano automático",base:220,max:25},
    critical:{name:"Precisão",description:"+2% chance de crítico",base:150,max:20},
    treasure:{name:"Fortuna",description:"+15% de moedas por vitória",base:180,max:25}
  });
  const SKILLS = Object.freeze({
    smash:{name:"Golpe poderoso",cooldown:15000},
    fury:{name:"Fúria",cooldown:60000,duration:10000}
  });
  const finite = value => {
    const n=Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.min(n,MAX) : 0;
  };
  const stageNumber = value => Math.max(1,Math.min(9999,Math.floor(finite(value)) || 1));
  const timestamp = value => {
    const n=Number(value);
    return Number.isSafeInteger(n) && n > 0 && n < 9e15 ? n : 0;
  };
  // A aparência é determinada pela fase (e nunca por sorte): atualizar um save
  // antigo mantém o mesmo inimigo, HP, recompensa e chefe daquela fase.
  const ENEMIES = Object.freeze({
    shadow:{name:"Criatura Sombria",sprite:"img/monstro.gif"},
    slime:{name:"Slime do Bosque",sprite:"img/inimigos/slime-bosque.svg"},
    bat:{name:"Morcego do Crepúsculo",sprite:"img/inimigos/morcego-crepusculo.svg"},
    golem:{name:"Golem de Pedra",sprite:"img/inimigos/golem-pedra.svg"},
    guardian:{name:"Guardião do Bosque",sprite:"img/inimigos/guardiao-bosque.svg"},
    titan:{name:"Colosso do Eclipse",sprite:"img/inimigos/colosso-eclipse.svg"}
  });
  const REGIONS = Object.freeze(["bosque","eclipse","montanha","crepusculo"]);
  const ROSTERS = Object.freeze([
    ["shadow","slime","bat"],
    ["golem","bat","slime"],
    ["golem","slime","shadow"],
    ["bat","shadow","golem"]
  ]);
  const enemyFor = stage => {
    const wave=stageNumber(stage), boss=wave%10===0;
    const regionIndex=Math.floor((wave-1)/10)%REGIONS.length;
    const slot=(wave-1)%10;
    const id=boss ? (regionIndex%2===0?"guardian":"titan")
      :ROSTERS[regionIndex][Math.floor(slot/3)];
    const meta=ENEMIES[id];
    return {
      stage:wave,boss,id,name:meta.name,sprite:meta.sprite,
      biome:REGIONS[regionIndex],
      hp:Math.min(MAX,Math.ceil(12*Math.pow(1.22,wave-1)*(boss?3.5:1))),
      reward:Math.min(MAX,Math.ceil(10*Math.pow(1.2,wave-1)*(boss?6:1)))
    };
  };
  function normalize(saved,legacy={}) {
    const compatible=saved && [2,3].includes(saved.version) && Array.isArray(saved.owned);
    const advanced=compatible && saved.version===3;
    const source=compatible?saved:legacy;
    const owned=WEAPONS.map((_,i)=>Math.floor(finite(
      compatible ? source.owned[i] : finite(source["arma"+(i+1)])/(i+1)
    )));
    const stage=advanced?stageNumber(saved.stage):1;
    const maxHp=enemyFor(stage).hp;
    const health=advanced && saved.hp!=null?Math.min(maxHp,finite(saved.hp)):maxHp;
    const upgrades={};
    for(const key of Object.keys(UPGRADES)) {
      upgrades[key]=advanced?Math.min(UPGRADES[key].max,Math.floor(finite(saved.upgrades && saved.upgrades[key]))):0;
    }
    return {
      version:3,
      money:finite(compatible?saved.money:legacy.dinheiro),
      owned,
      sound:compatible?saved.sound!==false:legacy.efetioSom!=="off",
      stage,
      hp:health>0?health:maxHp,
      kills:advanced?Math.floor(finite(saved.kills)):0,
      bosses:advanced?Math.floor(finite(saved.bosses)):0,
      upgrades,
      skillReady:{
        smash:advanced?timestamp(saved.skillReady && saved.skillReady.smash):0,
        fury:advanced?timestamp(saved.skillReady && saved.skillReady.fury):0
      },
      furyUntil:advanced?timestamp(saved.furyUntil):0,
      lastSeen:advanced?timestamp(saved.lastSeen):0,
      offlineEarned:advanced?Math.floor(finite(saved.offlineEarned)):0
    };
  }
  const clickPower = s => Math.min(MAX,Math.ceil(
    (1+WEAPONS.reduce((sum,w,i)=>sum+w[2]*s.owned[i],0)) *
    (1+.2*(s.upgrades?.strength||0))
  ));
  const dps = s => Math.min(MAX,
    WEAPONS.reduce((sum,w,i)=>sum+w[3]*s.owned[i],0) *
    (1+.2*(s.upgrades?.engine||0))
  );
  const critChance = s => Math.min(.45,.05+.02*(s.upgrades?.critical||0));
  const price = (s,index) => Math.min(MAX,Math.ceil(WEAPONS[index][1]*Math.pow(1.18,s.owned[index])));
  const upgradePrice = (s,key) => {
    const item=UPGRADES[key];
    if(!item) return null;
    const level=s.upgrades?.[key]||0;
    return level>=item.max?null:Math.min(MAX,Math.ceil(item.base*Math.pow(1.55,level)));
  };
  function buy(s,index) {
    if(!Number.isInteger(index)||index<0||index>=WEAPONS.length)return false;
    const amount=price(s,index);
    if(s.money<amount||s.owned[index]>=10000)return false;
    s.money=Math.max(0,s.money-amount);
    s.owned[index]++;
    return true;
  }
  function buyUpgrade(s,key) {
    const cost=upgradePrice(s,key);
    if(cost===null||s.money<cost)return false;
    s.money=Math.max(0,s.money-cost);
    s.upgrades[key]++;
    return true;
  }
  function damage(s,amount) {
    let remaining=finite(amount),kills=0,gold=0,bosses=0;
    while(remaining>0&&kills<50) {
      const enemy=enemyFor(s.stage);
      const hit=Math.min(remaining,s.hp);
      s.hp-=hit;
      remaining-=hit;
      if(s.hp>0)break;
      kills++;
      if(enemy.boss)bosses++;
      const bonus=1+.15*(s.upgrades?.treasure||0);
      const prize=Math.min(MAX,Math.ceil(enemy.reward*bonus));
      gold=Math.min(MAX,gold+prize);
      s.money=Math.min(MAX,s.money+prize);
      s.kills=Math.min(MAX,s.kills+1);
      if(enemy.boss)s.bosses=Math.min(MAX,s.bosses+1);
      s.stage=Math.min(9999,s.stage+1);
      s.hp=enemyFor(s.stage).hp;
    }
    return {kills,gold,bosses};
  }
  const furyActive=(s,now)=>timestamp(now)<s.furyUntil;
  function strike(s,now,random=Math.random) {
    const sample=Number(random());
    const critical=Number.isFinite(sample)&&sample>=0&&sample<critChance(s);
    const boost=furyActive(s,now)?2:1;
    const points=Math.ceil(clickPower(s)*boost*(critical?2:1));
    return {damage:points,critical,result:damage(s,points)};
  }
  function activateSkill(s,skill,now) {
    if(!SKILLS[skill])return {ok:false,reason:"unknown"};
    const time=timestamp(now);
    if(!time)return {ok:false,reason:"clock"};
    if(time < s.skillReady[skill])return {ok:false,reason:"cooldown",remaining:s.skillReady[skill]-time};
    s.skillReady[skill]=time+SKILLS[skill].cooldown;
    if(skill==="fury") {
      s.furyUntil=time+SKILLS.fury.duration;
      return {ok:true,duration:SKILLS.fury.duration};
    }
    const power=Math.ceil(clickPower(s)*5*(furyActive(s,time)?2:1));
    return {ok:true,damage:power,result:damage(s,power)};
  }
  // Apenas ouro passivo, sem matar inimigos enquanto o navegador estiver fechado.
  // Não há prêmio quando o relógio recua; o máximo computado é 8 h a 20% do DPS.
  function claimOffline(s,now) {
    const time=timestamp(now);
    const previous=timestamp(s.lastSeen);
    if(!time)return {seconds:0,gold:0};
    s.lastSeen=time;
    if(!previous||time<=previous||time-previous<60000)return {seconds:0,gold:0};
    const seconds=Math.min(28800,(time-previous)/1000);
    const gold=Math.min(MAX,Math.floor(dps(s)*seconds*.2));
    s.money=Math.min(MAX,s.money+gold);
    s.offlineEarned=Math.min(MAX,s.offlineEarned+gold);
    return {seconds:Math.floor(seconds),gold};
  }
  return {WEAPONS,UPGRADES,SKILLS,ENEMIES,REGIONS,normalize,enemyFor,clickPower,dps,critChance,
    price,upgradePrice,buy,buyUpgrade,damage,strike,activateSkill,furyActive,claimOffline};
});
