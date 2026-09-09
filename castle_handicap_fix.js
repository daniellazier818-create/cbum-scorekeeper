/* Castle Stuart Bumstead handicap correction: low unrounded CH plays scratch; others receive 90% of the difference. */
function bumsteadPlayingHandicap(p){
  const vals=PLAYER_ORDER.map(x=>unroundedCourseHandicap('castlestuart',x));
  if(vals.some(x=>x==null))return null;
  const low=Math.min(...vals),x=unroundedCourseHandicap('castlestuart',p);
  return Math.round((x-low)*.9);
}

const regularStrokesBeforeCastleFix=regularStrokes;
regularStrokes=function(c,p,h){
  if(c==='castlestuart')return strokesFromPH(bumsteadPlayingHandicap(p),holeSI(c,p,h));
  return regularStrokesBeforeCastleFix(c,p,h);
};

if(typeof playingHandicapPreview==='function'){
  const playingHandicapPreviewBeforeCastleFix=playingHandicapPreview;
  playingHandicapPreview=function(c,p){
    if(c==='castlestuart')return bumsteadPlayingHandicap(p);
    return playingHandicapPreviewBeforeCastleFix(c,p);
  };
}

if(typeof matchFormatInfo==='function'){
  const matchFormatInfoBeforeCastleFix=matchFormatInfo;
  matchFormatInfo=function(c){
    const x=matchFormatInfoBeforeCastleFix(c);
    if(c!=='castlestuart')return x;
    return{...x,
      short:'2v2 Bumstead · 90% of CH difference from low player · Low + High + Total',
      detail:'Teams are 1st + 4th vs 2nd + 3rd in the C-Bum standings entering Castle Stuart. The lowest unrounded Course Handicap plays scratch; each other player receives 90% of the difference from that low player, rounded to a Playing Handicap. Every hole has three team points: Low Ball, High Ball and Total; ties split 0.5 / 0.5. C-Bum: winning team gets 5 each, losing team 2 each.'
    };
  };
}
