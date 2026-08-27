/* v3.3 dynamic Rounds competition summary */
const roundsSummaryBase=renderRounds;
const HOME_CBUM_EVENTS=['elie','northberwick','castlestuart','brora','royaldornoch','trump'];
const HOME_ROUND_ORDER=['kingsbarns','elie','northberwick','castlestuart','brora','royaldornoch','trump'];

function homeRulesSummary(){
  return`<div class="card home-comp-card"><div class="eyebrow">Competition scoring</div><div class="home-comp-section"><h3>C-Bum Cup points race</h3><div class="muted">Points begin at Elie. Elie, North Berwick & Castle Stuart: <b>5 winner / 2 loser</b>. Brora & Royal Dornoch: <b>5 / 3 / 2 / 1</b>. Trump finale: <b>7 / 4 / 2 / 1</b>. Gross birdie: <b>+1 per golfer per round</b>.</div></div><div class="home-comp-section divided"><h3>Match Play Championship</h3><div class="muted">Kingsbarns Stableford seeds <b>1–4</b>. North Berwick semifinals are <b>1 vs 4</b> and <b>2 vs 3</b>. Winners meet for the championship at Royal Dornoch; losers play the consolation match.</div></div></div>`;
}
function homeCupStandings(){
  const completed=HOME_CBUM_EVENTS.filter(c=>roundComplete(c));
  const rows=cbumStandings(completed);
  const active=HOME_CBUM_EVENTS.find(c=>progress(c)>0&&!roundComplete(c));
  const final=roundComplete('trump');
  let note=completed.length?`Official through ${COURSE_DATA[completed[completed.length-1]].name}`:'Points begin at Elie';
  if(final)note='Final standings';
  const live=active?`<div class="home-live-line"><b>LIVE · ${COURSE_DATA[active].name}</b><span>${scoreSummary(active)||`${progress(active)}/18 holes complete`}</span></div>`:'';
  return`<div class="home-comp-section"><div class="home-section-head"><div><h3>${final?'Final C-Bum Cup':'C-Bum Cup points race'}</h3><span>${note}</span></div>${final?'<span class="home-state-pill">FINAL</span>':''}</div><div class="home-cup-grid">${rows.map((r,i)=>`<div class="home-cup-player ${i===0&&completed.length?'leader':''}"><small>${i+1}</small><span>${playerLabel(r.p)}</span><b>${fmtPts(r.pts)}</b><em>pts</em></div>`).join('')}</div>${live}</div>`;
}
function homeSeedGrid(rows,label){
  return`<div class="home-seed-label">${label}</div><div class="home-seed-grid">${rows.map((r,i)=>`<div><small>${i+1}</small><span>${playerLabel(r.p)}</span><b>${fmtPts(r.pts)} pts</b></div>`).join('')}</div>`;
}
function homeMatchLine(label,m,c){
  if(!m)return'';
  const r=fullSinglesResult(c,m[0],m[1]);
  return`<div class="home-match-line"><span><small>${label}</small>${playerLabel(m[0])} vs ${playerLabel(m[1])}</span><b>${r?r.display:'Not started'}</b></div>`;
}
function homeBracketSummary(){
  const kbProg=progress('kingsbarns'),kbDone=roundComplete('kingsbarns');
  if(!kbProg&&!kbDone)return`<div class="home-comp-section divided"><h3>Match Play Championship</h3><div class="muted">Kingsbarns will seed the bracket 1–4. North Berwick is 1 vs 4 and 2 vs 3, with championship and consolation matches at Royal Dornoch.</div></div>`;
  if(!kbDone){
    const rows=seedResults();
    return`<div class="home-comp-section divided"><div class="home-section-head"><div><h3>Match Play Championship</h3><span>Kingsbarns · ${kbProg}/18 holes complete</span></div><span class="home-state-pill live">LIVE</span></div>${homeSeedGrid(rows,'Projected seeds')}</div>`;
  }
  const seeds=seedOrder(),seedRows=seeds.map(p=>seedResults().find(r=>r.p===p)||{p,pts:0});
  const nbProg=progress('northberwick'),nbDone=roundComplete('northberwick');
  if(!nbProg&&!nbDone){
    const s=semis();
    return`<div class="home-comp-section divided"><div class="home-section-head"><div><h3>Match Play Championship</h3><span>${state.locks.seeds?'Locked':'Final'} Kingsbarns seeds</span></div></div>${homeSeedGrid(seedRows,'Seeds')}<div class="home-match-stack">${homeMatchLine('Semifinal 1',s[0],'northberwick')}${homeMatchLine('Semifinal 2',s[1],'northberwick')}</div></div>`;
  }
  if(!nbDone){
    const s=semis();
    return`<div class="home-comp-section divided"><div class="home-section-head"><div><h3>North Berwick semifinals</h3><span>${nbProg}/18 holes complete</span></div><span class="home-state-pill live">LIVE</span></div><div class="home-match-stack">${homeMatchLine('Semifinal 1',s[0],'northberwick')}${homeMatchLine('Semifinal 2',s[1],'northberwick')}</div></div>`;
  }
  const fm=finalMatches();
  if(!fm)return`<div class="home-comp-section divided"><h3>Royal Dornoch finals</h3><div class="muted">North Berwick is complete, but a semifinal tie-break still needs to be resolved before the finals can populate.</div></div>`;
  const rdProg=progress('royaldornoch'),rdDone=roundComplete('royaldornoch');
  if(!rdProg&&!rdDone)return`<div class="home-comp-section divided"><div class="home-section-head"><div><h3>Royal Dornoch finals</h3><span>Bracket set</span></div></div><div class="home-match-stack">${homeMatchLine('Championship',fm.champ,'royaldornoch')}${homeMatchLine('Consolation',fm.consolation,'royaldornoch')}</div></div>`;
  if(!rdDone)return`<div class="home-comp-section divided"><div class="home-section-head"><div><h3>Royal Dornoch finals</h3><span>${rdProg}/18 holes complete</span></div><span class="home-state-pill live">LIVE</span></div><div class="home-match-stack">${homeMatchLine('Championship',fm.champ,'royaldornoch')}${homeMatchLine('Consolation',fm.consolation,'royaldornoch')}</div></div>`;
  const champ=fullSinglesResult('royaldornoch',...fm.champ),cons=fullSinglesResult('royaldornoch',...fm.consolation);
  return`<div class="home-comp-section divided"><div class="home-section-head"><div><h3>Match Play Championship</h3><span>Royal Dornoch · final</span></div><span class="home-state-pill">FINAL</span></div><div class="home-champ-grid"><div><small>Champion</small><b>${champ?.winner?playerLabel(champ.winner):'Pending'}</b><span>${champ?.display||''}</span></div><div><small>Consolation winner</small><b>${cons?.winner?playerLabel(cons.winner):'Pending'}</b><span>${cons?.display||''}</span></div></div></div>`;
}
function homeDynamicSummary(){
  if(progress('kingsbarns')===0&&!roundComplete('kingsbarns'))return homeRulesSummary();
  return`<div class="card home-comp-card"><div class="eyebrow">Trip competition</div>${homeCupStandings()}${homeBracketSummary()}</div>`;
}
renderRounds=function(){
  const html=roundsSummaryBase();
  const old='<div class="card"><div class="eyebrow">Scotland 2026</div><h2>Competition book, in your pocket</h2><p class="muted" style="margin-bottom:0">Enter gross scores only. The app handles tees, Course Handicaps, strokes, match state, the bracket and C-Bum points.</p></div>';
  const connection=typeof renderConnectionStrip==='function'?renderConnectionStrip():'';
  let body=html.startsWith(connection)?html.slice(connection.length):html;
  body=body.replace(old,'');
  return connection+homeDynamicSummary()+body;
};
