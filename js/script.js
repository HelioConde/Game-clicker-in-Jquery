"use strict";
(() => {
  const core = window.GameCore;
  const $ = id => document.getElementById(id);
  const read = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const readJSON = key => { try { return JSON.parse(read(key) || "null"); } catch (_) { return null; } };
  const legacy = { dinheiro:read("dinheiro"), efetioSom:read("efetioSom") };
  for (let i = 1; i <= 10; i++) legacy["arma" + i] = read("arma" + i);
  const state = core.normalize(readJSON("gameClickerV3") || readJSON("gameClickerV2"), legacy);
  const number = n => Math.floor(n).toLocaleString("pt-BR");
  const sound = id => {
    if (!state.sound) return;
    const audio = $(id);
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
  };
  const status = $("saveStatus");
  function save() {
    try {
      localStorage.setItem("gameClickerV3", JSON.stringify(state));
      // Mantém compatibilidade com o save da etapa anterior, caso o usuário retorne àquela branch.
      localStorage.setItem("gameClickerV2", JSON.stringify({
        version:2, money:state.money, owned:state.owned, sound:state.sound
      }));
      localStorage.setItem("dinheiro", String(state.money));
      localStorage.setItem("dps", String(core.dps(state)));
      localStorage.setItem("efetioSom", state.sound ? "on" : "off");
      state.owned.forEach((n, i) => localStorage.setItem("arma" + (i + 1), String(n * (i + 1))));
      status.textContent = "Salvo no navegador";
      status.classList.remove("error");
    } catch (error) {
      status.textContent = "Salvamento indisponível";
      status.classList.add("error");
      console.warn("Erro ao salvar o Game Clicker", error);
    }
  }
  function renderStats() {
    $("valor").textContent = number(state.money);
    $("clickStat").textContent = number(core.clickPower(state));
    $("dpsStat").textContent = number(core.dps(state));
    $("killStat").textContent = number(state.kills);
    $("bossStat").textContent = number(state.bosses);
  }
  function renderShop() {
    core.WEAPONS.forEach((weapon, i) => {
      const button = $("item" + (i + 1));
      const price = core.price(state, i);
      const affordable = state.money >= price;
      button.classList.toggle("affordable", affordable);
      button.classList.toggle("unaffordable", !affordable);
      button.setAttribute("aria-label",
        "Comprar " + weapon[0] + ", nível " + state.owned[i] + ", custa " + number(price) + " moedas");
      button.innerHTML = '<img src="img/arma' + (i + 1) + '.png" alt="" loading="lazy">' +
        '<span class="item-name">' + weapon[0] + '</span>' +
        '<small>Nível ' + number(state.owned[i]) + ' · ' +
        (weapon[3] ? '+' + weapon[3] + ' dano/s' : '+' + weapon[2] + ' por clique') +
        '</small><strong>🪙 ' + number(price) + '</strong>';
    });
  }
  function renderEnemy() {
    const enemy = core.enemyFor(state.stage);
    $("stageLabel").textContent = "FASE " + number(state.stage);
    $("enemyName").textContent = enemy.name;
    $("bossBadge").hidden = !enemy.boss;
    $("attackButton").classList.toggle("boss", enemy.boss);
    $("attackButton").setAttribute("aria-label", "Atacar " + enemy.name + " da fase " + state.stage);
    $("enemyHpBar").max = enemy.hp;
    $("enemyHpBar").value = state.hp;
    $("enemyHpLabel").textContent = number(Math.ceil(state.hp)) + " / " + number(enemy.hp);
    $("rewardValue").textContent = number(enemy.reward);
  }
  function renderAll() { renderStats(); renderShop(); renderEnemy(); }
  function message(text) { $("battleMessage").textContent = text; }
  function onResults(result) {
    if (!result.kills) return;
    sound("dinheiroSom");
    message(result.bosses > 0
      ? "Chefe derrotado! +" + number(result.gold) + " moedas · Fase " + number(state.stage) + " liberada!"
      : result.kills === 1
        ? "Monstro derrotado! +" + number(result.gold) + " moedas. Próxima fase!"
        : result.kills + " criaturas derrotadas! +" + number(result.gold) + " moedas.");
    renderShop();
    renderStats();
    save();
  }
  core.WEAPONS.forEach((weapon, index) => {
    $("item" + (index + 1)).addEventListener("click", () => {
      if (!core.buy(state, index)) {
        sound("erro");
        message("Moedas insuficientes para comprar " + weapon[0] + ".");
        return;
      }
      sound("dinheiroSom");
      message(weapon[0] + " melhorada para o nível " + state.owned[index] + "!");
      renderAll();
      save();
    });
  });
  let animating = false;
  let attackTimer = null;
  function attack() {
    if (animating) return;
    animating = true;
    const damage = core.clickPower(state);
    const result = core.damage(state, damage);
    $("personagem").src = "img/attack.gif";
    $("enimei").src = "img/monstro_dano.png";
    const arena = $("attackButton");
    arena.classList.add("hit");
    const hitNumber = $("hitNumber");
    hitNumber.textContent = "-" + number(damage);
    hitNumber.classList.remove("show");
    void hitNumber.offsetWidth;
    hitNumber.classList.add("show");
    sound("espada");
    renderEnemy();
    onResults(result);
    save();
    clearTimeout(attackTimer);
    attackTimer = setTimeout(() => {
      $("personagem").src = "img/stop.png";
      $("enimei").src = "img/monstro.gif";
      arena.classList.remove("hit");
      animating = false;
    }, 350);
  }
  $("attackButton").addEventListener("click", attack);
  const soundButton = $("config");
  function renderSound() {
    soundButton.textContent = state.sound ? "🔊 Som ligado" : "🔇 Som desligado";
    soundButton.setAttribute("aria-pressed", String(state.sound));
  }
  soundButton.addEventListener("click", () => { state.sound = !state.sound; renderSound(); save(); });
  let last = performance.now();
  let lastSave = last;
  // Não concede recompensas offline nesta etapa; isso pertence ao futuro sistema Idle.
  document.addEventListener("visibilitychange", () => { last = performance.now(); if(document.hidden) save(); });
  setInterval(() => {
    const now = performance.now();
    const elapsed = Math.min(0.5, Math.max(0, (now - last) / 1000));
    last = now;
    if (document.hidden) return;
    const power = core.dps(state);
    if (power > 0) {
      const result = core.damage(state, power * elapsed);
      renderEnemy();
      onResults(result);
    }
    if (now - lastSave >= 2000) { save(); lastSave = now; }
  }, 250);
  window.addEventListener("pagehide", save);
  renderSound();
  renderAll();
  if (state.stage > 1) message("Bem-vindo de volta! Continue na fase " + number(state.stage) + ".");
  save();
})();