const LIVE_EVENT='scotland-2026';
const LIVE_BASE='https://xpfxvcpoufvvhxajqerf.supabase.co';
const LIVE_KEY='sb_publishable_4pC56SU_q9gAn2AIQIAseQ_LoLRfslU';
const SCORER_STORAGE='cbum-scorer-key';
let liveTimer=null, livePoll=null, liveLastRemoteAt=null, liveStatus='offline';

function isScorer(){return !!localStorage.getItem(SCORER_STORAGE)}
function scorerKey(){return localStorage.getItem(SCORER_STORAGE)||''}
function sharedPayload(){const copy=JSON.parse(JSON.stringify(state));delete copy.ui;return copy}
function liveLabel(){if(isScorer()) return liveStatus==='synced'?'Live sync on':liveStatus==='syncing'?'Syncing…':'Scorer mode';return liveLastRemoteAt?'Live spectator':'Spectator mode'}
function liveAge(){if(!liveLastRemoteAt)return 'No live score posted yet';const s=Math.max(0,Math.round((Date.now()-new Date(liveLastRemoteAt).getTime())/1000));return s<8?'Updated just now':s<60?`Updated ${s}s ago`:`Updated ${Math.round(s/60)}m ago`}
function setLiveHeader(){const el=document.getElementById('saveState');if(!el)return;if(isScorer()){el.textContent=liveStatus==='syncing'?'Syncing':liveStatus==='error'?'Offline':'Live'}else el.textContent='View'}

async function publishPayload(key,payload){
  const r=await fetch(`${LIVE_BASE}/functions/v1/publish-live-score`,{method:'POST',headers:{'Content-Type':'application/json','apikey':LIVE_KEY,'x-scorer-key':key},body:JSON.stringify({event_id:LIVE_EVENT,payload})});
  if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||`HTTP ${r.status}`);
  return r.json();
}
function scheduleLivePublish(){
  if(!isScorer())return;
  clearTimeout(liveTimer);liveStatus='syncing';setLiveHeader();
  liveTimer=setTimeout(async()=>{try{await publishPayload(scorerKey(),sharedPayload());liveStatus='synced';liveLastRemoteAt=new Date().toISOString()}catch(e){liveStatus='error'}setLiveHeader()},450)
}
async function fetchLive(){
  try{
    const r=await fetch(`${LIVE_BASE}/rest/v1/live_state?event_id=eq.${LIVE_EVENT}&select=payload,updated_at`,{headers:{'apikey':LIVE_KEY,'Accept':'application/json'},cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const rows=await r.json(),row=rows?.[0];if(!row)return;
    liveLastRemoteAt=row.updated_at;
    if(!isScorer()&&row.payload?.version){const ui=state.ui;state=mergeState(freshState(),row.payload);state.ui=ui;localStorage.setItem(STORAGE,JSON.stringify(state));render()}
    setLiveHeader();
  }catch(e){if(!isScorer())liveStatus='error';setLiveHeader()}
}
async function enableScorer(code){
  const clean=(code||'').trim();if(!clean)return false;
  try{await publishPayload(clean,sharedPayload());localStorage.setItem(SCORER_STORAGE,clean);liveStatus='synced';liveLastRemoteAt=new Date().toISOString();setLiveHeader();return true}catch(e){return false}
}
function disableScorer(){localStorage.removeItem(SCORER_STORAGE);liveStatus='offline';setLiveHeader();fetchLive()}
function applyLiveMode(){
  setLiveHeader();
  if(isScorer())return;
  document.querySelectorAll('[data-score-v],[data-clear-score],[data-adjust],[data-wolf-type],[data-coin-key],[data-hi],[data-tee-c],[data-wolf-move],[data-unlock],[data-auto-advance],[data-compact],[data-reset],[data-import]').forEach(el=>{el.disabled=true;el.setAttribute('aria-disabled','true')});
}
function startLive(){fetchLive();clearInterval(livePoll);livePoll=setInterval(fetchLive,5000);if(isScorer())setTimeout(scheduleLivePublish,800)}

function render(){
  const app=document.getElementById('app');if(!app)return;
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.ui.tab));
  if(state.ui.tab==='rounds')app.innerHTML=state.ui.round?renderRound(state.ui.round):renderRounds();
  else if(state.ui.tab==='standings')app.innerHTML=renderStandings();
  else if(state.ui.tab==='bracket')app.innerHTML=renderBracket();
  else app.innerHTML=renderSettings();
  bind();
  applyLiveMode();
}
