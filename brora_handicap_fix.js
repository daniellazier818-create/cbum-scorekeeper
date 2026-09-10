/* Brora handicap correction + Wolf pop allocation.
   Red ladies: CR 70.3 / Slope 120 / Par 71.
   Wolf: lowest Course Handicap plays scratch; everyone else receives
   75% of the Course Handicap difference, rounded to a Playing Handicap,
   with a maximum of one stroke received on any hole. */
if(COURSE_DATA?.brora?.tees?.Red?.women){
  COURSE_DATA.brora.tees.Red.women[2]=71;
}

function wolfPlayingHandicap(p){
  const chs=PLAYER_ORDER.map(x=>courseHandicap('brora',x));
  if(chs.some(x=>x==null))return null;
  const low=Math.min(...chs),ch=courseHandicap('brora',p);
  return Math.max(0,Math.round((ch-low)*.75));
}

const regularStrokesBeforeBroraWolfFix=regularStrokes;
regularStrokes=function(c,p,h){
  if(c==='brora')return strokesFromPH(wolfPlayingHandicap(p),holeSI(c,p,h),true);
  return regularStrokesBeforeBroraWolfFix(c,p,h);
};

const matchFormatInfoBeforeBroraWolfFix=matchFormatInfo;
matchFormatInfo=function(c){
  const x=matchFormatInfoBeforeBroraWolfFix(c);
  if(c!=='brora')return x;
  return{
    short:'Wolf · 75% of CH difference off low · max 1 stroke per hole',
    detail:'Wolf rotates in the fixed tee order. The lowest Course Handicap plays scratch; each other player receives 75% of the difference between their Course Handicap and the low Course Handicap, rounded to a Playing Handicap, with a maximum of one stroke on any hole. The Wolf tees first and may choose a partner after seeing a tee shot but before the next player hits, or go Lone Wolf / Blind Lone Wolf. Partner win = +1 each winner; Lone Wolf win = +3 Wolf; Blind Lone Wolf win = +4 Wolf; a Lone/Blind loss gives each opponent +1. C-Bum finish points: 5 / 3 / 2 / 1.'
  };
};

const renderPlayerScoreBeforeBroraWolfFix=renderPlayerScore;
renderPlayerScore=function(c,p,h){
  let html=renderPlayerScoreBeforeBroraWolfFix(c,p,h);
  if(c!=='brora')return html;
  const ch=courseHandicap(c,p),oldPh=playingHandicap(c,p,.75),ph=wolfPlayingHandicap(p);
  html=html.replace(` · CH ${ch??'?'} · PH ${oldPh??'?'} (75%)</div>`,` · CH ${ch??'?'} · Wolf PH ${ph??'?'} (75% off low)</div>`);
  return html;
};
