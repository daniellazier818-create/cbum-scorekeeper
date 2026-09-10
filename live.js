const LIVE_EVENT='scotland-2026';
const LIVE_BASE='https://xpfxvcpoufvvhxajqerf.supabase.co';
const LIVE_KEY='sb_publishable_4pC56SU_q9gAn2AIQIAseQ_LoLRfslU';
const SCORER_STORAGE='cbum-scorer-key'; // legacy only; editing is now open
let liveTimer=null,livePoll=null,liveLastRemoteAt=null,liveStatus='offline',spectatorInitialized=false,liveDirty=false;

/* Compatibility: the app now treats every trip device as an editor. */
function isScorer(){return true}
function scorerKey(){return''}
function sharedPayload(){const copy=JSON.parse(JSON.stringify(state));delete copy.ui;return copy}
function liveLabel(){return liveStatus==='synced'?'Live · synced':liveStatus==='syncing'?'Live · syncing':navigator.onLine?'Live':'Offline · saved locally'}
function liveAge(){if(!liveLastRemoteAt)return'No live score posted yet';const s=Math.max(0,Math.round((Date.now()-new Date(liveLastRemoteAt).getTime())/1000));return s<8?'updated just now':s<60?`updated ${s}s ago`:`updated ${Math.round(s/60)}m ago`}
function setLiveHeader(){const el=document.getElementById('saveState');if(!el)return;el.textContent=liveStatus==='error'||!navigator.onLine?'OFFLINE · LOCAL':liveStatus==='syncing'?'SYNCING':'LIVE · SYNCED'}

async function publishPayload(_key,payload){
  const r=await fetch(`${LIVE_BASE}/functions/v1/publish-live-score`,{method:'POST',headers:{'Content-Type':'application/json','apikey':LIVE_KEY},body:JSON.stringify({event_id:LIVE_EVENT,payload})});
  if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||`HTTP ${r.status}`);
  return r.json();
}
function scheduleLivePublish(){
  clearTimeout(liveTimer);liveDirty=true;liveStatus=navigator.onLine?'syncing':'error';setLiveHeader();
  if(!navigator.onLine)return;
  liveTimer=setTimeout(async()=>{try{const out=await publishPayload('',sharedPayload());liveDirty=false;liveStatus='synced';liveLastRemoteAt=out?.updated_at||new Date().toISOString()}catch(e){liveStatus='error';liveDirty=true}setLiveHeader()},450)
}
async function fetchLive(){
  try{
    const r=await fetch(`${LIVE_BASE}/rest/v1/live_state?event_id=eq.${LIVE_EVENT}&select=payload,updated_at`,{headers:{'apikey':LIVE_KEY,'Accept':'application/json'},cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const rows=await r.json(),row=rows?.[0];if(!row)return;
    /* Never let a poll overwrite an edit that is waiting to publish. */
    if(liveDirty||liveStatus==='syncing'){setLiveHeader();return}
    const remoteAt=row.updated_at?new Date(row.updated_at).getTime():0;
    const seenAt=liveLastRemoteAt?new Date(liveLastRemoteAt).getTime():0;
    liveStatus='synced';
    if(row.payload?.version&&(!liveLastRemoteAt||remoteAt>seenAt)){
      const ui={...state.ui};state=mergeState(freshState(),row.payload);state.ui={...state.ui,...ui,holeResult:null};
      localStorage.setItem(STORAGE,JSON.stringify(state));
      liveLastRemoteAt=row.updated_at;
      render();
    }else if(row.updated_at){liveLastRemoteAt=row.updated_at}
    setLiveHeader();
  }catch(e){liveStatus='error';setLiveHeader()}
}
async function enableScorer(){return true}
function disableScorer(){}
function applyLiveMode(){setLiveHeader()}
function startLive(){fetchLive();clearInterval(livePoll);livePoll=setInterval(fetchLive,5000)}

function render(){
  const app=document.getElementById('app');if(!app)return;
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.ui.tab));
  if(state.ui.tab==='rounds')app.innerHTML=state.ui.round?renderRound(state.ui.round):renderRounds();
  else if(state.ui.tab==='standings')app.innerHTML=renderStandings();
  else if(state.ui.tab==='bracket')app.innerHTML=renderBracket();
  else app.innerHTML=renderSettings();
  bind();applyLiveMode();
}

function renderLiveSettings(){return`<div class="card"><div class="eyebrow">Shared scoring</div><h2>${liveLabel()}</h2><p class="muted">Scores and tee selections are open for editing on every trip device. Changes save locally first and publish automatically whenever service is available.</p><div class="notice note-green">${navigator.onLine?liveAge():'No service right now · edits remain saved locally and will sync when service returns'}</div></div>`}
const baseRenderSettings=renderSettings;
renderSettings=function(){return renderLiveSettings()+baseRenderSettings()}

document.addEventListener('click',async e=>{
  /* Legacy scorer controls may survive in an old cached DOM; make them harmless. */
  const on=e.target.closest?.('[data-scorer-enable]');if(on){localStorage.removeItem(SCORER_STORAGE);toast('Editing is already enabled');render()}
  const off=e.target.closest?.('[data-scorer-disable]');if(off){localStorage.removeItem(SCORER_STORAGE);toast('Editing stays enabled');render()}
});
window.addEventListener('online',()=>{if(liveDirty)scheduleLivePublish();else fetchLive();render()});
window.addEventListener('offline',()=>{liveStatus='error';setLiveHeader();render()});
window.addEventListener('load',startLive,{once:true});
