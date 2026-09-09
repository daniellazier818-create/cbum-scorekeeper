const LIVE_EVENT='scotland-2026';
const LIVE_BASE='https://xpfxvcpoufvvhxajqerf.supabase.co';
const LIVE_KEY='sb_publishable_4pC56SU_q9gAn2AIQIAseQ_LoLRfslU';
const LIVE_DIRTY_STORAGE='cbum-live-dirty';
let liveTimer=null,livePoll=null,liveLastRemoteAt=null,liveStatus='offline',spectatorInitialized=true;
let liveDirty=localStorage.getItem(LIVE_DIRTY_STORAGE)==='1';

function isScorer(){return true}
function scorerKey(){return''}
function sharedPayload(){const copy=JSON.parse(JSON.stringify(state));delete copy.ui;return copy}
function liveLabel(){return liveStatus==='synced'?'Live · synced':liveStatus==='syncing'?'Live · syncing':!navigator.onLine?'Offline · saved locally':'Live · ready'}
function liveAge(){if(!liveLastRemoteAt)return'No live score posted yet';const s=Math.max(0,Math.round((Date.now()-new Date(liveLastRemoteAt).getTime())/1000));return s<8?'updated just now':s<60?`updated ${s}s ago`:`updated ${Math.round(s/60)}m ago`}
function setLiveHeader(){const el=document.getElementById('saveState');if(!el)return;el.textContent=liveStatus==='error'||!navigator.onLine?'Offline':''}

async function publishPayload(payload){
  const r=await fetch(`${LIVE_BASE}/functions/v1/publish-live-score`,{method:'POST',headers:{'Content-Type':'application/json','apikey':LIVE_KEY},body:JSON.stringify({event_id:LIVE_EVENT,payload})});
  if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||`HTTP ${r.status}`);
  return r.json();
}
function scheduleLivePublish(){
  clearTimeout(liveTimer);liveDirty=true;localStorage.setItem(LIVE_DIRTY_STORAGE,'1');liveStatus=navigator.onLine?'syncing':'error';setLiveHeader();
  if(!navigator.onLine)return;
  liveTimer=setTimeout(async()=>{try{const out=await publishPayload(sharedPayload());liveStatus='synced';liveLastRemoteAt=out?.updated_at||new Date().toISOString();liveDirty=false;localStorage.removeItem(LIVE_DIRTY_STORAGE)}catch(e){liveStatus='error'}setLiveHeader()},450)
}
async function fetchLive(){
  try{
    const r=await fetch(`${LIVE_BASE}/rest/v1/live_state?event_id=eq.${LIVE_EVENT}&select=payload,updated_at`,{headers:{'apikey':LIVE_KEY,'Accept':'application/json'},cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const rows=await r.json(),row=rows?.[0];if(!row)return;
    liveLastRemoteAt=row.updated_at;
    if(!liveDirty&&liveStatus!=='syncing'&&row.payload?.version){
      const ui={...state.ui};state=mergeState(freshState(),row.payload);state.ui={...state.ui,...ui,holeResult:null};
      localStorage.setItem(STORAGE,JSON.stringify(state));render();
    }
    if(!liveDirty)liveStatus='synced';setLiveHeader();
  }catch(e){liveStatus='error';setLiveHeader()}
}
async function enableScorer(){return true}
function disableScorer(){}
function applyLiveMode(){setLiveHeader()}
function startLive(){clearInterval(livePoll);if(liveDirty&&navigator.onLine)scheduleLivePublish();else fetchLive();livePoll=setInterval(()=>{if(!liveDirty)fetchLive()},5000)}

function render(){
  const app=document.getElementById('app');if(!app)return;
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.ui.tab));
  if(state.ui.tab==='rounds')app.innerHTML=state.ui.round?renderRound(state.ui.round):renderRounds();
  else if(state.ui.tab==='standings')app.innerHTML=renderStandings();
  else if(state.ui.tab==='bracket')app.innerHTML=renderBracket();
  else app.innerHTML=renderSettings();
  bind();applyLiveMode();
}

function renderLiveSettings(){return`<div class="card"><div class="eyebrow">Shared scoring</div><h2>${liveLabel()}</h2><p class="muted">Scores, tees and handicaps are editable on this device without a password. Changes save locally first and sync automatically whenever service is available.</p><div class="notice note-green">${navigator.onLine?liveAge():'No service right now · edits remain saved locally until you reconnect'}</div></div>`}
const baseRenderSettings=renderSettings;
renderSettings=function(){return renderLiveSettings()+baseRenderSettings()}

window.addEventListener('online',()=>{if(liveDirty)scheduleLivePublish();else fetchLive();render()});
window.addEventListener('offline',()=>{liveStatus='error';setLiveHeader();render()});
window.addEventListener('load',startLive,{once:true});
