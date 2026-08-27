/* v3.1 detailed live scoring */
function livePts(x){return Number.isInteger(x)?String(x):Number(x).toFixed(1)}
function liveTotalGrid(rows,label='pts'){
  return`<div class="live-total-grid">${rows.map((r,i)=>`<div class="live-total ${i===0?'leader':''}"><span>${playerLabel(r.p)}</span><b>${livePts(r.pts)}</b><small>${label}</small></div>`).join('')}</div>`;
}
function compactRunningStatus(diff,a,b){if(!diff)return'AS';return`${playerLabel(diff>0?a:b)} ${Math.abs(diff)} UP`}
function matchRunningData(c,a,b){
  const cha=courseHandicap(c,a),chb=courseHandicap(c,b),low=Math.min(cha,chb);let diff=0,played=0,rows=[];
  for(let h=0;h<18;h++){
    const ga=gross(c,a,h),gb=gross(c,b,h);if(ga==null||gb==null)continue;
    const sa=strokesFromPH(cha-low,holeSI(c,a,h)),sb=strokesFromPH(chb-low,holeSI(c,b,h));
    const na=ga-sa,nb=gb-sb;let hole='½';if(na<nb){diff++;hole=playerLabel(a)}else if(nb<na){diff--;hole=playerLabel(b)}played++;
    rows.push({h,ga,gb,na,nb,hole,diff,status:compactRunningStatus(diff,a,b)});
  }
  return{a,b,cha,chb,diff,played,rows};
}
function matchStatusLong(c,a,b){
  const d=matchRunningData(c,a,b);if(!d.played)return'All square · not started';
  const full=fullSinglesResult(c,a,b);if(d.played===18&&full?.winner){if(full.display==='Countback')return`${playerLabel(full.winner)} wins on countback`;if(full.display==='Coin flip')return`${playerLabel(full.winner)} wins coin flip`;}
  if(d.diff===0)return`All square thru ${d.played}`;
  const lead=Math.abs(d.diff),rem=18-d.played,leader=playerLabel(d.diff>0?a:b);return lead>rem?`${leader} wins ${lead}&${rem}`:`${leader} ${lead} up thru ${d.played}`;
}
function renderSinglesCollapsed(c,m,label){return`<div class="live-match-line"><span>${label}: ${m.map(playerLabel).join(' vs ')}</span><b>${matchStatusLong(c,m[0],m[1])}</b></div>`}
function renderSinglesLedger(c,m,label){
  const d=matchRunningData(c,m[0],m[1]);
  return`<div class="live-detail-section"><div class="live-detail-title"><span>${label}</span><b>${matchStatusLong(c,m[0],m[1])}</b></div>${d.rows.length?`<div class="live-table-wrap"><table class="live-detail-table"><thead><tr><th>H</th><th>${playerLabel(m[0])}<small>net</small></th><th>${playerLabel(m[1])}<small>net</small></th><th>Hole</th><th>Match</th></tr></thead><tbody>${d.rows.map(r=>`<tr><td>${r.h+1}</td><td>${r.na}</td><td>${r.nb}</td><td>${r.hole}</td><td>${r.status}</td></tr>`).join('')}</tbody></table></div>`:'<div class="live-empty">No holes completed yet.</div>'}</div>`;
}
function renderStablefordLedger(c){
  const rows=stablefordRows(c),holes=Array.from({length:18},(_,h)=>h).filter(h=>PLAYER_ORDER.some(p=>gross(c,p,h)!=null));
  return`<div class="live-detail-section"><div class="live-detail-title"><span>Running Stableford</span><b>${progress(c)}/18 complete</b></div><div class="live-table-wrap"><table class="live-detail-table points-table"><thead><tr><th>H</th>${PLAYER_ORDER.map(p=>`<th>${playerLabel(p)}</th>`).join('')}${c==='trump'?'<th>Skin</th>':''}</tr></thead><tbody>${holes.length?holes.map(h=>{let skin='';if(c==='trump'&&completedHole(c,h)){const sh=skins().holes[h];skin=sh?.winner?`${playerLabel(sh.winner)} +${sh.units}`:sh?.carry?`Carry ${sh.carry}`:'-'}return`<tr><td>${h+1}</td>${PLAYER_ORDER.map(p=>`<td>${gross(c,p,h)==null?'–':stableford(c,p,h)}</td>`).join('')}${c==='trump'?`<td>${skin||'–'}</td>`:''}</tr>`}).join(''):`<tr><td colspan="${c==='trump'?6:5}">No scores yet</td></tr>`}</tbody><tfoot><tr><th>Total</th>${PLAYER_ORDER.map(p=>{const r=rows.find(x=>x.p===p);return`<th>${livePts(r?.pts||0)}</th>`}).join('')}${c==='trump'?`<th>${Object.values(skins().total).reduce((a,b)=>a+b,0)}</th>`:''}</tr></tfoot></table></div></div>`;
}
function wolfCallShort(h){const call=state.wolfCalls[h],wolf=wolfForHole(h);if(!call)return playerLabel(wolf);if(call.type==='partner')return`${playerLabel(wolf)} + ${playerLabel(call.partner)}`;if(call.type==='blind')return`${playerLabel(wolf)} BLW`;return`${playerLabel(wolf)} LW`}
function renderWolfLedger(){
  const wp=wolfPoints(),holes=Array.from({length:18},(_,h)=>h).filter(h=>completedHole('brora',h)&&state.wolfCalls[h]);
  return`<div class="live-detail-section"><div class="live-detail-title"><span>Wolf points by hole</span><b>${holes.length}/18 complete</b></div><div class="live-table-wrap"><table class="live-detail-table points-table wolf-table"><thead><tr><th>H</th><th>Call</th>${PLAYER_ORDER.map(p=>`<th>${playerLabel(p)}</th>`).join('')}</tr></thead><tbody>${holes.length?holes.map(h=>`<tr><td>${h+1}</td><td>${wolfCallShort(h)}</td>${PLAYER_ORDER.map(p=>`<td>${wp.byHole[h][p]||0}</td>`).join('')}</tr>`).join(''):'<tr><td colspan="6">No completed Wolf holes yet</td></tr>'}</tbody><tfoot><tr><th colspan="2">Total</th>${PLAYER_ORDER.map(p=>`<th>${livePts(wp.totals[p])}</th>`).join('')}</tr></tfoot></table></div></div>`;
}
function fourballRunningRows(){
  const teams=fourballTeams();let diff=0,played=0,rows=[];
  for(let h=0;h<18;h++){
    if(!completedHole('elie',h))continue;
    const nets=teams.map(t=>Math.min(...t.map(p=>gross('elie',p,h)-regularStrokes('elie',p,h))));let result='½';if(nets[0]<nets[1]){diff++;result='T1'}else if(nets[1]<nets[0]){diff--;result='T2'}played++;rows.push({h,nets,result,diff,status:diff===0?'AS':`T${diff>0?1:2} ${Math.abs(diff)} UP`});
  }
  return{teams,diff,played,rows};
}
function renderFourballLedger(){const d=fourballRunningRows();return`<div class="live-detail-section"><div class="live-detail-title"><span>Four-Ball hole ledger</span><b>${resolveFourball().display}</b></div><div class="team-key"><span>T1 · ${d.teams[0].map(playerLabel).join(' + ')}</span><span>T2 · ${d.teams[1].map(playerLabel).join(' + ')}</span></div><div class="live-table-wrap"><table class="live-detail-table"><thead><tr><th>H</th><th>T1 best net</th><th>T2 best net</th><th>Hole</th><th>Match</th></tr></thead><tbody>${d.rows.length?d.rows.map(r=>`<tr><td>${r.h+1}</td><td>${r.nets[0]}</td><td>${r.nets[1]}</td><td>${r.result}</td><td>${r.status}</td></tr>`).join(''):'<tr><td colspan="5">No holes completed yet</td></tr>'}</tbody></table></div></div>`}
function pointWinner(pair){return pair[0]===pair[1]?'½':pair[0]<pair[1]?'T1':'T2'}
function renderBumsteadLedger(){
  const teams=bumsteadTeams();let running=[0,0],rows=[];for(let h=0;h<18;h++){const r=bumsteadHole(h);if(!r)continue;running[0]+=r.points[0];running[1]+=r.points[1];rows.push({h,r,run:[...running]})}
  const total=bumsteadResult();return`<div class="live-detail-section"><div class="live-detail-title"><span>Bumstead points by hole</span><b>T1 ${livePts(total.p[0])} · T2 ${livePts(total.p[1])}</b></div><div class="team-key"><span>T1 · ${teams[0].map(playerLabel).join(' + ')}</span><span>T2 · ${teams[1].map(playerLabel).join(' + ')}</span></div><div class="live-table-wrap"><table class="live-detail-table"><thead><tr><th>H</th><th>Low</th><th>High</th><th>Total</th><th>Hole pts</th><th>Running</th></tr></thead><tbody>${rows.length?rows.map(x=>`<tr><td>${x.h+1}</td><td>${pointWinner(x.r.low)}</td><td>${pointWinner(x.r.high)}</td><td>${pointWinner(x.r.total)}</td><td>${livePts(x.r.points[0])}-${livePts(x.r.points[1])}</td><td>${livePts(x.run[0])}-${livePts(x.run[1])}</td></tr>`).join(''):'<tr><td colspan="6">No holes completed yet</td></tr>'}</tbody></table></div></div>`;
}
function renderLiveLedger(c){
  const e=COURSE_DATA[c].event;if(e==='qualifier'||e==='finale')return renderStablefordLedger(c);if(e==='wolf')return renderWolfLedger();if(e==='fourball')return renderFourballLedger();if(e==='bumstead')return renderBumsteadLedger();if(e==='semis')return semis().map((m,i)=>renderSinglesLedger(c,m,`Semifinal ${i+1}`)).join('');if(e==='finals'){const fm=finalMatches();return fm?renderSinglesLedger(c,fm.champ,'Championship')+renderSinglesLedger(c,fm.consolation,'Consolation'):'<div class="live-empty">Finals await North Berwick.</div>'}return'';
}
renderRoundDashboard=function(c){
  const extra=COURSE_DATA[c].event==='finale'?`<div class="dash-row"><span>Skins carry</span><b>${skins().unresolved}</b></div>`:COURSE_DATA[c].event==='wolf'?`<div class="dash-row"><span>Wolf leader</span><b>${playerLabel(wolfRanks()[0].p)} · ${wolfRanks()[0].pts}</b></div>`:'';
  return`<div class="round-dashboard"><div class="dash-meta"><div class="dash-row"><span>Progress</span><b>${progress(c)}/18 holes</b></div><div class="dash-row"><span>Front nine</span><b>${frontNineText(c)}</b></div><div class="dash-row"><span>Gross-birdie bonus earned</span><b>${birdieStatusText(c)}</b></div><div class="dash-row"><span>Projected C-Bum if current result held</span><b>${projectedPointsText(c)}</b></div>${extra}</div>${renderLiveLedger(c)}</div>`;
};
renderLive=function(c){
  const e=COURSE_DATA[c].event;let main='',detail='';
  if(e==='qualifier'||e==='finale'){const rows=stablefordRows(c);main=liveTotalGrid(rows,'pts');detail=e==='qualifier'?'Net Stableford qualifier':'Net Stableford · finale points 7 / 4 / 2 / 1';}
  else if(e==='wolf'){main=liveTotalGrid(wolfRanks(),'Wolf pts');detail='Wolf · running totals';}
  else if(e==='semis'){main=`<div class="live-match-stack">${semis().map((m,i)=>renderSinglesCollapsed(c,m,`Semi ${i+1}`)).join('')}</div>`;detail='Singles handicap semifinals';}
  else if(e==='finals'){const fm=finalMatches();main=fm?`<div class="live-match-stack">${renderSinglesCollapsed(c,fm.champ,'Championship')}${renderSinglesCollapsed(c,fm.consolation,'Consolation')}</div>`:'Finals await North Berwick';detail='Championship + consolation';}
  else if(e==='fourball'){const t=fourballTeams();main=`<div class="live-match-stack"><div class="live-match-line"><span>${t[0].map(playerLabel).join(' + ')}</span><b>${resolveFourball().display}</b><span>${t[1].map(playerLabel).join(' + ')}</span></div></div>`;detail='Four-Ball match';}
  else if(e==='bumstead'){const t=bumsteadTeams(),r=bumsteadResult();main=`<div class="live-match-stack"><div class="live-match-line"><span>T1 · ${t[0].map(playerLabel).join(' + ')}</span><b>${livePts(r.p[0])} - ${livePts(r.p[1])}</b><span>T2 · ${t[1].map(playerLabel).join(' + ')}</span></div></div>`;detail='Bumstead · Low / High / Total';}
  return`<button class="livebar livebar-v31" data-toggle-dashboard aria-expanded="${state.ui.liveExpanded?'true':'false'}"><div class="main">${main||'Round not started'}</div><div class="detail">${detail}<span class="dashboard-chevron">${state.ui.liveExpanded?'▲':'▼'} hole-by-hole</span></div></button>${state.ui.liveExpanded?renderRoundDashboard(c):''}`;
};
