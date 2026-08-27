/* v3.0 on-course workflow, round snapshots and dashboard helpers */
const uxBaseFreshState=freshState;
freshState=function(){
  const s=uxBaseFreshState();
  s.version=3;
  s.roundLocks={};
  s.ui={...s.ui,liveExpanded:false,holeResult:null};
  return s;
};
const uxBaseMergeState=mergeState;
mergeState=function(base,x){
  const m=uxBaseMergeState(base,x||{});
  m.roundLocks={...(base.roundLocks||{}),...((x&&x.roundLocks)||{})};
  m.ui={...base.ui,...(m.ui||{}),liveExpanded:!!(m.ui&&m.ui.liveExpanded),holeResult:null};
  m.version=3;
  return m;
};

function clone(v){return JSON.parse(JSON.stringify(v))}
function roundHasAnyData(c){return PLAYER_ORDER.some(p=>(state.scores[c]?.[p]||[]).some(v=>v!=null))||(c==='brora'&&Object.keys(state.wolfCalls||{}).length>0)}
function createRoundSnapshot(c,reason='started'){
  return{reason,startedAt:new Date().toISOString(),his:Object.fromEntries(PLAYER_ORDER.map(p=>[p,+state.players[p].hi])),tees:Object.fromEntries(PLAYER_ORDER.map(p=>[p,state.tees[c][p]]))};
}
function effectiveHI(c,p){return state.roundLocks?.[c]?.his?.[p]??state.players[p].hi}
function effectiveTeeName(c,p){return state.roundLocks?.[c]?.tees?.[p]??state.tees[c][p]}
courseTee=function(c,p){return COURSE_DATA[c].tees[effectiveTeeName(c,p)]};
unroundedCourseHandicap=function(c,p){const r=ratingTuple(c,p);if(!r)return null;return effectiveHI(c,p)*r[1]/113+(r[0]-r[2])};

state=mergeState(freshState(),state);
Object.keys(COURSE_DATA).forEach(c=>{if(roundHasAnyData(c)&&!state.roundLocks[c])state.roundLocks[c]=createRoundSnapshot(c,'migrated')});
state.version=3;
try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch(e){}

const ROUND_ROMAN=['I','II','III','IV','V','VI','VII'];
let undoAction=null;
let holeResultTimer=null;

function roundLocked(c){return !!state.roundLocks?.[c]}
function startRound(c){
  if(!state.roundLocks[c])state.roundLocks[c]=createRoundSnapshot(c,'started');
  if(typeof lockStructureFor==='function')lockStructureFor(c);
  state.ui.round=c;state.ui.hole=firstIncomplete(c);state.ui.liveExpanded=false;state.ui.holeResult=null;
  save();render();window.scrollTo({top:0,behavior:'smooth'});toast('Round setup locked');
}
function unlockRoundSetup(c){
  if(!state.roundLocks[c])return;
  const has=roundHasAnyData(c);
  const msg=has?'Unlock this round’s tees and handicaps? Existing gross scores will remain, but the round will be recalculated when you start it again with new inputs.':'Unlock this round’s tee and handicap snapshot?';
  if(!confirm(msg))return;
  state.roundLocks[c]=null;state.ui.holeResult=null;save();render();toast('Round setup unlocked');
}
function rememberUndo(action){undoAction=clone(action)}
function undoLabel(){
  if(!undoAction)return'';
  if(undoAction.type==='score')return`${playerLabel(undoAction.p)} · Hole ${undoAction.h+1}`;
  if(undoAction.type==='wolf')return`Wolf call · Hole ${undoAction.h+1}`;
  return'last entry';
}
function undoLastAction(){
  if(!undoAction)return;
  const a=undoAction;undoAction=null;clearTimeout(holeResultTimer);state.ui.holeResult=null;
  if(a.type==='score')state.scores[a.c][a.p][a.h]=a.prev;
  if(a.type==='wolf'){if(a.prev)state.wolfCalls[a.h]=a.prev;else delete state.wolfCalls[a.h]}
  state.ui.tab='rounds';state.ui.round=a.c;state.ui.hole=a.h;save();render();window.scrollTo({top:0,behavior:'smooth'});toast('Last entry undone');
}
function nextMissingPlayer(c,h){return PLAYER_ORDER.find(p=>gross(c,p,h)==null)||null}
function renderUndoBar(c){if(!undoAction)return'';return`<button class="undo-bar" data-undo><span>↶ Undo</span><b>${undoLabel()}</b></button>`}

function currentRoundStatusText(c){
  const e=COURSE_DATA[c].event;
  if(e==='qualifier'||e==='finale'){const r=stablefordRows(c);return`${playerLabel(r[0].p)} leads · ${r[0].pts} pts`}
  if(e==='fourball')return resolveFourball().display;
  if(e==='semis')return semifinalResults().map(r=>r?matchStateText(r.full):'').filter(Boolean).join(' · ');
  if(e==='bumstead')return resolveBumstead().display;
  if(e==='wolf'){const r=wolfRanks();return`${playerLabel(r[0].p)} leads · ${r[0].pts} Wolf pts`}
  if(e==='finals'){const fm=finalMatches();if(!fm)return'Finals await North Berwick';return Object.values(fm).map(m=>{const r=fullSinglesResult(c,...m);return r?matchStateText(r.full):''}).join(' · ')}
  return'';
}
function subsetSinglesText(c,m,sub){const r=singlesMatch(c,m[0],m[1],sub);if(!r||r.diff===0)return`${playerLabel(m[0])}/${playerLabel(m[1])} AS`;const w=r.diff>0?m[0]:m[1];return`${playerLabel(w)} ${Math.abs(r.diff)} up`}
function frontNineText(c){
  if(progress(c)<9)return'In progress';
  const e=COURSE_DATA[c].event;
  if(e==='qualifier'||e==='finale'){const rows=PLAYER_ORDER.map(p=>({p,pts:sumHoles(h=>stableford(c,p,h)||0,0,9)})).sort((a,b)=>b.pts-a.pts);return`${playerLabel(rows[0].p)} ${rows[0].pts} pts`}
  if(e==='fourball'){const r=fourballResult([0,9]);return r.diff?`Team ${r.diff>0?1:2} ${Math.abs(r.diff)} up`:'All square'}
  if(e==='semis')return semis().map(m=>subsetSinglesText(c,m,[0,9])).join(' · ');
  if(e==='bumstead'){const r=bumsteadResult([0,9]);return`${r.p[0]} - ${r.p[1]}`}
  if(e==='wolf'){const wp=wolfPoints();const rows=PLAYER_ORDER.map(p=>({p,pts:sumHoles(h=>wp.byHole[h][p],0,9)})).sort((a,b)=>b.pts-a.pts);return`${playerLabel(rows[0].p)} ${rows[0].pts}`}
  if(e==='finals'){const fm=finalMatches();return fm?Object.values(fm).map(m=>subsetSinglesText(c,m,[0,9])).join(' · '):'Awaiting bracket'}
  return'';
}
function birdieStatusText(c){if(c==='kingsbarns')return'Not part of qualifier';const hits=PLAYER_ORDER.filter(p=>grossBirdie(c,p));return hits.length?hits.map(playerLabel).join(', '):'None yet'}
function projectedPointsText(c){
  if(c==='kingsbarns')return'Qualifier only';
  const bonus=Object.fromEntries(PLAYER_ORDER.map(p=>[p,grossBirdie(c,p)?1:0]));
  const e=COURSE_DATA[c].event,m=Object.fromEntries(PLAYER_ORDER.map(p=>[p,bonus[p]]));let usable=true;
  if(e==='fourball'){const r=fourballResult();if(!r.diff)usable=false;else fourballTeams().forEach((t,i)=>t.forEach(p=>m[p]+=i===(r.diff>0?0:1)?5:2))}
  else if(e==='semis'){semis().forEach(match=>{const r=singlesMatch(c,...match);if(!r||!r.diff){usable=false;return}const w=r.diff>0?match[0]:match[1],l=w===match[0]?match[1]:match[0];m[w]+=5;m[l]+=2})}
  else if(e==='bumstead'){const r=bumsteadResult();if(!r.diff)usable=false;else bumsteadTeams().forEach((t,i)=>t.forEach(p=>m[p]+=i===(r.diff>0?0:1)?5:2))}
  else if(e==='wolf'){const rows=wolfRanks(),base=[5,3,2,1];rows.forEach((r,i)=>m[r.p]+=base[i])}
  else if(e==='finals'){const fm=finalMatches();if(!fm)usable=false;else{const a=singlesMatch(c,...fm.champ),b=singlesMatch(c,...fm.consolation);if(!a?.diff||!b?.diff)usable=false;else{const aw=a.diff>0?fm.champ[0]:fm.champ[1],al=aw===fm.champ[0]?fm.champ[1]:fm.champ[0],bw=b.diff>0?fm.consolation[0]:fm.consolation[1],bl=bw===fm.consolation[0]?fm.consolation[1]:fm.consolation[0];m[aw]+=5;m[al]+=3;m[bw]+=2;m[bl]+=1}}}
  else if(e==='finale'){stablefordRows(c).forEach((r,i)=>m[r.p]+=[7,4,2,1][i])}
  if(!usable)return'Current result is tied / unresolved';
  return PLAYER_ORDER.map(p=>`${playerLabel(p)} ${fmtPts(m[p])}`).join(' · ');
}
function renderRoundDashboard(c){
  const extra=COURSE_DATA[c].event==='finale'?`<div class="dash-row"><span>Skins carry</span><b>${skins().unresolved}</b></div>`:COURSE_DATA[c].event==='wolf'?`<div class="dash-row"><span>Wolf leader</span><b>${playerLabel(wolfRanks()[0].p)} · ${wolfRanks()[0].pts}</b></div>`:'';
  return`<div class="round-dashboard"><div class="dash-row"><span>Progress</span><b>${progress(c)}/18 holes</b></div><div class="dash-row"><span>Front nine</span><b>${frontNineText(c)}</b></div><div class="dash-row"><span>Gross-birdie bonus earned</span><b>${birdieStatusText(c)}</b></div><div class="dash-row"><span>Projected C-Bum if current result held</span><b>${projectedPointsText(c)}</b></div>${extra}</div>`;
}

function renderConnectionStrip(){
  if(typeof isScorer!=='function')return'';
  if(isScorer()){
    const txt=typeof liveStatus==='undefined'?'SCORER':liveStatus==='synced'?'LIVE · SYNCED':liveStatus==='syncing'?'LIVE · SYNCING':'OFFLINE · SAVED LOCALLY';
    return`<div class="connection-strip scorer">${txt}</div>`;
  }
  return`<div class="connection-strip spectator">LIVE VIEW${typeof liveAge==='function'?` · ${liveAge()}`:''}</div>`;
}
function playingHandicapPreview(c,p){
  const e=COURSE_DATA[c].event;
  if(e==='fourball')return fourballPlayingHandicap(p);
  if(e==='semis'||e==='finals')return null;
  return playingHandicap(c,p,eventAllowance(c));
}
function roundReadyMatchup(c){
  const e=COURSE_DATA[c].event;
  if(e==='fourball'){const t=fourballTeams();return`Team 1: ${t[0].map(playerLabel).join(' + ')}<br>Team 2: ${t[1].map(playerLabel).join(' + ')}`}
  if(e==='semis')return semis().map((m,i)=>`Semi ${i+1}: ${m.map(playerLabel).join(' vs ')}`).join('<br>');
  if(e==='bumstead'){const t=bumsteadTeams();return`Team 1: ${t[0].map(playerLabel).join(' + ')}<br>Team 2: ${t[1].map(playerLabel).join(' + ')}`}
  if(e==='wolf')return`Tee order: ${state.wolfOrder.map(playerLabel).join(' → ')}`;
  if(e==='finals'){const fm=finalMatches();return fm?`Championship: ${fm.champ.map(playerLabel).join(' vs ')}<br>Consolation: ${fm.consolation.map(playerLabel).join(' vs ')}`:'Finals populate after North Berwick.'}
  return'Individual competition';
}
function renderRoundReady(c){
  const x=COURSE_DATA[c],spectator=typeof isScorer==='function'&&!isScorer(),has=roundHasAnyData(c);
  return`<div class="row between" style="margin-bottom:9px"><button class="btn secondary small" data-back-rounds>‹ Rounds</button><span class="pill gold">${x.date} · ${x.time}</span></div>${renderConnectionStrip()}<div class="card round-ready"><div class="eyebrow">First tee check</div><h2>${x.name}</h2><div class="round-ready-format">${x.format}</div><p class="muted">${matchFormatInfo(c).detail}</p><div class="ready-matchup">${roundReadyMatchup(c)}</div><div class="ready-grid">${PLAYER_ORDER.map(p=>{const ph=playingHandicapPreview(c,p);return`<div class="ready-player"><b>${playerLabel(p)}</b><span>HI ${(+state.players[p].hi).toFixed(1)} · ${state.tees[c][p]}</span><strong>CH ${courseHandicap(c,p)??'?'}${ph==null?'':` · PH ${ph}`}</strong></div>`}).join('')}</div>${has?'<div class="notice" style="margin-top:10px">Gross scores already exist for this round. Starting again will snapshot the inputs shown above and recalculate the net competition from those inputs.</div>':''}${spectator?'<div class="notice note-green" style="margin-top:12px">Waiting for the scorer to confirm the first-tee setup and start this round.</div>':`<button class="btn start-round-btn" data-start-round="${c}">Lock setup & start round</button><div class="tiny" style="margin-top:8px">Starting freezes this round’s Handicap Indexes and tees. Future HI changes will not alter this round.</div>`}</div>`;
}
function renderHoleContext(c,h){
  const strokes=PLAYER_ORDER.map(p=>[p,displayStrokes(c,p,h)]).filter(x=>x[1]!==0);let rule='';const e=COURSE_DATA[c].event;
  if(e==='qualifier'||e==='finale')rule='Net par = 2 pts · net birdie = 3 pts';
  else if(e==='fourball')rule='Better net ball wins the hole';
  else if(e==='semis'||e==='finals')rule='Lower net score wins each singles match';
  else if(e==='bumstead')rule='3 pts: Low Ball · High Ball · Total';
  else if(e==='wolf'){const seq=state.wolfOrder.slice(h%4).concat(state.wolfOrder.slice(0,h%4));rule=`${playerLabel(seq[0])} is Wolf · ${playerLabel(seq[1])} tees next`}
  const pops=strokes.length?strokes.map(([p,s])=>`${playerLabel(p)} ${s===1?'POP':s+' POPS'}`).join(' · '):'All players scratch on this hole';
  return`<div class="hole-context"><b>${rule}</b><span>${pops}</span></div>`;
}
function singleHoleOutcome(c,a,b,h){const cha=courseHandicap(c,a),chb=courseHandicap(c,b),low=Math.min(cha,chb),ga=gross(c,a,h),gb=gross(c,b,h);if(ga==null||gb==null)return'';const na=ga-strokesFromPH(cha-low,holeSI(c,a,h)),nb=gb-strokesFromPH(chb-low,holeSI(c,b,h));return na===nb?`${playerLabel(a)}/${playerLabel(b)} halve`:na<nb?`${playerLabel(a)} wins`: `${playerLabel(b)} wins`}
function holeResultSummary(c,h){
  const e=COURSE_DATA[c].event;
  if(e==='qualifier')return PLAYER_ORDER.map(p=>`${playerLabel(p)} ${stableford(c,p,h)} pt${stableford(c,p,h)===1?'':'s'}`).join(' · ');
  if(e==='finale'){const sh=skins().holes[h];const skin=sh?.winner?` · ${playerLabel(sh.winner)} wins ${sh.units} skin${sh.units===1?'':'s'}`:sh?.carry?` · skins carry ${sh.carry}`:'';return PLAYER_ORDER.map(p=>`${playerLabel(p)} ${stableford(c,p,h)}`).join(' · ')+skin}
  if(e==='fourball'){const r=fourballHole(h);return r==='half'?'Better-ball hole halved':`Team ${r+1} wins the better-ball hole`}
  if(e==='semis')return semis().map(m=>singleHoleOutcome(c,...m,h)).join(' · ');
  if(e==='finals'){const fm=finalMatches();return fm?Object.values(fm).map(m=>singleHoleOutcome(c,...m,h)).join(' · '):''}
  if(e==='bumstead'){const r=bumsteadHole(h);if(!r)return'';const label=(name,pair)=>pair[0]===pair[1]?`${name} halved`:pair[0]<pair[1]?`Team 1 ${name}`:`Team 2 ${name}`;return`${label('Low',r.low)} · ${label('High',r.high)} · ${label('Total',r.total)} · Hole ${r.points[0]}-${r.points[1]}`}
  if(e==='wolf'){const pts=wolfPoints().byHole[h],earned=PLAYER_ORDER.filter(p=>pts[p]>0);return earned.length?earned.map(p=>`${playerLabel(p)} +${pts[p]}`).join(' · '):'Wolf hole tied · no points'}
  return'';
}
function showHoleResult(c,h){
  clearTimeout(holeResultTimer);state.ui.holeResult={c,h,text:holeResultSummary(c,h)};render();
  const delay=state.ui.autoAdvance&&h<17?1250:2400;
  holeResultTimer=setTimeout(()=>{if(state.ui.holeResult?.c!==c||state.ui.holeResult?.h!==h)return;state.ui.holeResult=null;if(state.ui.autoAdvance&&h<17&&state.ui.round===c&&state.ui.hole===h&&holeReady(c,h)){state.ui.hole=h+1;save();render();window.scrollTo({top:0,behavior:'smooth'})}else render()},delay);
}
function renderHoleResult(c,h){const x=state.ui.holeResult;return x&&x.c===c&&x.h===h?`<div class="hole-result"><span>Hole ${h+1}</span><b>${x.text}</b></div>`:''}

function renderPlayerScoreV3(c,p,h){const par=holePar(c,p,h),g=gross(c,p,h),st=displayStrokes(c,p,h),n=g==null?null:g-st,labels=[[-2,'-2'],[-1,'-1'],[0,'P'],[1,'+1'],[2,'+2'],[3,'+3'],[4,'+4']],event=COURSE_DATA[c].event,isMatch=event==='semis'||event==='finals',compact=state.ui.compact,next=nextMissingPlayer(c,h),done=g!=null;let pop=st>0?`${st===1?'POP':st+' POPS'}`:'SCRATCH';return`<div class="player-score ${compact?'compact':''} ${st>0?'has-pop':''} ${done?'entry-complete':''} ${next===p?'next-entry':''}"><div class="player-top"><div><div class="pname">${playerLabel(p)} <span class="popbadge ${st>1?'two':st===0?'scratch':''}">${pop}</span></div><div class="sub">${effectiveTeeName(c,p)} · ${yards(c,p,h)} yd · SI ${holeSI(c,p,h)} · CH ${courseHandicap(c,p)??'?'}</div></div>${compact?`<div class="gross-adjust"><button data-adjust="-1" data-score-c="${c}" data-score-p="${p}" data-score-h="${h}">−</button><div class="grossbox"><div class="bigmetric">${g??'–'}</div><div class="metriclabel">gross</div></div><button data-adjust="1" data-score-c="${c}" data-score-p="${p}" data-score-h="${h}">+</button></div>`:`<div style="text-align:right"><div class="bigmetric" style="font-size:25px">${g??'–'}</div><div class="metriclabel">gross</div></div>`}</div><div class="score-buttons">${labels.map(([d,l])=>{const v=par+d,cls=Math.abs(d)<=1?' score-common':'';return`<button class="score-chip${cls}${d===0?' score-par':''} ${g===v?'active':''}" data-score-c="${c}" data-score-p="${p}" data-score-h="${h}" data-score-v="${v}">${l}<small>${v}</small></button>`}).join('')}</div>${compact?'':`<div class="score-custom"><button class="btn ghost small" data-adjust="-1" data-score-c="${c}" data-score-p="${p}" data-score-h="${h}">−</button><button class="btn ghost small" data-clear-score data-score-c="${c}" data-score-p="${p}" data-score-h="${h}">Clear</button><button class="btn ghost small" data-adjust="1" data-score-c="${c}" data-score-p="${p}" data-score-h="${h}">+</button></div>`}<div class="netline"><span>${st?`${st} match/event stroke${Math.abs(st)===1?'':'s'}`:isMatch?'Plays scratch on hole':'No stroke'}</span><span>${n==null?'':`Net ${n}${event==='qualifier'||event==='finale'?` · ${stableford(c,p,h)} pts`:''}`}</span></div></div>`}
renderPlayerScore=renderPlayerScoreV3;

renderLive=function(c){
  const e=COURSE_DATA[c].event;let main=currentRoundStatusText(c),detail='';
  if(e==='qualifier')detail='Net Stableford qualifier';
  else if(e==='finale')detail='Net Stableford · finale points 7 / 4 / 2 / 1';
  else if(e==='fourball'){const t=fourballTeams();detail=`${t[0].map(playerLabel).join(' + ')} vs ${t[1].map(playerLabel).join(' + ')}`}
  else if(e==='semis')detail='Singles handicap semifinals';
  else if(e==='bumstead'){const t=bumsteadTeams();detail=`${t[0].map(playerLabel).join(' + ')} vs ${t[1].map(playerLabel).join(' + ')} · Low / High / Total`}
  else if(e==='wolf')detail='Wolf points';
  else if(e==='finals')detail='Championship + consolation';
  return`<button class="livebar" data-toggle-dashboard aria-expanded="${state.ui.liveExpanded?'true':'false'}"><div class="main">${main||'Round not started'}</div><div class="detail">${detail}<span class="dashboard-chevron">${state.ui.liveExpanded?'▲':'▼'} details</span></div></button>${state.ui.liveExpanded?renderRoundDashboard(c):''}`;
};

renderRounds=function(){const order=Object.keys(COURSE_DATA),today=todayCourse(),suggest=suggestedRound(),leader=cbumStandings()[0],todayC=today||null;const hero=todayC?`<div class="card today-hero"><div class="eyebrow">Today · Round ${order.indexOf(todayC)+1}</div><h2>${COURSE_DATA[todayC].name}</h2><div class="today-meta">${COURSE_DATA[todayC].time} · ${COURSE_DATA[todayC].format}</div><p>${matchFormatInfo(todayC).short}</p><div class="today-side"><span>C-Bum leader</span><b>${leader.pts?`${playerLabel(leader.p)} · ${fmtPts(leader.pts)} pts`:'Points begin at Elie'}</b></div><button class="btn" data-open-round="${todayC}">${roundLocked(todayC)?progress(todayC)?`Resume hole ${firstIncomplete(todayC)+1}`:'Open round':'First-tee check'}</button></div>`:`<div class="card"><div class="eyebrow">Scotland 2026</div><h2>Competition book, in your pocket</h2><p class="muted" style="margin-bottom:0">Enter gross scores only. The app handles tees, Course Handicaps, strokes, match state, the bracket and C-Bum points.</p></div>${suggest?`<div class="card continue-card"><div class="eyebrow">Continue scoring</div><h2>${COURSE_DATA[suggest].name}</h2><p class="muted">${COURSE_DATA[suggest].format} · ${progress(suggest)}/18 holes complete</p><button class="btn" data-open-round="${suggest}">Resume hole ${firstIncomplete(suggest)+1}</button></div>`:''}`;return`${renderConnectionStrip()}${hero}<div class="round-list">${order.map((c,i)=>{const x=COURSE_DATA[c],done=progress(c),lock=roundLocked(c);return`<div class="round ${done===18?'complete':''} ${today===c?'today':''}" data-open-round="${c}"><div class="date">ROUND ${ROUND_ROMAN[i]}<b>${x.date.split(' ')[1]}</b>${x.date.split(' ')[0]}</div><div><div class="rtitle">${x.name}</div><div class="rformat">${x.format} · ${x.time}</div><div class="round-format-short">${matchFormatInfo(c).short}</div>${lock?`<div class="round-lock-mini">🔒 setup locked${done?` · ${done}/18`:''}</div>`:''}</div><div class="status">${done===18?'✓ COMPLETE':done?`${done}/18`:lock?'READY':'SET UP'}<br><span class="muted">›</span></div></div>`}).join('')}</div>`};

renderRound=function(c){const x=COURSE_DATA[c],h=state.ui.hole||0;if(!roundLocked(c))return renderRoundReady(c);return`<div class="row between" style="margin-bottom:9px"><button class="btn secondary small" data-back-rounds>‹ Rounds</button><span class="pill gold">${x.date} · ${x.time}</span></div>${renderConnectionStrip()}<div class="round-lock-line">🔒 TEES & HANDICAPS LOCKED FOR THIS ROUND</div>${renderLive(c)}${renderFormatCard(c)}<div class="card"><div class="score-head"><button class="hole-nav" data-hole="${Math.max(0,h-1)}">‹</button><div class="hole-title"><div class="eyebrow">${x.name}</div><div class="num">Hole ${h+1}</div><div class="hole-meta"><span class="pill">${commonParText(c,h)}</span><span class="pill blue">${commonYardageText(c,h)}</span></div></div><button class="hole-nav" data-hole="${Math.min(17,h+1)}">›</button></div>${renderHoleContext(c,h)}${renderHoleResult(c,h)}<div class="hole-strip">${Array.from({length:18},(_,i)=>`<button class="hole-dot ${i===h?'current':''} ${holeReady(c,i)?'done':completedHole(c,i)?'partial':''}" data-hole="${i}">${i+1}</button>`).join('')}</div>${COURSE_DATA[c].event==='wolf'?renderWolfCall(h):''}${PLAYER_ORDER.map(p=>renderPlayerScore(c,p,h)).join('')}${renderUndoBar(c)}<div class="row between" style="margin-top:10px"><button class="btn secondary" data-hole="${Math.max(0,h-1)}">Previous</button><button class="btn" data-hole="${Math.min(17,h+1)}">${h===17?'Stay on 18':'Next hole'}</button></div></div>${renderCompletion(c)}${renderRoundDetail(c)}${renderFullCard(c)}`};

function renderRoundLocksSettings(){return`<div class="card"><div class="eyebrow">Competition integrity</div><h2>Round setup locks</h2><p class="muted">A round snapshots each player’s Handicap Index and tee when you tap <b>Start Round</b>. Changing a Handicap Index later affects only rounds that have not started.</p>${Object.keys(COURSE_DATA).map(c=>{const l=state.roundLocks[c];return`<div class="setup-lock-row"><div><b>${COURSE_DATA[c].name}</b><span>${l?`Locked · ${PLAYER_ORDER.map(p=>`${playerLabel(p)} ${(+l.his[p]).toFixed(1)}`).join(' · ')}`:'Not started · uses current future-round inputs'}</span></div>${l?`<button class="btn ghost small" data-unlock-round="${c}">Unlock setup</button>`:'<span class="pill">OPEN</span>'}</div>`}).join('')}<div class="tiny" style="margin-top:8px">Only unlock a completed/in-progress round if its tee or Handicap Index was entered incorrectly. Gross scores stay recorded, but net results will be recalculated when the round is re-locked.</div></div>`}
const uxBaseRenderSettings=renderSettings;
renderSettings=function(){let html=uxBaseRenderSettings();html=html.replace('<div class="eyebrow">Starting inputs</div><h2>Players</h2>','<div class="eyebrow">Future-round inputs</div><h2>Players</h2><p class="muted">These Handicap Indexes apply only to rounds that have not started. Locked rounds retain their original HIs.</p>');html=html.replace(/ Handicap Index<\/label>/g,' Future-round HI</label>');return renderRoundLocksSettings()+html};

function activeSpectatorRound(){const today=todayCourse();if(today)return today;const inProgress=Object.keys(COURSE_DATA).find(c=>progress(c)>0&&progress(c)<18);if(inProgress)return inProgress;const started=Object.keys(COURSE_DATA).filter(c=>roundLocked(c));return started[started.length-1]||null}
