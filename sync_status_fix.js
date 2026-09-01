/* sync status consistency patch */
function scorerSyncStatus(){
  if(!navigator.onLine||liveStatus==='error')return{header:'OFFLINE · LOCAL',label:'Offline · saved locally'};
  if(liveStatus==='syncing'||liveStatus==='offline')return{header:'LIVE · SYNCING',label:'Live · syncing'};
  return{header:'LIVE · SYNCED',label:'Live · synced'};
}

liveLabel=function(){
  if(isScorer())return scorerSyncStatus().label;
  return liveLastRemoteAt?'Live view':'Spectator mode';
};

setLiveHeader=function(){
  const el=document.getElementById('saveState');if(!el)return;
  el.textContent=isScorer()?scorerSyncStatus().header:'LIVE VIEW';
};

renderConnectionStrip=function(){
  if(typeof isScorer!=='function')return'';
  if(isScorer())return'';
  return`<div class="connection-strip spectator">LIVE VIEW${typeof liveAge==='function'?` · ${liveAge()}`:''}</div>`;
};
