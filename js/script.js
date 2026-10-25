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
  const bossGuard = $("bossGuard");
  const bossBattle = {
    stage: state.stage, started: performance.now(), guarded: false,
    stunUntil: 0, hiddenAt: 0
  };
  // Em telas pequenas, uma área por vez mantém o combate inteiro visível.
  // Não altera a partida, o save nem a disposição com três colunas no desktop.
  const app = document.querySelector(".app");
  const viewTabs = Array.from(document.querySelectorAll(".view-tab"));
  function selectView(view) {
    if (!["battle", "stats", "shop"].includes(view)) return;
    app.dataset.view = view;
    for (const button of viewTabs) {
      const current = button.dataset.view === view;
      button.classList.toggle("is-active", current);
      button.setAttribute("aria-pressed", String(current));
    }
    if (view === "battle") $("attackButton").focus({ preventScroll: true });
  }
  viewTabs.forEach(button => button.addEventListener("click", () => selectView(button.dataset.view)));

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
        '</small><strong class="price"><span class="coin-icon" aria-hidden="true"></span>' + number(price) + '</strong>';
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
      amount.innerHTML = cost === null ? "MÁXIMO" : '<span class="coin-icon" aria-hidden="true"></span>' + number(cost);
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
      button.classList.toggle("cooldown", remain > 0 && !active);
      const name = isFury ? "🔥 Fúria" : "⚡ Golpe poderoso";
      const info = isFury ? "2× por 10s" : "Dano 5×";
      const activeSeconds = active ? Math.ceil(Math.max(0,(state.furyUntil - now)/1000)) : 0;
      const statusText = active ? "ATIVA · " + activeSeconds + "s"
        : remain > 0 ? "Recarrega em " + Math.ceil(remain) + "s" : "PRONTO";
      const progress = remain > 0
        ? Math.round(100 * (1 - Math.min(1, remain * 1000 / core.SKILLS[key].cooldown))) : 0;
      button.style.setProperty("--cooldown-progress", progress + "%");
      // Somente conteúdo estático; valores são produzidos pelo próprio estado do jogo.
      // Manter o elemento button estável evita perder foco durante a atualização.
      const caption = document.createElement("span");
      caption.className = "skill-name";
      caption.textContent = name + " · " + info;
      const badge = document.createElement("span");
      badge.className = "skill-status";
      badge.textContent = statusText;
      button.replaceChildren(caption, badge);
      button.setAttribute("aria-label", name.replace(/^[^\\wÀ-ÿ]+/, "").trim() +
        (active ? ", ativa por mais " + activeSeconds + " segundos"
          : remain > 0 ? ", recarga em " + Math.ceil(remain) + " segundos" : ", pronto"));
    }
  }
  function renderEnemy() {
    const enemy = core.enemyFor(state.stage);
    const arena = $("attackButton");
    const sprite = $("enimei");
    if (sprite.dataset.enemyStage !== String(enemy.stage)) {
      sprite.src = enemy.sprite;
      sprite.dataset.enemyStage = String(enemy.stage);
      arena.dataset.biome = enemy.biome;
      arena.dataset.enemy = enemy.id;
      const frame = $("enemyFrame");
      frame.dataset.sheet = enemy.sheet ? "true" : "false";
      if (enemy.sheet) {
        const assetUrl = new URL(enemy.sheet, document.baseURI).href;
        frame.style.setProperty("--enemy-spritesheet", 'url("' + assetUrl + '")');
      }
      else frame.style.removeProperty("--enemy-spritesheet");
      // Ataques especiais são reiniciados sempre que a fase mudar.
      bossBattle.stage = enemy.stage;
      bossBattle.started = performance.now();
      bossBattle.guarded = false;
      bossBattle.stunUntil = 0;
      arena.classList.remove("boss-warning","boss-stunned");
      $("bossTelegraph").textContent = "";
      bossGuard.hidden = true;
      bossGuard.disabled = false;
      bossGuard.textContent = "🛡️ Esquivar (E)";
      document.querySelector(".skill-bar").classList.remove("has-guard");
    }
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
  let waveTimer = null;
  function showWaveNotice(enemy, bossDown = false) {
    const notice = $("waveNotice");
    notice.textContent = bossDown ? "CHEFE DERROTADO!" :
      enemy.boss ? "CHEFE · " + enemy.name : "FASE " + enemy.stage + " · " + enemy.name;
    notice.classList.remove("show");
    void notice.offsetWidth;
    notice.classList.add("show");
    clearTimeout(waveTimer);
    waveTimer = setTimeout(() => notice.classList.remove("show"), 1100);
  }
  function animateImpact(points, critical = false) {
    const arena = $("attackButton");
    const label = $("hitNumber");
    label.textContent = (critical ? "CRÍTICO! " : "") + "-" + number(points);
    label.classList.remove("show", "critical");
    arena.classList.remove("hit", "critical");
    const burst = $("impactBurst");
    burst.classList.remove("show");
    void label.offsetWidth;
    label.classList.add("show");
    if (critical) label.classList.add("critical");
    arena.classList.add("hit");
    if (critical) arena.classList.add("critical");
    burst.classList.add("show");
  }
  function animateDefeat(result) {
    if (!result.kills || !result.defeated) return;
    const fallen = result.defeatedBoss || result.defeated;
    const arena = $("attackButton");
    const monster = $("enimei");
    const ghost = $("defeatGhost");
    const sprite = $("defeatSprite");
    const arenaRect = arena.getBoundingClientRect();
    const enemyRect = monster.getBoundingClientRect();
    // Snapshot da criatura derrotada: o novo inimigo pode aparecer
    // imediatamente, enquanto a imagem antiga dissolve sem bloquear cliques.
    ghost.style.left = (enemyRect.left - arenaRect.left) + "px";
    ghost.style.top = (enemyRect.top - arenaRect.top) + "px";
    ghost.style.width = enemyRect.width + "px";
    ghost.style.height = enemyRect.height + "px";
    sprite.src = fallen.sprite;
    ghost.classList.remove("show","boss");
    void ghost.offsetWidth;
    if (fallen.boss) ghost.classList.add("boss");
    ghost.classList.add("show");
    if (result.bosses) {
      sound("levelUpSom");
      const banner = $("victoryBanner");
      banner.textContent = fallen.name + " derrotado!";
      banner.classList.remove("show");
      void banner.offsetWidth;
      banner.classList.add("show");
    }
  }
  function dodgeBoss() {
    if (bossGuard.hidden || bossGuard.disabled || bossBattle.guarded) return;
    bossBattle.guarded = true;
    bossGuard.disabled = true;
    bossGuard.textContent = "✓ Esquivado";
    message("Esquiva preparada! O golpe do chefe não vai interromper seus ataques.");
  }
  bossGuard.addEventListener("click",dodgeBoss);
  document.addEventListener("keydown",event=>{
    if(event.key.toLowerCase() !== "e" || event.repeat ||
       event.altKey || event.ctrlKey || event.metaKey ||
       ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)) return;
    if (!bossGuard.hidden && !bossGuard.disabled) {
      event.preventDefault(); dodgeBoss();
    }
  });
  function updateBossAttack(now) {
    const monster=core.enemyFor(state.stage), arena=$("attackButton");
    if (!monster.boss) {
      arena.classList.remove("boss-warning","boss-stunned");
      bossGuard.hidden=true;
      document.querySelector(".skill-bar").classList.remove("has-guard");
      return;
    }
    if (now < bossBattle.stunUntil) arena.classList.add("boss-stunned");
    else arena.classList.remove("boss-stunned");
    const elapsed=Math.max(0,now-bossBattle.started);
    if (elapsed >= 10500) {
      arena.classList.remove("boss-warning");
      bossGuard.hidden=true;
      document.querySelector(".skill-bar").classList.remove("has-guard");
      if (bossBattle.guarded) {
        message("Você esquivou do ataque de " + monster.name + "!");
      } else {
        bossBattle.stunUntil=now+1250;
        arena.classList.add("boss-stunned");
        message(monster.name + " atingiu você! Ataques manuais interrompidos por 1,25 s.");
        sound("erro");
      }
      bossBattle.started=now;
      bossBattle.guarded=false;
      bossGuard.disabled=false;
      bossGuard.textContent="🛡️ Esquivar (E)";
      return;
    }
    if (elapsed >= 8000) {
      arena.classList.add("boss-warning");
      $("bossTelegraph").textContent="⚠ Ataque de " + monster.name + " — pressione E para esquivar!";
      bossGuard.hidden=false;
      document.querySelector(".skill-bar").classList.add("has-guard");
    } else {
      arena.classList.remove("boss-warning");
      bossGuard.hidden=true;
      document.querySelector(".skill-bar").classList.remove("has-guard");
    }
  }
  function onResults(result) {
    if (!result.kills) return;
    animateDefeat(result);
    if (!result.bosses) sound("dinheiroSom");
    message(result.bosses > 0
      ? "Chefe derrotado! +" + number(result.gold) + " moedas · Fase " + number(state.stage) + " liberada!"
      : result.kills === 1
        ? "Monstro derrotado! +" + number(result.gold) + " moedas. Próxima fase!"
        : result.kills + " criaturas derrotadas! +" + number(result.gold) + " moedas.");
    renderShop();
    renderUpgrades();
    renderStats();
    const next = core.enemyFor(state.stage);
    showWaveNotice(next, result.bosses > 0);
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
    if (animating || performance.now()<bossBattle.stunUntil) return;
    animating = true;
    const hit = core.strike(state, Date.now());
    const damage = hit.damage;
    const result = hit.result;
    $("personagem").src = "img/attack.gif";
    animateImpact(damage, hit.critical);
    const arena = $("attackButton");
    sound("espada");
    renderEnemy();
    onResults(result);
    save();
    clearTimeout(attackTimer);
    attackTimer = setTimeout(() => {
      $("personagem").src = "img/stop.png";
      arena.classList.remove("hit", "critical");
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
        animateImpact(effect.damage, true);
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
  document.addEventListener("visibilitychange", () => {
    const now=performance.now();
    last=now;
    if(document.hidden) {
      bossBattle.hiddenAt=now; save();
    } else if(bossBattle.hiddenAt) {
      bossBattle.started+=Math.max(0,now-bossBattle.hiddenAt);
      bossBattle.stunUntil+=bossBattle.stunUntil>now ? Math.max(0,now-bossBattle.hiddenAt):0;
      bossBattle.hiddenAt=0;
    }
  });
  setInterval(() => {
    const now = performance.now();
    const elapsed = Math.min(0.5, Math.max(0, (now - last) / 1000));
    last = now;
    if (document.hidden) return;
    updateBossAttack(now);
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