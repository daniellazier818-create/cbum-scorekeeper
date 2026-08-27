/* v3.2 granular scoring reset */
function resetCoinForMatch(c,a,b){
  if(!state.manual?.coin)return;
  delete state.manual.coin[`${c}_${a}_${b}`];
  delete state.manual.coin[`${c}_${b}_${a}`];
}
function clearPlayerRoundScores(c,players){
  players.forEach(p=>{state.scores[c][p]=Array(18).fill(null)});
}
function resetCompetitionUnit(c,kind,index=null){
  let label='',players=[];
  if(kind==='semi'){
    const m=semis()[index];if(!m)return;
    players=[...m];label=`North Berwick Semifinal ${index+1}: ${m.map(playerLabel).join(' vs ')}`;
  }else if(kind==='dornoch'){
    const fm=finalMatches();if(!fm)return;
    const key=index===0?'champ':'consolation',m=fm[key];players=[...m];label=`Royal Dornoch ${index===0?'Championship':'Consolation'}: ${m.map(playerLabel).join(' vs ')}`;
  }else{
    players=[...PLAYER_ORDER];label=COURSE_DATA[c].name;
  }
  const entered=players.reduce((n,p)=>n+(state.scores[c]?.[p]||[]).filter(v=>v!=null).length,0);
  const extra=c==='brora'?Object.keys(state.wolfCalls||{}).length:0;
  if(!entered&&!extra){toast('No scoring to reset');return;}
  const scope=kind==='semi'||kind==='dornoch'?'this match only':'this round only';
  const msg=`Reset scoring for ${label}?\n\nThis clears ${scope}. Other rounds/matches, locked tees, Handicap Index snapshots and pairings stay intact.`;
  if(!confirm(msg))return;
  clearTimeout(typeof holeResultTimer!=='undefined'?holeResultTimer:null);
  if(typeof undoAction!=='undefined')undoAction=null;
  state.ui.holeResult=null;
  clearPlayerRoundScores(c,players);
  if(kind==='semi'||kind==='dornoch')resetCoinForMatch(c,players[0],players[1]);
  if(c==='elie')delete state.manual.coin.elie;
  if(c==='brora')state.wolfCalls={};
  state.ui.round=c;state.ui.hole=0;state.ui.liveExpanded=false;
  save();render();window.scrollTo({top:0,behavior:'smooth'});toast(`${kind==='semi'||kind==='dornoch'?'Match':'Round'} scoring reset`);
}
function renderResetButtons(c){
  const spectator=typeof isScorer==='function'&&!isScorer();if(spectator)return'';
  const e=COURSE_DATA[c].event;
  if(e==='semis')return semis().map((m,i)=>`<button class="btn danger small reset-unit-btn" data-reset-unit="semi" data-reset-c="${c}" data-reset-index="${i}">Reset Semi ${i+1}<span>${m.map(playerLabel).join(' vs ')}</span></button>`).join('');
  if(e==='finals'){
    const fm=finalMatches();if(!fm)return'';
    return`<button class="btn danger small reset-unit-btn" data-reset-unit="dornoch" data-reset-c="${c}" data-reset-index="0">Reset Championship<span>${fm.champ.map(playerLabel).join(' vs ')}</span></button><button class="btn danger small reset-unit-btn" data-reset-unit="dornoch" data-reset-c="${c}" data-reset-index="1">Reset Consolation<span>${fm.consolation.map(playerLabel).join(' vs ')}</span></button>`;
  }
  return`<button class="btn danger small reset-unit-btn" data-reset-unit="round" data-reset-c="${c}">Reset this round's scoring<span>Other competition results stay intact</span></button>`;
}
function renderResetScoringTools(c){
  const buttons=renderResetButtons(c);if(!buttons)return'';
  return`<div class="dashboard-reset"><div class="dashboard-reset-head"><span>Scoring tools</span><small>For test scores, mistakes, or a restart</small></div><div class="reset-unit-grid">${buttons}</div><div class="reset-preserve-note">Setup locks, tees, Handicap Index snapshots, pairings and every other match are preserved.</div></div>`;
}
const resetBaseRoundDashboard=renderRoundDashboard;
renderRoundDashboard=function(c){return resetBaseRoundDashboard(c)+renderResetScoringTools(c)};
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('[data-reset-unit]');if(!btn)return;
  e.preventDefault();
  resetCompetitionUnit(btn.dataset.resetC,btn.dataset.resetUnit,btn.dataset.resetIndex==null?null:+btn.dataset.resetIndex);
});
