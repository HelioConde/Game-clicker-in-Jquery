"use strict";
(() => {
  const exportButton=document.getElementById("backupExport");
  const importInput=document.getElementById("backupImport");
  const status=document.getElementById("backupStatus");
  const SAVE_KEY="gameClickerV3";
  const PENDING_KEY="gameClickerV3PendingImport";
  const MAX_SIZE=100*1024;
  function message(value,error=false){status.textContent=value;status.dataset.error=String(error);}
  function validate(value){
    const save=value?.application==="game-clicker" && value.formatVersion===1 ? value.save : null;
    if(!save || save.version!==3 || !Array.isArray(save.owned) || save.owned.length!==10)
      throw new Error("Formato incompatível. Selecione um backup JSON do Game Clicker.");
    if(!Number.isInteger(save.stage) || save.stage<1 || save.stage>9999 ||
       !Number.isFinite(save.money) || save.money<0 || save.money>1e15 ||
       save.owned.some(v=>!Number.isInteger(v)||v<0||v>10000))
      throw new Error("Dados de evolução inválidos no arquivo.");
    // Os campos opcionais da partida também passam pela normalização do motor.
    return window.GameCore.normalize(save,{});
  }
  exportButton.addEventListener("click",()=>{
    try{
      document.dispatchEvent(new Event("gameclicker:save"));
      const raw=localStorage.getItem(SAVE_KEY);
      if(!raw)throw new Error("Nenhum progresso salvo foi encontrado.");
      const state=window.GameCore.normalize(JSON.parse(raw),{});
      const content=JSON.stringify({application:"game-clicker",formatVersion:1,exportedAt:new Date().toISOString(),save:state},null,2);
      const url=URL.createObjectURL(new Blob([content],{type:"application/json"}));
      const link=document.createElement("a");
      link.href=url;link.download="game-clicker-backup.json";document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      message("Backup exportado. Guarde o arquivo em local seguro.");
    }catch(error){message("Falha na exportação: "+error.message,true);}
  });
  importInput.addEventListener("change",async()=>{
    const file=importInput.files?.[0];
    importInput.value="";
    if(!file)return;
    if(file.size>MAX_SIZE){message("Arquivo muito grande. O limite é 100 KB.",true);return;}
    try{
      const imported=validate(JSON.parse(await file.text()));
      if(!confirm("Importar este backup e substituir o progresso atual neste navegador?")) {
        message("Importação cancelada. Seu save não foi alterado.");return;
      }
      localStorage.setItem(PENDING_KEY,JSON.stringify(imported));
      // O save atual ainda pode ser gravado no pagehide; o pendente prevalece no próximo boot.
      location.reload();
    }catch(error){message("Importação rejeitada: "+error.message,true);}
  });
})();
