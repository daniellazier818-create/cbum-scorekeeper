const LIVE_EVENT='scotland-2026';
const LIVE_BASE='https://xpfxvcpoufvvhxajqerf.supabase.co';
const LIVE_KEY='sb_publishable_4pC56SU_q9gAn2AIQIAseQ_LoLRfslU';
const LIVE_DIRTY_STORAGE='cbum-live-dirty-v1';
let liveTimer=null,livePoll=null,liveLastRemoteAt=null,liveStatus='offline',liveRevision=0,liveDirty=localStorage.getItem(LIVE_DIRTY_STORAGE)==='1',livePublishing=false;

/* Scoring is intentionally open for the trip. Kept for compatibility with existing UI helpers. */
function isScorer(){return true}
function scorerKey(){return''}
function sharedPayload(){const copy=JSON.parse(JSON.stringify(state));delete copy.ui;return copy}
function liveLabel(){return liveStatus==='synced'?'Live · synced':liveStatus==='syncing'?'Live · syncing':navigator.onLine?'Live · reconnecting':'Offline · saved locally'}
function liveAge(){if(!liveLastRemoteAt)return'No live score posted yet';const s=Math.max(0,Math.round((Date.now()-new Date(liveLastRemoteAt).getTime())/1000));return s<8?'updated just now':s<60?`updated ${s}s ago`:`updated ${Math.round(s/60)}m ago`}
function setLiveHeader(){const el=document.getElementById('saveState');if(!el)return;el.textContent=liveStatus==='error'||!navigator.onLine?'OFFLINE · LOCAL':liveStatus==='syncing'?'LIVE · SYNCING':'LIVE · SYNCED'}

async function publishPayload(payload){
  const r=await fetch(`${LIVE_BASE}/functions/v1/publish-live-score`,{method:'POST',headers:{'Content-Type':'application/json','apikey':LIVE_KEY},body:JSON.stringify({event_id:LIVE_EVENT,payload})});
  if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||`HTTP ${r.status}`);
  return r.json();
}
function scheduleLivePublish(){
  clearTimeout(liveTimer);
  const revision=++liveRevision;
  liveDirty=true;
  try{localStorage.setItem(LIVE_DIRTY_STORAGE,'1')}catch(e){}
  liveStatus=navigator.onLine?'syncing':'error';
  setLiveHeader();
  if(!navigator.onLine)return;
  liveTimer=setTimeout(async()=>{
    livePublishing=true;
    try{
      const result=await publishPayload(sharedPayload());
      if(revision===liveRevision){liveDirty=false;try{localStorage.removeItem(LIVE_DIRTY_STORAGE)}catch(e){}}
      liveStatus='synced';
      liveLastRemoteAt=result?.updated_at||new Date().toISOString();
    }catch(e){liveStatus='error'}
    livePublishing=false;
    setLiveHeader();
  },450)
}
async function fetchLive(){
  try{
    const r=await fetch(`${LIVE_BASE}/rest/v1/live_state?event_id=eq.${LIVE_EVENT}&select=payload,updated_at`,{headers:{'apikey':LIVE_KEY,'Accept':'application/json'},cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const rows=await r.json(),row=rows?.[0];
    if(!row)return;
    liveLastRemoteAt=row.updated_at;
    liveStatus=liveDirty?'syncing':'synced';
    if(row.payload?.version&&!liveDirty&&!livePublishing){
      const ui={...state.ui};
      state=mergeState(freshState(),row.payload);
      state.ui={...state.ui,...ui,holeResult:null};
      localStorage.setItem(STORAGE,JSON.stringify(state));
      render();
    }
    setLiveHeader();
  }catch(e){liveStatus='error';setLiveHeader()}
}
function enableScorer(){return Promise.resolve(true)}
function disableScorer(){}
function applyLiveMode(){setLiveHeader()}
function startLive(){
  clearInterval(livePoll);
  if(liveDirty){scheduleLivePublish();setTimeout(fetchLive,1200)}else fetchLive();
  livePoll=setInterval(fetchLive,5000)
}

function render(){
  const app=document.getElementById('app');if(!app)return;
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.ui.tab));
  if(state.ui.tab==='rounds')app.innerHTML=state.ui.round?renderRound(state.ui.round):renderRounds();
  else if(state.ui.tab==='standings')app.innerHTML=renderStandings();
  else if(state.ui.tab==='bracket')app.innerHTML=renderBracket();
  else app.innerHTML=renderSettings();
  bind();applyLiveMode();
}

function renderLiveSettings(){return`<div class="card"><div class="eyebrow">Shared scoring</div><h2>${liveLabel()}</h2><p class="muted">Scoring and tee selection are open to the group. Changes save on this device immediately and sync automatically whenever service is available.</p><div class="notice note-green">${navigator.onLine?liveAge():'No service right now · changes remain saved locally until you reconnect'}</div></div>`}
const baseRenderSettings=renderSettings;
renderSettings=function(){return renderLiveSettings()+baseRenderSettings()}

window.addEventListener('online',()=>{scheduleLivePublish();render()});
window.addEventListener('offline',()=>{liveStatus='error';setLiveHeader();render()});
window.addEventListener('load',startLive,{once:true});
