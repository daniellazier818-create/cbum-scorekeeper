function bind(){
  document.querySelectorAll('[data-open-round]').forEach(el=>el.onclick=()=>{state.ui.round=el.dataset.openRound;state.ui.hole=roundLocked(state.ui.round)?firstIncomplete(state.ui.round):0;state.ui.liveExpanded=false;state.ui.holeResult=null;save();render();window.scrollTo({top:0,behavior:'smooth'})});
  document.querySelectorAll('[data-back-rounds]').forEach(el=>el.onclick=()=>{state.ui.round=null;state.ui.liveExpanded=false;state.ui.holeResult=null;save();render()});
  document.querySelectorAll('[data-start-round]').forEach(el=>el.onclick=()=>startRound(el.dataset.startRound));
  document.querySelectorAll('[data-hole]').forEach(el=>el.onclick=()=>{clearTimeout(holeResultTimer);state.ui.holeResult=null;state.ui.hole=+el.dataset.hole;save();render();window.scrollTo({top:0,behavior:'smooth'})});
  document.querySelectorAll('[data-toggle-dashboard]').forEach(el=>el.onclick=()=>{state.ui.liveExpanded=!state.ui.liveExpanded;save();render()});
  document.querySelectorAll('[data-score-v]').forEach(el=>el.onclick=()=>{const c=el.dataset.scoreC,p=el.dataset.scoreP,h=+el.dataset.scoreH,v=+el.dataset.scoreV;navigator.vibrate?.(12);setScore(c,p,h,gross(c,p,h)===v?null:v)});
  document.querySelectorAll('[data-clear-score]').forEach(el=>el.onclick=()=>setScore(el.dataset.scoreC,el.dataset.scoreP,+el.dataset.scoreH,null));
  document.querySelectorAll('[data-adjust]').forEach(el=>el.onclick=()=>{const c=el.dataset.scoreC,p=el.dataset.scoreP,h=+el.dataset.scoreH,d=+el.dataset.adjust;navigator.vibrate?.(8);setScore(c,p,h,Math.max(1,(gross(c,p,h)??holePar(c,p,h))+d))});
  document.querySelectorAll('[data-wolf-type]').forEach(el=>el.onclick=()=>setWolfCall(+el.dataset.wolfHole,el.dataset.wolfType,el.dataset.wolfPartner||null));
  document.querySelectorAll('[data-coin-key]').forEach(el=>el.onclick=()=>{state.manual.coin[el.dataset.coinKey]=el.dataset.coinWinner;save();render();toast('Coin flip recorded')});
  document.querySelectorAll('[data-hi]').forEach(el=>el.onchange=()=>{state.players[el.dataset.hi].hi=+el.value;save();render();toast('Future-round HI updated')});
  document.querySelectorAll('[data-tee-c]').forEach(el=>el.onchange=()=>{const c=el.dataset.teeC,p=el.dataset.teeP;state.tees[c][p]=el.value;if(roundLocked(c)&&state.roundLocks[c]?.tees)state.roundLocks[c].tees[p]=el.value;state.ui.holeResult=null;save();render();toast('Tee updated')});
  document.querySelectorAll('[data-wolf-move]').forEach(el=>el.onclick=()=>moveWolf(+el.dataset.wolfMove,+el.dataset.dir));
  document.querySelectorAll('[data-go-standings]').forEach(el=>el.onclick=()=>{state.ui.tab='standings';state.ui.round=null;save();render();window.scrollTo(0,0)});
  document.querySelectorAll('[data-unlock]').forEach(el=>el.onclick=()=>{const k=el.dataset.unlock;if(confirm(`Unlock ${k} pairings? This allows prior-score edits to change future teams.`)){state.locks[k]=null;save();render();toast('Pairing lock cleared')}});
  document.querySelectorAll('[data-unlock-round]').forEach(el=>el.onclick=()=>unlockRoundSetup(el.dataset.unlockRound));
  document.querySelectorAll('[data-undo]').forEach(el=>el.onclick=undoLastAction);
  document.querySelectorAll('[data-travel-day]').forEach(el=>el.onclick=()=>{state.ui.travelDay=el.dataset.travelDay;save();render();window.scrollTo({top:0,behavior:'smooth'})});
  const aa=document.querySelector('[data-auto-advance]');if(aa)aa.onchange=()=>{state.ui.autoAdvance=aa.checked;save();toast(aa.checked?'Auto-advance on':'Auto-advance off')};
  const cp=document.querySelector('[data-compact]');if(cp)cp.onchange=()=>{state.ui.compact=cp.checked;save();render();toast(cp.checked?'Compact scoring on':'Expanded scoring on')};
  const ex=document.querySelector('[data-export]');if(ex)ex.onclick=exportState;
  const im=document.querySelector('[data-import]');if(im)im.onchange=importState;
  const rs=document.querySelector('[data-reset]');if(rs)rs.onclick=()=>{if(confirm('Reset every score, Wolf call and result? Player indexes and tee defaults will also return to the trip defaults.')){state=freshState();undoAction=null;localStorage.removeItem(STORAGE);save();render();toast('Reset complete')}}
}
function lockStructureFor(c){if((c==='elie'||c==='northberwick')&&!state.locks.seeds){state.locks.seeds=seedResults().map(x=>x.p);toast('Kingsbarns seeds locked')}if(c==='castlestuart'&&!state.locks.bumstead){const r=cbumBeforeCastle().map(x=>x.p);state.locks.bumstead=[[r[0],r[3]],[r[1],r[2]]];toast('Bumstead teams locked')}if(c==='royaldornoch'&&!state.locks.finals){const fm=computedFinalMatches();if(fm){state.locks.finals=JSON.parse(JSON.stringify(fm));toast('Dornoch finals locked')}}}
function setScore(c,p,h,v){
  if(!roundLocked(c))state.roundLocks[c]=createRoundSnapshot(c,'first-score');
  if(v!=null)lockStructureFor(c);
  const prev=gross(c,p,h);if(prev===v)return;
  rememberUndo({type:'score',c,p,h,prev,next:v});
  clearTimeout(holeResultTimer);state.ui.holeResult=null;state.scores[c][p][h]=v;save();
  if(holeReady(c,h))showHoleResult(c,h);else render();
}
function setWolfCall(h,type,partner){
  const c='brora';if(!roundLocked(c))state.roundLocks[c]=createRoundSnapshot(c,'first-score');lockStructureFor(c);
  const prev=state.wolfCalls[h]?clone(state.wolfCalls[h]):null;rememberUndo({type:'wolf',c,h,prev,next:{type,partner}});
  clearTimeout(holeResultTimer);state.ui.holeResult=null;state.wolfCalls[h]={type,partner};navigator.vibrate?.(10);save();if(holeReady(c,h))showHoleResult(c,h);else render();
}
function firstIncomplete(c){for(let h=0;h<18;h++)if(!holeReady(c,h))return h;return 17}
function moveWolf(i,d){const j=i+d;if(j<0||j>=4)return;if(roundLocked('brora')){alert('Brora is already locked. Unlock the Brora round setup before changing the Wolf order.');return}[state.wolfOrder[i],state.wolfOrder[j]]=[state.wolfOrder[j],state.wolfOrder[i]];state.wolfCalls={};save();render()}
function exportState(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cbum-scorekeeper-backup.json';a.click();URL.revokeObjectURL(a.href);toast('Backup exported')}
function importState(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);state=mergeState(freshState(),x);Object.keys(COURSE_DATA).forEach(c=>{if(roundHasAnyData(c)&&!state.roundLocks[c])state.roundLocks[c]=createRoundSnapshot(c,'imported')});save();render();toast('Backup imported')}catch(err){alert('That backup file could not be read.')}};r.readAsText(f)}
document.querySelectorAll('.navbtn').forEach(b=>b.onclick=()=>{state.ui.tab=b.dataset.tab;if(state.ui.tab!=='rounds')state.ui.round=null;state.ui.liveExpanded=false;state.ui.holeResult=null;save();render();window.scrollTo(0,0)});
if('serviceWorker'in navigator&&location.protocol.startsWith('http')){
  navigator.serviceWorker.register('sw.js?v=3.7.2-openedit',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
}
render();