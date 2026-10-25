/* Núcleo de regras: independente do navegador para permitir testes em Node. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.GameCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const MAX = 1e15;
  const WEAPONS = Object.freeze([
    ["Stone", 25, 1, 0], ["Blade", 50, 2, 0],
    ["Sword", 100, 3, 0], ["Sword Iron", 200, 4, 0],
    ["Sword Fire", 400, 0, 1], ["Razor Sword", 600, 6, 0],
    ["Ruins Sword", 800, 7, 0], ["Fate Sword", 1000, 8, 0],
    ["Obsidian Sword", 1200, 9, 0], ["Ragnarok Sword", 1400, 0, 2]
  ]);
  const finite = value => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.min(n, MAX) : 0;
  };
  const stageNumber = value => Math.max(1, Math.min(9999, Math.floor(finite(value)) || 1));
  const enemyFor = stage => {
    const wave = stageNumber(stage);
    const boss = wave % 10 === 0;
    return {
      stage: wave,
      boss,
      name: boss ? "Guardião Sombrio" : "Criatura Sombria",
      hp: Math.min(MAX, Math.ceil(12 * Math.pow(1.22, wave - 1) * (boss ? 5 : 1))),
      reward: Math.min(MAX, Math.ceil(10 * Math.pow(1.2, wave - 1) * (boss ? 6 : 1)))
    };
  };
  function normalize(saved, legacy = {}) {
    const fromV2 = saved && (saved.version === 2 || saved.version === 3) && Array.isArray(saved.owned);
    const source = fromV2 ? saved : legacy;
    const owned = WEAPONS.map((_, i) => Math.floor(finite(
      fromV2 ? source.owned[i] : finite(source["arma" + (i + 1)]) / (i + 1)
    )));
    const stage = fromV2 && saved.version === 3 ? stageNumber(saved.stage) : 1;
    const maxHp = enemyFor(stage).hp;
    const health = fromV2 && saved.version === 3 && saved.hp != null
      ? Math.min(maxHp, finite(saved.hp)) : maxHp;
    return {
      version: 3,
      money: finite(fromV2 ? saved.money : legacy.dinheiro),
      owned,
      sound: fromV2 ? saved.sound !== false : legacy.efetioSom !== "off",
      stage,
      hp: health > 0 ? health : maxHp,
      kills: fromV2 && saved.version === 3 ? Math.floor(finite(saved.kills)) : 0,
      bosses: fromV2 && saved.version === 3 ? Math.floor(finite(saved.bosses)) : 0
    };
  }
  const clickPower = s => 1 + WEAPONS.reduce((sum, w, i) => sum + w[2] * s.owned[i], 0);
  const dps = s => WEAPONS.reduce((sum, w, i) => sum + w[3] * s.owned[i], 0);
  const price = (s, index) => Math.min(MAX, Math.ceil(WEAPONS[index][1] * Math.pow(1.18, s.owned[index])));
  function buy(s, index) {
    if (!Number.isInteger(index) || index < 0 || index >= WEAPONS.length) return false;
    const amount = price(s, index);
    if (s.money < amount || s.owned[index] >= 10000) return false;
    s.money = Math.max(0, s.money - amount);
    s.owned[index]++;
    return true;
  }
  function damage(s, amount) {
    let remaining = finite(amount);
    let kills = 0, gold = 0, bosses = 0;
    // Limita o avanço por tick para evitar travamento em DPS extremo.
    while (remaining > 0 && kills < 50) {
      const enemy = enemyFor(s.stage);
      const hit = Math.min(remaining, s.hp);
      s.hp -= hit;
      remaining -= hit;
      if (s.hp > 0) break;
      kills++;
      if (enemy.boss) bosses++;
      gold += enemy.reward;
      s.money = Math.min(MAX, s.money + enemy.reward);
      s.kills = Math.min(MAX, s.kills + 1);
      if (enemy.boss) s.bosses = Math.min(MAX, s.bosses + 1);
      s.stage = Math.min(9999, s.stage + 1);
      s.hp = enemyFor(s.stage).hp;
    }
    return { kills, gold, bosses };
  }
  return { WEAPONS, normalize, enemyFor, clickPower, dps, price, buy, damage };
});
