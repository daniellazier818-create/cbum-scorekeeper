/* v3.6 first-tee tee details */
renderUndoBar=function(c){if(!undoAction||undoAction.c!==c)return'';return`<button class="undo-bar" data-undo><span>↶ Undo</span><b>${undoLabel()}</b></button>`};
function firstHoleStrokeLabel(c,p){const s=displayStrokes(c,p,0);return s===0?'H1 scratch':s===1?'H1 POP':`H1 ${s} POPS`}
function teeSetupMeta(c,p,t=state.tees[c][p]){
  const tee=COURSE_DATA[c]?.tees?.[t],gender=state.players[p].gender,r=tee?.[gender];
  if(!tee||!r)return null;
  const yards=(tee.yards||[]).reduce((a,b)=>a+(+b||0),0);
  return{yards,rating:r[0],slope:r[1],par:r[2]};
}
function teeSetupLabel(c,p,t){
  const m=teeSetupMeta(c,p,t);if(!m)return t;
  return`${t} · ${m.yards.toLocaleString()} yd · R ${m.rating} · S ${m.slope}`;
}
function teeSetupDetail(c,p,t=state.tees[c][p]){
  const m=teeSetupMeta(c,p,t);if(!m)return'Rating / slope unavailable';
  return`${m.yards.toLocaleString()} yd · Rating ${m.rating} · Slope ${m.slope}`;
}
renderRoundReady=function(c){
  const x=COURSE_DATA[c],spectator=typeof isScorer==='function'&&!isScorer(),has=roundHasAnyData(c);
  return`<div class="row between" style="margin-bottom:9px"><button class="btn secondary small" data-back-rounds>‹ Rounds</button><span class="pill gold">${x.date} · ${x.time}</span></div>${renderConnectionStrip()}<div class="card round-ready"><div class="eyebrow">First tee check</div><h2>${x.name}</h2><div class="round-ready-format">${x.format}</div><p class="muted">${matchFormatInfo(c).detail}</p><div class="ready-matchup">${roundReadyMatchup(c)}</div><div class="ready-grid">${PLAYER_ORDER.map(p=>{const ph=playingHandicapPreview(c,p),g=state.players[p].gender;return`<div class="ready-player"><b>${playerLabel(p)}</b><div class="ready-fields"><label>HI<input class="field ready-input" type="number" step="0.1" min="0" max="54" value="${state.players[p].hi}" data-hi="${p}"></label><label>Tee<select class="field ready-input ready-tee-select" data-tee-c="${c}" data-tee-p="${p}">${Object.keys(COURSE_DATA[c].tees).filter(t=>!!COURSE_DATA[c].tees[t][g]).map(t=>`<option value="${t}" ${state.tees[c][p]===t?'selected':''}>${teeSetupLabel(c,p,t)}</option>`).join('')}</select></label></div><div class="ready-tee-meta">${state.tees[c][p]} · ${teeSetupDetail(c,p)}</div><strong>CH ${courseHandicap(c,p)??'?'}${ph==null?'':` · PH ${ph}`} · ${firstHoleStrokeLabel(c,p)}</strong></div>`}).join('')}</div>${has?'<div class="notice" style="margin-top:10px">Gross scores already exist for this round. Starting again will snapshot the inputs shown above and recalculate the net competition from those inputs.</div>':''}${spectator?'<div class="notice note-green" style="margin-top:12px">Waiting for the scorer to confirm the first-tee setup and start this round.</div>':`<button class="btn start-round-btn" data-start-round="${c}">Lock setup & start round</button><div class="tiny" style="margin-top:8px">Starting freezes this round’s Handicap Indexes and tees. Future HI changes will not alter this round.</div>`}</div>`;
};
