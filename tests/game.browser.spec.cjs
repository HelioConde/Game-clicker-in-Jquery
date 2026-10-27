const { test, expect } = require("@playwright/test");

async function openWithSave(page, {money=0,owned=null,offlineHours=0,stage=1}={}) {
  await page.addInitScript(({money,owned,offlineHours,stage}) => {
    // A semente entra ANTES da inicialização do jogo. Recarregamentos
    // posteriores não reiniciam a partida e não são sobrescritos em pagehide.
    if (sessionStorage.getItem("__qa_seeded")) return;
    localStorage.clear();
    localStorage.setItem("gameClickerV3",JSON.stringify({
      version:3,money,owned:owned || Array(10).fill(0),
      sound:true,stage,kills:0,bosses:0,
      lastSeen:offlineHours?Date.now()-offlineHours*3600000:Date.now()
    }));
    sessionStorage.setItem("__qa_seeded","1");
  },{money,owned,offlineHours,stage});
  await page.goto("/");
}

test("inicializa tela e loja sem erros de JavaScript", async ({page},info) => {
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("#stageLabel")).toHaveText("FASE 1");
  await expect(page.locator("#enemyHpLabel")).toHaveText("12 / 12");
  await expect(page.locator(".item")).toHaveCount(10);
  await expect(page.locator(".upgrade-button")).toHaveCount(4);
  await expect(page.locator("#smashSkill")).toContainText("PRONTO");
  await expect(page.locator("#furySkill")).toContainText("PRONTO");
  await page.screenshot({path:"test-results/"+info.project.name+"-start.png",fullPage:true});
  expect(errors).toEqual([]);
});

test("um monstro derrotado concede moedas e avança a fase", async ({page}) => {
  const owned=Array(10).fill(0);owned[0]=12;
  await openWithSave(page,{owned});
  await page.locator("#attackButton").click();
  await expect(page.locator("#stageLabel")).toHaveText("FASE 2");
  await expect(page.locator("#valor")).toHaveText("10");
  await expect(page.locator("#killStat")).toHaveText("1");
  await page.reload();
  await expect(page.locator("#stageLabel")).toHaveText("FASE 2");
});

test("compras e habilidades alteram a partida e respeitam recarga", async ({page}) => {
  await openWithSave(page,{money:10000});
  if (await page.locator(".mobile-nav").isVisible()) await page.locator('[data-view="shop"].view-tab').click();
  await page.locator("#item5").click();
  if (await page.locator(".mobile-nav").isVisible()) await page.locator('[data-view="stats"].view-tab').click();
  await expect(page.locator("#dpsStat")).toHaveText("1");
  await page.locator(".upgrade-button").first().click();
  await expect(page.locator(".upgrade-button").first()).toContainText("Nível 1/25");
  if (await page.locator(".mobile-nav").isVisible()) await page.locator('[data-view="battle"].view-tab').click();
  await page.locator("#smashSkill").click();
  await expect(page.locator("#smashSkill")).toContainText(/\d+s/);
  await expect(page.locator("#smashSkill")).toBeDisabled();
  await page.locator("#furySkill").click();
  await expect(page.locator("#furySkill")).toContainText("ATIVA");
  await page.reload();
  if (await page.locator(".mobile-nav").isVisible()) await page.locator('[data-view="stats"].view-tab').click();
  await expect(page.locator(".upgrade-button").first()).toContainText("Nível 1/25");
});

test("bônus offline é concedido uma única vez", async ({page}) => {
  const owned=Array(10).fill(0);owned[4]=1;
  await openWithSave(page,{owned,offlineHours:1});
  await expect(page.locator("#offlineMessage")).toBeVisible();
  const first=await page.locator("#valor").textContent();
  expect(Number(first.replace(/\D/g,""))).toBeGreaterThanOrEqual(719);
  await page.reload();
  await expect(page.locator("#offlineMessage")).toBeHidden();
});

test("interface não apresenta rolagem horizontal em desktop ou mobile", async ({page},info) => {
  await page.goto("/");
  await expect(page.locator("#attackButton")).toBeVisible();
  const dimensions=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,
    viewport:document.documentElement.clientWidth
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport+1);
  await page.screenshot({path:"test-results/"+info.project.name+"-layout.png",fullPage:true});
});

test("o jogo ocupa uma única tela e todas as habilidades ficam visíveis", async ({page},info) => {
  const sizes=info.project.name==="desktop-chromium"
    ? [{width:1366,height:647},{width:1280,height:720},{width:1024,height:768},{width:1920,height:1080}]
    : [{width:390,height:844},{width:375,height:667},{width:320,height:568}];

  for (const {width,height} of sizes) {
    await page.setViewportSize({width,height});
    await page.goto("/");
    await expect(page.locator("#attackButton")).toBeVisible();
    await expect(page.locator("#smashSkill")).toBeVisible();
    await expect(page.locator("#furySkill")).toBeVisible();

    const metrics=await page.evaluate(()=>{
      const root=document.documentElement;
      const rect=id=>{const r=document.getElementById(id).getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height}};
      return {
        innerHeight:window.innerHeight,
        pageScrollHeight:root.scrollHeight,
        pageScrollWidth:root.scrollWidth,
        viewportWidth:root.clientWidth,
        app:rect("attackButton"),
        smash:rect("smashSkill"),
        fury:rect("furySkill")
      };
    });
    expect(metrics.pageScrollHeight,JSON.stringify({width,height,metrics})).toBeLessThanOrEqual(height+2);
    expect(metrics.pageScrollWidth,JSON.stringify({width,height,metrics})).toBeLessThanOrEqual(width+2);
    expect(metrics.app.height).toBeGreaterThan(60);
    expect(metrics.fury.bottom).toBeLessThanOrEqual(height-3);
    expect(metrics.smash.bottom).toBeLessThanOrEqual(height-3);
    await page.screenshot({path:"test-results/"+info.project.name+"-"+width+"x"+height+"-viewport.png"});
  }
});

test("listas internas continuam acessíveis sem rolar a página",async ({page})=>{
  await page.goto("/");
  if (await page.locator(".mobile-nav").isVisible()) {
    await page.locator('[data-view="shop"].view-tab').click();
    await expect(page.locator("#item10")).toBeVisible();
    await page.locator("#item10").scrollIntoViewIfNeeded();
    await page.locator('[data-view="stats"].view-tab').click();
    await expect(page.locator(".upgrade-button")).toHaveCount(4);
    await page.locator(".upgrade-button").last().scrollIntoViewIfNeeded();
    await page.locator('[data-view="battle"].view-tab').click();
  } else {
    await page.locator("#item10").scrollIntoViewIfNeeded();
    await page.locator(".upgrade-button").last().scrollIntoViewIfNeeded();
  }
  const outside=await page.evaluate(()=>({
    y:window.scrollY,
    doc:document.documentElement.scrollHeight,
    viewport:window.innerHeight
  }));
  expect(outside.y).toBe(0);
  expect(outside.doc).toBeLessThanOrEqual(outside.viewport+2);
  await expect(page.locator("#attackButton")).toBeVisible();
});

test("ajuda recolhida libera melhorias e pode ser expandida pelo teclado",async ({page})=>{
  await page.setViewportSize({width:1366,height:647});
  await page.goto("/");
  const help=page.locator("#helpPanel");
  await expect(help).not.toHaveAttribute("open");
  const panel=page.locator(".progress-panel");
  const container=page.locator("#upgradesList");
  await expect(page.locator(".upgrade-button")).toHaveCount(4);
  const sizes=await page.evaluate(()=>({
    panel:document.querySelector(".progress-panel").getBoundingClientRect().height,
    upgrades:document.querySelector("#upgradesList").clientHeight,
    content:document.querySelector("#upgradesList").scrollHeight
  }));
  expect(sizes.upgrades).toBeGreaterThan(50);
  expect(sizes.content).toBeGreaterThan(sizes.upgrades);
  await help.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(help).toHaveAttribute("open","");
  await expect(help.locator("p")).toBeVisible();
  await help.locator("summary").click();
  await expect(help).not.toHaveAttribute("open");
  await container.locator(".upgrade-button").last().scrollIntoViewIfNeeded();
  const metrics=await page.evaluate(()=>({
    bodyScroll:document.documentElement.scrollHeight,
    height:window.innerHeight,
    panelScroll:document.querySelector(".progress-panel").scrollTop,
    innerScroll:document.querySelector("#upgradesList").scrollTop
  }));
  expect(metrics.bodyScroll).toBeLessThanOrEqual(metrics.height+2);
  expect(metrics.innerScroll).toBeGreaterThan(0);
  expect(metrics.panelScroll).toBe(0);
  await expect(panel).toBeVisible();
});

test("moedas visuais independem de fonte emoji e mantêm valores",async ({page})=>{
  await page.goto("/");
  await expect(page.locator(".coin-icon")).toHaveCount(14);
  if (await page.locator(".mobile-nav").isVisible())
    await page.locator('.view-tab[data-view="shop"]').click();
  await expect(page.locator("#valor")).toHaveText("0");
  const visual=await page.evaluate(()=>{
    const item=document.querySelector(".item .coin-icon");
    const wallet=window.getComputedStyle(document.querySelector("#valor"),"::before");
    const style=window.getComputedStyle(item);
    return {
      coinWidth:item.getBoundingClientRect().width,
      coinBorderRadius:style.borderRadius,
      background:style.backgroundImage,
      walletContent:wallet.content,
      walletBackground:wallet.backgroundImage
    };
  });
  expect(visual.coinWidth).toBeGreaterThan(8);
  expect(visual.coinBorderRadius).toBe("50%");
  expect(visual.background).toContain("radial-gradient");
  expect(visual.walletBackground).toContain("radial-gradient");
  expect(visual.walletContent).not.toContain("🪙");
});

test("arena preserva sprites visíveis sem aumentar o documento",async ({page},info)=>{
  const {width,height}=info.project.name==="desktop-chromium"
    ? {width:1366,height:647}:{width:390,height:844};
  await page.setViewportSize({width,height});
  await page.goto("/");
  const m=await page.evaluate(()=>{
    const box=id=>{const e=document.getElementById(id),r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
    return {arena:box("attackButton"),hero:box("personagem"),enemy:box("enimei"),doc:document.documentElement.scrollHeight,screen:innerHeight};
  });
  expect(m.hero.height).toBeGreaterThan(110);
  expect(m.enemy.height).toBeGreaterThan(110);
  expect(m.hero.bottom).toBeLessThanOrEqual(m.arena.bottom+1);
  expect(m.enemy.bottom).toBeLessThanOrEqual(m.arena.bottom+1);
  expect(m.hero.top).toBeGreaterThanOrEqual(m.arena.top-2);
  expect(m.doc).toBeLessThanOrEqual(m.screen+2);
});

test("Etapa 6 carrega monstros e chefes diferentes, inclusive a fase 21", async ({browser}) => {
  for (const [stage,id,src,biome] of [
    [1,"shadow","monstro.gif","bosque"],
    [4,"slime","slime-bosque.svg","bosque"],
    [7,"bat","morcego-crepusculo.svg","bosque"],
    [10,"guardian","guardiao-bosque.svg","bosque"],
    [11,"golem","golem-pedra.svg","eclipse"],
    [20,"titan","colosso-eclipse.svg","eclipse"],
    [21,"golem","golem-pedra.svg","montanha"]
  ]) {
    const context=await browser.newContext();
    const page=await context.newPage();
    try {
      await openWithSave(page,{stage});
      await expect(page.locator("#stageLabel")).toHaveText("FASE "+stage);
      await expect(page.locator("#enemyName")).not.toBeEmpty();
      await expect(page.locator("#attackButton")).toHaveAttribute("data-enemy",id);
      await expect(page.locator("#attackButton")).toHaveAttribute("data-biome",biome);
      await expect(page.locator("#enimei")).toHaveAttribute("src",new RegExp(src.replace(".","\\.")+"$"));
      if(stage%10===0) await expect(page.locator("#bossBadge")).toBeVisible();
      else await expect(page.locator("#bossBadge")).toBeHidden();
      await expect.poll(()=>page.locator("#enimei").evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
      const screen=await page.evaluate(()=>({height:document.documentElement.scrollHeight,viewport:innerHeight}));
      expect(screen.height).toBeLessThanOrEqual(screen.viewport+2);
    } finally {await context.close();}
  }
});

test("novo monstro permanece visível após o golpe, sem voltar ao GIF antigo", async ({page}) => {
  await openWithSave(page,{stage:4});
  await expect(page.locator("#enimei")).toHaveAttribute("src",/slime-bosque\.svg$/);
  await page.locator("#attackButton").click();
  await expect(page.locator("#hitNumber")).toContainText("-");
  await expect(page.locator("#impactBurst")).toHaveClass(/show/);
  await page.waitForTimeout(480);
  await expect(page.locator("#enimei")).toHaveAttribute("src",/slime-bosque\.svg$/);
  await expect(page.locator("#attackButton")).toHaveAttribute("data-enemy","slime");
});

test("chefe usa sprite exclusivo e não remove habilidades da tela",async ({page})=>{
  await openWithSave(page,{stage:10});
  await expect(page.locator("#bossBadge")).toBeVisible();
  await expect(page.locator("#attackButton")).toHaveClass(/boss/);
  await expect(page.locator("#enimei")).toHaveAttribute("src",/guardiao-bosque\.svg$/);
  await expect(page.locator("#smashSkill")).toBeVisible();
  await expect(page.locator("#furySkill")).toBeVisible();
});


test("Etapa 7 aplica idle específico por inimigo sem rolar a tela",async ({page},info)=>{
  const stage=info.project.name==="desktop-chromium"?4:7;
  await openWithSave(page,{stage});
  const infoIdle=await page.evaluate(()=>{
    const arena=document.getElementById("attackButton");
    const img=document.getElementById("enimei");
    const style=getComputedStyle(img);
    return {name:style.animationName,viewport:innerHeight,height:document.documentElement.scrollHeight,enemy:arena.dataset.enemy};
  });
  expect(infoIdle.name).toBe(stage===4?"idle-slime":"idle-bat");
  expect(infoIdle.height).toBeLessThanOrEqual(infoIdle.viewport+2);
});

test("derrota de chefe exibe celebração e preserva o novo inimigo",async ({page})=>{
  const owned=Array(10).fill(0);owned[0]=300;
  await openWithSave(page,{stage:10,owned});
  await expect(page.locator("#enimei")).toHaveAttribute("src",/guardiao-bosque\.svg$/);
  await page.locator("#attackButton").click();
  await expect(page.locator("#victoryBanner")).toContainText("Guardião do Bosque");
  await expect(page.locator("#victoryBanner")).toHaveClass(/show/);
  await expect(page.locator("#defeatGhost")).toHaveClass(/boss/);
  await expect(page.locator("#defeatSprite")).toHaveAttribute("src",/guardiao-bosque\.svg$/);
  await expect(page.locator("#stageLabel")).not.toHaveText("FASE 10");
  await expect(page.locator("#enimei")).not.toHaveAttribute("src",/guardiao-bosque\.svg$/);
  await page.reload();
  await expect(page.locator("#bossStat")).toHaveText("1");
});

test("sem animação excessiva quando usuário prefere movimento reduzido",async ({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await openWithSave(page,{stage:4});
  const anim=await page.locator("#enimei").evaluate(el=>getComputedStyle(el).animationName);
  expect(anim).toBe("none");
  const owned=Array(10).fill(0);
  await expect(page.locator("#attackButton")).toBeVisible();
  const dim=await page.evaluate(()=>({doc:document.documentElement.scrollHeight,h:innerHeight}));
  expect(dim.doc).toBeLessThanOrEqual(dim.h+2);
});

test("HP após fase 30 permanece estável em recargas do save migrado",async ({page})=>{
  await page.addInitScript(()=>{
    if(sessionStorage.getItem("__phase40"))return;
    const old=Math.ceil(12*Math.pow(1.22,39)*3.5);
    localStorage.clear();
    localStorage.setItem("gameClickerV3",JSON.stringify({
      version:3,money:400,owned:Array(10).fill(0),sound:false,
      stage:40,hp:Math.floor(old/4),kills:39,bosses:3,lastSeen:Date.now()
    }));
    sessionStorage.setItem("__phase40","1");
  });
  await page.goto("/");
  const first=await page.evaluate(()=>{
    const s=JSON.parse(localStorage.getItem("gameClickerV3"));
    return {hp:s.hp,max:Number(document.getElementById("enemyHpBar").max),balance:s.balanceVersion}
  });
  expect(first.balance).toBe(2);
  expect(Math.abs(first.hp/first.max-.25)).toBeLessThan(.01);
  await page.reload();
  const second=await page.evaluate(()=>JSON.parse(localStorage.getItem("gameClickerV3")).hp);
  expect(second).toBe(first.hp);
});

test("Etapa 8 carrega spritesheet real de quatro quadros sem perder o sprite original", async ({page})=>{
  await openWithSave(page,{stage:4});
  await expect(page.locator("#enimei")).toHaveAttribute("src",/slime-bosque\.svg$/);
  const details=await page.evaluate(async()=>{
    const frame=document.getElementById("enemyFrame");
    const pseudo=getComputedStyle(frame,"::before");
    const sheet=window.GameCore.enemyFor(4).sheet;
    const response=await fetch(sheet);
    const source=await response.text();
    const w=source.match(/viewBox="0 0 (\d+) (\d+)"/);
    const raw=await (await fetch(window.GameCore.enemyFor(4).sprite)).text();
    const orig=raw.match(/viewBox="0 0 (\d+) (\d+)"/);
    return {status:response.status,frames:+w[1]/+orig[1],
      duration:pseudo.animationDuration,name:pseudo.animationName,
      sheet:frame.dataset.sheet,background:pseudo.backgroundImage,opacity:getComputedStyle(document.getElementById("enimei")).opacity};
  });
  expect(details.status).toBe(200);
  expect(details.frames).toBe(4);
  expect(details.name).toBe("enemy-sprites-4");
  expect(details.sheet).toBe("true");
  expect(details.background).toContain("slime-bosque-sheet.svg");
  expect(details.opacity).toBe("0");
});

test("Etapa 8 permite esquivar do chefe e pune golpe não defendido",async ({page})=>{
  await page.clock.install();
  await openWithSave(page,{stage:10});
  await page.clock.runFor(8300);
  await expect(page.locator("#bossGuard")).toBeVisible();
  await expect(page.locator("#bossTelegraph")).toContainText("pressione E");
  await page.keyboard.press("e");
  await expect(page.locator("#bossGuard")).toBeDisabled();
  await page.clock.runFor(2500);
  await expect(page.locator("#attackButton")).not.toHaveClass(/boss-stunned/);
  await expect(page.locator("#battleMessage")).toContainText("esquivou");
  await page.clock.runFor(8200);
  await expect(page.locator("#bossGuard")).toBeVisible();
  await page.clock.runFor(2800);
  await expect(page.locator("#attackButton")).toHaveClass(/boss-stunned/);
  const hp=await page.locator("#enemyHpBar").evaluate(el=>el.value);
  await page.locator("#attackButton").click();
  expect(await page.locator("#enemyHpBar").evaluate(el=>el.value)).toBe(hp);
  await page.clock.runFor(1400);
  await page.locator("#attackButton").click();
  expect(Number(await page.locator("#enemyHpBar").evaluate(el=>el.value))).toBeLessThan(Number(hp));
});

test("Etapa 8 mantém as três habilidades dentro da viewport durante ataque do chefe",async ({page},info)=>{
  await page.clock.install();
  await page.setViewportSize(info.project.name==="desktop-chromium"
    ? {width:1366,height:647}:{width:390,height:844});
  await openWithSave(page,{stage:10});
  await page.clock.runFor(8300);
  for (const id of ["smashSkill","furySkill","bossGuard"]) {
    const control=page.locator("#"+id);
    await expect(control).toBeVisible();
    const bounds=await control.boundingBox();
    const metrics=await page.evaluate(()=>({width:innerWidth,height:innerHeight,
      scrollHeight:document.documentElement.scrollHeight,scrollWidth:document.documentElement.scrollWidth}));
    expect(bounds.y+bounds.height).toBeLessThanOrEqual(metrics.height-2);
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.height+2);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width+2);
  }
});

test("Etapa 8 respeita movimento reduzido e exibe pose estática da spritesheet",async ({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await openWithSave(page,{stage:20});
  const details=await page.evaluate(()=>{
    const el=document.getElementById("enemyFrame");
    const style=getComputedStyle(el,"::before");
    return {animation:style.animationName,position:style.backgroundPosition};
  });
  expect(details.animation).toBe("none");
  expect(details.position).toBe("0% 0%");
});


test("Etapa 8.1 mantém escala coerente e alinhamento pelo chão",async ({browser},info)=>{
  const mobile=info.project.name==="mobile-chromium";
  const viewport=mobile?{width:390,height:844}:{width:1366,height:647};
  async function inspect(stage){
    const context=await browser.newContext({viewport});
    const page=await context.newPage();
    try {
      await openWithSave(page,{stage});
      return await page.evaluate(()=>{
        const bounds=id=>{
          const r=document.getElementById(id).getBoundingClientRect();
          return {width:r.width,height:r.height,top:r.top,bottom:r.bottom};
        };
        return {
          hero:bounds("personagem"),enemy:bounds("enemyFrame"),
          arena:bounds("attackButton"),
          pageHeight:document.documentElement.scrollHeight,viewport:innerHeight
        };
      });
    } finally {await context.close();}
  }
  const bat=await inspect(32);
  const slime=await inspect(4);
  const golem=await inspect(21);
  const boss=await inspect(40);
  expect(bat.enemy.width).toBeLessThan(bat.hero.width*.85);
  expect(slime.enemy.width).toBeLessThan(slime.hero.width*.9);
  expect(golem.enemy.width).toBeGreaterThan(bat.enemy.width);
  expect(boss.enemy.width).toBeGreaterThan(golem.enemy.width);
  for (const item of [bat,slime,golem,boss]){
    expect(Math.abs(item.hero.bottom-item.enemy.bottom)).toBeLessThanOrEqual(4);
    expect(item.enemy.top).toBeGreaterThanOrEqual(item.arena.top-3);
    expect(item.enemy.bottom).toBeLessThanOrEqual(item.arena.bottom+3);
    expect(item.pageHeight).toBeLessThanOrEqual(item.viewport+2);
  }
});

test("Etapa 8.1 mantém itens não compráveis e melhorias legíveis",async ({page})=>{
  await openWithSave(page,{money:0});
  await expect(page.locator("#item10")).toHaveClass(/unaffordable/);
  const legibility=await page.evaluate(()=>{
    const shop=document.querySelector("#item10");
    const upgrade=document.querySelector(".upgrade-button:disabled");
    const css=e=>({opacity:getComputedStyle(e).opacity,color:getComputedStyle(e).color});
    return {
      shop:css(shop),name:css(shop.querySelector(".item-name")),
      upgrade:css(upgrade),heading:css(upgrade.querySelector(".upgrade-heading")),
      description:css(upgrade.querySelector("small"))
    };
  });
  expect(legibility.shop.opacity).toBe("1");
  expect(legibility.name.opacity).toBe("1");
  expect(legibility.upgrade.opacity).toBe("1");
  expect(legibility.heading.color).not.toBe("rgb(0, 0, 0)");
  expect(legibility.description.color).not.toBe("rgb(0, 0, 0)");
});

test("Etapa 8.1 mostra recarga com segundos e progresso sem mudar altura",async ({page})=>{
  await page.clock.install();
  await openWithSave(page,{stage:1});
  await page.locator("#smashSkill").click();
  await expect(page.locator("#smashSkill")).toHaveClass(/cooldown/);
  await expect(page.locator("#smashSkill .skill-status")).toContainText("Recarrega em 15s");
  const before=await page.locator("#smashSkill").evaluate(el=>getComputedStyle(el).getPropertyValue("--cooldown-progress").trim());
  await page.clock.runFor(5000);
  await expect(page.locator("#smashSkill .skill-status")).toContainText("Recarrega em 10s");
  const after=await page.locator("#smashSkill").evaluate(el=>getComputedStyle(el).getPropertyValue("--cooldown-progress").trim());
  expect(parseFloat(after)).toBeGreaterThan(parseFloat(before));
  await page.locator("#furySkill").click();
  await expect(page.locator("#furySkill .skill-status")).toContainText("ATIVA");
  await page.clock.runFor(10000);
  await expect(page.locator("#furySkill .skill-status")).toContainText("Recarrega em");
  await expect(page.locator("#smashSkill .skill-status")).toHaveText("PRONTO");
  const sizes=await page.evaluate(()=>({height:document.documentElement.scrollHeight,
    viewport:innerHeight,width:document.documentElement.scrollWidth,viewportWidth:innerWidth}));
  expect(sizes.height).toBeLessThanOrEqual(sizes.viewport+2);
  expect(sizes.width).toBeLessThanOrEqual(sizes.viewportWidth+2);
});


test("Etapa 9 exibe combo por cliques ritmados e o reinicia quando o jogador para",async ({page})=>{
  const owned=Array(10).fill(0);owned[0]=20;
  await openWithSave(page,{stage:21,owned});
  await page.locator("#attackButton").click();
  await page.waitForTimeout(380);
  await page.locator("#attackButton").click();
  await expect(page.locator("#comboBadge")).toContainText("COMBO 2");
  await page.waitForTimeout(380);
  await page.locator("#attackButton").click();
  await expect(page.locator("#comboBadge")).toContainText("COMBO 3");
  await page.waitForTimeout(2600);
  await expect(page.locator("#comboBadge")).toBeHidden();
  const dimensions=await page.evaluate(()=>({doc:document.documentElement.scrollHeight,viewport:innerHeight}));
  expect(dimensions.doc).toBeLessThanOrEqual(dimensions.viewport+2);
});

test("Etapa 9 permite resgatar contrato concluído e inicia próximo objetivo",async ({page})=>{
  await page.addInitScript(()=>{
    if(sessionStorage.getItem("__quest9"))return;
    localStorage.clear();
    const old=window.localStorage;
    old.setItem("gameClickerV3",JSON.stringify({
      version:3,balanceVersion:2,stage:3,hp:1,money:0,
      owned:Array(10).fill(0),kills:2,bosses:0,
      hunt:{cycle:0,progress:2,ready:false,reward:0},lastSeen:Date.now()
    }));
    sessionStorage.setItem("__quest9","1");
  });
  await page.goto("/");
  await expect(page.locator("#huntText")).toContainText("2/3");
  await page.locator("#attackButton").click();
  await expect(page.locator("#huntText")).toContainText("Missão concluída");
  await expect(page.locator("#huntClaim")).toBeVisible();
  await page.locator("#huntClaim").click();
  await expect(page.locator("#huntText")).toContainText("8 golpes manuais");
  const money=Number((await page.locator("#valor").textContent()).replace(/\D/g,""));
  expect(money).toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator("#huntText")).toContainText("8 golpes manuais");
  await expect(page.locator("#huntClaim")).toBeHidden();
});

test("Etapa 9 abre baú da fase 5, pausa combate e conserva escolha no save",async ({page})=>{
  await page.addInitScript(()=>{
    if(sessionStorage.getItem("__chest9"))return;
    localStorage.clear();
    localStorage.setItem("gameClickerV3",JSON.stringify({
      version:3,balanceVersion:2,stage:5,hp:1,money:0,
      owned:Array(10).fill(0),kills:4,bosses:0,lastSeen:Date.now()
    }));
    sessionStorage.setItem("__chest9","1");
  });
  await page.goto("/");
  await page.locator("#attackButton").click();
  await expect(page.locator("#chestPanel")).toBeVisible();
  await expect(page.locator("#attackButton")).toBeDisabled();
  await expect(page.locator("#smashSkill")).toBeDisabled();
  const first=await page.evaluate(()=>JSON.parse(localStorage.getItem("gameClickerV3")).pendingChests);
  expect(first).toBe(1);
  await page.reload();
  await expect(page.locator("#chestPanel")).toBeVisible();
  await page.locator('[data-chest="engine"]').click();
  await expect(page.locator("#chestPanel")).toBeHidden();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("gameClickerV3")));
  expect(saved.upgrades.engine).toBe(1);
  expect(saved.pendingChests).toBe(0);
  expect(saved.chestsOpened).toBe(1);
  await page.reload();
  await expect(page.locator("#chestPanel")).toBeHidden();
  await expect(page.locator("#stageLabel")).toHaveText("FASE 6");
});

test("Etapa 9 mantém missão e baú dentro da única tela em desktop e celular",async ({page},info)=>{
  const viewport=info.project.name==="desktop-chromium"
    ? {width:1366,height:647}:{width:390,height:844};
  await page.setViewportSize(viewport);
  await page.addInitScript(()=>{
    if(sessionStorage.getItem("__layoutChest9"))return;
    localStorage.clear();
    localStorage.setItem("gameClickerV3",JSON.stringify({
      version:3,balanceVersion:2,stage:6,hp:5,money:20,
      owned:Array(10).fill(0),kills:5,bosses:0,pendingChests:1,lastSeen:Date.now()
    }));
    sessionStorage.setItem("__layoutChest9","1");
  });
  await page.goto("/");
  await expect(page.locator("#chestPanel")).toBeVisible();
  await expect(page.locator("#huntText")).toBeVisible();
  const header=await page.locator(".enemy-header").boundingBox();
  const overlay=await page.locator("#chestPanel").boundingBox();
  expect(overlay.y).toBeGreaterThanOrEqual(header.y+header.height+3);
  for(const button of await page.locator("#chestPanel [data-chest]").all()){
    const box=await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y+box.height).toBeLessThanOrEqual(viewport.height-2);
  }
  const geometry=await page.evaluate(()=>({
    totalHeight:document.documentElement.scrollHeight,
    totalWidth:document.documentElement.scrollWidth,
    h:innerHeight,w:innerWidth
  }));
  expect(geometry.totalHeight).toBeLessThanOrEqual(geometry.h+2);
  expect(geometry.totalWidth).toBeLessThanOrEqual(geometry.w+2);
});

test("backup exporta um save válido e permite restaurar em outra sessão",async ({page})=>{
  await openWithSave(page,{money:875,stage:7});
  await page.locator("#backupMenu summary").click();
  const downloadPromise=page.waitForEvent("download");
  await page.locator("#backupExport").click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe("game-clicker-backup.json");
  const fs=require("node:fs");
  const contents=JSON.parse(fs.readFileSync(await download.path(),"utf8"));
  expect(contents.application).toBe("game-clicker");
  expect(contents.formatVersion).toBe(1);
  expect(contents.save.money).toBe(875);
  expect(contents.save.stage).toBe(7);
  // Simula a transferência para outra partida, preservando o backup exportado.
  const transfer=JSON.parse(JSON.stringify(contents));
  transfer.save.stage=3;
  transfer.save.hp=1;
  transfer.save.money=123;
  page.once("dialog", dialog=>dialog.accept());
  await page.locator("#backupImport").setInputFiles({
    name:"game-clicker-backup.json",
    mimeType:"application/json",
    buffer:Buffer.from(JSON.stringify(transfer))
  });
  await expect(page.locator("#stageLabel")).toHaveText("FASE 3");
  await expect(page.locator("#valor")).toHaveText("123");
  await page.reload();
  await expect(page.locator("#stageLabel")).toHaveText("FASE 3");
});
test("backup rejeita arquivo inválido preservando o save local",async ({page})=>{
  await openWithSave(page,{money:100,stage:4});
  await page.locator("#backupMenu summary").click();
  await page.locator("#backupImport").setInputFiles({
    name:"corrompido.json",
    mimeType:"application/json",
    buffer:Buffer.from(JSON.stringify({application:"game-clicker",formatVersion:1,save:{version:3,owned:[1]}}))
  });
  await expect(page.locator("#backupStatus")).toContainText("Importação rejeitada");
  await expect(page.locator("#stageLabel")).toHaveText("FASE 4");
  await page.reload();
  await expect(page.locator("#stageLabel")).toHaveText("FASE 4");
});
test("menu de backup preserva área do jogo e navegação por teclado",async ({page},info)=>{
  await page.goto("/");
  await page.locator("#backupMenu summary").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#backupExport")).toBeVisible();
  const sizes=await page.evaluate(()=>({height:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth,h:innerHeight,w:innerWidth}));
  expect(sizes.height).toBeLessThanOrEqual(sizes.h+2);
  expect(sizes.width).toBeLessThanOrEqual(sizes.w+2);
  await page.screenshot({path:"test-results/"+info.project.name+"-backup.png",fullPage:true,animations:"disabled"});
});
