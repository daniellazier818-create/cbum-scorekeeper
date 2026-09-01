/* sync status consistency + consumer-facing header cleanup */
function scorerSyncStatus(){
  if(!navigator.onLine||liveStatus==='error')return{header:'Offline',label:'Offline · saved locally',problem:true};
  if(liveStatus==='syncing'||liveStatus==='offline')return{header:'',label:'Live · syncing',problem:false};
  return{header:'',label:'Live · synced',problem:false};
}

liveLabel=function(){
  if(isScorer())return scorerSyncStatus().label;
  return liveLastRemoteAt?'Live view':'Spectator mode';
};

setLiveHeader=function(){
  const el=document.getElementById('saveState');if(!el)return;
  const status=isScorer()?scorerSyncStatus():{header:'',problem:false};
  el.textContent=status.header;
  el.hidden=!status.problem;
  el.classList.toggle('problem',!!status.problem);
  el.setAttribute('aria-label',status.problem?'Scoring is offline and saved locally':'Sync healthy');
};

renderConnectionStrip=function(){
  if(typeof isScorer!=='function')return'';
  if(isScorer())return'';
  return`<div class="connection-strip spectator">LIVE VIEW${typeof liveAge==='function'?` · ${liveAge()}`:''}</div>`;
};
