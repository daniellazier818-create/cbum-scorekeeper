const LIVE_EVENT='scotland-2026';
const LIVE_BASE='https://xpfxvcpoufvvhxajqerf.supabase.co';
const LIVE_KEY='sb_publishable_4pC56SU_q9gAn2AIQIAseQ_LoLRfslU';
const SCORER_STORAGE='cbum-scorer-key';
let liveTimer=null,livePoll=null,liveLastRemoteAt=null,liveStatus='offline',spectatorInitialized=false;

function isScorer(){return !!localStorage.getItem(SCORER_STORAGE)}
function scorerKey(){return localStorage.getItem(SCORER_STORAGE)||''}
function sharedPayload(){const copy=JSON.parse(JSON.stringify(state));delete copy.ui;return copy}
function liveLabel(){if(isScorer())return liveStatus==='synced'?'Live · synced':liveStatus==='syncing'?'Live · syncing':'Offline · saved locally';return liveLastRemoteAt?'Live view':'Spectator mode'}
function liveAge(){if(!liveLastRemoteAt)return'No live score posted yet';const s=Math.max(0,Math.round((Date.now()-new Date(liveLastRemoteAt).getTime())/1000));return s<8?'updated just now':s<60?`updated ${s}s ago`:`updated ${Math.round(s/60)}m ago`}
function setLiveHeader(){const el=document.getElementById('saveState');if(!el)return;if(isScorer())el.textContent=liveStatus==='syncing'?'SYNCING':liveStatus==='error'||!navigator.onLine?'OFFLINE · LOCAL':'LIVE · SYNCED';else el.textContent='LIVE VIEW'}

async function publishPayload(key,payload){
  const r=await fetch(`${LIVE_BASE}/functions/v1/publish-live-score`,{method:'POST',headers:{'Content-Type':'application/json','apikey':LIVE_KEY,'x-scorer-key':key},body:JSON.stringify({event_id:LIVE_EVENT,payload})});
  if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||`HTTP ${r.status}`);
  return r.json();
}
function scheduleLivePublish(){
  if(!isScorer())return;
  clearTimeout(liveTimer);liveStatus=navigator.onLine?'syncing':'error';setLiveHeader();
  if(!navigator.onLine)return;
  liveTimer=setTimeout(async()=>{try{await publishPayload(scorerKey(),sharedPayload());liveStatus='synced';liveLastRemoteAt=new Date().toISOString()}catch(e){liveStatus='error'}setLiveHeader()},450)
}
async function fetchLive(){
  try{
    const r=await fetch(`${LIVE_BASE}/rest/v1/live_state?event_id=eq.${LIVE_EVENT}&select=payload,updated_at`,{headers:{'apikey':LIVE_KEY,'Accept':'application/json'},cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const rows=await r.json(),row=rows?.[0];if(!row)return;
    liveLastRemoteAt=row.updated_at;liveStatus='synced';
    if(!isScorer()&&row.payload?.version){
      const ui={...state.ui};state=mergeState(freshState(),row.payload);state.ui={...state.ui,...ui,holeResult:null};
      if(!spectatorInitialized){const c=typeof activeSpectatorRound==='function'?activeSpectatorRound():null;if(c){state.ui.tab='rounds';state.ui.round=c;state.ui.hole=firstIncomplete(c)}spectatorInitialized=true}
      localStorage.setItem(STORAGE,JSON.stringify(state));render();
    }
    setLiveHeader();
  }catch(e){liveStatus='error';setLiveHeader()}
}
async function enableScorer(code){
  const clean=(code||'').trim();if(!clean)return false;
  try{await publishPayload(clean,sharedPayload());localStorage.setItem(SCORER_STORAGE,clean);liveStatus='synced';liveLastRemoteAt=new Date().toISOString();spectatorInitialized=true;setLiveHeader();return true}catch(e){return false}
}
function disableScorer(){localStorage.removeItem(SCORER_STORAGE);liveStatus='offline';spectatorInitialized=false;setLiveHeader();fetchLive()}
function applyLiveMode(){
  setLiveHeader();
  if(isScorer())return;
  document.querySelectorAll('[data-score-v],[data-clear-score],[data-adjust],[data-wolf-type],[data-coin-key],[data-hi],[data-tee-c],[data-wolf-move],[data-unlock],[data-unlock-round],[data-start-round],[data-undo],[data-auto-advance],[data-compact],[data-reset],[data-import]').forEach(el=>{el.disabled=true;el.setAttribute('aria-disabled','true')});
}
function startLive(){fetchLive();clearInterval(livePoll);livePoll=setInterval(fetchLive,5000);if(isScorer())setTimeout(scheduleLivePublish,800)}

function render(){
  const app=document.getElementById('app');if(!app)return;
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.ui.tab));
  if(state.ui.tab==='rounds')app.innerHTML=state.ui.round?renderRound(state.ui.round):renderRounds();
  else if(state.ui.tab==='standings')app.innerHTML=renderStandings();
  else if(state.ui.tab==='bracket')app.innerHTML=renderBracket();
  else app.innerHTML=renderSettings();
  bind();applyLiveMode();
}

function renderLiveSettings(){return`<div class="card"><div class="eyebrow">Shared scoring</div><h2>${liveLabel()}</h2><p class="muted">${isScorer()?'This phone is the scoring authority. Changes save locally first and publish automatically whenever service is available.':'This device is read-only. It follows the scorer automatically and refreshes the shared tournament about every five seconds.'}</p><div class="notice ${isScorer()?'note-green':''}">${isScorer()?(navigator.onLine?liveAge():'No service right now · scoring remains saved locally'):liveAge()}</div>${isScorer()?`<button class="btn secondary" style="margin-top:10px" data-scorer-disable>Leave scorer mode</button>`:`<div style="margin-top:10px"><label>Scorer setup code</label><div class="row"><input class="field" type="password" autocomplete="off" placeholder="CBUM-…" data-scorer-code><button class="btn" data-scorer-enable>Enable scoring</button></div><div class="tiny" style="margin-top:6px">Only the designated scorer needs this. Everyone else should stay in Live View.</div></div>`}</div>`}
const baseRenderSettings=renderSettings;
renderSettings=function(){return renderLiveSettings()+baseRenderSettings()}

document.addEventListener('click',async e=>{
  const on=e.target.closest?.('[data-scorer-enable]');
  if(on){const input=document.querySelector('[data-scorer-code]');on.disabled=true;on.textContent='Checking…';const ok=await enableScorer(input?.value);if(ok){toast('Scorer mode enabled');render()}else{on.disabled=false;on.textContent='Enable scoring';alert('That scorer setup code was not accepted.')}}
  const off=e.target.closest?.('[data-scorer-disable]');
  if(off&&confirm('Leave scorer mode on this device? It will become read-only.')){disableScorer();toast('Live View enabled');render()}
});
window.addEventListener('online',()=>{if(isScorer())scheduleLivePublish();else fetchLive();render()});
window.addEventListener('offline',()=>{liveStatus='error';setLiveHeader();render()});
window.addEventListener('load',startLive,{once:true});
