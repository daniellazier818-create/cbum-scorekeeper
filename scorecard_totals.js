/* Scorecard review: front nine, back nine and total summaries */
function scorecardSegment(c,p,start,end){
  const vals=[];
  for(let h=start;h<end;h++){
    const g=gross(c,p,h);
    if(g!=null)vals.push({gross:g,net:g-displayStrokes(c,p,h)});
  }
  if(!vals.length)return null;
  return{
    gross:vals.reduce((s,x)=>s+x.gross,0),
    net:vals.reduce((s,x)=>s+x.net,0),
    count:vals.length,
    length:end-start
  };
}
function scorecardParSegment(c,start,end){
  const totals=PLAYER_ORDER.map(p=>{
    let total=0;
    for(let h=start;h<end;h++)total+=holePar(c,p,h);
    return total;
  });
  return [...new Set(totals)].join('/');
}
function scorecardSummaryCell(seg){
  if(!seg)return'<td class="num">–</td>';
  const partial=seg.count<seg.length?`<span class="tiny" style="display:block;font-weight:600;opacity:.65">${seg.count}/${seg.length} holes</span>`:'';
  return`<td class="num"><b>${seg.gross}</b><span class="tiny"> / ${seg.net}</span>${partial}</td>`;
}
function scorecardSummaryRow(c,label,start,end,extraStyle=''){
  return`<tr style="font-weight:900;background:rgba(213,189,122,.12);${extraStyle}"><td>${label}</td><td>${scorecardParSegment(c,start,end)}</td>${PLAYER_ORDER.map(p=>scorecardSummaryCell(scorecardSegment(c,p,start,end))).join('')}</tr>`;
}

renderFullCard=function(c){
  const rows=[];
  for(let h=0;h<18;h++){
    rows.push(`<tr><td><button class="btn ghost small" data-hole="${h}">${h+1}</button></td><td>${commonParText(c,h).replace('Par ','')}</td>${PLAYER_ORDER.map(p=>{const g=gross(c,p,h);return`<td class="num">${g==null?'–':`<b>${g}</b><span class="tiny"> / ${g-displayStrokes(c,p,h)}</span>`}</td>`}).join('')}</tr>`);
    if(h===8)rows.push(scorecardSummaryRow(c,'OUT',0,9,'border-top:2px solid rgba(181,149,82,.45);'));
    if(h===17){
      rows.push(scorecardSummaryRow(c,'IN',9,18,'border-top:2px solid rgba(181,149,82,.45);'));
      rows.push(scorecardSummaryRow(c,'TOTAL',0,18,'background:rgba(11,43,32,.08);border-top:2px solid rgba(11,43,32,.18);'));
    }
  }
  return`<details class="card"><summary style="font-weight:900;cursor:pointer">Full scorecard / review</summary><div class="scorecard-wrap" style="margin-top:10px"><table class="table scorecard-mini"><thead><tr><th>Hole</th><th>Par</th>${PLAYER_ORDER.map(p=>`<th style="text-align:right">${playerLabel(p)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div><div class="tiny" style="margin-top:8px">Each player cell shows gross / event net. OUT = holes 1–9, IN = holes 10–18. Partial nine totals show holes entered. Tap a hole number to edit it.</div></details>`;
};
