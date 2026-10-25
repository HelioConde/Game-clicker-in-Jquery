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
  await page.locator("#item5").click();
  await expect(page.locator("#dpsStat")).toHaveText("1");
  await page.locator(".upgrade-button").first().click();
  await expect(page.locator(".upgrade-button").first()).toContainText("Nível 1/25");
  await page.locator("#smashSkill").click();
  await expect(page.locator("#smashSkill")).toContainText(/\d+s/);
  await expect(page.locator("#smashSkill")).toBeDisabled();
  await page.locator("#furySkill").click();
  await expect(page.locator("#furySkill")).toContainText("ATIVA");
  await page.reload();
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
