/* v3.2.2 Rounds home competition summary */
const roundsSummaryBase=renderRounds;
renderRounds=function(){
  const html=roundsSummaryBase();
  const old='<div class="card"><div class="eyebrow">Scotland 2026</div><h2>Competition book, in your pocket</h2><p class="muted" style="margin-bottom:0">Enter gross scores only. The app handles tees, Course Handicaps, strokes, match state, the bracket and C-Bum points.</p></div>';
  const summary=`<div class="card"><div class="eyebrow">Competition scoring</div><div><h3 style="margin:4px 0 4px">C-Bum Cup points race</h3><div class="muted" style="font-size:12px;line-height:1.45">Points begin at Elie. Elie, North Berwick & Castle Stuart: <b>5 winner / 2 loser</b>. Brora & Royal Dornoch: <b>5 / 3 / 2 / 1</b>. Trump finale: <b>7 / 4 / 2 / 1</b>. Gross birdie: <b>+1 per golfer per round</b>.</div></div><div style="border-top:1px solid var(--line);margin-top:11px;padding-top:10px"><h3 style="margin:0 0 4px">Match Play Championship</h3><div class="muted" style="font-size:12px;line-height:1.45">Kingsbarns Stableford seeds <b>1–4</b>. North Berwick semifinals are <b>1 vs 4</b> and <b>2 vs 3</b>. Winners meet for the championship at Royal Dornoch; losers play the consolation match.</div></div></div>`;
  return html.replace(old,summary);
};
