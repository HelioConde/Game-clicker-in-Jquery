"use strict";
(() => {
const $=id=>document.getElementById(id);
const defs=[["Stone",25,1,0],["Blade",50,2,0],["Sword",100,3,0],["Sword Iron",200,4,0],["Sword Fire",400,0,1],["Razor Sword",600,6,0],["Ruins Sword",800,7,0],["Fate Sword",1000,8,0],["Obsidian Sword",1200,9,0],["Ragnarok Sword",1400,0,2]];
const num=v=>{const n=Number(v);return Number.isFinite(n)&&n>=0?Math.min(n,1e15):0;};
let data;
try{data=JSON.parse(localStorage.getItem("gameClickerV2")||"null")}catch(e){data=null}
if(!data||!Array.isArray(data.owned)||data.version!==2) data={version:2,money:num(localStorage.getItem("dinheiro")),owned:defs.map((_,i)=>Math.floor(num(localStorage.getItem("arma"+(i+1)))/(i+1))),sound:localStorage.getItem("efetioSom")!=="off"};
data.money=num(data.money);
data.owned=defs.map((_,i)=>Math.floor(num(data.owned[i])));
const money=n=>Math.floor(n).toLocaleString("pt-BR");
const clickPower=()=>1+defs.reduce((total,d,i)=>total+d[2]*data.owned[i],0);
const passive=()=>defs.reduce((total,d,i)=>total+d[3]*data.owned[i],0);
const cost=i=>Math.ceil(defs[i][1]*Math.pow(1.18,data.owned[i]));
const save=()=>{try{localStorage.setItem("gameClickerV2",JSON.stringify(data));localStorage.setItem("dinheiro",String(data.money));localStorage.setItem("dps",String(passive()));localStorage.setItem("efetioSom",data.sound?"on":"off");data.owned.forEach((n,i)=>localStorage.setItem("arma"+(i+1),String(n*(i+1))));}catch(e){console.warn("Save indisponível",e)}};
const sound=id=>{if(!data.sound)return;const a=$(id);if(a){a.currentTime=0;a.play().catch(()=>{})}};
const render=()=>{
 $("valor").textContent="🪙 "+money(data.money);
 $("stats").textContent="Clique: "+money(clickPower())+" | Por segundo: "+money(passive());
 defs.forEach((d,i)=>{const el=$("item"+(i+1));const p=cost(i);el.classList.toggle("affordable",data.money>=p);el.classList.toggle("unaffordable",data.money<p);el.innerHTML='<img src="img/arma'+(i+1)+'.png" alt=""><span>'+d[0]+'</span><small>Nível '+data.owned[i]+' · '+(d[3]?'+'+d[3]+'/s':'+'+d[2]+'/clique')+'</small><strong>🪙 '+money(p)+'</strong>';});
};
defs.forEach((d,i)=>$("item"+(i+1)).addEventListener("click",()=>{const p=cost(i);if(data.money<p){sound("erro");return}data.money-=p;data.owned[i]++;sound("dinheiroSom");save();render()}));
let busy=false;
function attack(){if(busy)return;busy=true;data.money+=clickPower();$("personagem").innerHTML='<img src="img/attack.gif" alt="Atacando">';$("enimei").innerHTML='<img src="img/monstro_dano.png" alt="Monstro atingido">';sound("espada");save();render();setTimeout(()=>{$("personagem").innerHTML='<img src="img/stop.png" alt="Personagem">';$("enimei").innerHTML='<img src="img/monstro.gif" alt="Monstro">';busy=false},350)}
$("gameCenter").addEventListener("click",attack);
$("gameCenter").addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();attack()}});
$("loja").addEventListener("click",()=>$("gameRight").classList.toggle("expanded"));
$("config").addEventListener("click",()=>{data.sound=!data.sound;save();renderSound()});
function renderSound(){$("config").textContent="Som: "+(data.sound?"ligado":"desligado")}
let last=performance.now();
setInterval(()=>{const now=performance.now();const delta=Math.min((now-last)/1000,5);last=now;if(passive()>0){data.money+=passive()*delta;save();render()}},1000);
window.addEventListener("pagehide",save);
renderSound();render();save();
})();