"use strict";
(() => {
  const core = window.GameCore;
  const $ = id => document.getElementById(id);
  const read = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const readJSON = key => { try { return JSON.parse(read(key) || "null"); } catch (_) { return null; } };
  const legacy = { dinheiro:read("dinheiro"), efetioSom:read("efetioSom") };
  for (let i = 1; i <= 10; i++) legacy["arma" + i] = read("arma" + i);
  const state = core.normalize(readJSON("gameClickerV3") || readJSON("gameClickerV2"), legacy);
  const offline = core.claimOffline(state, Date.now());
  const number = n => Math.floor(n).toLocaleString("pt-BR");
  const sound = id => {
    if (!state.sound) return;
    const audio = $(id);
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
  };
  const status = $("saveStatus");
  function save() {
    try {
      state.lastSeen = Date.now();
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
    $("critStat").textContent = Math.round(core.critChance(state) * 100) + "%";
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
  function renderUpgrades() {
    const container = $("upgradesList");
    const elements = Object.entries(core.UPGRADES).map(([key, item]) => {
      const level = state.upgrades[key];
      const cost = core.upgradePrice(state, key);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "upgrade-button";
      button.disabled = cost === null || state.money < cost;
      button.setAttribute("aria-label", "Melhoria " + item.name + ", nível " + level +
        (cost === null ? ", máximo atingido" : ", preço " + number(cost) + " moedas"));
      const title = document.createElement("span");
      title.className = "upgrade-heading";
      title.textContent = item.name + " · Nível " + level + "/" + item.max;
      const desc = document.createElement("small");
      desc.textContent = item.description;
      const amount = document.createElement("strong");
      amount.textContent = cost === null ? "MÁXIMO" : "🪙 " + number(cost);
      button.append(title, desc, amount);
      button.addEventListener("click", () => {
        if (!core.buyUpgrade(state, key)) { sound("erro"); return; }
        sound("dinheiroSom");
        message(item.name + " evoluiu para o nível " + state.upgrades[key] + "!");
        renderAll();
        save();
      });
      return button;
    });
    container.replaceChildren(...elements);
  }
  function renderSkills(now = Date.now()) {
    for (const [key, id] of [["smash", "smashSkill"], ["fury", "furySkill"]]) {
      const button = $(id);
      const remain = Math.max(0, (state.skillReady[key] - now) / 1000);
      const isFury = key === "fury";
      const active = isFury && core.furyActive(state, now);
      button.disabled = remain > 0;
      button.classList.toggle("active", active);
      const label = isFury ? "🔥 Fúria (2× por 10s)" : "⚡ Golpe poderoso (5×)";
      button.textContent = active
        ? label + " · ATIVA"
        : remain > 0 ? label + " · " + Math.ceil(remain) + "s" : label + " · PRONTO";
      button.setAttribute("aria-label", (isFury ? "Ativar Fúria" : "Ativar Golpe poderoso") +
        (remain > 0 ? ", disponível em " + Math.ceil(remain) + " segundos" : ", pronto"));
    }
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
  function renderAll() { renderStats(); renderShop(); renderUpgrades(); renderEnemy(); renderSkills(); }
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
    renderUpgrades();
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
    const hit = core.strike(state, Date.now());
    const damage = hit.damage;
    const result = hit.result;
    $("personagem").src = "img/attack.gif";
    $("enimei").src = "img/monstro_dano.png";
    const arena = $("attackButton");
    arena.classList.add("hit");
    const hitNumber = $("hitNumber");
    hitNumber.textContent = (hit.critical ? "CRÍTICO! " : "") + "-" + number(damage);
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
  for (const [key, id] of [["smash","smashSkill"],["fury","furySkill"]]) {
    $(id).addEventListener("click", () => {
      const effect = core.activateSkill(state, key, Date.now());
      if (!effect.ok) { renderSkills(); return; }
      sound("espada");
      if (key === "smash") {
        message("Golpe poderoso! " + number(effect.damage) + " de dano.");
        renderEnemy();
        onResults(effect.result);
      } else {
        message("Fúria ativada! Dano dobrado por 10 segundos.");
      }
      renderAll();
      save();
    });
  }
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
    renderSkills(Date.now());
    const power = core.dps(state) * (core.furyActive(state, Date.now()) ? 2 : 1);
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
  if (offline.gold > 0) {
    $("offlineMessage").hidden = false;
    $("offlineMessage").textContent = "Enquanto você esteve fora: +" + number(offline.gold) + " moedas (" + number(Math.floor(offline.seconds / 60)) + " min).";
  }
  if (state.stage > 1) message("Bem-vindo de volta! Continue na fase " + number(state.stage) + ".");
  save();
})();